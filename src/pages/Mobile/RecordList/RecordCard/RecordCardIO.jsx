import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from 'antd-mobile';
import styled from 'styled-components';
import RecordCard from './index';

const RecordCardIOWrap = styled.div`
  ${({ colNum }) =>
    colNum > 1
      ? `
        margin: 0 5px;
        width: calc(${100 / colNum}% - ${5 * colNum}px);

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
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
  height: ${props => props.realCardHeight}px;
`;

const RecordCardIO = props => {
  const { viewRootEl, updateViewCard, colNum, ...rest } = props;
  const recordCardRef = useRef(null);
  const [observerEnabled, setObserverEnabled] = useState(false);

  const skeletonHeight = props.view?.displayControls?.length * 30 || 200;

  const [realCardHeight, setRealCardHeight] = useState(skeletonHeight);
  const [skeletonRows, setSkeletonRows] = useState(Math.floor(skeletonHeight / 40));

  const { ref, inView } = useInView({
    root: observerEnabled ? viewRootEl : undefined,
    rootMargin: '100px',
    threshold: 0,
    skip: !observerEnabled,
  });
  const shouldRender = observerEnabled ? inView : false;
  useEffect(() => {
    if (viewRootEl instanceof Element) {
      setObserverEnabled(true);
    }
  }, [viewRootEl]);
  useEffect(() => {
    if (shouldRender && recordCardRef?.current?.cardWrap) {
      const height = recordCardRef.current.cardWrap.getBoundingClientRect()?.height;
      updateViewCard(props.data?.rowid, height);
      setRealCardHeight(height);
      setSkeletonRows(Math.floor(height / 40));
    }
  }, [shouldRender]);

  return (
    <RecordCardIOWrap className="recordCardIOWrap overflowHidden" ref={observerEnabled ? ref : null} colNum={colNum}>
      {shouldRender ? (
        <RecordCard ref={recordCardRef} {...rest} />
      ) : (
        <SkeletonWrap realCardHeight={realCardHeight}>
          <Skeleton.Paragraph className="recordCardSkeleton" lineCount={skeletonRows} />
        </SkeletonWrap>
      )}
    </RecordCardIOWrap>
  );
};

export default RecordCardIO;
