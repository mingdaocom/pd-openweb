import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from 'antd-mobile';
import styled from 'styled-components';
import RecordCard from './index';

const RecordCardIOWrap = styled.div`
  ${({ $colNum }) =>
    $colNum > 1
      ? `
        margin: 0 5px;
        width: calc(${100 / $colNum}% - ${5 * $colNum}px);

        &:nth-child(odd) {
          border-left: 5px solid transparent;
        }

        &:nth-child(even) {
          border-right: 5px solid transparent;
        }
      `
      : `
        width: 100%;
        margin: 0 10px;
      `}
`;

const SkeletonWrap = styled.div`
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid var(--color-background-card);
  background-color: var(--color-background-primary);
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
  height: calc(100% - 10px);
`;

const RecordCardIO = props => {
  const { viewRootEl, colNum, ...rest } = props;
  const recordCardRef = useRef(null);
  const observerEnabled = viewRootEl instanceof Element;

  const skeletonHeight = props.view?.displayControls?.length * 30 || 200;

  const [realCardHeight, setRealCardHeight] = useState(skeletonHeight);
  const skeletonRows = Math.floor(realCardHeight / 40);
  // Android 微信聚焦输入框时会调整可视区域，扩大观察区避免来源卡片被误回收并连带关闭弹层。
  const [rootMargin] = useState(() => (window.isAndroid && window.isWeiXin ? `${window.innerHeight}px 0px` : '100px'));

  const { ref, inView } = useInView({
    root: observerEnabled ? viewRootEl : undefined,
    rootMargin,
    threshold: 0,
    skip: !observerEnabled,
  });
  const setCardRef = useCallback(
    node => {
      recordCardRef.current = node;
      ref(node);
    },
    [ref],
  );
  const shouldRender = observerEnabled ? inView : false;
  useEffect(() => {
    const element = recordCardRef.current;
    if (!shouldRender || !element) return;

    // 记录完整占位（含操作按钮、边框和底部间距），避免离屏回收时列表高度突变。
    // 异步图片、字段及按钮更新也可能改变卡片高度。
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(([entry]) => {
        if (entry.contentRect.height > 0) {
          setRealCardHeight(entry.contentRect.height);
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }

    const frame = requestAnimationFrame(() => setRealCardHeight(element.getBoundingClientRect().height));
    return () => cancelAnimationFrame(frame);
  }, [shouldRender]);

  return (
    <RecordCardIOWrap
      className="recordCardIOWrap overflowHidden"
      ref={setCardRef}
      $colNum={colNum}
      style={shouldRender ? undefined : { height: realCardHeight }}
    >
      {shouldRender ? (
        <RecordCard {...rest} />
      ) : (
        <SkeletonWrap>
          <Skeleton.Paragraph className="recordCardSkeleton" lineCount={skeletonRows} />
        </SkeletonWrap>
      )}
    </RecordCardIOWrap>
  );
};

export default RecordCardIO;
