import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import styled from 'styled-components';
import { CodeBlock } from './CodeBlock';

// GFM 任务列表（- [ ] / - [x]）：markdown-it 核心不支持，内联实现避免引第三方依赖。
// 在 inline 解析后，把列表项开头的 [ ]/[x] 文本换成只读 checkbox，并给 li 打 task-list-item 类。
function taskListsPlugin(md) {
  md.core.ruler.after('inline', 'task-lists', state => {
    const tokens = state.tokens;

    for (let i = 2; i < tokens.length; i++) {
      if (tokens[i].type !== 'inline') continue;
      if (tokens[i - 1].type !== 'paragraph_open' || tokens[i - 2].type !== 'list_item_open') continue;
      const first = tokens[i].children[0];
      if (!first || first.type !== 'text') continue;
      const matched = /^\[([ xX])\]\s+/.exec(first.content);
      if (!matched) continue;
      first.content = first.content.slice(matched[0].length);
      const checkbox = new state.Token('html_inline', '', 0);
      checkbox.content = `<input class="task-list-checkbox" type="checkbox" disabled${
        matched[1] !== ' ' ? ' checked' : ''
      }>`;
      tokens[i].children.unshift(checkbox);
      tokens[i - 2].attrJoin('class', 'task-list-item');
    }
  });
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
});

md.use(taskListsPlugin);

// 所有 markdown 链接统一在新标签页打开，并补 rel 防止 opener 反向控制
const defaultLinkOpen =
  md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const Root = styled.div`
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 24px;
  word-break: break-word;

  .md-body {
    > *:first-child {
      margin-top: 0;
    }
    > *:last-child {
      margin-bottom: 0;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--color-text-primary);
    font-weight: 600;
    line-height: 1.4;
  }
  h1 {
    font-size: 20px;
    margin: 24px 0 16px;
  }
  h2 {
    font-size: 18px;
    margin: 24px 0 16px;
  }
  h3 {
    font-size: 16px;
    margin: 20px 0 12px;
  }
  h4,
  h5,
  h6 {
    font-size: 14px;
    margin: 16px 0 8px;
  }

  p {
    margin: 8px 0;
  }

  hr {
    margin: 16px 0;
    border: none;
    border-top: 1px solid var(--color-border-secondary);
  }

  strong {
    font-weight: 600;
    color: var(--color-text-primary);
  }
  em {
    font-style: italic;
  }
  /* markdown-it 的 ~~删除~~ 输出 <s>，一并兜住 <del> */
  s,
  del {
    color: var(--color-text-tertiary);
  }

  ul,
  ol {
    margin: 8px 0;
    padding-left: 24px;
    /* 全局 basic.css 给 ul/ol 直接设了 font-size:13px / line-height:1.5，这里拉回与正文一致 */
    font-size: 14px;
    line-height: 24px;
    color: var(--color-text-primary);
  }
  ul {
    list-style: disc;
  }
  ol {
    list-style: decimal;
  }
  li {
    display: list-item;
    /* 全局 basic.css 把 li 重置为 list-style: none，这里继承父级 ul/ol 的 disc/decimal 找回 marker */
    list-style: inherit;
    margin: 4px 0;
    line-height: 24px;
  }
  li > p {
    margin: 0;
  }
  li > ul,
  li > ol {
    margin: 4px 0;
  }

  /* 任务列表项：去掉项目符号，checkbox 与文字基线对齐 */
  li.task-list-item {
    list-style: none;
    margin-left: -20px;
  }
  .task-list-checkbox {
    width: 14px;
    height: 14px;
    margin: 0 6px 0 0;
    vertical-align: -2px;
    cursor: default;
  }

  blockquote {
    margin: 12px 0;
    padding: 4px 12px;
    border-left: 3px solid var(--color-border-primary);
    color: var(--color-text-secondary);
    background: var(--color-background-tertiary);
    border-radius: 0 4px 4px 0;
  }
  blockquote blockquote {
    background: transparent;
    margin: 4px 0;
    border-left-color: var(--color-border-secondary);
  }
  blockquote blockquote blockquote {
    border-left-color: transparent;
  }

  a {
    color: var(--color-link);
    text-decoration: none;
    &:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }
  }

  code {
    padding: 1px 6px;
    border-radius: 6px;
    background: var(--color-background-disabled);
    border: 1px solid var(--color-border-secondary);
    font-family: 'SFMono-Regular', 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.95em;
    color: var(--color-text-primary);
  }

  table {
    width: 100%;
    margin: 12px 0;
    border-collapse: collapse;
    font-size: 14px;
  }
  th,
  td {
    padding: 8px 12px;
    border: 1px solid var(--color-border-secondary);
    text-align: left;
    color: var(--color-text-primary);
  }
  th {
    background: var(--color-background-tertiary);
    font-weight: 600;
  }

  img {
    max-width: 100%;
    border-radius: 6px;
    margin: 8px 0;
  }
`;

const FENCE_REGEX = /```([a-zA-Z0-9_-]*)[^\S\n]*\n([\s\S]*?)```/g;
const OPEN_FENCE_REGEX = /```([a-zA-Z0-9_-]*)[^\S\n]*\n([\s\S]*)$/;

function parseSegments(text, isStreaming = false) {
  const segments = [];
  let lastIndex = 0;
  let match;
  FENCE_REGEX.lastIndex = 0;
  while ((match = FENCE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    // 跳过空围栏（模型偶发在正文末尾吐 ```\n``` 占位）：无内容不渲染空白代码块，
    // 与下方流式分支（openMatch[2].trim() 才推）保持一致，避免完整/已完成消息里出现成对空 tag。
    if (match[2].trim()) {
      segments.push({ type: 'code', language: match[1] || 'text', value: match[2] });
    }

    lastIndex = FENCE_REGEX.lastIndex;
  }

  const tail = text.slice(lastIndex);

  if (isStreaming && tail) {
    const openMatch = OPEN_FENCE_REGEX.exec(tail);

    if (openMatch) {
      if (openMatch.index > 0) {
        segments.push({ type: 'text', value: tail.slice(0, openMatch.index) });
      }

      // 有实际内容才推出 code 段（纯空白时直接等下一个 delta，避免骨架屏无谓出现）
      if (openMatch[2].trim()) {
        segments.push({ type: 'code', language: openMatch[1] || 'text', value: openMatch[2], isStreaming: true });
      }
    } else {
      segments.push({ type: 'text', value: tail });
    }
  } else if (tail) {
    segments.push({ type: 'text', value: tail });
  }

  return segments;
}

export function MarkdownText({ children, className, streaming = false }) {
  const text = typeof children === 'string' ? children : String(children ?? '');
  const segments = useMemo(() => parseSegments(text, streaming), [text, streaming]);

  return (
    <Root className={className}>
      {segments.map((segment, index) =>
        segment.type === 'code' ? (
          <CodeBlock
            key={`code-${index}`}
            code={segment.value}
            language={segment.language}
            isStreaming={segment.isStreaming}
          />
        ) : (
          <div
            key={`text-${index}`}
            className="md-body"
            dangerouslySetInnerHTML={{ __html: md.render(segment.value) }}
          />
        ),
      )}
    </Root>
  );
}
