import React, { useEffect, useRef, useState } from 'react';
import { any, func, string } from 'prop-types';
import styled from 'styled-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { PREVIEW_TYPE } from '../constant/enum';
import { renderCode, renderMarkdown, renderTxt } from './core';
import TextPreview from './TextPreview';
import './codeViewer.less';

const renderFn = {
  [String(PREVIEW_TYPE.CODE)]: renderCode,
  [String(PREVIEW_TYPE.MARKDOWN)]: renderMarkdown,
  [String(PREVIEW_TYPE.TXT)]: renderTxt,
};

let _mermaidPromise = null;

// 懒加载并初始化 mermaid（模块级缓存，避免重复加载）；htmlLabels=false 保证纯 SVG 文本渲染稳定
function getMermaid() {
  if (!_mermaidPromise) {
    _mermaidPromise = import('mermaid').then(m => {
      const mermaid = m.default;

      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        flowchart: { useMaxWidth: true, htmlLabels: false },
        maxTextSize: 99999,
      });
      return mermaid;
    });
  }

  return _mermaidPromise;
}

// 把 markdown 预览里 ```mermaid 占位 div 异步渲染成图（核心 renderMarkdown 已输出 .md-mermaid 占位）
function renderMermaidIn(root) {
  if (!root) return undefined;
  const nodes = root.querySelectorAll('.md-mermaid:not([data-processed])');

  if (!nodes.length) return undefined;
  let cancelled = false;

  getMermaid()
    .then(mermaid => {
      nodes.forEach((node, i) => {
        if (cancelled) return;
        node.setAttribute('data-processed', '1');
        const code = node.textContent || '';

        mermaid
          .render(`md-mermaid-${Date.now()}-${i}`, code)
          .then(result => {
            if (!cancelled) node.innerHTML = result.svg;
          })
          .catch(() => {
            // 语法错误：保留原始源码文本，不阻断其余 markdown 内容
          });
      });
    })
    .catch(() => {
      // mermaid 加载失败：标记已处理以露出原始源码，避免占位被永久隐藏
      nodes.forEach(node => node.setAttribute('data-processed', '1'));
    });

  return () => {
    cancelled = true;
  };
}

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  ${({ type }) => type === PREVIEW_TYPE.CODE && 'background-color: var(--color-background-inverse) !important'}
  ${({ type }) =>
    (type === PREVIEW_TYPE.MARKDOWN || type === PREVIEW_TYPE.TXT) &&
    'background-color: var(--color-background-primary) !important'}
`;

const Content = styled.div`
  width: 80%;
  max-width: 1200px;
  height: 100%;
  .txt-viewer {
    width: 100%;
    height: 100%;
    background: var(--color-background-primary);
    border: none;
    white-space: break-spaces;
  }
`;

export default function TextViewer(props) {
  const { src, type, onError } = props;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(false);
  const markdownRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    if (renderFn[String(type)]) {
      renderFn[String(type)](src, (err, value) => {
        if (err) {
          onError(err);
          return;
        }

        setLoading(false);
        setContent(value);
      });
    } else {
      onError();
    }
  }, [src]);

  // markdown 内容注入后，把其中的 ```mermaid 占位异步渲染成图
  useEffect(() => {
    if (loading || String(type) !== String(PREVIEW_TYPE.MARKDOWN)) return undefined;
    return renderMermaidIn(markdownRef.current);
  }, [content, loading, type]);

  return (
    <Con className="codeViewer" onWheel={e => e.stopPropagation()} type={type}>
      {loading ? (
        <LoadDiv size="big" />
      ) : String(type) === String(PREVIEW_TYPE.TXT) ? (
        <Content>
          <TextPreview text={content} />
        </Content>
      ) : (
        <Content ref={markdownRef} dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </Con>
  );
}

TextViewer.propTypes = {
  src: string,
  type: any,
  onError: func,
};
