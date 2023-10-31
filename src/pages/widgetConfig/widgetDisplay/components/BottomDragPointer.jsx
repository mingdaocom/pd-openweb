import React, { useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import styled from 'styled-components';
import cx from 'classnames';
import { DRAG_ITEMS, DRAG_MODE } from '../../config/Drag';
import { relateOrSectionTab } from '../../util';
import { EmptyControl } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/style';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  min-height: 20px;
  min-width: 20px;
  .line {
    margin-top: 0px;
    height: 4px;
  }
  &.isOver {
    .line {
      background-color: #2196f3;
    }
  }
`;

export default function BottomDragPointer({ rowIndex, displayItemType, showEmpty, sectionId }) {
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept:
      displayItemType === 'tab'
        ? [DRAG_ITEMS.LIST_TAB, DRAG_ITEMS.DISPLAY_TAB]
        : [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM],
    canDrop(item, monitor) {
      // 标签页内不允许子表、标签页、多条列表等拖拽
      if (
        sectionId &&
        (_.includes(['SUB_LIST', 'SECTION', 'RELATION_SEARCH'], item.enumType) ||
          relateOrSectionTab(item.data) ||
          _.get(item, 'data.type') === 34)
      )
        return false;

      return true;
    },
    drop(item) {
      return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex, sectionId: sectionId || '' };
    },
    collect(monitor) {
      return { isOver: monitor.canDrop() && monitor.isOver({ shallow: true }) };
    },
  });

  drop(ref);
  return (
    <DragPointer ref={ref} className={cx({ isOver, canDrop })}>
      {showEmpty ? (
        <EmptyControl>
          <div className="line"></div>
          <div className="emptyText">{_l('将字段拖拽到这里添加')}</div>
        </EmptyControl>
      ) : (
        <div className="line"></div>
      )}
    </DragPointer>
  );
}
