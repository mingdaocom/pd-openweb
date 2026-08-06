import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IconChevronDown, IconChevronRight } from './icons';
import { MarkdownText } from './MarkdownText';
import { colors, spacing } from './tokens';

const Root = styled.section`
  margin: 12px 0 6px;
`;

const Trigger = styled.button`
  /* 块级 flex + 宽度贴合内容：避免 inline-flex 在继承 24px 行高的 section 里因基线 strut
     而在标题行上方多出几像素留白（「思考中」带内容块时尤其明显），保证两态标题行紧贴容器顶 */
  display: flex;
  width: fit-content;
  align-items: center;
  gap: ${spacing.sm};
  border: 0;
  background: transparent;
  padding: 0;
  color: ${colors.textMuted};
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;

  &.notClickable {
    cursor: default;
  }

  svg.chev {
    width: 16px;
    height: 16px;
    color: ${colors.textSubtle};
  }
`;

const Dots = styled.span`
  /* 与「已思考」的箭头同尺寸的固定引导槽（16×16 居中），避免点→箭头切换时标题行错位跳动 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  gap: 2px;

  span {
    width: 4px;
    height: 4px;
    background: ${colors.textMuted};
    border-radius: 50%;
    animation: thinkingBlink 1.2s ease-in-out infinite;
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes thinkingBlink {
    0%,
    60%,
    100% {
      opacity: 0.3;
    }
    30% {
      opacity: 1;
    }
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: ${colors.textMuted};
`;

const Duration = styled.span`
  color: ${colors.textSubtle};
`;

const Content = styled.div`
  margin-top: 8px;
  padding-left: 20px;
  border-left: 1px solid ${colors.border};
  color: ${colors.textMuted};
  font-size: 13px;
  line-height: 20px;
  /* 思考内容统一限高，超出滚动 */
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;

  /* MarkdownText 内部颜色写死 primary 且被全局规则直接命中、改 color 盖不住，
     用透明度把思考内容整体压到 color-text-secondary 的观感（#151515 → ≈#757575） */
  > div {
    opacity: 0.6;
  }

  p {
    margin: 0 0 8px;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

function formatDuration(ms) {
  if (!ms || ms < 0) return '';
  // 有测得耗时但不足 1 秒时按 1 秒计，避免出现无意义的「0秒」
  const sec = Math.max(1, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;

  if (m > 0) return _l('%0分%1秒', m, s);
  return _l('%0秒', s);
}

// 仅聚合 reasoning part；items 为空时整块不渲染（模型没产出推理 → 无"思考中/已思考"提示）
export function ThinkingSummary({ items = [], streaming = false, defaultOpen = false }) {
  const [open, setOpen] = useState(streaming || defaultOpen);
  const [now, setNow] = useState(() => Date.now());
  const startTs = items.length ? Math.min(...items.map(p => p.ts || now)) : now;
  const endTs = streaming ? now : items.reduce((acc, p) => Math.max(acc, p.ts || 0), startTs);
  const prevStreamingRef = useRef(streaming);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!streaming) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, [streaming]);

  useEffect(() => {
    if (prevStreamingRef.current && !streaming) setOpen(false);
    prevStreamingRef.current = streaming;
  }, [streaming]);

  // streaming 中实时推理内容追加时把限高区域滚动到底，跟随最新增量
  useEffect(() => {
    if (!streaming || !open || !contentRef.current) return;
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [streaming, open, items]);

  if (!items.length) return null;
  const duration = formatDuration(endTs - startTs);

  return (
    <Root>
      <Trigger type="button" className={streaming ? 'notClickable' : ''} onClick={() => !streaming && setOpen(v => !v)}>
        {streaming ? (
          <Dots>
            <span />
            <span />
            <span />
          </Dots>
        ) : open ? (
          <IconChevronDown className="chev" />
        ) : (
          <IconChevronRight className="chev" />
        )}
        <Label>{streaming ? _l('思考中') : _l('已思考')}</Label>
        {duration && <Duration>{duration}</Duration>}
      </Trigger>
      {open && (
        <Content ref={contentRef}>
          {items.map((part, idx) => (
            <MarkdownText key={`r-${idx}`}>{part.text || ''}</MarkdownText>
          ))}
        </Content>
      )}
    </Root>
  );
}

export default ThinkingSummary;
