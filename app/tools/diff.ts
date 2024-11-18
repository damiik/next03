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

function replaceFragments(fragments: string, componentCode: string): DiffResult {
  try {
    const updatedCode = componentCode.split('\n');
    const regex = /```diff\n([\s\S]*?)```/g;
    let match;
    let blockIndex = 0;

    console.log("=== Rozpoczynam przetwarzanie fragmentów ===");
    console.log("Oryginalny kod komponentu:\n", componentCode);

    while ((match = regex.exec(fragments)) !== null) {
      const diffBlockTxt = match[1];
      console.log(`\nPrzetwarzanie bloku diff #${++blockIndex}:`);
      console.log("Treść diff bloku:\n", diffBlockTxt);

      const oldLines: string[] = [];
      const newLines: string[] = [];

      diffBlockTxt.split('\n').forEach(line => {
        if (line.startsWith('-')) {
          oldLines.push(line.slice(1));
        } else if (line.startsWith('+')) {
          newLines.push(line.slice(1));
        } else {
          oldLines.push(line);
          newLines.push(line);
        }
      });

      console.log("Linie przed zmianami (oldLines):\n", oldLines.join('\n'));
      console.log("Linie po zmianach (newLines):\n", newLines.join('\n'));

      const changes: Change[] = diffTrimmedLines(oldLines.join('\n'), newLines.join('\n'));

      console.log("Obliczone zmiany (changes):\n", changes);

      let codeIndex = 0;

      // Find the starting index in updatedCode (line mode!)
      const firstChange = changes.find(c => c.removed || c.added);
      if (firstChange) {
        const linesToSearch = firstChange.removed ? oldLines : newLines;
        for (let i = 0; i < updatedCode.length; i++) {
          if (updatedCode[i].trim() === linesToSearch[0].trim()) {
            codeIndex = i;
            break;
          }
        }
      }

      for (const change of changes) {

        if (change.removed) {
          const numLinesToRemove = change.value.split('\n').length - 1;
          updatedCode.splice(codeIndex, numLinesToRemove);
        } else if (change.added) {
          const linesToAdd = change.value.split('\n');
          linesToAdd.pop();
          updatedCode.splice(codeIndex, 0, ...linesToAdd);
          codeIndex += linesToAdd.length;
        } else {
          const numLinesToSkip = change.value.split('\n').length - 1;
          codeIndex += numLinesToSkip;
        }
      }

      console.log("Kod po wprowadzeniu zmian z bloku:\n", updatedCode.join('\n'));
    }


    console.log("\n=== Zakończono przetwarzanie fragmentów ===");
    console.log("Ostateczny kod komponentu:\n", updatedCode.join('\n'));

    return { success: true, code: updatedCode.join('\n') };
  } catch (error) {
    console.error("Błąd podczas przetwarzania diff:", (error as Error).message);
    return {
      success: false,
      error: `Error processing diff: ${(error as Error).message}`
    };
  }
}


export { replaceFragments, type DiffResult };
