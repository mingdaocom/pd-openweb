import React, { Fragment } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import moment from 'moment';
import cx from 'classnames';
import { browserIsMobile, createElementFromHtml } from 'src/util';
import Pagination from 'worksheet/components/Pagination';
import { Menu, MenuItem, Skeleton } from 'ming-ui';
import { CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, ROW_HEIGHT } from 'worksheet/constants/enum';
import SearchInput from 'worksheet/components/SearchInput';
import worksheetAjax from 'src/api/worksheet';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import ChildTableContext from './ChildTableContext';
import { selectRecord } from 'src/components/recordCardListDialog';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import { controlState, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { FORM_ERROR_TYPE_TEXT, FROM } from 'src/components/newCustomFields/tools/config';
import { canAsUniqueWidget } from 'src/pages/widgetConfig/util/setting';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getSheetViewRows, getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import { openChildTable } from '../ChildTableDialog';
import { WORKSHEETTABLE_FROM_MODULE, SYSTEM_CONTROLS, SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import {
  sortControlByIds,
  replaceByIndex,
  isRelateRecordTableControl,
  copySublistRow,
  parseAdvancedSetting,
  formatRecordToRelateRecord,
  handleSortRows,
  updateOptionsOfControls,
  filterRowsByKeywords,
  filterEmptyChildTableRows,
  replaceControlsTranslateInfo,
} from 'worksheet/util';
import ColumnHead from '../BaseColumnHead';
import RowHead from './ChildTableRowHead';
import MobileTable from './MobileTable';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { importFileToChildTable } from '../ImportFileToChildTable';
import WorksheetTable from '../WorksheetTable';
import RowDetail from './RowDetailModal';
import RowDetailMobile from './RowDetailMobileModal';
import * as actions from './redux/actions';
import _, { filter, find, findIndex, get, includes, isUndefined, last } from 'lodash';
import { createRequestPool } from 'worksheet/api/standard';
import ExportSheetButton from '../ExportSheetButton';

const IconBtn = styled.span`
  color: #9e9e9e;
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
  &:hover {
    background: #f7f7f7;
  }
`;

const SearchResultNum = styled.div`
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 16px;
`;

const AddRowComp = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  cursor: pointer;
  padding-left: 14px;
  font-size: 12px;
  .hoverShow {
    visibility: hidden;
  }
  &:hover {
    background: #f8f8f8;
    .hoverShow {
      visibility: visible;
    }
  }
`;

const BatchAddOfAddRowComp = styled.div`
  margin-left: 32px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  padding: 0 8px;
  background: #fff;
  &:hover {
    color: #2196f3;
  }
`;

const isMobile = browserIsMobile();
const systemControls = SYSTEM_CONTROLS.map(c => ({ ...c, fieldPermission: '111' }));
const MAX_COUNT = 1000;

class ChildTable extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    mode: PropTypes.string,
    entityName: PropTypes.string,
    recordId: PropTypes.string,
    control: PropTypes.shape({}),
    masterData: PropTypes.shape({}),
    registerCell: PropTypes.func,
    loadRows: PropTypes.func,
    initRows: PropTypes.func,
    addRow: PropTypes.func,
    updateRow: PropTypes.func,
    deleteRow: PropTypes.func,
    sortRows: PropTypes.func,
    resetRows: PropTypes.func,
    mobileIsEdit: PropTypes.bool,
    showSearch: PropTypes.bool,
    showExport: PropTypes.bool,
  };

  static defaultProps = {
    masterData: { formData: [] },
    registerCell: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      controls: this.getControls(props),
      tempSheetColumnWidths: {},
      previewRowIndex: null,
      recordVisible: false,
      loading: !!props.recordId && !props.initSource && !(get(props, 'base.loaded') || get(props, 'base.reset')),
      selectedRowIds: [],
      pageIndex: 1,
      keywords: '',
      pageSize: this.settings.rownum,
      headHeight: 34,
      frozenIndex: this.settings.frozenIndex,
      frozenIndexChanged: false,
    };
    this.state.sheetColumnWidths = this.getSheetColumnWidths();
    this.controls = props.controls;
    this.abortController = typeof AbortController !== 'undefined' && new AbortController();
    this.requestPool = createRequestPool({ abortController: this.abortController });
    const _handleUpdateCell = this.handleUpdateCell.bind(this);
    this.handleUpdateCell = (...args) => {
      flushSync(() => {
        _handleUpdateCell(...args);
      });
    };
    props.registerCell(this);
  }

  componentDidMount() {
    const { mode, control, recordId, needResetControls } = this.props;
    this.updateDefsourceOfControl();
    if (recordId) {
      if (!(get(this, 'props.base.loaded') || get(this, 'props.base.reset'))) {
        this.loadRows(undefined, { needResetControls });
      }
    }
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, options => this.refresh(null, options));
    }
    $(this.childTableCon).on('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).on('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    let { max = 500 } = parseAdvancedSetting(this.props.control.advancedSetting);
    if (nextProps.refreshFlag && nextProps.refreshFlag !== this.props.refreshFlag) {
      this.refresh();
    }
    const { initRows } = this.props;
    this.updateDefsourceOfControl(nextProps);
    const control = this.props.control;
    const nextControl = nextProps.control;
    const isAddRecord = !nextProps.recordId;
    const valueChanged = !_.isEqual(control.value, nextControl.value);
    this.valueChanged = valueChanged;
    if (nextProps.recordId !== this.props.recordId) {
      this.refresh(nextProps, { needResetControls: false });
    } else if (isAddRecord && valueChanged && typeof nextControl.value === 'undefined') {
      initRows([]);
    }
    if (
      nextControl.controlId !== control.controlId ||
      !_.isEqual(nextControl.showControls, control.showControls) ||
      !_.isEqual(
        (control.relationControls || []).map(a => a.fieldPermission),
        (nextControl.relationControls || []).map(a => a.fieldPermission),
      ) ||
      !_.isEqual(
        (control.relationControls || []).map(a => a.required),
        (nextControl.relationControls || []).map(a => a.required),
      )
    ) {
      this.setState(
        {
          controls: this.getControls(nextProps),
        },
        () => {
          if (!_.isEqual(nextControl.showControls, control.showControls)) {
            this.setState({
              sheetColumnWidths: this.getSheetColumnWidths(nextProps.control),
            });
          }
        },
      );
    }
    // 重新渲染子表来适应新宽度
    if (
      nextProps.control.sideVisible !== this.props.control.sideVisible ||
      nextProps.control.formWidth !== this.props.control.formWidth
    ) {
      try {
        setTimeout(() => {
          if (this.worksheettable && this.worksheettable.current) {
            this.worksheettable.current.handleUpdate();
          }
        }, 100);
      } catch (err) {
        console.error(err);
      }
    }
    if (!_.isEqual(this.props.rows, nextProps.rows)) {
      const { pageIndex, pageSize } = this.state;
      const pageNum = Math.ceil(nextProps.rows.length / pageSize);
      if (pageIndex > pageNum) {
        this.setState({ pageIndex: pageNum });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state, nextState)) {
      return true;
    }
    return (
      !_.isEqual(get(this.props, 'treeTableViewData.treeMap'), get(nextProps, 'treeTableViewData.treeMap')) ||
      !_.isEqual(this.props.rows, nextProps.rows) ||
      !_.isEqual(this.props.cellErrors, nextProps.cellErrors) ||
      !_.isEqual(this.props.mobileIsEdit, nextProps.mobileIsEdit) ||
      !_.isEqual(this.props.control.relationControls, nextProps.control.relationControls) ||
      !_.isEqual(this.props.control.fieldPermission, nextProps.control.fieldPermission)
    );
  }

  componentWillUnmount() {
    const { mode, control } = this.props;
    if (mode !== 'dialog' && _.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, undefined);
    }
    $(this.childTableCon).off('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).off('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.abortController && this.abortController.abort && this.abortController.abort();
  }

  worksheettable = React.createRef();
  searchRef = React.createRef();

  get settings() {
    const { control = {} } = this.props;
    const parsedSettings = parseAdvancedSetting(control.advancedSetting);
    let { min, max, rownum, enablelimit, treeLayerControlId } = parsedSettings;
    let minCount;
    let maxCount = _.get(window, 'shareState.isPublicForm') ? 200 : MAX_COUNT;
    if (enablelimit) {
      minCount = min;
      maxCount = max;
    }
    return { ...parsedSettings, minCount, maxCount, rownum, treeLayerControlId };
  }

  get searchConfig() {
    const { searchConfig, base } = this.props;
    return get(base, 'searchConfig') || searchConfig;
  }

  get worksheetInfo() {
    const { base = {} } = this.props;
    return base.worksheetInfo || {};
  }

  get showAsPages() {
    const { base = {} } = this.props;
    return get(this, 'props.control.advancedSetting.showtype') === '2' && !isMobile && !base.isTreeTableView;
  }

  getControls(props, { newControls } = {}) {
    props = props || this.props;
    const { baseLoading, from, appId, base = {}, control = {}, updateBase } = props;
    const { instanceId, workId, worksheetInfo } = base;
    const isWorkflow =
      ((instanceId && workId) || window.shareState.isPublicWorkflowRecord) &&
      worksheetInfo.workflowChildTableSwitch !== false;
    const { showControls = [], advancedSetting = {}, relationControls = [] } = control;
    if (baseLoading) {
      return [];
    }
    const controls = replaceControlsTranslateInfo(
      appId,
      worksheetInfo.worksheetId,
      (newControls || get(base, 'controls') || props.controls).map(c => ({
        ...c,
        ...(isWorkflow
          ? {}
          : {
              controlPermissions:
                isRelateRecordTableControl(c) || c.type === 34
                  ? '000'
                  : controlState(control, from).editable
                  ? '111'
                  : '101',
            }),
      })),
    );
    let controlssorts = [];
    try {
      controlssorts = JSON.parse(advancedSetting.controlssorts);
    } catch (err) {}
    let result = sortControlByIds(controls, _.isEmpty(controlssorts) ? showControls : controlssorts).map(c => {
      const control = { ...c };
      const resetedControl = _.find(relationControls.concat(systemControls), { controlId: control.controlId });
      if (resetedControl) {
        control.required = resetedControl.required;
        control.fieldPermission = resetedControl.fieldPermission;
      }
      if (!_.find(showControls, scid => control.controlId === scid)) {
        control.fieldPermission = '000';
      } else {
        control.fieldPermission = replaceByIndex(control.fieldPermission || '111', 2, '1');
      }
      if (!isWorkflow) {
        control.controlPermissions = '111';
      } else {
        control.controlPermissions = replaceByIndex(control.controlPermissions || '111', 2, '1');
      }
      if (
        control.controlId === 'ownerid' ||
        (_.get(window, 'shareState.isPublicWorkflowRecord') &&
          _.includes(
            [
              WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
              WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
              WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
            ],
            control.type,
          ))
      ) {
        control.controlPermissions = replaceByIndex(control.controlPermissions || '111', 1, '0');
        control.fieldPermission = replaceByIndex(control.fieldPermission || '111', 1, '0');
      }
      return control;
    });
    updateBase({ controls: result });
    result = result.filter(
      c =>
        c &&
        !(
          window.isPublicWorksheet &&
          _.includes([WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT], c.type)
        ),
    );
    return result;
  }

  updateAbortController = () => {
    this.abortController && this.abortController.abort && this.abortController.abort();
    this.abortController = typeof AbortController !== 'undefined' && new AbortController();
    this.requestPool = createRequestPool({ abortController: this.abortController });
  };

  getControl(controlId) {
    return _.find(this.state.controls, { controlId });
  }

  handleKeyDown = e => {
    if (e.ctrlKey && e.key === 'Enter' && this.childTableCon.querySelector('.cell.focus')) {
      e.preventDefault();
      e.stopPropagation();
      this.handleAddRowByLine();
    }
  };

  handleClearAndSetRows(rows) {
    const { control, clearAndSetRows } = this.props;
    const { controls = [] } = this.state;
    const sort = safeParse(control.advancedSetting.sorts)[0];
    if (sort && sort.controlId) {
      const sortControl = _.find(controls, c => c.controlId === sort.controlId);
      if (sortControl) {
        clearAndSetRows(handleSortRows(rows, sortControl, sort.isAsc));
        return;
      }
    }
    clearAndSetRows(rows);
  }

  updateDefsourceOfControl(nextProps) {
    const {
      recordId,
      control: { controlId },
      masterData,
    } = nextProps || this.props;
    const { controls } = this.state;
    const relateRecordControl = (nextProps || this.props).control;
    this.setState({
      controls: controls.map(control => {
        if (
          control.type === 29 &&
          control.sourceControlId === controlId &&
          control.dataSource === relateRecordControl.worksheetId
        ) {
          try {
            control.advancedSetting = _.assign({}, control.advancedSetting, {
              defsource: JSON.stringify([
                {
                  staticValue: JSON.stringify([
                    JSON.stringify({
                      rowid: recordId,
                      ...[{}, ...masterData.formData.filter(c => c.type !== 34)].reduce((a = {}, b = {}) =>
                        Object.assign(a, {
                          [b.controlId]:
                            b.type === 29 && _.isObject(b.value) && b.value.records
                              ? JSON.stringify(
                                  // 子表使用双向关联字段作为默认值 RELATERECORD_OBJECT
                                  b.value.records.map(r => ({ sid: r.rowid, sourcevalue: JSON.stringify(r) })),
                                )
                              : b.value,
                        }),
                      ),
                    }),
                  ]),
                },
              ]),
            });
            return control;
          } catch (err) {}
        } else {
          return control;
        }
      }),
    });
  }

  loadRows(nextProps, { needResetControls } = {}) {
    const { control, recordId, masterData, loadRows, from, base = {} } = nextProps || this.props;
    const { isTreeTableView } = base;
    if (!recordId || !masterData) {
      return;
    }
    loadRows({
      getWorksheet: needResetControls,
      worksheetId: masterData.worksheetId,
      recordId,
      controlId: control.controlId,
      isCustomButtonFillRecord: control.isCustomButtonFillRecord,
      from,
      isTreeTableView,
      callback: res => {
        if (res === null) {
          this.setState({
            error: _l('没有权限'),
          });
          return;
        }
        const state = { loading: false };
        if (needResetControls) {
          let newControls = (_.get(res, 'worksheet.template.controls') || _.get(res, 'template.controls')).concat(
            systemControls,
          );
          // TODO 这里要和 getControls 一起统一到 action 内处理
          const { uniqueControlIds } = parseAdvancedSetting(control.advancedSetting);
          newControls = newControls.map(c => ({
            ...c,
            uniqueInRecord: includes(uniqueControlIds, c.controlId) && canAsUniqueWidget(c),
          }));
          if (newControls && newControls.length) {
            state.controls = this.getControls(nextProps, { newControls });
          }
        }
        this.setState(state);
      },
    });
  }

  refresh = (nextProps, { needResetControls = true } = {}) => {
    this.setState({
      loading: true,
      sortedControl: undefined,
      keywords: undefined,
      isBatchEditing: false,
      selectedRowIds: [],
      pageIndex: 1,
    });
    this.loadRows(nextProps, { needResetControls });
    if (get(this, 'searchRef.current.clear')) {
      this.searchRef.current.clear();
    }
  };

  getShowColumns() {
    const { control, treeTableViewData, rows, base = {} } = this.props;
    const { isTreeTableView } = base;
    const { treeLayerControlId } = this.settings;
    const { controls } = this.state;
    const hiddenTypes = window.isPublicWorksheet ? [48] : [];
    let columns = !controls.length
      ? [{}]
      : controls
          .filter(
            c =>
              _.find(control.showControls, scid => scid === c.controlId) &&
              c.type !== 34 &&
              controlState(c).visible &&
              !isRelateRecordTableControl(c) &&
              !_.includes(hiddenTypes.concat(SHEET_VIEW_HIDDEN_TYPES), c.type),
          )
          .map(c => _.assign({}, c));
    if (isTreeTableView && columns[0]) {
      const appendWidth = getTreeExpandCellWidth(treeTableViewData.maxLevel, rows.length);
      this.expandCellAppendWidth = appendWidth;
      columns[0].appendWidth = appendWidth;
      columns[0].hideFrozen = true;
      columns[0].isTreeExpandCell = true;
    }
    return columns;
  }

  getSheetColumnWidths(control) {
    control = control || this.props.control;
    const columns = this.getShowColumns();
    const result = {};
    let widths = [];
    try {
      widths = JSON.parse(control.advancedSetting.widths);
    } catch (err) {}
    columns.forEach((column, i) => {
      result[column.controlId] = widths[i];
    });
    return result;
  }

  newRow = (defaultRow, { isDefaultValue, isCreate, isQueryWorksheetFill } = {}) => {
    const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
    const row = this.rowUpdate({ row: defaultRow, rowId: tempRowId }, { isCreate, isQueryWorksheetFill });
    return {
      ...row,
      rowid: tempRowId,
      pid: (defaultRow && defaultRow.pid) || '',
      allowedit: true,
      addTime: new Date().getTime(),
    };
  };

  copyRow(row) {
    const { addRow } = this.props;
    addRow(
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: `temp-${uuidv4()}`,
        allowedit: true,
        isCopy: true,
        pid: row.pid,
        addTime: new Date().getTime(),
      }),
      row.rowid,
    );
  }
  copyRows(rows) {
    const { addRows } = this.props;
    const newRows = rows.map(row =>
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: `temp-${uuidv4()}`,
        allowedit: true,
        isCopy: true,
        pid: row.pid,
        addTime: new Date().getTime(),
      }),
    );
    addRows(newRows);
  }

  rowUpdate({ row, controlId, value, rowId } = {}, { isCreate = false, isQueryWorksheetFill = false } = {}) {
    const { masterData, recordId } = this.props;
    const { projectId, rules = [] } = this.worksheetInfo;
    const { searchConfig } = this;
    const asyncUpdateCell = (cid, newValue) => {
      this.handleUpdateCell(
        {
          control: this.getControl(cid),
          cell: {
            controlId: cid,
            value: newValue,
          },
          row: { rowid: rowId || (row || {}).rowid },
        },
        {
          isQueryWorksheetFill,
          asyncUpdate: true,
          updateSuccessCb: needUpdateRow => {
            if (isMobile) {
              this.handleRowDetailSave(needUpdateRow);
            }
          },
        },
      );
    };
    const formdata = new DataFormat({
      requestPool: this.requestPool,
      data: this.state.controls.map(c => {
        let controlValue = (row || {})[c.controlId];
        if (_.isUndefined(controlValue) && (isCreate || !row)) {
          controlValue = c.value;
        }
        return {
          ...c,
          isSubList: true,
          isQueryWorksheetFill,
          value: controlValue,
        };
      }),
      isCreate: isCreate || !row,
      from: FROM.NEWRECORD,
      rules,
      searchConfig,
      projectId,
      masterData,
      abortController: this.abortController,
      masterRecordRowId: recordId,
      onAsyncChange: changes => {
        flushSync(() => {
          if (!_.isEmpty(changes.controlIds)) {
            changes.controlIds.forEach(cid => {
              asyncUpdateCell(cid, changes.value);
            });
          } else if (changes.controlId) {
            asyncUpdateCell(changes.controlId, changes.value);
          }
        });
      },
    });
    if (controlId) {
      formdata.updateDataSource({ controlId, value });
    }
    return [
      {
        ...(row || {}),
        rowid: row ? row.rowid : rowId,
        updatedControlIds: _.uniqBy(((row && row.updatedControlIds) || []).concat(formdata.getUpdateControlIds())),
      },
      ...formdata.getDataSource(),
    ].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
  }

  handleSetPageIndexWhenAddRow(newRowsLength) {
    const { pageSize, pageIndex } = this.state;
    let newPageIndex = pageIndex;
    if (this.showAsPages && newRowsLength > pageSize) {
      newPageIndex = Math.ceil(newRowsLength / pageSize);
      if (pageIndex !== newPageIndex) {
        this.setState({ pageIndex: newPageIndex });
      }
    }
    return newPageIndex;
  }

  handleAddRowByLine = () => {
    const { from, control, addRow, rows } = this.props;
    const { pageSize, pageIndex } = this.state;
    const maxCount = this.settings.maxCount;
    const maxShowRowCount = this.settings.rownum;
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    let { allowadd } = parseAdvancedSetting(control.advancedSetting);
    const filteredRows = filterEmptyChildTableRows(rows);
    const disabledNew = filteredRows.length >= maxCount || disabled || !allowadd;
    if (disabledNew) {
      return;
    }
    const newPageIndex = this.handleSetPageIndexWhenAddRow(filteredRows.length + 1);
    this.updateDefsourceOfControl();
    const row = this.newRow();
    addRow(row);
    setTimeout(() => {
      try {
        this.worksheettable.current.table.refs.setScroll(0, rows.length + 1 > maxShowRowCount ? 100000 : 0);
        setTimeout(() => {
          const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
            '.cell.row-' +
              (this.showAsPages && newPageIndex > 1
                ? filteredRows.length % (pageSize * (newPageIndex - 1))
                : filteredRows.length) +
              '.canedit',
          );
          if (activeCell) {
            activeCell.click();
          }
        }, 100);
      } catch (err) {}
    }, 100);
  };

  handleImport = () => {
    const { control, masterData, rows, addRows } = this.props;
    const { projectId } = this.worksheetInfo;
    const controls = this.getShowColumns();
    if (!controls.filter(c => _.includes(CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, c.type)).length) {
      alert(_l('没有支持导入的字段'), 3);
      return;
    }
    importFileToChildTable({
      projectId,
      maxCount: this.settings.maxCount,
      worksheetId: masterData.worksheetId,
      controlId: control.controlId,
      dataCount: filterEmptyChildTableRows(rows).length,
      controls,
      onClose: data => {
        if (!_.isArray(data)) {
          return;
        }
        setTimeout(() => {
          addRows(
            data
              .slice(0, this.settings.maxCount - filterEmptyChildTableRows(rows).length)
              .map(updatedValues => this.newRow(updatedValues, { isCreate: true })),
          );
        }, 0);
      },
    });
  };

  handleAddRowsFromRelateRecord = batchAddControls => {
    const { addRows, control, rows } = this.props;
    let { h5showtype, h5abstractids = [] } = parseAdvancedSetting(control.advancedSetting);
    const { entityName } = this.worksheetInfo;
    const { controls } = this.state;
    const relateRecordControl = batchAddControls[0];
    if (!relateRecordControl) {
      return;
    }
    this.updateDefsourceOfControl();
    const tempRow = this.newRow();
    const relateRecord = isMobile ? mobileSelectRecord : selectRecord;
    relateRecord({
      entityName,
      canSelectAll: true,
      multiple: true,
      control: relateRecordControl,
      controlId: relateRecordControl.controlId,
      parentWorksheetId: control.dataSource,
      allowNewRecord: false,
      viewId: relateRecordControl.viewId,
      relateSheetId: relateRecordControl.dataSource,
      filterRowIds:
        relateRecordControl.unique || relateRecordControl.uniqueInRecord
          ? (rows || [])
              .map(r => _.get(safeParse(r[relateRecordControl.controlId], 'array'), '0.sid'))
              .filter(_.identity)
          : [],
      formData: controls.map(c => ({ ...c, value: tempRow[c.controlId] })).concat(this.props.masterData.formData),
      onOk: selectedRecords => {
        const rowsLength = filterEmptyChildTableRows(rows).length;
        if (rowsLength + selectedRecords.length > this.settings.maxCount) {
          alert(_l('最多输入%0条记录，超出的记录不写入', this.settings.maxCount), 3);
        }
        addRows(
          selectedRecords.slice(0, this.settings.maxCount - rowsLength).map(selectedRecord => {
            const row = this.rowUpdate({
              row: this.newRow(),
              controlId: relateRecordControl.controlId,
              value: JSON.stringify(formatRecordToRelateRecord(relateRecordControl.relationControls, [selectedRecord])),
            });
            return row;
          }),
        );
        this.handleSetPageIndexWhenAddRow(rowsLength + selectedRecords.length);
        setTimeout(() => {
          try {
            const ele = document.querySelector('.mobileSheetRowRecord .recordScroll');
            if (isMobile && ele) {
              const itemHeight =
                h5showtype === '2' ? 36 * ((_.isEmpty(h5abstractids) ? 3 : h5abstractids.length) + 1) : 36;
              ele.scrollTop = ele.scrollTop + (selectedRecords.length - 1) * itemHeight;
            }
            this.worksheettable.current.table.refs.setScroll(0, 100000);
          } catch (err) {}
        }, 100);
      },
    });
  };

  handleUpdateCell({ control, cell, row = {} }, options) {
    const { rows, updateRow, addRow } = this.props;
    const { controls } = this.state;
    const rowData = _.find(rows, r => r.rowid === row.rowid);
    if (!rowData) {
      return;
    }
    let { value } = cell;
    const newRow = this.rowUpdate(
      { row: rowData, controlId: cell.controlId, value },
      {
        ...options,
        control,
      },
    );
    function update() {
      if (_.isFunction(options.updateSuccessCb)) {
        options.updateSuccessCb(newRow);
      }
      updateRow({ rowid: row.rowid, value: newRow }, { asyncUpdate: options.asyncUpdate });
    }
    // 处理新增自定义选项
    if (
      _.includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], control.type) &&
      /{/.test(value)
    ) {
      const newOption = {
        index: control.options.length + 1,
        isDeleted: false,
        key: _.last(JSON.parse(value)),
        ...JSON.parse(_.last(JSON.parse(value))),
      };
      controls.forEach(c => {
        if (c.controlId === control.controlId) {
          c.options = _.uniqBy([...control.options, newOption], 'key');
        }
      });
      update();
      return;
    }
    update.apply(this);
  }

  handleRowDetailSave = (row, updatedControlIds) => {
    const { updateRow, addRow } = this.props;
    const { previewRowIndex, controls } = this.state;
    const newControls = updateOptionsOfControls(
      controls.map(c => ({ ...{}, ...c, value: row[c.controlId] })),
      row,
    );
    this.setState(
      {
        controls: controls.map(c => {
          const newControl = _.find(newControls, { controlId: c.controlId });
          return newControl ? { ...newControl, value: c.value } : c;
        }),
      },
      () => {
        row.updatedControlIds = _.isEmpty(row.updatedControlIds)
          ? updatedControlIds
          : _.uniqBy(row.updatedControlIds.concat(updatedControlIds));
        row.updatedControlIds = row.updatedControlIds.concat(
          controls
            .filter(c => _.find(updatedControlIds, cid => ((c.advancedSetting || {}).defsource || '').includes(cid)))
            .map(c => c.controlId),
        );
        if (previewRowIndex > -1) {
          updateRow({ rowid: row.rowid, value: row });
        } else {
          addRow(row);
        }
      },
    );
  };

  handleSwitch = ({ prev, next }) => {
    const { previewRowIndex } = this.state;
    let newRowIndex;
    if (prev) {
      newRowIndex = previewRowIndex - 1;
    } else {
      newRowIndex = previewRowIndex + 1;
    }
    this.openDetail(newRowIndex);
  };

  openDetail = index => {
    const { control, rows = [] } = this.props;
    const { rowid } = rows[index] || {};
    this.setState({
      previewRowIndex: index,
      recordVisible: true,
      isEditCurrentRow: true,
    });
  };

  handleClearCellError = key => {
    const { cellErrors, updateCellErrors } = this.props;
    updateCellErrors(_.omit(cellErrors, [key]));
  };

  compareValue(control, value1, value2) {
    try {
      if (control && control.type === 26) {
        return _.isEqual(
          safeParse(value1, 'array').map(c => c.accountId),
          safeParse(value2, 'array').map(c => c.accountId),
        );
      } else {
        return value1 === value2;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  handleUniqueValidate = (controlId, value, rowId, backendCheck) => {
    const { rows, control, updateCellErrors } = this.props;
    const { controls } = this.state;
    const checkControl = _.find(controls, { controlId });
    const { uniqueControlIds } = parseAdvancedSetting(control.advancedSetting);
    const isUniqueInRecord = !_.find(rowId ? rows.filter(row => row.rowid !== rowId) : rows, row =>
      this.compareValue(checkControl, row[controlId], value),
    );
    if (_.includes(uniqueControlIds, controlId)) {
      return isUniqueInRecord;
    } else if (!isUniqueInRecord) {
      return false;
    } else if (backendCheck) {
      if (checkControl && checkControl.unique && !checkControl.uniqueInRecord) {
        worksheetAjax
          .checkFieldUnique({
            worksheetId: control.dataSource,
            controlId,
            controlType: checkControl.type,
            controlValue: value,
          })
          .then(res => {
            if (!res.isSuccess && res.data && res.data.rowId !== rowId) {
              // 不唯一
              updateCellErrors({ [`${rowId}-${controlId}`]: FORM_ERROR_TYPE_TEXT.UNIQUE(checkControl, true) });
            } else if (res.isSuccess) {
              // 唯一
            }
          });
      }
    } else {
      return true;
    }
  };

  handleMouseEnter = e => {
    const cell = $(e.target).closest('.cell:not(.focus)')[0];
    if (!cell) {
      return;
    }
    $(cell).addClass('errorActive');
    const { rows, cellErrors } = this.props;
    const columns = this.getShowColumns();
    const hasError = /cellControlErrorStatus/.test(cell.className);
    const cellIsEditing = /iseditting/.test(cell.className);
    const rowIndex = cell.className.match(/ row-([0-9]+) /) && Number(cell.className.match(/ row-([0-9]+) /)[1]);
    const columnIndex = cell.className.match(/ col-([0-9]+) /) && Number(cell.className.match(/ col-([0-9]+) /)[1]);
    const rowId = (rows[rowIndex] || {}).rowid;
    const controlId = !isUndefined(columnIndex) && (columns[columnIndex - 1] || {}).controlId;
    if (hasError && !cellIsEditing && rowId && controlId) {
      const error = cellErrors[rowId + '-' + controlId];
      if (error) {
        const errorEle = createElementFromHtml(`<div
            class="mdTableErrorTip"
            style="
              position: absolute;
              font-size: 12px;
              padding: 0px 8px;
              height: 26px;
              line-height: 26px;
              white-space: nowrap;
              background: #f44336;
              z-index: 2;
              color: #fff";
          >
            ${error}
          </div>`);
        document.body.appendChild(errorEle);
        const top =
          cell.getBoundingClientRect().y +
          (/row-0/.test(cell.getAttribute('class')) ? cell.offsetHeight - 1 : -1 * errorEle.offsetHeight);
        const left = cell.getBoundingClientRect().x;
        errorEle.style.top = top + 'px';
        errorEle.style.left = left + 'px';
        errorEle.style.zIndex = 9999999;
      }
    }
  };

  handleMouseLeave = () => {
    $('.mdTableErrorTip').remove();
    $('.cell').removeClass('errorActive');
  };

  render() {
    const {
      mode,
      maxHeight,
      cellErrors,
      from,
      recordId,
      viewId,
      control,
      base = {},
      treeTableViewData,
      rows,
      deleteRow,
      deleteRows,
      sortRows,
      addRow,
      updateRow,
      exportSheet,
      mobileIsEdit,
      appId,
      sheetSwitchPermit,
      showSearch,
      showExport,
      updateBase,
      masterData,
      updateTreeNodeExpansion,
    } = this.props;
    const { isTreeTableView } = base;
    const { projectId, rules } = this.worksheetInfo;
    const { searchConfig } = this;
    let {
      allowadd,
      allowcancel,
      allowedit,
      batchcids,
      allowsingle,
      hidenumber,
      rowheight,
      showtype,
      enablelimit,
      min,
      max,
      rownum,
      blankrow,
      h5showtype,
      h5abstractids,
    } = parseAdvancedSetting(control.advancedSetting);
    const { maxCount, allowOpenRecord, allowCopy, titleWrap, treeLayerControlId } = this.settings;
    const maxShowRowCount = this.props.maxShowRowCount || rownum;
    const rowHeight = ROW_HEIGHT[rowheight] || 34;
    const { showAsPages } = this;
    const {
      loading,
      error,
      tempSheetColumnWidths,
      previewRowIndex,
      sheetColumnWidths,
      sortedControl,
      recordVisible,
      controls,
      isBatchEditing,
      selectedRowIds,
      pageSize,
      pageIndex,
      keywords,
      headHeight,
      isEditCurrentRow,
      frozenIndex,
      frozenIndexChanged,
      isMobileSearchFocus,
    } = this.state;
    const { treeMap = {} } = treeTableViewData;
    const batchAddControls = batchcids.map(id => _.find(controls, { controlId: id })).filter(_.identity);
    const addRowFromRelateRecords = !!batchAddControls.length;
    const allowAddByLine =
      (_.isUndefined(_.get(control, 'advancedSetting.allowsingle')) && !addRowFromRelateRecords) || allowsingle;
    let allowExport = _.get(control, 'advancedSetting.allowexport');
    allowExport = _.isUndefined(allowExport) || allowExport === '1';
    const controlPermission = controlState(control, from);
    let tableRows = rows.map(row => {
      if (/^temp/.test(row.rowid)) {
        return row;
      } else if (/^empty/.test(row.rowid)) {
        return { ...row, allowedit: allowadd };
      } else {
        return { ...row, allowedit: allowedit };
      }
    });
    const originRows = tableRows;
    const valueChanged = _.isUndefined(this.props.valueChanged) ? this.valueChanged : this.props.valueChanged;
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const isExceed = filterEmptyChildTableRows(originRows).length >= maxCount;
    const disabledNew = noColumns || disabled || !allowadd;
    const allowBatch = !_.includes([FROM.DEFAULT], from) && this.settings.allowBatch;
    const allowBatchDelete = allowcancel || (allowadd && !!originRows.filter(r => /^temp/.test(r.rowid)).length);
    const allowImport =
      this.settings.allowImport &&
      !_.includes([FROM.DEFAULT], from) &&
      (!_.get(window, 'shareState.shareId') || _.get(window, 'shareState.isPublicForm'));
    const showBatchEdit =
      !isMobile &&
      !disabled &&
      allowBatch &&
      (allowadd || allowcancel) &&
      !!filterEmptyChildTableRows(tableRows).length;
    const showImport = !isMobile && allowImport && !disabledNew;
    const RowDetailComponent = isMobile ? RowDetailMobile : RowDetail;
    if (!columns.length) {
      return <div className="Gray_9e">{_l('没有支持填写的字段')}</div>;
    }
    if (keywords) {
      tableRows = filterRowsByKeywords({ rows: tableRows, controls: controls, keywords });
    }
    let tableData = tableRows;
    if (showAsPages) {
      tableData = tableData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
    }
    if (treeLayerControlId) {
      const emptyRows = _.filter(tableRows, r => /^empty-/.test(r.rowid));
      tableData = getSheetViewRows({ rows: _.filter(tableRows, r => !/^empty-/.test(r.rowid)) }, { treeMap }).concat(
        emptyRows,
      );
    }
    const fullShowTable = tableData.length <= maxShowRowCount;
    let tableHeight = (fullShowTable ? tableData.length || 1 : maxShowRowCount) * rowHeight + headHeight;
    if (maxHeight && tableHeight > maxHeight) {
      tableHeight = maxHeight;
    }
    let tableFooter;
    if (!isMobile && !disabledNew && (allowAddByLine || addRowFromRelateRecords) && !(isExceed || disabledNew)) {
      tableFooter = {
        height: 36,
        comp: (
          <AddRowComp
            className="Gray_9e"
            onClick={
              isExceed || disabledNew
                ? () => {}
                : () => {
                    if (allowAddByLine) {
                      this.handleAddRowByLine();
                    } else if (addRowFromRelateRecords) {
                      this.handleAddRowsFromRelateRecord(batchAddControls);
                    }
                  }
            }
          >
            <i className={`icon ${allowAddByLine ? 'icon-plus' : 'icon-done_all'} mRight5 Font14`}></i>
            <span className="hoverShow content ellipsis" style={{ maxWidth: 200 }}>
              {allowAddByLine ? _l('添加一行') : _l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
            </span>
            {allowAddByLine && addRowFromRelateRecords && (
              <BatchAddOfAddRowComp
                className="hoverShow"
                onClick={e => {
                  this.handleAddRowsFromRelateRecord(batchAddControls);
                  e.stopPropagation();
                }}
              >
                <i className="icon icon-done_all mRight5 Font16"></i>
                <span className="content ellipsis" style={{ maxWidth: 200 }}>
                  {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                </span>
              </BatchAddOfAddRowComp>
            )}
          </AddRowComp>
        ),
      };
    }
    const operateComp = (
      <Fragment>
        {showSearch && (
          <SearchInput
            ref={this.searchRef}
            style={{ marginTop: -6 }}
            inputWidth={100}
            searchIcon={
              <IconBtn className="Hand ThemeHoverColor3">
                <i className="icon icon-search inherit" />
              </IconBtn>
            }
            keywords={keywords}
            className={cx('queryInput', { mobileQueryInput: isMobile })}
            focusedClass={cx({ mRight10: !isMobileSearchFocus })}
            onOk={value => {
              this.setState({ keywords: value, pageIndex: 1 });
            }}
            onClear={() => {
              this.setState({ keywords: '', pageIndex: 1, isMobileSearchFocus: false });
            }}
            onFocus={() => this.setState({ isMobileSearchFocus: isMobile })}
            onBlur={() => this.setState({ isMobileSearchFocus: false })}
          />
        )}
        {!isMobileSearchFocus &&
          showExport &&
          allowExport &&
          recordId &&
          from !== FROM.DRAFT &&
          !control.isCustomButtonFillRecord &&
          !_.get(window, 'shareState.shareId') &&
          (!isMobile ? true : disabled) && (
            <ExportSheetButton
              exportSheet={cb => {
                if (!filterEmptyChildTableRows(tableRows).filter(r => !/^temp-/.test(r.rowid)).length) {
                  cb();
                  alert(_l('数据为空，暂不支持导出！'), 3);
                  return;
                }
                return exportSheet({
                  worksheetId: this.props.masterData.worksheetId,
                  rowId: recordId,
                  controlId: control.controlId,
                  fileName:
                    `${((_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText || '').slice(
                      0,
                      200,
                    )}_${control.controlName}_${moment().format('YYYYMMDDHHmmss')}`.trim() + '.xlsx',
                  onDownload: cb,
                });
              }}
            />
          )}
        {!isMobileSearchFocus && recordId && !valueChanged && (
          <span
            className="mLeft6 Hand"
            data-tip={_l('刷新')}
            style={{ height: 28 }}
            onClick={() => {
              this.refresh();
            }}
          >
            <IconBtn>
              <i className="icon icon-task-later" />
            </IconBtn>
          </span>
        )}
        {mode !== 'dialog' && from !== FROM.DRAFT && recordId && !isMobile && (
          <span
            className="mLeft6"
            data-tip={_l('全屏')}
            onClick={() =>
              openChildTable({
                ...this.props,
                valueChanged,
                allowEdit: !disabled,
                worksheetId: this.props.masterData.worksheetId,
                title:
                  (_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText ||
                  _.get(this, 'props.masterData.formData')
                    ? getTitleTextFromControls(_.get(this, 'props.masterData.formData'))
                    : '',
              })
            }
          >
            <IconBtn className="Hand ThemeHoverColor3">
              <i className="icon icon-worksheet_enlarge" />
            </IconBtn>
          </span>
        )}
      </Fragment>
    );
    return (
      <ChildTableContext.Provider value={{ rows }}>
        <div className="childTableCon" ref={con => (this.childTableCon = con)}>
          {!_.isEmpty(cellErrors) && (
            <span className="errorTip ellipsis" style={isMobile ? { top: -31 } : {}}>
              {' '}
              {_l('请正确填写%0', control.controlName)}{' '}
            </span>
          )}
          {isBatchEditing && !!selectedRowIds.length && (
            <div className="selectedTip">{_l('已选择%0条记录', selectedRowIds.length)}</div>
          )}

          {isMobile ? (
            ''
          ) : (
            <div className="operate">
              {!isBatchEditing ? (
                <Fragment>
                  {!isMobile && !disabledNew && addRowFromRelateRecords && (
                    <span
                      className={cx('addRowByDialog', { disabled: isExceed || disabledNew })}
                      onClick={
                        isExceed || disabledNew ? () => {} : () => this.handleAddRowsFromRelateRecord(batchAddControls)
                      }
                    >
                      <i className="icon icon-done_all mRight5 Font16"></i>
                      <span className="content ellipsis" style={{ maxWidth: 200 }}>
                        {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                      </span>
                    </span>
                  )}
                  {!isMobile && !disabledNew && allowAddByLine && (
                    <span
                      className={cx('addRowByLine', { disabled: isExceed || disabledNew })}
                      onClick={isExceed || disabledNew ? () => {} : this.handleAddRowByLine}
                    >
                      <i className="icon icon-plus mRight5 Font16"></i>
                      {_l('添加一行')}
                    </span>
                  )}
                  {showImport && (
                    <span
                      className={cx('importFromFile tip-top', { disabled: isExceed })}
                      onClick={isExceed ? () => {} : this.handleImport}
                      data-tip={_l('导入数据')}
                    >
                      <i className="icon icon-knowledge-upload Font16 Gray_75"></i>
                    </span>
                  )}
                  {showImport && showBatchEdit && <div className="splitter"></div>}
                  {showBatchEdit && (allowBatchDelete || (allowadd && allowCopy)) && (
                    <span className="addRowByLine" onClick={() => this.setState({ isBatchEditing: true })}>
                      {_l('批量操作')}
                    </span>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  <span
                    className="operateButton exitBatch"
                    onClick={() => this.setState({ isBatchEditing: false, selectedRowIds: [] })}
                    style={{ paddingLeft: 10 }}
                  >
                    <i className="icon icon-close Gray_9e Font18 mRight5"></i>
                    {_l('退出')}
                  </span>
                  {allowBatchDelete && (
                    <span
                      className={cx('operateButton', { disabled: !selectedRowIds.length })}
                      onClick={() => {
                        if (selectedRowIds.length) {
                          deleteRows(allowcancel ? selectedRowIds : selectedRowIds.filter(rid => /^temp/.test(rid)));
                          this.setState({
                            selectedRowIds: [],
                            isBatchEditing: selectedRowIds.length === tableRows.length,
                          });
                        }
                      }}
                    >
                      {_l('删除')}
                    </span>
                  )}
                  {allowadd && allowCopy && (
                    <span
                      className={cx('operateButton', {
                        disabled:
                          !selectedRowIds.length ||
                          filterEmptyChildTableRows(originRows).length >= maxCount ||
                          isTreeTableView,
                      })}
                      onClick={() => {
                        if (
                          !selectedRowIds.length ||
                          filterEmptyChildTableRows(originRows).length >= maxCount ||
                          isTreeTableView
                        ) {
                          return;
                        }
                        if (filterEmptyChildTableRows(tableRows).length + selectedRowIds.length > maxCount) {
                          alert(_l('复制失败，最多输入%0条记录', maxCount), 2);
                          return;
                        }
                        if (selectedRowIds.length) {
                          this.copyRows(
                            selectedRowIds
                              .map(rowId => _.find(tableRows, { rowid: rowId }))
                              .filter(_.identity)
                              .slice(0, maxCount - tableRows.length),
                          );
                          this.setState({ selectedRowIds: [] });
                        }
                      }}
                    >
                      {_l('复制')}
                    </span>
                  )}
                </Fragment>
              )}
              <div className="flex"></div>
              {keywords && <SearchResultNum>{_l('共 %0 行', tableRows.length)}</SearchResultNum>}
              <div className="mTop5 flexRow alignItemsCenter">{operateComp}</div>
              {showAsPages && tableRows.length > pageSize && (
                <Pagination
                  allowChangePageSize={false}
                  className="pagination"
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  allCount={tableRows.length}
                  changePageIndex={value => {
                    this.setState({
                      pageIndex: value,
                    });
                  }}
                  onPrev={() => {
                    this.setState({
                      pageIndex: pageIndex - 1 < 0 ? 0 : pageIndex - 1,
                    });
                  }}
                  onNext={() => {
                    this.setState({
                      pageIndex:
                        pageIndex + 1 > Math.ceil(tableRows.length / pageSize)
                          ? Math.ceil(tableRows.length / pageSize)
                          : pageIndex + 1,
                    });
                  }}
                />
              )}
            </div>
          )}
          {!isMobile && !loading && (
            <div className="Relative" style={{ height: tableFooter ? tableHeight + tableFooter.height : tableHeight }}>
              <WorksheetTable
                isTreeTableView={isTreeTableView}
                treeLayerControlId={treeLayerControlId}
                treeTableViewData={treeTableViewData}
                expandCellAppendWidth={this.expandCellAppendWidth}
                from={from}
                tableType="classic"
                isSubList
                showAsZebra={false}
                wrapControlName={titleWrap}
                rules={rules}
                allowAdd={allowadd}
                height={tableHeight}
                fromModule={WORKSHEETTABLE_FROM_MODULE.SUBLIST}
                viewId={viewId}
                scrollBarHoverShow
                ref={this.worksheettable}
                setHeightAsRowCount={fullShowTable}
                forceScrollOffset={fullShowTable && { height: true }}
                clickEnterEditing
                cellErrors={cellErrors}
                clearCellError={this.handleClearCellError}
                cellUniqueValidate={this.handleUniqueValidate}
                fixedColumnCount={frozenIndex}
                lineEditable={!disabled}
                noRenderEmpty={!keywords}
                keyWords={keywords}
                rowHeight={rowHeight}
                worksheetId={control.dataSource}
                projectId={projectId}
                appId={appId}
                columns={columns}
                controls={controls}
                data={keywords ? filterEmptyChildTableRows(tableData) : tableData}
                sheetColumnWidths={{ ...sheetColumnWidths, ...tempSheetColumnWidths }}
                rowHeadWidth={(() => {
                  if (!allowOpenRecord) {
                    return 44;
                  } else return hidenumber && !allowadd && !allowcancel ? 44 : 75;
                })()}
                sheetSwitchPermit={sheetSwitchPermit}
                masterFormData={() => this.props.masterData.formData}
                masterData={() => this.props.masterData}
                sheetViewHighlightRows={[{}, ...selectedRowIds].reduce((a, b) => ({ ...a, [b]: true }))}
                renderRowHead={args => (
                  <RowHead
                    showNumber={!hidenumber}
                    lineNumberBegin={showAsPages ? (pageIndex - 1) * pageSize : 0}
                    showCheckbox={isBatchEditing && !!tableRows.length}
                    {...args}
                    isSelectAll={selectedRowIds.length === tableRows.length}
                    selectedRowIds={selectedRowIds}
                    row={tableData[args.rowIndex]}
                    allowAdd={allowadd}
                    allowCopy={allowCopy}
                    allowCancel={allowcancel}
                    changeSheetLayoutVisible={
                      control.isCharge && (!_.isEmpty(tempSheetColumnWidths) || frozenIndexChanged)
                    }
                    disabled={disabled}
                    allowOpenRecord={allowOpenRecord}
                    onSelect={(selectedRowId, isAdd = true) => {
                      if (isAdd) {
                        this.setState({ selectedRowIds: _.uniq(selectedRowIds.concat(selectedRowId)) });
                      } else {
                        this.setState({ selectedRowIds: selectedRowIds.filter(rowId => rowId !== selectedRowId) });
                      }
                    }}
                    onSelectAll={selectAll => {
                      if (selectAll) {
                        this.setState({ selectedRowIds: filterEmptyChildTableRows(tableRows).map(row => row.rowid) });
                      } else {
                        this.setState({ selectedRowIds: [] });
                      }
                    }}
                    onOpen={this.openDetail}
                    onDelete={() => deleteRow(args.row.rowid)}
                    onCopy={() => {
                      if (isExceed) {
                        alert(enablelimit ? _l('已超过子表最大行数') : _l('最多输入%0条记录', maxCount), 3);
                        return;
                      }
                      this.copyRow(args.row);
                    }}
                    saveSheetLayout={({ closePopup }) => {
                      const changes = {};
                      if (!_.isEmpty(tempSheetColumnWidths)) {
                        changes.widths = JSON.stringify(
                          columns.map(c => ({ ...sheetColumnWidths, ...tempSheetColumnWidths }[c.controlId] || 160)),
                        );
                      }
                      if (frozenIndexChanged) {
                        changes.freezeids = JSON.stringify([String(frozenIndex)]);
                      }
                      const newControl = {
                        ...control,
                        advancedSetting: {
                          ...control.advancedSetting,
                          ...changes,
                        },
                      };
                      worksheetAjax
                        .editWorksheetControls({
                          worksheetId: this.props.masterData.worksheetId,
                          controls: [
                            { ..._.pick(newControl, ['controlId', 'advancedSetting']), editattrs: ['advancedSetting'] },
                          ],
                        })
                        .then(res => {
                          if (res.data) {
                            closePopup();
                            this.setState({
                              frozenIndexChanged: false,
                              tempSheetColumnWidths: {},
                              sheetColumnWidths: this.getSheetColumnWidths(newControl),
                            });
                            try {
                              if (_.isFunction(_.get(this, 'context.updateWorksheetControls'))) {
                                const updateFn = _.get(this, 'context.updateWorksheetControls');
                                let newResponseControl = res.data.controls.filter(
                                  c => c.controlId === control.controlId,
                                )[0];
                                if (newResponseControl) {
                                  newResponseControl = {
                                    ...newResponseControl,
                                    relationControls: control.relationControls,
                                  };
                                  updateFn([newResponseControl]);
                                }
                              }
                            } catch (err) {
                              console.log(err);
                            }
                          }
                        });
                    }}
                    resetSheetLayout={() => {
                      this.setState({ tempSheetColumnWidths: {}, frozenIndexChanged: false });
                    }}
                  />
                )}
                renderColumnHead={({ ...rest }) => {
                  const { control, columnIndex } = rest;
                  return (
                    <ColumnHead
                      disableSort={isTreeTableView}
                      showDropdown={columnIndex <= 3}
                      showRequired={!disabled}
                      isAsc={
                        sortedControl && sortedControl.controlId === control.controlId ? sortedControl.isAsc : undefined
                      }
                      changeSort={sortType => {
                        sortRows({ control, isAsc: sortType });
                        this.setState({
                          sortedControl: _.isUndefined(sortType)
                            ? undefined
                            : {
                                controlId: control.controlId,
                                isAsc: sortType,
                              },
                        });
                      }}
                      renderPopup={({ closeMenu }) => (
                        <Menu
                          className="worksheetColumnHeadMenu"
                          style={{ width: 180 }}
                          // specialFilter={target => target === this.head}
                          onClickAway={closeMenu}
                        >
                          <MenuItem
                            onClick={() => {
                              if (window.isPublicApp) {
                                alert(_l('预览模式下，不能操作'), 3);
                                return;
                              }
                              console.log(columnIndex);
                              const isFrozen = frozenIndex === columnIndex;
                              this.setState({
                                frozenIndex: isFrozen ? 0 : columnIndex,
                                frozenIndexChanged: true,
                              });
                              closeMenu();
                            }}
                          >
                            {frozenIndex === columnIndex && (
                              <Fragment>
                                <i className="icon icon-task-new-locked font16 mRight6"></i>
                                {_l('解冻')}
                              </Fragment>
                            )}
                            {frozenIndex !== columnIndex && (
                              <Fragment>
                                <i className="icon icon-task-new-no-locked font16 mRight6"></i>
                                {_l('冻结')}
                              </Fragment>
                            )}
                          </MenuItem>
                        </Menu>
                      )}
                      {...rest}
                    />
                  );
                }}
                updateCell={this.handleUpdateCell}
                onColumnWidthChange={(controlId, value) => {
                  this.setState({
                    tempSheetColumnWidths: { ...tempSheetColumnWidths, [controlId]: value },
                  });
                }}
                addNewRow={this.handleAddRowByLine}
                onFocusCell={(row, cellIndex) => {
                  if (disabledNew || isExceed) {
                    return;
                  }
                  const isEmptyRow = row.rowid.startsWith('empty');
                  if (isEmptyRow) {
                    updateRow({ rowid: row.rowid, value: this.newRow({}, { isCreate: true }) });
                    setTimeout(() => {
                      const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
                        '.cell.cell-' + cellIndex,
                      );
                      if (activeCell) {
                        activeCell.click();
                      }
                    }, 100);
                    return;
                  }
                }}
                onUpdateRules={newRules => {
                  updateBase({ worksheetInfo: { ...this.worksheetInfo, rules: newRules } });
                }}
                tableFooter={tableFooter}
                actions={{
                  updateTreeNodeExpansion,
                  handleAddNewRecord: (parentRow, { addParentControl } = {}) => {
                    this.updateDefsourceOfControl();
                    const row = this.newRow(
                      {
                        [addParentControl.controlId]: JSON.stringify([
                          {
                            sid: parentRow.rowid,
                            sourcevalue: JSON.stringify(parentRow),
                            type: 8,
                          },
                        ]),
                        pid: parentRow.rowid,
                      },
                      {
                        isCreate: true,
                      },
                    );
                    addRow(row, parentRow.rowid);
                    updateTreeNodeExpansion(parentRow, {
                      forceUpdate: true,
                      getNewRows: () => Promise.resolve([row]),
                      updateRows: ([recordId], changes) => {
                        updateRow({ rowid: recordId, value: changes }, { noRealUpdate: true });
                      },
                    });
                    function getUpRowId() {
                      const childrenRows = filter(tableData, r => r.pid === parentRow.rowid);
                      if (childrenRows.length) {
                        return last(childrenRows).rowid;
                      } else {
                        return parentRow.rowid;
                      }
                    }
                    const upRowId = getUpRowId();
                    const upRowIndex = upRowId && findIndex(tableData, { rowid: upRowId });
                    const scrollY = this.worksheettable.current.table.refs.dom.current.querySelector('.scroll-y');
                    if (scrollY) {
                      const newRowBottomToTop = (upRowIndex + 2) * rowHeight;
                      const conHeight = scrollY.clientHeight;
                      const conScrollTop = scrollY.scrollTop;
                      const newRowVisible = newRowBottomToTop - conScrollTop < conHeight;
                      console.table({ newRowBottomToTop, conHeight, conScrollTop, newRowVisible });
                      if (!newRowVisible) {
                        setTimeout(() => {
                          this.worksheettable.current.table.refs.setScroll(0, newRowBottomToTop + 10 - conHeight);
                        }, 100);
                      }
                    }
                    setTimeout(() => {
                      const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
                        '.cell.row-id-' + row.rowid + '.canedit',
                      );
                      if (activeCell) {
                        activeCell.click();
                      }
                    }, 200);
                  },
                }}
                onColumnHeadHeightUpdate={newColumnHeadWidth => {
                  this.setState({ headHeight: newColumnHeadWidth });
                }}
              />
            </div>
          )}
          {isMobile && !loading && (
            <MobileTable
              sheetSwitchPermit={sheetSwitchPermit}
              allowcancel={allowcancel}
              allowadd={allowadd}
              disabled={disabled}
              rows={tableRows}
              controls={columns}
              onOpen={this.openDetail}
              isEdit={mobileIsEdit}
              onDelete={deleteRow}
              showNumber={!hidenumber}
              h5showtype={h5showtype}
              h5abstractids={h5abstractids}
              appId={appId}
              worksheetId={control.dataSource}
              cellErrors={cellErrors}
            />
          )}
          {loading &&
            (error ? (
              <div className="center Gray_9e">{error}</div>
            ) : (
              <div style={{ padding: 10 }}>
                <Skeleton
                  style={{ flex: 1 }}
                  direction="column"
                  widths={['30%', '40%', '90%', '60%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              </div>
            ))}

          {isMobile && (
            <div className="operate valignWrapper">
              {isMobile && !disabledNew && !isExceed && addRowFromRelateRecords && (
                <span
                  className="addRowByDialog h5 ellipsis mRight10"
                  onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
                >
                  <i className="icon icon-done_all mRight5 Font16"></i>
                  <span className="content ellipsis" style={{ maxWidth: 200 }}>
                    {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
                  </span>
                </span>
              )}
              {isMobile && mobileIsEdit && !disabledNew && !isExceed && allowAddByLine && (
                <span
                  className="addRowByLine h5"
                  onClick={() => {
                    this.handleAddRowByLine();
                    this.setState({
                      previewRowIndex: isMobile && keywords ? originRows.length : tableRows.length,
                      recordVisible: true,
                    });
                  }}
                >
                  <i className="icon icon-plus mRight5 Font16"></i>
                  {_l('添加')}
                </span>
              )}
              <div
                className={cx('operates', { isMobile })}
                style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}
              >
                {operateComp}
              </div>
            </div>
          )}
          {recordVisible && (
            <RowDetailComponent
              isEditCurrentRow={isEditCurrentRow}
              masterData={masterData}
              isWorkflow
              ignoreLock={/^(temp|default|empty)/.test((tableData[previewRowIndex] || {}).rowid)}
              visible
              aglinBottom={!!recordId}
              from={from}
              worksheetId={control.dataSource}
              projectId={projectId}
              appId={appId}
              searchConfig={searchConfig}
              sheetSwitchPermit={sheetSwitchPermit}
              controlName={control.controlName}
              title={
                previewRowIndex > -1 ? (
                  isMobile ? (
                    <Fragment>
                      <div className="ellipsis">{control.controlName}</div>
                      <div>#{previewRowIndex + 1}</div>
                    </Fragment>
                  ) : (
                    `${control.controlName}#${previewRowIndex + 1}`
                  )
                ) : (
                  _l('创建%0', control.controlName)
                )
              }
              disabled={disabled || (!/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) && !allowedit)}
              isExceed={isExceed}
              mobileIsEdit={mobileIsEdit}
              allowDelete={/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) || allowcancel}
              controls={controls}
              data={previewRowIndex > -1 ? tableData[previewRowIndex] || {} : this.newRow()}
              switchDisabled={{
                prev: previewRowIndex === 0,
                next:
                  previewRowIndex === filterEmptyChildTableRows(tableData.filter(r => !r.isSubListFooter)).length - 1,
              }}
              getMasterFormData={() => this.props.masterData.formData}
              handleUniqueValidate={this.handleUniqueValidate}
              onSwitch={this.handleSwitch}
              onSave={this.handleRowDetailSave}
              onDelete={deleteRow}
              onClose={() => this.setState({ recordVisible: false, isEditCurrentRow: false })}
              rules={rules}
              openNextRecord={() => {
                this.handleAddRowByLine();
                this.setState({
                  previewRowIndex: isMobile && keywords ? originRows.length : tableRows.length,
                  recordVisible: true,
                });
              }}
            />
          )}
        </div>
      </ChildTableContext.Provider>
    );
  }
}

const mapStateToProps = (state, props) => ({
  baseLoading: state.baseLoading,
  base: state.base,
  treeTableViewData: state.treeTableViewData,
  rows: state.rows,
  lastAction: state.lastAction,
  cellErrors: state.cellErrors,
});

const mapDispatchToProps = dispatch => ({
  loadRows: bindActionCreators(actions.loadRows, dispatch),
  setOriginRows: bindActionCreators(actions.setOriginRows, dispatch),
  resetRows: bindActionCreators(actions.resetRows, dispatch),
  initRows: bindActionCreators(actions.initRows, dispatch),
  addRow: bindActionCreators(actions.addRow, dispatch),
  addRows: bindActionCreators(actions.addRows, dispatch),
  updateRow: bindActionCreators(actions.updateRow, dispatch),
  deleteRow: bindActionCreators(actions.deleteRow, dispatch),
  deleteRows: bindActionCreators(actions.deleteRows, dispatch),
  sortRows: bindActionCreators(actions.sortRows, dispatch),
  clearAndSetRows: bindActionCreators(actions.clearAndSetRows, dispatch),
  exportSheet: bindActionCreators(actions.exportSheet, dispatch),
  updateCellErrors: bindActionCreators(actions.updateCellErrors, dispatch),
  updateBase: bindActionCreators(actions.updateBase, dispatch),
  updateTreeNodeExpansion: bindActionCreators(actions.updateTreeNodeExpansion, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
