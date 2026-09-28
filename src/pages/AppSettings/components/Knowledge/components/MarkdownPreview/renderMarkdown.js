import MarkdownIt from 'markdown-it';
import filterXss from 'xss';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

export const renderMarkdown = content => filterXss(mdParser.render(content));
