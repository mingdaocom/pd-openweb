import React, { Fragment } from 'react';
import { flushSync } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { get, includes } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { ROW_HEIGHT } from 'worksheet/constants/enum';
import { SHEET_VIEW_HIDDEN_TYPES, SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import {
  filterEmptyChildTableRows,
  filterRowsByKeywords,
  formatRecordToRelateRecord,
  isRelateRecordTableControl,
  parseAdvancedSetting,
  replaceByIndex,
  replaceControlsTranslateInfo,
  sortControlByIds,
  updateOptionsOfControls,
} from 'worksheet/util';
import { FORM_ERROR_TYPE_TEXT, FROM, WIDGET_VALUE_ID } from 'src/components/newCustomFields/tools/config';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { mobileSelectRecord } from 'src/components/recordCardListDialog/mobile';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { canAsUniqueWidget } from 'src/pages/widgetConfig/util/setting';
import { controlState } from '../../../core/formUtils';
import ExportSheetButton from './ExportSheetButton';
import MobileTable from './MobileTable';
import * as actions from './redux/actions';
import RowDetailMobile from './RowDetailMobileModal';
import SearchInput from './SearchInput';

const IconBtn = styled.span`
  color: #9e9e9e;
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
`;

const systemControls = SYSTEM_CONTROLS.map(c => ({ ...c, fieldPermission: '111' }));
const MAX_COUNT = 1000;

export function handleUpdateDefsourceOfControl({ recordId, relateRecordControl, masterData, controls = [] } = {}) {
  return controls.map(control => {
    if (
      control.type === 29 &&
      control.sourceControlId === relateRecordControl.controlId &&
      control.dataSource === relateRecordControl.worksheetId
    ) {
      try {
        control.advancedSetting = _.assign({}, control.advancedSetting, {
          defsource: JSON.stringify([
            {
              staticValue: JSON.stringify([
                JSON.stringify({
                  rowid: recordId,
                  ...[{}, ...(get(masterData, 'formData') || []).filter(c => c.type !== 34)].reduce((a = {}, b = {}) =>
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
      } catch (err) {
        console.error(err);
        return control;
      }
    } else {
      return control;
    }
  });
}

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
      disableMaskDataControls: {},
      rowsLoadingStatus: {},
      showLoadingMask: false,
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

    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
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

    this.abortController && this.abortController.abort && this.abortController.abort();
  }

  worksheettable = React.createRef();
  searchRef = React.createRef();

  get settings() {
    const { control = {} } = this.props;
    const parsedSettings = parseAdvancedSetting(control.advancedSetting);
    let { min, max, rownum, enablelimit } = parsedSettings;
    let minCount;
    let maxCount = _.get(window, 'shareState.isPublicForm') ? 200 : MAX_COUNT;
    if (enablelimit) {
      minCount = min;
      maxCount = max;
    }
    return { ...parsedSettings, minCount, maxCount, rownum };
  }

  get useUserPermission() {
    const { control } = this.props;
    const [isHiddenOtherViewRecord] = (control.strDefault || '000').split('');
    return !!+isHiddenOtherViewRecord;
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
    return get(this, 'props.control.advancedSetting.showtype') === '2' && false;
  }

  getControls(props, { newControls } = {}) {
    props = props || this.props;
    const { baseLoading, from, appId, base = {}, control = {}, updateBase } = props;
    const { useUserPermission } = this;
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
                  : useUserPermission
                    ? c.controlPermissions
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
      control.originalFieldPermission = control.fieldPermission;
      if (!_.find(showControls, scid => control.controlId === scid)) {
        control.fieldPermission = '000';
      } else {
        control.fieldPermission = replaceByIndex(control.fieldPermission || '111', 2, '1');
      }
      if (!useUserPermission) {
        if (!isWorkflow) {
          control.controlPermissions = '111';
        } else {
          control.controlPermissions = replaceByIndex(control.controlPermissions || '111', 2, '1');
        }
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

  getControl(controlId) {
    return _.find(this.state.controls, { controlId });
  }

  updateDefsourceOfControl(nextProps) {
    const { recordId, masterData } = nextProps || this.props;
    const { controls } = this.state;
    const relateRecordControl = (nextProps || this.props).control;
    this.setState({
      controls: handleUpdateDefsourceOfControl({ recordId, relateRecordControl, masterData, controls }),
    });
  }

  loadRows(nextProps, { needResetControls } = {}) {
    const { control, recordId, masterData, loadRows, from, base = {} } = nextProps || this.props;

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
    const { control } = this.props;

    const { controls } = this.state;
    const hiddenTypes = window.isPublicWorksheet ? [48] : [];
    let columns = !controls.length
      ? [{}]
      : controls
          .filter(
            c =>
              c.type !== 34 &&
              !isRelateRecordTableControl(c) &&
              !_.includes(hiddenTypes.concat(SHEET_VIEW_HIDDEN_TYPES), c.type),
          )
          .map(c => _.assign({}, c));

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

  newRow = (defaultRow, { isDefaultValue, isCreate, isQueryWorksheetFill, isImportFromExcel } = {}) => {
    const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
    const row = this.rowUpdate(
      { row: defaultRow, rowId: tempRowId },
      { isCreate, isQueryWorksheetFill, isImportFromExcel },
    );
    return {
      ...row,
      rowid: tempRowId,
      pid: (defaultRow && defaultRow.pid) || '',
      allowedit: true,
      allowdelete: true,
      addTime: new Date().getTime(),
    };
  };

  rowUpdate(
    { row, controlId, value, rowId } = {},
    { isCreate = false, isQueryWorksheetFill = false, isImportFromExcel } = {},
  ) {
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
            this.handleRowDetailSave(needUpdateRow);
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
          isImportFromExcel,
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
      updateLoadingItems: loadingInfo => {
        if (!row.needShowLoading) return;
        this.setState(prev => {
          const newRowsLoadingStatus = {
            ...prev.rowsLoadingStatus,
            [rowId]: !_.every(Object.values(loadingInfo), b => !b),
          };
          const newShowLoadingMask = !Object.values(newRowsLoadingStatus).every(v => v === false);
          this.setState({
            showLoadingMask: newShowLoadingMask,
          });
          return {
            ...prev,
            rowsLoadingStatus: newRowsLoadingStatus,
          };
        });
      },
      onAsyncChange: (changes, dataFormat) => {
        flushSync(() => {
          if (rowId && row && row.needShowLoading) {
            this.setState(prev => {
              const newRowsLoadingStatus = {
                ...prev.rowsLoadingStatus,
                [rowId]: !_.every(Object.values(dataFormat.loadingInfo), b => !b),
              };
              this.setState({
                showLoadingMask: !Object.values(newRowsLoadingStatus).every(v => v === false),
              });
              return {
                ...prev,
                rowsLoadingStatus: newRowsLoadingStatus,
              };
            });
          }
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

    mobileSelectRecord({
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
            if (ele) {
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
    this.setState({
      previewRowIndex: index,
      recordVisible: true,
      isEditCurrentRow: true,
    });
  };

  compareValue(control, value1, value2) {
    try {
      if (control && _.includes([26, 27, 48], control.type)) {
        return _.isEqual(
          safeParse(value1, 'array').map(c => c[WIDGET_VALUE_ID[control.type]]),
          safeParse(value2, 'array').map(c => c[WIDGET_VALUE_ID[control.type]]),
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

  render() {
    const {
      maxHeight,
      cellErrors,
      from,
      recordId,
      control,
      rows,
      deleteRow,
      exportSheet,
      mobileIsEdit,
      appId,
      sheetSwitchPermit,
      showSearch,
      showExport,
      masterData,
      isDraft,
    } = this.props;
    const { projectId, rules } = this.worksheetInfo;
    const { searchConfig } = this;
    let { allowcancel, allowedit, batchcids, allowsingle, hidenumber, rowheight, rownum, h5showtype, h5abstractids, titleWrap } =
      parseAdvancedSetting(control.advancedSetting);

    const { useUserPermission } = this;
    let allowadd = parseAdvancedSetting(control.advancedSetting).allowadd;
    allowadd = allowadd && (useUserPermission ? this.worksheetInfo.allowAdd : true);
    const { maxCount } = this.settings;
    const maxShowRowCount = this.props.maxShowRowCount || rownum;
    const rowHeight = ROW_HEIGHT[rowheight] || 34;
    const { showAsPages } = this;
    const {
      loading,
      error,
      previewRowIndex,
      recordVisible,
      controls,
      isBatchEditing,
      selectedRowIds,
      pageSize,
      pageIndex,
      keywords,
      headHeight,
      isEditCurrentRow,
      isMobileSearchFocus,
      isAddRowByLine,
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
        return { ...row, allowedit: allowedit && (useUserPermission ? row.allowedit : true) };
      }
    });
    const originRows = tableRows;
    const valueChanged = _.isUndefined(this.props.valueChanged) ? this.valueChanged : this.props.valueChanged;
    const disabled = !controlPermission.editable || control.disabled;
    const noColumns = !controls.length;
    const columns = this.getShowColumns();
    const isExceed = filterEmptyChildTableRows(originRows).length >= maxCount;
    const disabledNew = noColumns || disabled || !allowadd;

    if (!columns.length) {
      return <div className="childTableEmptyTag"></div>;
    }
    if (keywords) {
      tableRows = filterRowsByKeywords({ rows: tableRows, controls: controls, keywords });
    }
    let tableData = tableRows;
    if (showAsPages) {
      tableData = tableData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
    }

    const fullShowTable = tableData.length <= maxShowRowCount;
    let tableHeight = (fullShowTable ? tableData.length || 1 : maxShowRowCount) * rowHeight + headHeight;
    if (maxHeight && tableHeight > maxHeight) {
      tableHeight = maxHeight;
    }

    const operateComp = (
      <Fragment>
        {showSearch && (
          <SearchInput
            ref={this.searchRef}
            inputWidth={100}
            searchIcon={
              <div className="operateBtnBox">
                <i className="icon icon-search" />
              </div>
            }
            keywords={keywords}
            className="queryInput mobileQueryInput"
            focusedClass={cx({ mRight10: !isMobileSearchFocus })}
            onOk={value => {
              this.setState({ keywords: value, pageIndex: 1 });
            }}
            onClear={() => {
              this.setState({ keywords: '', pageIndex: 1, isMobileSearchFocus: false });
            }}
            onFocus={() => this.setState({ isMobileSearchFocus: true })}
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
          (disabled || !mobileIsEdit) && (
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
            className="mLeft12"
            onClick={() => {
              this.refresh();
            }}
          >
            <div className="operateBtnBox">
              <i className="icon icon-task-later" />
            </div>
          </span>
        )}
      </Fragment>
    );
    return (
      <div className="childTableCon">
        {!_.isEmpty(cellErrors) && (
          <span className="errorTip ellipsis" style={{ top: -31 }}>
            {' '}
            {_l('请正确填写%0', control.controlName)}{' '}
          </span>
        )}
        {isBatchEditing && !!selectedRowIds.length && (
          <div className="selectedTip">{_l('已选择%0条记录', selectedRowIds.length)}</div>
        )}

        {!loading && (
          <MobileTable
            sheetSwitchPermit={sheetSwitchPermit}
            allowcancel={allowcancel}
            allowadd={allowadd}
            disabled={disabled}
            controlPermission={controlPermission}
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
            rules={rules}
            cellErrors={cellErrors}
            projectId={projectId}
            allowedit={allowedit}
            titleWrap={titleWrap}
            isAddRowByLine={isAddRowByLine}
            from={from}
            isDraft={isDraft}
            masterData={() => this.props.masterData}
            getMasterFormData={() => this.props.masterData.formData}
            useUserPermission={useUserPermission}
            recordId={recordId}
            updateIsAddByLine={value => this.setState({ isAddRowByLine: value })}
            onSave={this.handleRowDetailSave}
            submitChildTableCheckData={control.submitChildTableCheckData}
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

        <div className="operate valignWrapper mTop12">
          {mobileIsEdit && !disabledNew && !isExceed && addRowFromRelateRecords && (
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
          {mobileIsEdit && !disabledNew && !isExceed && allowAddByLine && (
            <span
              className="addRowByLine h5 customFormButton"
              onClick={() => {
                this.handleAddRowByLine();
                this.setState({
                  previewRowIndex: keywords ? originRows.length : tableRows.length,
                  recordVisible: h5showtype === '2' ? false : true,
                  isAddRowByLine: true,
                });
              }}
            >
              <i className="icon icon-plus mRight5 Font16"></i>
              {_l('添加')}
            </span>
          )}
          <div className="operates w100 flexRow isMobile" style={{ justifyContent: 'flex-end', marginTop: -6 }}>
            {operateComp}
          </div>
        </div>

        {recordVisible && (
          <RowDetailMobile
            isEditCurrentRow={isEditCurrentRow}
            masterData={masterData}
            isWorkflow
            ignoreLock={/^(temp|default|empty)/.test((tableData[previewRowIndex] || {}).rowid)}
            visible
            aglinBottom={!!recordId}
            from={from === FROM.DRAFT ? 3 : from}
            isDraft={isDraft}
            worksheetId={control.dataSource}
            projectId={projectId}
            appId={appId}
            searchConfig={searchConfig}
            sheetSwitchPermit={sheetSwitchPermit}
            controlName={control.controlName}
            title={
              previewRowIndex > -1 ? (
                <Fragment>
                  <div className="ellipsis">{control.controlName}</div>
                  <div>#{previewRowIndex + 1}</div>
                </Fragment>
              ) : (
                _l('创建%0', control.controlName)
              )
            }
            disabled={disabled || (!/^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) && !allowedit)}
            isExceed={isExceed}
            mobileIsEdit={mobileIsEdit}
            allowDelete={
              /^temp/.test(_.get(tableData, `${previewRowIndex}.rowid`)) ||
              (allowcancel &&
                (useUserPermission && !!recordId ? _.get(tableData[previewRowIndex], 'allowdelete') : true))
            }
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
            onClose={() => this.setState({ recordVisible: false, isEditCurrentRow: false })}
            rules={rules}
            openNextRecord={() => {
              this.handleAddRowByLine();
              this.setState({
                previewRowIndex: keywords ? originRows.length : tableRows.length,
                recordVisible: true,
              });
            }}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  baseLoading: state.baseLoading,
  base: state.base,
  rows: state.rows,
  lastAction: state.lastAction,
  cellErrors: state.cellErrors,
});

const mapDispatchToProps = dispatch => ({
  loadRows: bindActionCreators(actions.loadRows, dispatch),
  initRows: bindActionCreators(actions.initRows, dispatch),
  addRow: bindActionCreators(actions.addRow, dispatch),
  addRows: bindActionCreators(actions.addRows, dispatch),
  updateRow: bindActionCreators(actions.updateRow, dispatch),
  deleteRow: bindActionCreators(actions.deleteRow, dispatch),
  exportSheet: bindActionCreators(actions.exportSheet, dispatch),
  updateCellErrors: bindActionCreators(actions.updateCellErrors, dispatch),
  updateBase: bindActionCreators(actions.updateBase, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTable);
