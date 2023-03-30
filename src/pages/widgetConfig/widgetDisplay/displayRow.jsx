import React, { Fragment, useRef, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { ScrollView } from 'ming-ui';
import { head, isEmpty } from 'lodash';
import { useDrop } from 'react-dnd-latest';
import DisplayItem from './displayItem';
import { DRAG_ITEMS, DRAG_MODE } from '../config/Drag';
import Components from './components';
import { isFullLineDragItem } from '../util/drag';
import { MAX_CONTROLS_COUNT } from '../config';

const DisplayRowListWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  .rowsWidgetContent {
    flex: 1;
    min-height: 100%;
    padding: 15px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: #f5f5f9;
  }
  .rowsWrap {
    flex: 1;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 16px 1px;
    padding: 8px;
    box-sizing: border-box;
    background: #ffffff;
    display: flex;
    flex-direction: column;
  }
  .displayHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
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
      {isOver && pointerDir && <div className={cx('insertPointer', pointerDir)} />}
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
        <ScrollView id="widgetDisplayWrap" className="flex flexColumn">
          <div className="rowsWidgetContent">
            <div className="displayHeader">
              <div className="pLeft12">
                <span className="Font17 Bold">{_l('表单设计')}</span>
                <span className="controlNum Font12 Gray_9e" data-tip={_l('最多添加%0个字段', MAX_CONTROLS_COUNT)}>
                  {_l('%0/%1', allControls.length, MAX_CONTROLS_COUNT)}
                </span>
              </div>
              {!isEmpty(widgets) && (
                <div className="flexRow">
                  <Components.WidgetStyle {...props} />
                  <Components.FieldRecycleBin {...props} />
                </div>
              )}
            </div>
            {rowsContent}
          </div>
        </ScrollView>
      )}
    </DisplayRowListWrap>
  );
}
