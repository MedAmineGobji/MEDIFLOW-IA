const fs = require('fs');
const content = fs.readFileSync('app/cv-analysis/page.tsx', 'utf8');
const lines = content.split('\n');
let openBraces = 0;
let openParens = 0;

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  for (let char of line) {
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '(') openParens++;
    if (char === ')') openParens--;
  }

  if (lineNum >= 200 && lineNum <= 220) {
    console.log(`Line ${lineNum}: braces=${openBraces}, parens=${openParens}, content: ${line.trim()}`);
  }
});

console.log(`Final: braces=${openBraces}, parens=${openParens}`);