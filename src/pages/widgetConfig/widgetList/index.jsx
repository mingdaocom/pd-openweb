import React from 'react';
import styled from 'styled-components';
import update from 'immutability-helper';
import { ScrollView } from 'ming-ui';
import DraggableItem from './draggableItem';
import { WIDGET_GROUP_TYPE } from '../config/widget';
import { DRAG_MODE, WHOLE_SIZE } from '../config/Drag';
import { isExceedMaxControlLimit } from '../util/setting';
import ListItemLayer from './ListItemLayer';
import { insertControlInSameLine } from '../util/drag';
import { adjustControlSize } from '../util';
import { getPathById, isHaveGap } from '../util/widgets';
import { head, isEmpty, last } from 'lodash';

const WidgetList = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: auto;
  background-color: #f5f5f9;
  .groupList {
    padding: 0 20px;
    padding-bottom: 40px;
  }
  .group {
    margin-top: 16px;
    .title {
      font-weight: 700;
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-top: 12px;
    }
  }
  .widgetLi {
    display: flex;
    width: 48%;
    min-height: 36px;
    box-sizing: border-box;
    margin-bottom: 12px;
    padding-left: 12px;
    list-style: none;
    position: relative;
    background-color: #fff;
    border: 1px solid transparent;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    &:hover,
    &.active {
      color: #2196f3;
      background-color: #f0f8ff;
      .widgetItem i {
        color: #2196f3;
      }
    }
    .widgetItem {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      padding: 0;
      cursor: pointer;
      span {
        line-height: 12px;
        flex-grow: 0;
        padding-right: 12px;
        word-break: break-all;
      }
      i {
        flex-shrink: 0;
        font-size: 16px;
        width: 25px;
        display: inline-block;
        color: #9e9e9e;
      }
    }
  }
`;

export default function List(props) {
  const { widgets, activeWidget, allControls, setWidgets, setActiveWidget } = props;

  // 如果新增控件在可视区外则滚动至可视区内
  const scrollToVisibleRange = data => {
    const $contentWrap = document.getElementById('widgetDisplayWrap');
    const $activeWidget = document.getElementById(`widget-${(activeWidget || {}).controlId}`);
    if (!$contentWrap || !$activeWidget) return;
    const rect = $activeWidget.getBoundingClientRect();
    // 如果在可视区外
    if (rect.top < 0 || rect.top > $contentWrap.offsetHeight) {
      const $scrollWrap = $contentWrap.querySelector('.nano-content');
      if ($scrollWrap) {
        setTimeout(() => {
          const $widget = document.getElementById(`widget-${data.controlId}`);
          if (!$widget) return;
          const { top, height } = $widget.getBoundingClientRect();
          $scrollWrap.scrollTop = $scrollWrap.scrollTop + top - height;
        }, 0);
      }
    }
  };

  const handleAdd = (data, para) => {
    const { mode, path, location, rowIndex } = para;
    if (isExceedMaxControlLimit(allControls)) {
      alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'));
      return;
    }

    // 如果当前控件列表为空 直接添加
    if (isEmpty(widgets)) {
      setWidgets(update(widgets, { $push: [[data]] }));
      setActiveWidget(data);
      return;
    }

    // 拖拽添加的情况
    if (mode) {
      // 拖到单独的行
      if (mode === DRAG_MODE.INSERT_NEW_LINE) {
        setWidgets(update(widgets, { $splice: [[rowIndex, 0, [data]]] }));
        setActiveWidget(data);
        return;
      }
      // 拖到行的末尾
      if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
        setWidgets(
          update(widgets, {
            [rowIndex]: {
              $apply: item => {
                const nextRow = item.concat(data);
                return nextRow.map(value => ({ ...value, size: WHOLE_SIZE / nextRow.length }));
              },
            },
          }),
        );
        setActiveWidget(adjustControlSize(widgets[rowIndex], data));
        return;
      }

      if (mode === DRAG_MODE.INSERT_TO_COL) {
        setWidgets(insertControlInSameLine({ widgets, location, dropPath: path, srcItem: data }));
        setActiveWidget(adjustControlSize(widgets[path[0]], data));
        return;
      }
    }

    let currentRowIndex = 0;

    // 没有激活控件或者激活的控件不存在 则直接添加在最后一行
    if (isEmpty(activeWidget) || allControls.findIndex(item => item.controlId === activeWidget.controlId) < 0) {
      currentRowIndex = widgets.length - 1;
    } else {
      currentRowIndex = head(getPathById(widgets, activeWidget.controlId));
    }

    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (isHaveGap(widgets[currentRowIndex], data)) {
      setWidgets(update(widgets, { [currentRowIndex]: { $push: [data] } }));
    } else {
      setWidgets(update(widgets, { $splice: [[currentRowIndex + 1, 0, [data]]] }));
    }

    setActiveWidget(data);
    scrollToVisibleRange(data);
  };

  return (
    <WidgetList>
      <ListItemLayer />
      <ScrollView>
        <div className="groupList">
          {_.keys(WIDGET_GROUP_TYPE).map(group => {
            const { widgets, title } = WIDGET_GROUP_TYPE[group];
            return (
              <div key={group} className="group">
                <div className="title">{title}</div>
                <ul>
                  {_.keys(widgets).map(key => (
                    <DraggableItem
                      key={key}
                      item={{ ...widgets[key], enumType: key }}
                      addWidget={handleAdd}
                      {...props}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ScrollView>
    </WidgetList>
  );
}
