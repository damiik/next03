// import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";

/**
 * Represents a line in the modification process
 * @property str - The actual content of the line
 * @property flag - The state/action for this line:
 *   - 'origin': Original line from source or context line from modification
 *   - 'to_delete': Line marked for deletion
 *   - 'to_insert': New line to be inserted
 */
export interface MLine {
  str: string;
  flag: 'origin' | 'to_delete' | 'to_insert' | 'unrecognized';
}

/**
 * Parses a single modification hunk into an array of MLine objects
 * A hunk is a group of modifications that should be applied together
 * 
 * Hunk format:
 * ___ - Context line (unchanged)
 * <~~ - Line to be deleted
 * ~~> - Line to be inserted
 * 
 * @param hunk - Raw string containing the hunk definition
 * @returns Array of MLine objects representing the modifications
 */
function parseHunk(hunk: string): MLine[] {
  // const lines = hunk.trim().split('\n').filter(line => line.trim());
  const lines = hunk.split('\n');
  const result: MLine[] = [];

  // Process each line based on its prefix
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (!trimmed) continue;

    if (trimmed.startsWith('___')) {
      // Context line - used for locating where to apply changes
      result.push({
        str: line.slice(3),
        flag: 'origin'
      });
    } else if (trimmed.startsWith('<~~')) {
      // Line that should be removed from the source
      result.push({
        str: line.slice(3),
        flag: 'to_delete'
      });
    } else if (trimmed.startsWith('~~>')) {
      // New line that should be added to the source
      result.push({
        str: line.slice(3),
        flag: 'to_insert'
      });
    }
    else {

      result.push({
        str: line,
        flag: 'unrecognized'
      });
    }
  }

  return result;
}

/**
 * Splits a modification string into individual hunks
 * Hunks are separated by '@@@' markers
 * 
 * @param modiff - Complete modification string containing multiple hunks
 * @returns Array of parsed hunks, each containing MLine objects
 */
function parseHunks(modiff: string): MLine[][] {
  const hunks = modiff.split('@@@').filter(hunk => hunk.trim());
  return hunks.map(parseHunk);
}

/**
 * Finds the position in the source text where a hunk should be applied
 * Uses context matching to ensure modifications are applied in the correct location
 * 
 * Context matching rules:
 * 1. Origin lines can match with any non-deleted line
 * 2. Delete lines must match with non-deleted lines
 * 3. Insert lines are ignored during context matching
 * 
 * @param lines - Current state of the source text as MLine objects
 * @param hunkLines - The hunk to be applied
 * @returns The index where the hunk should be applied, or -1 if no match found
 */
export function findContextPosition(lines: MLine[], hunkLines: MLine[]): number {
  if (hunkLines.length === 0) return -1;

  // Find the first context line that's not a deletion
  const firstContextLine = hunkLines.find(line => line.flag === 'origin' || line.flag === 'to_delete');
  if (!firstContextLine) return -1;

  // Find all potential starting positions by matching the first context line
  const potentialStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].str.trim() === firstContextLine.str.trim()) {
      potentialStarts.push(i);
    }
  }

  // Try each potential starting position
  for (const startPos of potentialStarts) {
    let matches = true;
    let hunkIndex = 0;
    let lineIndex = startPos;
    
    // Try to match context lines in sequence
    while (hunkIndex < hunkLines.length && lineIndex < lines.length) {
      const hunkLine = hunkLines[hunkIndex];

      if(hunkLine.flag === 'unrecognized') throw new Error(`Invalid flag: ${hunkLine.flag} for hunk line: ${hunkLine.str}`);
      
      if (hunkLine.flag === 'to_insert') {
        // Skip insert lines during context matching since they don't exist in source
        hunkIndex++;
        continue;
      }
      const sourceLine = lines[lineIndex];
      console.log(`SourceLine: ${sourceLine.str}[${sourceLine.flag}] , hunkLine: ${hunkLine.str} [${hunkLine.flag}], hunkIndex: ${hunkIndex}, lineIndex: ${lineIndex}`);
      if (sourceLine.flag === 'to_insert') {
        // Skip insert lines in source since they don't exist in hunk
        lineIndex++;
        continue;
      }

      if (hunkLine.flag === 'origin' || hunkLine.flag === 'to_delete') {
        // For origin lines, match with current line regardless of its flag
        if (sourceLine.str.trim() === hunkLine.str.trim()) {  
          hunkIndex++;
          lineIndex++;
        } else {
          matches = false;
          break;
        }
      }

      // Check if we've matched all non-insert lines
      if (matches && (hunkIndex === hunkLines.length || 
          (hunkIndex < hunkLines.length && 
           hunkLines.slice(hunkIndex).every(line => line.flag === 'to_insert')))) {
        return startPos;
      }
    }
  }

  return -1;
}

/**
 * Main function that applies modifications to source text
 * Processes each hunk in sequence, maintaining proper context and indentation
 * 
 * Algorithm:
 * 1. Convert source text to MLine objects
 * 2. Parse modifications into hunks
 * 3. For each hunk:
 *    a. Find where to apply it using context matching
 *    b. Extract indentation from context
 *    c. Apply modifications while preserving indentation
 * 4. Return modified lines
 * 
 * @param modiff - String containing all modifications in hunk format
 * @param sourceText - Original text to be modified
 * @returns Array of MLine objects representing the modified text
 */
function parseModiff(modiff: string, sourceText: string): MLine[] {
  // Initialize all lines as origin lines
  let lines: MLine[] = sourceText.split('\n').map(str => ({ str, flag: 'origin' as 'origin' | 'to_delete' | 'to_insert' }));
  const hunks = parseHunks(modiff);

  // Process each hunk in sequence
  for (const hunk of hunks) {
    console.log('Processing hunk:', hunk);
    const pos = findContextPosition(lines, hunk);
    console.log('Found context position:', pos);
    if (pos === -1) {
      console.error('Context not found for hunk:', hunk);
      continue;
    }

    // Apply the hunk modifications
    let hunkIndex = 0;
    let lineIndex = pos;

    while (hunkIndex < hunk.length && lineIndex < lines.length) {
      const hunkLine = hunk[hunkIndex];
      const sourceLine = lines[lineIndex];

      if (hunkLine.flag === 'origin') {
        // Match origin line with current or next line
        // Used for context and ensuring correct position
        if (sourceLine.str.trim() === hunkLine.str.trim()) {
          hunkIndex++;
          lineIndex++;
        } else {
          lineIndex++;
        }
      } else if (hunkLine.flag === 'to_delete') {
        // Mark matching line for deletion
        // The line will be filtered out in getFinalText
        if (sourceLine.str.trim() === hunkLine.str.trim()) {
          lines[lineIndex] = { str: sourceLine.str, flag: 'to_delete' };
          hunkIndex++;
          lineIndex++;
        } else {
          lineIndex++;
        }
      } else if (hunkLine.flag === 'to_insert') {
        // Insert new line after current position with proper indentation
        const newLine: MLine = { 
          str: hunkLine.str, 
          flag: 'to_insert' 
        };
        lines = [
          ...lines.slice(0, lineIndex),
          newLine,
          ...lines.slice(lineIndex)
        ];
        hunkIndex++;
        lineIndex++;
      }
      else {
        throw new Error(`Invalid flag: ${hunkLine.flag} for hunk line: ${hunkLine.str}`);
      }
    }

    // Insert any remaining to_insert lines at the end of the hunk
    while (hunkIndex < hunk.length && hunk[hunkIndex].flag === 'to_insert') {
      const newLine: MLine = { 
        str: hunk[hunkIndex].str, 
        flag: 'to_insert' 
      };
      lines = [
        ...lines.slice(0, lineIndex),
        newLine,
        ...lines.slice(lineIndex)
      ];
      hunkIndex++;
      lineIndex++;
    }
  }
  return lines;
}

/**
 * Generates the final text by applying all modifications
 * Removes deleted lines and preserves inserted lines
 * 
 * @param lines - Array of MLine objects with modifications applied
 * @returns Final text with all modifications applied
 */
function getFinalText(lines: MLine[]): string {
  return lines
    .filter(line => line.flag !== 'to_delete')
    .map(line => line.str)
    .join('\n');
}

/**
 * Extracts and parses modiff blocks from input text
 * Each modiff block is enclosed in ```modiff markers
 * 
 * @param inputText - The complete text containing modiff blocks
 * @param sourceText - Original text to be modified
 * @returns Array of MLine objects representing the modified text
 */
function parseModiffFromText(inputText: string, sourceText: string): MLine[] {
  // Regular expression to match modiff blocks
  const modiffBlockRegex = /```modiff\n([\s\S]*?)```/g;
  let result: MLine[] = [];
  let sourceTextState = sourceText;
  
  // Find all modiff blocks
  const matches = inputText.matchAll(modiffBlockRegex);
  for (const match of matches) {
    const modiffContent = match[1].trim();
    // Process each modiff block
    result = parseModiff(modiffContent, sourceTextState);
    // Update source text for next block
    sourceTextState = getFinalText(result);
  }
  
  return result;
}
export { parseModiff, getFinalText, parseModiffFromText };