import React, { memo } from 'react';
import { areEqual, VariableSizeGrid } from 'react-window';
import _, { includes } from 'lodash';

function sum(array = []) {
  return array.reduce((a, b) => a + b, 0);
}

function cx(obj) {
  return Object.keys(obj)
    .filter(key => obj[key])
    .join(' ');
}

export default function Grid(props) {
  const {
    id,
    leftFixed,
    topFixed,
    rightFixed,
    bottomFixed,
    width,
    height,
    columnHeadHeight,
    rowCount,
    columnCount,
    topFixedCount,
    bottomFixedCount,
    rightFixedCount,
    rowHeight,
    cache,
    getColumnWidth,
    Cell,
    tableData,
    setRef,
  } = props;
  let leftFixedCount = props.leftFixedCount;
  let leftFixedWidth = leftFixedCount ? sum([...new Array(leftFixedCount)].map((n, i) => getColumnWidth(i))) : 0;
  if (leftFixedWidth > width) {
    leftFixedCount = 1;
    leftFixedWidth = leftFixedCount ? sum([...new Array(leftFixedCount)].map((n, i) => getColumnWidth(i))) : 0;
  }
  const rightFixedWidth = rightFixedCount ? sum([...new Array(rightFixedCount)].map((n, i) => getColumnWidth(i))) : 0;
  let topFixedHeight = topFixedCount ? topFixedCount * columnHeadHeight : 0;
  let bottomFixedHeight = bottomFixedCount ? bottomFixedCount * 28 : 0;
  let gridHeight = topFixed
    ? topFixedHeight
    : bottomFixed
    ? bottomFixedHeight
    : height - topFixedHeight - bottomFixedHeight;
  if (includes(id, 'main') && gridHeight < 60) {
    gridHeight = 60;
  }
  const config = {
    left: leftFixed ? 0 : rightFixed ? width - rightFixedWidth : leftFixedWidth,
    top: topFixed ? 0 : bottomFixed ? height - bottomFixedHeight : topFixedHeight,
    width: leftFixed ? leftFixedWidth : rightFixed ? rightFixedWidth : width - leftFixedWidth - rightFixedWidth,
    height: gridHeight,
    columnCount: leftFixed
      ? leftFixedCount
      : rightFixed
      ? rightFixedCount
      : columnCount - leftFixedCount - rightFixedCount,
    rowCount: topFixed || bottomFixed ? 1 : rowCount,
  };
  if (!config.width || !config.height) {
    return;
  }
  return (
    <VariableSizeGrid
      ref={setRef}
      className={id + ' ' + cx({ leftFixed, rightFixed, topFixed, bottomFixed }) + '' + id}
      key={`${id}-${config.width}`}
      style={{
        position: 'absolute',
        left: config.left,
        top: config.top,
        overflow: 'hidden',
      }}
      width={config.width}
      height={config.height}
      columnCount={config.columnCount}
      columnWidth={i => {
        return getColumnWidth(id.endsWith('center') ? i + leftFixedCount : i);
      }}
      rowHeight={() => rowHeight}
      rowCount={config.rowCount}
      itemData={{
        ...tableData,
        grid: {
          id,
          columnCount,
          leftFixed,
          rightFixed,
          topFixed,
          bottomFixed,
          rightFixedCount,
          leftFixedCount,
          ...config,
        },
      }}
    >
      {Cell}
    </VariableSizeGrid>
  );
}
