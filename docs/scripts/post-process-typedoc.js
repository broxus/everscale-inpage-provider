// post-process-typedoc.js
const fs = require('fs');
const path = require('path');

const addAttributesToHeaders = input => {
  const headerRegex = /^(#+)\s(.+)$/gm;
  return input.replace(headerRegex, (match, level, title) => {
    const levelNumber = level.length;
    const attrTitle = title.replace(/\s+/g, '-');
    return `${level} ${title} {.${levelNumber}-${attrTitle}}`;
  });
};

const processLinks = input => {
  return input.replace(/]\((\w+)\.md(#\w+)?\)/g, '](./$1.md$2)');
};

const processFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const updatedContent = processLinks(addAttributesToHeaders(content));
  fs.writeFileSync(filePath, updatedContent);
};

const processDirectory = dirPath => {
  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.md')) {
      processFile(filePath);
    }
  });
};

const docsDir = './docs/build';
processDirectory(docsDir);
