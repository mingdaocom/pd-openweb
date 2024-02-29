import React from 'react';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import DraggableItem from './draggableItem';
import { WIDGET_GROUP_TYPE } from '../config/widget';
import ListItemLayer from './ListItemLayer';
import { getFeatureStatus } from 'src/util';
import { relateOrSectionTab } from '../util';
import { handleAddWidgets } from 'src/pages/widgetConfig/util/data';

const WidgetList = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: auto;
  background-color: #ffffff;
  .groupList {
    padding: 0 16px;
    padding-bottom: 40px;
  }
  .group {
    margin-top: 20px;
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
    padding-left: 10px;
    padding-right: 4px;
    list-style: none;
    position: relative;
    background-color: #fff;
    border: 1px solid #dddddd;
    border-radius: 4px;
    &:hover,
    &.active {
      color: #2196f3;
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
        word-break: break-word;
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
  const { globalSheetInfo = {}, activeWidget = {} } = props;
  const { hideWorksheetControl = '' } = md.global.SysSettings;

  const handleAdd = (data, para = {}) => {
    let sectionId = '';
    if (para.type === 'click') {
      sectionId = activeWidget.type === 52 ? activeWidget.controlId : activeWidget.sectionId;
    } else {
      sectionId = para.sectionId || '';
    }

    // 子表、标签页、关联多条列表等不能嵌套
    if (relateOrSectionTab(data) || data.type === 34) {
      sectionId = '';
    }

    let newData = {
      ...data,
      sectionId: sectionId,
    };

    handleAddWidgets([newData], para, props);
  };

  return (
    <WidgetList>
      <ListItemLayer />
      <ScrollView>
        <div className="groupList">
          {_.keys(WIDGET_GROUP_TYPE).map(group => {
            const { widgets, title } = WIDGET_GROUP_TYPE[group];
            const list = _.keys(widgets).filter(key => !hideWorksheetControl.includes(key)).filter(key => !(key === 'SEARCH_BTN' && md.global.SysSettings.hideIntegration));
            if (!list.length) {
              return undefined;
            }
            return (
              <div key={group} className="group">
                <div className="title">{title}</div>
                <ul>
                  {list.map(key => {
                    const featureType = getFeatureStatus(globalSheetInfo.projectId, widgets[key]['featureId']);
                    if (_.includes(['SEARCH_BTN', 'SEARCH'], key) && !featureType) return;

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
