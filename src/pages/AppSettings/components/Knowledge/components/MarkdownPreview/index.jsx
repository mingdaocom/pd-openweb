import React from 'react';
import { renderMarkdown } from './renderMarkdown';
import './index.less';

const MarkdownPreview = ({ content }) => {
  if (!content) return null;

  return <div className="markdownPreview" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
};

export default MarkdownPreview;
