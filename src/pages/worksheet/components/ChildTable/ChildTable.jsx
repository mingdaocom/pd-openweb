import React, { Fragment, useState } from 'react';
import PropTypes, { func } from 'prop-types';
import { autobind } from 'core-decorators';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import moment from 'moment';
import cx from 'classnames';
import { browserIsMobile, createElementFromHtml } from 'src/util';
import { SimplePagination } from 'ming-ui';
import { CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES, ROW_HEIGHT } from 'worksheet/constants/enum';
import SearchInput from 'worksheet/components/SearchInput';
import worksheetAjax from 'src/api/worksheet';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { Skeleton } from 'ming-ui';
import { selectRecord } from 'src/components/recordCardListDialog';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import { controlState, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
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
import _ from 'lodash';
import addRecord from 'worksheet/common/newRecord/addRecord';

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

// const StyledWorksheetTable = styled(WorksheetTable)`
//   border: none !important;
//   .row-head {
//     border-top: 1px solid #f1f1f1 !important;
//   }
//   .col-0 {
//     border-left: 1px solid #f1f1f1 !important;
//   }
// `;

const isMobile = browserIsMobile();
const systemControls = SYSTEM_CONTROLS.map(c => ({ ...c, fieldPermission: '111' }));

function ExportButton(props) {
  const { exportSheet = () => {} } = props;
  const [loading, setLoading] = useState(false);
  return (
    <span
      data-tip={_l('导出Excel')}
      onClick={() => {
        if (loading) {
          return;
        }
        setLoading(true);
        exportSheet(() => setLoading(false));
      }}
    >
      {loading ? (
        <i
          className="icon icon-loading_button ThemeColor3"
          style={{
            fontSize: 16,
            margin: 5,
            display: 'inline-block',
            animation: 'rotate 0.6s infinite linear',
          }}
        ></i>
      ) : (
        <IconBtn className="Hand ThemeHoverColor3">
          <i className="icon icon-file_download" />
        </IconBtn>
      )}
    </span>
  );
}

ExportButton.propTypes = {
  exportSheet: func,
};

const MAX_COUNT = 1000;

class ChildTable extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    mode: PropTypes.string,
    entityName: PropTypes.string,
    recordId: PropTypes.string,
    projectId: PropTypes.string,
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
      cellErrors: {},
      loading: !!props.recordId && !props.initSource,
      selectedRowIds: [],
      pageIndex: 1,
      keywords: '',
      pageSize: this.settings.rownum,
    };
    this.state.sheetColumnWidths = this.getSheetColumnWidths();
    this.controls = props.controls;
    props.registerCell(this);
  }

  componentDidMount() {
    const { mode, rows, control, recordId, needResetControls, initRowIsCreate = true, initRows } = this.props;
    let { max = 200 } = parseAdvancedSetting(control.advancedSetting);
    this.updateDefsourceOfControl();
    if (recordId) {
      if (
        !rows.length &&
        _.isObject(control.value) &&
        control.value.action === 'clearAndSet' &&
        _.get(control, 'value.rows.length')
      ) {
        this.handleClearAndSetRows(
          control.value.rows
            .slice(0, max)
            .map(r => this.newRow(r, { isDefaultValue: true, isQueryWorksheetFill: true })),
        );
        this.setState({ loading: false });
      } else if (
        !rows.length &&
        _.isObject(control.value) &&
        (!_.isEmpty(_.get(control, 'value.updated')) || !_.isEmpty(_.get(control, 'value.deleted')))
      ) {
        initRows(control.value.rows);
        this.setState({ loading: false });
      } else {
        this.loadRows(undefined, { needResetControls });
      }
    } else if (control.value) {
      try {
        const defaultRows =
          _.isObject(control.value) && _.isObject(control.value.rows) ? control.value.rows : JSON.parse(control.value);
        if (_.isArray(defaultRows)) {
          this.handleClearAndSetRows(
            defaultRows.slice(0, max).map(r =>
              this.newRow(r, {
                isDefaultValue: true,
                isCreate: _.isUndefined(r.initRowIsCreate) ? initRowIsCreate : r.initRowIsCreate,
                isQueryWorksheetFill: true,
              }),
            ),
          );
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      initRows([]);
    }
    if (mode !== 'dialog' && _.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, this.refresh);
    }
    this.rowsCache = {};
    $(this.childTableCon).on('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).on('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    let { max = 200 } = parseAdvancedSetting(this.props.control.advancedSetting);
    if (nextProps.refreshFlag && nextProps.refreshFlag !== this.props.refreshFlag) {
      this.refresh();
    }
    const { initRows, resetRows, addRows, clearAndSetRows } = this.props;
    this.updateDefsourceOfControl(nextProps);
    const control = this.props.control;
    const nextControl = nextProps.control;
    const isAddRecord = !nextProps.recordId;
    const valueChanged = !_.isEqual(control.value, nextControl.value);
    if (nextProps.recordId !== this.props.recordId) {
      this.refresh(nextProps, { needResetControls: false });
    } else if (isAddRecord && valueChanged && typeof nextControl.value === 'undefined') {
      initRows([]);
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'reset') {
      resetRows();
      this.setState({
        pageIndex: 1,
        selectedRowIds: [],
      });
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'clearAndSet') {
      this.handleClearAndSetRows(
        nextControl.value.rows.slice(0, max).map(row =>
          this.newRow(row, {
            isCreate: true,
            isDefaultValue: nextControl.value.isDefault,
            isQueryWorksheetFill: true,
          }),
        ),
      );
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'append') {
      addRows(nextControl.value.rows.map(this.newRow), {
        updated: _.get(control, 'value.updated') || [],
        deleted: _.get(control, 'value.deleted') || [],
      });
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
      this.setState({ controls: this.getControls(nextProps) });
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
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state, nextState)) {
      return true;
    }
    return (
      !_.isEqual(this.props.rows, nextProps.rows) ||
      !_.isEqual(this.props.mobileIsEdit, nextProps.mobileIsEdit) ||
      !_.isEqual(this.props.control.relationControls, nextProps.control.relationControls) ||
      !_.isEqual(this.props.control.fieldPermission, nextProps.control.fieldPermission)
    );
  }

  componentDidUpdate() {
    this.rowsCache = {};
  }

  componentWillUnmount() {
    const { mode, control } = this.props;
    if (mode !== 'dialog' && _.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, undefined);
    }
    $(this.childTableCon).off('mouseenter', '.cell:not(.row-head)', this.handleMouseEnter);
    $(this.childTableCon).off('mouseleave', '.cell:not(.row-head)', this.handleMouseLeave);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  worksheettable = React.createRef();

  get settings() {
    const { control = {} } = this.props;
    let { min, max, rownum, enablelimit } = parseAdvancedSetting(control.advancedSetting);
    let minCount;
    let maxCount = MAX_COUNT;
    if (enablelimit) {
      minCount = min;
      maxCount = max;
    }
    return { minCount, maxCount, rownum };
  }

  getControls(props, { newControls } = {}) {
    const {
      isWorkflow,
      control: { showControls = [], advancedSetting = {}, relationControls = [] },
      masterData,
      controls,
    } = props || this.props;
    let controlssorts = [];
    try {
      controlssorts = JSON.parse(advancedSetting.controlssorts);
    } catch (err) {}
    let result = sortControlByIds(newControls || controls, _.isEmpty(controlssorts) ? showControls : controlssorts).map(
      c => {
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
        if (control.controlId === 'ownerid') {
          control.controlPermissions = '100';
        }
        return control;
      },
    );
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

  getControl(controlId) {
    return _.find(this.state.controls, { controlId });
  }

  @autobind
  handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'Enter' && this.childTableCon.querySelector('.cell.focus')) {
      e.preventDefault();
      e.stopPropagation();
      this.handleAddRowByLine();
    }
  }

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
    this.setState({
      controls: controls.map(control => {
        if (control.type === 29 && control.sourceControlId === controlId) {
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
    const { control, recordId, masterData, loadRows, from } = nextProps || this.props;
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
      callback: res => {
        const state = { loading: false };
        if (needResetControls) {
          const newControls = (_.get(res, 'worksheet.template.controls') || _.get(res, 'template.controls')).concat(
            systemControls,
          );
          if (newControls && newControls.length) {
            state.controls = this.getControls(nextProps, { newControls });
          }
        }
        this.setState(state);
      },
    });
  }

  @autobind
  refresh(nextProps, { needResetControls = true } = {}) {
    this.setState({ loading: true, sortedControl: undefined, isBatchEditing: false, selectedRowIds: [], pageIndex: 1 });
    this.loadRows(nextProps, { needResetControls });
  }

  getShowColumns() {
    const { control } = this.props;
    const { controls } = this.state;
    const hiddenTypes = window.isPublicWorksheet ? [48] : [];
    return !controls.length
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

  @autobind
  newRow(defaultRow, { isDefaultValue, isCreate, isQueryWorksheetFill } = {}) {
    const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
    const row = this.rowUpdate({ row: defaultRow, rowId: tempRowId }, { isCreate, isQueryWorksheetFill });
    return { ...row, rowid: tempRowId, allowedit: true, addTime: new Date().getTime() };
  }

  copyRow(row) {
    const { addRow } = this.props;
    addRow(
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: `temp-${uuidv4()}`,
        allowedit: true,
        isCopy: true,
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
        addTime: new Date().getTime(),
      }),
    );
    addRows(newRows);
  }

  rowUpdate({ row, controlId, value, rowId } = {}, { isCreate = false, isQueryWorksheetFill = false } = {}) {
    const { masterData, projectId, recordId, searchConfig, rules = [] } = this.props;
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
          updateSuccessCb: needUpdateRow => {
            this.updateSheetRow(needUpdateRow);
          },
        },
      );
    };
    const formdata = new DataFormat({
      data: this.state.controls.map(c => {
        let controlValue = (row || {})[c.controlId];
        if (_.isUndefined(controlValue) && (isCreate || !row)) {
          controlValue = c.value;
        }
        return {
          ...c,
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
      masterRecordRowId: recordId,
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

  updateSheetRow(row) {
    if (isMobile) {
      this.handleRowDetailSave(row);
    } else if (_.isFunction(_.get(this, 'worksheettable.current.table.updateSheetRow'))) {
      this.worksheettable.current.table.updateSheetRow({
        ...row,
        allowedit: true,
        allowedelete: true,
      });
    }
  }

  @autobind
  handleAddRowByLine() {
    const { from, control, addRow, rows } = this.props;
    const maxCount = this.settings.maxCount;
    const maxShowRowCount = this.settings.rownum;
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    let { allowadd } = parseAdvancedSetting(control.advancedSetting);
    const disabledNew = filterEmptyChildTableRows(rows).length >= maxCount || disabled || !allowadd;
    if (disabledNew) {
      return;
    }
    this.updateDefsourceOfControl();
    const row = this.newRow();
    addRow(row);
    setTimeout(() => {
      try {
        this.worksheettable.current.table.refs.setScroll(0, rows.length + 1 > maxShowRowCount ? 100000 : 0);
        setTimeout(() => {
          const activeCell = this.worksheettable.current.table.refs.dom.current.querySelector(
            '.cell.row-' + filterEmptyChildTableRows(rows).length + '.canedit',
          );
          if (activeCell) {
            activeCell.click();
          }
        }, 100);
      } catch (err) {}
    }, 100);
  }

  @autobind
  handleImport() {
    const { projectId, control, masterData, rows, addRows } = this.props;
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
      onAddRows: data => {
        addRows(
          data
            .slice(0, this.settings.maxCount - filterEmptyChildTableRows(rows).length)
            .map(updatedValues => this.newRow(updatedValues, { isCreate: true })),
        );
      },
    });
  }

  @autobind
  handleAddRowsFromRelateRecord(batchAddControls) {
    const { addRows, entityName, control, rows } = this.props;
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
      },
    });
  }

  @autobind
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
    newRow.isEdited = true;
    function update() {
      this.rowsCache[row.rowid] = { ...(this.rowsCache[row.rowid] || {}), [cell.controlId]: cell.value };
      if (_.isFunction(options.updateSuccessCb)) {
        options.updateSuccessCb(newRow);
      }
      updateRow({ rowid: row.rowid, value: newRow });
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
      const newControl = { ...control, options: _.uniqBy([...control.options, newOption], 'key') };
      this.setState(
        {
          controls: controls.map(c => (c.controlId === control.controlId ? newControl : c)),
        },
        update,
      );
      return;
    }
    update.apply(this);
  }

  @autobind
  handleRowDetailSave(row, updatedControlIds) {
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
  }

  @autobind
  handleSwitch({ prev, next }) {
    const { previewRowIndex } = this.state;
    let newRowIndex;
    if (prev) {
      newRowIndex = previewRowIndex - 1;
    } else {
      newRowIndex = previewRowIndex + 1;
    }
    this.openDetail(newRowIndex);
  }

  @autobind
  openDetail(index) {
    const { control, rows = [] } = this.props;
    const { rowid } = rows[index] || {};
    this.setState({
      previewRowIndex: index,
      recordVisible: true,
    });
  }

  @autobind
  handleClearCellError(key) {
    this.setState({
      error: false,
      cellErrors: _.omit(this.state.cellErrors, [key]),
    });
  }

  @autobind
  handleUniqueValidate(controlId, value, rowId) {
    const { rows } = this.props;
    return !_.find(rowId ? rows.filter(row => row.rowid !== rowId) : rows, row => row[controlId] === value);
  }

  @autobind
  handleMouseEnter(e) {
    const cell = $(e.target).closest('.cell')[0];
    if (!cell) {
      return;
    }
    $(cell).addClass('errorActive');
    const { rows } = this.props;
    const { cellErrors } = this.state;
    const columns = this.getShowColumns();
    const hasError = /cellControlErrorStatus/.test(cell.className);
    const cellIsEditing = /iseditting/.test(cell.className);
    const rowIndex = Number(cell.className.match(/ row-([0-9]+) /)[1]);
    const columnIndex = Number(cell.className.match(/ col-([0-9]+) /)[1]);
    const rowId = (rows[rowIndex] || {}).rowid;
    const controlId = (columns[columnIndex - 1] || {}).controlId;
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
              zIndex: 2;
              color: #fff";
          >
            ${error}
          </div>`);
        cell.parentElement.appendChild(errorEle);
        const top =
          cell.offsetTop +
          (/row-0/.test(cell.getAttribute('class')) ? cell.offsetHeight - 1 : -1 * errorEle.offsetHeight);
        const left = cell.offsetLeft;
        errorEle.style.top = top + 'px';
        errorEle.style.left = left + 'px';
      }
    }
  }
  @autobind
  handleMouseLeave() {
    $('.mdTableErrorTip').remove();
    $('.cell').removeClass('errorActive');
  }

  render() {
    const {
      isWorkflow,
      mode,
      maxHeight,
      from,
      recordId,
      projectId,
      viewId,
      control,
      rows,
      deleteRow,
      deleteRows,
      sortRows,
      addRow,
      updateRow,
      exportSheet,
      mobileIsEdit,
      entityName,
      rules,
      appId,
      searchConfig,
      sheetSwitchPermit,
      showSearch,
      showExport,
    } = this.props;
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
    } = parseAdvancedSetting(control.advancedSetting);
    const maxCount = enablelimit ? max : MAX_COUNT;
    const maxShowRowCount = this.props.maxShowRowCount || rownum;
    const rowHeight = ROW_HEIGHT[rowheight] || 34;
    const showAsPages = showtype === '2';
    const {
      loading,
      tempSheetColumnWidths,
      previewRowIndex,
      sheetColumnWidths,
      sortedControl,
      cellErrors,
      recordVisible,
      controls,
      isBatchEditing,
      selectedRowIds,
      pageSize,
      pageIndex,
      keywords,
    } = this.state;
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
        return { ...row, allowedit };
      }
    });
    const originRows = tableRows;
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const isExceed = filterEmptyChildTableRows(originRows).length >= maxCount;
    const disabledNew = noColumns || disabled || !allowadd;
    const allowBatch = !_.includes([FROM.DEFAULT], from);
    const allowBatchDelete = allowcancel || (allowadd && !!originRows.filter(r => /^temp/.test(r.rowid)).length);
    const allowImport =
      !_.get(window, 'shareState.shareId') && !window.isPublicWorksheet && !_.includes([FROM.DEFAULT], from);
    const showBatchEdit =
      !isMobile &&
      !disabled &&
      allowBatch &&
      (allowadd || allowcancel) &&
      !!filterEmptyChildTableRows(tableRows).length;
    const showImport = !isMobile && allowImport && !disabledNew && allowAddByLine;
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
    const fullShowTable = tableData.length <= maxShowRowCount;
    let tableHeight = (fullShowTable ? tableData.length || 1 : maxShowRowCount) * rowHeight + 34;
    if (maxHeight && tableHeight > maxHeight) {
      tableHeight = maxHeight;
    }
    if (tableData.length === 1) {
      tableData = tableData.concat({ isSubListFooter: true });
      tableHeight += 26;
    }
    return (
      <div className="childTableCon" ref={con => (this.childTableCon = con)} onClick={e => e.stopPropagation()}>
        {this.state.error && <span className="errorTip"> {_l('请正确填写%0', control.controlName)} </span>}
        <div
          className="operates"
          style={isMobile ? { width: '100%', display: 'flex', justifyContent: 'flex-end' } : {}}
        >
          {showSearch && (
            <SearchInput
              style={{ marginTop: -6 }}
              searchIcon={
                <IconBtn className="Hand ThemeHoverColor3">
                  <i className="icon icon-search inherit" />
                </IconBtn>
              }
              keywords={keywords}
              className={cx('queryInput worksheetQueryInput', { mobileQueryInput: isMobile })}
              focusedClass="mRight10"
              onOk={value => {
                this.setState({ keywords: value, pageIndex: 1 });
              }}
              onClear={() => {
                this.setState({ keywords: '', pageIndex: 1 });
              }}
            />
          )}
          {showExport &&
            allowExport &&
            recordId &&
            from !== FROM.DRAFT &&
            !control.isCustomButtonFillRecord &&
            !_.get(window, 'shareState.shareId') &&
            (!isMobile ? true : disabled) && (
              <ExportButton
                exportSheet={cb =>
                  exportSheet({
                    worksheetId: this.props.masterData.worksheetId,
                    rowId: recordId,
                    controlId: control.controlId,
                    fileName:
                      `${((_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText || '').slice(
                        0,
                        200,
                      )} ${control.controlName}${moment().format('YYYYMMDD HHmmss')}`.trim() + '.xlsx',
                    onDownload: cb,
                  })
                }
              />
            )}
          {mode !== 'dialog' && from !== FROM.DRAFT && recordId && !isMobile && (
            <span
              className="mLeft10"
              data-tip={_l('放大')}
              onClick={() =>
                openChildTable({
                  ...this.props,
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
        </div>
        {isBatchEditing && !!selectedRowIds.length && (
          <div className="selectedTip">{_l('已选择%0条记录', selectedRowIds.length)}</div>
        )}
        {!isMobile && !loading && (
          <div style={{ height: tableHeight }}>
            <WorksheetTable
              from={from}
              tableType="classic"
              isSubList
              rules={rules}
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
              fixedColumnCount={0}
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
              rowHeadWidth={hidenumber && !allowadd && !allowcancel ? 44 : 75}
              sheetSwitchPermit={sheetSwitchPermit}
              masterFormData={() => this.props.masterData.formData}
              masterData={() => this.props.masterData}
              getRowsCache={() => this.rowsCache}
              sheetViewHighlightRows={[{}, ...selectedRowIds].reduce((a, b) => ({ ...a, [b]: true }))}
              renderRowHead={args => (
                <RowHead
                  showNumber={!hidenumber}
                  // showNumber={false}
                  lineNumberBegin={showAsPages ? (pageIndex - 1) * pageSize : 0}
                  showCheckbox={isBatchEditing && !!tableRows.length}
                  {...args}
                  isSelectAll={selectedRowIds.length === tableRows.length}
                  selectedRowIds={selectedRowIds}
                  row={tableData[args.rowIndex]}
                  allowAdd={allowadd}
                  allowCancel={allowcancel}
                  changeSheetLayoutVisible={control.isCharge && !_.isEmpty(tempSheetColumnWidths)}
                  disabled={disabled}
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
                    const newWidths = JSON.stringify(
                      columns.map(c => ({ ...sheetColumnWidths, ...tempSheetColumnWidths }[c.controlId] || 160)),
                    );
                    const newControl = {
                      ...control,
                      advancedSetting: {
                        ...control.advancedSetting,
                        widths: newWidths,
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
                            tempSheetColumnWidths: {},
                            sheetColumnWidths: this.getSheetColumnWidths(newControl),
                          });
                          if (_.isFunction(_.get(this, 'context.updateWorksheetControls'))) {
                            _.get(
                              this,
                              'context.updateWorksheetControls',
                            )(res.data.controls.filter(c => c.controlId === control.controlId));
                          }
                        }
                      });
                  }}
                  resetSheetLayout={() => {
                    this.setState({ tempSheetColumnWidths: {} });
                  }}
                />
              )}
              renderColumnHead={({ ...rest }) => {
                const { control } = rest;
                return (
                  <ColumnHead
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
          />
        )}
        {loading && (
          <div style={{ padding: 10 }}>
            <Skeleton
              style={{ flex: 1 }}
              direction="column"
              widths={['30%', '40%', '90%', '60%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
          </div>
        )}
        {isMobile ? (
          <div className="operate valignWrapper">
            {isMobile && !disabledNew && !isExceed && addRowFromRelateRecords && (
              <span
                className="addRowByDialog h5 ellipsis mRight10"
                onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
              >
                <i className="icon icon-done_all mRight5 Font16"></i>
                {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
              </span>
            )}
            {isMobile && mobileIsEdit && !disabledNew && !isExceed && allowAddByLine && (
              <span
                className="addRowByLine h5"
                onClick={() => {
                  this.handleAddRowByLine();
                  this.setState({ previewRowIndex: tableRows.length, recordVisible: true });
                }}
              >
                <i className="icon icon-plus mRight5 Font16"></i>
                {_l('添加')}
              </span>
            )}
          </div>
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
                    {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
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
                {showBatchEdit && (
                  <span className="addRowByLine" onClick={() => this.setState({ isBatchEditing: true })}>
                    {_l('批量操作')}
                  </span>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <span
                  className="operateButton"
                  onClick={() => this.setState({ isBatchEditing: false, selectedRowIds: [] })}
                >
                  {_l('取消批量操作')}
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
                {allowadd && (
                  <span
                    className={cx('operateButton', {
                      disabled: !selectedRowIds.length || filterEmptyChildTableRows(originRows).length >= maxCount,
                    })}
                    onClick={() => {
                      if (!selectedRowIds.length || filterEmptyChildTableRows(originRows).length >= maxCount) {
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
            {showAsPages && tableRows.length > pageSize && (
              <SimplePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                count={tableRows.length}
                onChange={newPageIndex => {
                  this.setState({
                    pageIndex: newPageIndex,
                  });
                }}
              />
            )}
          </div>
        )}
        {recordVisible && (
          <RowDetailComponent
            isWorkflow
            ignoreLock={(tableData[previewRowIndex] || {}).isEdited}
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
              previewRowIndex > -1 ? `${control.controlName}#${previewRowIndex + 1}` : _l('创建%0', control.controlName)
            }
            disabled={disabled || (!/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) && !allowedit)}
            mobileIsEdit={mobileIsEdit}
            allowDelete={/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) || allowcancel}
            controls={controls}
            data={previewRowIndex > -1 ? tableData[previewRowIndex] || {} : this.newRow()}
            switchDisabled={{
              prev: previewRowIndex === 0,
              next: previewRowIndex === filterEmptyChildTableRows(tableData.filter(r => !r.isSubListFooter)).length - 1,
            }}
            getMasterFormData={() => this.props.masterData.formData}
            handleUniqueValidate={this.handleUniqueValidate}
            onSwitch={this.handleSwitch}
            onSave={this.handleRowDetailSave}
            onDelete={deleteRow}
            onClose={() => this.setState({ recordVisible: false })}
            onRulesLoad={rules => {
              this.rules = rules;
            }}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  rows: state.rows,
  lastAction: state.lastAction,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
