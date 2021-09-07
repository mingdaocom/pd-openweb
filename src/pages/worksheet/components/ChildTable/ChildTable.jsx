import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import uuid from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserIsMobile } from 'src/util';
import { editWorksheetControls } from 'src/api/worksheet';
import Skeleton from 'src/router/Application/Skeleton';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { sortControlByIds, replaceByIndex, isRelateRecordTableControl, copySublistRow } from 'worksheet/util';
import ColumnHead from '../BaseColumnHead';
import RowHead from './ChildTableRowHead';
import MobileTable from './MobileTable';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import WorksheetTable from '../WorksheetTable';
import RowDetail from './RowDetailModal';
import RowDetailMobile from './RowDetailMobileModal';
import * as actions from './redux/actions';

class ChildTable extends React.Component {
  static propTypes = {
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
      loading: !!props.recordId,
    };
    this.state.sheetColumnWidths = this.getSheetColumnWidths();
    props.registerCell(this);
  }

  componentDidMount() {
    const { control, recordId, initRows } = this.props;
    if (recordId) {
      this.loadRows();
    } else if (control.value) {
      try {
        const defaultRows = JSON.parse(control.value);
        if (_.isArray(defaultRows)) {
          initRows(JSON.parse(control.value));
        }
      } catch (err) {
        console.log(err);
      }
    }
    if (_.isFunction(control.registeRefreshEvents)) {
      control.registeRefreshEvents(control.controlId, this.refresh);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { rows, initRows, resetRows, addRow, deleteRow, clearAndSetRows } = this.props;
    const control = this.props.control;
    const nextControl = nextProps.control;
    const isAddRecord = !nextProps.recordId;
    const valueChanged = !_.isEqual(control.value, nextControl.value);
    if (nextProps.recordId !== this.props.recordId) {
      this.refresh(nextProps);
    } else if (isAddRecord && valueChanged && typeof nextControl.value === 'undefined') {
      initRows([]);
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'reset') {
      resetRows();
    } else if (valueChanged && nextControl.value && nextControl.value.action === 'clearAndset') {
      clearAndSetRows(
        nextControl.value.rows.map(row => ({
          ...row,
          rowid: `temprowid-${uuid.v4()}`,
          allowedit: true,
          addTime: new Date().getTime(),
        })),
      );
    }
    if (nextControl.controlId !== control.controlId || nextControl.showControls !== control.showControls) {
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
    if (nextProps.lastAction.type === 'UPDATE_ROW') {
      return false;
    }
    return (
      !_.isEqual(this.props.rows, nextProps.rows) ||
      !_.isEqual(this.props.mobileIsEdit, nextProps.mobileIsEdit) ||
      !_.isEqual(this.props.control.relationControls, nextProps.control.relationControls)
    );
  }

  componentWillUnmount() {
    const { control } = this.props;
    if (_.isFunction(control.registeRefreshEvents)) {
      control.registeRefreshEvents(control.controlId, undefined);
    }
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
      control => {
        const resetedControl = _.find(relationControls, { controlId: control.controlId });
        if (resetedControl) {
          control.required = resetedControl.required;
          control.fieldPermission = resetedControl.fieldPermission;
        }
        if (!_.find(showControls, scid => control.controlId === scid)) {
          control.fieldPermission = '000';
        } else {
          control.fieldPermission = replaceByIndex(replaceByIndex(control.fieldPermission || '111', 0, '1'), 2, '1');
        }
        control.controlPermissions = '111';
        return control;
      },
    );
    result = result.filter(c => c && c.controlId !== 'ownerid');
    return result;
  }

  updateDefsourceOfControl() {
    const {
      recordId,
      control: { controlId },
      masterData,
    } = this.props;
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
      callback: res => {
        const state = { loading: false };
        if (needResetControls) {
          const newControls = _.get(res, 'template.controls');
          if (newControls && newControls.length) {
            state.controls = this.getControls(nextProps, { newControls });
          }
        }
        this.setState(state);
      },
    });
  }

  @autobind
  refresh(nextProps, { noLoading } = {}) {
    if (!noLoading) {
      this.setState({ loading: true });
    }
    this.setState({ sortedControl: undefined });
    this.loadRows(nextProps, { needResetControls: true });
  }

  getShowColumns() {
    const { control } = this.props;
    const { controls } = this.state;
    return !controls.length
      ? [{}]
      : controls.filter(
          c =>
            _.find(control.showControls, scid => scid === c.controlId) &&
            controlState(c).visible &&
            !isRelateRecordTableControl(c),
        );
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

  newRow() {
    const row = this.rowUpdate();
    const tempRowId = `temprowid-${uuid.v4()}`;
    return { ...row, rowid: tempRowId, allowedit: true, addTime: new Date().getTime() };
  }

  copyRow(row) {
    const { addRow } = this.props;
    addRow(
      Object.assign({}, _.omit(copySublistRow(this.state.controls, row), ['updatedControlIds']), {
        rowid: `temprowid-${uuid.v4()}`,
        allowedit: true,
        isCopy: true,
        addTime: new Date().getTime(),
      }),
      row.rowid,
    );
  }

  rowUpdate({ row, controlId, value } = {}) {
    const { masterData } = this.props;
    const formdata = new DataFormat({
      data: this.state.controls.map(c => ({ ...c, value: (row || {})[c.controlId] || c.value })),
      isCreate: !row,
      from: FROM.NEWRECORD,
      masterData,
    });
    if (controlId) {
      formdata.updateDataSource({ controlId, value });
    }
    return [{}, ...formdata.getDataSource()].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
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
    const newRow = this.rowUpdate({ row: rowData, controlId: cell.controlId, value });
    if (_.isFunction(options.updateSucessCb)) {
      options.updateSucessCb(newRow);
    }
    rowData.updatedControlIds = _.isEmpty(rowData.updatedControlIds)
      ? [cell.controlId]
      : _.uniq(rowData.updatedControlIds.concat(cell.controlId));
    rowData.updatedControlIds = rowData.updatedControlIds.concat(
      controls.filter(c => ((c.advancedSetting || {}).defsource || '').includes(cell.controlId)).map(c => c.controlId),
    );
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
      const newControl = { ...control, options: [...control.options, newOption] };
      this.setState({
        controls: controls.map(c => (c.controlId === control.controlId ? newControl : c)),
      });
    }
    updateRow({ rowid: row.rowid, value: newRow });
  }

  @autobind
  handleRowDetailSave(row, updatedControlIds) {
    const { updateRow, addRow } = this.props;
    const { previewRowIndex, controls } = this.state;
    row.updatedControlIds = _.isEmpty(row.updatedControlIds)
      ? updatedControlIds
      : _.uniq(row.updatedControlIds.concat(updatedControlIds));
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
      cellErrors: { ...this.state.cellErrors, [key]: undefined },
    });
  }

  @autobind
  handleUniqueValidate(controlId, value) {
    const { rows } = this.props;
    return !_.find(rows, row => row[controlId] === value);
  }

  render() {
    const { maxCount, from, recordId, projectId, control, rows, deleteRow, sortRows, mobileIsEdit } = this.props;
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
    const controlPermission = controlState(control, from);
    const disabled = !controlPermission.editable || control.disabled;
    const isMobile = browserIsMobile();
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const disabledNew = rows.length === maxCount || noColumns || disabled;
    const RowDetailComponent = isMobile ? RowDetailMobile : RowDetail;
    const fullShowTable = rows.length <= 15;
    const tableHeight = ((fullShowTable ? rows.length : 15) + 1) * 34;
    return (
      <div className="childTableCon" ref={con => (this.childTableCon = con)}>
        {this.state.error && <span className="errorTip"> {_l('请正确填写%0', control.controlName)} </span>}
        {!isMobile && !loading && (
          <div style={{ height: tableHeight }}>
            <WorksheetTable
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
              columns={columns}
              controls={controls}
              data={rows}
              sheetColumnWidths={{ ...sheetColumnWidths, ...tempSheetColumnWidths }}
              updateEditingControls={this.updateEditingControls}
              rowHeadWidth={75}
              masterFormData={() => this.props.masterData.formData}
              renderRowHead={args => (
                <RowHead
                  {...args}
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
                      controls: [_.omit(newControl, ['value'])],
                    }).then(res => {
                      if (res.data) {
                        closePopup();
                        this.setState({
                          tempSheetColumnWidths: {},
                          sheetColumnWidths: this.getSheetColumnWidths(newControl),
                        });
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
              onCellClick={this.handleCellClick}
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
          <MobileTable rows={rows} controls={columns} onOpen={this.openDetail} isEdit={mobileIsEdit} />
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
        <div className="operate">
          {!isMobile && !disabledNew && (
            <span className="addRowByLine" onClick={this.handleAddRowByLine}>
              <i className="icon icon-plus mRight5 Font16"></i>
              {_l('添加一行')}
            </span>
          )}
          {isMobile && mobileIsEdit && !disabledNew && (
            <span
              className="addRowByLine h5"
              onClick={() => {
                this.setState({ previewRowIndex: -1, recordVisible: true });
              }}
            >
              <i className="icon icon-plus mRight5 Font16"></i>
              {_l('添加')}
            </span>
          )}
        </div>
        {recordVisible && (
          <RowDetailComponent
            visible
            aglinBottom={!!recordId}
            from={from}
            projectId={projectId}
            controlName={control.controlName}
            title={
              previewRowIndex > -1 ? `${control.controlName}#${previewRowIndex + 1}` : _l('创建%0', control.controlName)
            }
            disabled={disabled}
            controls={controls}
            data={previewRowIndex > -1 ? rows[previewRowIndex] || {} : this.newRow()}
            switchDisabled={{ prev: previewRowIndex === 0, next: previewRowIndex === rows.length - 1 }}
            handleUniqueValidate={this.handleUniqueValidate}
            onSwitch={this.handleSwitch}
            onSave={this.handleRowDetailSave}
            onDelete={deleteRow}
            onClose={() => this.setState({ recordVisible: false })}
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
  updateRow: bindActionCreators(actions.updateRow, dispatch),
  deleteRow: bindActionCreators(actions.deleteRow, dispatch),
  sortRows: bindActionCreators(actions.sortRows, dispatch),
  clearAndSetRows: bindActionCreators(actions.clearAndSetRows, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
