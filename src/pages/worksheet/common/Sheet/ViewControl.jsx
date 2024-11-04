import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _, { get } from 'lodash';
import cx from 'classnames';
import { Tooltip, Slider } from 'ming-ui';
import ViewConfig from 'worksheet/common/ViewConfig';
import CreateCustomBtn from 'worksheet/common/CreateCustomBtn';
import { exportSheet } from 'worksheet/common/ExportSheet';
import { exportAttachment } from 'src/pages/worksheet/common/ExportAttachment';
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
  updateCurrentViewState,
  updateViewShowcount,
  clearFilters,
  updateGroupFilter,
  fireWhenViewLoaded,
} from 'worksheet/redux/actions';
import { changePageSize, changePageIndex } from 'worksheet/redux/actions/sheetview';
import { addMultiRelateHierarchyControls } from 'worksheet/redux/actions/hierarchy';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { getSearchData } from 'worksheet/views/util';
import EditFastFilter from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/Edit';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { filterHidedControls } from 'worksheet/util';
import { canEditData } from 'worksheet/redux/actions/util';
import { APP_ROLE_TYPE, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import renderCellText from 'worksheet/components/CellControls/renderText';

const Con = styled.div`
  display: flex;
  align-items: center;
  flex-direction: revert;
  flex-shrink: 0;
  height: 37px;
  padding: 0 20px 0 20px;
  border-bottom: 1px solid #e0e0e0;

  .detailAllCount {
    padding-left: 16px;
    font-size: 14px;
    color: #888;
  }
`;

function ViewControl(props) {
  const {
    base,
    appId,
    groupId,
    view,
    viewId,
    isCharge,
    chartId,
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
    viewConfigTab,
    setViewConfigTab,
    searchData,
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
    appPkg,
    updateCurrentViewState,
    updateViewShowcount,
    detailView,
    clearFilters,
    updateGroupFilter,
    fireWhenViewLoaded,
  } = props;
  const { worksheetId, projectId } = worksheetInfo;
  const { count, pageCountAbnormal, rowsSummary } = sheetViewData;
  const { pageIndex, pageSize, sortControls } = sheetFetchParams;
  const { allWorksheetIsSelected, sheetSelectedRows, sheetHiddenColumns } = sheetViewConfig;
  const cache = useRef({});
  const [createCustomBtnVisible, setCreateCustomBtnVisible] = useState();
  const [isListOption, setIsListOption] = useState(false);
  const [showFastFilter, setShowFastFilter] = useState();
  const [customBtnIsEdit, setCustomBtnIsEdit] = useState();
  const [activeBtnId, setActiveBtnId] = useState();
  const [activeFastFilterId, setActiveFastFilterId] = useState();
  const [btnDataInfo, setActiveBtnIdInfo] = useState();
  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  useEffect(() => {
    if (['gallery', 'board'].includes(VIEW_DISPLAY_TYPE[props.view.viewType])) {
      const showcount = _.get(props.view, 'advancedSetting.showcount');
      const storageCount = localStorage.getItem('showcount_' + viewId);
      if (!storageCount || storageCount === 'undefined') {
        updateViewShowcount(showcount);
      } else if (storageCount !== props.fieldShowCount) {
        updateViewShowcount(storageCount);
      }
    }
  }, [props.view]);
  useEffect(() => {
    setActiveBtnIdInfo(_.find(sheetButtons, item => item.btnId === activeBtnId));
  }, [activeBtnId, sheetButtons]);

  const handleSearchData = () => {
    if (!searchData) return;

    const titleField = controls.find(m => m.controlId === searchData.queryKey);
    const searchRecordData = searchData.data.map(l => {
      return {
        ...l,
        [searchData.queryKey]: renderCellText({
          ...titleField,
          value: searchData.queryKey ? l[searchData.queryKey] : undefined,
        }),
      };
    });

    return searchRecordData;
  };

  return (
    <Con>
      <ViewItems
        worksheetInfo={worksheetInfo}
        sheetSwitchPermit={sheetSwitchPermit}
        isCharge={isCharge}
        appId={appId}
        viewList={views}
        worksheetControls={controls}
        currentViewId={viewId}
        worksheetId={worksheetId}
        isLock={_.get(appPkg, 'isLock')}
        updateCurrentView={data => {
          saveView(viewId, _.pick(data, [...(data.editAttrs || []), 'editAdKeys']));
        }}
        changeViewDisplayType={data => {
          clearFilters();
          updateGroupFilter([], view);
          saveView(viewId, data);
        }}
        updateViewList={newViews => {
          updateViews(newViews);
        }}
        onAddView={(newViews, newView) => {
          updateViews(newViews);
          if ([0, 3, 6, 21].includes(Number(newView.viewType))) {
            setViewConfigVisible(true);
          }
          navigateTo(`/app/${appId}/${groupId}/${worksheetId}/${newView.viewId}`);
        }}
        onShare={() => {
          const hasCharge =
            isCharge ||
            canEditData(_.get(appPkg, 'permissionType')) ||
            _.get(appPkg, 'permissionType') === APP_ROLE_TYPE.DEVELOPERS_ROLE; //开发者|管理员|运营者
          openShareDialog({
            from: 'view',
            isCharge: hasCharge,
            title: _l('分享视图'),
            isPublic: view.shareRange === 2,
            hidePublicShare: !(
              isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, viewId) && !md.global.Account.isPortal
            ),
            privateShare: isOpenPermit(permitList.internalAccessLink, sheetSwitchPermit, viewId),
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
          const hasCharge = isCharge || canEditData(_.get(appPkg, 'permissionType'));
          exportSheet({
            sheetHiddenColumns,
            allCount: count,
            allWorksheetIsSelected,
            appId: appId,
            exportView: view,
            worksheetId: worksheetId,
            projectId: projectId,
            chartId,
            searchArgs: filters,
            selectRowIds: sheetSelectedRows.map(item => item.rowid),
            sheetSwitchPermit,
            columns: hasCharge
              ? controls.filter(item => {
                  return item.controlId !== 'rowid';
                })
              : filterHidedControls(controls, view.controls, false).filter(item => {
                  return (
                    ((item.controlPermissions && item.controlPermissions[0] === '1') || !item.controlPermissions) &&
                    item.controlId !== 'rowid'
                  );
                }),
            downLoadUrl: worksheetInfo.downLoadUrl,
            worksheetSummaryTypes: rowsSummary.types,
            quickFilter,
            navGroupFilters,
            sortControls,
            isCharge: hasCharge,
            // 支持列统计结果
            hideStatistics: false,
          });
        }}
        onExportAttachment={() => {
          const hasCharge = isCharge || canEditData(_.get(appPkg, 'permissionType'));
          exportAttachment({
            appId,
            worksheetId,
            viewId,
            attachmentControls: hasCharge
              ? controls.filter(item => item.type === 14)
              : filterHidedControls(controls, view.controls).filter(
                  item => item.controlPermissions && item.controlPermissions[0] === '1' && item.type === 14,
                ),
            quickFilter,
            searchArgs: filters,
            navGroupFilters,
            selectRowIds: sheetSelectedRows.map(item => item.rowid),
            isCharge: hasCharge,
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
      {/**本表层级视图、甘特图、地图 */}
      {((Number(view.viewType) === 2 && _.includes([0, 1], Number(view.childType))) ||
        _.includes([5, 8], Number(view.viewType))) &&
        get(view, 'advancedSetting.hierarchyViewType') !== '3' && (
          <SearchRecord
            viewId={viewId}
            queryKey={searchData.queryKey}
            data={handleSearchData()}
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
            if (cache.current.isRefreshing) {
              alert(_l('刷新频率过快'), 3);
              return;
            }
            refreshSheet(view, { updateWorksheetControls: true, isRefreshBtn: true });
            cache.current.isRefreshing = true;
            setTimeout(() => {
              cache.current.isRefreshing = false;
            }, 3000);
          }}
        />
      </Tooltip>
      {['gallery', 'board'].includes(VIEW_DISPLAY_TYPE[view.viewType]) &&
        !!_.get(view, 'advancedSetting.showcount') && (
          <Slider
            key={`${viewId}_${view.displayControls.length}_${props.fieldShowCount}`}
            style={{ width: 120, paddingRight: 0 }}
            numStyle={{ textAlign: 'right' }}
            showNumber
            className={'mLeft12'}
            readonly={false}
            disabled={false}
            value={
              props.fieldShowCount > view.displayControls.length ? view.displayControls.length : props.fieldShowCount
            }
            showInput={false}
            showTip={true}
            tipDirection={undefined}
            min={0}
            max={view.displayControls.length}
            step={1}
            itemnames={''}
            itemcolor={{ type: 1, color: '#9e9e9e' }}
            onChange={value => {
              updateViewShowcount(value);
            }}
          />
        )}

      {Number(view.viewType) === 6 && Number(view.childType) === 2 && (
        <div className="detailAllCount">{_l('共') + detailView.detailViewRowsCount + _l('条')}</div>
      )}

      {Number(view && view.viewType) === 0 && (
        <Pagination
          disabled={!!get(base, 'forcePageSize')}
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
          updateViewShowcount={updateViewShowcount}
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
            '.ant-picker-dropdown',
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
            '.selectRoleDialog',
            '.Tooltip',
            '#quickSelectDept',
            '.ant-drawer-mask',
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
          viewConfigTab={viewConfigTab}
          setViewConfigTab={setViewConfigTab}
          onClose={() => setViewConfigVisible(false)}
          updateCurrentView={(data, cb) => {
            saveView(viewId, _.pick(data, [...(data.editAttrs || []), 'editAdKeys']), cb);
            if ((_.get(data, 'viewControls') || []).length > (_.get(view, 'viewControls') || []).length) {
              addMultiRelateHierarchyControls(data.viewControls.slice(-1).map(item => item.worksheetId));
            }
          }}
          updateCurrentViewState={updateCurrentViewState}
          onShowCreateCustomBtn={(value, isEdit, btnId, isListOption) => {
            setCreateCustomBtnVisible(value);
            setCustomBtnIsEdit(isEdit);
            setActiveBtnId(btnId);
            setIsListOption(isListOption);
          }}
          setFastFilter={(value, controlId) => {
            setShowFastFilter(value);
            setActiveFastFilterId(controlId);
          }}
          viewId={viewId}
          btnList={sheetButtons}
          refreshFn={(worksheetId, appId, viewId, rowId) => {
            loadCustomButtons({ worksheetId, appId, viewId, rowId });
          }}
          updateWorksheetControls={updateWorksheetControls}
          hasCharge={
            isCharge ||
            canEditData(_.get(appPkg, 'permissionType')) ||
            _.get(appPkg, 'permissionType') === APP_ROLE_TYPE.DEVELOPERS_ROLE //开发者|管理员|运营者
          }
        />
      )}
      {createCustomBtnVisible && (
        <CreateCustomBtn
          zIndex={12}
          sheetSwitchPermit={sheetSwitchPermit}
          isEdit={customBtnIsEdit}
          onClose={() => setCreateCustomBtnVisible(false)}
          columns={controls
            .filter(item => {
              return item.viewDisplay || !('viewDisplay' in item);
            })
            .map(control => redefineComplexControl(control))}
          btnId={activeBtnId}
          btnDataInfo={btnDataInfo}
          isListOption={isListOption}
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
          currentSheetInfo={worksheetInfo}
          view={view}
          worksheetControls={controls}
          onClickAwayExceptions={[
            '.addControlDrop',
            '.nano',
            '.mui-dialog-container',
            '.ant-select-dropdown',
            '.rc-trigger-popup',
            '.selectize-dropdown',
            '.selectUserBox',
            '.ant-picker-dropdown',
            '.TimePicker',
          ]}
          showFastFilter={showFastFilter}
          onClickAway={() => {
            setShowFastFilter(false);
            fireWhenViewLoaded(view, { forceUpdate: true });
            refreshSheet(view);
          }}
          activeFastFilterId={activeFastFilterId}
          onClose={() => {
            setShowFastFilter(false);
            fireWhenViewLoaded(view, { forceUpdate: true });
            refreshSheet(view);
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
    base: state.sheet.base,
    worksheetInfo: state.sheet.worksheetInfo,
    filters: state.sheet.filters,
    quickFilter: state.sheet.quickFilter,
    navGroupFilters: state.sheet.navGroupFilters,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    detailView: state.sheet.detailView,
    // sheetview
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    buttons: state.sheet.buttons,
    sheetButtons: state.sheet.sheetButtons,
    searchData: getSearchData(state.sheet),
    appPkg: state.appPkg,
    fieldShowCount: state.sheet.fieldShowCount,
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
        updateCurrentViewState,
        updateViewShowcount,
        clearFilters,
        updateGroupFilter,
        fireWhenViewLoaded,
      },
      dispatch,
    ),
)(ViewControl);
