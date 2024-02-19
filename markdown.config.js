const markdownIt = require('markdown-it');
const markdownItInclude = require('markdown-it-include');

module.exports = {
  configureMarkdown: md => {
    md.use(markdownItInclude, { root: 'docs' });
  },
};
