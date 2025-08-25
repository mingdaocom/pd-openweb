import React, { useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import styled from 'styled-components';
import { DRAG_ACCEPT, DRAG_MODE } from '../../config/Drag';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  height: 48px;
  overflow: hidden;
  .line {
    width: 4px;
    height: 100%;
  }
  &.isOver {
    .line {
      background-color: #1677ff;
    }
  }
`;

export default function RightDragPointer({ rowIndex }) {
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_ACCEPT.tab,
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
