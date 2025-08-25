import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { enumWidgetType } from '../../util';
import { getPathById } from '../../util/widgets';
import RightDragPointer from '../components/RightDragPointer';
import displayTypes from '../displayTypes';
import { DragHeaderItem } from './tabHeader';

const CollapseWrap = styled.div`
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 16px 1px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  #collapseHeaderContent {
    display: flex;
    align-items: center;
    overflow-y: hidden;
  }
  #widgetSection {
    border-top: 3px solid #ebebeb;
    margin-top: -3px;
  }
`;

export default function DisplayCollapse(props) {
  const { tabWidgets = [], widgets = [], activeWidget = {}, setActiveWidget } = props;
  const [selectItem, setSelectItem] = useState(tabWidgets[0]);
  const Component = displayTypes[enumWidgetType[(selectItem || {}).type]];

  useEffect(() => {
    if (
      _.find(tabWidgets, t => t.controlId === activeWidget.controlId) &&
      _.get(selectItem.controlId) !== activeWidget.controlId
    ) {
      setSelectItem(activeWidget);
    }
  }, [activeWidget]);

  useEffect(() => {
    if (!_.find(tabWidgets, t => t.controlId === selectItem.controlId)) {
      setSelectItem(tabWidgets[0]);
    }
  }, [tabWidgets]);

  const handleClick = item => {
    setSelectItem(item);
    setActiveWidget(item);
  };

  return (
    <CollapseWrap className="tabItemWrap">
      <div id="collapseHeaderContent">
        {tabWidgets.map(data => {
          const row = _.head(getPathById(widgets, data.controlId));
          const isActive = activeWidget.controlId === data.controlId;
          const isOpen = selectItem.controlId === data.controlId;
          return (
            <DragHeaderItem
              {...props}
              id={`header-${data.controlId}`}
              key={data.controlId}
              data={data}
              path={[row, 0]}
              isActive={isActive}
              isOpen={isOpen}
              handleClick={handleClick}
            />
          );
        })}
        <RightDragPointer rowIndex={widgets.length} />
      </div>
      {!_.isEmpty(selectItem) ? (
        <Component
          {...props}
          isTab={true}
          data={_.find(tabWidgets, t => t.controlId === selectItem.controlId)}
          path={[_.head(getPathById(widgets, selectItem.controlId)), 0]}
        />
      ) : null}
    </CollapseWrap>
  );
}
