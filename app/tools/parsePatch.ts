
import { ParsedDiff  } from 'diff';

// file based on https://github.com/kpdecker/jsdiff/blob/master/src/patch/parse.js
// (not used)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parsePatchX(uniDiff : string) {
    const diffstr = uniDiff.split(/\n/);
    const list : ParsedDiff[] = [];
    let i = 0;

    // Parses the --- and +++ headers, if none are found, no lines
    // are consumed.
    function parseFileHeader(index : ParsedDiff) {
      const fileHeader = (/^(---|\+\+\+)\s+(.*)\r?$/).exec(diffstr[i]);
      if (fileHeader) {
        const keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
        const data = fileHeader[2].split('\t', 2);
        let fileName = data[0].replace(/\\\\/g, '\\');
        if ((/^".*"$/).test(fileName)) {

          fileName = fileName.slice(1, -1);
        }

        if (keyPrefix === 'old') {
          index.oldFileName = fileName;
          index.oldHeader = (data[1] || '').trim();
        } else {
          index.newFileName = fileName;
          index.newHeader = (data[1] || '').trim();
        }
        i++;
      }
    }

    // Parses a hunk
    // This assumes that we are at the start of a hunk.
    function parseHunk() {
      const chunkHeaderIndex = i,
          chunkHeaderLine = diffstr[i++],
          chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);

      const hunk = {
        oldStart: +chunkHeader[1],
        oldLines: typeof chunkHeader[2] === 'undefined' ? 1 : +chunkHeader[2],
        newStart: +chunkHeader[3],
        newLines: typeof chunkHeader[4] === 'undefined' ? 1 : +chunkHeader[4],
        lines: [] as string[]
      };

      // Unified Diff Format quirk: If the chunk size is 0,
      // the first number is one lower than one would expect.
      // https://www.artima.com/weblogs/viewpost.jsp?thread=164293
      if (hunk.oldLines === 0) {
        hunk.oldStart += 1;
      }
      if (hunk.newLines === 0) {
        hunk.newStart += 1;
      }

      let addCount = 0,
          removeCount = 0;
      for (
        ;
        i < diffstr.length && (removeCount < hunk.oldLines || addCount < hunk.newLines || diffstr[i]?.startsWith('\\'));
        i++
      ) {
        const operation = (diffstr[i].length == 0 && i != (diffstr.length - 1)) ? ' ' : diffstr[i][0];
        if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
          hunk.lines.push(diffstr[i]);

          if (operation === '+') {
            addCount++;
          } else if (operation === '-') {
            removeCount++;
          } else if (operation === ' ') {
            addCount++;
            removeCount++;
          }
        } else {
          console.log(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
          throw new Error(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
        }
      }

      // Handle the empty block count case
      if (!addCount && hunk.newLines === 1) {
        hunk.newLines = 0;
      }
      if (!removeCount && hunk.oldLines === 1) {
        hunk.oldLines = 0;
      }

      // Perform sanity checking
      if (addCount !== hunk.newLines) {
        console.log(`Added l. count ${addCount} did not match with hunk.newLines ${hunk.newLines} for hunk at: ${chunkHeaderIndex + 1}, (...fixed.)`); 
        hunk.newLines = addCount;
        //throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
      }
      if (removeCount !== hunk.oldLines) {
        console.log(`Removed l. count ${removeCount} did not match with hunk.oldLines ${hunk.oldLines} for hunk at: ${chunkHeaderIndex + 1}, (...fixed.)`); 
        hunk.oldLines = removeCount;
        //throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
      }

      return hunk;
    }

    while (i < diffstr.length) {

      const index : ParsedDiff= { hunks: [] };
      list.push(index);

      // Parse diff metadata
      while (i < diffstr.length) {

        const line = diffstr[i];

        // File header found, end parsing diff metadata
        if ((/^(\-\-\-|\+\+\+|@@)\s/).test(line)) break;

        // Diff index
        const header = (/^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/).exec(line);
        if( header ) { index.index = header[1]; }

        i++;
      }

      // Parse file headers if they are defined. Unified diff requires them, but
      // there's no technical issues to have an isolated hunk without file header
      parseFileHeader(index);
      parseFileHeader(index);

      // Parse hunks
      index.hunks = [];

      while (i < diffstr.length) {
        const line = diffstr[i];
        if ((/^(Index:\s|diff\s|\-\-\-\s|\+\+\+\s|===================================================================)/).test(line)) { break; } 
        else if ((/^@@/).test(line)) { index.hunks.push( parseHunk() ); } 
        else if ( line ) {
          console.log('Unknown line ' + (i + 1) + ' ' + JSON.stringify(line));  
          //throw new Error('Unknown line ' + (i + 1) + ' ' + JSON.stringify(line));
          i++;
        } 
        else { i++; }
      }
    }

    return list;
  }


  export function parsePatchAI(uniDiff : string, inputText : string) {
    const diffstr = uniDiff.split(/\n/);
    const list : ParsedDiff[] = [];
    let i = 0;

    console.log ("parse patch AI.")


    // Parses the --- and +++ headers, if none are found, no lines
    // are consumed.
    function parseFileHeader(index : ParsedDiff) {
      const fileHeader = (/^(---|\+\+\+)\s+(.*)\r?$/).exec(diffstr[i]);
      if (fileHeader) {
        const keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
        const data = fileHeader[2].split('\t', 2);
        let fileName = data[0].replace(/\\\\/g, '\\');
        if ((/^".*"$/).test(fileName)) {

          fileName = fileName.slice(1, -1);
        }

        if (keyPrefix === 'old') {
          index.oldFileName = fileName;
          index.oldHeader = (data[1] || '').trim();
        } else {
          index.newFileName = fileName;
          index.newHeader = (data[1] || '').trim();
        }
        i++;
      }
    }

    
    // Parses a hunk
    // This assumes that we are at the start of a hunk.
    function parseHunk() {
      const chunkHeaderIndex = i,
          chunkHeaderLine = diffstr[i++],
          chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      console.log('chunkHeader:', chunkHeader);
      const hunk = {
        oldStart: +chunkHeader[1],
        oldLines: typeof chunkHeader[2] === 'undefined' ? 1 : +chunkHeader[2],
        newStart: +chunkHeader[3],
        newLines: typeof chunkHeader[4] === 'undefined' ? 1 : +chunkHeader[4],
        lines: [] as string[]
      };

      // Unified Diff Format quirk: If the chunk size is 0,
      // the first number is one lower than one would expect.
      // https://www.artima.com/weblogs/viewpost.jsp?thread=164293
      if (hunk.oldLines === 0) {
        hunk.oldStart += 1;
      }
      if (hunk.newLines === 0) {
        hunk.newStart += 1;
      }

      let addCount = 0,
          removeCount = 0;
      for (
        ;
        i < diffstr.length && (removeCount < hunk.oldLines || addCount < hunk.newLines || diffstr[i]?.startsWith('\\'));
        i++
      ) {
        const operation = (diffstr[i].length == 0 && i != (diffstr.length - 1)) ? ' ' : diffstr[i][0];
        if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
          hunk.lines.push(diffstr[i]);

          if (operation === '+') {
            addCount++;
          } else if (operation === '-') {
            removeCount++;
          } else if (operation === ' ') {
            addCount++;
            removeCount++;
          }
        } else {
          throw new Error(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
        }
      }

      // Handle the empty block count case
      if (!addCount && hunk.newLines === 1) {
        hunk.newLines = 0;
      }
      if (!removeCount && hunk.oldLines === 1) {
        hunk.oldLines = 0;
      }

      // Perform sanity checking
      if (addCount !== hunk.newLines) {
        console.log(`Added line count ${addCount} did not match with hunk.newLines ${hunk.newLines} for hunk at line: ${chunkHeaderIndex + 1}`); 
        //throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
      }
      if (removeCount !== hunk.oldLines) {
        console.log(`Removed line count ${removeCount} did not match with hunk.oldLines ${hunk.oldLines} for hunk at line: ${chunkHeaderIndex + 1}`); 
        //throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
      }

      return hunk;
    }

    // Parses a hunk with header ##
    // This assumes that we are at the start of a hunk.
    function parseAIHunk(inputText: string) {

      const inputLines = inputText.split('\n').map(line => line.trim());

      const chunkHeaderIndex = i,
          chunkHeaderLine = diffstr[i++],
          chunkHeader = chunkHeaderLine.split(/\#\# - \#\#/);
      console.log('chunkAIHeader:', chunkHeader);
      const hunk = {
        oldStart: 0,
        oldLines: 0,
        newStart: 0,
        newLines: 0,
        lines: [] as string[]
      };

      // Unified Diff Format quirk: If the chunk size is 0,
      // the first number is one lower than one would expect.
      // https://www.artima.com/weblogs/viewpost.jsp?thread=164293
      // if (hunk.oldLines === 0) {
      //   hunk.oldStart += 1;
      // }
      // if (hunk.newLines === 0) {
      //   hunk.newStart += 1;
      // }

      let addCount = 0;
      let removeCount = 0;
      for (; i < diffstr.length;) {
        const operation = (diffstr[i].length == 0 && i != (diffstr.length - 1)) ? ' ' : diffstr[i][0];
        if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
          hunk.lines.push(diffstr[i]);
          i++

          if (operation === '+') {
            addCount++;
          } else if (operation === '-') {
            removeCount++;
          } else if (operation === ' ') {
            addCount++;
            removeCount++;
          } else if (operation === '\\') {
            // do nothing
          } else {
            throw new Error(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
          }
        } else {
          throw new Error(`Hunk at line ${chunkHeaderIndex + 1} contained invalid line ${diffstr[i]}`);
        }
      }

      hunk.oldLines = removeCount;
      //hunk.newLines = addCount;


      // Handle the empty block count case
      if (!addCount && hunk.newLines === 1) {
        hunk.newLines = 0;
      }
      else hunk.newLines = addCount;

      // if (!removeCount && hunk.oldLines === 1) {
      //   hunk.oldLines = 0;
      // }
      // else hunk.oldLines = removeCount;


      const oldLines = hunk.lines.filter(line => { return (line[0] === '-' || line[0] === ' ' || line.length === 0)}).map(line => {return line.length > 0 ? line.slice(1).trim() :"";});

      // console.log(`Searching for substring in ${inputLines}`)
      // console.log(`Substring: ${oldLines}`)


      if(oldLines.length !== hunk.oldLines) console.log(`Problem: number of lines with prefix '-' or ' ' does not match hunk.oldLines\n oldLines.length: ${oldLines.length}\n hunk.oldLines: ${hunk.oldLines}`);
      let subStringFound = false;
      while(!subStringFound && hunk.oldStart + hunk.oldLines < inputLines.length) {

        subStringFound = true;
        for(let x = 0; x < hunk.oldLines; x++) {
          if ((x+hunk.oldStart) < inputLines.length && oldLines[x] !== inputLines[x+hunk.oldStart]) {
            subStringFound = false;
            hunk.oldStart++;
            break;
          }
          else 
            console.log(`Line ${x} found:  ${oldLines[x]} at index ${x+hunk.oldStart}`);
        }
      }
      if(!subStringFound) {hunk.oldStart = 0; hunk.newStart = 0;}
      else hunk.newStart = hunk.oldStart;

      return hunk;
    }

    function parseIndex(inputText: string) {
      const index : ParsedDiff= { hunks: [] };
      list.push(index);

      // Parse diff metadata
      while (i < diffstr.length) {
        const line = diffstr[i];

        // File header found, end parsing diff metadata
        if ((/^(\-\-\-|\+\+\+|@@|\#\#)\s/).test(line)) {
          console.log('File header found, end parsing diff metadata', line);
          break;
        }

        // Diff index
        const header = (/^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/).exec(line);
        if (header) {
          index.index = header[1];
        }

        i++;
      }

      // Parse file headers if they are defined. Unified diff requires them, but
      // there's no technical issues to have an isolated hunk without file header
      parseFileHeader(index); // optional
      parseFileHeader(index); // optional

      // Parse hunks
      index.hunks = [];

      while (i < diffstr.length) {
        const line = diffstr[i];
        if ((/^(Index:\s|diff\s|\-\-\-\s|\+\+\+\s|===================================================================)/).test(line)) {
          break;
        } 
        else if ((/^@@/).test(line)) { index.hunks.push(parseHunk()); }
        else if ((/^\#\#/).test(line)) { 
          const hunk = parseAIHunk(inputText);
          console.log('AI Hunk found', hunk);

           index.hunks.push(hunk);
        }
        else if (line) {
          throw new Error(`Unknown prefix character at line ${i + 1}  ${JSON.stringify(line)}`);
        } else {
          i++;
        }
      }
    }



    while (i < diffstr.length) {
      parseIndex(inputText);
    }

    return list;
  }
