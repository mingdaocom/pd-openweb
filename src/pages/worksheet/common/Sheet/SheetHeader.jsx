import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import { Icon, Tooltip } from 'ming-ui';
import SheetDesc from 'worksheet/common/SheetDesc';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import SelectIcon from 'worksheet/common/SelectIcon';
import Statistics from 'worksheet/common/Statistics';
import Discussion from 'worksheet/common/Discussion';
import SearchInput from 'worksheet/components/SearchInput';
import { emitter } from 'worksheet/util';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import {
  addNewRecord,
  updateWorksheetInfo,
  updateFilters,
  refreshSheet,
  refreshWorksheetControls,
} from 'worksheet/redux/actions';
import { updateSheetList, deleteSheet, updateSheetListIsUnfold } from 'worksheet/redux/actions/sheetList';
import SheetMoreOperate from './SheetMoreOperate';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { BatchOperate } from 'worksheet/common';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';
import filterXSS from 'xss';

const Con = styled.div`
  display: flex;
  padding-left: 10px;
  padding-right: 20px;
  height: 38px;
  background-color: #fff;
  align-items: center;
  position: relative;
`;

const VerticalCenter = styled.div`
  display: flex;
  align-items: center;
`;

function SheetHeader(props) {
  const { appPkg, isUnfold, sheetList, worksheetInfo, controls, sheetSwitchPermit } = props;
  const { appId, groupId, view, viewId, isCharge } = props;
  // functions
  const {
    updateSheetList,
    updateSheetListIsUnfold,
    updateFilters,
    updateWorksheetInfo,
    refreshSheet,
    openNewRecord,
    deleteSheet,
    sheetViewData = {},
    sheetViewConfig = {},
    filters,
    quickFilter,
    navGroupFilters,
    updateRows,
    hideRows,
    updateViewPermission,
    getWorksheetSheetViewSummary,
    changePageIndex,
    refresh,
    clearSelect,
    refreshWorksheetControls,
  } = props;
  const updateFiltersWithView = args => updateFilters(args, view);
  const { worksheetId, name, desc, projectId, allowAdd, entityName } = worksheetInfo;
  const [sheetDescVisible, setSheetDescVisible] = useState();
  const [statisticsVisible, setStatisticsVisible] = useState();
  const [discussionVisible, setDiscussionVisible] = useState();
  const [editNameVisible, setEditNameVisible] = useState();
  const sheet = _.find(sheetList, s => s.workSheetId === worksheetId) || {};
  const { rows, count, permission, rowsSummary } = sheetViewData;
  const { allWorksheetIsSelected, sheetSelectedRows = [] } = sheetViewConfig;
  return (
    <Fragment>
      <Con className="sheetHeader">
        <BatchOperate
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          view={view}
          count={count}
          controls={controls}
          filters={filters}
          quickFilter={quickFilter}
          navGroupFilters={navGroupFilters}
          worksheetInfo={worksheetInfo}
          permission={(permission || {})[viewId]}
          allWorksheetIsSelected={allWorksheetIsSelected}
          rows={rows}
          selectedRows={sheetSelectedRows}
          selectedLength={allWorksheetIsSelected ? count - sheetSelectedRows.length : sheetSelectedRows.length}
          updateViewPermission={updateViewPermission}
          sheetSwitchPermit={sheetSwitchPermit}
          rowsSummary={rowsSummary}
          updateRows={updateRows}
          hideRows={hideRows}
          getWorksheetSheetViewSummary={getWorksheetSheetViewSummary}
          reload={() => {
            changePageIndex(1);
            refresh();
          }}
          clearSelect={clearSelect}
          refreshWorksheetControls={refreshWorksheetControls}
        />
        <div className="flex">
          <span className="fixed pointer">
            <Tooltip popupPlacement="bottom" text={<span>{isUnfold ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}>
              <i
                className={cx('icon Font12', isUnfold ? 'icon-back-02' : 'icon-next-02')}
                onClick={() => {
                  localStorage.setItem('sheetListIsUnfold', !isUnfold);
                  if (isUnfold) {
                    updateSheetListIsUnfold(false);
                  } else {
                    updateSheetListIsUnfold(true);
                  }
                }}
              />
            </Tooltip>
          </span>
          <span className="title ellipsis Font17 Gray Bold" title={name || ''}>
            {name || ''}
          </span>
          <Trigger
            popupClassName="DropdownPanelTrigger"
            action={['click']}
            popup={
              <SheetDesc
                worksheetId={worksheetId}
                desc={desc}
                onClose={() => {
                  setSheetDescVisible(false);
                }}
                onSave={value => {
                  setSheetDescVisible(false);
                  updateWorksheetInfo({ desc: value });
                }}
              />
            }
            popupVisible={sheetDescVisible}
            onPopupVisibleChange={visible => {
              if (isCharge) {
                setSheetDescVisible(visible);
              }
            }}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 20],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            {desc ? (
              <Tooltip
                disable={sheetDescVisible}
                tooltipClass="sheetDescTooltip"
                popupPlacement="bottom"
                text={
                  <span
                    dangerouslySetInnerHTML={{
                      __html: filterXSS(desc, { stripIgnoreTag: true }).replace(/\n/g, '<br />'),
                    }}
                  />
                }
              >
                <Icon icon="knowledge-message" className="Hand sheetDesc" />
              </Tooltip>
            ) : (
              <span className="InlineBlock" />
            )}
          </Trigger>
          {(isCharge || (isOpenPermit(permitList.importSwitch, sheetSwitchPermit) && allowAdd)) && (
            <SheetMoreOperate
              isCharge={isCharge}
              appId={appId}
              groupId={groupId}
              viewId={viewId}
              worksheetInfo={worksheetInfo}
              controls={controls}
              sheetSwitchPermit={sheetSwitchPermit}
              // funcs
              setSheetDescVisible={setSheetDescVisible}
              setEditNameVisible={setEditNameVisible}
              updateWorksheetInfo={updateWorksheetInfo}
              reloadWorksheet={() => refreshSheet(view)}
              deleteSheet={deleteSheet}
            />
          )}
          {editNameVisible && (
            <SelectIcon
              projectId={projectId}
              className="sheetSelectIconWrap"
              isActive={true}
              name={name}
              icon={sheet.icon}
              iconColor={sheet.iconColor}
              appId={appId}
              groupId={groupId}
              workSheetId={worksheetId}
              updateWorksheetInfo={(id, data) => {
                updateWorksheetInfo(data);
              }}
              updateSheetList={updateSheetList}
              onCancel={() => {
                setEditNameVisible(false);
              }}
            />
          )}
        </div>
        <VerticalCenter>
          {(String(view.viewType) === VIEW_DISPLAY_TYPE.structure && _.includes([0, 1], Number(view.childType))) ||
          String(view.viewType) === VIEW_DISPLAY_TYPE.gunter ? null : (
            <Fragment>
              <SearchInput
                viewId={viewId}
                className="queryInput"
                onOk={value => {
                  updateFiltersWithView({ keyWords: (value || '').trim() });
                }}
                onClear={() => {
                  updateFiltersWithView({ keyWords: '' });
                }}
              />
              <WorkSheetFilter
                isCharge={isCharge}
                appId={appId}
                viewId={viewId}
                projectId={projectId}
                worksheetId={worksheetId}
                columns={controls}
                onChange={({ searchType, filterControls }) => {
                  updateFiltersWithView({ searchType, filterControls });
                }}
              />
            </Fragment>
          )}
          {!window.isPublicApp && (
            <Tooltip popupPlacement="bottom" text={<span>{_l('统计')}</span>}>
              <span className="mRight16 mTop4">
                <Icon
                  className={cx('openStatisticsBtn Gray_9e Font18 pointer', { ThemeColor3: statisticsVisible })}
                  icon="worksheet_column_chart"
                  onClick={() => setStatisticsVisible(!statisticsVisible)}
                />
              </span>
            </Tooltip>
          )}
          {/* 工作表讨论权限 && 工作表日志权限 */}
          {!window.isPublicApp &&
            !(
              !isOpenPermit(permitList.discussSwitch, sheetSwitchPermit) &&
              !isOpenPermit(permitList.logSwitch, sheetSwitchPermit)
            ) && (
              <Tooltip
                popupPlacement="bottom"
                text={
                  <span>{isOpenPermit(permitList.discussSwitch, sheetSwitchPermit) ? _l('讨论') : _l('日志')}</span>
                }
              >
                <span className="mRight16 mTop4">
                  <Icon
                    className="Font18 Gray_9e pointer"
                    icon={isOpenPermit(permitList.discussSwitch, sheetSwitchPermit) ? 'discussion' : 'draft-box'}
                    onClick={() => setDiscussionVisible(!discussionVisible)}
                  />
                </span>
              </Tooltip>
            )}
          {/* 显示创建按钮 */}
          {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
            <span style={{ backgroundColor: appPkg.iconColor || '#2196f3' }} className="addRow" onClick={openNewRecord}>
              <span className="Icon icon icon-plus Font13 mRight5 White" />
              <span className="White bold">{entityName}</span>
            </span>
          )}
        </VerticalCenter>
      </Con>
      <CSSTransitionGroup transitionName="Discussion" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {discussionVisible && (
          <Discussion
            title={name}
            appId={appId}
            appSectionId={groupId}
            viewId={viewId}
            projectId={projectId}
            worksheetId={worksheetId}
            onClose={() => setDiscussionVisible(false)}
            logSwitch={isOpenPermit(permitList.logSwitch, sheetSwitchPermit)}
            discussSwitch={isOpenPermit(permitList.discussSwitch, sheetSwitchPermit)}
          />
        )}
      </CSSTransitionGroup>
      <CSSTransitionGroup transitionName="StatisticsPanel" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {statisticsVisible && (
          <Statistics
            activeSheetId={worksheetId}
            appId={appId}
            projectId={projectId}
            onClose={() => setStatisticsVisible(false)}
          />
        )}
      </CSSTransitionGroup>
    </Fragment>
  );
}

SheetHeader.propTypes = {
  appId: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  groupId: PropTypes.string,
  isCharge: PropTypes.bool,
  isUnfold: PropTypes.bool,
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  updateFilters: PropTypes.func,
  updateSheetListIsUnfold: PropTypes.func,
  view: PropTypes.shape({}),
  viewId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
};

export default connect(
  state => ({
    appPkg: state.appPkg,
    isUnfold: state.sheetList.isUnfold,
    sheetList: state.sheetList.data,
    app: state.sheet.app,
    worksheetInfo: state.sheet.worksheetInfo,
    filters: state.sheet.filters,
    quickFilter: state.sheet.quickFilter,
    navGroupFilters: state.sheet.navGroupFilters,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(sheetviewActions, [
          'setRowsEmpty',
          'addRecord',
          'fetchRows',
          'updateRows',
          'hideRows',
          'selectRows',
          'clearHighLight',
          'setHighLight',
          'updateDefaultScrollLeft',
          'updateSheetColumnWidths',
          'changeWorksheetSheetViewSummaryType',
          'updateViewPermission',
          'getWorksheetSheetViewSummary',
          'changePageIndex',
          'updateControlOfRow',
          'refresh',
          'clearSelect',
          'saveSheetLayout',
          'resetSehetLayout',
        ]),
        updateSheetList,
        updateWorksheetInfo,
        updateFilters,
        updateSheetListIsUnfold,
        addNewRecord,
        refreshSheet,
        deleteSheet,
        refreshWorksheetControls,
      },
      dispatch,
    ),
)(SheetHeader);
