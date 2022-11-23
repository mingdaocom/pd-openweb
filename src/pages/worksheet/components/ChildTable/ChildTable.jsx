import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserIsMobile, createElementFromHtml } from 'src/util';
import { editWorksheetControls } from 'src/api/worksheet';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import Skeleton from 'src/router/Application/Skeleton';
import { selectRecord } from 'src/components/recordCardListDialog';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
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
} from 'worksheet/util';
import ColumnHead from '../BaseColumnHead';
import RowHead from './ChildTableRowHead';
import MobileTable from './MobileTable';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import WorksheetTable from '../WorksheetTable';
import RowDetail from './RowDetailModal';
import RowDetailMobile from './RowDetailMobileModal';
import * as actions from './redux/actions';
import _ from 'lodash';

const isMobile = browserIsMobile();
const systemControls = SYSTEM_CONTROLS.map(c => ({ ...c, fieldPermission: '111' }));
class ChildTable extends React.Component {
  static contextType = RecordInfoContext;
  static propTypes = {
    entityName: PropTypes.string,
    maxCount: PropTypes.number,
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
  };

  static defaultProps = {
    maxCount: 200,
    masterData: { formData: [] },
  };

  constructor(props) {
    super(props);
    this.state = {
      controls: this.getControls(props),
      editingControls: {},
      tempSheetColumnWidths: {},
      previewRowIndex: null,
      recordVisible: false,
      cellErrors: {},
      loading: !!props.recordId && !props.initSource,
    };
    this.state.sheetColumnWidths = this.getSheetColumnWidths();
    this.controls = props.controls;
    props.registerCell(this);
  }

  componentDidMount() {
    const { rows, control, recordId, initRowIsCreate = true } = this.props;
    this.updateDefsourceOfControl();
    if (recordId) {
      if (
        !rows.length &&
        _.isObject(control.value) &&
        control.value.action === 'clearAndSet' &&
        _.get(control, 'value.rows.length')
      ) {
        this.handleClearAndSetRows(
          control.value.rows.map(r => this.newRow(r, { isDefaultValue: true, isQueryWorksheetFill: true })),
        );
        this.setState({ loading: false });
      } else {
        this.loadRows();
      }
    } else if (control.value) {
      try {
        const defaultRows =
          _.isObject(control.value) && _.isObject(control.value.rows) ? control.value.rows : JSON.parse(control.value);
        if (_.isArray(defaultRows)) {
          this.handleClearAndSetRows(
            defaultRows.map(r =>
              this.newRow(r, {
                isDefaultValue: true,
                isCreate: _.isUndefined(r.initRowIsCreate) ? initRowIsCreate : r.initRowIsCreate,
              }),
            ),
          );
        }
      } catch (err) {
        console.log(err);
      }
    }
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, this.refresh);
    }
    this.rowsCache = {};
    $(this.childTableCon).on('mouseenter', '.cell .ghostAngle', this.handleMouseEnter);
    $(this.childTableCon).on('mouseleave', '.cell .ghostAngle', this.handleMouseLeave);
  }

  componentWillReceiveProps(nextProps) {
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
      resetRows().then(() => {
        try {
          this.worksheettable.current.table.initControlState();
        } catch (err) {}
      });
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'clearAndSet') {
      this.handleClearAndSetRows(
        nextControl.value.rows.map(row =>
          this.newRow(row, { isCreate: true, isDefaultValue: nextControl.value.isDefault, isQueryWorksheetFill: true }),
        ),
      );
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'append') {
      addRows(nextControl.value.rows.map(this.newRow));
    }
    if (
      nextControl.controlId !== control.controlId ||
      !_.isEqual(nextControl.showControls, control.showControls) ||
      !_.isEqual(
        (control.relationControls || []).map(a => a.fieldPermission),
        (nextControl.relationControls || []).map(a => a.fieldPermission),
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
    const { control } = this.props;
    if (_.isFunction(control.addRefreshEvents)) {
      control.addRefreshEvents(control.controlId, undefined);
    }
    $(this.childTableCon).off('mouseenter', '.cell .ghostAngle', this.handleMouseEnter);
    $(this.childTableCon).off('mouseleave', '.cell .ghostAngle', this.handleMouseLeave);
  }

  worksheettable = React.createRef();

  getControls(props, { newControls } = {}) {
    const {
      recordId,
      control: { controlId, showControls = [], advancedSetting = {}, relationControls = [] },
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
        control.controlPermissions = '111';
        return control;
      },
    );
    result = result.filter(
      c =>
        c &&
        c.controlId !== 'ownerid' &&
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
                        Object.assign(a, { [b.controlId]: b.value }),
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
    const { control, recordId, masterData, loadRows } = nextProps || this.props;
    if (!recordId || !masterData) {
      return;
    }
    loadRows({
      getWorksheet: needResetControls,
      worksheetId: masterData.worksheetId,
      recordId,
      controlId: control.controlId,
      isCustomButtonFillRecord: control.isCustomButtonFillRecord,
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
    this.setState({ loading: true, sortedControl: undefined });
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
          updateSucessCb: needUpdateRow => {
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
    } else {
      this.worksheettable.current.table.updateSheetRow({
        ...row,
        allowedit: true,
        allowedelete: true,
      });
    }
  }

  @autobind
  handleAddRowByLine() {
    const { addRow, rows } = this.props;
    const { controls } = this.state;
    this.updateDefsourceOfControl();
    const row = this.newRow();
    const editingKey = `${row.rowid}-${controls[0].controlId}`;
    const editable = controlState(controls[0]).editable;
    addRow(row);
    this.setState(
      {
        editingControls: editable ? { [editingKey]: true } : {},
      },
      () => {
        try {
          this.worksheettable.current.table.mdtable.current.setScroll({
            left: 0,
            top: rows.length + 1 > 15 ? 100000 : 0,
          });
        } catch (err) {}
      },
    );
  }

  @autobind
  handleAddRowsFromRelateRecord(batchAddControls) {
    const { addRows, entityName, control } = this.props;
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
      controlId: control.controlId,
      parentWorksheetId: control.dataSource,
      allowNewRecord: false,
      viewId: relateRecordControl.viewId,
      relateSheetId: relateRecordControl.dataSource,
      formData: controls.map(c => ({ ...c, value: tempRow[c.controlId] })).concat(this.props.masterData.formData),
      onOk: selectedRecords => {
        addRows(
          selectedRecords.map(selectedRecord => {
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
  updateEditingControls(key, value) {
    this.setState({
      editingControls: Object.assign({}, this.state.editingControls, { [key]: value }),
    });
  }

  @autobind
  handleUpdateCell({ control, cell, row = {} }, options) {
    const { rows, updateRow } = this.props;
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
      if (_.isFunction(options.updateSucessCb)) {
        options.updateSucessCb(newRow);
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
          updateRow({ rowid: row.rowid, value: row }).then(() => {
            try {
              this.worksheettable.current.table.initControlState();
            } catch (err) {}
          });
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
    const rowId = (rows[rowIndex - 1] || {}).rowid;
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
              background: #ff4646;
              zIndex: 2;
              color: #fff";
          >
            ${error}
          </div>`);
        cell.parentElement.appendChild(errorEle);
        const top =
          cell.offsetTop +
          (/row-1/.test(cell.getAttribute('class')) ? cell.offsetHeight - 1 : -1 * errorEle.offsetHeight);
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
      maxCount,
      from,
      recordId,
      projectId,
      control,
      rows,
      deleteRow,
      sortRows,
      mobileIsEdit,
      entityName,
      rules,
      appId,
      searchConfig,
      sheetSwitchPermit,
    } = this.props;
    const { allowadd, allowcancel, allowedit, batchcids, allowsingle } = parseAdvancedSetting(control.advancedSetting);
    const {
      loading,
      tempSheetColumnWidths,
      previewRowIndex,
      editingControls,
      sheetColumnWidths,
      sortedControl,
      cellErrors,
      recordVisible,
      controls,
    } = this.state;
    const batchAddControls = batchcids.map(id => _.find(controls, { controlId: id })).filter(_.identity);
    const addRowFromRelateRecords = !!batchAddControls.length;
    const allowAddByLine =
      (_.isUndefined(_.get(control, 'advancedSetting.allowsingle')) && !addRowFromRelateRecords) || allowsingle;
    const tableRows = rows.map(row => (!/^temp/.test(row.rowid) ? { ...row, allowedit } : row));
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const disabledNew = tableRows.length === maxCount || noColumns || disabled || !allowadd;
    const RowDetailComponent = isMobile ? RowDetailMobile : RowDetail;
    const fullShowTable = tableRows.length <= 15;
    let tableHeight = ((fullShowTable ? tableRows.length : 15) + 1) * 34;
    if (tableRows.length === 1) {
      tableHeight += 26;
    }
    if (!columns.length) {
      return <div className="Gray_9e">{_l('没有支持填写的字段')}</div>;
    }
    return (
      <div className="childTableCon" ref={con => (this.childTableCon = con)}>
        {this.state.error && <span className="errorTip"> {_l('请正确填写%0', control.controlName)} </span>}
        {!isMobile && !loading && (
          <div style={{ height: tableHeight }}>
            <WorksheetTable
              isSubList
              rules={rules}
              height={tableHeight}
              fromModule={WORKSHEETTABLE_FROM_MODULE.SUBLIST}
              viewId={control.viewId}
              scrollBarHoverShow
              ref={this.worksheettable}
              responseHeight={fullShowTable}
              forceScrollOffset={fullShowTable && { height: true }}
              clickEnterEditing
              cellErrors={cellErrors}
              clearCellError={this.handleClearCellError}
              cellUniqueValidate={this.handleUniqueValidate}
              editingControls={editingControls}
              fixedColumnCount={0}
              lineeditable={!disabled}
              noRenderEmpty
              rowHeight={34}
              worksheetId={control.dataSource}
              projectId={projectId}
              appId={appId}
              columns={columns}
              controls={controls}
              data={tableRows.length === 1 ? tableRows.concat({ isSubListFooter: true }) : tableRows}
              sheetColumnWidths={{ ...sheetColumnWidths, ...tempSheetColumnWidths }}
              updateEditingControls={this.updateEditingControls}
              rowHeadWidth={75}
              sheetSwitchPermit={sheetSwitchPermit}
              masterFormData={() => this.props.masterData.formData}
              masterData={() => this.props.masterData}
              getRowsCache={() => this.rowsCache}
              renderRowHead={args => (
                <RowHead
                  {...args}
                  row={rows[args.rowIndex - 1]}
                  allowAdd={allowadd}
                  allowCancel={allowcancel}
                  changeSheetLayoutVisible={control.isCharge && !_.isEmpty(tempSheetColumnWidths)}
                  disabled={disabled}
                  onOpen={this.openDetail}
                  onDelete={() => deleteRow(args.row.rowid)}
                  onCopy={() => {
                    if (disabledNew) {
                      alert(_l('已超过子表最大行数'), 2);
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
                    editWorksheetControls({
                      worksheetId: this.props.masterData.worksheetId,
                      controls: [
                        { ..._.pick(newControl, ['controlId', 'advancedSetting']), editattrs: ['advancedSetting'] },
                      ],
                    }).then(res => {
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
                  resetSehetLayout={() => {
                    this.setState({ tempSheetColumnWidths: {} });
                  }}
                />
              )}
              renderColumnHead={({ ...rest }) => {
                const { control } = rest;
                return (
                  <ColumnHead
                    showRequired
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
            {isMobile && !disabledNew && addRowFromRelateRecords && (
              <span
                className="addRowByDialog h5 flex ellipsis"
                onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}
              >
                <i className="icon icon-done_all mRight5 Font16"></i>
                {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
              </span>
            )}
            {isMobile && mobileIsEdit && !disabledNew && allowAddByLine && (
              <span
                className="addRowByLine h5 flex"
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
            {!isMobile && !disabledNew && addRowFromRelateRecords && (
              <span className="addRowByDialog" onClick={() => this.handleAddRowsFromRelateRecord(batchAddControls)}>
                <i className="icon icon-done_all mRight5 Font16"></i>
                {_l('选择%0', batchAddControls[0] && batchAddControls[0].controlName)}
              </span>
            )}
            {!isMobile && !disabledNew && allowAddByLine && (
              <span className="addRowByLine" onClick={this.handleAddRowByLine}>
                <i className="icon icon-plus mRight5 Font16"></i>
                {_l('添加一行')}
              </span>
            )}
          </div>
        )}
        {recordVisible && (
          <RowDetailComponent
            ignoreLock={(tableRows[previewRowIndex] || {}).isEdited}
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
            disabled={disabled || (!/^temp/.test(_.get(tableRows, `${previewRowIndex}.rowid`)) && !allowedit)}
            mobileIsEdit={mobileIsEdit}
            allowDelete={/^temp/.test(_.get(tableRows, `${previewRowIndex}.rowid`)) || allowcancel}
            controls={controls}
            data={previewRowIndex > -1 ? tableRows[previewRowIndex] || {} : this.newRow()}
            switchDisabled={{ prev: previewRowIndex === 0, next: previewRowIndex === tableRows.length - 1 }}
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
  sortRows: bindActionCreators(actions.sortRows, dispatch),
  clearAndSetRows: bindActionCreators(actions.clearAndSetRows, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
