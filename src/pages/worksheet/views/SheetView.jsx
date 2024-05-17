import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { autobind } from 'core-decorators';
import { v4 as uuidv4 } from 'uuid';
import autoSize from 'ming-ui/decorators/autoSize';
import {
  emitter,
  sortControlByIds,
  getLRUWorksheetConfig,
  getRecordColorConfig,
  openLinkFromRecord,
  handleRecordClick,
} from 'worksheet/util';
import { getRowDetail } from 'worksheet/api';
import { editRecord } from 'worksheet/common/editRecord';
import { ROW_HEIGHT, SHEET_VIEW_HIDDEN_TYPES, VIEW_CONFIG_RECORD_CLICK_ACTION } from 'worksheet/constants/enum';
import { Skeleton } from 'ming-ui';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { ColumnHead, SummaryCell, RowHead } from 'worksheet/components/WorksheetTable/components/';
import RecordInfo from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { updateWorksheetSomeControls, refreshWorksheetControls } from 'worksheet/redux/actions';
import * as sheetviewActions from 'worksheet/redux/actions/sheetview';
import { getAdvanceSetting, addBehaviorLog, browserIsMobile } from 'src/util';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';

import _, { get } from 'lodash';

@autoSize
class TableView extends React.Component {
  static propTypes = {
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
  };

  table = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      disableMaskDataControls: {},
    };
    this.tableId = uuidv4();
    this.shiftActiveRowIndex = 0;
  }

  componentDidMount() {
    const { view, fetchRows, setRowsEmpty, navGroupFilters } = this.props;
    if (!!this.chartId) {
      fetchRows({ isFirst: true });
    } else if (
      _.get(view, 'advancedSetting.clicksearch') === '1' ||
      (this.navGroupToSearch() && _.isEmpty(navGroupFilters))
    ) {
      setRowsEmpty();
    } else {
      fetchRows({ isFirst: true });
    }
    document.body.addEventListener('click', this.outerClickEvent);
    emitter.addListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    this.handleSetAutoRefresh();
    this.bindShift();
  }

  componentWillReceiveProps(nextProps) {
    const { view, fetchRows, setRowsEmpty, changePageIndex, refresh, sheetViewData, navGroupFilters } = nextProps;
    const changeView = this.props.worksheetId === nextProps.worksheetId && this.props.viewId !== nextProps.viewId;
    if (!_.isEqual(_.get(nextProps, ['navGroupFilters']), _.get(this.props, ['navGroupFilters']))) {
      changePageIndex(1);
    }
    const noNavGroup = this.navGroupToSearch(nextProps) && _.isEmpty(navGroupFilters);
    if (changeView) {
      if (noNavGroup || _.get(view, 'advancedSetting.clicksearch') === '1') {
        setRowsEmpty();
      } else {
        fetchRows({ changeView });
      }
    } else if (
      _.some(
        [
          'sheetFetchParams',
          'view.moreSort',
          'view.advancedSetting.clicksearch',
          'view.advancedSetting.enablerules',
          'navGroupFilters',
          'view.navGroup',
          'view.advancedSetting.showallitem',
          'view.advancedSetting.shownullitem',
        ],
        key => !_.isEqual(_.get(nextProps, key), _.get(this.props, key)),
      )
    ) {
      if (noNavGroup) {
        setRowsEmpty();
      } else {
        fetchRows();
      }
    } else if (
      _.get(this.props, 'view.advancedSetting.refreshtime') !== _.get(nextProps, 'view.advancedSetting.refreshtime')
    ) {
      this.handleSetAutoRefresh(nextProps);
    } else if (_.get(this.props, 'sheetViewData.refreshFlag') !== _.get(nextProps, 'sheetViewData.refreshFlag')) {
      this.setState({ disableMaskDataControls: {} });
    } else if (
      _.get(this.props, 'view.advancedSetting.sheettype') !== _.get(nextProps, 'view.advancedSetting.sheettype')
    ) {
      refresh();
    }
  }

  navGroupToSearch = props => {
    const { view, worksheetInfo } = props || this.props;
    const navGroupData = (_.get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === _.get(view, 'navGroup[0].controlId'),
    );
    //设置了筛选列表，且未显示全部，需选择分组后显示
    return (
      !!navGroupData &&
      _.get(view, 'advancedSetting.showallitem') === '1' &&
      !_.get(view, 'navGroup[0].viewId') &&
      _.get(view, 'navGroup').length > 0
    );
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      _.some(
        ['recordInfoVisible', 'disableMaskDataControls'],
        key => !_.isEqual(_.get(nextState, key), _.get(this.state, key)),
      ) ||
      _.some(
        [
          'sheetViewData',
          'sheetViewConfig',
          'editingControls',
          'controls',
          'view.rowHeight',
          'view.showControls',
          'view.controls',
          'view.moreSort',
          'view.advancedSetting',
          'buttons',
          'worksheetInfo.isRequestingRelationControls',
        ],
        key => !_.isEqual(_.get(nextProps, key), _.get(this.props, key)),
      )
    );
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.outerClickEvent);
    emitter.removeListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    this.unbindShift();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
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
  @autobind
  activeShift(e) {
    if (e.keyCode === 16) {
      this.shiftActive = true;
    }
  }

  @autobind
  deActiveShift(e) {
    if (e.keyCode === 16) {
      this.shiftActive = false;
      // console.log({ shiftActive: this.shiftActive });
    }
  }

  @autobind
  handleWindowBlur() {
    this.shiftActive = false;
  }

  handleSetAutoRefresh(props) {
    const { view, refresh } = props || this.props;
    const refreshtime = _.get(view, 'advancedSetting.refreshtime');
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (refreshtime && _.includes(['10', '30', '60', '120', '180', '240', '300'], refreshtime)) {
      this.refreshTimer = setInterval(() => {
        const { allWorksheetIsSelected, sheetSelectedRows = [] } = _.get(this, 'props.sheetViewConfig') || {};
        if (
          allWorksheetIsSelected ||
          sheetSelectedRows.length ||
          document.querySelector('.workSheetNewRecord.mdModal') ||
          document.querySelector('.workSheetRecordInfo.mdModal')
        ) {
          return;
        }
        refresh({ noLoading: true });
      }, Number(refreshtime) * 1000);
    }
  }

  @autobind
  outerClickEvent(e) {
    const { clearHighLight } = this.props;
    if (
      !$(e.target).closest('.sheetViewTable, .recordInfoCon, .workSheetNewRecord, .mdModal')[0] ||
      /-grid/.test(e.target.className)
    ) {
      clearHighLight(this.tableId);
      $(`.sheetViewTable.id-${this.tableId}-id .cell`).removeClass('hover');
    }
  }

  @autobind
  updateRecordEvent({ worksheetId, recordId }) {
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
  }

  @autobind
  handleCellClick(cell, row, rowIndex) {
    if (_.get(this, 'props.worksheetInfo.isRequestingRelationControls')) {
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
      this.setState(newState);
    });
  }

  @autobind
  handleCellMouseDown({ rowIndex }) {
    const { setHighLight } = this.props;
    setHighLight(this.tableId, rowIndex);
  }

  get showControlStyle() {
    const { view } = this.props;
    return _.get(view, 'advancedSetting.controlstyle') === '1';
  }

  get tableType() {
    const { view } = this.props;
    return _.get(view, 'advancedSetting.sheettype') === '1' ? 'classic' : 'simple';
  }

  get columns() {
    const { view, showControlIds = [], sheetSwitchPermit } = this.props;
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
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
          !_.find(sheetHiddenColumns.concat(view.controls), cid => cid === control.controlId) &&
          controlState(control).visible,
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
        .slice(0)
        .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
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

    return columns;
  }

  get lineNumberBegin() {
    const { pageIndex, pageSize } = this.props.sheetFetchParams;
    return (pageIndex - 1) * pageSize;
  }

  get chartId() {
    return this.props.chartId || this.props.chartIdFromUrl;
  }
  get readonly() {
    return !!this.chartId || _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage');
  }

  get disabledFunctions() {
    const { chartId } = this;
    if (chartId) {
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
      const rows = _.get(this.props, 'sheetViewData.rows');
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
    const { sheetSwitchPermit, view, viewId } = this.props;
    const { tableType } = this;
    const showOperate = (_.get(view, 'advancedSetting.showquick') || '1') === '1';
    const showNumber = (_.get(view, 'advancedSetting.showno') || '1') === '1';
    const allowBatchEdit = isOpenPermit(permitList.batchEdit, sheetSwitchPermit, viewId);
    return tableType !== 'classic' && !showOperate && !allowBatchEdit && !showNumber;
  }

  get hasBatch() {
    const { sheetSwitchPermit, view, viewId } = this.props;
    return (
      isOpenPermit(permitList.batchGroup, sheetSwitchPermit) && // 开启了批量操作 且有可操作项
      (isOpenPermit(permitList.batchEdit, sheetSwitchPermit, viewId) ||
        isOpenPermit(permitList.QrCodeSwitch, sheetSwitchPermit, viewId) ||
        isOpenPermit(permitList.copy, sheetSwitchPermit, viewId) ||
        isOpenPermit(permitList.export, sheetSwitchPermit, viewId) ||
        isOpenPermit(permitList.execute, sheetSwitchPermit, viewId) ||
        isOpenPermit(permitList.delete, sheetSwitchPermit, viewId))
    );
  }

  get numberWidth() {
    const { sheetViewData } = this.props;
    const { rows } = sheetViewData;
    const { lineNumberBegin } = this;
    let numberWidth = String(lineNumberBegin + rows.length).length * 8;
    return numberWidth > 14 ? numberWidth : 14;
  }

  get rowHeadWidth() {
    const { view } = this.props;
    const { numberWidth } = this;
    const showOperate = (_.get(view, 'advancedSetting.showquick') || '1') === '1';
    const showNumber = (_.get(view, 'advancedSetting.showno') || '1') === '1';
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
    return !this.chartId && _.get(this.props, 'view.advancedSetting.clicksearch') === '1';
  }

  @autobind
  renderSummaryCell({ style, columnIndex, rowIndex }) {
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
  }

  @autobind
  renderColumnHead({ control, className, style, columnIndex, fixedColumnCount, scrollTo, ...rest }) {
    const { tableId } = this;
    const {
      appId,
      worksheetId,
      viewId,
      view,
      worksheetInfo,
      sheetViewConfig,
      updateDefaultScrollLeft,
      changePageIndex,
      filters,
      quickFilter,
      navGroupFilters,
      refresh,
      clearSelect,
      updateRows,
      getWorksheetSheetViewSummary,
      sheetSwitchPermit,
      sheetViewData,
    } = this.props;
    const { projectId } = worksheetInfo;
    const { allWorksheetIsSelected, sheetSelectedRows } = sheetViewConfig;
    const { disableMaskDataControls } = this.state;
    return (
      <ColumnHead
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
        disabled={this.needClickToSearch && _.isEmpty(quickFilter)}
        isLast={control.controlId === _.last(this.columns).controlId}
        columnIndex={columnIndex}
        fixedColumnCount={fixedColumnCount}
        rowIsSelected={!!(allWorksheetIsSelected || sheetSelectedRows.length)}
        canBatchEdit={isOpenPermit(permitList.batchEdit, sheetSwitchPermit, viewId)}
        onBatchEdit={() => {
          editRecord({
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
  }

  @autobind
  renderRowHead({ className, key, style: cellstyle, columnIndex, rowIndex, control, data }) {
    const {
      isCharge,
      appId,
      view,
      viewId,
      controls,
      worksheetInfo,
      sheetSwitchPermit,
      buttons,
      sheetViewData,
      sheetViewConfig,
      getWorksheetSheetViewSummary,
      refreshWorksheetControls,
    } = this.props;
    // functions
    const { addRecord, selectRows, updateRows, hideRows, saveSheetLayout, resetSheetLayout, setHighLight } = this.props;
    const { allowAdd, worksheetId, projectId } = worksheetInfo;
    const { allWorksheetIsSelected, sheetSelectedRows, sheetHiddenColumns } = sheetViewConfig;
    const showNumber = (_.get(view, 'advancedSetting.showno') || '1') === '1';
    const showOperate = (_.get(view, 'advancedSetting.showquick') || '1') === '1';
    const localLayoutUpdateTime = getLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    if (_.isEmpty(view) && !this.chartId) {
      return <span />;
    }
    return (
      <RowHead
        tableType={this.tableType}
        numberWidth={this.numberWidth}
        hasBatch={this.hasBatch}
        showNumber={showNumber}
        showOperate={showOperate}
        count={sheetViewData.count}
        readonly={this.readonly}
        isCharge={isCharge}
        rowHeadOnlyNum={this.rowHeadOnlyNum}
        tableId={this.tableId}
        layoutChangeVisible={
          isCharge &&
          (!!sheetHiddenColumns.length ||
            Number(localLayoutUpdateTime) >
              Number(view.advancedSetting.layoutupdatetime || view.advancedSetting.layoutUpdateTime || 0))
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
        sheetSwitchPermit={sheetSwitchPermit}
        customButtons={buttons}
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
  }

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
      sheetViewData,
      sheetViewConfig,
      appId,
      groupId,
      view,
      viewId,
      sheetSwitchPermit,
      worksheetInfo,
      maxCount,
      filters,
      quickFilter,
      navGroupFilters,
      controls,
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
    } = this.props;
    const { readonly } = this;
    const { loading, rows } = sheetViewData;
    const { sheetSelectedRows = [], sheetColumnWidths, fixedColumnCount, defaultScrollLeft } = sheetViewConfig;
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
    const showSummary = (_.get(view, 'advancedSetting.showsummary') || '1') === '1' && !maxCount;
    const showVerticalLine = (_.get(view, 'advancedSetting.showvertical') || '1') === '1';
    const showAsZebra = (_.get(view, 'advancedSetting.alternatecolor') || '0') === '1'; // 斑马颜色
    const wrapControlName = (_.get(view, 'advancedSetting.titlewrap') || '0') === '1';
    const lineEditable = (_.get(view, 'advancedSetting.fastedit') || '1') === '1' && !isRequestingRelationControls;
    const enableRules = (_.get(view, 'advancedSetting.enablerules') || '1') === '1';
    const navGroupData = (_.get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === _.get(view, 'navGroup[0].controlId'),
    );
    const { rowHeadWidth } = this;
    return (
      <React.Fragment>
        {!!recordInfoVisible && (
          <RecordInfo
            tableType={this.tableType}
            widgetStyle={worksheetInfo.advancedSetting}
            controls={controls}
            sheetSwitchPermit={sheetSwitchPermit}
            projectId={projectId}
            showPrevNext
            needUpdateRows
            rules={rules}
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
        {!loading && (
          <WorksheetTable
            showControlStyle={this.showControlStyle}
            tableType={this.tableType}
            readonly={readonly}
            ref={this.table}
            recordColorConfig={getRecordColorConfig(view)}
            watchHeight={!browserIsMobile()}
            tableId={this.tableId}
            viewId={viewId}
            appId={appId}
            enableRules={enableRules}
            rules={rules}
            isCharge={isCharge}
            worksheetId={worksheetId}
            sheetViewHighlightRows={this.highLightRows}
            showRowHead={!this.hideRowHead}
            lineEditable={lineEditable && isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, viewId)}
            fixedColumnCount={fixedColumnCount}
            sheetColumnWidths={sheetColumnWidths}
            allowAdd={isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd}
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
            sheetSwitchPermit={sheetSwitchPermit}
            noFillRows
            selectedIds={sheetSelectedRows.map(r => r.rowid)}
            lineNumberBegin={lineNumberBegin}
            rowHeadOnlyNum={this.rowHeadOnlyNum}
            rowHeadWidth={rowHeadWidth}
            controls={controls}
            columns={columns.map(c =>
              disableMaskDataControls[c.controlId]
                ? {
                    ...c,
                    advancedSetting: Object.assign({}, c.advancedSetting, {
                      datamask: '0',
                    }),
                  }
                : c,
            )}
            projectId={projectId}
            // 表格样式
            wrapControlName={wrapControlName}
            showSummary={
              !this.chartId &&
              showSummary &&
              !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage'))
            }
            showVerticalLine={showVerticalLine}
            showAsZebra={showAsZebra}
            onCellClick={this.handleCellClick}
            onCellMouseDown={this.handleCellMouseDown}
            renderFooterCell={this.renderSummaryCell}
            renderColumnHead={this.renderColumnHead}
            renderRowHead={this.renderRowHead}
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
          />
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    // worksheet
    isCharge: state.sheet.isCharge,
    worksheetInfo: state.sheet.worksheetInfo,
    filters: state.sheet.filters,
    quickFilter: state.sheet.quickFilter,
    navGroupFilters: state.sheet.navGroupFilters,
    buttons: state.sheet.buttons,
    controls: state.sheet.controls,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    sheetSearchConfig: state.sheet.sheetSearchConfig || [],
    chartIdFromUrl: _.get(state, 'sheet.base.chartId'),
    maxCount: _.get(state, 'sheet.base.maxCount'),
    // sheetview
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
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
          'resetSheetLayout',
        ]),
        updateWorksheetSomeControls,
        refreshWorksheetControls,
      },
      dispatch,
    ),
)(TableView);
