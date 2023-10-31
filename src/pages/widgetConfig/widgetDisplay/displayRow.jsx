import React, { Fragment } from 'react';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { isEmpty } from 'lodash';
import RowItem from './rowItem';
import DisplayTab from './displayTabs';
import Components from './components';
import { MAX_CONTROLS_COUNT } from '../config';
import { getSectionWidgets } from '../util';

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

export default function DisplayRow(props) {
  const { allControls, widgets, fromType, batchActive } = props;
  const { commonWidgets = [], tabWidgets = [] } = getSectionWidgets(widgets);

  const rowsContent = (
    <Fragment>
      <div className="rowsWrap">
        {commonWidgets.map((row, index) => {
          const id = row.reduce((p, c) => p + c.controlId, '');
          return !isEmpty(row) && <RowItem key={id} row={row} index={index} {...props} commonWidgets={commonWidgets} />;
        })}
        <Components.BottomDragPointer rowIndex={commonWidgets.length} showEmpty={!commonWidgets.length} />
      </div>
      {isEmpty(tabWidgets) ? (
        commonWidgets.length > 0 ? (
          <Components.BottomDragPointer displayItemType="tab" rowIndex={widgets.length} />
        ) : null
      ) : (
        <DisplayTab {...props} commonLength={commonWidgets.length} tabWidgets={tabWidgets} />
      )}
    </Fragment>
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

                  {!isEmpty(batchActive) && <Components.WidgetBatchOption batchActive={batchActive} {...props} />}
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
