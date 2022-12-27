import React from 'react';

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
    <div
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
    </div>
  );
}
