import { diffTrimmedLines, Change } from 'diff';
import { pipe } from 'fp-ts/lib/function.js';
import { Option, some, none, fold } from 'fp-ts/lib/Option.js'
import { Either, right, left, map, chain } from 'fp-ts/lib/Either.js'
// import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray.js';
// import { normalize } from 'path';

interface DiffResult {
  readonly code?: string;
  readonly error?: string;
}

interface DiffBlock {
  readonly oldLines: readonly string[];
  readonly newLines: readonly string[];
  readonly searchBlock: string;
  readonly lineNumber?: number;
}

type CodePosition = number;
type CodeDelta = number;

// Type for a block of changes at a specific position
type ChangeBlock = {
  position: CodePosition;
  changes: readonly Change[];
};

const normalizeLines = (lines: readonly string[]): readonly string[] =>
  lines.map(line => line.trim());

const joinLines = (lines: readonly string[]): string =>
  lines.join('\n');

const normalizeCode = (code: string): string =>
  code.replace(/\r\n/g, '\n');

const findBlockPosition = (
  normalizedCode :readonly string[],
  searchBlock    :string,
  blockLength    :number
): Option<CodePosition> => {

  const index = normalizedCode.findIndex(
    (line, index) => {
      const currentBlock = normalizedCode
        .slice(index, index + blockLength)
        .map(l => l.trim())
        .join('\n');
      return currentBlock === searchBlock;
    }
  );

  return index === -1 ? none : some(index);
};

const parseDiffLines = (lines: string[]): {
  readonly oldLines: readonly string[],
  readonly newLines: readonly string[]
} => {

  // First pass: collect context lines and find addition
  const contextLines: string[] = [];
  const addedLines: string[] = [];
  const notRemovedLines: string[] = [];
  let additionPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('+')) {
      addedLines.push(" " + line.slice(1));
      additionPosition = notRemovedLines.length;
    } 
    else if(line.startsWith('-')) {
      //additionPosition--;
      contextLines.push(" " + line.slice(1)); // removed lines also creates context
    }
    else { //if(line.trim() !== '') {
      notRemovedLines.push(line);
      contextLines.push(line);
    }
  }

  // Create the final structure
  const oldLines = contextLines; // with removed lines
  const newLines = [
    ...notRemovedLines.slice(0, additionPosition),
    ...addedLines,
    ...notRemovedLines.slice(additionPosition)
  ];

  const finalStructure = {
    oldLines,
    newLines,
    //insertPosition: additionPosition
  };

  //console.log('Final structure:', finalStructure);
  return finalStructure;
};

const extractDiffBlocks = (fragments: string): readonly DiffBlock[] => {

  const regex = /```diff\n([\s\S]*?)[\n]*```/g;
  const blocks: DiffBlock[] = [];
  let match;

  while ((match = regex.exec(fragments)) !== null) {
    const lines = match[1].split('\n');
    let currentBlock: string[] = [];
    let currentLineNumber: number | undefined;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for @@ line indicator
      const lineMatch = line.match(/@@ -(\d+),\d+ \+\d+,\d+ @@/);
      if (lineMatch) {
        // If we have accumulated lines, create a block
        if (currentBlock.length > 0) {
          const { oldLines, newLines } = parseDiffLines(currentBlock);
          const searchBlock = pipe(oldLines, normalizeLines, joinLines);
          blocks.push({ oldLines, newLines, searchBlock, lineNumber: currentLineNumber });
          currentBlock = [];
        }
        // Set the line number for the next block
        currentLineNumber = parseInt(lineMatch[1], 10) + 1; // ommit extra line with prefix @@ ?
        continue;
      }

      // Skip other diff metadata lines
      if (line.startsWith('--- ') || line.startsWith('+++ ')) {
        continue;
      }

      currentBlock.push(line);
    }

    // Add the last block if there are remaining lines
    if (currentBlock.length > 0) {
      const { oldLines, newLines } = parseDiffLines(currentBlock);
      const searchBlock = pipe(oldLines, normalizeLines, joinLines);
      blocks.push({ oldLines, newLines, searchBlock, lineNumber: currentLineNumber });
    }
  }

  return blocks;
};

const processDiffBlock = (
  diffBlock         :DiffBlock,
  originalCodeLines :readonly string[],
  codeIndexDelta    :CodeDelta
): Either<Error, ChangeBlock> => {

  // If we have a line number from @@ indicator, use it directly
  if (diffBlock.lineNumber !== undefined) {
    const position = diffBlock.lineNumber + codeIndexDelta;
    return right({
      position,
      changes: diffTrimmedLines(
        diffBlock.oldLines.join('\n'),
        diffBlock.newLines.join('\n')
      )
    });
  }

  // Otherwise fall back to searching for the block position
  const normalizedOriginalCode = originalCodeLines.map(normalizeCode);
  const normalizedSearchBlock = normalizeCode(diffBlock.searchBlock);

  return pipe(
    findBlockPosition(
      normalizedOriginalCode,
      normalizedSearchBlock,
      diffBlock.oldLines.length
    ),
    position => { 

      return pipe(position, fold(
      () => left(new Error('Could not find code block to replace')),
      pos => right({
        position: pos + codeIndexDelta,
        changes: diffTrimmedLines(
          diffBlock.oldLines.join('\n'),
          diffBlock.newLines.join('\n')
        )
      })
    ))}
  );
};

const applyChanges = (
  workingCodeLines :readonly string[],
  blocks          :readonly ChangeBlock[]
): readonly string[] => {
  // Create a map to track changes at each position
  //const changesByPosition = new Map<number, { lines: string[], length: number }>();
  
  let result = [...workingCodeLines];

  // Process each block to calculate its changes
  for (const block of blocks) {
    let currentIndex = block.position;
    const lines: string[] = [];
    console.log(`Processing block:`, block);
    
    for(const change of block.changes) {

      if( change.removed ) { 
        console.log(`Remove at: ${currentIndex}, count: ${change.count}`)
        result.splice(currentIndex, change.count ?? 0); 
        console.log(result, "\n")
      } 
      else if( change.added ) {

        const linesToAdd = change.value.split('\n');
        linesToAdd.pop(); // Remove last empty line from split
        result = [...result.slice(0, currentIndex), ...linesToAdd, ...result.slice(currentIndex)];
        lines.push(...linesToAdd);
      } 
      else { currentIndex += change.count ?? 0; }
    }
  }

  return result;
};

const replaceFragments = (
  fragments     :string,
  componentCode :string
): Either<Error, string> => {
  try {
    const originalCodeLines = componentCode.split('\n');

    return pipe(
      right(extractDiffBlocks(fragments)),
      map(blocks => [...blocks].sort((a, b) => {
        if (a.lineNumber !== undefined && b.lineNumber !== undefined) {
          return a.lineNumber - b.lineNumber;
        }
        if (a.lineNumber !== undefined) return -1;
        if (b.lineNumber !== undefined) return 1;
        return 0;
      })),
      chain(blocks => {
        // Process blocks sequentially, using each result as input for the next block
        return blocks.reduce<Either<Error, readonly string[]>>(
          (accEither, block) => pipe(
            accEither,
            chain(currentCodeLines => pipe(
              processDiffBlock(block, currentCodeLines, 0),
              map(result => applyChanges(currentCodeLines, [result]))
            ))
          ),
          right(originalCodeLines)
        );
      }),
      map(result => result.join('\n'))
    );
  } catch (error) {
    return left(error instanceof Error ? error : new Error('Unknown error'));
  }
};
export { replaceFragments, type DiffResult };