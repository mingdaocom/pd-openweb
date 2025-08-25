import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import _, { head, isEmpty, some } from 'lodash';
import styled from 'styled-components';
import { DRAG_ACCEPT, DRAG_MODE } from '../config/Drag';
import { notInsetSectionTab } from '../util';
import { isFullLineDragItem } from '../util/drag';
import { isFullLineControl } from '../util/widgets';
import DisplayItem from './displayItem';

const DisplayRowWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
`;

export default function RowItem({ row, displayItemType, sectionId, index, ...rest }) {
  const [pointerDir, setPointerDir] = useState('');
  const $ref = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_ACCEPT[displayItemType],
    canDrop(item) {
      const { path } = item;
      // 同一行的不能拖拽
      if (!isEmpty(path) && head(path) === index) return false;
      // 标签页内不允许标签页、多条列表(旧)等拖拽
      if (sectionId && (_.includes(['SECTION'], item.enumType) || notInsetSectionTab(item.data))) {
        return false;
      }
      // 批量拖拽，当前拖拽物在批量选中区域内
      if (rest.batchDrag && _.some(row, r => _.find(rest.batchActive || [], i => i.row === r.row))) return false;
      return true;
    },
    hover(item, monitor) {
      if (monitor.isOver({ shallow: true }) && monitor.canDrop()) {
        if (isFullLineDragItem(item)) {
          let dir = 'bottom';
          if ($ref.current) {
            // 若拖拽点在上半部则指示线在上方
            const { height, top } = $ref.current.getBoundingClientRect();
            const { y } = monitor.getClientOffset();
            if (y - top <= height / 2) dir = 'top';
          }
          setPointerDir(dir);
        } else {
          const rowItem = (rest.widgets || [])[index] || [];
          const currentRow = head(item.path);

          // 拖拽到其他行如果已经有三个以上也不能拖
          if (row !== currentRow && rowItem.length > 3) return false;
          if (some(rowItem, widget => isFullLineControl(widget))) return false;
          setPointerDir('right');
        }
      }
    },
    drop(item, monitor) {
      if (monitor.isOver({ shallow: true })) {
        if (!pointerDir) return;
        if (pointerDir === 'right') {
          return { mode: DRAG_MODE.INSERT_TO_ROW_END, rowIndex: index, sectionId, activePath: [index, row.length - 1] };
        }
        // 上下插入整行控件
        return {
          mode: DRAG_MODE.INSERT_NEW_LINE,
          rowIndex: pointerDir === 'top' ? index : index + 1,
          sectionId,
          activePath: [pointerDir === 'top' ? index - 1 : index, 0],
          displayItemType,
        };
      }
    },
    collect(monitor) {
      return { isOver: monitor.canDrop() && monitor.isOver({ shallow: true }) };
    },
  });

  drop($ref);
  return (
    <div ref={$ref} className="displayRow">
      <DisplayRowWrap>
        {row.map((data, columnIndex) => {
          return (
            <DisplayItem
              key={data.controlId}
              displayItemType={displayItemType}
              data={data}
              path={[index, columnIndex]}
              {...rest}
            />
          );
        })}
      </DisplayRowWrap>
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)}></div>}
    </div>
  );
}
