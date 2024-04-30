import React from 'react';
import styled from 'styled-components';

const Con = styled.div`
  // background: #fff;
  &.scroll-x:hover::-webkit-scrollbar-thumb {
    border: 1px solid transparent;
  }
`;

export default function ScrollBar(props) {
  const { type = 'y', barWidth, setRef, setScrollY = () => {}, setScrollX = () => {} } = props;
  let style = { ...props.style };
  let contentStyle = { ...props.contentStyle };
  style.position = 'absolute';
  style.overflow = 'hidden';
  if (type === 'y') {
    style.overflowY = 'auto';
    style.width = barWidth;
    contentStyle.width = barWidth;
  } else if (type === 'x') {
    style.overflowX = 'auto';
    style.height = barWidth;
    contentStyle.height = barWidth;
  }
  return (
    <Con
      className={'scroll-' + type}
      style={style}
      ref={setRef}
      onScroll={e => {
        if (type === 'x') {
          setScrollX(e.target.scrollLeft);
        } else if (type === 'y') {
          setScrollY(e.target.scrollTop);
        }
      }}
    >
      <div className="content" style={contentStyle}></div>
    </Con>
  );
}
