import React, { Fragment, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useKey } from 'react-use';
import { Popover } from 'antd';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Statistics from 'statistics';
import { BatchOperate } from 'worksheet/common';
import Discussion from 'worksheet/common/Discussion';
import SelectIcon from 'worksheet/common/SelectIcon';
import SheetDesc from 'worksheet/common/SheetDesc';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import RightInMotion from 'worksheet/components/Animations/RightInMotion';
import SearchInput from 'worksheet/components/SearchInput';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import {
  addNewRecord,
  clearChartId,
  refreshSheet,
  refreshWorksheetControls,
  updateFilters,
  updateWorksheetInfo,
} from 'worksheet/redux/actions';
import { deleteSheet, updateSheetList, updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';
import { isHaveCharge } from 'worksheet/redux/actions/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getAppSectionData, getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import WorksheetDraft from 'src/pages/worksheet/common/WorksheetDraft';
import { navigateTo } from 'src/router/navigateTo';
import { getTranslateInfo } from 'src/utils/app';
import { getAppFeaturesVisible } from 'src/utils/app';
import { needHideViewFilters } from 'src/utils/filter';
import { getHighAuthSheetSwitchPermit } from 'src/utils/worksheet';
import { findSheet } from 'src/utils/worksheet';
import SheetMoreOperate from './SheetMoreOperate';

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
  .actionWrap {
    display: flex;
    border-radius: 5px;
    padding: 5px 5px;
    margin-right: 8px;
    cursor: pointer;
    &:hover {
      background: #f7f7f7 !important;
      .icon {
        color: #1677ff !important;
      }
    }
    &.draftEntry {
      padding-top: 0;
      padding-bottom: 0;
      height: 28px;
      &:hover {
        .draftTxt {
          color: #1677ff !important;
        }
      }
    }
  }
  .actionIcon {
    color: #9e9e9e !important;
    border-radius: 5px;

    &:hover {
      background: #f7f7f7 !important;
      .icon {
        color: #1677ff !important;
      }
    }
  }
`;

function SheetHeader(props) {
  const { appPkg, worksheetInfo, controls, sheetSwitchPermit } = props;
  const { type, appId, groupId, view, viewId, isCharge, views } = props;
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
    changeToSelectCurrentPageFromSelectAll,
  } = props;
  const { pageSize, sortControls } = sheetFetchParams;
  const updateFiltersWithView = args => updateFilters(args, view);
  const {
    worksheetId,
    desc,
    resume,
    remark,
    projectId,
    allowAdd,
    entityName,
    roleType,
    advancedSetting = {},
  } = worksheetInfo;
  const name = getTranslateInfo(appId, null, worksheetId).name || worksheetInfo.name || '';
  const cache = useRef({});
  const [sheetDescVisible, setSheetDescVisible] = useState();
  const [statisticsVisible, setStatisticsVisible] = useState();
  const [discussionVisible, setDiscussionVisible] = useState();
  const [editNameVisible, setEditNameVisible] = useState();
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [inFull, setInFull] = useState(false);
  const [resumeInfo, setResumeInfo] = useState({});
  const sheetList = [1, 3].includes(appPkg.currentPcNaviStyle) ? getAppSectionData(groupId) : props.sheetList;
  const sheet = findSheet(worksheetId, sheetList) || {};
  const lastSheetSwitchPermit =
    isHaveCharge(appPkg.permissionType) && viewId === worksheetId
      ? getHighAuthSheetSwitchPermit(sheetSwitchPermit, worksheetId)
      : sheetSwitchPermit;
  const canNewRecord = isOpenPermit(permitList.createButtonSwitch, lastSheetSwitchPermit) && allowAdd;
  const showPublic = isOpenPermit(permitList.statisticsSwitch, lastSheetSwitchPermit);
  const showSelf = isOpenPermit(permitList.statisticsSelfSwitch, lastSheetSwitchPermit);
  const { rows, count, permission, rowsSummary, pageCountAbnormal } = sheetViewData;
  const { allWorksheetIsSelected, sheetSelectedRows = [] } = sheetViewConfig;

  useEffect(() => {
    const resumeInfo = resume ? JSON.parse(resume) : {};
    setResumeInfo(resumeInfo);
  }, [resume]);

  useEffect(() => {
    cache.current.canNewRecord = canNewRecord;
  }, [canNewRecord]);

  useEffect(() => {}, []);

  let selectedLength = allWorksheetIsSelected ? count - sheetSelectedRows.length : sheetSelectedRows.length;

  if (allWorksheetIsSelected && pageCountAbnormal) {
    selectedLength = -1;
  }

  const batchOperateComp = (
    <BatchOperate
      type={type}
      isCharge={isCharge}
      pageCountAbnormal={pageCountAbnormal}
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
      sortControls={sortControls}
      worksheetInfo={worksheetInfo}
      permission={(permission || {})[viewId]}
      allWorksheetIsSelected={allWorksheetIsSelected}
      rows={rows}
      selectedRows={sheetSelectedRows}
      selectedLength={selectedLength}
      updateViewPermission={updateViewPermission}
      sheetSwitchPermit={lastSheetSwitchPermit}
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
      changeToSelectCurrentPageFromSelectAll={changeToSelectCurrentPageFromSelectAll}
    />
  );
  useKey('Enter', e => {
    if (e.ctrlKey) {
      if (
        !document.querySelector('.workSheetNewRecord,.ant-modal-root') &&
        e.target.tagName.toLowerCase() === 'body' &&
        cache.current.canNewRecord
      ) {
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
              <Tooltip title={_l('退出全屏')} shortcut={window.isMacOs ? '⌘/' : 'Ctrl+/'} placement="bottom">
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
                title={inFull ? _l('退出全屏') : _l('应用全屏')}
                shortcut={window.isMacOs ? '⌘/' : 'Ctrl+/'}
                placement="bottom"
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
          {desc && !resumeInfo.value ? (
            <Popover
              arrowPointAtCenter={true}
              title={null}
              placement="bottomLeft"
              overlayClassName="sheetDescPopoverOverlay"
              content={
                <div className="popoverContent" style={{ maxHeight: document.body.clientHeight / 2 }}>
                  <RichText
                    data={getTranslateInfo(appId, null, worksheetId).description || desc || ''}
                    disabled={true}
                  />
                </div>
              }
            >
              <Icon
                icon="info"
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
            permissionType={_.get(appPkg, 'permissionType')}
            cacheKey="sheetIntroDescription"
            visible={sheetDescVisible}
            worksheetId={worksheetId}
            isEditing={descIsEditing}
            setDescIsEditing={setDescIsEditing}
            desc={
              descIsEditing ? desc || '' : desc ? getTranslateInfo(appId, null, worksheetId).description || desc : desc
            }
            data={worksheetInfo}
            resume={resume}
            remark={remark}
            onClose={() => {
              setSheetDescVisible(false);
            }}
            onSave={(value, resume) => {
              if (!value && resume) {
                setSheetDescVisible(false);
              }
              updateWorksheetInfo({ desc: value, resume });
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
            sheetSwitchPermit={lastSheetSwitchPermit}
            // funcs
            setSheetDescVisible={value => {
              isCharge && setDescIsEditing(value);
              setSheetDescVisible(value);
            }}
            setEditNameVisible={setEditNameVisible}
            updateWorksheetInfo={updateWorksheetInfo}
            reloadWorksheet={() => refreshSheet(view)}
            isLock={_.get(appPkg, 'isLock')}
            permissionType={_.get(appPkg, 'permissionType')}
            deleteSheet={data => {
              if ([1, 3].includes(appPkg.currentPcNaviStyle)) {
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
              name={worksheetInfo.name}
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
            {needHideViewFilters(view) ? null : (
              <Fragment>
                {String(view.viewType) !== VIEW_DISPLAY_TYPE.map && (
                  <SearchInput
                    triggerWhenBlurWithEmpty
                    keyWords={filters.keyWords}
                    viewId={viewId}
                    className="queryInput worksheetQueryInput mRight8"
                    showCaseSensitive
                    onOk={(value, { isCaseSensitive = false } = {}) => {
                      updateFiltersWithView({
                        keyWords: (value || '').trim(),
                        requestParams: {
                          ignorecase: isCaseSensitive ? '0' : '1',
                        },
                      });
                    }}
                    onClear={() => {
                      updateFiltersWithView({ keyWords: '', requestParams: { ignorecase: '1' } });
                    }}
                  />
                )}
                {!(String(get(view, 'viewType')) === '2' && get(view, 'advancedSetting.hierarchyViewType') === '3') && (
                  <Fragment>
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
                        className="actionWrap"
                        chartId={chartId}
                        isCharge={isCharge}
                        appPkg={appPkg}
                        sheetSwitchPermit={lastSheetSwitchPermit}
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
              </Fragment>
            )}
            {!window.isPublicApp && (showPublic || (showSelf && !md.global.Account.isPortal)) && (
              <Tooltip placement="bottom" title={_l('统计')}>
                <span className="actionWrap">
                  <Icon
                    className={cx('openStatisticsBtn Gray_9e Font18 actionIcon', {
                      ThemeColor3: statisticsVisible,
                    })}
                    icon="worksheet_column_chart"
                    onClick={() => setStatisticsVisible(!statisticsVisible)}
                  />
                </span>
              </Tooltip>
            )}
            {/* 工作表讨论权限 && 工作表日志权限 */}
            {!window.isPublicApp &&
              !md.global.Account.isPortal &&
              !!isOpenPermit(permitList.discussSwitch, lastSheetSwitchPermit) && (
                <Tooltip placement="bottom" title={_l('讨论')}>
                  <span className="actionWrap">
                    <Icon
                      className="Font18 Gray_9e actionIcon"
                      icon="discussion"
                      onClick={() => setDiscussionVisible(!discussionVisible)}
                    />
                  </span>
                </Tooltip>
              )}
            {/* 草稿箱入口 */}
            {canNewRecord && (
              <WorksheetDraft
                className="actionWrap"
                showFillNext={true}
                appId={appId}
                view={view}
                worksheetInfo={worksheetInfo}
                sheetSwitchPermit={lastSheetSwitchPermit}
                isCharge={isCharge}
                needCache={false}
                addNewRecord={props.addRecord}
                allowAdd={canNewRecord}
                setHighLightOfRows={setHighLightOfRows}
              />
            )}
            {/* 显示创建按钮 */}
            {canNewRecord && !worksheetInfo.isRequestingRelationControls && (
              <span
                style={{ backgroundColor: appPkg.iconColor || '#1677ff' }}
                className="addRow mLeft8 overflow_ellipsis WordBreak"
                onClick={() => openNewRecord({ allowShowMingoCreate: true })}
              >
                <span className="Icon icon icon-plus Font13 mRight5 White" />
                <span className="White bold">{advancedSetting.btnname || entityName || _l('记录')}</span>
              </span>
            )}
          </VerticalCenter>
        )}
      </Con>
      {resumeInfo.value && (
        <div style={{ padding: '5px 43px' }}>
          <span style={{ color: resumeInfo.color }}>{resumeInfo.value}</span>
          {desc && (
            <span
              className="ThemeColor pointer nowrap mLeft5"
              onClick={() => {
                setDescIsEditing(false);
                setSheetDescVisible(true);
              }}
            >
              {_l('详情')}
            </span>
          )}
        </div>
      )}
      <RightInMotion
        duration={200}
        animateOffset={480}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          height: 'auto',
          zIndex: 11,
        }}
        visible={discussionVisible}
      >
        <Discussion
          title={worksheetInfo.name}
          appId={appId}
          appSectionId={groupId}
          viewId={viewId}
          projectId={projectId}
          worksheetId={worksheetId}
          discussSwitch={isOpenPermit(permitList.discussSwitch, lastSheetSwitchPermit)}
          onClose={() => setDiscussionVisible(false)}
          isWorksheetDiscuss={true}
        />
      </RightInMotion>
      <RightInMotion
        duration={200}
        animateOffset={560}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          height: 'auto',
          zIndex: 11,
        }}
        visible={statisticsVisible}
      >
        <Statistics
          worksheetId={worksheetId}
          viewId={worksheetId === viewId ? _.get(views.filter(view => view.viewId !== viewId)[0], 'viewId') : viewId}
          appId={appId}
          projectId={projectId}
          roleType={roleType}
          isCharge={isCharge}
          themeColor={_.get(appPkg, 'iconColor')}
          isLock={_.get(appPkg, 'isLock')}
          permissionType={_.get(appPkg, 'permissionType')}
          sheetSwitchPermit={lastSheetSwitchPermit}
          onClose={() => setStatisticsVisible(false)}
        />
      </RightInMotion>
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
          'changeToSelectCurrentPageFromSelectAll',
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
      },
      dispatch,
    ),
)(SheetHeader);
