import React, { memo } from 'react';
import { areEqual, VariableSizeGrid } from 'react-window';
import _ from 'lodash';

function sum(array = []) {
  return array.reduce((a, b) => a + b, 0);
}

function cx(obj) {
  return Object.keys(obj)
    .filter(key => obj[key])
    .join(' ');
}

const Cell = memo(
  function Cell(props) {
    const { style, columnIndex, rowIndex, renderCell } = props;
    window.count++;
    return renderCell({
      style: { ...style, boxSizing: 'border-box' },
      rowIndex,
      columnIndex,
    });
  },
  (prevProps, nextProps) => {
    const { rowIndex, columnIndex, needUpdated = {} } = nextProps;
    const { type, index } = needUpdated;
    if (
      (type === 'row' && index === rowIndex) ||
      (type === 'column' && index === columnIndex) ||
      (type === 'cell' && index === `${rowIndex}-${columnIndex}`) ||
      type === 'all'
    ) {
      return false;
    }
    return areEqual(_.omit(prevProps, ['needUpdated']), _.omit(nextProps, ['needUpdated']));
  },
);

export default function Grid(props) {
  // console.log('grid render');
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
    leftFixedCount,
    rightFixedCount,
    rowHeight,
    cache,
    getColumnWidth,
    renderCell = () => {},
    setRef,
  } = props;
  const leftFixedWidth = leftFixedCount ? sum([...new Array(leftFixedCount)].map((n, i) => getColumnWidth(i))) : 0;
  const rightFixedWidth = rightFixedCount ? sum([...new Array(rightFixedCount)].map((n, i) => getColumnWidth(i))) : 0;
  let topFixedHeight = topFixedCount ? topFixedCount * columnHeadHeight : 0;
  let bottomFixedHeight = bottomFixedCount ? bottomFixedCount * 28 : 0;
  const config = {
    left: leftFixed ? 0 : rightFixed ? width - rightFixedWidth : leftFixedWidth,
    top: topFixed ? 0 : bottomFixed ? height - bottomFixedHeight : topFixedHeight,
    width: leftFixed ? leftFixedWidth : rightFixed ? rightFixedWidth : width - leftFixedWidth - rightFixedWidth,
    height: topFixed ? topFixedHeight : bottomFixed ? bottomFixedHeight : height - topFixedHeight - bottomFixedHeight,
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
      key={id}
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
    >
      {({ columnIndex, rowIndex, style, ...rest }) => (
        <Cell
          style={style}
          renderCell={renderCell}
          {...{
            needUpdated: cache.needUpdated,
            columnIndex: leftFixed
              ? columnIndex
              : rightFixed
              ? columnCount - rightFixedCount + columnIndex
              : leftFixedCount + columnIndex,
            rowIndex: topFixed ? undefined : bottomFixed ? undefined : rowIndex,
          }}
        />
      )}
    </VariableSizeGrid>
  );
}
