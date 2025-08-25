import React, { useRef } from 'react';
import { useDrop } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { EmptyControl } from 'src/pages/widgetConfig/widgetSetting/components/SplitLineConfig/style';
import { DRAG_ACCEPT, DRAG_MODE } from '../../config/Drag';
import { notInsetSectionTab } from '../../util';

const DragPointer = styled.div`
  flex: 1;
  width: 100%;
  overflow: hidden;
  min-height: 40px;
  min-width: 20px;
  .line {
    margin-top: 0px;
    height: 4px;
  }
  &.isOver {
    .line {
      background-color: #1677ff;
    }
  }
`;

export default function BottomDragPointer({ rowIndex, displayItemType, showEmpty, sectionId }) {
  const ref = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_ACCEPT[displayItemType],
    canDrop(item) {
      // 标签页内不允许标签页、多条列表(旧)等拖拽
      if (sectionId && (_.includes(['SECTION'], item.enumType) || notInsetSectionTab(item.data))) return false;

      return true;
    },
    drop() {
      return {
        mode: DRAG_MODE.INSERT_NEW_LINE,
        displayItemType,
        rowIndex,
        sectionId: sectionId || '',
        activePath: [rowIndex - 1, 0],
      };
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
