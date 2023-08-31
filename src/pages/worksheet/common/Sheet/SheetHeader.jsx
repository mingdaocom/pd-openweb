import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useKey } from 'react-use';
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
  loadDraftDataCount,
} from 'worksheet/redux/actions';
import { updateSheetList, deleteSheet, updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import SheetMoreOperate from './SheetMoreOperate';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAppFeaturesVisible } from 'src/util';
import { BatchOperate } from 'worksheet/common';
import WorksheetDraft from 'src/pages/worksheet/common/WorksheetDraft';
import { findSheet } from 'worksheet/util';
import { getAppSectionData, getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';

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
  .draftDot {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    right: 0;
    top: 0;
    background-color: #f44336;
  }
`;

function SheetHeader(props) {
  const { appPkg, worksheetInfo, controls, sheetSwitchPermit, draftDataCount } = props;
  const showPublic = isOpenPermit(permitList.statisticsSwitch, sheetSwitchPermit);
  const showSelf = isOpenPermit(permitList.statisticsSelfSwitch, sheetSwitchPermit);
  const { type, appId, groupId, view, viewId, isCharge } = props;
  // functions
  const {
    onlyBatchOperate,
    chartId,
    updateSheetList,
    updateFilters,
    updateWorksheetInfo,
    refreshSheet,
    openNewRecord,
    updateSheetListAppItem,
    sheetViewData = {},
    sheetFetchParams = {},
    sheetViewConfig = {},
    filters,
    quickFilter,
    navGroupFilters,
    filtersGroup,
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
    loadDraftDataCount = () => {},
  } = props;
  const { pageSize } = sheetFetchParams;
  const updateFiltersWithView = args => updateFilters(args, view);
  const { worksheetId, name, desc, projectId, allowAdd, entityName, roleType, advancedSetting = {} } = worksheetInfo;
  const [sheetDescVisible, setSheetDescVisible] = useState();
  const [statisticsVisible, setStatisticsVisible] = useState();
  const [discussionVisible, setDiscussionVisible] = useState();
  const [editNameVisible, setEditNameVisible] = useState();
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [inFull, setInFull] = useState(false);
  const sheetList = appPkg.currentPcNaviStyle === 1 ? getAppSectionData(groupId) : props.sheetList;
  const sheet = findSheet(worksheetId, sheetList) || {};
  const canNewRecord = isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd;
  const { rows, count, permission, rowsSummary } = sheetViewData;
  const { allWorksheetIsSelected, sheetSelectedRows = [] } = sheetViewConfig;

  useEffect(() => {
    if (advancedSetting.closedrafts !== '1') {
      loadDraftDataCount({ appId, worksheetId });
    }
  }, [worksheetId]);

  const batchOperateComp = (
    <BatchOperate
      type={type}
      isCharge={isCharge}
      permissionType={_.get(appPkg, 'permissionType')}
      isLock={_.get(appPkg, 'isLock')}
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
      filtersGroup={filtersGroup}
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
  useKey('Enter', e => {
    if (e.ctrlKey) {
      if (!document.querySelector('.workSheetNewRecord,.ant-modal-root') && e.target.tagName.toLowerCase() === 'body') {
        openNewRecord();
      }
    }
  });
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
            {appPkg.currentPcNaviStyle === 2 ? (
              <Tooltip
                text={
                  <span>
                    {_l('退出')} ({navigator.userAgent.toLocaleLowerCase().includes('mac os') ? '⌘ + E' : 'Ctrl + E'})
                  </span>
                }
                popupPlacement="bottom"
              >
                <Icon
                  className="fullRotate hoverGray Font20"
                  icon="close_fullscreen"
                  onClick={() => {
                    window.disabledSideButton = true;
                    navigateTo(`/app/${appId}/${groupId}`);
                  }}
                />
              </Tooltip>
            ) : (
              <Tooltip
                text={
                  <span>
                    {inFull ? _l('退出') : _l('展开')} (
                    {navigator.userAgent.toLocaleLowerCase().includes('mac os') ? '⌘ + E' : 'Ctrl + E'})
                  </span>
                }
                popupPlacement="bottom"
              >
                <Icon
                  className={cx('fullRotate hoverGray', inFull ? 'Font20' : 'Font17')}
                  icon={inFull ? 'close_fullscreen' : 'open_in_full'}
                  onClick={() => {
                    if (inFull) {
                      window.disabledSideButton = true;
                      setInFull(false);
                      document.querySelector('#wrapper').classList.remove('fullWrapper');
                    } else {
                      setInFull(true);
                      document.querySelector('#wrapper').classList.add('fullWrapper');
                    }
                  }}
                />
              </Tooltip>
            )}
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
                  setDescIsEditing(false);
                  setSheetDescVisible(true);
                }}
              />
            </Popover>
          ) : (
            <span className="InlineBlock" />
          )}
          <SheetDesc
            title={_l('工作表说明')}
            isCharge={isCharge}
            visible={sheetDescVisible}
            worksheetId={worksheetId}
            isEditing={descIsEditing}
            setDescIsEditing={setDescIsEditing}
            desc={desc || ''}
            onClose={() => {
              setSheetDescVisible(false);
            }}
            onSave={value => {
              // setSheetDescVisible(false);
              updateWorksheetInfo({ desc: value });
            }}
          />
          <SheetMoreOperate
            sheet={sheet}
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
            isLock={_.get(appPkg, 'isLock')}
            permissionType={_.get(appPkg, 'permissionType')}
            deleteSheet={data => {
              if (appPkg.currentPcNaviStyle === 1) {
                const singleRef = getAppSectionRef(data.groupId);
                singleRef.dispatch(deleteSheet(data));
              } else {
                props.deleteSheet(data);
              }
            }}
          />
          {editNameVisible && (
            <SelectIcon
              projectId={projectId}
              className="sheetSelectIconWrap"
              isActive={true}
              name={name}
              appItem={sheet}
              icon={sheet.icon}
              appId={appId}
              groupId={groupId}
              workSheetId={worksheetId}
              updateWorksheetInfo={(id, data) => {
                updateWorksheetInfo(data);
              }}
              updateSheetListAppItem={updateSheetListAppItem}
              updateSheetList={updateSheetList}
              onCancel={() => {
                setEditNameVisible(false);
              }}
            />
          )}
        </div>
        {viewId && (
          <VerticalCenter>
            {(String(view.viewType) === VIEW_DISPLAY_TYPE.structure && _.includes([0, 1], Number(view.childType))) ||
            String(view.viewType) === VIEW_DISPLAY_TYPE.gunter ? null : (
              <Fragment>
                <SearchInput
                  keyWords={filters.keyWords}
                  viewId={viewId}
                  className="queryInput worksheetQueryInput"
                  onOk={value => {
                    updateFiltersWithView({ keyWords: (value || '').trim() });
                  }}
                  onClear={() => {
                    updateFiltersWithView({ keyWords: '' });
                  }}
                />
                {chartId ? (
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
                ) : (
                  <WorkSheetFilter
                    className="mRight16 mTop1"
                    chartId={chartId}
                    isCharge={isCharge}
                    appPkg={appPkg}
                    sheetSwitchPermit={sheetSwitchPermit}
                    appId={appId}
                    viewId={viewId}
                    projectId={projectId}
                    worksheetId={worksheetId}
                    columns={controls}
                    filterResigned={false} // 筛选---人员层不显示离职栏
                    onChange={({ searchType, filterControls }) => {
                      updateFiltersWithView({ searchType, filterControls });
                    }}
                    clearChartId={clearChartId}
                  />
                )}
              </Fragment>
            )}
            {!window.isPublicApp && (showPublic || (showSelf && !md.global.Account.isPortal)) && (
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
            {/* 草稿箱入口 */}
            {advancedSetting.closedrafts !== '1' && (
              <WorksheetDraft
                showFillNext={true}
                appId={appId}
                view={view}
                worksheetInfo={worksheetInfo}
                sheetSwitchPermit={sheetSwitchPermit}
                isCharge={isCharge}
                needCache={false}
                draftDataCount={draftDataCount}
                addNewRecord={props.addNewRecord}
                allowAdd={canNewRecord}
                setHighLightOfRows={setHighLightOfRows}
              />
            )}
            {/* 显示创建按钮 */}
            {canNewRecord && !worksheetInfo.isRequestingRelationControls && (
              <span
                style={{ backgroundColor: appPkg.iconColor || '#2196f3' }}
                className="addRow"
                onClick={openNewRecord}
              >
                <span className="Icon icon icon-plus Font13 mRight5 White" />
                <span className="White bold">{entityName}</span>
              </span>
            )}
          </VerticalCenter>
        )}
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
            isLock={_.get(appPkg, 'isLock')}
            permissionType={_.get(appPkg, 'permissionType')}
            onClose={() => setStatisticsVisible(false)}
            sheetSwitchPermit={sheetSwitchPermit}
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
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  updateFilters: PropTypes.func,
  view: PropTypes.shape({}),
  viewId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
};

export default connect(
  state => ({
    appPkg: state.appPkg,
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
    draftDataCount: state.sheet.draftDataCount,
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
          'resetSheetLayout',
          'clearSelect',
        ]),
        updateSheetList,
        updateWorksheetInfo,
        updateSheetListAppItem,
        updateFilters,
        addNewRecord,
        refreshSheet,
        deleteSheet,
        refreshWorksheetControls,
        clearChartId,
        loadDraftDataCount,
      },
      dispatch,
    ),
)(SheetHeader);
