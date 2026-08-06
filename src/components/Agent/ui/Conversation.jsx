import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { IconArrowDown } from './icons';
import { colors, shadows, spacing, transitions } from './tokens';

// 纵向滚动、隐藏横向，静态配置提升到模块顶层避免每次 render 重建
const SCROLL_OPTIONS = { overflow: { x: 'hidden', y: 'scroll' } };
const STICK_TO_BOTTOM_THRESHOLD = 16;

// 外层定位容器：负责 flex 撑高，并作为悬浮「回到底部」按钮的定位参照
const Viewport = styled.div`
  position: relative;
  display: flex;
  min-height: 240px;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  background: ${colors.background};
`;

const Root = styled(ScrollView)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px;

  @media (max-width: 768px) {
    padding: 16px 20px 0;
  }
`;

const Content = styled.div`
  width: 100%;
  padding: 20px 0 30px;

  @media (max-width: 768px) {
    padding: 20px 0;
  }
`;

const Empty = styled.div`
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
`;

const EmptyTitle = styled.div`
  margin-bottom: ${spacing.sm};
  color: ${colors.text};
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
`;

const EmptyDescription = styled.div`
  max-width: 480px;
  color: ${colors.textMuted};
  font-size: 14px;
  line-height: 22px;
`;

const ScrollButton = styled.button`
  position: sticky;
  bottom: 20px;
  display: inline-flex;
  width: 36px;
  height: 36px;
  /* flex 列容器里不加收缩约束会被压扁、圆形变椭圆；居中只用 align-self，
     不要再叠加 left:50% + translateX —— sticky 下会横向偏移并被 overflow-x:hidden 裁成半圆 */
  flex: none;
  box-sizing: border-box;
  align-self: center;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.border};
  border-radius: 50%;
  /* 浅色底色用接近白的 #fafafa（#f5f5f5 偏灰）；暗色 #fafafa 对应 #090909 反而比面板暗，单独提到卡片面 */
  background: ${colors.backgroundMuted};
  box-shadow: ${shadows.subtle};
  color: ${colors.textMuted};
  cursor: pointer;
  transition:
    background ${transitions.hover},
    color ${transitions.hover},
    border-color ${transitions.hover};

  [data-theme='dark'] & {
    background: ${colors.backgroundCard};
  }

  &:hover {
    border-color: ${colors.brand};
    /* 用不透明的 hover 面，避免 brandSoft 半透明在滚动内容上透字 */
    background: ${colors.backgroundHover};
    color: ${colors.brand};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// 会话内悬浮按钮：脱离滚动内容、绝对定位于 Viewport 底部居中，不随内容滚动
const FloatingScrollButton = styled(ScrollButton)`
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
`;

export function Conversation({
  children,
  autoScroll = true,
  emptyState,
  scrollButtonOffset = 120,
  scrollBottomSignal = 0,
  ...props
}) {
  const scrollViewRef = useRef(null);
  // ScrollView（OverlayScrollbars）实际的滚动视口节点，经 setViewPortRef 异步拿到
  const [viewport, setViewport] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  // 用户一旦 wheel/touchmove 就关掉自动跟随；autoScroll 由 false → true 时（新一轮流式）再打开
  const stickToBottomRef = useRef(true);
  // 流式期间「预留占位」：内容高度回缩（典型如推理块流式结束收起）时，在底部补等高占位撑住滚动总高度，
  // 避免 scrollTop 被 clamp 导致整列内容下移；随后流式新增内容把占位逐步吃掉，本轮结束清零。
  const contentRef = useRef(null); // children 包裹层（不含占位），ResizeObserver 只观察它，避免反馈环
  const reserveRef = useRef(0);
  const [reserve, setReserve] = useState(0);
  const peakRef = useRef(0); // 本轮见过的最大「真实内容」高度（不含占位）
  const prevContentRef = useRef(0);

  // 即时贴到「真实内容」底部（不含底部占位），流式跟随用、无动画
  const stickToBottom = useCallback(() => {
    if (viewport) viewport.scrollTop = Math.max(0, viewport.scrollHeight - reserveRef.current - viewport.clientHeight);
  }, [viewport]);

  // 通过 ScrollView API 重算与底部的距离，控制「回到底部」按钮显隐
  const updateScrollButton = useCallback(() => {
    const info = scrollViewRef.current?.getScrollInfo?.();

    if (!info) return;
    // 扣掉底部占位再算到真实内容底部的距离，避免占位期间误显「回到底部」按钮
    const distanceToBottom = info.scrollHeight - reserveRef.current - info.scrollTop - info.clientHeight;
    const isAtBottom = distanceToBottom <= STICK_TO_BOTTOM_THRESHOLD;

    if (isAtBottom) stickToBottomRef.current = true;
    setShowScrollButton(distanceToBottom > scrollButtonOffset);
  }, [scrollButtonOffset]);

  // 切换/新建会话导致消息被清空、或视口刚就绪时，scroll 事件不会触发，需主动重算距离
  useEffect(() => {
    updateScrollButton();
  }, [children, viewport, updateScrollButton]);

  useEffect(() => {
    if (!viewport) return undefined;
    const onUserScroll = () => {
      stickToBottomRef.current = false;
    };

    viewport.addEventListener('wheel', onUserScroll, { passive: true });
    viewport.addEventListener('touchmove', onUserScroll, { passive: true });
    return () => {
      viewport.removeEventListener('wheel', onUserScroll);
      viewport.removeEventListener('touchmove', onUserScroll);
    };
  }, [viewport]);

  useEffect(() => {
    if (autoScroll) {
      // 新一轮流式开始（autoScroll false → true）：恢复贴底并重置占位追踪
      stickToBottomRef.current = true;
      peakRef.current = 0;
      prevContentRef.current = 0;
    } else {
      // 本轮结束：释放占位（此时已贴在真实内容底部，移除底部占位不会引起跳动）
      peakRef.current = 0;
      prevContentRef.current = 0;
      if (reserveRef.current !== 0) {
        reserveRef.current = 0;
        setReserve(0);
      }
    }
  }, [autoScroll]);

  useEffect(() => {
    if (!autoScroll || !stickToBottomRef.current || !viewport) return undefined;
    const raf = requestAnimationFrame(() => {
      if (stickToBottomRef.current) stickToBottom();
    });

    return () => cancelAnimationFrame(raf);
  }, [autoScroll, children, viewport, stickToBottom]);

  // 内容高度变化不一定伴随 children 变化（推理块内部 state 收起、图表/图片迟到布局），用 ResizeObserver 观察 children 包裹层。
  // 回缩：在底部补占位撑住总高度、不动 scrollTop（内容不下移）；增长：吃掉占位并贴真实底部跟随。
  useEffect(() => {
    const content = contentRef.current;

    if (!content || typeof ResizeObserver === 'undefined') return undefined;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      const contentH = content.offsetHeight;

      if (!autoScroll || !stickToBottomRef.current) {
        prevContentRef.current = contentH;
        return;
      }

      if (contentH > peakRef.current) peakRef.current = contentH;
      const nextReserve = Math.max(0, peakRef.current - contentH);

      if (nextReserve !== reserveRef.current) {
        reserveRef.current = nextReserve;
        setReserve(nextReserve);
      }

      // 增长（或持平）才贴真实底部跟随；回缩不动 scrollTop，由占位撑住高度避免下移
      if (contentH >= prevContentRef.current) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(stickToBottom);
      }

      prevContentRef.current = contentH;
    });

    ro.observe(content);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [autoScroll, stickToBottom]);

  // 一次性贴底信号（如打开历史会话）：与 autoScroll 无关，强制滚到底部并恢复贴底跟随
  useEffect(() => {
    if (!scrollBottomSignal || !viewport) return undefined;
    stickToBottomRef.current = true;
    const raf = requestAnimationFrame(() => {
      stickToBottom();
    });

    return () => cancelAnimationFrame(raf);
  }, [scrollBottomSignal, viewport, stickToBottom]);

  const hasContent = useMemo(() => {
    const array = Array.isArray(children) ? children : [children];

    return array.some(Boolean);
  }, [children]);

  const defaultEmpty = (
    <Empty>
      <EmptyTitle>{_l('开始新的对话')}</EmptyTitle>
      <EmptyDescription>{_l('输入问题、上传文件或发起任务，智能助手会在这里持续输出结果。')}</EmptyDescription>
    </Empty>
  );

  return (
    <Viewport {...props}>
      <Root ref={scrollViewRef} setViewPortRef={setViewport} onScroll={updateScrollButton} options={SCROLL_OPTIONS}>
        <div ref={contentRef}>{hasContent ? children : emptyState || defaultEmpty}</div>
        {reserve > 0 && <div aria-hidden style={{ height: `${reserve}px`, flex: 'none' }} />}
      </Root>
      {showScrollButton && (
        <FloatingScrollButton
          type="button"
          aria-label={_l('滚动到底部')}
          onClick={() => {
            const info = scrollViewRef.current?.getScrollInfo?.();

            stickToBottomRef.current = true;
            if (info) scrollViewRef.current.scrollTo({ top: info.scrollHeight - reserveRef.current }, 'smooth');
          }}
        >
          <IconArrowDown />
        </FloatingScrollButton>
      )}
    </Viewport>
  );
}

export function ConversationContent({ children, className }) {
  return <Content className={className}>{children}</Content>;
}

export function ConversationScrollButton(props) {
  return (
    <ScrollButton type="button" {...props}>
      <IconArrowDown />
    </ScrollButton>
  );
}
