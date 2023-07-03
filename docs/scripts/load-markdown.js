const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it')();

module.exports = function loadMarkdown(filePath) {
  const fullPath = path.join(__dirname, filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return markdownIt.render(fileContents);
};
