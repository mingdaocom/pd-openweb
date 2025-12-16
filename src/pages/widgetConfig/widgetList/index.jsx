import React, { Fragment, useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { ScrollView, Support } from 'ming-ui';
import {
  batchUpdateWidgetsLayout,
  clearAndSetWidgets,
  handleAddWidgets,
  handleDeleteWidgetsForMingo,
  handleUpdateWidgetsAttribute,
} from 'src/pages/widgetConfig/util/data';
import { emitter, updateGlobalStoreForMingo } from 'src/utils/common';
import { getFeatureStatus } from 'src/utils/project';
import { WIDGET_GROUP_TYPE } from '../config/widget';
import { notInsetSectionTab } from '../util';
import { FixedIcon } from '../widgetDisplay/components/WidgetStyle';
import DraggableItem from './draggableItem';
import ListItemLayer from './ListItemLayer';

const WidgetList = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: auto;
  background-color: #ffffff;
  .groupList {
    padding: 17px 16px 40px 16px;
    .addWidgetCon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        font-size: 17px;
        font-weight: 700;
      }
      .supportBox i {
        margin-left: 8px;
        color: #9e9e9e;
        font-size: 16px !important;
      }
    }
  }
  .group {
    margin-top: 12px;
    .title {
      font-weight: 700;
    }
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 12px;
  }
  .widgetCustom {
    position: relative;
    border: 1px solid transparent !important;
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    background-image: linear-gradient(to bottom, #fff, #fff), linear-gradient(180deg, #6e00ff, #c822eb);
    .widgetItem > span:not(.betaIcon) {
      background: linear-gradient(316deg, #c822eb, #6e00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    &:hover {
      background-image: linear-gradient(to bottom, #faf2fe, #faf2fe), linear-gradient(180deg, #6e00ff, #c822eb);
    }
  }
  .widgetLi {
    display: flex;
    width: 48%;
    min-height: 36px;
    box-sizing: border-box;
    margin-bottom: 12px;
    padding-left: 10px;
    padding-right: 4px;
    list-style: none;
    position: relative;
    background-color: #fff;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    &:hover:not(.widgetCustom),
    &.active {
      background: #f8f8f8;
      border-color: #d5d5d5;
    }
    .betaIcon {
      position: absolute;
      color: #6e00ff !important;
      font-size: 16px;
      top: -6px;
      right: -11px;
      background: #fff;
      font-weight: normal !important;
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
        word-break: break-word;
        color: #757575;
        font-weight: bold;
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
  const cache = useRef({});
  cache.current.props = props;
  const containerRef = useRef(false);
  const {
    globalSheetInfo = {},
    activeWidget = {},
    allControls = [],
    widgetPanelFixed,
    listPanelVisible,
    setPanelVisible = () => {},
  } = props;
  const { hideWorksheetControl = '' } = md.global.SysSettings;

  const handleAdd = (data, para = {}, callback) => {
    let sectionId = '';
    if (para.type === 'click') {
      sectionId = activeWidget.type === 52 ? activeWidget.controlId : activeWidget.sectionId;
    } else {
      sectionId = para.sectionId || '';
    }

    // 标签页、关联多条列表(旧)等不能嵌套
    if (notInsetSectionTab(data)) {
      sectionId = '';
    }

    let newData = {
      ...data,
      sectionId: sectionId,
    };

    handleAddWidgets([newData], para, props, callback);
  };

  const getFeatureType = featureId => {
    return getFeatureStatus(globalSheetInfo.projectId, featureId);
  };

  const clearAndSetWidgetsFromEmitter = (data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    clearAndSetWidgets(data, para, cache.current.props, callback);
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  };

  const handleAddWidgetsFromEmitter = (data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    handleAddWidgets(
      data.map(item => ({ ...item, isMingo: true })),
      {
        ...para,
        isMingo: true,
      },
      cache.current.props,
      ({ newWidgets = [] } = []) => {
        if (para.isStreaming) {
          return;
        }
        batchUpdateWidgetsLayout(
          para.layoutOfAllWidgets,
          {
            ...cache.current.props,
            widgets: newWidgets,
          },
          callback,
        );
      },
    );
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  };

  const handleUpdateWidgetsAttributeFromEmitter = (data, callback) => {
    handleUpdateWidgetsAttribute(data, cache.current.props, callback);
  };

  const handleDeleteWidgetsForMingoFromEmitter = (data, para = {}, callback) => {
    handleDeleteWidgetsForMingo(data, cache.current.props, ({ newWidgets = [] } = []) => {
      batchUpdateWidgetsLayout(
        para.layoutOfAllWidgets,
        {
          ...cache.current.props,
          widgets: newWidgets,
        },
        callback,
      );
    });
  };

  useEffect(() => {
    updateGlobalStoreForMingo('allWidgets', allControls);
  }, [allControls]);

  useEffect(() => {
    emitter.on('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
    emitter.on('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    return () => {
      updateGlobalStoreForMingo('allWidgets', []);
      emitter.off('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
      emitter.off('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    };
  }, []);

  return (
    <WidgetList
      className="WidgetListPanel"
      onMouseLeave={() => {
        if (!widgetPanelFixed && listPanelVisible && !containerRef.current) {
          setPanelVisible({ widgetVisible: false });
        }
      }}
    >
      <ListItemLayer {..._.pick(props, ['listPanelVisible', 'setPanelVisible'])} containerRef={containerRef} />
      <ScrollView>
        <div className="groupList">
          {!md.global.SysSettings.hideAIBasicFun && (
            <Fragment>
              <div className="addWidgetCon">
                <div className="flexCenter">
                  <span className="title">{_l('添加字段')}</span>
                  <Support className="supportBox" type={1} href="https://help.mingdao.com/worksheet/controls" />
                </div>
                <FixedIcon {...props} fixedKey="widgetPanelFixed" />
              </div>
              <div className="mTop12">
                <span className="Gray_75">{_l('点击或拖拽添加')}</span>
              </div>
            </Fragment>
          )}

          {_.keys(WIDGET_GROUP_TYPE).map((group, index) => {
            const { widgets, title } = WIDGET_GROUP_TYPE[group];
            return (
              <div key={group} className={cx('group', !index ? 'mTop20' : '')}>
                <div className="title">{title}</div>
                <ul>
                  {_.keys(widgets).map(key => {
                    const featureType = getFeatureType(widgets[key]['featureId']);
                    if (_.includes(['SEARCH_BTN', 'SEARCH'], key) && !featureType) return;
                    if (!md.global.SysSettings.enableMap && key === 'LOCATION') return;
                    if (
                      (key === 'SEARCH_BTN' && md.global.SysSettings.hideIntegration) ||
                      (key === 'OCR' && md.global.SysSettings.hideOCR) ||
                      hideWorksheetControl.includes(key)
                    )
                      return;
                    return (
                      <DraggableItem
                        key={key}
                        item={{ ...widgets[key], enumType: key, featureType }}
                        addWidget={handleAdd}
                        {...props}
                      />
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </ScrollView>
    </WidgetList>
  );
}
