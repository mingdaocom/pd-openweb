import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { get, identity, isFunction, pick } from 'lodash';
import PropTypes, { bool, func, shape } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { batchEditRecord } from 'worksheet/common/BatchEditRecord';
import RecordInfo from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { getSheetViewRows, getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import getTableColumnWidth from 'worksheet/components/BaseColumnHead/getTableColumnWidth';
import GroupByControl from 'worksheet/components/GroupByControl';
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
import DataFormat from 'src/components/Form/core/DataFormat';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/components/Form/core/enum';
import { controlState } from 'src/components/Form/core/utils';
import { openMingoCreateRecord } from 'src/components/Mingo/modules/CreateRecordBot';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { putControlByOrder } from 'src/pages/widgetConfig/util';
import { renderBatchSetDialog } from 'src/pages/worksheet/common/ViewConfig/components/BatchSet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { getUserRole } from 'src/pages/worksheet/redux/actions/util';
import { browserIsMobile, emitter, getLRUWorksheetConfig } from 'src/utils/common';
import { getAdvanceSetting, getHighAuthControls } from 'src/utils/control';
import { addBehaviorLog } from 'src/utils/project';
import { getRecordColorConfig, handleRecordClick } from 'src/utils/record';
import {
  filterButtonBySheetSwitchPermit,
  getFiltersForGroupedView,
  getGroupControlId,
  getOperatesButtonsWidth,
  getSheetOperatesButtons,
  getSheetOperatesButtonsStyle,
} from 'src/utils/worksheet';
import SheetContext from '../common/Sheet/SheetContext';
import ToolBar from './HierarchyView/ToolBar';

function setRowIndexForSheetView(rows) {
  let rowIndexMap = {};
  rows.forEach(r => {
    if (typeof r.allowedit !== 'undefined' && r.groupKey) {
      const newRowIndex = rowIndexMap[r.groupKey] || 1;
      r.rowIndexNumber = newRowIndex;
      rowIndexMap[r.groupKey] = newRowIndex + 1;
    }
  });
  return rows;
}

// 优化的分组标题组件
const GroupTitleCell = React.memo(
  ({
    className,
    style,
    row,
    columnIndex,
    getColumnWidth,
    view,
    appId,
    worksheetId,
    viewId,
    projectId,
    foldedMap,
    updateFolded,
    sheetViewData,
    changeWorksheetSheetViewSummaryType,
    insertToGroupedRow,
    fixedColumnCount,
    allWorksheetIsSelected,
    sheetSelectedRows,
    allowAdd,
    lineEditable,
    columns,
    rowHeadOnlyNum,
  }) => {
    // 缓存计算结果
    const groupRows = useMemo(
      () => (sheetViewData.rows || []).filter(({ rowid }) => rowid === 'groupTitle'),
      [sheetViewData.rows],
    );

    const allFolded = useMemo(() => _.every(groupRows, ({ key }) => foldedMap[key]), [groupRows, foldedMap]);

    const rowsOfThisGroup = useMemo(
      () => (sheetViewData.rows || []).filter(({ groupKey }) => groupKey === row.key),
      [sheetViewData.rows, row.key],
    );

    const selectedIds = useMemo(() => sheetSelectedRows.map(r => r.rowid), [sheetSelectedRows]);

    const control = useMemo(() => [{ type: 'summaryhead' }].concat(columns)[columnIndex], [columns, columnIndex]);

    // 缓存回调函数
    const handleFold = React.useCallback(
      value => {
        updateFolded(row.key, value);
      },
      [updateFolded, row.key],
    );

    const handleAllFold = React.useCallback(
      value => {
        updateFolded('all', value);
      },
      [updateFolded],
    );

    const handleAdd = React.useCallback(
      record => {
        insertToGroupedRow({ ...record, group: row });
      },
      [insertToGroupedRow, row],
    );

    const handleSummaryTypeChange = React.useCallback(
      args => {
        groupRows.forEach(r => {
          changeWorksheetSheetViewSummaryType({
            ...args,
            groupArgs: {
              groupKey: r.key,
              value: args.value,
              filters: getFiltersForGroupedView(r.control, r.key),
              groupRows,
            },
          });
        });
      },
      [changeWorksheetSheetViewSummaryType, groupRows],
    );

    const newStyle = { ...style, height: 34 };

    if (columnIndex === 0) {
      let newClassName = className;
      if (fixedColumnCount === 0 || fixedColumnCount === 1) {
        newClassName += ' cellRight2px';
      }
      newStyle.width = getColumnWidth(0) + getColumnWidth(1);
      newStyle.backgroundColor = '#fafafa';
      return (
        <GroupByControl
          view={view}
          allowAdd={allowAdd}
          lineEditable={lineEditable}
          projectId={projectId}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          folded={foldedMap[row.key]}
          allFolded={allFolded}
          className={newClassName}
          style={newStyle}
          count={row.count}
          control={row.control}
          groupKey={row.key}
          name={row.name}
          onFold={handleFold}
          onAllFold={handleAllFold}
          onAdd={handleAdd}
        />
      );
    }

    if (columnIndex === 1) {
      return null;
    }

    const newClassName = className + ' noRightBorder';
    const { groupRowsSummary } = sheetViewData;
    const summaryType = control && get(groupRowsSummary, `types.${control.controlId}`);
    const summaryValue = control && get(groupRowsSummary, `${row.key}.values.${control.controlId}`);
    return (
      <SummaryCell
        className={newClassName}
        isGroupTitle
        rowHeadOnlyNum={rowHeadOnlyNum}
        style={newStyle}
        viewId={viewId}
        summaryType={summaryType}
        summaryValue={summaryValue}
        control={control}
        rows={rowsOfThisGroup}
        selectedIds={selectedIds}
        allWorksheetIsSelected={allWorksheetIsSelected}
        changeWorksheetSheetViewSummaryType={handleSummaryTypeChange}
      />
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    const keyProps = [
      'row.key',
      'row.count',
      'row.name',
      'columnIndex',
      'foldedMap',
      'sheetViewData.rows',
      'sheetViewData.groupRowsSummary',
      'sheetSelectedRows',
      'allowAdd',
      'lineEditable',
      'columns',
      'view.advancedSetting',
      'style',
    ];

    return keyProps.every(prop => {
      const prevValue = get(prevProps, prop);
      const nextValue = get(nextProps, prop);
      return _.isEqual(prevValue, nextValue);
    });
  },
);

// 优化的行头组件
const MemoizedRowHead = React.memo(
  ({
    className,
    style,
    rowIndex,
    data,
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
    tableType,
    numberWidth,
    hasBatch,
    showNumber,
    showOperate,
    readonly,
    rowHeadOnlyNum,
    tableId,
    lineNumberBegin,
    sheetSwitchPermit,
    onSelectAllWorksheet,
    onSelect,
    onReverseSelect,
    updateRows,
    hideRows,
    handleAddSheetRow,
    saveSheetLayout,
    resetSheetLayout,
    setHighLight,
    refreshWorksheetControls,
    onOpenRecord,
    chartId,
    columns,
    isDraft,
    printCharge,
    layoutChangeVisible,
  }) => {
    const { allowAdd, worksheetId, projectId } = worksheetInfo;
    const { allWorksheetIsSelected, sheetSelectedRows } = sheetViewConfig;

    if (_.isEmpty(view) && !chartId) {
      return <span />;
    }

    let isGroupTableView = !!getGroupControlId(view);

    return (
      <RowHead
        isDraft={isDraft}
        printCharge={printCharge}
        tableType={tableType}
        numberWidth={numberWidth}
        hasBatch={hasBatch}
        showNumber={showNumber}
        showOperate={showOperate}
        count={sheetViewData.count}
        readonly={readonly}
        isCharge={isCharge}
        isDevAndOps={isDevAndOps}
        rowHeadOnlyNum={rowHeadOnlyNum}
        tableId={tableId}
        layoutChangeVisible={layoutChangeVisible}
        className={className}
        {...{ appId, viewId, worksheetId }}
        columns={columns}
        controls={controls}
        projectId={projectId}
        allowAdd={allowAdd}
        style={style}
        lineNumberBegin={lineNumberBegin}
        canSelectAll={!!sheetViewData.rows.length}
        allWorksheetIsSelected={allWorksheetIsSelected}
        selectedIds={sheetSelectedRows.map(r => r.rowid)}
        sheetSwitchPermit={sheetSwitchPermit}
        customButtons={buttons}
        view={view}
        worksheetInfo={worksheetInfo}
        onSelectAllWorksheet={onSelectAllWorksheet}
        onSelect={onSelect}
        onReverseSelect={onReverseSelect}
        updateRows={updateRows}
        hideRows={rowIds => {
          hideRows(rowIds);
        }}
        rowIndex={rowIndex}
        data={isGroupTableView ? setRowIndexForSheetView(data) : data}
        handleAddSheetRow={handleAddSheetRow}
        saveSheetLayout={saveSheetLayout}
        resetSheetLayout={resetSheetLayout}
        setHighLight={setHighLight}
        refreshWorksheetControls={refreshWorksheetControls}
        onOpenRecord={onOpenRecord}
      />
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    const keyProps = [
      'className',
      'layoutChangeVisible',
      'rowIndex',
      'data',
      'style',
      'view.viewId',
      'view.advancedSetting.showno',
      'view.advancedSetting.showquick',
      'view.advancedSetting.layoutupdatetime',
      'view.advancedSetting.layoutUpdateTime',
      'sheetViewData.count',
      'sheetViewData.rows.length',
      'sheetViewConfig.allWorksheetIsSelected',
      'sheetViewConfig.sheetSelectedRows',
      'sheetViewConfig.sheetHiddenColumns',
      'worksheetInfo.allowAdd',
      'isCharge',
      'isDevAndOps',
      'readonly',
      'buttons',
      'controls',
      'columns',
      'hasBatch',
      'showNumber',
      'showOperate',
      'rowHeadOnlyNum',
      'tableType',
      'numberWidth',
    ];

    return keyProps.every(prop => {
      const prevValue = get(prevProps, prop);
      const nextValue = get(nextProps, prop);
      return _.isEqual(prevValue, nextValue);
    });
  },
);

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
      buttonsCheckStatus: {},
    };
    this.tableId = uuidv4();
    this.shiftActiveRowIndex = 0;
    // 简化的缓存：只缓存最近一次的计算结果
    this._columnsCache = null;
    this._lastPropsHash = null;
    if (isFunction(props.initAbortController)) {
      props.initAbortController();
    }
    this.handlePaste = this.handlePaste.bind(this);
  }

  componentDidMount() {
    const { view, fetchRows, setRowsEmpty, navGroupFilters, noLoadAtDidMount, setViewLayout = () => {} } = this.props;
    if (this.chartId) {
      fetchRows({ isFirst: true });
      this.setState({ buttonsCheckStatus: {} });
    } else if (
      get(view, 'advancedSetting.clicksearch') === '1' ||
      (this.navGroupToSearch() && _.isEmpty(navGroupFilters))
    ) {
      setRowsEmpty();
      setViewLayout(view.viewId);
    } else if (!noLoadAtDidMount) {
      fetchRows({ isFirst: true });
      this.setState({ buttonsCheckStatus: {} });
    }
    document.body.addEventListener('click', this.outerClickEvent);
    emitter.addListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    emitter.addListener('RELOAD_SHEET_VIEW', this.props.refresh);
    this.bindShift();
    window[`getTableColumnWidth-${this.props.worksheetId}`] = control => {
      const width = getTableColumnWidth(
        document.querySelector('.sheetViewTable'),
        _.get(this.props, 'sheetViewData.rows'),
        control,
        _.get(this.props, 'sheetViewConfig.columnStyles'),
        _.get(this.props, 'worksheetId'),
      );
      return width;
    };
    window.addEventListener('paste', this.handlePaste);
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
        this.setState({ buttonsCheckStatus: {} });
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
          'view.advancedSetting.groupsetting',
          'view.advancedSetting.groupfilters',
          'view.advancedSetting.groupshow',
          'view.advancedSetting.groupcustom',
          'view.advancedSetting.groupsorts',
          'view.advancedSetting.groupopen',
          'view.advancedSetting.groupempty',
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
      console.log('refresh');
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
    if (
      nextProps.operateButtonLoading !== this.props.operateButtonLoading ||
      nextProps.sheetViewData.loading !== this.props.sheetViewData.loading ||
      !_.isEqual(nextProps.sheetViewData.rows, this.props.sheetViewData.rows) ||
      !_.isEqual(this.getOperateButtons(nextProps), this.getOperateButtons(this.props))
    ) {
      const { pageIndex, pageSize } = nextProps.sheetFetchParams;
      const key = `${pageIndex}x${pageSize}`;
      if (
        !nextProps.operateButtonLoading &&
        !nextProps.sheetViewData.loading &&
        (!get(this, `state.buttonsCheckStatus.${key}`) ||
          !_.isEqual(get(nextProps, 'sheetViewData.rows'), get(this.props, 'sheetViewData.rows')) ||
          !_.isEqual(this.getOperateButtons(nextProps), this.getOperateButtons(this.props)))
      ) {
        const operatesButtons = this.getOperateButtons(nextProps);
        if (operatesButtons.length && !_.get(window, 'shareState.shareId')) {
          const rows = nextProps.sheetViewData.rows;
          const rowIds = rows.map(r => r.rowid).filter(identity);
          if (_.isEmpty(rowIds)) {
            return;
          }
          worksheetAjax
            .checkWorksheetRowsBtn({
              worksheetId: nextProps.worksheetId,
              rowIds,
              btnIds: operatesButtons.map(b => b.btnId),
            })
            .then(data => {
              const buttonsCheckStatus = {};
              data.forEach(item => {
                item.rowIds.forEach(rowId => {
                  buttonsCheckStatus[`${rowId}-${item.btnId}`] = true;
                });
              });
              this.setState({ buttonsCheckStatus: { [key]: buttonsCheckStatus } });
            });
        }
      }
    }
  }

  getOperateButtons = props => {
    const { view, sheetButtons, printList } = props;
    let operatesButtons = getSheetOperatesButtons(view, {
      buttons: sheetButtons,
      printList,
    });
    operatesButtons = filterButtonBySheetSwitchPermit(operatesButtons, this.sheetSwitchPermit, view.viewId);
    return operatesButtons;
  };

  getOperateButtonsMaxWidth = ({ style, visibleNum, showIcon, rows }) => {
    const { view, sheetButtons, printList } = this.props;
    let operatesButtons = getSheetOperatesButtons(view, {
      buttons: sheetButtons,
      printList,
    });
    if (!rows.length || !operatesButtons.length) {
      return 0;
    }
    return Math.max(
      ...rows.map(r => {
        const buttons = filterButtonBySheetSwitchPermit(operatesButtons, this.sheetSwitchPermit, view.viewId, r);
        return getOperatesButtonsWidth({ buttons, style, visibleNum, showIcon, row: r });
      }),
    );
  };

  componentDidUpdate(prevProps) {
    const { view } = this.props;
    if (
      !_.isEqual(prevProps.foldedMap, this.props.foldedMap) ||
      (!!getGroupControlId(view) &&
        !_.isEqual(
          prevProps.sheetViewData.rows.filter(r => r.rowid === 'groupTitle').map(r => r.count),
          this.props.sheetViewData.rows.filter(r => r.rowid === 'groupTitle').map(r => r.count),
        ))
    ) {
      if (_.isFunction(_.get(this.table, 'current.table.refs.forceUpdate'))) {
        this.table.current.table.refs.forceUpdate();
      }
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
        ['recordInfoVisible', 'disableMaskDataControls', 'buttonsCheckStatus'],
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
          'foldedMap',
        ],
        key => !_.isEqual(get(nextProps, key), get(this.props, key)),
      )
    );
  }

  componentWillUnmount() {
    const { abortRequest = () => {} } = this.props;
    document.body.removeEventListener('click', this.outerClickEvent);
    emitter.removeListener('RELOAD_SHEET_VIEW', this.props.refresh);
    emitter.removeListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    this.unbindShift();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    abortRequest();
    delete window[`getTableColumnWidth-${this.props.worksheetId}`];
    // 清理缓存
    this._columnsCache = null;
    this._lastPropsHash = null;
    window.removeEventListener('paste', this.handlePaste);
  }

  handlePaste(e) {
    if (
      !!document.querySelector('.ant-modal-root') ||
      window.cellisediting ||
      window.newRecordActive ||
      this.state.recordInfoVisible ||
      !this.tableConfig.allowAdd ||
      !isOpenPermit(permitList.createButtonSwitch, this.sheetSwitchPermit) ||
      document.activeElement.tagName.toLowerCase() === 'input' ||
      document.activeElement.tagName.toLowerCase() === 'textarea'
    ) {
      return;
    }
    const text = e.clipboardData.getData('text');
    openMingoCreateRecord(text);
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
    if (!e.target.isConnected) return;
    if (
      !$(e.target).closest(
        '.sheetViewTable, .recordInfoCon, .workSheetNewRecord, .createRecordSideMask, .mdModal',
      )[0] ||
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

  handleCellClick = (cell, row) => {
    const { allowOpenRecord = true } = this.props;
    if (get(this, 'props.worksheetInfo.isRequestingRelationControls') || allowOpenRecord === false) {
      return;
    }

    const { worksheetId, view } = this.props;
    handleRecordClick(view, row, () => {
      addBehaviorLog('worksheetRecord', worksheetId, { rowId: row.rowid }); // 埋点
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

  // 检查关键依赖项是否发生变化
  _shouldRecalculateColumns() {
    const { isTreeTableView, view, treeTableViewData, controls, worksheetInfo = {}, showControlIds } = this.props;

    // 生成选项字段的 options 哈希值，用于检测选项变化
    const optionsHash =
      controls
        ?.filter(control =>
          _.includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], control.type),
        )
        ?.map(control => `${control.controlId}:${control.options?.length || 0}`)
        ?.join(',') || '';
    const currentHash = {
      showControlIds,
      sheetHiddenColumns: get(this.props, 'sheetViewConfig.sheetHiddenColumns', []),
      sysids: get(view, 'advancedSetting.sysids'),
      syssort: get(view, 'advancedSetting.syssort'),
      isTreeTableView,
      viewId: view?.viewId,
      showControlsLength: view?.showControls?.length,
      maxLevel: treeTableViewData?.maxLevel,
      controlsLength: controls?.length,
      optionsHash, // 添加选项字段的哈希值检测
      isManageView: this.isManageView,
      isRequestingRelationControls: worksheetInfo?.isRequestingRelationControls,
    };

    // 简单的浅比较，避免复杂的字符串生成
    if (!this._lastPropsHash) {
      this._lastPropsHash = currentHash;
      return true;
    }

    const hasChanged = Object.keys(currentHash).some(key => currentHash[key] !== this._lastPropsHash[key]);

    if (hasChanged) {
      this._lastPropsHash = currentHash;
    }

    return hasChanged;
  }

  // 计算 columns 的核心逻辑
  _computeColumns() {
    const { isTreeTableView, view, showControlIds = [], treeTableViewData } = this.props;
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

    if (customdisplay === '1') {
      columns = _.uniqBy(showControls)
        .map(id => _.find(filteredControls, c => c.controlId === id))
        .filter(_.identity);
    } else {
      try {
        sysids = JSON.parse(sysids);
        syssort = JSON.parse(syssort);
      } catch (err) {
        console.log(err);
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

  get columns() {
    // 检查是否需要重新计算
    if (this._columnsCache && !this._shouldRecalculateColumns()) {
      return this._columnsCache;
    }

    // 重新计算并缓存结果
    const result = this._computeColumns();
    this._columnsCache = result;

    return result;
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

  get tableConfig() {
    const { view, worksheetInfo } = this.props;
    const { allowAdd, isRequestingRelationControls } = worksheetInfo;
    const lineEditable = (get(view, 'advancedSetting.fastedit') || '1') === '1' && !isRequestingRelationControls;
    return {
      allowAdd,
      lineEditable,
    };
  }

  // 缓存分组行，避免重复过滤
  get groupRows() {
    const { sheetViewData = {} } = this.props;
    const { rows = [] } = sheetViewData;
    return rows.filter(({ rowid }) => rowid === 'groupTitle');
  }

  get allowShowGenDataFromMingo() {
    const { appPkg } = this.props;
    const { isOwner, isAdmin, isRunner, isDeveloper } = getUserRole(appPkg.permissionType);
    return isOwner || isDeveloper || isRunner || isAdmin;
  }

  renderSummaryCell = ({ className = '', style, columnIndex }) => {
    const { viewId, sheetViewData, changeWorksheetSheetViewSummaryType, sheetViewConfig } = this.props;
    const { allWorksheetIsSelected, sheetSelectedRows } = sheetViewConfig;
    const { rowsSummary, rows } = sheetViewData;
    const control = [{ type: 'summaryhead' }].concat(this.columns)[columnIndex];
    return (
      <SummaryCell
        className={cx({ alignCenter: className.indexOf('alignCenter') > -1 })}
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

  renderColumnHead = ({ control, className, style, columnIndex, fixedColumnCount, ...rest }) => {
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
        showRequired
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
        columns={this.columns}
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
        updateDefaultScrollLeft={() => {
          const scrollX = document.querySelector(`.id-${tableId}-id .scroll-x .scroll-viewport`);
          if (scrollX) {
            updateDefaultScrollLeft(scrollX.scrollLeft);
          }
        }}
        onShowFullValue={() => {
          if (window.shareState.shareId) return;
          addBehaviorLog('worksheetBatchDecode', worksheetId, { controlId: control.controlId });
          this.setState({ disableMaskDataControls: { ...disableMaskDataControls, [control.controlId]: true } });
        }}
        scrollToLeftStart={() => {
          if (_.isFunction(_.get(this.table, 'current.table.refs.setScrollX'))) {
            this.table.current.table.refs.setScrollX(0);
          }
          if (_.isFunction(_.get(this.table, 'current.table.refs.setScroll'))) {
            this.table.current.table.refs.setScroll(0);
          }
        }}
        {...rest}
      />
    );
  };

  renderRowHead = ({ className, style: cellstyle, rowIndex, data }) => {
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
    const { allWorksheetIsSelected, sheetSelectedRows, sheetHiddenColumns } = sheetViewConfig;
    const localLayoutUpdateTime = getLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    const showNumber = (get(view, 'advancedSetting.showno') || '1') === '1' && !isTreeTableView;
    const showOperate = (get(view, 'advancedSetting.showquick') || '1') === '1';

    // 缓存回调函数
    const handleSelectAllWorksheet = value => {
      selectRows({
        selectAll: value,
        rows: [],
      });
    };

    const handleSelect = (newSelected, selectRowId) => {
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
    };

    const handleReverseSelect = () => {
      if (allWorksheetIsSelected) {
        selectRows({
          selectAll: false,
          rows: [],
        });
      } else {
        selectRows({
          rows: data
            .filter(
              r =>
                r.rowid !== 'groupTitle' &&
                r.rowid !== 'loadGroupMore' &&
                !_.find(sheetSelectedRows, row => row.rowid === r.rowid),
            )
            .filter(_.identity),
        });
      }
    };

    const handleHideRows = rowIds => {
      hideRows(rowIds);
      getWorksheetSheetViewSummary();
    };

    const handleOpenRecord = () => {
      this.handleCellClick(undefined, data[rowIndex], rowIndex);
    };

    return (
      <MemoizedRowHead
        className={className}
        style={cellstyle}
        rowIndex={rowIndex}
        data={data}
        isTreeTableView={isTreeTableView}
        isCharge={isCharge}
        isDevAndOps={isDevAndOps}
        appId={appId}
        view={view}
        viewId={viewId}
        controls={controls}
        worksheetInfo={worksheetInfo}
        buttons={buttons}
        sheetViewData={sheetViewData}
        sheetViewConfig={sheetViewConfig}
        tableType={this.tableType}
        numberWidth={this.numberWidth}
        hasBatch={this.hasBatch}
        showNumber={showNumber}
        showOperate={showOperate}
        readonly={this.readonly}
        rowHeadOnlyNum={this.rowHeadOnlyNum}
        tableId={this.tableId}
        lineNumberBegin={this.lineNumberBegin}
        sheetSwitchPermit={this.sheetSwitchPermit}
        onSelectAllWorksheet={handleSelectAllWorksheet}
        onSelect={handleSelect}
        onReverseSelect={handleReverseSelect}
        updateRows={updateRows}
        hideRows={handleHideRows}
        handleAddSheetRow={addRecord}
        saveSheetLayout={saveSheetLayout}
        resetSheetLayout={resetSheetLayout}
        setHighLight={setHighLight}
        refreshWorksheetControls={refreshWorksheetControls}
        onOpenRecord={handleOpenRecord}
        chartId={this.chartId}
        columns={this.columns}
        isDraft={isDraft}
        printCharge={printCharge}
        layoutChangeVisible={
          isCharge &&
          (!!sheetHiddenColumns.length ||
            Number(localLayoutUpdateTime) >
              Number(view.advancedSetting.layoutupdatetime || view.advancedSetting.layoutUpdateTime || 0) ||
            !!getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', viewId))
        }
      />
    );
  };

  renderOperates = ({ className, style, control, row, rowIndex, onCellClick }) => {
    const { view, addRecord, setHighLight, hideRows, controls, worksheetInfo = {}, sheetViewData = {} } = this.props;
    const recordId = row.rowid;
    const { buttonsCheckStatus } = this.state;
    const status = buttonsCheckStatus ? Object.values(buttonsCheckStatus)[0] || {} : {};
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
          } else if (!e.target.closest('.recordOperateDialog')) {
            e.stopPropagation();
          }
        }}
      >
        <OperateButtons
          status={status}
          refreshFlag={sheetViewData.refreshFlag}
          row={row}
          rowHeight={ROW_HEIGHT[view.rowHeight] || 34}
          recordId={recordId}
          controls={controls}
          entityName={worksheetInfo.entityName}
          onCopySuccess={(record, afterRowId) => {
            setHighLight(this.tableId, rowIndex + 1);
            addRecord(record ? Object.assign({}, record, { group: row.group }) : {}, afterRowId);
          }}
          onDeleteSuccess={() => {
            hideRows([recordId]);
          }}
        />
      </div>
    );
  };

  renderGroupTitle = ({ className, style, row, columnIndex, getColumnWidth }) => {
    const {
      view,
      appId,
      worksheetId,
      viewId,
      foldedMap,
      updateFolded,
      sheetViewData = {},
      changeWorksheetSheetViewSummaryType,
      insertToGroupedRow,
    } = this.props;
    const { fixedColumnCount, allWorksheetIsSelected, sheetSelectedRows } = this.props.sheetViewConfig;
    const { allowAdd, lineEditable } = this.tableConfig;
    const projectId = get(this, 'props.worksheetInfo.projectId');

    return (
      <GroupTitleCell
        className={className}
        style={style}
        row={row}
        columnIndex={columnIndex}
        getColumnWidth={getColumnWidth}
        view={view}
        appId={appId}
        worksheetId={worksheetId}
        viewId={viewId}
        projectId={projectId}
        foldedMap={foldedMap}
        updateFolded={updateFolded}
        sheetViewData={sheetViewData}
        changeWorksheetSheetViewSummaryType={changeWorksheetSheetViewSummaryType}
        insertToGroupedRow={insertToGroupedRow}
        fixedColumnCount={fixedColumnCount}
        allWorksheetIsSelected={allWorksheetIsSelected}
        sheetSelectedRows={sheetSelectedRows}
        allowAdd={allowAdd}
        lineEditable={lineEditable}
        columns={this.columns}
        rowHeadOnlyNum={this.rowHeadOnlyNum}
      />
    );
  };

  renderGroupMore = ({ className, style, row, columnIndex, getColumnWidth }) => {
    const { loadGroupMore, groupFetchParams = {} } = this.props;
    const { fixedColumnCount } = this.props.sheetViewConfig;
    let newClassName = className + ' loadMoreCell';
    if (columnIndex === 0) {
      if (fixedColumnCount === 0 || fixedColumnCount === 1) {
        newClassName += ' cellRight2px';
      }
      style.width = getColumnWidth(0) + getColumnWidth(1);
      return (
        <div style={style} className={newClassName}>
          <div
            className="Gray_75 Font13 Hand valignWrapper"
            style={{ marginLeft: 40, height: '100%' }}
            onClick={() => {
              if (groupFetchParams[row.groupKey]?.isLoading) {
                return;
              }
              loadGroupMore(row.groupKey);
            }}
          >
            {groupFetchParams[row.groupKey]?.isLoading ? (
              <>
                {_l('加载中')}
                <i className="icon icon-loading_button groupLoading InlineBlock mLeft5 Gray_9e Font18"></i>{' '}
              </>
            ) : (
              <span className="ThemeHoverColor3">{_l('加载更多')}</span>
            )}
          </div>
        </div>
      );
    }
    if (columnIndex === 1) {
      return null;
    }
    return <div style={style} className={newClassName}></div>;
  };

  checkSingleRowBtns = rowId => {
    const { worksheetId, sheetFetchParams } = this.props;
    const operatesButtons = this.getOperateButtons(this.props);
    if (!operatesButtons.length || !rowId) return;
    if (!rowId) return;
    worksheetAjax
      .checkWorksheetRowsBtn({
        worksheetId,
        rowIds: [rowId],
        btnIds: operatesButtons.map(b => b.btnId),
      })
      .then(data => {
        const { pageIndex, pageSize } = sheetFetchParams;
        const key = `${pageIndex}x${pageSize}`;
        const newBtnCheckStatus = { ...get(this.state.buttonsCheckStatus, key, {}) };
        // 清除之前状态
        operatesButtons.forEach(btn => {
          delete newBtnCheckStatus[`${rowId}-${btn.btnId}`];
        });
        // 添加新状态
        data.forEach(item => {
          item.rowIds.forEach(rId => {
            if (rId === rowId) {
              newBtnCheckStatus[`${rId}-${item.btnId}`] = true;
            }
          });
        });
        this.setState(prevState => ({
          buttonsCheckStatus: {
            ...prevState.buttonsCheckStatus,
            [key]: newBtnCheckStatus,
          },
        }));
      });
  };

  debounceUpdateControlOfRow(delay = 500) {
    const { updateControlOfRow } = this.props;
    const timers = new Map();

    return function ({ recordId, cell: { controlId: cid, value: newValue }, rules }) {
      const key = [recordId, cid, newValue].join('-');
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
      }

      timers.set(
        key,
        setTimeout(() => {
          updateControlOfRow({ recordId, cell: { controlId: cid, value: newValue }, rules });
          timers.delete(key);
        }, delay),
      );
    };
  }

  asyncUpdate(row, cell, options) {
    const { worksheetInfo, updateControlOfRow, controls, sheetSearchConfig, sheetViewData = {} } = this.props;
    const { rows = [] } = sheetViewData;
    row = _.find(rows, { rowid: row.rowid }) || {};
    const { projectId, rules = [] } = worksheetInfo;
    const asyncUpdateControlOfRow = this.debounceUpdateControlOfRow();
    const asyncUpdateCell = (cid, newValue) => {
      if (typeof newValue === 'object' || cid === cell.controlId) {
        return;
      }
      asyncUpdateControlOfRow({ recordId: row.rowid, cell: { controlId: cid, value: newValue }, rules });
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
    updateControlOfRow(
      { cell, cells: updatedCells, recordId: row.rowid, rules },
      {
        ...options,
        onSuccess: () => {
          this.checkSingleRowBtns(row.rowid);
          if (_.isFunction(options.onSuccess)) {
            options.onSuccess();
          }
        },
      },
    );
  }

  render() {
    const {
      type,
      isCharge,
      fullShowTable,
      minRowCount,
      isTreeTableView,
      treeTableViewData,
      sheetViewData,
      foldedMap,
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
      operateButtonLoading,
      updateDefaultScrollLeft,
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
    const { readonly } = this;
    const { loading } = sheetViewData;
    let rows = sheetViewData.rows;
    const operatesButtons = this.getOperateButtons(this.props);
    const operatesButtonsStyle = getSheetOperatesButtonsStyle(view);
    const showOperatesInRow = !!operatesButtons.length && !get(window, 'shareState.shareId');
    const operatesButtonsWidth = this.getOperateButtonsMaxWidth({
      buttons: operatesButtons,
      style: operatesButtonsStyle.style,
      visibleNum: operatesButtonsStyle.visibleNum,
      showIcon: operatesButtonsStyle.showIcon,
      rows: rows.filter(r => r.rowid !== 'groupTitle' && r.rowid !== 'loadGroupMore'),
    });
    const { sheetSelectedRows = [], sheetColumnWidths, columnStyles, defaultScrollLeft } = sheetViewConfig;
    const { worksheetId, projectId, allowAdd, rules = [], isWorksheetQuery } = worksheetInfo;
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
    const enableRules = (get(view, 'advancedSetting.enablerules') || (this.isManageView ? '0' : '1')) === '1';
    const navGroupData = (get(worksheetInfo, 'template.controls') || []).find(
      o => o.controlId === get(view, 'navGroup[0].controlId'),
    );
    const { lineEditable } = this.tableConfig;
    const { rowHeadWidth } = this;
    let isGroupTableView = !!getGroupControlId(view);
    let fixedColumnCount = sheetViewConfig.fixedColumnCount;
    if (isTreeTableView) {
      fixedColumnCount = fixedColumnCount + 1;
    } else if (isGroupTableView && fixedColumnCount < 1) {
      fixedColumnCount = 1;
    }
    if (isGroupTableView && !_.isEmpty(foldedMap)) {
      rows = rows.filter(({ groupKey }) => !foldedMap[groupKey]);
    }
    const rowHeights =
      isGroupTableView &&
      rows.map(row => {
        if (row.rowid === 'groupTitle') {
          return 34;
        }
        return ROW_HEIGHT[view.rowHeight] || 34;
      });
    const getRowHeight = rowIndex => rowHeights[rowIndex];
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
            currentSheetRows={rows.filter(r => r.rowid !== 'groupTitle' && r.rowid !== 'loadGroupMore')}
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
            inView={true}
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
            fixedColumnCount={fixedColumnCount}
            rightFixedCount={showOperatesInRow ? 1 : 0}
            sheetColumnWidths={sheetColumnWidths}
            columnStyles={columnStyles}
            allowAdd={
              this.isManageView || (isOpenPermit(permitList.createButtonSwitch, this.sheetSwitchPermit) && allowAdd)
            }
            canSelectAll={!!rows.length}
            data={rows}
            {...(ROW_HEIGHT[view.rowHeight] === 34 || !isGroupTableView
              ? {}
              : {
                  getRowHeight,
                })}
            rowHeight={ROW_HEIGHT[view.rowHeight] || 34}
            rowHeightEnum={view.rowHeight}
            keyWords={filters.keyWords}
            sheetIsFiltered={
              !!(
                filters.keyWords ||
                get(filters, 'filterControls.length') ||
                get(filters, 'filtersGroup.length') ||
                !_.isEmpty(quickFilter) ||
                !_.isEmpty(view?.filters)
              )
            }
            showNewRecord={openNewRecord}
            defaultScrollLeft={defaultScrollLeft}
            onScroll={() => {
              if (defaultScrollLeft) {
                updateDefaultScrollLeft(0);
              }
            }}
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
            showGenDataFromMingo={
              this.allowShowGenDataFromMingo &&
              !get(md, 'global.Account.isPortal') &&
              allowAdd &&
              !this.chartId &&
              !isDraft &&
              type !== 'single' &&
              (this.isManageView ||
                (isOpenPermit(permitList.createButtonSwitch, this.sheetSwitchPermit) && allowAdd)) &&
              !window.isPublicApp
            }
            showVerticalLine={showVerticalLine}
            showAsZebra={showAsZebra && !isGroupTableView}
            onCellClick={this.handleCellClick}
            onCellMouseDown={this.handleCellMouseDown}
            renderFooterCell={this.renderSummaryCell}
            renderColumnHead={this.renderColumnHead}
            renderRowHead={this.renderRowHead}
            renderOperates={args => this.renderOperates({ ...args })}
            renderGroupTitle={this.renderGroupTitle}
            renderGroupMore={this.renderGroupMore}
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
  groupFetchParams: shape({}),
  treeTableViewData: shape({}),
  updateRows: func,
  updateTreeByRowChange: func,
};

export default connect(
  state => ({
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
    foldedMap: state.sheet.sheetview.foldedMap,
    groupFetchParams: state.sheet.sheetview.groupFetchParams,
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(sheetviewActions, [
          'setViewLayout',
          'setRowsEmpty',
          'addRecord',
          'fetchRows',
          'loadGroupMore',
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
          'updateFolded',
          'insertToGroupedRow',
        ]),
        updateWorksheetSomeControls,
        refreshWorksheetControls,
        updateWorksheetInfo,
        saveView,
      },
      dispatch,
    ),
)(SheetViewConnecter);
