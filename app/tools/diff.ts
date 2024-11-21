import { diffTrimmedLines, Change } from 'diff';
import { pipe } from 'fp-ts/lib/function.js';
import { Option, some, none, fold, match } from 'fp-ts/lib/Option.js'
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
}

type CodePosition = number;
type CodeDelta = number;

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
  //const lines = diffBlockTxt.split('\n');
  console.log('Input lines:', lines);

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

  console.log('Final structure:', finalStructure);
  return finalStructure;
};

const extractDiffBlocks = (fragments: string): readonly DiffBlock[] => {

  const regex = /```diff\n([\s\S]*?)[\n]*```/g;
  const blocks: DiffBlock[] = [];
  let match;

  while ((match = regex.exec(fragments)) !== null) {

    // const ignoreRegex = /^--- [^\n]*\n\+\+\+ [^\n]*\n@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/;
    // Ignore lines in "diff" blocks like:
    // `--- a/some_path...
    // +++ b/some_path...
    // @@ -xx,yy +jj,kk @@`
    const ignoreRegex = /^(--- a\/[^\n]*|\+\+\+ b\/[^\n]*|@@ -\d+,\d+ \+\d+,\d+ @@)$/;

    const diffBlockTxt = match[1].split('\n').filter(line => !ignoreRegex.test(line));

    //const diffBlockTxt = match[1];
    const { oldLines, newLines } = parseDiffLines( diffBlockTxt );
    const searchBlock = pipe(
      oldLines,
      normalizeLines,
      joinLines
    );
    blocks.push({ oldLines, newLines, searchBlock });
  }

  return blocks;
};

const processDiffBlock = (
  diffBlock         :DiffBlock,
  originalCodeLines :readonly string[],
  codeIndexDelta    :CodeDelta
): Either<Error, { readonly position: CodePosition, readonly changes: readonly Change[] }> => {

  const normalizedOriginalCode = originalCodeLines.map(normalizeCode);
  const normalizedSearchBlock = normalizeCode(diffBlock.searchBlock);

  return pipe(
    findBlockPosition(
      normalizedOriginalCode,
      normalizedSearchBlock,
      diffBlock.oldLines.length
    ),
    position => { 
      const pos_str = pipe(position, match(() => "<not found>", pos => normalizedOriginalCode[pos]));
      const pos_number = pipe(position, match(() => -1, pos => pos));
      console.log(`Position: ${pos_number}, at ${pos_str}`);
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
  position         :CodePosition,
  changes          :readonly Change[]
): readonly string[] => {

  let currentIndex = position;
  return changes.reduce(

    (acc, change) => {

      console.log('Change:', change);

      const lines = [...acc];

      if (change.removed) {
        const numLinesToRemove = change.count??0; // change.value.split('\n').length - 1;
        lines.splice(currentIndex, numLinesToRemove);
        //currentIndex += numLinesToRemove;
      } else if (change.added) {
        const linesToAdd = change.value.split('\n');
        linesToAdd.pop();
        lines.splice(currentIndex, 0, ...linesToAdd);
        currentIndex += change.count??0;
      }
      else currentIndex += change.count??0;

      return lines;
    },
    [...workingCodeLines]
  );
};

const replaceFragments = (
  fragments     :string,
  componentCode :string
): Either<Error, string> => {
  try {
    
    const originalCodeLines = componentCode.split('\n');

    type DiffState = {
      lines: string[];
      delta: number;
    };

    return pipe(
      right(extractDiffBlocks(fragments)),
      chain(blocks => blocks.reduce<Either<Error, DiffState>>(
        
        (acc, block) => {
          
          console.log('Processing block:', block);
          
          return pipe(
          acc,
          chain(({ lines, delta }) => pipe(
            processDiffBlock(block, originalCodeLines, delta),
            map(({ position, changes }) => ({
              lines: [...applyChanges(lines, position, changes)],
              delta: delta + (
                changes.reduce((sum, change) =>
                  sum + (change.added ? change.value.split('\n').length - 1 : 0) -
                  (change.removed ? change.value.split('\n').length - 1 : 0),
                  0
                )
              )
            }))
          ))
        )},
        right({ lines: [...originalCodeLines], delta: 0 })
      )),
      map(result => result.lines.join('\n'))
    );
  } catch (error) {

    return left(error instanceof Error ? error : new Error('Unknown error'));
  }
};
export { replaceFragments, type DiffResult };