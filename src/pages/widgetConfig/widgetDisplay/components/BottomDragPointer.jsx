import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import styled from 'styled-components';
import cx from 'classnames';
import { DRAG_ITEMS, DRAG_MODE } from '../../config/Drag';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
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

export default function BottomDragPointer({ rowIndex }) {
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM],
    drop() {
      return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex };
    },

    collect(monitor) {
      return { isOver: monitor.isOver() };
    },
  });

  drop(ref);
  return (
    <DragPointer ref={ref} className={cx({ isOver, canDrop })}>
      <div className="line"></div>
    </DragPointer>
  );
}
