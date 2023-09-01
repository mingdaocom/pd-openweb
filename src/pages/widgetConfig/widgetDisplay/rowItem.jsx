import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { head, isEmpty, get, some } from 'lodash';
import { useDrop } from 'react-dnd-latest';
import DisplayItem from './displayItem';
import { DRAG_ITEMS, DRAG_MODE } from '../config/Drag';
import { isFullLineDragItem } from '../util/drag';
import { isFullLineControl } from '../util/widgets';

const DisplayRowWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
`;

export default function RowItem({ row, index, displayItemType, ...rest }) {
  const [pointerDir, setPointerDir] = useState('');
  const $ref = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept:
      displayItemType === 'relate' ? [DRAG_ITEMS.DISPLAY_ITEM_RELATE] : [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM],
    canDrop(item, monitor) {
      const { path } = item;
      // 同一行的不能拖拽
      if (!isEmpty(path) && head(path) === index) return false;

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
          const rowItem = (rest.widgets || [])[index];
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
        const sectionId = get(head(row), 'type') === 52 ? get(head(row), 'controlId') : get(head(row), 'sectionId');
        if (pointerDir === 'right') {
          return { mode: DRAG_MODE.INSERT_TO_ROW_END, rowIndex: index, sectionId };
        }
        // 上下插入整行控件
        return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex: pointerDir === 'top' ? index : index + 1, sectionId };
      }
    },
    collect(monitor) {
      return { isOver: monitor.canDrop() && monitor.isOver({ shallow: true }) };
    },
  });
  drop($ref);
  return (
    <div ref={$ref} className={'displayRow'}>
      <DisplayRowWrap>
        {row.map((data, columnIndex) => {
          return (
            <DisplayItem
              key={`${displayItemType}-${data.controlId}`}
              data={data}
              path={[index, columnIndex]}
              displayItemType={displayItemType}
              {...rest}
            />
          );
        })}
      </DisplayRowWrap>
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)}></div>}
    </div>
  );
}
