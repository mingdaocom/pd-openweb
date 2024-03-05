import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _, { head, isEmpty, get, some } from 'lodash';
import { useDrop } from 'react-dnd-latest';
import DisplayItem from './displayItem';
import { DRAG_ITEMS, DRAG_MODE } from '../config/Drag';
import { isFullLineDragItem } from '../util/drag';
import { relateOrSectionTab } from '../util';
import { isFullLineControl } from '../util/widgets';

const DisplayRowWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
`;

export default function RowItem({ row, sectionId, index, ...rest }) {
  const [pointerDir, setPointerDir] = useState('');
  const $ref = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM],
    canDrop(item) {
      const { path } = item;
      // 同一行的不能拖拽
      if (!isEmpty(path) && head(path) === index) return false;
      // 标签页内不允子表、标签页、多条列表等拖拽
      if (
        sectionId &&
        (_.includes(['SUB_LIST', 'SECTION', 'RELATION_SEARCH'], item.enumType) ||
          relateOrSectionTab(item.data) ||
          _.get(item, 'data.type') === 34)
      ) {
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
        if (pointerDir === 'right') {
          return { mode: DRAG_MODE.INSERT_TO_ROW_END, rowIndex: index, sectionId, activePath: [index, row.length - 1] };
        }
        // 上下插入整行控件
        return {
          mode: DRAG_MODE.INSERT_NEW_LINE,
          rowIndex: pointerDir === 'top' ? index : index + 1,
          sectionId,
          activePath: [pointerDir === 'top' ? index - 1 : index, 0],
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
          return <DisplayItem key={data.controlId} data={data} path={[index, columnIndex]} {...rest} />;
        })}
      </DisplayRowWrap>
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)}></div>}
    </div>
  );
}
