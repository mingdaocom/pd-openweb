import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { formatElapsedDuration } from 'src/utils/domain/shared/time';
import ReactRemarkable from './ReactRemarkable';

const Root = styled.div`
  margin: 6px 0 8px;
`;

const Trigger = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  user-select: none;
  &.notClickable {
    cursor: default;
  }
  .chev {
    /* 与「思考中」三点引导槽同宽（16px），点→箭头切换时标题行不跳动 */
    width: 16px;
    font-size: 16px;
    color: var(--color-text-tertiary);
  }
  .reasoningLabel {
    font-weight: 600;
    color: var(--color-text-secondary);
  }
  .reasoningDuration {
    color: var(--color-text-tertiary);
  }
`;

const Dots = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  gap: 2px;
  span {
    width: 4px;
    height: 4px;
    background: var(--color-text-secondary);
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

const Content = styled.div`
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--color-border-secondary);
  /* 思考内容统一限高，超出滚动，避免长推理撑爆气泡 */
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  /* MarkdownWithCSS 内部写死 color-text-primary，用透明度整体压到次要文本观感 */
  > div {
    opacity: 0.72;
    font-size: 14px;
    line-height: 22px;
  }
  p {
    margin: 0 0 10px;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

// 推理过程（思维链）展示：流式中显示「思考中」+ 三点动画并实时追加内容，结束后折叠为「已思考 X秒」可点击展开。
// 时长根据组件挂载时间自行计时，streaming 结束后停在最终时长不再跳动。
export default function Reasoning({ children, streaming = false, defaultOpen = false }) {
  // 用 state 的惰性初始化取挂载时刻，避免在渲染期直接调用 Date.now() / 读取 ref.current
  const [startTs] = useState(() => Date.now());
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

  // streaming 中推理增量追加时把限高区域滚动到底，跟随最新内容
  useEffect(() => {
    if (!streaming || !open || !contentRef.current) return;
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [streaming, open, children]);

  const duration = formatElapsedDuration((endTs || now) - startTs);

  return (
    <Root>
      <Trigger className={streaming ? 'notClickable' : ''} onClick={() => !streaming && setOpen(v => !v)}>
        {streaming ? (
          <Dots>
            <span />
            <span />
            <span />
          </Dots>
        ) : (
          <i className={`chev icon icon-arrow-${open ? 'down' : 'right'}-border`} />
        )}
        <span className="reasoningLabel">{streaming ? _l('思考中') : _l('已思考')}</span>
        {duration && <span className="reasoningDuration">{duration}</span>}
      </Trigger>
      {open && (
        <Content ref={contentRef}>
          <ReactRemarkable markdown={typeof children === 'string' ? children : ''} isStreaming={streaming} />
        </Content>
      )}
    </Root>
  );
}

Reasoning.propTypes = {
  children: PropTypes.string,
  streaming: PropTypes.bool,
  defaultOpen: PropTypes.bool,
};
