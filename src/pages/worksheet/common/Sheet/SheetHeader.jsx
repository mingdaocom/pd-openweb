import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import cx from 'classnames';
import { Popover } from 'antd';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import { Icon, Tooltip, RichText } from 'ming-ui';
import SheetDesc from 'worksheet/common/SheetDesc';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import SelectIcon from 'worksheet/common/SelectIcon';
import Statistics from 'statistics';
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
  clearChartId,
} from 'worksheet/redux/actions';
import { updateSheetList, deleteSheet, updateSheetListIsUnfold } from 'worksheet/redux/actions/sheetList';
import SheetMoreOperate from './SheetMoreOperate';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAppFeaturesVisible } from 'src/util';
import { BatchOperate } from 'worksheet/common';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';

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
    onlyBatchOperate,
    chartId,
    updateSheetList,
    updateSheetListIsUnfold,
    updateFilters,
    updateWorksheetInfo,
    refreshSheet,
    openNewRecord,
    deleteSheet,
    sheetViewData = {},
    sheetFetchParams = {},
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
    refreshWorksheetControls,
    addRecord,
    setHighLightOfRows,
    clearChartId,
    clearSelect,
  } = props;
  const { pageSize } = sheetFetchParams;
  const updateFiltersWithView = args => updateFilters(args, view);
  const { worksheetId, name, desc, projectId, allowAdd, entityName, roleType } = worksheetInfo;
  const [sheetDescVisible, setSheetDescVisible] = useState();
  const [statisticsVisible, setStatisticsVisible] = useState();
  const [discussionVisible, setDiscussionVisible] = useState();
  const [editNameVisible, setEditNameVisible] = useState();
  const [descIsEditing, setDescIsEditing] = useState(false);
  const sheet = _.find(sheetList.filter(_.identity), s => s.workSheetId === worksheetId) || {};
  const { rows, count, permission, rowsSummary } = sheetViewData;
  const { allWorksheetIsSelected, sheetSelectedRows = [] } = sheetViewConfig;
  const batchOperateComp = (
    <BatchOperate
      isCharge={isCharge}
      appId={appId}
      worksheetId={worksheetId}
      viewId={viewId}
      view={view}
      count={count}
      controls={controls}
      filters={filters}
      quickFilter={quickFilter}
      pageSize={pageSize}
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
      refresh={refresh}
      refreshWorksheetControls={refreshWorksheetControls}
      addRecord={addRecord}
      setHighLightOfRows={setHighLightOfRows}
    />
  );
  if (onlyBatchOperate) {
    return batchOperateComp;
  }
  const { ln } = getAppFeaturesVisible();
  return (
    <Fragment>
      <Con className="sheetHeader">
        {batchOperateComp}
        <div className="flex">
          {!ln && <span className="mLeft10" />}
          <span className={cx('fixed pointer', { hide: !ln })}>
            <Tooltip popupPlacement="bottom" text={<span>{isUnfold ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}>
              <i
                className={cx('icon Font12', isUnfold ? 'icon-back-02' : 'icon-next-02')}
                onClick={() => {
                  safeLocalStorageSetItem('sheetListIsUnfold', !isUnfold);
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
          {desc ? (
            <Popover
              arrowPointAtCenter={true}
              title={null}
              placement="bottomLeft"
              overlayClassName="sheetDescPopoverOverlay"
              content={
                <div className="popoverContent">
                  <RichText data={desc || ''} disabled={true} />
                </div>
              }
            >
              <Icon
                icon="knowledge-message"
                className="Hand sheetDesc"
                onClick={() => {
                  if (isCharge) {
                    setDescIsEditing(false);
                    setSheetDescVisible(true);
                  }
                }}
              />
            </Popover>
          ) : (
            <span className="InlineBlock" />
          )}
          <SheetDesc
            title={_l('工作表说明')}
            visible={sheetDescVisible}
            worksheetId={worksheetId}
            isEditing={descIsEditing}
            desc={desc || ''}
            onClose={() => {
              setSheetDescVisible(false);
            }}
            onSave={value => {
              setSheetDescVisible(false);
              updateWorksheetInfo({ desc: value });
            }}
          />
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
              setSheetDescVisible={value => {
                setDescIsEditing(true);
                setSheetDescVisible(value);
              }}
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
              {/* {!!chartId && (
                <span className={cx('worksheetFilterBtn ThemeColor3 ThemeBGColor6 active')}>
                  <i className="icon icon-worksheet_filter" />
                  <span className="selectedFilterName ellipsis">{_l('来自统计图的筛选')}</span>
                  <i
                    className="icon icon-close resetFilterBtn ThemeHoverColor2"
                    onClick={() => {
                      location.search = '';
                    }}
                  />
                </span>
              )} */}
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
                chartId={chartId}
                isCharge={isCharge}
                appId={appId}
                viewId={viewId}
                projectId={projectId}
                worksheetId={worksheetId}
                columns={controls}
                onChange={({ searchType, filterControls }) => {
                  updateFiltersWithView({ searchType, filterControls });
                }}
                clearChartId={clearChartId}
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
            !md.global.Account.isPortal &&
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
            worksheetId={worksheetId}
            viewId={viewId}
            appId={appId}
            projectId={projectId}
            roleType={roleType}
            isCharge={isCharge}
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
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    chartId: _.get(state, 'sheet.base.chartId'),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(sheetviewActions, [
          'setRowsEmpty',
          'addRecord',
          'setHighLightOfRows',
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
          'saveSheetLayout',
          'resetSehetLayout',
          'clearSelect',
        ]),
        updateSheetList,
        updateWorksheetInfo,
        updateFilters,
        updateSheetListIsUnfold,
        addNewRecord,
        refreshSheet,
        deleteSheet,
        refreshWorksheetControls,
        clearChartId,
      },
      dispatch,
    ),
)(SheetHeader);
