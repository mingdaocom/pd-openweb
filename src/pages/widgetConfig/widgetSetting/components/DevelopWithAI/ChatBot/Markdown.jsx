import React, { useMemo, useRef } from 'react';
import Remarkable from 'remarkable';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import MarkdownWithCSS from './MarkdownWithCSS';
import { v4 as uuidv4 } from 'uuid';

function genContentFromWithImage(content) {
  const imageUrl = content.filter(item => item.type === 'image_url').map(item => item.image_url.url);
  const text = content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');
  return `![image](${imageUrl})\n${text}`;
}

// 使用 React.memo 包装组件，只在 content 发生变化时重新渲染
const Markdown = React.memo(
  function Markdown(props) {
    const { id, content, isStreaming, codeIsClosed, onAiCodeUpdate = () => {} } = props;
    const cache = useRef({});
    const markdown = useMemo(() => {
      const md = new Remarkable({
        breaks: true,
        typographer: true,
        highlight(str, lang) {
          if (isStreaming && lang === 'jsx') {
            onAiCodeUpdate(str);
            return highlight(str, languages.js);
          }
          return highlight(str, languages.js);
        },
      });

      // 如果是流式传输，只对 jsx 代码块特殊处理
      const defaultFence = md.renderer.rules.fence; // 保存默认的fence处理器
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const lang = token.params.split(/\s+/)[0]; // 获取语言标识

        if (lang === 'mdy.free_field') {
          // 提取 title 和 filename
          let title = '';
          let fileName = '';

          // 使用正则表达式匹配注释中的信息
          const titleMatch = token.content.match(/<free_field_name>(.*?)<\/free_field_name>/);
          const fileNameMatch = token.content.match(/<file_name>(.*?)<\/file_name>/);

          if (titleMatch) title = titleMatch[1];
          if (fileNameMatch) fileName = fileNameMatch[1];

          if (isStreaming) {
            onAiCodeUpdate(token.content, {
              title,
              fileName,
              isComplete: codeIsClosed,
              messageId: id,
            });
          }
          return `<div class="code-card" data-message-id="${id}">
  <div class="title">${title || '字段控件'}</div>
  <div class="file-name">${fileName || 'Free_field.jsx'}</div>
  ${codeIsClosed === false ? '<div class="border-beam"></div>' : ''}
</div>`;
        }

        // 其他语言的代码块使用默认的fence处理器
        return defaultFence.call(self, tokens, idx, options, env, self);
      };

      return md;
    }, [isStreaming, codeIsClosed, id]);
    return (
      <MarkdownWithCSS
        dangerouslySetInnerHTML={{
          __html: markdown.render(typeof content === 'string' ? content : genContentFromWithImage(content)),
        }}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  },
);

export default Markdown;
