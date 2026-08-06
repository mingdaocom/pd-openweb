import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _, { identity } from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import QuickFilterSearch from 'mobile/RecordList/QuickFilter/QuickFilterSearch';
import * as actions from 'mobile/RecordList/redux/actions';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import * as worksheetActions from 'src/pages/worksheet/redux/actions';
import * as navFilterActions from 'src/pages/worksheet/redux/actions/navFilter';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import { getRequest } from 'src/utils/common';
import { emitter } from 'src/utils/common';
import { mdAppResponse } from 'src/utils/project';
import {
  filterButtonBySheetSwitchPermit,
  getHighAuthSheetSwitchPermit,
  getSheetOperateButtonIds,
  getSheetOperatesButtons,
} from 'src/utils/worksheet';
import GroupFilter from '../GroupFilter';
import GroupFilterList from '../GroupFilter/GroupFilterList';
import MobileSheetContext from '../MobileSheetContext';
import { WithoutRows } from '../SheetRows';

const { board, sheet, calendar, gallery, structure, gunter, detail, customize, resource, map } = VIEW_DISPLAY_TYPE;

const SheetView = lazy(() => import('./SheetView'));
const HierarchyView = lazy(() => import('./HierarchyView'));
const BoardView = lazy(() => import('./BoardView'));
const GalleryView = lazy(() => import('./GalleryView'));
const CalendarView = lazy(() => import('./CalendarView'));
const GunterView = lazy(() => import('./GunterView'));
const DetailView = lazy(() => import('./DetailView'));
const ResourceView = lazy(() => import('./ResourceView'));
const MobileMapView = lazy(() => import('./MapView'));
const CustomWidgetView = lazy(() => import('./CustomWidgetView'));

const TYPE_TO_COMP = {
  [sheet]: SheetView,
  [structure]: HierarchyView,
  [board]: BoardView,
  [gallery]: GalleryView,
  [calendar]: CalendarView,
  [gunter]: GunterView,
  [detail]: DetailView,
  [resource]: ResourceView,
  [map]: MobileMapView,
  [customize]: CustomWidgetView,
};

class View extends Component {
  constructor(props) {
    super(props);
    this.viewComRef = React.createRef();
    this.checkWorksheetRowsBtnDebounced = _.debounce(this.checkWorksheetRowsBtn, 120);
    this.buttonsCheckRequestKey = '';
  }
  componentDidMount() {
    const { view, base = {} } = this.props;
    const { getFilters, openMode } = getRequest();

    if (openMode) {
      window.APP_OPEN_NEW_PAGE = openMode === 'tab'; // 导航模式下记录详情、新建记录等在APP内新开页打开
    } else {
      window.APP_OPEN_NEW_PAGE = base.type === 'single';
    }

    if (getFilters === 'true') {
      mdAppResponse({ sessionId: 'Filter test session', type: 'getFilters' }).then(data => {
        const { value = [] } = data;
        this.props.updateFilterControls(value);
        this.props.changeMobileGroupFilters([]);
      });
    }

    if (_.includes([0, 3, 6], view.viewType)) {
      if (this.props.mobileNavGroupFilters.length) {
        this.props.fetchSheetRows({ navGroupFilters: this.props.mobileNavGroupFilters });
      } else if (base.type !== 'single') {
        this.props.fetchSheetRows();
      }
    }

    emitter.addListener('MOBILE_RELOAD_RECORD_INFO', this.refreshList);

    if (base.type !== 'single') {
      workflowPushSoket();
    }

    this.props.handleLoadOperateButtons({ worksheetInfo: this.props.worksheetInfo });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (!_.isEqual(prevProps.mobileNavGroupFilters, this.props.mobileNavGroupFilters)) {
        prevProps.fetchSheetRows({
          navGroupFilters: this.props.mobileNavGroupFilters,
        });
      }

      this.prepareCheckWorksheetRowsBtn(this.props, prevProps);
    }
  }
  componentWillUnmount() {
    window.APP_OPEN_NEW_PAGE = undefined;
    this.checkWorksheetRowsBtnDebounced.cancel();
    emitter.removeListener('MOBILE_RELOAD_RECORD_INFO', this.refreshList);
    if (!window.IM) return;
    IM.socket.off('workflow_push');
  }
  getOperateButtons = props => {
    const { view, sheetButtons, printList, sheetSwitchPermit } = props;
    let operatesButtons = getSheetOperatesButtons(view, {
      buttons: sheetButtons,
      printList,
    });
    operatesButtons = filterButtonBySheetSwitchPermit(operatesButtons, sheetSwitchPermit, view.viewId);
    return operatesButtons;
  };

  prepareCheckWorksheetRowsBtn = (nextProps, prevProps) => {
    const { currentSheetRows, base, view } = nextProps;
    const operatesButtons = this.getOperateButtons(nextProps);
    const rowIds = currentSheetRows.map(r => r.rowid).filter(identity);
    const btnIds = getSheetOperateButtonIds(operatesButtons);

    if (
      [0, 1, 3].includes(view.viewType) &&
      !_.isEmpty(rowIds) &&
      !_.isEmpty(btnIds) &&
      (!_.isEqual(currentSheetRows, prevProps.currentSheetRows) ||
        !_.isEqual(operatesButtons, this.getOperateButtons(prevProps)))
    ) {
      this.checkWorksheetRowsBtnDebounced({
        worksheetId: base?.worksheetId,
        rowIds,
        btnIds,
        updateButtonsCheckStatus: nextProps.updateButtonsCheckStatus,
      });
    }

    if (
      nextProps.base.viewId === prevProps.base.viewId &&
      nextProps.batchOptCheckedData.length &&
      _.isEmpty(nextProps.viewPermission)
    ) {
      const { appId, worksheetId, viewId } = nextProps.base || {};
      nextProps.updateMobileViewPermission({ appId, worksheetId, viewId });
    }
  };

  checkWorksheetRowsBtn = ({ worksheetId, rowIds, btnIds, updateButtonsCheckStatus = () => {} }) => {
    const requestKey = [worksheetId, rowIds.join(','), btnIds.join(',')].join('|');
    this.buttonsCheckRequestKey = requestKey;

    worksheetAjax.checkWorksheetRowsBtn({ worksheetId, rowIds, btnIds }).then(data => {
      if (this.buttonsCheckRequestKey !== requestKey) {
        return;
      }

      const buttonsCheckStatus = {};
      data.forEach(item => {
        item.rowIds.forEach(rowId => {
          buttonsCheckStatus[`${rowId}-${item.btnId}`] = true;
        });
      });
      updateButtonsCheckStatus(buttonsCheckStatus, { rowIds, btnIds });
    });
  };

  refreshList = ({ worksheetId, recordId }) => {
    const { view, base = {}, currentSheetRows = [], updateRow } = this.props;

    if (worksheetId === base.worksheetId && _.find(currentSheetRows, r => r.rowid === recordId)) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          viewId: view.viewId,
          worksheetId: base.worksheetId,
        })
        .then(row => {
          updateRow({ recordId, rowData: row, isViewData: row.isViewData });
        });
    }
  };
  renderError() {
    return (
      <div
        className="withoutRows flex flexColumn alignItemsCenter justifyContentCenter"
        style={{ backgroundColor: 'var(--color-background-secondary)' }}
      >
        <i className="icon icon-computer" style={{ fontSize: 100 }} />
        <div className="Font17 mTop12">{_l('移动端暂不支持此视图')}</div>
        <div className="Font17">{_l('请前往电脑端进行查看')}</div>
      </div>
    );
  }
  render() {
    const {
      view,
      base,
      isCharge,
      appNaviStyle,
      hasDebugRoles,
      controls,
      sheetSwitchPermit = [],
      worksheetInfo,
      filters,
      quickFilterWithDefault,
      savedFilters,
      activeSavedFilter,
      batchOptVisible,
      batchOptCheckedData,
      batchCheckAll,
      filterControls,
      updateFilters = () => {},
      updateActiveSavedFilter = () => {},
      sheetButtons,
      printList,
      buttonsCheckStatus,
      config = {},
      appDetail,
    } = this.props;

    const { viewType, advancedSetting = {} } = view;

    if (viewType === 2 && advancedSetting.hierarchyViewType === '3') {
      return this.renderError();
    }

    // if (viewResultCode !== 1 || _.isEmpty(view)) {
    //   return (
    //     <State
    //       resultCode={_.isEmpty(view) ? 7 : viewResultCode}
    //       type={worksheetInfo.resultCode !== 1 ? 'sheet' : 'view'}
    //     />
    //   );
    // }

    if (_.isEmpty(view)) {
      return null;
    }

    const navData = (_.get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === _.get(view, 'navGroup[0].controlId'),
    );
    let hasGroupFilter =
      view.viewId === base.viewId &&
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      !location.search.includes('chartId') &&
      _.includes([sheet, gallery, map], String(view.viewType)) &&
      navData; // 是否存在分组列表

    const Component = TYPE_TO_COMP[String(view.viewType)];
    const viewProps = {
      ...base,
      isCharge,
      view,
      hasDebugRoles,
      appNaviStyle,
      controls,
      sheetSwitchPermit,
      hasGroupFilter,
    };

    const sheetControls = _.get(worksheetInfo, ['template', 'controls']);

    const quickFilter = _.includes([customize], String(viewType)) ? this.props.pcQuickFilter : this.props.quickFilter;
    const isFilter = quickFilter.length;
    const lastSheetSwitchPermit =
      isHaveCharge(_.get(appDetail, 'detail.permissionType')) && base.viewId === worksheetInfo.worksheetId
        ? getHighAuthSheetSwitchPermit(sheetSwitchPermit, worksheetInfo.worksheetId)
        : sheetSwitchPermit;
    const canFilter = isOpenPermit(permitList.filterSwitch, lastSheetSwitchPermit);
    const needClickToSearch = _.get(view, 'advancedSetting.clicksearch') === '1';
    const isBottomNav = appNaviStyle === 2 && location.href.includes('mobile/app'); // 底部导航
    let checkedCount = batchOptCheckedData.length;

    const providerValue = {
      isCharge,
      base,
      view,
      controls,
      sheetButtons,
      printList,
      sheetSwitchPermit,
      worksheetInfo,
      buttonsCheckStatus,
      appDetail: appDetail.detail,
    };
    const ViewComponent = <Component ref={this.viewComRef} {...viewProps} />;

    if (
      hasGroupFilter &&
      ((String(view.viewType) === sheet && advancedSetting.appnavtype === '1') || String(view.viewType) !== sheet)
    ) {
      return (
        <MobileSheetContext.Provider value={providerValue}>
          <div className="overflowHidden flex Relative mobileView">
            <GroupFilter
              {...this.props}
              canFilter={canFilter}
              changeMobielSheetLoading={this.props.changeMobielSheetLoading}
              groupId={this.props.base.groupId}
            />
          </div>
        </MobileSheetContext.Provider>
      );
    }

    return (
      <MobileSheetContext.Provider value={providerValue}>
        <div className="overflowHidden flex mobileView flexColumn Relative">
          {batchOptVisible && (
            <div className="batchOptBar flexRow Font16">
              <a
                onClick={() => {
                  this.props.changeBatchOptVisible(false);
                  this.props.changeBatchOptData([]);
                }}
              >
                {_l('取消')}
              </a>
              {_.isEmpty(batchOptCheckedData) && <span>{_l('请选择')}</span>}
              {!_.isEmpty(batchOptCheckedData) && <span>{_l(`已选中%0条`, checkedCount)}</span>}
              <a onClick={() => this.props.updateBatchCheckAll(!batchCheckAll)}>
                {batchCheckAll ? _l('取消全选') : _l('全选')}
              </a>
            </div>
          )}
          {(_.includes([gallery, resource, board, sheet], String(viewType)) ||
            (String(viewType) === detail && view.childType !== 1) ||
            (String(viewType) === customize && !_.isEmpty(quickFilterWithDefault))) && (
            <QuickFilterSearch
              className={
                String(viewType) === customize ? `fixedMobileQuickFilter ${isBottomNav ? 'bottom70' : ''}` : ''
              }
              showSearch={String(viewType) === customize ? false : true}
              isFilter={isFilter}
              filters={filters}
              detail={detail}
              view={view}
              worksheetInfo={worksheetInfo}
              filterControls={filterControls}
              sheetControls={sheetControls}
              updateFilters={updateFilters}
              quickFilterWithDefault={quickFilterWithDefault}
              savedFilters={savedFilters}
              activeSavedFilter={activeSavedFilter}
              updateActiveSavedFilter={updateActiveSavedFilter}
              base={base}
              config={config}
              canFilter={canFilter}
            />
          )}
          {_.includes(
            [gallery, resource, customize, board],
            String(viewType) || (String(viewType) === detail && view.childType !== 1),
          ) &&
          needClickToSearch &&
          _.isEmpty(quickFilter) ? (
            <WithoutRows text={_l('执行查询后显示结果')} />
          ) : hasGroupFilter &&
            String(view.viewType) === sheet &&
            advancedSetting.appnavtype === '3' &&
            !_.includes([29, 35], navData.type) ? (
            <div className="flexRow h100">
              <GroupFilterList
                className="columnGroupFilter"
                style={{ width: advancedSetting.appnavwidth ? +advancedSetting.appnavwidth : 60 }}
                showSearch={false}
              />
              <div className="flex minWidth0">
                <Suspense fallback={null}>{ViewComponent}</Suspense>
              </div>
            </div>
          ) : (
            <Suspense fallback={null}>{ViewComponent}</Suspense>
          )}
        </div>
      </MobileSheetContext.Provider>
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    views: state.sheet.views,
    ...state.sheet,
    sheetSwitchPermit: state.mobile.sheetSwitchPermit,
    pcQuickFilter: state.sheet.quickFilter,
    ..._.pick(state.mobile, [
      'base',
      'isCharge',
      'worksheetInfo',
      'viewResultCode',
      'mobileNavGroupFilters',
      'batchOptVisible',
      'appColor',
      'currentSheetRows',
      'filters',
      'quickFilter',
      'quickFilterWithDefault',
      'savedFilters',
      'activeSavedFilter',
      'batchCheckAll',
      'batchOptCheckedData',
      'viewPermission',
      'filterControls',
      'sheetButtons',
      'printList',
      'buttonsCheckStatus',
      'appDetail',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick({ ...worksheetActions, ...actions, ...navFilterActions }, [
          'fetchSheetRows',
          'getNavGroupCount',
          'changeMobielSheetLoading',
          'updateMobileViewPermission',
          'addNewRecord',
          'openNewRecord',
          'changeBatchOptVisible',
          'changeMobileGroupFilters',
          'unshiftSheetRow',
          'updateRow',
          'updateGroupFilter',
          'updateFilters',
          'updateActiveSavedFilter',
          'changeBatchOptData',
          'updateBatchCheckAll',
          'updateFilterControls',
          'handleLoadOperateButtons',
          'updateButtonsCheckStatus',
        ]),
      },
      dispatch,
    ),
  null,
  { forwardRef: true },
)(View);
