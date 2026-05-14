import React from 'react';
import MarkdownIt from 'markdown-it';
import './index.less';

const mdParser = new MarkdownIt({
  html: true, // 支持 HTML 标签
  linkify: true, // 自动识别 URL
  typographer: true, // 美化引号、破折号等
  breaks: true, // 将段落内的换行符渲染为 <br>
});

const MarkdownPreview = ({ content }) => {
  if (!content) return null;

  return <div className="markdownPreview" dangerouslySetInnerHTML={{ __html: mdParser.render(content) }} />;
};

export default MarkdownPreview;
