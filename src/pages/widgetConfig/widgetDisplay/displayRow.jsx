import React, { Fragment } from 'react';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { useGlobalStore } from 'src/common/GlobalStore';
import GeneratingHeader from '../components/GeneratingHeader';
import { MAX_CONTROLS_COUNT } from '../config';
import { getSectionWidgets } from '../util';
import BottomDragPointer from './components/BottomDragPointer';
import FieldRecycleBin from './components/FieldRecycleBin';
import { WidgetStyle } from './components/WidgetStyle';
import DisplayTab from './displayTabs';
import RowItem from './rowItem';

const DisplayRowListWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  .rowsWidgetContent {
    flex: 1;
    min-height: 100%;
    padding: 12px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: #fff;
    ${props => (props.widgetPanelFixed ? 'border-left: 10px solid #F5F5F5' : '')}
    ${props => (props.settingPanelFixed ? 'border-right: 10px solid #F5F5F5' : '')}
    .addWidgetIcon {
      width: 28px;
      height: 28px;
      text-align: center;
      padding-top: 2px;
      border-radius: 50%;
      background: #2196f3;
      color: #fff;
      &:hover {
        background: #1e88e5;
      }
    }
  }
  .rowsWrap {
    border-radius: 8px;
    padding: 8px 0;
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
    background: #1677ff;
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
  const {
    store: { mingoCreateWorksheetAction, mingoIsCreatingWorksheetStatus },
  } = useGlobalStore();
  const {
    showCreateByMingo,
    isDialog,
    allControls,
    widgets,
    fromType,
    widgetPanelFixed,
    widgetVisible,
    setPanelVisible = () => {},
  } = props;
  const { commonWidgets = [], tabWidgets = [] } = getSectionWidgets(widgets);
  const noWidgets = isEmpty(widgets);
  const rowsContent = (
    <Fragment>
      <div className={cx('rowsWrap', { flex: noWidgets })}>
        {commonWidgets.map((row, index) => {
          const id = row.reduce((p, c) => p + c.controlId, '');
          return (
            !isEmpty(row) && (
              <RowItem
                key={id}
                row={row}
                index={index}
                {...props}
                commonWidgets={commonWidgets}
                displayItemType="common"
              />
            )
          );
        })}
        <BottomDragPointer
          isDialog={isDialog}
          showCreateByMingo={!!noWidgets && showCreateByMingo}
          displayItemType="common"
          rowIndex={commonWidgets.length}
          showEmpty={!commonWidgets.length}
          globalSheetInfo={props.globalSheetInfo}
        />
      </div>
      {!noWidgets && (
        <Fragment>
          {isEmpty(tabWidgets) ? (
            <BottomDragPointer displayItemType="tab" rowIndex={widgets.length} />
          ) : (
            <DisplayTab {...props} commonLength={commonWidgets.length} tabWidgets={tabWidgets} />
          )}
        </Fragment>
      )}
    </Fragment>
  );

  return (
    <DisplayRowListWrap
      className={fromType === 'public' ? '' : 'overflowHidden'}
      {..._.pick(props, ['settingPanelFixed', 'widgetPanelFixed'])}
    >
      {fromType === 'public' ? (
        rowsContent
      ) : (
        <ScrollView id="widgetDisplayWrap" className="flex flexColumn">
          <div className="rowsWidgetContent">
            <div className="displayHeader">
              <div className="flexCenter">
                {!widgetPanelFixed && (
                  <Tooltip title={window.isMacOs ? _l('添加字段 ⌘/') : _l('添加字段 Ctrl+/')} placement="bottomLeft">
                    <div
                      className="addWidgetIcon pointer"
                      onMouseEnter={() => {
                        if (!widgetVisible) {
                          setPanelVisible({ widgetVisible: true });
                        }
                      }}
                    >
                      <Icon icon="add" className="Font24 " />
                    </div>
                  </Tooltip>
                )}
                <span className="Font17 Bold mLeft12">{_l('表单设计')}</span>
                <Tooltip title={_l('最多添加%0个字段', MAX_CONTROLS_COUNT)}>
                  <span className="controlNum Font12 Gray_9e pTop3">
                    {_l('%0/%1', allControls.length, MAX_CONTROLS_COUNT)}
                  </span>
                </Tooltip>
              </div>
              {!isEmpty(widgets) && !mingoCreateWorksheetAction && (
                <div className="flexRow">
                  <WidgetStyle {...props} />
                  <FieldRecycleBin {...props} />
                </div>
              )}
            </div>
            {mingoIsCreatingWorksheetStatus && (
              <GeneratingHeader
                globalSheetInfo={props.globalSheetInfo}
                mingoIsCreatingWorksheetStatus={mingoIsCreatingWorksheetStatus}
              />
            )}
            {rowsContent}
          </div>
        </ScrollView>
      )}
    </DisplayRowListWrap>
  );
}
