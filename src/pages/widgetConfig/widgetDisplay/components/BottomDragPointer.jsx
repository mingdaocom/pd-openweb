import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import styled from 'styled-components';
import cx from 'classnames';
import { DRAG_ITEMS, DRAG_MODE } from '../../config/Drag';
import { EmptyControl } from '../../widgetSetting/components/SectionConfig/style';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  ${props => (props.height ? `min-height:${props.height}px;` : '')}
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

export default function BottomDragPointer(props) {
  const { rowIndex, displayItemType, showEmpty, sectionId, height } = props;
  const ref = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept:
      displayItemType === 'relate' ? [DRAG_ITEMS.DISPLAY_ITEM_RELATE] : [DRAG_ITEMS.DISPLAY_ITEM, DRAG_ITEMS.LIST_ITEM],
    canDrop(item, monitor) {
      // 分段禁止多层嵌套
      if (sectionId && item.widgetType === 52) return false;

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
    <DragPointer ref={ref} className={cx({ isOver })} height={height}>
      <div className="line"></div>
      {showEmpty && (
        <EmptyControl>
          <div className="emptyText">{_l('将字段拖拽到这里添加')}</div>
        </EmptyControl>
      )}
    </DragPointer>
  );
}
