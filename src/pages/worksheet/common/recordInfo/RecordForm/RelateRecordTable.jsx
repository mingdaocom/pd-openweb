import React, { useState, useReducer, useMemo, useEffect, useRef, useCallback, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Motion, spring } from 'react-motion';
import worksheetAjax from 'src/api/worksheet';
import update from 'immutability-helper';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { replaceByIndex, emitter, replaceControlsTranslateInfo } from 'worksheet/util';
import { getFilter, formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { WORKSHEETTABLE_FROM_MODULE, RECORD_INFO_FROM, ROW_HEIGHT } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { Input, Skeleton } from 'ming-ui';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { SYSTEM_CONTROL, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { selectRecord } from 'src/components/recordCardListDialog';
import Pagination from 'worksheet/components/Pagination';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import ColumnHead from './RelateRecordTableColumnHead';
import RowHead from './RelateRecordTableRowHead';
import RelateRecordBtn from './RelateRecordBtn';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import {
  deleteRecord,
  exportRelateRecordRecords,
  getWorksheetInfo,
  updateRecordControl,
  updateRelateRecords,
} from '../crtl';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { openRelateRelateRecordTable } from 'worksheet/components/RelateRecordTableDialog';
import { addBehaviorLog, parseNumber, getTranslateInfo } from 'src/util';
import _ from 'lodash';
import { handleRowData } from 'src/util/transControlDefaultValue';
import { useSetState, useKey } from 'react-use';
import ExportSheetButton from 'worksheet/components/ExportSheetButton';
import moment from 'moment';

const ClickAwayable = createDecoratedComponent(withClickAway);

function tableReducer(state, action) {
  const { records } = state;
  function updateVersion() {
    if (!action.noUpdate) {
      state.tableVersion = Math.random();
    }
  }
  state.lastAction = action.type;
  state.changed = action.type !== 'RESET_CHANGED';
  switch (action.type) {
    case 'UPDATE_VERSION':
      updateVersion();
      return state;
    case 'UPDATE_RECORDS':
      updateVersion();
      return update(state, { records: { $set: action.records } });
    case 'ADD_RECORDS':
      updateVersion();
      if (action.afterRecordId) {
        const afterRowIndex = _.findIndex(records, r => r.rowid === action.afterRecordId);
        if (afterRowIndex < 0) {
          return state;
        }
        return update(state, {
          records: {
            $set: [...records.slice(0, afterRowIndex + 1), ...action.records, ...records.slice(afterRowIndex + 1)],
          },
        });
      } else {
        return update(state, { records: { $set: [...action.records, ...records] } });
      }
    case 'UPDATE_RECORD':
      updateVersion();
      return update(state, {
        records: {
          $apply: rs => rs.map(r => (r.rowid === action.record.rowid ? Object.assign({}, r, action.record) : r)),
        },
      });
    case 'DELETE_RECORDS':
      updateVersion();
      if (typeof action.id === 'object') {
        return update(state, { records: { $apply: rs => rs.filter(r => !_.includes(action.id, r.rowid)) } });
      } else {
        return update(state, { records: { $apply: rs => rs.filter(r => r.rowid !== action.id) } });
      }
    case 'UPDATE_COUNT':
      return update(state, { count: { $set: action.change } });
    case 'ADD_COUNT':
      return update(state, { count: { $set: state.count + action.change } });
    default:
      return state;
  }
}

function createTableActions(dispatch) {
  return {
    updateVersion: () => {
      dispatch({
        type: 'UPDATE_VERSION',
      });
    },
    updateRecords: (records, noUpdate) => {
      dispatch({
        type: 'UPDATE_RECORDS',
        records,
        noUpdate,
      });
    },
    addRecords: (record, afterRecordId) => {
      const records = _.isArray(record) ? record : [record];
      dispatch({
        type: 'ADD_COUNT',
        change: records.length,
      });
      dispatch({
        type: 'ADD_RECORDS',
        records,
        afterRecordId,
      });
    },
    deleteRecord: id => {
      dispatch({
        type: 'ADD_COUNT',
        change: -1 * (_.isArray(id) ? id.length : 1),
      });
      dispatch({
        type: 'DELETE_RECORDS',
        id,
      });
    },
    updateRecord: (record, noUpdate) => {
      dispatch({
        type: 'UPDATE_RECORD',
        record,
        noUpdate,
      });
    },
    addCount: change => {
      dispatch({
        type: 'ADD_COUNT',
        change,
      });
    },
    updateCount: change => {
      dispatch({
        type: 'UPDATE_COUNT',
        change,
      });
    },
  };
}

const Con = styled.div(
  ({ padding }) => `
  padding: ${typeof padding === 'string' ? padding : `${padding}px`};
  height: 56px;
  .searchIcon {
    position: relative;
    right: 10px;
    z-index: 2;
    .icon-search {
      position: relative;
      margin: 5px 0 0;
    }
    .searchInput {
      font-size: 0px;
      overflow: hidden;
      background: #eaeaea;
      height: 28px;
      border-radius: 28px;
      input {
        width: 150px;
        margin-left: 30px;
        padding-left: 0px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        border: none;
        background: transparent;
      }
    }
    .clearKeywords {
      cursor: pointer;
      margin: 5px;
      position: absolute;
      right: 0px;
    }
  }
`,
);

const TableCon = styled.div`
  &.userSelectNone {
    * {
      user-select: none !important;
    }
  }
`;

const TableBtnCon = styled.div`
  align-items: center;
`;

const Desc = styled.div`
  color: #9e9e9e;
  padding: 12px 24px 0px;
  font-size: 12px;
`;

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

function getCellWidths(control, tableControls) {
  const result = {};
  let widths = [];
  try {
    widths = JSON.parse(control.advancedSetting.widths);
  } catch (err) {}
  if (widths.length) {
    control.showControls
      .map(scid =>
        _.find((tableControls || control.relationControls || []).concat(SYSTEM_CONTROL), c => c.controlId === scid),
      )
      .filter(c => c)
      .forEach((c, i) => {
        result[c.controlId] = widths[i];
      });
  }
  return result;
}

const PAGE_SIZE = 20;

let request;

export default function RelateRecordTable(props) {
  const {
    mode = 'recordForm',
    isSplit,
    formWidth,
    sideVisible,
    loading,
    formdata,
    recordbase,
    useHeight = false,
    relateRecordData = {},
    control,
    addRefreshEvents = () => {},
    updateWorksheetControls,
    setRelateNumOfControl = () => {},
    setLoading = () => {},
    onRelateRecordsChange = () => {},
    updateLoading = () => {},
    from,
  } = props;
  const { worksheetId, recordId, isCharge, allowEdit } = recordbase;
  const allowlink = (control.advancedSetting || {}).allowlink;
  const allowRemoveRelation =
    typeof control.advancedSetting.allowcancel === 'undefined' ? true : control.advancedSetting.allowcancel === '1';
  const searchMaxCount = parseNumber((control.advancedSetting || {}).maxcount || undefined);
  const rowHeight = Number((control.advancedSetting || {}).rowheight || 0);
  const [isHiddenOtherViewRecord, , onlyRelateByScanCode] = (control.strDefault || '').split('').map(b => !!+b);
  const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
  const {
    allowdelete = '1', // 允许删除
    allowexport = '1', // 允许导出
    allowedit = '1', // 允许行内编辑
    showquick = '1', // 允许快捷操作
    allowbatch = '0', // 允许批量操作
    alternatecolor = '1', // 交替显示行颜色
    sheettype = '0', // 表格交互方式
  } = control.advancedSetting;
  const isClassicTable = sheettype === '1';
  const allowDeleteFromSetting = allowdelete === '1';
  const allowExportFromSetting = allowexport === '1';
  const allowLineEdit = allowedit === '1';
  const showQuickFromSetting = showquick === '1';
  const allowBatchFromSetting = allowbatch === '1';
  const showAsZebra = alternatecolor === '1';
  const allowOpenRecord = allowlink !== '0';
  const pageSize = props.pageSize || PAGE_SIZE;
  const cache = useRef({});
  const searchRef = useRef();
  const conRef = useRef();
  const worksheetTableRef = useRef();
  const [{ records = [], count, tableVersion, changed, lastAction }, dispatch] = useReducer(tableReducer, {
    records: [],
    count: _.isNumber(Number(control.value)) ? Number(control.value) : 0,
  });
  const tableActions = createTableActions(dispatch);
  const [layoutChanged, setLayoutChanged] = useState();
  const [sheetColumnWidths, setSheetColumnWidths] = useState({});
  const [fixedColumnCount, setFixedColumnCount] = useState(Number(control.advancedSetting.fixedcolumncount || 0));
  const [sheetHiddenColumnIds, setSheetHiddenColumnIds] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableControls, setTableControls] = useState([]);
  const [searchVisible, setSearchVisible] = useState();
  const [keywords, setKeywords] = useState('');
  const [keywordsForSearch, setKeywordsForSearch] = useState('');
  const [worksheetOfControl, setWorksheetOfControl] = useState({});
  const [sheetSwitchPermit, setSheetSwitchPermit] = useState([]);
  const [sheetSearchConfig, setSheetSearchConfig] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageIndexForHead, setPageIndexForHead] = useState(1);
  const [sortControl, setSortControl] = useState();
  const [activeRecord, setActiveRecord] = useState();
  const [refreshFlag, setRefreshFlag] = useState();
  const [highlightRows, setHighlightRows] = useState({});
  const [disableMaskDataControls, setDisableMaskDataControls] = useState({});
  const [defaultScrollLeft, setDefaultScrollLeft] = useState(0);
  const [state, setState] = useSetState({
    isBatchEditing: false,
    selectedRowIds: [],
  });
  const { isBatchEditing, selectedRowIds } = state;
  const allIsSelected = _.isEqual(
    _.uniq(selectedRowIds),
    records.slice(0, pageSize).map(r => r.rowid),
  );
  const columnWidthsOfSetting = getCellWidths(control, tableControls);
  const isNewRecord = !recordId;
  const relateNum = useRef();
  relateNum.current = control.value;
  function overrideControls(controls) {
    return controls.map(c => {
      const resetedControl = _.find(control.relationControls, { controlId: c.controlId });
      if (resetedControl) {
        c.required = resetedControl.required;
        c.fieldPermission = resetedControl.fieldPermission;
      }
      return c;
    });
  }
  async function loadSheetSwitchPermition() {
    try {
      const data = await worksheetAjax.getSwitchPermit({ worksheetId: control.dataSource });
      setSheetSwitchPermit(data);
    } catch (err) {}
  }
  async function loadSheetSearchConfig() {
    try {
      const data = await worksheetAjax.getQueryBySheetId({ worksheetId: control.dataSource });
      setSheetSearchConfig(formatSearchConfigs(data));
    } catch (err) {}
  }
  async function loadRows({ showHideTip } = {}) {
    try {
      if (isNewRecord && control.type !== 51) {
        const worksheetInfo = await getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          getRules: true,
        });
        worksheetInfo.entityName =
          getTranslateInfo(worksheetInfo.appId, control.dataSource).recordName || worksheetInfo.entityName;
        worksheetInfo.template.controls = replaceControlsTranslateInfo(
          worksheetInfo.appId,
          worksheetInfo.template.controls,
        );
        const newTableControls = worksheetInfo.template.controls.concat(SYSTEM_CONTROL).filter(
          c =>
            c &&
            controlState({
              ...c,
              fieldPermission: '111',
              controlPermissions: isHiddenOtherViewRecord
                ? c.controlPermissions
                : replaceByIndex(control.controlPermissions || '111', 0, '1'),
            }).visible,
        );
        setWorksheetOfControl(worksheetInfo);
        setTableControls(newTableControls);
        tableActions.updateVersion();
        setLoading(false);
        return;
      }
      setHighlightRows({});
      if (request) {
        request.abort();
      }
      const args = {
        worksheetId,
        rowId: recordId,
        controlId: control.controlId,
        pageIndex,
        keywords: keywordsForSearch,
        pageSize,
        getWorksheet: pageIndex === 1,
        getRules: pageIndex === 1,
        sortId: (sortControl || {}).controlId,
        isAsc: (sortControl || {}).isAsc,
        getType: from === RECORD_INFO_FROM.DRAFT ? from : undefined,
      };
      // 关联查询组件逻辑 begin ->
      if (control.type === 51) {
        let relationControls = [...tableControls];
        let resWorksheetInfo;
        if (_.isEmpty(relationControls)) {
          resWorksheetInfo = await worksheetAjax.getWorksheetInfo({
            worksheetId: control.dataSource,
            getTemplate: true,
          });
          relationControls = _.get(resWorksheetInfo, 'template.controls') || [];
        }
        const filterControls = getFilter({
          control: { ...control, relationControls, recordId },
          formData: formdata,
          filterKey: 'resultfilters',
        });
        cache.current.filter = filterControls;
        args.filterControls = filterControls || [];
        if (filterControls === false) {
          setWorksheetOfControl(resWorksheetInfo || {});
          setTableControls(relationControls);
          setLoading(false);
          setTableLoading(false);
          tableActions.updateRecords([]);
          tableActions.updateCount(0);
          return;
        }
      }
      // <- end 关联查询组件逻辑
      request = worksheetAjax.getRowRelationRows(args);
      const res = await request;
      const newRecords = res.data;
      const isLastPage = pageIndex === Math.ceil(res.count / pageSize) || res.count === 0;
      let controls = tableControls.slice(0);
      if (res.worksheet) {
        res.worksheet.entityName =
          getTranslateInfo(res.worksheet.appId, control.dataSource).recordName || res.worksheet.entityName;
        res.worksheet.template.controls = replaceControlsTranslateInfo(
          res.worksheet.appId,
          res.worksheet.template.controls,
        );
        const newTableControls = res.worksheet.template.controls.concat(SYSTEM_CONTROL).filter(
          c =>
            c &&
            controlState({
              ...c,
              fieldPermission: '111',
              controlPermissions: isHiddenOtherViewRecord
                ? c.controlPermissions
                : replaceByIndex(control.controlPermissions || '111', 0, '1'),
            }).visible,
        );
        controls = newTableControls;
        setWorksheetOfControl(res.worksheet);
        setTableControls(newTableControls);
      }
      if (
        isHiddenOtherViewRecord &&
        _.get(control, 'advancedSetting.showcount') !== '1' &&
        showHideTip &&
        !keywordsForSearch &&
        isLastPage &&
        res.count < +relateNum.current
      ) {
        newRecords.push({
          [_.get(controls, '0.controlId') && _.get(controls, '0.controlId') !== 'rowid'
            ? _.get(controls, '0.controlId')
            : 'tip']: {
            customCell: true,
            type: 'text',
            value: _l('%0条记录已隐藏', +relateNum.current - res.count),
            style: {
              color: '#9e9e9e',
            },
          },
        });
      }
      tableActions.updateRecords(newRecords);
      tableActions.updateCount(res.count);
      setPageIndexForHead(pageIndex);
      setLoading(false);
      setTableLoading(false);
      updateLoading(false);
    } catch (err) {
      console.log(err);
    }
  }
  cache.current.loadRows = loadRows;
  const debounceLoadRows = useCallback(
    _.debounce(() => {
      setTableLoading(true);
      cache.current.loadRows();
    }, 400),
    [],
  );
  async function deleteRelateRow(deleteRecordIds, slient, { cb = () => {} } = {}) {
    if (!_.isArray(deleteRecordIds)) {
      deleteRecordIds = [deleteRecordIds];
    }
    try {
      if (recordId && from !== RECORD_INFO_FROM.DRAFT) {
        await updateRelateRecords({
          ...recordbase,
          controlId: control.controlId,
          isAdd: false,
          recordIds: deleteRecordIds,
          updateType: from,
        });
        cb();
        loadRows();
        tableActions.addCount(-1);
        setRelateNumOfControl(count - deleteRecordIds.length);
        if (!slient) {
          alert(_l('取消关联成功！'));
        }
      } else {
        deleteRecordIds.forEach(deleteRecordId => {
          tableActions.deleteRecord(deleteRecordId);
        });
        cb();
        if (from === RECORD_INFO_FROM.DRAFT) {
          setRelateNumOfControl(count - deleteRecordIds.length);
        }
      }
    } catch (err) {
      alert(_l('取消关联失败！'), 2);
    }
  }
  function handleUpdateRow({ worksheetId, recordId }) {
    if (worksheetId === control.dataSource) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          worksheetId,
        })
        .then(row => {
          if (row.resultCode === 1) {
            tableActions.updateRecord(_.omit(safeParse(row.rowData), ['allowedit', 'allowdelete']));
          }
        });
    }
  }
  useKey(
    'Shift',
    () => {
      cache.current.shiftActive = false;
      conRef.current.className = conRef.current.className.replace(' userSelectNone', '');
    },
    { event: 'keyup' },
  );
  useKey(
    'Shift',
    () => {
      cache.current.shiftActive = true;
      conRef.current.className = conRef.current.className + ' userSelectNone';
    },
    { event: 'keydown' },
  );
  useEffect(() => {
    setTableControls([]);
    if ((isNewRecord || from === RECORD_INFO_FROM.DRAFT) && control.type !== 51) {
      loadRows({ showHideTip: true });
    }
    setFixedColumnCount(Number(control.advancedSetting.fixedcolumncount || 0));
    setDefaultScrollLeft(0);
  }, [control.controlId]);
  /**
   * 关联查询的记录加载逻辑
   * - 初始化时
   * - 切换控件
   * - 切换记录
   * - 依赖的动态值变更了
   * - 刷新
   */
  useEffect(() => {
    function updateCurrent() {
      cache.current.recordId = recordId;
      cache.current.refreshFlag = refreshFlag;
      cache.current.controlId = control.controlId;
      cache.current.pageIndex = pageIndex;
      cache.current.keywordsForSearch = keywordsForSearch;
    }
    if (control.type !== 51) {
      updateCurrent();
      return;
    }
    const didMount = !cache.current.didMount; // 初始化时
    const controlIdChanged = cache.current.controlId !== control.controlId; // 切换控件
    const recordIdChanged = cache.current.recordId !== recordId; // 切换记录
    const pageIndexChanged = cache.current.pageIndex !== pageIndex;
    const keywordsChanged = cache.current.keywordsForSearch !== keywordsForSearch;
    const needRefresh = cache.current.refreshFlag !== refreshFlag; // 刷新
    if (didMount || controlIdChanged || recordIdChanged || needRefresh || pageIndexChanged || keywordsChanged) {
      debounceLoadRows();
      updateCurrent();
      return;
    }
    const newFilter = getFilter({
      control: { ...control, relationControls: tableControls, recordId },
      formData: formdata,
      filterKey: 'resultfilters',
    });
    const filterChanged = newFilter && !_.isEqual(cache.current.filter, newFilter);
    if (filterChanged) {
      debounceLoadRows();
      cache.current.filter = newFilter;
      return;
    }
    const filterChangToFalse = !_.isEqual(cache.current.formdata, formdata) && newFilter === false;
    if (filterChangToFalse) {
      tableActions.updateRecords([]);
      tableActions.updateCount(0);
      cache.current.filter = newFilter;
      cache.current.formdata = formdata;
      return;
    }
  });
  useEffect(() => {
    if (isNewRecord) {
      tableActions.updateRecords(relateRecordData[control.controlId] ? relateRecordData[control.controlId].value : []);
    }
  }, [relateRecordData[control.controlId], control.controlId]);
  useEffect(() => {
    if (!isNewRecord) {
      setTableControls([]);
      setPageIndex(1);
      setPageIndexForHead(1);
      setKeywords('');
      setKeywordsForSearch('');
      setSortControl();
      dispatch({ type: 'RESET_CHANGED' });
    }
    loadSheetSwitchPermition();
    loadSheetSearchConfig();
    setState({
      isBatchEditing: false,
      selectedRowIds: [],
    });
  }, [recordId, control.controlId]);
  useEffect(() => {
    setLoading(true);
    if (!isNewRecord && control.type !== 51) {
      loadRows({ showHideTip: true });
    }
  }, [recordId, control.controlId, pageIndex, sortControl, keywordsForSearch, refreshFlag]);
  useEffect(() => {
    if (sortControl && control.type === 51) {
      setLoading(true);
      loadRows({ showHideTip: true });
    }
  }, [sortControl]);
  useEffect(() => {
    try {
      setTimeout(() => {
        if (worksheetTableRef.current) {
          worksheetTableRef.current.handleUpdate();
        }
      }, 100);
    } catch (err) {}
  }, [formWidth, sideVisible]);
  useEffect(() => {
    if (searchVisible) {
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }, 100);
    }
  }, [searchVisible]);
  function reloadTable({ clearSelect = true } = {}) {
    setLoading(true);
    setRefreshFlag(Math.random());
    setLayoutChanged(false);
    setSortControl(undefined);
    setFixedColumnCount(0);
    setSheetHiddenColumnIds([]);
    setSheetColumnWidths({});
    if (clearSelect) {
      setState({
        isBatchEditing: false,
        selectedRowIds: [],
      });
    }
  }
  useEffect(() => {
    cache.current.didMount = true;
    addRefreshEvents('reloadRelateRecordsTable', reloadTable);
    emitter.addListener('RELOAD_RECORD_INFO', handleUpdateRow);
    return () => {
      emitter.removeListener('RELOAD_RECORD_INFO', handleUpdateRow);
    };
  }, []);
  useEffect(() => {
    if (_.includes(['ADD_RECORDS', 'DELETE_RECORDS', 'UPDATE_RECORD'], lastAction)) {
      if (isNewRecord) {
        onRelateRecordsChange(records);
      }
    }
  }, [records, lastAction]);

  useEffect(() => {
    if (from === RECORD_INFO_FROM.DRAFT) {
      onRelateRecordsChange(records);
    }
  }, [records]);

  const columns = tableControls.length
    ? tableControls
        .filter(c => !_.find(sheetHiddenColumnIds, id => c.controlId === id))
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
    : [{ controlId: 'tip' }];
  const overrideColumns = overrideControls(columns);
  const tableVisibleControls = control.showControls
    .map(sid => _.find(overrideColumns, { controlId: sid }))
    .filter(_.identity);
  const controlPermission = controlState(control, recordId ? 3 : 2);
  const addVisible =
    !control.disabled &&
    allowEdit &&
    controlPermission.editable &&
    !_.isEmpty(worksheetOfControl) &&
    worksheetOfControl.allowAdd &&
    control.enumDefault2 !== 1 &&
    control.enumDefault2 !== 11 &&
    !disabledManualWrite &&
    !(isNewRecord && control.type === 51) &&
    !_.get(window, 'shareState.isPublicForm');
  const selectVisible =
    !control.disabled &&
    !_.isEmpty(worksheetOfControl) &&
    controlPermission.editable &&
    control.enumDefault2 !== 10 &&
    control.enumDefault2 !== 11 &&
    allowEdit &&
    !disabledManualWrite &&
    control.type !== 51;
  const allowBatchEdit =
    allowBatchFromSetting &&
    controlPermission.editable &&
    allowEdit &&
    !!records.length &&
    from !== RECORD_INFO_FROM.DRAFT;
  const titleControl = formdata.filter(c => c.attribute === 1) || {};
  const defaultRelatedSheetValue = {
    name: titleControl.value,
    sid: recordId,
    type: 8,
    sourcevalue: JSON.stringify({
      ..._.assign(
        ...formdata.map(c => ({
          [c.controlId]:
            c.type === 29 && _.isObject(c.value) && c.value.records
              ? JSON.stringify(
                  // 子表使用双向关联字段作为默认值 RELATERECORD_OBJECT
                  c.value.records.map(r => ({ sid: r.rowid, sourcevalue: JSON.stringify(r) })),
                )
              : c.value,
        })),
      ),
      [titleControl.controlId]: titleControl.value,
      rowid: recordId,
    }),
  };
  if (titleControl.type === 29) {
    try {
      const cellData = JSON.parse(titleControl.value);
      defaultRelatedSheetValue.name = cellData[0].name;
    } catch (err) {
      defaultRelatedSheetValue.name = '';
    }
  }
  let rowCount = records.length > 3 ? records.length : 3;
  if (!isNewRecord && rowCount > pageSize) {
    rowCount = pageSize;
  }
  const numberWidth = String(isNewRecord ? records.length * 10 : pageIndex * pageSize).length * 8;
  let rowHeadWidth = (numberWidth > 24 ? numberWidth : 24) + 32 + (isClassicTable && allowOpenRecord ? 34 : 0);
  function handleUpdateCell({ cell, cells, updateRecordId, rules }, options = {}) {
    updateRecordControl({
      appId: worksheetOfControl.appId,
      worksheetId: worksheetOfControl.worksheetId,
      recordId: updateRecordId,
      cells,
      cell,
      rules,
    }).then(updatedRow => {
      if (_.isFunction(options.updateSuccessCb)) {
        options.updateSuccessCb(updatedRow);
      }
      // 处理新增自定义选项
      const updatedControl = _.find(tableControls, { controlId: cell.controlId });
      if (
        updatedControl &&
        _.includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], cell.type) &&
        /{/.test(cell.value)
      ) {
        const newOption = {
          index: updatedControl.options.length + 1,
          isDeleted: false,
          key: _.last(JSON.parse(updatedRow[cell.controlId])),
          ...JSON.parse(_.last(JSON.parse(cell.value))),
        };
        setTableControls(old =>
          old.map(c => (c.controlId === cell.controlId ? { ...c, options: [...c.options, newOption] } : c)),
        );
      }
      tableActions.updateRecord({ ...updatedRow, allowedit: true, allowdelete: true }, true);
    });
  }
  return (
    <React.Fragment>
      {control.desc && <Desc>{control.desc}</Desc>}
      <Con
        className="tableOperate flexRow alignItemsCenter"
        padding="10px 0px"
        style={{
          ...(isSplit && { padding: '10px 24px' }),
        }}
      >
        {(addVisible || selectVisible || allowBatchEdit) && (
          <RelateRecordBtn
            btnVisible={{
              enterBatchEdit: allowBatchEdit,
              removeRelation: allowRemoveRelation,
              deleteRecords: allowDeleteFromSetting,
              exportRecords:
                allowExportFromSetting &&
                !!recordId &&
                from !== RECORD_INFO_FROM.DRAFT &&
                control.recordInfoFrom !== RECORD_INFO_FROM.WORKFLOW,
            }}
            isBatchEditing={isBatchEditing}
            entityName={worksheetOfControl.entityName || control.sourceEntityName || ''}
            addVisible={addVisible}
            selectVisible={selectVisible}
            selectedRowIds={selectedRowIds}
            onNew={() => {
              addRecord({
                worksheetId: control.dataSource,
                masterRecord: {
                  rowId: recordId,
                  controlId: control.controlId,
                  worksheetId,
                },
                defaultRelatedSheet: control.type !== 51 && {
                  worksheetId,
                  relateSheetControlId: control.controlId,
                  value: defaultRelatedSheetValue,
                },
                directAdd: true,
                showFillNext: true,
                onAdd: record => {
                  if (record) {
                    setRelateNumOfControl(count + 1);
                    tableActions.addRecords(record);
                  }
                },
                openRecord: id => setActiveRecord({ id }),
              });
            }}
            onSelect={() => {
              selectRecord({
                canSelectAll: true,
                multiple: true,
                control,
                allowNewRecord: false,
                viewId: control.viewId,
                parentWorksheetId: worksheetId,
                controlId: control.controlId,
                recordId,
                relateSheetId: worksheetOfControl.worksheetId,
                filterRowIds: [recordId].concat(recordId && from !== 21 ? [] : records.map(r => r.rowid)),
                onOk: async selectedRecords => {
                  try {
                    if (!isNewRecord && (from !== RECORD_INFO_FROM.DRAFT || recordId)) {
                      await updateRelateRecords({
                        ..._.omit(recordbase, 'appId'),
                        controlId: control.controlId,
                        isAdd: true,
                        recordIds: selectedRecords.map(c => c.rowid),
                        updateType: from,
                      });
                    }
                    tableActions.addRecords(selectedRecords);
                    setRelateNumOfControl(count + selectedRecords.length);
                    if (recordId) {
                      alert(_l('添加记录成功！'));
                    }
                  } catch (err) {
                    alert(_l('添加记录失败！'), 2);
                  }
                },
                formData: formdata,
              });
            }}
            onBatchOperate={({ action }) => {
              let allowDeleteRowIds;
              switch (action) {
                case 'enterBatchEditing':
                  cache.current.lastSelectRowIndex = undefined;
                  setState({
                    isBatchEditing: true,
                  });
                  break;
                case 'exitBatchEditing':
                  setState({
                    isBatchEditing: false,
                    selectedRowIds: [],
                  });
                  break;
                case 'removeRelation':
                  // 批量取消关联
                  deleteRelateRow(selectedRowIds, false, {
                    cb: () => {
                      setState({
                        selectedRowIds: [],
                        isBatchEditing: !allIsSelected,
                      });
                      if (count > pageSize) {
                        reloadTable();
                      }
                    },
                  });
                  break;
                case 'deleteRecords':
                  allowDeleteRowIds = selectedRowIds.filter(rowId => {
                    const selectedRow = _.find(records, { rowid: rowId });
                    return selectedRow && selectedRow.allowdelete;
                  });
                  if (!allowDeleteRowIds.length) {
                    alert(_l('没有有权限删除的记录'), 3);
                    return;
                  }
                  deleteRecord({
                    worksheetId: worksheetOfControl.worksheetId,
                    recordIds: allowDeleteRowIds,
                  })
                    .then(res => {
                      setRelateNumOfControl(count - allowDeleteRowIds.length);
                      tableActions.deleteRecord(allowDeleteRowIds);
                      if (allowDeleteRowIds < selectedRowIds) {
                        alert(_l('存在无权限删除的记录，有权限的已删除'), 3);
                      }
                      setState({
                        selectedRowIds: [],
                        isBatchEditing: !allIsSelected,
                      });
                      if (count > pageSize) {
                        reloadTable();
                      }
                    })
                    .catch(err => {
                      alert(_l('删除失败！'), 3);
                    });
                  break;
                case 'exportRecords':
                  exportRelateRecordRecords({
                    appId: worksheetOfControl.appId,
                    worksheetId: worksheetOfControl.worksheetId,
                    downLoadUrl: worksheetOfControl.downLoadUrl,
                    viewId: control.viewId,
                    projectId: worksheetOfControl.projectId,
                    exportControlsId: tableVisibleControls.map(r => r.controlId),
                    rowIds: selectedRowIds,
                  });
                  break;
              }
            }}
          />
        )}
        <div className="flex"></div>
        {isBatchEditing && !!recordId && from !== 21 && (
          <span
            data-tip={_l('刷新')}
            style={{ height: 28 }}
            onClick={() => {
              reloadTable({ clearSelect: false });
            }}
          >
            <IconBtn className="Hand ThemeHoverColor3">
              <i className="icon icon-task-later" />
            </IconBtn>
          </span>
        )}
        {!isBatchEditing && (
          <TableBtnCon className="flexRow" style={{ lineHeight: '36px' }}>
            {!loading && !isNewRecord && (
              <Fragment>
                <Motion
                  defaultStyle={{ width: 0, opacity: 0, iconLeft: 0 }}
                  style={{
                    width: spring(searchVisible ? 180 : 0),
                    opacity: spring(searchVisible ? 1 : 0),
                    iconLeft: spring(searchVisible ? 27 : 0),
                  }}
                >
                  {value => (
                    <div className={cx('searchIcon flexRow')} onClick={() => setSearchVisible(true)}>
                      <i className="icon icon-search Gray_9e Font20 Hand" style={{ left: value.iconLeft }}></i>
                      <ClickAwayable
                        className="searchInput"
                        style={{ width: value.width, backgroundColor: `rgba(234, 234, 234, ${value.opacity})` }}
                        onClickAway={() => {
                          if (!keywords && searchVisible) {
                            setSearchVisible(false);
                          }
                        }}
                      >
                        <Input
                          manualRef={searchRef}
                          placeholder={_l('搜索') + '"' + control.controlName + '"'}
                          value={keywords}
                          onChange={setKeywords}
                          onKeyDown={e => {
                            if (e.keyCode === 13) {
                              if (control.type !== 51) {
                                setTableLoading(true);
                              }
                              setPageIndex(1);
                              setSortControl({});
                              setKeywordsForSearch(keywords);
                            }
                          }}
                        />
                        {keywords && (
                          <i
                            className="icon icon-cancel Gray_9e Font16 clearKeywords"
                            onClick={() => {
                              setTableLoading(true);
                              setSearchVisible(false);
                              setKeywords('');
                              setKeywordsForSearch('');
                            }}
                          ></i>
                        )}
                      </ClickAwayable>
                    </div>
                  )}
                </Motion>
                {control.type !== 51 &&
                  from !== RECORD_INFO_FROM.DRAFT &&
                  allowExportFromSetting &&
                  recordId &&
                  !_.get(window, 'shareState.shareId') && (
                    <ExportSheetButton
                      style={{
                        height: 28,
                        marginRight: 6,
                      }}
                      exportSheet={cb => {
                        exportRelateRecordRecords({
                          worksheetId,
                          rowId: recordId,
                          controlId: control.controlId,
                          fileName:
                            `${((_.last([...document.querySelectorAll('.recordTitle')]) || {}).innerText || '').slice(
                              0,
                              200,
                            )} ${control.controlName}${moment().format('YYYYMMDD HHmmss')}`.trim() + '.xlsx',
                          onDownload: cb,
                        });
                      }}
                    />
                  )}
                {mode === 'recordForm' && from !== RECORD_INFO_FROM.DRAFT && (
                  <span
                    data-tip={_l('放大')}
                    style={{ height: 28 }}
                    onClick={() =>
                      openRelateRelateRecordTable({
                        title: recordbase.recordTitle,
                        appId: recordbase.appId,
                        viewId: recordbase.viewId,
                        worksheetId,
                        recordId,
                        control,
                        allowEdit,
                        formdata,
                        reloadTable,
                      })
                    }
                  >
                    <IconBtn className="Hand ThemeHoverColor3">
                      <i className="icon icon-worksheet_enlarge" />
                    </IconBtn>
                  </span>
                )}
              </Fragment>
            )}
            {(!isNewRecord || control.type === 51) && !((loading || tableLoading) && count === 0) && (
              <Pagination
                disabled={loading || tableLoading}
                className="pagination"
                pageIndex={pageIndex}
                pageSize={pageSize}
                allCount={
                  control.type === 51 && !_.isUndefined(searchMaxCount) && count > searchMaxCount
                    ? searchMaxCount
                    : count
                }
                allowChangePageSize={false}
                changePageIndex={value => {
                  setTableLoading(true);
                  setPageIndex(value);
                }}
                onPrev={() => {
                  setTableLoading(true);
                  setPageIndex(pageIndex - 1 < 0 ? 0 : pageIndex - 1);
                }}
                onNext={() => {
                  setTableLoading(true);
                  setPageIndex(
                    pageIndex + 1 > Math.ceil(count / pageSize) ? Math.ceil(count / pageSize) : pageIndex + 1,
                  );
                }}
              />
            )}
          </TableBtnCon>
        )}
      </Con>
      <TableCon
        className={cx('tableCon', { flex: isSplit })}
        style={{
          ...(isSplit && { overflow: 'auto', padding: '0 24px' }),
        }}
        ref={conRef}
      >
        {loading && (
          <div style={{ padding: 10, height: 374 }}>
            <Skeleton
              style={{ flex: 1 }}
              direction="column"
              widths={['30%', '40%', '90%', '60%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
          </div>
        )}
        {!loading && (
          <div className="relateRecordTable" style={{ minHeight: 374 }}>
            <WorksheetTable
              scrollBarHoverShow
              isRelateRecordList
              disablePanVertical
              showAsZebra={showAsZebra}
              tableType={isClassicTable ? 'classic' : 'simple'}
              ref={worksheetTableRef}
              loading={tableLoading}
              fromModule={WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD}
              fixedColumnCount={fixedColumnCount}
              rowCount={!useHeight ? rowCount : undefined}
              defaultScrollLeft={defaultScrollLeft}
              allowlink={allowlink}
              viewId={control.viewId}
              sheetSwitchPermit={sheetSwitchPermit}
              lineEditable={
                allowLineEdit &&
                !control.disabled &&
                allowEdit &&
                controlPermission.editable &&
                isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, control.viewId)
              }
              noRenderEmpty
              projectId={worksheetOfControl.projectId}
              appId={worksheetOfControl.appId}
              worksheetId={worksheetOfControl.worksheetId}
              rules={worksheetOfControl.rules}
              rowHeadWidth={rowHeadWidth}
              rowHeight={ROW_HEIGHT[rowHeight] || 34}
              controls={tableControls}
              data={isNewRecord ? records : records.slice(0, pageSize)}
              columns={tableVisibleControls}
              sheetColumnWidths={{ ...columnWidthsOfSetting, ...sheetColumnWidths }}
              sheetViewHighlightRows={highlightRows}
              renderRowHead={({ className, style, rowIndex, row }) => (
                <RowHead
                  isBatchEditing={isBatchEditing}
                  showQuickFromSetting={showQuickFromSetting}
                  selected={_.includes(selectedRowIds, row.rowid)}
                  allIsSelected={allIsSelected}
                  relateRecordControlId={control.controlId}
                  allowOpenRecord={allowOpenRecord}
                  className={className}
                  style={style}
                  rowIndex={rowIndex}
                  row={row}
                  layoutChangeVisible={isCharge && layoutChanged}
                  allowRemoveRelation={allowRemoveRelation}
                  tableControls={tableControls}
                  sheetSwitchPermit={sheetSwitchPermit}
                  appId={worksheetOfControl.appId}
                  viewId={control.viewId}
                  worksheetId={worksheetOfControl.worksheetId}
                  relateRecordControlPermission={controlPermission}
                  allowAdd={addVisible}
                  allowDelete={allowDeleteFromSetting}
                  allowEdit={allowEdit && control.type !== 51}
                  pageIndex={pageIndexForHead}
                  pageSize={pageSize}
                  recordId={recordId}
                  projectId={worksheetOfControl.projectId}
                  deleteRelateRow={deleteRelateRow}
                  removeRecords={rows => {
                    setRelateNumOfControl(count - rows.length);
                    tableActions.deleteRecord(rows.map(r => r.rowid));
                  }}
                  openRecord={id => setActiveRecord({ id })}
                  addRecord={(record, afterRecordId) => {
                    setHighlightRows({ [record.rowid]: true });
                    setRelateNumOfControl(count + 1);
                    tableActions.addRecords(record, afterRecordId);
                  }}
                  saveSheetLayout={() => {
                    const newControl = _.omit(control, ['relationControls']);
                    if (!_.isEmpty(sheetColumnWidths)) {
                      const newWidths = JSON.stringify(
                        tableVisibleControls.map(
                          c => ({ ...columnWidthsOfSetting, ...sheetColumnWidths }[c.controlId] || 160),
                        ),
                      );
                      newControl.advancedSetting.widths = newWidths;
                    }
                    if (!_.isUndefined(fixedColumnCount)) {
                      newControl.advancedSetting.fixedcolumncount = fixedColumnCount;
                    }
                    if (!_.isEmpty(sheetHiddenColumnIds)) {
                      newControl.showControls = newControl.showControls.filter(
                        id => !_.includes(sheetHiddenColumnIds, id),
                      );
                    }
                    // 筛选条件保存时values处理一下
                    if (_.get(newControl, 'advancedSetting.resultfilters')) {
                      const tempResultFilters = safeParse(_.get(newControl, 'advancedSetting.resultfilters'), 'array');
                      newControl.advancedSetting.resultfilters = _.isEmpty(tempResultFilters)
                        ? ''
                        : JSON.stringify(tempResultFilters.map(formatValuesOfCondition));
                    }
                    worksheetAjax
                      .editWorksheetControls({
                        worksheetId,
                        controls: [
                          { ..._.pick(newControl, ['controlId', 'advancedSetting']), editattrs: ['advancedSetting'] },
                        ],
                      })
                      .then(res => {
                        if (_.isFunction(updateWorksheetControls)) {
                          updateWorksheetControls([newControl]);
                        }
                        setLayoutChanged(false);
                      });
                  }}
                  resetSheetLayout={() => {
                    setLayoutChanged(false);
                    setSortControl(undefined);
                    setFixedColumnCount(0);
                    setSheetHiddenColumnIds([]);
                    setSheetColumnWidths({});
                  }}
                  onRecreate={() => {
                    handleRowData({
                      rowId: row.rowid,
                      worksheetId: worksheetOfControl.worksheetId,
                      columns,
                    }).then(res => {
                      const { defaultData, defcontrols } = res;
                      addRecord({
                        worksheetId: control.dataSource,
                        masterRecord: {
                          rowId: recordId,
                          controlId: control.controlId,
                          worksheetId,
                        },
                        defaultRelatedSheet: control.type !== 51 && {
                          worksheetId,
                          relateSheetControlId: control.controlId,
                          value: defaultRelatedSheetValue,
                        },
                        directAdd: true,
                        showFillNext: true,
                        defaultFormData: defaultData,
                        defaultFormDataEditable: true,
                        writeControls: defcontrols,
                        onAdd: record => {
                          if (record) {
                            setRelateNumOfControl(count + 1);
                            tableActions.addRecords(record);
                          }
                        },
                        openRecord: id => setActiveRecord({ id }),
                      });
                    });
                  }}
                  updateRows={newRow => {
                    tableActions.updateRecord(newRow);
                  }}
                  onSelect={({ action } = {}) => {
                    let isSelect, selectRowIndex, selectedRecords;
                    switch (action) {
                      case 'toggleSelectRow':
                        // const lastSelectRowIdex
                        selectRowIndex = _.findIndex(records, { rowid: row.rowid });
                        isSelect = !_.includes(selectedRowIds, row.rowid);
                        if (
                          isSelect &&
                          cache.current.shiftActive &&
                          typeof cache.current.lastSelectRowIndex !== 'undefined'
                        ) {
                          selectedRecords = records.slice(
                            Math.min(cache.current.lastSelectRowIndex, selectRowIndex),
                            Math.max(cache.current.lastSelectRowIndex, selectRowIndex) + 1,
                          );
                          setState({
                            selectedRowIds: _.uniq(selectedRowIds.concat(selectedRecords.map(r => r.rowid))),
                          });
                        } else {
                          setState({
                            selectedRowIds: isSelect
                              ? selectedRowIds.concat(row.rowid)
                              : selectedRowIds.filter(rowid => rowid !== row.rowid),
                          });
                        }
                        if (selectRowIndex >= 0) {
                          cache.current.lastSelectRowIndex = selectRowIndex;
                        }
                        break;
                      case 'selectAll':
                        setState({ selectedRowIds: records.slice(0, pageSize).map(r => r.rowid) });
                        break;
                      case 'clearSelectAll':
                        setState({ selectedRowIds: [] });
                        break;
                    }
                  }}
                />
              )}
              renderColumnHead={({ ...rest }) => {
                const { control } = rest;
                return (
                  <ColumnHead
                    {...rest}
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
                    disabled={isNewRecord || from === RECORD_INFO_FROM.DRAFT}
                    sheetHiddenColumnIds={sheetHiddenColumnIds}
                    getPopupContainer={() => conRef.current}
                    isAsc={
                      rest.control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined
                    }
                    changeSort={newIsAsc => {
                      setTableLoading(true);
                      setSortControl(
                        _.isUndefined(newIsAsc)
                          ? {}
                          : {
                              controlId: rest.control.controlId,
                              isAsc: newIsAsc,
                            },
                      );
                      try {
                        const scrollX = worksheetTableRef.current.con.querySelector(`.sheetViewTable .scroll-x`);
                        if (scrollX) {
                          setDefaultScrollLeft(scrollX.scrollLeft);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    hideColumn={controlId => {
                      setLayoutChanged(true);
                      setSheetHiddenColumnIds(_.uniqBy(sheetHiddenColumnIds.concat(controlId)));
                    }}
                    clearHiddenColumn={() => {
                      setLayoutChanged(true);
                      setSheetHiddenColumnIds([]);
                    }}
                    frozen={index => {
                      setLayoutChanged(true);
                      setFixedColumnCount(index);
                    }}
                    onShowFullValue={() => {
                      setDisableMaskDataControls({ ...disableMaskDataControls, [control.controlId]: true });
                    }}
                  />
                );
              }}
              onCellClick={(cell, row) => {
                addBehaviorLog('worksheetRecord', control.dataSource, { rowId: row.rowid }); // 埋点
                setActiveRecord({
                  id: row.rowid,
                  activeRelateTableControlIdOfRecord: cell.type === 29 ? cell.controlId : undefined,
                });
                setHighlightRows({});
              }}
              updateCell={({ cell, row }, options = {}) => {
                const dataFormat = new DataFormat({
                  data: (_.get(worksheetOfControl, 'template.controls') || tableControls)
                    .filter(c => c.advancedSetting)
                    .map(c => ({ ...c, value: (row || {})[c.controlId] || c.value })),
                  projectId: worksheetOfControl.projectId,
                  searchConfig: sheetSearchConfig,
                  rules: worksheetOfControl.rules || [],
                  onAsyncChange: changes => {
                    let needUpdateCells = [];
                    if (!_.isEmpty(changes.controlIds)) {
                      changes.controlIds.forEach(cid => {
                        needUpdateCells.push({
                          controlId: cid,
                          value: changes.value,
                        });
                      });
                    } else if (changes.controlId) {
                      if (changes.value === 'deleteRowIds: all') {
                        changes.value = '';
                      }
                      needUpdateCells.push(changes);
                    }
                    handleUpdateCell(
                      { cells: needUpdateCells, updateRecordId: row.rowid, rules: worksheetOfControl.rules },
                      options,
                    );
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
                handleUpdateCell(
                  { cell, cells: updatedCells, updateRecordId: row.rowid, rules: worksheetOfControl.rules },
                  options,
                );
              }}
              onColumnWidthChange={(controlId, value) => {
                setLayoutChanged(true);
                setSheetColumnWidths({ ...sheetColumnWidths, [controlId]: value });
              }}
            />
          </div>
        )}
        {isSplit && <div style={{ height: 48 }} />}
        {!!activeRecord && (
          <RecordInfoWrapper
            showPrevNext
            currentSheetRows={records.filter(r => r.rowid)}
            from={2}
            visible
            appId={worksheetOfControl.appId}
            viewId={_.get(control, 'advancedSetting.openview') || control.viewId}
            recordId={activeRecord && activeRecord.id}
            activeRelateTableControlId={activeRecord && activeRecord.activeRelateTableControlIdOfRecord}
            worksheetId={worksheetOfControl.worksheetId}
            // rules={worksheetOfControl.rules}
            updateRows={([rowid], newrecord) => {
              tableActions.updateRecord(newrecord);
            }}
            hideRecordInfo={() => {
              setActiveRecord(undefined);
            }}
            projectId={worksheetOfControl.projectId}
            onDeleteSuccess={() => {
              if (!control.disabled && allowEdit && controlPermission.editable) {
                deleteRelateRow(activeRecord && activeRecord.id, true);
              }
            }}
          />
        )}
      </TableCon>
    </React.Fragment>
  );
}

RelateRecordTable.propTypes = {
  isSplit: PropTypes.bool,
  loading: PropTypes.bool,
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  recordbase: PropTypes.shape({}),
  control: PropTypes.shape({}),
  relateRecordData: PropTypes.shape({}),
  setLoading: PropTypes.func,
  onRelateRecordsChange: PropTypes.func,
  addRefreshEvents: PropTypes.func,
  updateWorksheetControls: PropTypes.func,
};
