import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _, { cloneDeep, get, isFunction, pick } from 'lodash';
import PropTypes, { bool, func, shape } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { getRowDetail } from 'worksheet/api';
import { batchEditRecord } from 'worksheet/common/BatchEditRecord';
import RecordInfo from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { getSheetViewRows, getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import OperateButtons from 'worksheet/components/OperateButtons';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { ColumnHead, RowHead, SummaryCell } from 'worksheet/components/WorksheetTable/components/';
import { ROW_HEIGHT, SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import {
  refreshWorksheetControls,
  saveView,
  updateWorksheetInfo,
  updateWorksheetSomeControls,
} from 'worksheet/redux/actions';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';
import { isHaveCharge } from 'worksheet/redux/actions/util';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { putControlByOrder } from 'src/pages/widgetConfig/util';
import { renderBatchSetDialog } from 'src/pages/worksheet/common/ViewConfig/components/BatchSet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { browserIsMobile, emitter, getLRUWorksheetConfig } from 'src/utils/common';
import { getAdvanceSetting, getHighAuthControls } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import { getRecordColorConfig, handleRecordClick } from 'src/utils/record';
import {
  filterButtonBySheetSwitchPermit,
  getOperatesButtonsWidth,
  getSheetOperatesButtons,
  getSheetOperatesButtonsStyle,
} from 'src/utils/worksheet';
import SheetContext from '../common/Sheet/SheetContext';
import ToolBar from './HierarchyView/ToolBar';

@autoSize
class TableView extends React.Component {
  static propTypes = {
    isTreeTableView: bool,
    worksheetInfo: PropTypes.shape({}),
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    sheetFetchParams: PropTypes.shape({}),
    sheetViewData: PropTypes.shape({}),
    sheetViewConfig: PropTypes.shape({}),
    updateDefaultScrollLeft: PropTypes.func,
    updateRows: PropTypes.func,
    hideRows: PropTypes.func,
    clearHighLight: PropTypes.func,
    fetchRows: PropTypes.func,
    setHighLight: PropTypes.func,
    changeWorksheetSheetViewSummaryType: PropTypes.func,
    updateViewPermission: PropTypes.func,
    getWorksheetSheetViewSummary: PropTypes.func,
    updateSheetColumnWidths: PropTypes.func,
    updateWorksheetSomeControls: PropTypes.func,
    initAbortController: PropTypes.func,
    abortRequest: PropTypes.func,
  };

  table = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      disableMaskDataControls: {},
    };
    this.tableId = uuidv4();
    this.shiftActiveRowIndex = 0;
    if (isFunction(props.initAbortController)) {
      props.initAbortController();
    }
  }

  componentDidMount() {
    const { view, fetchRows, setRowsEmpty, navGroupFilters, noLoadAtDidMount, setViewLayout = () => {} } = this.props;
    if (!!this.chartId) {
      fetchRows({ isFirst: true });
    } else if (
      get(view, 'advancedSetting.clicksearch') === '1' ||
      (this.navGroupToSearch() && _.isEmpty(navGroupFilters))
    ) {
      setRowsEmpty();
      setViewLayout(view.viewId);
    } else if (!noLoadAtDidMount) {
      fetchRows({ isFirst: true });
    }
    document.body.addEventListener('click', this.outerClickEvent);
    emitter.addListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    this.bindShift();
  }

  componentWillReceiveProps(nextProps) {
    const {
      view,
      fetchRows,
      setRowsEmpty,
      changePageIndex,
      refresh,
      navGroupFilters,
      quickFilter,
      setColumnStyles,
      getWorksheetSheetViewSummary,
      abortRequest = () => {},
      setViewLayout = () => {},
    } = nextProps;
    const changeView = this.props.worksheetId === nextProps.worksheetId && this.props.viewId !== nextProps.viewId;
    if (!_.isEqual(get(nextProps, ['navGroupFilters']), get(this.props, ['navGroupFilters']))) {
      changePageIndex(1);
    }
    const noNavGroup = this.navGroupToSearch(nextProps) && _.isEmpty(navGroupFilters);
    const quickFilterNeedClickToSearch =
      !(nextProps.chartId || nextProps.chartIdFromUrl) &&
      get(nextProps, 'view.advancedSetting.clicksearch') === '1' &&
      _.isEmpty(quickFilter);
    if (changeView) {
      abortRequest();
      if (noNavGroup || get(view, 'advancedSetting.clicksearch') === '1') {
        setRowsEmpty();
        setViewLayout(view.viewId);
      } else {
        fetchRows({ changeView });
      }
    } else if (
      _.some(
        [
          'sheetFetchParams.pageIndex',
          'sheetFetchParams.sortControls',
          'view.moreSort',
          'view.advancedSetting.clicksearch',
          'view.advancedSetting.enablerules',
          'navGroupFilters',
          'view.navGroup',
          'view.advancedSetting.showallitem',
          'view.advancedSetting.shownullitem',
          'view.advancedSetting.topshow',
          'view.advancedSetting.topfilters',
          'view.advancedSetting.defaultlayer',
          'view.advancedSetting.fastedit',
          'view.advancedSetting.defaultsort',
          'view.viewControl',
        ],
        key => !_.isEqual(get(nextProps, key), get(this.props, key)),
      )
    ) {
      if (noNavGroup || quickFilterNeedClickToSearch) {
        setRowsEmpty();
      } else {
        fetchRows();
      }
    } else if (
      get(this.props, 'view.advancedSetting.refreshtime') !== get(nextProps, 'view.advancedSetting.refreshtime')
    ) {
    } else if (get(this.props, 'sheetViewData.refreshFlag') !== get(nextProps, 'sheetViewData.refreshFlag')) {
      this.setState({ disableMaskDataControls: {} });
    } else if (get(this.props, 'view.advancedSetting.sheettype') !== get(nextProps, 'view.advancedSetting.sheettype')) {
      refresh();
    }
    if (
      _.some(['view.advancedSetting.liststyle'], key => !_.isEqual(get(nextProps, key), get(this.props, key))) ||
      _.some(['worksheetInfo.advancedSetting.liststyle'], key => !_.isEqual(get(nextProps, key), get(this.props, key)))
    ) {
      setColumnStyles(nextProps.view, nextProps.worksheetInfo);
      getWorksheetSheetViewSummary({ reset: true });
    }
  }

  navGroupToSearch = props => {
    const { view, worksheetInfo } = props || this.props;
    const navGroupData = (get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === get(view, 'navGroup[0].controlId'),
    );
    //设置了筛选列表，且未显示全部，需选择分组后显示
    return (
      !!navGroupData &&
      get(view, 'advancedSetting.showallitem') === '1' &&
      !get(view, 'navGroup[0].viewId') &&
      get(view, 'navGroup').length > 0
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      _.some(
        ['recordInfoVisible', 'disableMaskDataControls'],
        key => !_.isEqual(get(nextState, key), get(this.state, key)),
      ) ||
      _.some(
        [
          'sheetViewData',
          'treeTableViewData',
          'sheetViewConfig',
          'editingControls',
          'controls',
          'view.rowHeight',
          'view.showControls',
          'view.controls',
          'view.moreSort',
          'view.advancedSetting',
          'buttons',
          'printList',
          'worksheetInfo.isRequestingRelationControls',
          'operateButtonLoading',
        ],
        key => !_.isEqual(get(nextProps, key), get(this.props, key)),
      )
    );
  }

  componentWillUnmount() {
    const { abortRequest = () => {} } = this.props;
    document.body.removeEventListener('click', this.outerClickEvent);
    emitter.removeListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    this.unbindShift();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    abortRequest();
  }

  bindShift() {
    window.addEventListener('keydown', this.activeShift);
    window.addEventListener('keyup', this.deActiveShift);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  unbindShift() {
    window.removeEventListener('keydown', this.activeShift);
    window.removeEventListener('keyup', this.deActiveShift);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  activeShift = e => {
    if (e.keyCode === 16) {
      this.shiftActive = true;
      document.querySelector('#worksheetRightContentBox').classList.add('noSelect');
    }
  };

  deActiveShift = e => {
    if (e.keyCode === 16) {
      this.shiftActive = false;
      document.querySelector('#worksheetRightContentBox').classList.remove('noSelect');
    }
  };

  handleWindowBlur = () => {
    this.shiftActive = false;
    document.querySelector('#worksheetRightContentBox').classList.remove('noSelect');
  };

  outerClickEvent = e => {
    const { clearHighLight } = this.props;
    if (
      !$(e.target).closest('.sheetViewTable, .recordInfoCon, .workSheetNewRecord, .mdModal')[0] ||
      /-grid/.test(e.target.className)
    ) {
      clearHighLight(this.tableId);
      $(`.sheetViewTable.id-${this.tableId}-id .cell`).removeClass('hover');
    }
  };

  updateRecordEvent = ({ worksheetId, recordId }) => {
    const { viewId, controls, updateRows, hideRows, sheetViewData } = this.props;
    const { rows } = sheetViewData;
    if (worksheetId === this.props.worksheetId && _.find(rows, r => r.rowid === recordId)) {
      getRowDetail({
        checkView: true,
        getType: 1,
        rowId: recordId,
        viewId,
        worksheetId,
        controls,
      }).then(row => {
        if (row.resultCode === 1 && row.isViewData) {
          updateRows(
            [recordId],
            [{}, ...row.formData].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value })),
          );
        } else {
          hideRows([recordId]);
        }
      });
    }
  };

  handleCellClick = (cell, row, rowIndex) => {
    if (get(this, 'props.worksheetInfo.isRequestingRelationControls')) {
      return;
    }

    const { setHighLight, worksheetId, view } = this.props;
    handleRecordClick(view, row, () => {
      addBehaviorLog('worksheetRecord', worksheetId, { rowId: row.rowid }); // 埋点
      setHighLight(this.tableId, rowIndex);
      const newState = {
        recordInfoVisible: row,
        recordId: row.rowid,
      };
      if (cell && cell.type === 29 && cell.enumDefault === 2) {
        newState.activeRelateTableControlIdOfRecord = cell.controlId;
      }
      window.activeTableId = undefined;
      this.setState(newState);
    });
  };

  handleCellMouseDown = ({ rowIndex }) => {
    const { setHighLight } = this.props;
    setHighLight(this.tableId, rowIndex);
  };

  get levelCount() {
    const levelCount = get(this, 'props.treeTableViewData.levelCount');
    if (levelCount && Number(levelCount) <= 5) {
      return levelCount;
    }
    return 1;
  }

  get showControlStyle() {
    const { view } = this.props;
    return get(view, 'advancedSetting.controlstyle') === '1';
  }

  get tableType() {
    const { view } = this.props;
    return get(view, 'advancedSetting.sheettype') === '1' ? 'classic' : 'simple';
  }

  get columns() {
    const { isTreeTableView, view, showControlIds = [], treeTableViewData, isCharge } = this.props;
    const { maxLevel } = treeTableViewData;
    const rows = get(this.props, 'sheetViewData.rows') || [];
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, this.sheetSwitchPermit);
    const controls = isShowWorkflowSys
      ? this.props.controls
      : this.props.controls.filter(it => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, it.controlId));
    const { sheetHiddenColumns } = this.props.sheetViewConfig;

    if (showControlIds && showControlIds.length) {
      return showControlIds.map(cid => _.find(controls, { controlId: cid })).filter(_.identity);
    }

    let columns = [];
    let filteredControls = controls
      .map(c => ({ ...c }))
      .filter(
        control =>
          !_.includes(SHEET_VIEW_HIDDEN_TYPES, control.type) &&
          (this.isManageView ||
            (!_.find(sheetHiddenColumns.concat(view.controls), cid => cid === control.controlId) &&
              controlState(control).visible)),
      );
    let { showControls = [] } = view || {};
    let { customdisplay = '0', sysids = '[]', syssort = '[]' } = getAdvanceSetting(view); // '0':表格显示列与表单中的字段保持一致 '1':自定义显示列
    if (showControls.length) {
      customdisplay = '1';
    }

    if (customdisplay === '1') {
      columns = _.uniqBy(showControls)
        .map(id => _.find(filteredControls, c => c.controlId === id))
        .filter(_.identity);
    } else {
      try {
        sysids = JSON.parse(sysids);
        syssort = JSON.parse(syssort);
      } catch (err) {
        sysids = [];
        syssort = [];
      }
      columns = filteredControls
        .filter(
          c =>
            !_.includes(
              [
                'ownerid',
                'caid',
                'ctime',
                'utime',
                'wfname',
                'wfstatus',
                'wfcuaids',
                'wfrtime',
                'wfftime',
                'wfdtime',
                'wfcaid',
                'wfctime',
                'wfcotime',
                'rowid',
                'uaid',
              ],
              c.controlId,
            ),
        )
        .slice(0);

      columns = _.flatten(putControlByOrder(columns))
        .slice(0, 50)
        .concat(
          syssort
            .filter(ssid => _.includes(sysids, ssid))
            .map(ssid => _.find(filteredControls, { controlId: ssid }))
            .filter(_.identity),
        );
    }
    if (!columns.length) {
      columns = [{}];
    }

    const noSystemColumns = columns.filter(
      it => !_.includes([...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT], it.controlId),
    );
    const workflowSysColumns = columns.filter(it => _.includes(WORKFLOW_SYSTEM_FIELDS_SORT, it.controlId));
    const normalSysColumns = columns.filter(it => _.includes(NORMAL_SYSTEM_FIELDS_SORT, it.controlId));
    columns = _.isEmpty(showControls) ? [...workflowSysColumns, ...noSystemColumns, ...normalSysColumns] : columns;
    if (isTreeTableView) {
      let titleControl;
      const newColumns = [];
      columns.forEach(c => {
        if (c.attribute === 1) {
          titleControl = c;
        } else {
          newColumns.push(c);
        }
      });
      columns = (titleControl ? [titleControl] : []).concat(newColumns);
    }
    if (isTreeTableView && columns[0]) {
      const appendWidth = getTreeExpandCellWidth(maxLevel, rows.length);
      this.expandCellAppendWidth = appendWidth;
      columns[0].appendWidth = appendWidth;
      columns[0].hideFrozen = true;
      columns[0].isTreeExpandCell = true;
    }
    return this.isManageView ? getHighAuthControls(columns) : columns;
  }

  get lineNumberBegin() {
    const { pageIndex, pageSize } = this.props.sheetFetchParams;
    return (pageIndex - 1) * pageSize;
  }

  get chartId() {
    return this.props.chartId || this.props.chartIdFromUrl;
  }
  get readonly() {
    return !!this.chartId || get(window, 'shareState.isPublicView') || get(window, 'shareState.isPublicPage');
  }

  get disabledFunctions() {
    const { chartId } = this;
    if (chartId || this.props.isTreeTableView) {
      return ['filter'];
    } else {
      return [];
    }
  }

  get rowHeadOnlyNum() {
    return !!this.chartId;
  }

  get highLightRows() {
    try {
      const rows = get(this.props, 'sheetViewData.rows');
      const { allWorksheetIsSelected, sheetSelectedRows } = this.props.sheetViewConfig || {};
      return [
        {},
        ...(allWorksheetIsSelected
          ? rows.filter(row => !_.find(sheetSelectedRows, r => r.rowid === row.rowid)).map(row => row.rowid)
          : sheetSelectedRows.map(row => row.rowid)),
      ].reduce((a, b) => ({ ...a, [b]: true }));
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  get hideRowHead() {
    const { isTreeTableView, view, viewId } = this.props;
    const { tableType } = this;
    const showOperate = (get(view, 'advancedSetting.showquick') || '1') === '1';
    const showNumber = (get(view, 'advancedSetting.showno') || '1') === '1' && !isTreeTableView;
    const allowBatchEdit = isOpenPermit(permitList.batchEdit, this.sheetSwitchPermit, viewId);
    return tableType !== 'classic' && !showOperate && !allowBatchEdit && !showNumber;
  }

  get hasBatch() {
    return isOpenPermit(permitList.batchGroup, this.sheetSwitchPermit);
  }

  get numberWidth() {
    const { sheetViewData } = this.props;
    const { rows } = sheetViewData;
    const { lineNumberBegin } = this;
    let numberWidth = String(lineNumberBegin + rows.length).length * 8;
    return numberWidth > 14 ? numberWidth : 14;
  }

  get rowHeadWidth() {
    const { view, isTreeTableView } = this.props;
    const { numberWidth } = this;
    const showOperate = (get(view, 'advancedSetting.showquick') || '1') === '1';
    const showNumber = (get(view, 'advancedSetting.showno') || '1') === '1' && !isTreeTableView;
    if (this.rowHeadOnlyNum) {
      return numberWidth + 24;
    }
    let rowHeadWidth = 24 + 24 + 8;
    if (showNumber || this.hasBatch) {
      rowHeadWidth += numberWidth + 8;
    }
    if (this.tableType === 'classic') {
      rowHeadWidth += 24 - 8;
    }
    if (this.tableType !== 'classic' && showOperate && !showNumber && !this.hasBatch) {
      rowHeadWidth -= 18;
    }
    return rowHeadWidth + 8;
  }

  get needClickToSearch() {
    return !this.chartId && get(this.props, 'view.advancedSetting.clicksearch') === '1';
  }

  get sheetSwitchPermit() {
    const { sheetSwitchPermit } = this.props;

    if (this.isManageView) {
      return sheetSwitchPermit.map(l => ({ ...l, state: true, viewIds: [] }));
    }

    return sheetSwitchPermit;
  }

  get isManageView() {
    const { viewId, worksheetId, appPkg } = this.props;

    return isHaveCharge(appPkg.permissionType) && viewId === worksheetId;
  }

  renderSummaryCell = ({ style, columnIndex, rowIndex }) => {
    const { viewId, sheetViewData, changeWorksheetSheetViewSummaryType, sheetViewConfig } = this.props;
    const { allWorksheetIsSelected, sheetSelectedRows } = sheetViewConfig;
    const { rowsSummary, rows } = sheetViewData;
    const control = [{ type: 'summaryhead' }].concat(this.columns)[columnIndex];
    return (
      <SummaryCell
        rowHeadOnlyNum={this.rowHeadOnlyNum}
        style={style}
        viewId={viewId}
        summaryType={control && rowsSummary.types[control.controlId]}
        summaryValue={control && rowsSummary.values[control.controlId]}
        control={control}
        rows={rows}
        selectedIds={sheetSelectedRows.map(r => r.rowid)}
        allWorksheetIsSelected={allWorksheetIsSelected}
        changeWorksheetSheetViewSummaryType={changeWorksheetSheetViewSummaryType}
      />
    );
  };

  renderColumnHead = ({ control, className, style, columnIndex, fixedColumnCount, scrollTo, ...rest }) => {
    const { tableId } = this;
    const {
      isCharge,
      appId,
      worksheetId,
      viewId,
      view,
      isTreeTableView,
      worksheetInfo,
      sheetViewConfig,
      updateDefaultScrollLeft,
      changePageIndex,
      filters,
      controls,
      quickFilter,
      navGroupFilters,
      refresh,
      clearSelect,
      updateRows,
      getWorksheetSheetViewSummary,
      sheetViewData,
      isDraft,
      updateWorksheetInfo,
      saveView,
      updateColumnStyles,
      saveColumnStylesToLocal,
    } = this.props;
    const { projectId } = worksheetInfo;
    const { allWorksheetIsSelected, sheetSelectedRows } = sheetViewConfig;
    const { disableMaskDataControls } = this.state;

    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, this.sheetSwitchPermit);
    return (
      <ColumnHead
        isDraft={isDraft}
        isCharge={isCharge}
        count={sheetViewData.count}
        worksheetId={worksheetId}
        viewId={viewId}
        className={className}
        style={style}
        control={
          disableMaskDataControls[control.controlId]
            ? {
                ...control,
                advancedSetting: Object.assign({}, control.advancedSetting, {
                  datamask: '0',
                }),
              }
            : control
        }
        disabledFunctions={this.disabledFunctions}
        readonly={this.readonly}
        disabled={(this.needClickToSearch && _.isEmpty(quickFilter)) || control.type === 'operates'}
        isLast={control.controlId === _.last(this.columns).controlId}
        isTreeTableView={isTreeTableView}
        columnIndex={columnIndex}
        fixedColumnCount={fixedColumnCount}
        rowIsSelected={!!(allWorksheetIsSelected || sheetSelectedRows.length)}
        onBatchSetColumns={() => {
          renderBatchSetDialog({
            columns: isShowWorkflowSys
              ? controls
              : controls.filter(it => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, it.controlId)),
            view,
            currentSheetInfo: worksheetInfo,
            onClose: () => {},
            visible: true,
            worksheetId,
            appId,
            updateCurrentView: (data, cb) => {
              saveView(viewId, pick(data, [...(data.editAttrs || []), 'editAdKeys']), cb);
            },
            updateWorksheetInfo,
            onStyleChange: newStyles => {
              const changes = newStyles.reduce((a, b) => Object.assign(a, { [b.cid]: _.omit(b, 'cid') }), {});
              if (!get(window, 'shareState.shareId')) {
                saveColumnStylesToLocal(changes);
              }
              updateColumnStyles(changes);
            },
          });
        }}
        canBatchEdit={isOpenPermit(permitList.batchEdit, this.sheetSwitchPermit, viewId)}
        onBatchEdit={() => {
          batchEditRecord({
            appId,
            viewId,
            projectId,
            activeControl: control,
            view,
            worksheetId,
            searchArgs: filters,
            quickFilter,
            clearSelect,
            allWorksheetIsSelected,
            updateRows,
            getWorksheetSheetViewSummary,
            reloadWorksheet: () => {
              changePageIndex(1);
              refresh();
            },
            selectedRows: sheetSelectedRows,
            worksheetInfo,
            navGroupFilters,
          });
        }}
        updateDefaultScrollLeft={({ xOffset = 0 } = {}) => {
          const scrollX = document.querySelector(`.id-${tableId}-id .scroll-x`);
          if (scrollX) {
            updateDefaultScrollLeft(scrollX.scrollLeft);
          }
        }}
        onShowFullValue={() => {
          if (window.shareState.shareId) return;
          this.setState({ disableMaskDataControls: { ...disableMaskDataControls, [control.controlId]: true } });
        }}
        {...rest}
      />
    );
  };

  renderRowHead = ({ className, key, style: cellstyle, columnIndex, rowIndex, control, data }) => {
    const {
      isTreeTableView,
      isCharge,
      isDevAndOps,
      appId,
      view,
      viewId,
      controls,
      worksheetInfo,
      buttons,
      sheetViewData,
      sheetViewConfig,
      getWorksheetSheetViewSummary,
      refreshWorksheetControls,
    } = this.props;
    // functions
    const {
      addRecord,
      selectRows,
      updateRows,
      hideRows,
      saveSheetLayout,
      resetSheetLayout,
      setHighLight,
      isDraft,
      printCharge,
    } = this.props;
    const { allowAdd, worksheetId, projectId } = worksheetInfo;
    const { allWorksheetIsSelected, sheetSelectedRows, sheetHiddenColumns } = sheetViewConfig;
    const showNumber = (get(view, 'advancedSetting.showno') || '1') === '1' && !isTreeTableView;
    const showOperate = (get(view, 'advancedSetting.showquick') || '1') === '1';
    const localLayoutUpdateTime = getLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    if (_.isEmpty(view) && !this.chartId) {
      return <span />;
    }
    return (
      <RowHead
        isDraft={isDraft}
        printCharge={printCharge}
        tableType={this.tableType}
        numberWidth={this.numberWidth}
        hasBatch={this.hasBatch}
        showNumber={showNumber}
        showOperate={showOperate}
        count={sheetViewData.count}
        readonly={this.readonly}
        isCharge={isCharge}
        isDevAndOps={isDevAndOps}
        rowHeadOnlyNum={this.rowHeadOnlyNum}
        tableId={this.tableId}
        layoutChangeVisible={
          isCharge &&
          (!!sheetHiddenColumns.length ||
            Number(localLayoutUpdateTime) >
              Number(view.advancedSetting.layoutupdatetime || view.advancedSetting.layoutUpdateTime || 0) ||
            !!getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', viewId))
        }
        className={className}
        {...{ appId, viewId, worksheetId }}
        columns={this.columns}
        controls={controls}
        projectId={projectId}
        allowAdd={allowAdd}
        style={cellstyle}
        lineNumberBegin={this.lineNumberBegin}
        canSelectAll={!!sheetViewData.rows.length}
        allWorksheetIsSelected={allWorksheetIsSelected}
        selectedIds={sheetSelectedRows.map(r => r.rowid)}
        sheetSwitchPermit={this.sheetSwitchPermit}
        customButtons={buttons}
        worksheetInfo={worksheetInfo}
        onSelectAllWorksheet={value => {
          selectRows({
            selectAll: value,
            rows: [],
          });
        }}
        onSelect={(newSelected, selectRowId) => {
          if (allWorksheetIsSelected) {
            selectRows({
              selectAll: false,
              rows: data
                .filter(function (row) {
                  return !_.find(newSelected, function (rowid) {
                    return row.rowid === rowid;
                  });
                })
                .filter(_.identity),
            });
          } else {
            const selectIndex = _.findIndex(data, r => r.rowid === selectRowId);
            if (this.shiftActive) {
              let startIndex = Math.min(...[selectIndex, this.shiftActiveRowIndex]);
              let endIndex = Math.max(...[selectIndex, this.shiftActiveRowIndex]);
              if (endIndex > data.length - 1) {
                endIndex = data.length - 1;
              }
              selectRows({
                rows: _.unionBy(data.slice(startIndex, endIndex + 1).concat(sheetSelectedRows), 'rowid'),
              });
            } else {
              this.shiftActiveRowIndex = selectIndex;
              selectRows({
                rows: newSelected.map(rowid => _.find(data, row => row.rowid === rowid)).filter(_.identity),
              });
            }
          }
        }}
        onReverseSelect={() => {
          if (allWorksheetIsSelected) {
            selectRows({
              selectAll: false,
              rows: [],
            });
          } else {
            selectRows({
              rows: data.filter(r => !_.find(sheetSelectedRows, row => row.rowid === r.rowid)).filter(_.identity),
            });
          }
        }}
        updateRows={updateRows}
        hideRows={rowIds => {
          hideRows(rowIds);
          getWorksheetSheetViewSummary();
        }}
        rowIndex={rowIndex}
        data={data}
        handleAddSheetRow={addRecord}
        saveSheetLayout={saveSheetLayout}
        resetSheetLayout={resetSheetLayout}
        setHighLight={setHighLight}
        refreshWorksheetControls={refreshWorksheetControls}
        onOpenRecord={() => {
          this.handleCellClick(undefined, data[rowIndex], rowIndex);
        }}
      />
    );
  };

  renderOperates = ({ className, style, control, row, rowIndex, onCellClick }) => {
    const { view, addRecord, setHighLight, hideRows, controls } = this.props;
    const recordId = row.rowid;
    return (
      <div
        style={style}
        className={className}
        onClick={e => {
          if (
            (e.target.classList.contains('cell') || e.target.parentElement.classList.contains('cell')) &&
            e.target.closest('.viewCon')
          ) {
            onCellClick(control, row, rowIndex);
          } else {
            e.stopPropagation();
          }
        }}
      >
        <OperateButtons
          row={row}
          rowHeight={ROW_HEIGHT[view.rowHeight] || 34}
          recordId={recordId}
          controls={controls}
          onCopySuccess={(...args) => {
            setHighLight(this.tableId, rowIndex + 1);
            addRecord(...args);
          }}
          onDeleteSuccess={() => {
            hideRows([recordId]);
          }}
        />
      </div>
    );
  };

  asyncUpdate(row, cell, options) {
    const { worksheetInfo, updateControlOfRow, controls, sheetSearchConfig, sheetViewData = {} } = this.props;
    const { rows = [] } = sheetViewData;
    row = _.find(rows, { rowid: row.rowid }) || {};
    const { projectId, rules = [] } = worksheetInfo;
    const asyncUpdateCell = (cid, newValue) => {
      if (typeof newValue === 'object' || cid === cell.controlId) {
        return;
      }
      updateControlOfRow({ recordId: row.rowid, cell: { controlId: cid, value: newValue }, rules });
    };
    const dataFormat = new DataFormat({
      data: controls.filter(c => c.advancedSetting).map(c => ({ ...c, value: (row || {})[c.controlId] || c.value })),
      projectId,
      rules,
      // masterData,
      searchConfig: sheetSearchConfig,
      onAsyncChange: changes => {
        if (!_.isEmpty(changes.controlIds)) {
          changes.controlIds.forEach(cid => {
            asyncUpdateCell(cid, changes.value);
          });
        } else if (changes.controlId) {
          asyncUpdateCell(changes.controlId, changes.value);
        }
      },
    });
    dataFormat.updateDataSource(cell);
    const data = dataFormat.getDataSource();
    const updatedIds = dataFormat.getUpdateControlIds();
    const updatedCells = data
      .filter(c => _.includes(updatedIds, c.controlId))
      .map(c => _.pick(c, ['controlId', 'controlName', 'type', 'value']));
    updatedCells.forEach(c => {
      if (c.controlId === cell.controlId) {
        c.editType = cell.editType;
      }
    });
    updateControlOfRow({ cell, cells: updatedCells, recordId: row.rowid, rules }, options);
  }

  render() {
    const {
      isCharge,
      fullShowTable,
      minRowCount,
      isTreeTableView,
      treeTableViewData,
      sheetViewData,
      sheetViewConfig,
      appId,
      groupId,
      view,
      viewId,
      worksheetInfo,
      maxCount,
      filters,
      quickFilter,
      navGroupFilters,
      controls,
      printCharge,
      buttons,
      sheetButtons,
      printList,
      operateButtonLoading,
    } = this.props;
    // function
    const {
      addRecord,
      updateRows,
      hideRows,
      getWorksheetSheetViewSummary,
      updateSheetColumnWidths,
      updateWorksheetSomeControls,
      openNewRecord,
      updateTreeNodeExpansion,
      collapseAllTreeTableViewNode,
      expandAllTreeTableViewNode,
      changeTreeTableViewLevelCount,
      isDraft,
    } = this.props;
    let operatesButtons = getSheetOperatesButtons(view, {
      buttons: sheetButtons,
      printList,
    });
    operatesButtons = filterButtonBySheetSwitchPermit(operatesButtons, this.sheetSwitchPermit, viewId);
    const operatesButtonsStyle = getSheetOperatesButtonsStyle(view);
    const showOperatesInRow = !!operatesButtons.length && !get(window, 'shareState.shareId');
    const operatesButtonsWidth = getOperatesButtonsWidth({
      buttons: operatesButtons,
      style: operatesButtonsStyle.style,
      visibleNum: operatesButtonsStyle.visibleNum,
      showIcon: operatesButtonsStyle.showIcon,
    });
    const { readonly } = this;
    const { loading, rows } = sheetViewData;
    const {
      sheetSelectedRows = [],
      sheetColumnWidths,
      columnStyles,
      fixedColumnCount,
      defaultScrollLeft,
    } = sheetViewConfig;
    const {
      worksheetId,
      projectId,
      allowAdd,
      rules = [],
      isWorksheetQuery,
      isRequestingRelationControls,
    } = worksheetInfo;
    const {
      recordId,
      recordInfoVisible,
      activeRelateTableControlIdOfRecord,
      tempViewIdForRecordInfo,
      disableMaskDataControls,
    } = this.state;
    const { lineNumberBegin, columns } = this;
    const showSummary = (get(view, 'advancedSetting.showsummary') || '1') === '1' && !maxCount && !isTreeTableView;
    const showVerticalLine = (get(view, 'advancedSetting.showvertical') || '1') === '1';
    const showAsZebra = (get(view, 'advancedSetting.alternatecolor') || '0') === '1'; // 斑马颜色
    const wrapControlName = (get(view, 'advancedSetting.titlewrap') || '0') === '1';
    const headTitleCenter = (get(view, 'advancedSetting.rctitlestyle') || '0') === '1';
    const lineEditable = (get(view, 'advancedSetting.fastedit') || '1') === '1' && !isRequestingRelationControls;
    const enableRules = (get(view, 'advancedSetting.enablerules') || (this.isManageView ? '0' : '1')) === '1';
    const navGroupData = (get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === get(view, 'navGroup[0].controlId'),
    );
    const { rowHeadWidth } = this;

    return (
      <React.Fragment>
        {!!recordInfoVisible && (
          <RecordInfo
            enablePayment={worksheetInfo.enablePayment}
            tableType={this.tableType}
            widgetStyle={worksheetInfo.advancedSetting}
            controls={this.isManageView ? getHighAuthControls(controls) : controls}
            sheetSwitchPermit={this.sheetSwitchPermit}
            projectId={projectId}
            showPrevNext
            needUpdateRows
            rules={this.isManageView ? [] : rules}
            isWorksheetQuery={isWorksheetQuery}
            isCharge={isCharge}
            allowAdd={allowAdd}
            appId={appId}
            viewId={tempViewIdForRecordInfo || viewId}
            appSectionId={groupId}
            view={view}
            visible={!!recordInfoVisible}
            hideRecordInfo={closeId => {
              if (!closeId || closeId === this.state.recordId) {
                this.setState({ recordInfoVisible: false, tempViewIdForRecordInfo: undefined });
              }
              if (this.tableType === 'classic') {
                window.activeTableId = this.tableId;
              }
            }}
            recordId={recordId}
            activeRelateTableControlId={activeRelateTableControlIdOfRecord}
            worksheetId={worksheetId}
            updateWorksheetControls={updateWorksheetSomeControls}
            updateRows={updateRows}
            hideRows={hideRows}
            onDeleteSuccess={() => {
              hideRows([recordId]);
            }}
            getWorksheetSummary={getWorksheetSheetViewSummary}
            currentSheetRows={rows}
            handleAddSheetRow={addRecord}
            workflowStatus={recordInfoVisible && recordInfoVisible.wfstatus}
            printCharge={printCharge}
          />
        )}
        {loading && (
          <React.Fragment>
            <Skeleton
              style={{ flex: 1 }}
              direction="column"
              widths={['30%', '40%', '90%', '60%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
            <Skeleton
              style={{ flex: 1 }}
              direction="column"
              widths={['40%', '55%', '100%', '80%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
            <Skeleton
              style={{ flex: 2 }}
              direction="column"
              widths={['45%', '100%', '100%', '100%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
          </React.Fragment>
        )}
        {!loading && !(showOperatesInRow && operateButtonLoading) && (
          <WorksheetTable
            isDraft={isDraft}
            showControlStyle={this.showControlStyle}
            isTreeTableView={isTreeTableView}
            treeTableViewData={treeTableViewData}
            tableType={this.tableType}
            readonly={readonly}
            ref={this.table}
            recordColorConfig={getRecordColorConfig(view)}
            watchHeight={!browserIsMobile()}
            setHeightAsRowCount={fullShowTable}
            minRowCount={isTreeTableView ? rows.length + 2 : minRowCount}
            tableId={this.tableId}
            view={view}
            viewId={viewId}
            appId={appId}
            enableRules={enableRules}
            rules={this.isManageView ? [] : rules}
            isCharge={isCharge}
            worksheetId={worksheetId}
            sheetViewHighlightRows={this.highLightRows}
            showRowHead={!this.hideRowHead}
            lineEditable={lineEditable}
            disableQuickEdit={!isOpenPermit(permitList.quickSwitch, this.sheetSwitchPermit, viewId)}
            fixedColumnCount={isTreeTableView ? fixedColumnCount + 1 : fixedColumnCount}
            rightFixedCount={showOperatesInRow ? 1 : 0}
            sheetColumnWidths={sheetColumnWidths}
            columnStyles={columnStyles}
            allowAdd={
              this.isManageView || (isOpenPermit(permitList.createButtonSwitch, this.sheetSwitchPermit) && allowAdd)
            }
            canSelectAll={!!rows.length}
            data={rows}
            rowHeight={ROW_HEIGHT[view.rowHeight] || 34}
            rowHeightEnum={view.rowHeight}
            keyWords={filters.keyWords}
            sheetIsFiltered={
              !!(
                filters.keyWords ||
                get(filters, 'filterControls.length') ||
                get(filters, 'filtersGroup.length') ||
                !_.isEmpty(quickFilter)
              )
            }
            showNewRecord={openNewRecord}
            defaultScrollLeft={defaultScrollLeft}
            sheetSwitchPermit={this.sheetSwitchPermit}
            noFillRows
            selectedIds={sheetSelectedRows.map(r => r.rowid)}
            lineNumberBegin={lineNumberBegin}
            rowHeadOnlyNum={this.rowHeadOnlyNum}
            rowHeadWidth={rowHeadWidth}
            expandCellAppendWidth={this.expandCellAppendWidth}
            controls={this.isManageView ? getHighAuthControls(controls) : controls}
            columns={columns
              .map(c =>
                disableMaskDataControls[c.controlId]
                  ? {
                      ...c,
                      advancedSetting: Object.assign({}, c.advancedSetting, {
                        datamask: '0',
                      }),
                    }
                  : c,
              )
              .concat(
                showOperatesInRow
                  ? [
                      {
                        type: 'operates',
                        controlName: _l('操作'),
                        width: operatesButtonsWidth,
                      },
                    ]
                  : [],
              )}
            projectId={projectId}
            // 表格样式
            wrapControlName={wrapControlName}
            headTitleCenter={headTitleCenter}
            showSummary={
              !this.chartId &&
              showSummary &&
              !(get(window, 'shareState.isPublicView') || get(window, 'shareState.isPublicPage'))
            }
            showVerticalLine={showVerticalLine}
            showAsZebra={showAsZebra}
            onCellClick={this.handleCellClick}
            onCellMouseDown={this.handleCellMouseDown}
            renderFooterCell={this.renderSummaryCell}
            renderColumnHead={this.renderColumnHead}
            renderRowHead={this.renderRowHead}
            renderOperates={args => this.renderOperates({ ...args })}
            noRecordAllowAdd={false}
            emptyIcon={
              (this.needClickToSearch && _.isEmpty(quickFilter)) ||
              (this.navGroupToSearch() && _.isEmpty(navGroupFilters)) ? (
                <span />
              ) : undefined
            }
            showSearchEmpty={
              !(
                (this.needClickToSearch && _.isEmpty(quickFilter)) ||
                (this.navGroupToSearch() && _.isEmpty(navGroupFilters))
              )
            }
            emptyText={
              this.needClickToSearch && _.isEmpty(quickFilter) ? (
                <span className="Font14">{_l('执行查询后显示结果')}</span>
              ) : this.navGroupToSearch() && _.isEmpty(navGroupFilters) ? (
                <span className="Font14">{_l('请从左侧选择一个%0查看', (navGroupData || {}).controlName)}</span>
              ) : undefined
            }
            updateCell={({ cell, row }, options) => {
              this.asyncUpdate(row, cell, options);
            }}
            onColumnWidthChange={updateSheetColumnWidths}
            actions={{ updateTreeNodeExpansion }}
            printCharge={printCharge}
          />
        )}
        {isTreeTableView && sheetViewData.count <= 1000 && (
          <ToolBar
            currentView={view}
            level={this.levelCount}
            allowAdjustScale={false}
            allowExportAsImage={false}
            customButtons={[
              <span className="mLeft10 mRight20 Hand" onClick={expandAllTreeTableViewNode}>
                {_l('展开全部')}
              </span>,
              <span className="Hand" onClick={collapseAllTreeTableViewNode}>
                {_l('收起全部')}
              </span>,
            ]}
            showLevelData={({ layer }) => changeTreeTableViewLevelCount(layer)}
          />
        )}
      </React.Fragment>
    );
  }
}

function SheetViewConnecter(props) {
  const {
    view,
    isTreeTableView,
    sheetViewData,
    treeTableViewData = {},
    filters,
    quickFilter,
    updateRows,
    updateTreeByRowChange,
  } = props;
  const { treeMap } = treeTableViewData;
  const context = useContext(SheetContext);
  const rows = useMemo(() => {
    if (!isTreeTableView || !!filters.keyWords) {
      return sheetViewData.rows;
    } else {
      return getSheetViewRows(sheetViewData, treeTableViewData);
    }
  }, [sheetViewData.rows, isTreeTableView, treeMap]);
  return (
    <TableView
      {...props}
      fullShowTable={get(context, 'config.fullShowTable') && !isTreeTableView}
      minRowCount={get(context, 'config.minRowCount')}
      isDraft={get(context, 'config.isDraft')}
      printCharge={get(context, 'config.printCharge')}
      sheetViewData={{ ...sheetViewData, rows }}
      updateRows={(rowIds, value, changedValue) => {
        if (isTreeTableView && !filters.keyWords && view.viewControl && get(changedValue, view.viewControl)) {
          updateTreeByRowChange({ recordId: rowIds[0], changedValue });
          updateRows(rowIds, value);
        } else {
          updateRows(rowIds, value);
        }
      }}
    />
  );
}

SheetViewConnecter.propTypes = {
  view: shape({}),
  isTreeTableView: bool,
  sheetViewData: shape({}),
  treeTableViewData: shape({}),
  updateRows: func,
  updateTreeByRowChange: func,
};

export default connect(
  (state, props) => ({
    // worksheet
    isCharge: state.sheet.isCharge,
    worksheetInfo: state.sheet.worksheetInfo,
    filters: state.sheet.filters,
    quickFilter: state.sheet.quickFilter,
    navGroupFilters: state.sheet.navGroupFilters,
    buttons: state.sheet.buttons,
    operateButtonLoading: state.sheet.operateButtonLoading,
    sheetButtons: state.sheet.sheetButtons,
    printList: state.sheet.printList,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    sheetSearchConfig: state.sheet.sheetSearchConfig || [],
    chartIdFromUrl: get(state, 'sheet.base.chartId'),
    maxCount: get(state, 'sheet.base.maxCount'),
    // sheetview
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
    sheetViewConfig: state.sheet.sheetview.sheetViewConfig,
    treeTableViewData: state.sheet.sheetview.treeTableViewData,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(sheetviewActions, [
          'setViewLayout',
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
          'resetSheetLayout',
          'updateTreeNodeExpansion',
          'changeTreeTableViewLevelCount',
          'collapseAllTreeTableViewNode',
          'expandAllTreeTableViewNode',
          'updateTreeByRowChange',
          'initAbortController',
          'abortRequest',
          'setColumnStyles',
          'getWorksheetSheetViewSummary',
          'updateColumnStyles',
          'saveColumnStylesToLocal',
        ]),
        updateWorksheetSomeControls,
        refreshWorksheetControls,
        updateWorksheetInfo,
        saveView,
      },
      dispatch,
    ),
)(SheetViewConnecter);
