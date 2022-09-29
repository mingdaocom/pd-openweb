import React, { useEffect, useState, useRef } from 'react';
import { useDrop, useDrag } from 'react-dnd-latest';
import update from 'immutability-helper';
import styled from 'styled-components';
import cx from 'classnames';
import { includes, head, isEmpty, some, pick, get, last, flatten } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { DRAG_ITEMS, WHOLE_SIZE, DRAG_MODE, DRAG_DISTANCE } from '../config/Drag';
import { resetWidgets, getDefaultSizeByData } from '../util';
import { insertNewLine, insertToCol, insertToRowEnd, isFullLineDragItem } from '../util/drag';
import { getPathById, isFullLineControl } from '../util/widgets';
import { getVerifyInfo, isExceedMaxControlLimit } from '../util/setting';
import Components from './components';
import WidgetDisplay from './widgetDisplay';

const DisplayItemWrap = styled.div`
  align-self: stretch;
  position: relative;
  box-sizing: border-box;
  list-style: none;
  padding: 12px;
  min-height: 48px;
  cursor: grab;
  transition: all 0.25s ease-in-out;
  transform: translate3d(0, 0, 0);
  &.isInvalid {
    background-color: rgba(253, 154, 39, 0.12);
  }
  &.isActive,
  &:hover {
    background-color: #f7f7f7;
    .operationWrap {
      visibility: visible;
    }
  }
  &.isActive {
    background-color: rgba(33, 150, 243, 0.15);
  }
  &.isDragging {
    opacity: 0.3;
    background-color: #fff;
  }
  .verticalDragDir {
    position: absolute;
    height: 4px;
    background: #2196f3;
  }
  .drag-top {
    top: -2px;
  }
  .drag-bottom {
    bottom: -2px;
  }
  .horizonDragDir {
    position: absolute;
    top: 0;
    width: 4px;
    height: 100%;
    background: #2196f3;
  }
  .drag-left {
    left: -2px;
  }
  .drag-right {
    right: -2px;
  }

  .contentWrap {
    position: relative;
    border-radius: 3px;
    .nameAndStatus {
      display: flex;
      align-items: center;
      line-height: 18px;
      margin-bottom: 8px;
      .required {
        position: absolute;
        top: 4px;
        left: -8px;
        color: #f44336;
        transition: all 0.25s;
      }
      .iconWrap {
      }
      .typeIcon {
        color: #9e9e9e;
        font-size: 16px;
      }
      .controlName {
        margin-left: 6px;
      }
      .isSplitLine {
        font-size: 15px;
        font-weight: bold;
      }
      &.minHeight18 {
        min-height: 18px;
      }
    }
    .desc {
      color: #9e9e9e;
      margin-top: 8px;
      line-height: 13px;
    }
  }
  .verifyInfo {
    margin-top: 8px;
    color: #fb0038;
  }
`;

export default function DisplayItem(props) {
  const {
    widgets = [],
    activeWidget = {},
    data = {},
    allControls = [],
    fromType,
    status = {},
    setWidgets,
    setActiveWidget,
    handleDataChange,
    globalSheetInfo = {},
    path,
    handleHide,
    queryConfigs = [],
    updateQueryConfigs,
  } = props;
  const { type, controlId, dataSource, sourceControlId } = data;
  const { worksheetId: globalSheetId } = globalSheetInfo;
  const size = data.size || WHOLE_SIZE;
  const [row, col] = path;

  const $ref = useRef(null);
  const [location, setLocation] = useState('');

  const onChange = obj => {
    handleDataChange(controlId, { ...data, ...obj });
  };

  // 判断是否能同级拖拽,
  const isCanDragSameRow = item => {
    if (item.type === DRAG_ITEMS.DISPLAY_ITEM) {
      if (item.id === controlId) return false;

      // 如果拖拽元素本身是独占一行控件则不能拖
      if (isFullLineControl(item.data)) return false;
    }

    const rowItem = widgets[row];
    const currentRow = head(item.path);

    // 拖拽到其他行如果已经有三个以上也不能拖
    if (row !== currentRow && rowItem.length > 3) return false;

    // 如果是独占一行控件不能拖
    if (some(rowItem, widget => isFullLineControl(widget))) return false;
    return true;
  };

  const [dragCollectProps, drag] = useDrag({
    item: { type: DRAG_ITEMS.DISPLAY_ITEM, id: controlId, path, data },
    end(item, monitor) {
      if (!monitor.didDrop()) return;
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      const { mode, rowIndex, path: dropPath, location } = dropResult;
      // 插入新行
      if (mode === DRAG_MODE.INSERT_NEW_LINE) {
        setWidgets(insertNewLine({ widgets, srcItem: data, srcPath: path, targetIndex: rowIndex }));
        setActiveWidget({ ...data, size: getDefaultSizeByData(data) });
      }

      // 拖到行的末尾
      if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
        setWidgets(insertToRowEnd({ widgets, srcItem: data, srcPath: path, targetIndex: rowIndex }));
        setActiveWidget({ ...data, size: WHOLE_SIZE / (widgets[rowIndex].length + 1) });
      }

      // 行内拖拽
      if (mode === DRAG_MODE.INSERT_TO_COL) {
        setWidgets(insertToCol({ widgets, dropPath, location, srcPath: path, srcItem: data }));
        setActiveWidget({ ...data, size: WHOLE_SIZE / (widgets[dropPath[0]].length + 1) });
      }
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
  });
  const [{ isOver }, drop] = useDrop({
    accept: [DRAG_ITEMS.DISPLAY_ITEM, DRAG_ITEMS.LIST_ITEM],
    hover(item, monitor) {
      if (item.id === controlId || !$ref.current) return;
      const { left, width, height, top, bottom } = $ref.current.getBoundingClientRect() || {};
      const { x: clientX, y: clientY } = monitor.getClientOffset();
      let nextLocation = '';

      // 整行控件 或者同级无位置可放的 只能放在当前行的前后
      if (!isCanDragSameRow(item) || isFullLineDragItem(item)) {
        if (clientY - top < height / 2) nextLocation = 'top';
        if (clientY - top > height / 2) nextLocation = 'bottom';
        if (location !== nextLocation) {
          setLocation(nextLocation);
        }
        return;
      }
      // 判断拖拽的方向 垂直方向优先
      if (clientX - left < width / 2) nextLocation = 'left';
      if (clientX - left > width / 2) nextLocation = 'right';
      if (clientY - top < DRAG_DISTANCE.VERTICAL) nextLocation = 'top';
      if (clientY - bottom > DRAG_DISTANCE.VERTICAL) nextLocation = 'bottom';
      if (location !== nextLocation) {
        setLocation(nextLocation);
      }
    },
    drop(item, monitor) {
      if (!location) return;
      if (includes(['left', 'right'], location)) {
        return { mode: DRAG_MODE.INSERT_TO_COL, path, location };
      }
      return { mode: DRAG_MODE.INSERT_NEW_LINE, rowIndex: location === 'top' ? path[0] : path[0] + 1 };
    },
    collect(monitor) {
      return { isOver: monitor.isOver() };
    },
  });

  const { isDragging } = dragCollectProps;

  const width = `${(size * 100) / WHOLE_SIZE}%`;

  const isActive = data.controlId === activeWidget.controlId;

  const { isValid } = getVerifyInfo(data, { controls: allControls });

  // 非激活状态或保存后校验字段是否配置正常
  const isInvalid = !isValid && !isActive;

  drop(drag($ref));

  const dirLocation = isOver ? location : '';

  const getDirStyle = () => {
    const $wrapDom =
      fromType === 'public'
        ? document.querySelector('.publicWorksheetForm')
        : document.getElementById('widgetConfigDisplayArea');

    const { left, width: wrapWidth } = $wrapDom.getBoundingClientRect();
    const { left: itemLeft } = $ref.current.getBoundingClientRect();
    // 拖拽指示线宽度是外部容器宽度 减去容器左右的padding20
    const dragLineWidth = wrapWidth - 40;

    // 拖拽指示线的左侧偏移为 控件的left - 容器的left - 容器左侧padding20
    return { width: dragLineWidth, left: -(itemLeft - left - 20) };
  };

  const handleOperate = (mode, option = {}) => {
    const deleteWidgetById = ({ widgets, controlId, path }) => {
      const [row, col] = path;
      if (activeWidget.controlId === controlId) {
        let nextActiveWidget = {};
        // 如果删除的是最后一个控件
        if (row === widgets.length - 1 && col === widgets[row].length - 1) {
          nextActiveWidget = col > 0 ? get(widgets, [row, col - 1]) : last(widgets[row - 1]);
        } else {
          nextActiveWidget = col >= widgets[row].length - 1 ? head(widgets[row + 1]) : get(widgets, [row, col + 1]);
        }
        setActiveWidget(nextActiveWidget);
      }

      // 如果当前行只有一个控件 直接删掉当前行
      if (widgets[row].length < 2) {
        return update(widgets, { $splice: [[row, 1]] });
      }
      // 删掉当前控件 并重新设置其他控件size
      return update(widgets, {
        [row]: {
          $apply: items => {
            const nextItems = update(items, { $splice: [[col, 1]] });
            return nextItems.map(item => ({
              ...item,
              size: nextItems.length > 1 ? WHOLE_SIZE / nextItems.length : getDefaultSizeByData(item),
            }));
          },
        },
      });
    };

    if (mode === 'copy') {
      const newWidget = { ...data, attribute: 0, controlId: uuidv4(), alias: '' };
      if (isExceedMaxControlLimit(allControls)) return;
      setActiveWidget(newWidget);
      setWidgets(update(widgets, { $splice: [[row + 1, 0, [newWidget]]] }));
      const curentQuery = _.find(queryConfigs, item => item.controlId === data.controlId) || {};
      updateQueryConfigs({ ...curentQuery, id: `${uuidv4()}_new`, controlId: newWidget.controlId });
      return;
    }
    if (mode === 'setAsTitle') {
      // 将其他标题控件清空
      const newWidgets = resetWidgets(widgets, { attribute: 0 });
      setWidgets(update(newWidgets, { [row]: { [col]: { $apply: item => ({ ...item, attribute: 1 }) } } }));
      setActiveWidget({ ...activeWidget, attribute: 1 });
      return;
    }

    if (mode === 'delete') {
      if (allControls.length < 2) {
        alert(_l('最少需要保留一个控件'));
        return;
      }
      // 如果是关联本表 则要删除对应的控件
      if (type === 29 && dataSource === globalSheetId) {
        const nextWidgets = deleteWidgetById({ widgets, controlId, path });
        const currentRelatePath = getPathById(nextWidgets, sourceControlId);
        // 如果父子关联控件找不到 则直接删除当前控件
        if (!Array.isArray(currentRelatePath) || currentRelatePath.length < 1) {
          setWidgets(nextWidgets);
          return;
        }
        setWidgets(
          deleteWidgetById({
            widgets: nextWidgets,
            controlId: sourceControlId,
            path: currentRelatePath,
          }),
        );
        return;
      }
      setWidgets(deleteWidgetById({ widgets, controlId, path }));
      updateQueryConfigs({ controlId }, 'delete');
      return;
    }
    if (mode === 'hide') {
      handleHide(controlId);
    }
  };

  return (
    <DisplayItemWrap
      ref={$ref}
      id={`widget-${controlId}`}
      style={{ width }}
      className={cx({
        isActive,
        isDragging,
        isInvalid,
      })}
      onClick={() => setActiveWidget(data)}
    >
      {!isDragging && (
        <Components.WidgetOperation
          {...pick(props, ['fromType', 'data', 'globalSheetInfo'])}
          parentRef={$ref}
          isActive={isActive}
          handleOperate={handleOperate}
          onChange={onChange}
        />
      )}
      {['top', 'bottom'].includes(dirLocation) && (
        <div className={`verticalDragDir drag-${dirLocation}`} style={getDirStyle()}></div>
      )}
      {['left', 'right'].includes(dirLocation) && <div className={`horizonDragDir drag-${dirLocation}`}></div>}
      <WidgetDisplay {...props} />
    </DisplayItemWrap>
  );
}
