import React, { useState, useRef, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd-latest';
import update from 'immutability-helper';
import styled from 'styled-components';
import cx from 'classnames';
import _, { includes, head, some, pick, get, last, isEmpty, find, flatten } from 'lodash';
import { DRAG_ITEMS, WHOLE_SIZE, DRAG_MODE, DRAG_DISTANCE, DRAG_ACCEPT } from '../config/Drag';
import {
  resetWidgets,
  getDefaultSizeByData,
  notInsetSectionTab,
  putControlByOrder,
  genWidgetRowAndCol,
  isTabSheetList,
} from '../util';
import { insertNewLine, insertToCol, insertToRowEnd, isFullLineDragItem, batchRemoveItems } from '../util/drag';
import { getPathById, isFullLineControl } from '../util/widgets';
import { getVerifyInfo, handleAdvancedSettingChange } from '../util/setting';
import { batchCopyWidgets, deleteSection, batchShiftWidgets, handleAddWidgets } from '../util/data';
import WidgetOperation from './components/WidgetOperation';
import WidgetDisplay from './widgetDisplay';
import { SUPPORT_RELATE_SEARCH } from '../config';

const DisplayItemWrap = styled.div`
  align-self: stretch;
  position: relative;
  box-sizing: border-box;
  list-style: none;
  ${props => (props.isTab ? '' : 'padding: 8px 12px;')}
  min-height: 48px;
  cursor: grab;
  transition: box-shadow 0.25s ease-in-out;
  transform: translate3d(0, 0, 0);
  margin-top: ${props => (props.row && !props.isTab ? '2px' : '')};
  margin-left: ${props => (props.col ? '4px' : '')};
  &.isInvalid {
    background-color: rgba(253, 154, 39, 0.12);
  }
  &.isActive,
  &:hover {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.15);
    background-color: #fff;
    border-radius: 5px;
    & > div:nth-child(1) > .operationWrap {
      visibility: visible;
    }
  }
  &.isActive {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 1);
  }
  &.isBatchActive {
    box-shadow: 0 0 0 2px #3c3c3c !important;
  }
  &.isDragging {
    opacity: 0.4;
    background-color: #fff;
  }
  .verticalDragDir {
    position: absolute;
    height: 4px;
    background: #2196f3;
  }
  .drag-top,
  .drag-view_top {
    top: ${props => (props.isTab ? '-8px' : '-2px')};
  }
  .drag-bottom {
    bottom: ${props => (props.isTab ? '-8px' : '-2px')};
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
    setWidgets,
    setActiveWidget,
    handleDataChange,
    globalSheetInfo = {},
    path,
    handleHide,
    displayItemType,
    batchActive = [],
    setBatchActive = () => {},
    setStyleInfo = () => {},
    batchDrag,
    setBatchDrag = () => {},
    styleInfo = {},
  } = props;
  const { type, controlId, dataSource, sourceControlId } = data;
  const { titlestorage } = styleInfo.info || {};
  const { worksheetId: globalSheetId } = globalSheetInfo;
  const size = data.size || WHOLE_SIZE;
  const [row, col] = path;
  const isTab = displayItemType === 'tab';

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
    if (row !== currentRow && (rowItem || []).length > 3) return false;

    // 如果是独占一行控件不能拖
    if (some(rowItem, widget => isFullLineControl(widget))) return false;
    return true;
  };

  const [dragCollectProps, drag] = useDrag({
    item: {
      type: isTab ? (data.type === 52 ? DRAG_ITEMS.DISPLAY_TAB : DRAG_ITEMS.DISPLAY_LIST_TAB) : DRAG_ITEMS.DISPLAY_ITEM,
      id: controlId,
      path,
      data,
      widgetType: data.type,
    },
    end(item, monitor) {
      if (!monitor.didDrop()) return;
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      const { mode, rowIndex, path: dropPath, location, sectionId, activePath } = dropResult;

      // 批量拖拽
      if (batchActive.length > 0 && batchDrag) {
        const filterBatchWidgets = batchActive
          .filter(i => !(notInsetSectionTab(i) && sectionId))
          .map(i => {
            const tempData = { ...i, sectionId };
            return isTabSheetList(tempData) && dropResult.displayItemType === 'common'
              ? handleAdvancedSettingChange(tempData, { showtype: '5' })
              : tempData;
          });
        // 先移除需要批量拖拽到元素
        const filterOldWidgets = batchRemoveItems(widgets, filterBatchWidgets);
        // 批量拖拽走批量新增逻辑，定位新的activeWidget进行批量操作
        // activePath[0]小于0，拖拽到头部
        if (activePath[0] < 0) {
          const newWidgets = putControlByOrder(filterBatchWidgets).concat(filterOldWidgets);
          setWidgets(genWidgetRowAndCol(newWidgets));
          setActiveWidget(last(filterBatchWidgets));
        } else {
          const [batchRow, batchCol] = activePath;
          const newActiveWidget = widgets[batchRow][batchCol];
          handleAddWidgets(
            filterBatchWidgets,
            { activePath },
            {
              widgets: filterOldWidgets,
              activeWidget: newActiveWidget,
              allControls: flatten(filterOldWidgets),
              setWidgets,
              setActiveWidget,
            },
          );
        }
        setBatchDrag(false);
        return;
      }

      const newData = { ...data, sectionId };
      // 插入新行
      if (mode === DRAG_MODE.INSERT_NEW_LINE) {
        // 标签页表格拖拽到普通控件中，更改showtype
        const formatData =
          isTabSheetList(newData) && dropResult.displayItemType === 'common'
            ? handleAdvancedSettingChange(newData, { showtype: '5' })
            : newData;

        setWidgets(insertNewLine({ widgets, srcItem: formatData, srcPath: path, targetIndex: rowIndex }));
        setActiveWidget(formatData);
      }

      // 拖到行的末尾
      if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
        setWidgets(insertToRowEnd({ widgets, srcItem: newData, srcPath: path, targetIndex: rowIndex }));
        setActiveWidget({ ...newData, size: WHOLE_SIZE / (widgets[rowIndex].length + 1) });
      }

      // 行内拖拽
      if (mode === DRAG_MODE.INSERT_TO_COL) {
        setWidgets(insertToCol({ widgets, dropPath, location, srcPath: path, srcItem: newData }));
        setActiveWidget({ ...newData, size: WHOLE_SIZE / (widgets[dropPath[0]].length + 1) });
      }
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
  });
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_ACCEPT[displayItemType],
    canDrop(item) {
      // 标签页内不允许标签页、多条列表(旧)、标签页表格等拖拽
      if (data.sectionId && (_.includes(['SECTION'], item.enumType) || notInsetSectionTab(item.data))) {
        return false;
      }
      // 批量拖拽，当前拖拽物在批量选中区域内
      if (batchDrag && _.find(batchActive, i => i.controlId === controlId)) return false;
      return true;
    },
    hover(item, monitor) {
      if (item.id === controlId || !$ref.current) return;
      const { left, width, height, top, bottom } = $ref.current.getBoundingClientRect() || {};
      const { x: clientX, y: clientY } = monitor.getClientOffset();
      let nextLocation = '';

      const $contentWrap = document.getElementById('widgetDisplayWrap');
      const $scrollWrap = $contentWrap && $contentWrap.querySelector('.nano-content');

      if ($scrollWrap) {
        if (clientY - height <= 0) {
          if ($scrollWrap.scrollTop <= height / 2) return;
          $scrollWrap.scrollTo({
            top: clientY - height <= -30 ? 0 : $scrollWrap.scrollTop - 5 * height,
            behavior: 'smooth',
          });
        } else if (clientY >= $scrollWrap.clientHeight - DRAG_DISTANCE.VERTICAL) {
          if ($scrollWrap.scrollHeight - $scrollWrap.scrollTop - $scrollWrap.clientHeight <= height / 2) return;
          $scrollWrap.scrollTo({
            top:
              clientY - $scrollWrap.clientHeight > 30
                ? $scrollWrap.scrollHeight - $scrollWrap.clientHeight
                : $scrollWrap.scrollTop + 6 * height,
            behavior: 'smooth',
          });
        }
      }

      if (isOver) {
        // 整行控件 或者同级无位置可放的 只能放在当前行的前后
        if (!isCanDragSameRow(item) || isFullLineDragItem(item)) {
          // 区分分段与分段内高亮线
          if (type === 52) {
            if (clientY - top < height / 2) nextLocation = 'view_top';
            if (location !== nextLocation) {
              setLocation(nextLocation);
            }
            return;
          }
          if (clientY - top < height / 2) nextLocation = 'top';
          if (clientY - top > height / 2) nextLocation = 'bottom';
          if (location !== nextLocation) {
            setLocation(nextLocation);
          }
          return;
        }

        // 判断拖拽的方向 垂直方向优先
        // 左右高亮只有非整行控件能出现
        if (!isFullLineControl(item.data)) {
          if (clientX - left < width / 2) nextLocation = 'left';
          if (clientX - left > width / 2) nextLocation = 'right';
        }
        if (clientY - top < DRAG_DISTANCE.VERTICAL) nextLocation = 'top';
        if (clientY - bottom > DRAG_DISTANCE.VERTICAL) nextLocation = 'bottom';
        if (location !== nextLocation) {
          setLocation(nextLocation);
        }
      }
    },
    drop(item, monitor) {
      if (!location) return;
      const sectionId = type === 52 && !_.includes(['view_top'], location) ? controlId : data.sectionId || '';

      if (includes(['left', 'right'], location)) {
        return { mode: DRAG_MODE.INSERT_TO_COL, path, location, sectionId, activePath: path };
      }

      return {
        mode: DRAG_MODE.INSERT_NEW_LINE,
        activePath: [_.includes(['view_top', 'top'], location) ? path[0] - 1 : path[0], path[1]],
        rowIndex: _.includes(['view_top', 'top'], location) ? path[0] : path[0] + 1,
        sectionId,
        displayItemType,
      };
    },
    collect(monitor) {
      return { isOver: monitor.isOver({ shallow: true }) && monitor.canDrop() };
    },
  });

  const { isDragging } = dragCollectProps;

  useEffect(() => {
    if (batchActive.length > 0 && _.find(batchActive, b => b.controlId === data.controlId)) {
      if (isDragging) {
        setBatchDrag(true);
      } else {
        setBatchDrag(false);
      }
    }
  }, [isDragging]);

  const width = `${(size * 100) / WHOLE_SIZE}%`;

  const isBatchActive = !!find(batchActive, i => i.controlId === data.controlId);

  const isActive = data.controlId === activeWidget.controlId || isBatchActive;

  const isBatchDrag = isBatchActive && batchDrag;

  const { isValid } = getVerifyInfo(data, { controls: allControls });

  // 非激活状态或保存后校验字段是否配置正常
  const isInvalid = !isValid && !(isActive || isBatchActive);

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
          // 下一个激活控件非同源标签页，清空激活控件，防止删除控件引起标签页切换
          const nextWidget = head(widgets[row + 1]);
          nextActiveWidget =
            col >= (widgets[row] || []).length - 1
              ? _.get(nextWidget, 'sectionId') === activeWidget.sectionId
                ? nextWidget
                : ''
              : get(widgets, [row, col + 1]);
        }
        setActiveWidget(nextActiveWidget);
      }

      // 如果当前行只有一个控件 直接删掉当前行
      if (_.get(widgets[row], 'length') < 2) {
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
      batchCopyWidgets(props, [data]);
      return;
    }
    if (mode === 'setAsTitle') {
      // 将其他标题控件清空
      const newWidgets = resetWidgets(widgets, { attribute: 0 });
      setWidgets(update(newWidgets, { [row]: { [col]: { $apply: item => ({ ...item, attribute: 1 }) } } }));
      setActiveWidget({ ...(_.isEmpty(activeWidget) ? data : activeWidget), attribute: 1 });
      if (!_.includes(SUPPORT_RELATE_SEARCH, data.type) && titlestorage !== '0') {
        setStyleInfo({ info: { ...styleInfo.info, titlestorage: '0' } });
      }
      return;
    }

    if (mode === 'delete') {
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

      if (type === 52) {
        deleteSection({ widgets, data }, props);
        return;
      }
      setWidgets(deleteWidgetById({ widgets, controlId, path }));
      return;
    }
    if (mode === 'hide') {
      handleHide(controlId);
    }
    if (mode === 'batch') {
      // 批量操作连选暂不支持选标签页本身
      if (data.type === 52) return;
      if (batchActive.length > 0) {
        // 区域连选
        if (option.shiftKey) {
          batchShiftWidgets(props);
        } else {
          const newBatchData = find(batchActive || [], b => b.controlId === controlId)
            ? batchActive.filter(b => b.controlId !== controlId)
            : batchActive.concat(data);
          setBatchActive(newBatchData);
        }
      } else {
        setActiveWidget({});
        setBatchActive([data]);
      }
      setStyleInfo({ activeStatus: false });
    }
  };

  return (
    <DisplayItemWrap
      ref={$ref}
      id={`widget-${controlId}`}
      style={{ width }}
      row={row}
      col={col}
      isTab={isTab}
      className={cx({
        isActive,
        isDragging: isDragging || isBatchDrag,
        isBatchActive,
        isInvalid,
      })}
      onClick={e => {
        e.stopPropagation();

        const { shiftKey } = e;
        if (batchActive.length > 0) {
          // 区域连选
          if (shiftKey) {
            batchShiftWidgets(props);
            return;
          }
          handleOperate('batch');
          return;
        }

        setActiveWidget(data);
      }}
    >
      {!(isDragging || isBatchDrag) && (
        <WidgetOperation
          {...pick(props, ['fromType', 'data', 'globalSheetInfo'])}
          parentRef={$ref}
          batchMode={batchActive.length > 0}
          isBatchActive={isBatchActive}
          handleOperate={handleOperate}
          onChange={onChange}
        />
      )}
      {['top', 'bottom', 'view_top'].includes(dirLocation) && (
        <div className={`verticalDragDir drag-${dirLocation}`} style={getDirStyle()}></div>
      )}
      {['left', 'right'].includes(dirLocation) && <div className={`horizonDragDir drag-${dirLocation}`}></div>}
      <WidgetDisplay {...props} isTab={isTab} />
    </DisplayItemWrap>
  );
}
