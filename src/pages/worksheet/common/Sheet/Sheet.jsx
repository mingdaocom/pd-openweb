import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _, { get, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Skeleton } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import DragMask from 'worksheet/common/DragMask';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import * as actions from 'worksheet/redux/actions';
import { canEditApp, canEditData } from 'worksheet/redux/actions/util.js';
import View from 'worksheet/views';
import { defaultNavCloseW, defaultNavOpenW, MaxNavW, MinNavW } from 'src/pages/worksheet/common/ViewConfig/config.js';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { getTranslateInfo } from 'src/utils/app';
import { emitter as globalEmitter } from 'src/utils/common';
import GroupFilter from './GroupFilter';
import QuickFilter from './QuickFilter';
import SheetContext from './SheetContext';
import SheetHeader from './SheetHeader';
import ViewControl from './ViewControl';
import './style.less';

const { sheet, gallery, board, calendar, gunter, detail, customize, map, resource, structure } = VIEW_DISPLAY_TYPE;

const Con = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
  flex-direction: column;
  background: #fff;
  &.viewConfigVisible {
    .viewCon.viewType-0 {
      padding-right: 720px;
    }
    iframe.customWidgetIframe {
      pointer-events: none;
    }
  }
`;

const Loading = styled.div`
  height: 75px;
`;

const ConView = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  max-height: 100%;
  min-height: 0;
  flex-shrink: 0;
`;

const QuickFilterCon = styled.div`
  max-height: 50%;
  overflow-y: auto;
  border-bottom: 1px solid #e0e0e0;
`;

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  border-left: 1px solid #e0e0e0;
  &:hover{
    border-left: 1px solid #1677ff;
  }
`,
);

const EmptyStatus = styled.div`
  color: #9e9e9e;
  font-size: 17px;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

function getKeyOfFiltersGroup(filtersGroup) {
  function getKey(f) {
    return JSON.stringify(
      _.pick(f, ['controlId', 'value', 'values', 'minValue', 'maxValue', 'filterType', 'dateRange']),
    );
  }
  if (_.isEmpty(filtersGroup)) {
    return '';
  } else if (_.get(filtersGroup, '0.groupFilters')) {
    return _.flatten(_.map(filtersGroup, item => _.map(item.groupFilters, getKey))).join('|');
  } else {
    return _.map(filtersGroup, getKey).join('|');
  }
}

function Sheet(props) {
  const {
    loading,
    error,
    emitter,
    appId,
    groupId,
    worksheetId,
    worksheetInfo,
    flag,
    type = 'common',
    views,
    activeViewStatus,
    isCharge,
    authRefreshTime,
    updateGroupFilter,
    fireWhenViewLoaded,
    refreshSheet,
    updateFilters,
    config = {},
    appPkg = {},
    filtersGroup,
    chartId,
    showControlIds,
    showAsSheetView,
    quickFilter,
    quickFilterWithDefault,
    navGroupFilters,
    openNewRecord,
    updateQuickFilter,
    setLoadRequest = () => {},
    abortPrevWorksheetInfoRequest = () => {},
    controls = [],
    sheetButtons,
    printList,
    sheetSwitchPermit,
    viewRowsLoading,
  } = props;
  const isDevAndOps = canEditApp(appPkg.permissionType) || canEditData(appPkg.permissionType);
  const cache = useRef({});
  const [viewConfigVisible, setViewConfigVisible] = useState(false);
  const [viewConfigTab, setViewConfigTab] = useState('');
  let [dragMaskVisible, setDragMaskVisible] = useState(false);
  let [isOpenGroup, setIsOpenGroup] = useState(
    !window.localStorage.getItem('navGroupIsOpen') ? true : window.localStorage.getItem('navGroupIsOpen') === 'true',
  );
  let [groupFilterWidth, setGroupFilterWidth] = useState();
  let { viewId } = props;
  const { loadWorksheet } = props;
  const showViews = views.filter(view => {
    const showhide = _.get(view, 'advancedSetting.showhide') || '';
    return !showhide.includes('hpc') && !showhide.includes('hide');
  });
  const view = _.find(views, { viewId }) || (!viewId && !chartId && (showViews.length ? showViews : views)[0]) || {};
  const navData = (_.get(worksheetInfo, 'template.controls') || []).find(
    o => o.controlId === _.get(view, 'navGroup[0].controlId'),
  );
  const worksheetName = getTranslateInfo(appId, null, worksheetId).name || worksheetInfo.name || '';
  const hasGroupFilter =
    !_.isEmpty(view.navGroup) &&
    view.navGroup.length > 0 &&
    (_.includes([sheet, gallery, customize, map], String(view.viewType)) ||
      (String(view.viewType) === structure && view.childType !== 2)) &&
    navData;
  const showQuickFilter =
    !_.isEmpty(quickFilterWithDefault) &&
    (_.includes([sheet, gallery, board, calendar, gunter, customize, resource, map], String(view.viewType)) ||
      (String(view.viewType) === detail && view.childType === 2) ||
      (String(view.viewType) === structure && view.childType !== 2)) &&
    !chartId &&
    (String(view.viewType) !== customize || _.get(view, 'pluginInfo.switchSettings.showFastFilter') === '1');
  const noRecords = isEqual(filtersGroup, [{}]);
  const needClickToSearch =
    showQuickFilter &&
    !_.includes([sheet], String(view.viewType)) &&
    _.get(view, 'advancedSetting.clicksearch') === '1';
  //设置了筛选列表，且不显示全部，需手动选择分组后展示数据
  const navGroupToSearch =
    hasGroupFilter &&
    !_.includes([sheet], String(view.viewType)) &&
    !chartId &&
    _.get(view, 'advancedSetting.showallitem') === '1' &&
    !_.get(view, 'navGroup[0].viewId');
  const basePara = {
    type,
    loading: loading || (type === 'common' && views.length && _.isEmpty(view)),
    error,
    appPkg,
    appId,
    groupId,
    worksheetId,
    views,
    view,
    activeViewStatus,
    viewId: view.viewId,
    projectId: worksheetInfo.projectId,
    isCharge,
    isDevAndOps,
    authRefreshTime,
    openNewRecord,
    viewConfigVisible,
    setViewConfigVisible,
    setViewConfigTab,
    filtersGroup,
    groupFilterWidth: hasGroupFilter ? groupFilterWidth : 0,
    chartId,
    showControlIds,
    showAsSheetView,
    controls,
    refreshSheet,
    printCharge: config.printCharge,
    allowOpenRecord: config.allowOpenRecord,
    allowAddNewRecord: config.isAddRecord,
    embedNeedUpdate: config.embedNeedUpdate,
    viewRowsLoading,
  };
  const navGroupData = (_.get(worksheetInfo, 'template.controls') || []).find(
    o => o.controlId === _.get(view, 'navGroup[0].controlId'),
  );
  const viewComp = noRecords ? (
    <EmptyStatus>{_l('没有符合条件的记录')}</EmptyStatus>
  ) : needClickToSearch && _.isEmpty(quickFilter) ? (
    <EmptyStatus>{_l('执行查询后显示结果')}</EmptyStatus>
  ) : navGroupToSearch && _.isEmpty(navGroupFilters) ? (
    <EmptyStatus>{_l('请从左侧选择一个%0查看', navGroupData.controlName)}</EmptyStatus>
  ) : (
    <View
      {...basePara}
      viewConfigVisible={viewConfigVisible}
      noLoadAtDidMount={_.isArray(filtersGroup) && !_.isEmpty(filtersGroup)}
    />
  );
  useEffect(() => {
    if (worksheetId) {
      abortPrevWorksheetInfoRequest();
      loadWorksheet(worksheetId, setLoadRequest);
    }
  }, [type === 'single' ? worksheetId : undefined, flag]);

  useEffect(() => {
    if (
      _.isArray(filtersGroup) &&
      (!_.isEmpty(filtersGroup) || !_.isEmpty(cache.current.prevFiltersGroup)) &&
      !loading
    ) {
      updateFilters({ filtersGroup }, view);
    }
  }, [getKeyOfFiltersGroup(filtersGroup), loading]);
  useEffect(() => {
    cache.current.prevFiltersGroup = filtersGroup;
  }, [getKeyOfFiltersGroup(filtersGroup)]);
  useEffect(() => {
    fireWhenViewLoaded(view, controls);
  }, [view.fastFilters]);
  useEffect(() => {
    updateGroupFilter([], view);
  }, [view.viewId, worksheetId]);
  useEffect(() => {
    if (
      type === 'common' &&
      views.length &&
      _.isEmpty(view) &&
      props.appId &&
      props.groupId &&
      props.worksheetId &&
      !loading
    ) {
      navigateTo(`/app/${props.appId}/${props.groupId}/${props.worksheetId}`, true);
    }
  }, [view, views, loading]);
  useEffect(() => {
    if (_.get(cache, 'current.prevFastFilters.length') > 0 && _.get(view, 'fastFilters.length') === 0) {
      updateQuickFilter([], view);
    }
    cache.current.prevFastFilters = quickFilterWithDefault;
  }, [quickFilterWithDefault]);
  useEffect(() => {
    if (isOpenGroup) {
      setOpenNavW();
    } else {
      setGroupFilterWidth(defaultNavCloseW);
    }
  }, [_.get(view, 'advancedSetting.navwidth')]);
  const setOpenNavW = () => {
    let w = window.localStorage.getItem(`navGroupWidth_${view.viewId}`);
    w = !w ? _.get(view, 'advancedSetting.navwidth') || defaultNavOpenW : w;
    setGroupFilterWidth(w);
  };
  useEffect(() => {
    globalEmitter.emit('UPDATE_GLOBAL_STORE', 'activeWorksheet', {
      ...worksheetInfo,
      isCharge,
    });
  }, [worksheetInfo, isCharge]);
  useEffect(() => {
    window.openViewConfig = () => {
      setViewConfigVisible(true);
      setViewConfigTab('DebugConfig');
    };
    return () => {
      updateGroupFilter([], view);
      delete window.openViewConfig;
      globalEmitter.emit('UPDATE_GLOBAL_STORE', 'activeWorksheet');
    };
  }, []);
  return (
    <SheetContext.Provider
      value={{
        isCharge,
        projectId: worksheetInfo.projectId,
        appId,
        groupId,
        worksheetId,
        config,
        isRequestingRelationControls: worksheetInfo.isRequestingRelationControls,
        view,
        controls,
        sheetButtons,
        printList,
        sheetSwitchPermit,
      }}
    >
      <Con className="worksheetSheet">
        {type === 'common' && worksheetName && (
          <DocumentTitle
            title={`${worksheetName || ''} - ${(window.appInfo && window.appInfo.showName) || _l('应用')}`}
          />
        )}
        {loading ? (
          <Loading>
            <Skeleton direction="row" widths={['140px']} active itemStyle={{ margin: '10px 0 9px' }} />
            <Skeleton
              direction="row"
              widths={['26px', '64px', '64px', '64px']}
              active
              itemStyle={{ margin: '10px 10px 10px 0' }}
            />
          </Loading>
        ) : (
          <React.Fragment>
            {type === 'common' && (
              <React.Fragment>
                <SheetHeader {...basePara} />
                <ViewControl {...basePara} viewConfigTab={viewConfigTab} view={_.cloneDeep(view)} />
              </React.Fragment>
            )}
            {type === 'single' && <SheetHeader {...basePara} onlyBatchOperate />}
            {type === 'single' && (
              <ViewControl
                {...basePara}
                viewConfigTab={viewConfigTab}
                view={_.cloneDeep(view)}
                type="exportSheetButton"
                emitter={emitter}
              />
            )}
            <Con id="worksheetRightContentBox" className={cx({ viewConfigVisible })}>
              {showQuickFilter && (
                <QuickFilterCon>
                  {worksheetInfo.isRequestingRelationControls ? (
                    <div style={{ height: 50, overflow: 'hidden' }}>
                      <Skeleton direction="row" widths={['140px']} active itemStyle={{ margin: '20px 0' }} />
                    </div>
                  ) : (
                    <QuickFilter
                      {...basePara}
                      showTextAdvanced
                      filters={setSysWorkflowTimeControlFormat(quickFilterWithDefault, worksheetInfo.switches)}
                    />
                  )}
                </QuickFilterCon>
              )}
              {hasGroupFilter && !chartId ? (
                <ConView>
                  {dragMaskVisible && (
                    <DragMask
                      value={groupFilterWidth}
                      min={MinNavW}
                      max={MaxNavW}
                      onChange={value => {
                        setDragMaskVisible(false);
                        setGroupFilterWidth(value);
                        safeLocalStorageSetItem(`navGroupWidth_${view.viewId}`, value);
                      }}
                    />
                  )}
                  <GroupFilter
                    key={view.viewId}
                    width={groupFilterWidth}
                    isOpenGroup={isOpenGroup}
                    changeGroupStatus={isOpen => {
                      setIsOpenGroup(isOpen);
                      safeLocalStorageSetItem('navGroupIsOpen', isOpen);
                      if (isOpen) {
                        setOpenNavW();
                      } else {
                        setGroupFilterWidth(defaultNavCloseW);
                      }
                    }}
                  />
                  {!(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) &&
                    isOpenGroup && <Drag left={groupFilterWidth} onMouseDown={() => setDragMaskVisible(true)} />}
                  {viewComp}
                </ConView>
              ) : (
                viewComp
              )}
            </Con>
          </React.Fragment>
        )}
      </Con>
    </SheetContext.Provider>
  );
}

Sheet.propTypes = {
  flag: PropTypes.string,
  type: PropTypes.string,
  loading: PropTypes.bool,
  appId: PropTypes.string,
  groupId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  activeViewStatus: PropTypes.number,
  isCharge: PropTypes.bool,
  worksheetInfo: PropTypes.shape({}),
  appPkg: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  views: PropTypes.arrayOf(PropTypes.shape({})),
  loadWorksheet: PropTypes.func,
};

export default connect(
  state => ({
    appId: state.sheet.base.appId,
    appPkg: state.appPkg,
    groupId: state.sheet.base.groupId,
    worksheetId: state.sheet.base.worksheetId,
    viewId: state.sheet.base.viewId,
    chartId: state.sheet.base.chartId,
    worksheetInfo: state.sheet.worksheetInfo,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    error: state.sheet.error,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
    quickFilter: state.sheet.quickFilter,
    filtersGroupOfState: state.sheet.filtersGroup,
    quickFilterWithDefault: state.sheet.quickFilterWithDefault,
    navGroupFilters: state.sheet.navGroupFilters,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit,
    sheetButtons: state.sheet.sheetButtons,
    printList: state.sheet.printList,
    viewRowsLoading: get(state, 'sheet.viewRowsLoading', false),
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, [
        'refreshSheet',
        'updateBase',
        'updateFilters',
        'updateQuickFilter',
        'loadWorksheet',
        'updateGroupFilter',
        'openNewRecord',
        'fireWhenViewLoaded',
      ]),
      dispatch,
    ),
)(errorBoundary(Sheet));
