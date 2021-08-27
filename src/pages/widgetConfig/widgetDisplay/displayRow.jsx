import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { ScrollView } from 'ming-ui';
import { head, isEmpty } from 'lodash';
import { useDrop } from 'react-dnd-latest';
import DisplayItem from './displayItem';
import { DRAG_ITEMS, DRAG_MODE } from '../config/Drag';
import Components from './components';
import { isFullLineDragItem } from '../util/drag';

const DisplayRowListWrap = styled.div`
  flex: 1;
  .rowsWrap {
    padding: 12px 20px 80px 20px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .displayRow {
    position: relative;
  }
  .controlNum {
    margin-left: 12px;
    border-bottom: 1px solid transparent;
    &:hover {
      border-bottom: 1px dashed currentColor;
    }
  }
  .insertPointer {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 4px;
    background: #2196f3;
    &.top,
    &.bottom {
      width: 100%;
      top: -2px;
      left: 0;
      height: 4px;
    }
    &.bottom {
      top: auto;
      bottom: -2px;
    }
  }
`;

const DisplayRowWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
`;

function RowItem({ row, index, ...rest }) {
  const [pointerDir, setPointerDir] = useState('');
  const $ref = useRef(null);
  const [{ isOver }, drop] = useDrop({
    accept: [DRAG_ITEMS.LIST_ITEM, DRAG_ITEMS.DISPLAY_ITEM],
    canDrop(item) {
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
          setPointerDir('right');
        }
      }
    },
    drop(item, monitor) {
      if (monitor.isOver({ shallow: true })) {
        if (!pointerDir) return;
        if (pointerDir === 'right') {
          return { mode: DRAG_MODE.INSERT_TO_ROW_END, rowIndex: index };
        }
        // 上下插入整行控件
        return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex: pointerDir === 'top' ? index : index + 1 };
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
        {row.map((data, columnIndex) => (
          <DisplayItem key={data.controlId} data={data} path={[index, columnIndex]} {...rest} />
        ))}
      </DisplayRowWrap>
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)}></div>}
    </div>
  );
}

export default function DisplayRow(props) {
  const { allControls, widgets, fromType } = props;
  const rowsContent = (
    <div className="rowsWrap">
      {widgets.map((row, index) => {
        const id = row.reduce((p, c) => p + c.controlId, '');
        return !isEmpty(row) && <RowItem key={id} row={row} index={index} {...props} />;
      })}
      <Components.BottomDragPointer rowIndex={widgets.length} />
    </div>
  );
  return (
    <DisplayRowListWrap>
      {fromType === 'public' ? (
        rowsContent
      ) : (
        <ScrollView id="widgetDisplayWrap">
          <header>
            <p>
              <span>{_l('表单设计')}</span>
              <span className="controlNum Font12 Gray_9e" data-tip={_l('最多添加200个字段')}>
                {_l('%0/200', allControls.length)}
              </span>
            </p>
            {!isEmpty(widgets) && <Components.QuickArrange {...props} />}
          </header>
          {rowsContent}
        </ScrollView>
      )}
    </DisplayRowListWrap>
  );
}
