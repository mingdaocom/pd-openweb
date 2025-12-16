import React, { useMemo, useState } from 'react';
import Remarkable from 'remarkable';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import cx from 'classnames';
import { get } from 'lodash';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import MobileRecordInfoWrap from 'src/pages/Mobile/Record/MobileRecordInfoWrap';
import MarkdownWithCSS from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/MarkdownWithCSS';
import { browserIsMobile } from 'src/utils/common';
import 'prismjs/themes/prism.css';

function mergeContent(content) {
  return content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');
}

// 创建基础 remarkable 实例
function createMarkdownInstance() {
  return new Remarkable({
    html: false,
    linkify: true,
    typographer: false,
  });
}

function sanitizeMdTagChunk(chunk) {
  // 匹配未闭合的 markdown 链接：[文字](未闭合的部分
  // 1. \[([^\]]+)\] - 匹配 [文字]
  // 2. \( - 匹配左括号
  // 3. [^\)]* - 匹配任意非右括号字符（链接内容）
  // 4. $ - 必须在字符串末尾（未闭合）
  const unClosedLinkPattern = /\[([^\]]+)\]\([^\)]*$/;

  const match = chunk.match(unClosedLinkPattern);
  if (match) {
    // 提取文字部分，替换成 [文字]()
    const text = match[1];
    const beforeLink = chunk.slice(0, match.index);
    return beforeLink + `[${text}]()`;
  }

  return chunk;
}

export default function ({ className, isStreaming, style = {}, markdown, renderCustomBlock }) {
  markdown = typeof markdown === 'string' ? markdown : mergeContent(markdown);
  const [{ recordId, worksheetId }, setMobileRowInfo] = useState({});
  markdown = markdown.replace('<FINAL_ANSWER>', '').replace('</FINAL_ANSWER>', '');
  if (isStreaming) {
    markdown = sanitizeMdTagChunk(markdown);
    markdown = markdown.replace(/<\/?(?:F(?:I(?:N(?:A(?:L(?:_(?:A(?:N(?:S(?:W(?:E(?:R)?)?)?)?)?)?)?)?)?)?)?)?$/, '');
  }
  // 使用 remarkable 的原生渲染，只自定义代码块处理
  const content = useMemo(() => {
    // 存储自定义块的映射
    const customBlocks = [];

    // 创建临时的 remarkable 实例用于本次渲染
    const tempMd = createMarkdownInstance();

    // 自定义代码块渲染规则
    tempMd.renderer.rules.fence = function (tokens, idx) {
      const token = tokens[idx];
      const lang = token.params || '';

      // 检查是否是自定义语言标识
      const isCustomLang = renderCustomBlock && lang.startsWith('custom_block_');

      if (renderCustomBlock && isCustomLang) {
        // 为自定义块创建占位符
        const blockId = `custom-block-${customBlocks.length}`;
        customBlocks.push({
          id: blockId,
          type: lang.replace('custom_block_', ''),
          content: token.content,
        });
        return `<div data-custom-block="${blockId}"></div>`;
      }

      // 使用 prism 进行语法高亮
      const grammar = languages[lang] || languages.javascript;
      const highlighted = highlight(token.content, grammar, lang);
      return `<pre><code class="${lang}">${highlighted}</code></pre>`;
    };

    // 渲染 markdown
    const html = tempMd.render(markdown || '');

    return { html, customBlocks };
  }, [markdown, renderCustomBlock]);

  // 将 HTML 和自定义组件组合成 React 元素
  const renderContent = () => {
    const { html, customBlocks } = content;

    if (customBlocks.length === 0) {
      // 没有自定义块，直接返回 HTML
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }

    // 有自定义块，需要拆分 HTML 并插入 React 组件
    const parts = [];
    let lastIndex = 0;

    customBlocks.forEach((block, index) => {
      const placeholder = `<div data-custom-block="${block.id}"></div>`;
      const placeholderIndex = html.indexOf(placeholder, lastIndex);

      if (placeholderIndex !== -1) {
        // 添加占位符之前的 HTML
        if (placeholderIndex > lastIndex) {
          parts.push(
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: html.substring(lastIndex, placeholderIndex) }}
            />,
          );
        }

        // 添加自定义组件
        parts.push(
          <div key={`custom-${index}`}>{renderCustomBlock({ type: block.type, content: block.content })}</div>,
        );

        lastIndex = placeholderIndex + placeholder.length;
      }
    });

    // 添加剩余的 HTML
    if (lastIndex < html.length) {
      parts.push(<div key="html-last" dangerouslySetInnerHTML={{ __html: html.substring(lastIndex) }} />);
    }

    return <>{parts}</>;
  };

  const handleMarkdownClick = e => {
    const urlObj = e.target.href && new URL(e.target.href);
    if (urlObj && urlObj.pathname.startsWith('/md_tag_record/')) {
      e.preventDefault();
      e.stopPropagation();
      if (!get(window.md, 'global.Account.accountId')) return;
      const [, worksheetId, recordId] = urlObj.pathname.split('/').slice(1);
      const isMobile = browserIsMobile();
      if (isMobile) {
        setMobileRowInfo({ recordId, worksheetId });
      } else {
        openRecordInfo({
          worksheetId: worksheetId,
          recordId: recordId,
        });
      }
      return;
    }
    if (e.target.tagName.toLowerCase() === 'a') {
      window.open(e.target.href);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <MarkdownWithCSS
      className={cx(className, { isMobile: browserIsMobile() })}
      style={style}
      onClick={handleMarkdownClick}
    >
      {renderContent()}

      <MobileRecordInfoWrap
        className="full"
        visible={!!recordId}
        worksheetId={worksheetId}
        rowId={recordId}
        updateMobileInfo={data => setMobileRowInfo(data)}
      />
    </MarkdownWithCSS>
  );
}
