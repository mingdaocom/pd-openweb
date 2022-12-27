import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _, { last } from 'lodash';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import ViewConfig from 'worksheet/common/ViewConfig';
import CreateCustomBtn from 'worksheet/common/CreateCustomBtn';
import { exportSheet } from 'worksheet/common/ExportSheet';
import ViewItems from 'worksheet/components/ViewItems';
import Pagination from 'worksheet/components/Pagination';
import SearchRecord from 'worksheet/views/components/SearchRecord';
import { navigateTo } from 'src/router/navigateTo';
import {
  refreshSheet,
  updateView,
  updateViews,
  saveView,
  loadCustomButtons,
  updateCustomButtons,
  updateWorksheetControls,
  updateSearchRecord,
} from 'worksheet/redux/actions';
import { changePageSize, changePageIndex } from 'worksheet/redux/actions/sheetview';
import { addMultiRelateHierarchyControls } from 'worksheet/redux/actions/hierarchy';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { getSearchData } from 'worksheet/views/util';
import EditFastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/Edit';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

const Con = styled.div`
  display: flex;
  align-items: center;
  flex-direction: revert;
  flex-shrink: 0;
  height: 37px;
  padding: 0 20px 0 20px;
  overflow: hidden;
  border-bottom: 1px solid #e0e0e0;
`;

function ViewControl(props) {
  const {
    appId,
    groupId,
    view,
    viewId,
    isCharge,
    filters,
    quickFilter,
    navGroupFilters,
    worksheetInfo,
    controls,
    views,
    sheetSwitchPermit,
    sheetViewData,
    sheetFetchParams,
    sheetViewConfig,
    buttons,
    sheetButtons,
    viewConfigVisible,
    setViewConfigVisible,
    searchData,
  } = props;
  // funcs
  const {
    changePageIndex,
    changePageSize,
    refreshSheet,
    saveView,
    updateView,
    updateViews,
    loadCustomButtons,
    updateCustomButtons,
    addMultiRelateHierarchyControls,
    updateWorksheetControls,
    updateSearchRecord,
  } = props;
  const { worksheetId, projectId } = worksheetInfo;
  const { count, pageCountAbnormal, rowsSummary } = sheetViewData;
  const { pageIndex, pageSize } = sheetFetchParams;
  const { allWorksheetIsSelected, sheetSelectedRows, sheetHiddenColumns } = sheetViewConfig;
  const [createCustomBtnVisible, setCreateCustomBtnVisible] = useState();
  const [showFastFilter, setShowFastFilter] = useState();
  const [createBtnIsEdit, setCreateBtnIsEdit] = useState();
  const [activeBtnId, setActiveBtnId] = useState();
  const [activeFastFilterId, setActiveFastFilterId] = useState();
  const [btnDataInfo, setActiveBtnIdInfo] = useState();
  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  useEffect(() => {
    setActiveBtnIdInfo(_.find(sheetButtons, item => item.btnId === activeBtnId));
  }, [activeBtnId, sheetButtons]);

  return (
    <Con>
      <ViewItems
        sheetSwitchPermit={sheetSwitchPermit}
        isCharge={isCharge}
        appId={appId}
        viewList={views}
        worksheetControls={controls}
        currentViewId={viewId}
        worksheetId={worksheetId}
        updateCurrentView={data => {
          saveView(viewId, _.pick(data, data.editAttrs || []));
        }}
        changeViewDisplayType={data => {
          saveView(viewId, data);
        }}
        updateViewList={newViews => {
          updateViews(newViews);
        }}
        onAddView={(newViews, newView) => {
          updateViews(newViews);
          if (Number(newView.viewType) === 0) {
            setViewConfigVisible(true);
          }
          navigateTo(`/app/${appId}/${groupId}/${worksheetId}/${newView.viewId}`);
        }}
        onShare={() => {
          openShareDialog({
            from: 'view',
            isCharge,
            title: _l('分享视图'),
            isPublic: view.shareRange === 2,
            params: {
              appId,
              worksheetId,
              viewId,
              title: view.name,
            },
            getCopyContent: (type, url) => (type === 'private' ? url : `${url} ${worksheetInfo.name}-${view.name}`),
            onUpdate: value => {
              updateView(Object.assign({}, view, value));
            },
          });
        }}
        onExport={() => {
          exportSheet({
            sheetHiddenColumns,
            allCount: count,
            allWorksheetIsSelected,
            appId: appId,
            exportView: view,
            worksheetId: worksheetId,
            projectId: projectId,
            searchArgs: filters,
            selectRowIds: sheetSelectedRows.map(item => item.rowid),
            sheetSwitchPermit,
            columns: controls.filter(item => {
              return (
                !_.find(view.controls, hideId => item.controlId === hideId) &&
                item.controlPermissions &&
                item.controlPermissions[0] === '1' &&
                item.controlId !== 'rowid'
              );
            }),
            downLoadUrl: worksheetInfo.downLoadUrl,
            worksheetSummaryTypes: rowsSummary.types,
            quickFilter,
            navGroupFilters,

            // 支持列统计结果
            hideStatistics: false,
          });
        }}
        onRemoveView={(newViewList, newViewId) => {
          if (newViewId === viewId) {
            const firstView = newViewList[0];
            navigateTo(`/app/${appId}/${groupId}/${worksheetId}/${firstView.viewId}`);
            updateViews(newViewList);
          } else {
            updateViews(newViewList);
          }
        }}
        onViewConfigVisible={() => {
          setViewConfigVisible(true);
        }}
        getNavigateUrl={selectedView => {
          return `/app/${appId}/${groupId}/${worksheetId}/${selectedView.viewId}`;
        }}
      />
      {/**本表层级视图、甘特图 */}
      {((Number(view.viewType) === 2 && _.includes([0, 1], Number(view.childType))) || Number(view.viewType) === 5) && (
        <SearchRecord
          queryKey={searchData.queryKey}
          data={searchData.data}
          onSearch={record => {
            updateSearchRecord(view, record);
          }}
          onClose={() => {
            updateSearchRecord(view, null);
          }}
        >
          <Tooltip popupPlacement="bottom" text={<span>{_l('查找')}</span>}>
            <i className={cx('icon icon-search Gray_9e Font18 pointer ThemeHoverColor3 mTop2 mRight15')} />
          </Tooltip>
        </SearchRecord>
      )}
      <Tooltip popupPlacement="bottom" text={<span>{_l('刷新视图')}</span>}>
        <i
          className={cx('icon icon-task-later refresh Gray_9e Font18 pointer ThemeHoverColor3 mTop2')}
          onClick={() => {
            refreshSheet(view, { updateWorksheetControls: true });
          }}
        />
      </Tooltip>
      {Number(view && view.viewType) === 0 && (
        <Pagination
          abnormalMode={pageCountAbnormal}
          className="pagination"
          pageIndex={pageIndex}
          pageSize={pageSize}
          allCount={count}
          changePageSize={changePageSize}
          changePageIndex={changePageIndex}
          onPrev={() => {
            changePageIndex(pageIndex - 1);
          }}
          onNext={() => {
            changePageIndex(pageIndex + 1);
          }}
        />
      )}
      {viewConfigVisible && (
        <ViewConfig
          appId={appId}
          currentSheetInfo={worksheetInfo}
          view={view}
          projectId={projectId}
          worksheetId={worksheetId}
          worksheetControls={controls}
          sheetSwitchPermit={sheetSwitchPermit}
          onClickAwayExceptions={[
            '.ant-select-dropdown',
            '.ChooseWidgetDialogWrap',
            '.dropConOption',
            '.dropdownTrigger',
            '.worksheetFilterColumnOptionList',
            '.selectUserBox',
            '#dialogBoxSelectUser_container',
            '.PositionContainer-wrapper',
            '.deleteCustomBtnDialog',
            '.mui-dialog-container',
            '.createCustomBtnCon',
            '.showBtnFilterDialog',
            '.doubleConfirmDialog',
            '.appointDialog',
            '.chooseWidgetDialog',
            '.rc-trigger-popup',
            '.fullScreenCurtain',
            '.errerDialogForAppoint',
            '.mobileDepartmentPickerDialog',
            '.selectUserFromAppDialog',
            '.addHierarchyRelate',
            '.hideControlsWrap',
            '.ant-cascader-menus',
            '.ant-tree-select-dropdown',
            '#chat',
            '.boxEditFastFilter',
            '.boxEditFastFilterCover',
            '.ant-picker-dropdown',
            '.quickAddControlDialog',
            '.ant-modal-root',
            '.ant-tooltip',
            '.deleteHoverTips',
            '.CodeMirror-hints',
            '.Tooltip-wrapper',
          ]}
          onClickAway={() => setViewConfigVisible(false)}
          columns={controls.filter(item => {
            if (isShowWorkflowSys) {
              return item.viewDisplay || !('viewDisplay' in item);
            }
            return (
              (item.viewDisplay || !('viewDisplay' in item)) &&
              !_.includes(
                ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
                item.controlId,
              )
            );
          })}
          onClose={() => setViewConfigVisible(false)}
          updateCurrentView={data => {
            saveView(viewId, _.pick(data, data.editAttrs || []));
            if ((_.get(data, 'viewControls') || []).length > (_.get(view, 'viewControls') || []).length) {
              addMultiRelateHierarchyControls(data.viewControls.slice(-1).map(item => item.worksheetId));
            }
          }}
          showCreateCustomBtnFn={(value, isEdit, btnId) => {
            setCreateCustomBtnVisible(value);
            setCreateBtnIsEdit(isEdit);
            setActiveBtnId(btnId);
          }}
          setFastFilter={(value, controlId) => {
            setShowFastFilter(value);
            setActiveFastFilterId(controlId);
          }}
          viewId={viewId}
          btnList={sheetButtons}
          btnData={buttons}
          refreshFn={(worksheetId, appId, viewId, rowId) => {
            loadCustomButtons({ worksheetId, appId, viewId, rowId });
          }}
          updateWorksheetControls={updateWorksheetControls}
        />
      )}
      {createCustomBtnVisible && (
        <CreateCustomBtn
          onClickAwayExceptions={[
            '.ChooseWidgetDialogWrap',
            '.showBtnFilterDialog',
            '.doubleConfirmDialog',
            '.appointDialog',
            '.chooseWidgetDialog',
            '.rc-trigger-popup',
            '.fullScreenCurtain',
            '.errerDialogForAppoint',
            '.mobileDepartmentPickerDialog',
            '#dialogBoxSelectUser_container',
            '.selectUserFromAppDialog',
            '.selectUserBox',
            '.dropdownTrigger',
            '.worksheetFilterColumnOptionList',
            '.PositionContainer-wrapper',
            '.mui-dialog-container',
            '.mdAlertDialog',
            '.ant-cascader-menus',
            '.ant-tree-select-dropdown',
            '.ant-picker-dropdown',
            '.ant-modal-root',
            '.ant-tooltip',
            '.CodeMirror-hints',
            '.ck',
            '.ant-picker-dropdown',
            '.Tooltip',
          ]}
          onClickAway={() => setCreateCustomBtnVisible(false)}
          isEdit={createBtnIsEdit}
          onClose={() => setCreateCustomBtnVisible(false)}
          columns={controls
            .filter(item => {
              return item.viewDisplay || !('viewDisplay' in item);
            })
            .map(control => redefineComplexControl(control))}
          btnId={activeBtnId}
          btnDataInfo={btnDataInfo}
          btnList={sheetButtons}
          projectId={projectId}
          view={view}
          worksheetControls={controls}
          currentSheetInfo={worksheetInfo}
          viewId={viewId}
          appId={appId}
          worksheetId={worksheetId}
          workflowId={''}
          refreshFn={(worksheetId, appId, viewId, rowId) => {
            loadCustomButtons({ worksheetId, appId, viewId, rowId });
          }}
          updateCustomButtons={updateCustomButtons}
        />
      )}
      {showFastFilter && (
        <EditFastFilter
          view={view}
          worksheetControls={controls}
          onClickAwayExceptions={['.addControlDrop']}
          showFastFilter={showFastFilter}
          onClickAway={() => setShowFastFilter(false)}
          activeFastFilterId={activeFastFilterId}
          onClose={() => {
            setShowFastFilter(false);
          }}
          setActiveFastFilterId={id => {
            setActiveFastFilterId(id);
          }}
          updateCurrentView={data => {
            saveView(viewId, _.pick(data, data.editAttrs || []));
          }}
        />
      )}
    </Con>
  );
}

ViewControl.propTypes = {
  appId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  groupId: PropTypes.string,
  isCharge: PropTypes.bool,
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  view: PropTypes.shape({}),
  viewId: PropTypes.string,
  views: PropTypes.arrayOf(PropTypes.shape({})),
  updateView: PropTypes.func,
  updateViews: PropTypes.func,
  refreshSheet: PropTypes.func,
  changePageIndex: PropTypes.func,
  changePageSize: PropTypes.func,
};

export default connect(
  state => ({
    views: state.sheet.views,
    sheetList: state.sheet.sheetList,
    app: state.sheet.app,
    worksheetInfo: state.sheet.worksheetInfo,
    filters: state.sheet.filters,
    quickFilter: state.sheet.quickFilter,
    navGroupFilters: state.sheet.navGroupFilters,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    // sheetview
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    buttons: state.sheet.buttons,
    sheetButtons: state.sheet.sheetButtons,
    searchData: getSearchData(state.sheet),
  }),
  dispatch =>
    bindActionCreators(
      {
        changePageSize,
        changePageIndex,
        refreshSheet,
        saveView,
        updateView,
        updateViews,
        loadCustomButtons,
        updateCustomButtons,
        addMultiRelateHierarchyControls,
        updateWorksheetControls,
        updateSearchRecord,
      },
      dispatch,
    ),
)(ViewControl);
