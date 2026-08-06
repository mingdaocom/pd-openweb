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
    animation: reasoningBlink 1.2s ease-in-out infinite;
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes reasoningBlink {
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
  font-size: 14px;
  line-height: 22px;
  /* 思考内容统一限高，超出滚动 */
  max-height: 220px;
  overflow-y: auto;
  /* 仅纵向滚动：overflow-y 非 visible 会把 overflow-x 的 visible 计算成 auto，导致长内容出现横向滚动条，显式关闭 */
  overflow-x: hidden;

  /* MarkdownText 内部颜色写死 primary 且被全局规则直接命中、改 color 盖不住，
     用透明度把思考内容整体压到 color-text-secondary 的观感（#151515 → ≈#757575） */
  > div {
    opacity: 0.6;
  }

  p {
    margin: 0 0 10px;
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

// 思考时长根据组件挂载时间与 streaming 状态自行计时，结束后停在最终时长不再跳动。
// 折叠进「已工作」的思考块（非流式）改用传入的 startedAt / finishedAt 取真实时长，
// 避免重新挂载后时长归零。内容区统一限高 220px，长推理不会撑爆容器。
export function Reasoning({ children, streaming = false, defaultOpen = false, className, startedAt, finishedAt }) {
  const startRef = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [endTs, setEndTs] = useState(null);
  const [open, setOpen] = useState(streaming || defaultOpen);
  const prevStreamingRef = useRef(streaming);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!streaming) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, [streaming]);

  useEffect(() => {
    if (prevStreamingRef.current && !streaming) {
      setEndTs(Date.now());
      setOpen(false);
    }

    prevStreamingRef.current = streaming;
  }, [streaming]);

  // streaming 中实时推理内容追加时把限高区域滚动到底，跟随最新增量
  useEffect(() => {
    if (!streaming || !open || !contentRef.current) return;
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [streaming, open, children]);

  const duration =
    startedAt && finishedAt
      ? formatDuration(finishedAt - startedAt)
      : formatDuration((endTs || now) - startRef.current);

  return (
    <Root className={className}>
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
          {typeof children === 'string' ? <MarkdownText>{children}</MarkdownText> : children}
        </Content>
      )}
    </Root>
  );
}
