// import { diffLines, Change } from 'diff';
import { diffTrimmedLines, Change } from 'diff';

interface DiffResult {
  success: boolean;
  code?: string;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function normalizeIndentation(lines: string[]): string[] {
  return lines.map(line => line.trimStart());
}

// Funkcja do porównania z ignorowaniem początkowych spacji w linii
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function diffIgnoringLeadingSpaces(
//   oldStr: string,
//   newStr: string,
//   callback: (changes: Change[]) => void
// ): void {
//   // Używamy `diffLines` z funkcją callback
//   diffLines(oldStr, newStr, (changes: Change[]) => {
//     // Modyfikujemy wynik, aby usunąć początkowe spacje z różnic
//     const normalizedChanges = changes.map(change => {
//       if (change.added || change.removed) {
//         change.value = change.value
//           .split('\n')
//           .map(line => line.trimStart()) // Usunięcie początkowych spacji
//           .join('\n');
//       }
//       return change;
//     });

//     // Wywołujemy callback z przetworzonymi zmianami
//     callback(normalizedChanges);
//   });
// }

function replaceFragments(
  fragments: string,
  componentCode: string
): DiffResult {
  try {
    const originalCodeLines = componentCode.split('\n'); // Keep original for searching
    const workingCodeLines = [...originalCodeLines]; // Working copy for modifications
    const regex = /```diff\n([\s\S]*?)[\n]*```/g;
    let match;
    let blockIndex = 0;

    console.log('=== Rozpoczynam przetwarzanie fragmentów ===');
    console.log('Oryginalny kod komponentu:\n', componentCode);

    let codeIndexDelta = 0;

    while ((match = regex.exec(fragments)) !== null) {

      // const ignoreRegex = /^--- [^\n]*\n\+\+\+ [^\n]*\n@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/;
      // Ignore lines in "diff" blocks like:
      // `--- a/some_path...
      // +++ b/some_path...
      // @@ -xx,yy +jj,kk @@`
      const ignoreRegex = /^(--- a\/[^\n]*|\+\+\+ b\/[^\n]*|@@ -\d+,\d+ \+\d+,\d+ @@)$/;

      const diffBlockTxt = match[1].split('\n').filter(line => !ignoreRegex.test(line));
      console.log(`\nPrzetwarzanie bloku diff #${++blockIndex}:`);
      console.log('Treść diff bloku:\n', diffBlockTxt);

      const oldLines: string[] = [];
      const newLines: string[] = [];
      diffBlockTxt.forEach(line => {

        if (line.startsWith('-')) {
          oldLines.push(line.slice(1));
        } else if (line.startsWith('+')) {
          newLines.push(line.slice(1));
        } else {
          oldLines.push(line);
          newLines.push(line);
        }
      });

      console.log('Linie przed zmianami (oldLines):\n', oldLines.join('\n'));
      console.log('Linie po zmianach (newLines):\n', newLines.join('\n'));

      const changes: Change[] = diffTrimmedLines(
        oldLines.join('\n'),
        newLines.join('\n')
      );

      console.log('Obliczone zmiany (changes):\n', changes);

      let codeIndex = 0;

      // Find position in ORIGINAL code
      const linesToSearch = oldLines;
      const searchBlock = linesToSearch.map(line => line.trim()).join('\n');

      // Use originalCodeLines for searching
      const normalizedOriginalCode = originalCodeLines.map(line =>
        line.replace(/\r\n/g, '\n')
      );
      const normalizedSearchBlock = searchBlock.replace(/\r\n/g, '\n');

      codeIndex = normalizedOriginalCode.findIndex((line, index) => {
        const currentBlock = normalizedOriginalCode
          .slice(index, index + linesToSearch.length)
          .map(l => l.trim())
          .join('\n');
        return currentBlock === normalizedSearchBlock;
      });

      if (codeIndex === -1) {
        throw new Error('Nie znaleziono bloku kodu do zastąpienia.');
      }

      // Apply delta after finding position in original code
      codeIndex += codeIndexDelta;
      let currentIndex = codeIndex;

      // Apply changes to working copy
      for (const change of changes) {
        if (change.removed) {
          const numLinesToRemove = change.value.split('\n').length - 1;
          workingCodeLines.splice(currentIndex, numLinesToRemove);
          codeIndexDelta -= numLinesToRemove;
        } else if (change.added) {
          const linesToAdd = change.value.split('\n');
          linesToAdd.pop();
          workingCodeLines.splice(currentIndex, 0, ...linesToAdd);
          currentIndex += linesToAdd.length;
          codeIndexDelta += linesToAdd.length;
        } else {
          const numLinesToSkip = change.value.split('\n').length - 1;
          currentIndex += numLinesToSkip;
        }
      }
    }

    return { success: true, code: workingCodeLines.join('\n') };
  } catch (error) {
    console.error('Błąd podczas przetwarzania diff:', (error as Error).message);
    return {
      success: false,
      error: `Error processing diff: ${(error as Error).message}`,
    };
  }
}

export { replaceFragments, type DiffResult };
