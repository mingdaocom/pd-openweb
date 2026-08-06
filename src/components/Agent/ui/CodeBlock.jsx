import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EMBED_LANGUAGE_PREFIX, resolveEmbed } from './embed';
import { ChartSkeleton } from './embed/Chart';
import { IconCopy } from './icons';
import { MermaidBlock } from './MermaidBlock';
import { colors, radii, spacing, transitions, typography } from './tokens';

// 图表围栏语言（mingo_embed_data_chart）：流式半包 JSON 时用它判断「确定是 chart」，先占位
const CHART_EMBED_LANGUAGE = `${EMBED_LANGUAGE_PREFIX}chart`;

const Root = styled.div`
  margin: ${spacing.md} 0;
  border: 1px solid ${colors.border};
  border-radius: ${radii.card};
  background: ${colors.backgroundMuted};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  padding: 10px 12px 8px;
`;

const Language = styled.div`
  color: ${colors.textMuted};
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  flex: 0 0 auto;
  height: 24px;
  padding: 0 8px;
  border: 1px solid ${colors.border};
  border-radius: ${radii.item};
  background: ${colors.background};
  color: ${colors.textMuted};
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  transition:
    background ${transitions.hover},
    border-color ${transitions.hover},
    color ${transitions.hover};

  &:hover {
    border-color: ${colors.borderHover};
    background: ${colors.backgroundHover};
    color: ${colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Body = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 12px 10px;
`;

const Pre = styled.pre`
  margin: 0;
  color: ${colors.text};
  font-family: ${typography.monoFamily};
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  white-space: pre;
`;

export function CodeBlock({ code, language, isStreaming, showCopyButton = true, className }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timer);
  }, [copied]);

  if (language === 'mermaid') return <MermaidBlock code={code} isStreaming={isStreaming} />;

  // mingo_embed_data_<suffix> 代码块：按后缀分发到对应卡片组件渲染结构化数据；
  // 未登记后缀 / JSON 残缺时 resolveEmbed 返回 null，自然回退成下方的普通代码块。
  const embed = resolveEmbed(language, code);

  if (embed) {
    const { Component, data } = embed;

    return <Component data={data} isStreaming={isStreaming} />;
  }

  // 流式期间已确定是 chart 围栏，但 JSON 还没流完（resolveEmbed 因半包返回 null）：
  // 先展示图表占位 loading，避免裸 JSON 代码块闪现。非流式（最终仍解析失败）则照常回退普通代码块。
  if (isStreaming && (language || '').trim() === CHART_EMBED_LANGUAGE) {
    return <ChartSkeleton />;
  }

  async function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  const showHeader = language || showCopyButton;

  return (
    <Root className={className}>
      {showHeader && (
        <Header>
          {language ? <Language>{language}</Language> : <span />}
          {showCopyButton && (
            <CopyButton type="button" onClick={handleCopy}>
              <IconCopy />
              {copied ? _l('已复制') : _l('复制')}
            </CopyButton>
          )}
        </Header>
      )}
      <Body>
        <Pre>{code}</Pre>
      </Body>
    </Root>
  );
}
