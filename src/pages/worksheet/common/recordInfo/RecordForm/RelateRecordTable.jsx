import React, { useState, useReducer, useMemo, useEffect, useRef } from 'react';
import PropTypes, { func } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Motion, spring } from 'react-motion';
import { getRowRelationRows, getSwitchPermit, editWorksheetControls, getQueryBySheetId } from 'src/api/worksheet';
import update from 'immutability-helper';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { replaceByIndex } from 'worksheet/util';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import Skeleton from 'src/router/Application/Skeleton';
import { Input } from 'ming-ui';
import { addRecord } from 'worksheet/common/newRecord';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import RecordInfoWrapper from 'worksheet/common/recordInfo/RecordInfoWrapper';
import { selectRecord } from 'src/components/recordCardListDialog';
import Pagination from 'worksheet/components/Pagination';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import ColumnHead from './RelateRecordTableColumnHead';
import RowHead from './RelateRecordTableRowHead';
import RelateRecordBtn from './RelateRecordBtn';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { getWorksheetInfo, updateRecordControl, updateRelateRecords } from '../crtl';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';

const ClickAwayable = createDecoratedComponent(withClickAway);

function tableReducer(state, action) {
  const { records } = state;
  function updateVersion() {
    if (!action.noUpdate) {
      state.tableVersion = Math.random();
    }
  }
  state.lastAction = action.type;
  switch (action.type) {
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
`,
);

const TableBtnCon = styled.div`
  align-items: center;
`;

const Desc = styled.div`
  color: #9e9e9e;
  padding: 12px 24px 0px;
  font-size: 12px;
`;

function getCellWidths(control) {
  const result = {};
  let widths = [];
  try {
    widths = JSON.parse(control.advancedSetting.widths);
  } catch (err) {}
  if (widths.length) {
    control.showControls
      .map(scid => _.find((control.relationControls || []).concat(SYSTEM_CONTROL), c => c.controlId === scid))
      .filter(c => c && controlState(c).visible)
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
    isSplit,
    formWidth,
    sideVisible,
    loading,
    formdata,
    recordbase,
    recordinfo,
    relateRecordData = {},
    control,
    addRefreshEvents = () => {},
    setRelateNumOfControl = () => {},
    setLoading = () => {},
    onRelateRecordsChange = () => {},
  } = props;
  const { worksheetId, recordId, isCharge, allowEdit } = recordbase;
  const allowlink = (control.advancedSetting || {}).allowlink;
  const columnWidthsOfSetting = getCellWidths(control);
  const [isHiddenOtherViewRecord, , onlyRelateByScanCode] = control.strDefault.split('').map(b => !!+b);
  const disabledManualWrite = onlyRelateByScanCode && control.advancedSetting.dismanual === '1';
  const searchRef = useRef();
  const conRef = useRef();
  const worksheetTableRef = useRef();
  const [{ records = [], count, tableVersion, lastAction }, dispatch] = useReducer(tableReducer, {
    records: [],
    count: 0,
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
      const data = await getSwitchPermit({ worksheetId: control.dataSource });
      setSheetSwitchPermit(data);
    } catch (err) {}
  }
  async function loadSheetSearchConfig() {
    try {
      const data = await getQueryBySheetId({ worksheetId: control.dataSource });
      setSheetSearchConfig(formatSearchConfigs(data));
    } catch (err) {}
  }
  async function loadRows({ showHideTip } = {}) {
    try {
      if (isNewRecord) {
        const worksheetInfo = await getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          getRules: true,
        });
        const newTableControls = control.showControls
          .map(scid => _.find(worksheetInfo.template.controls.concat(SYSTEM_CONTROL), c => c.controlId === scid))
          .filter(c => c && controlState(c).visible);
        setWorksheetOfControl(worksheetInfo);
        setTableControls(newTableControls);
        tableActions.updateRecords(
          relateRecordData[control.controlId] ? relateRecordData[control.controlId].value : [],
        );
        setLoading(false);
        return;
      }
      setHighlightRows({});
      if (request) {
        request.abort();
      }
      request = getRowRelationRows({
        worksheetId,
        rowId: recordId,
        controlId: control.controlId,
        pageIndex,
        keywords: keywordsForSearch,
        pageSize: PAGE_SIZE,
        getWorksheet: pageIndex === 1,
        getRules: pageIndex === 1,
        sortId: (sortControl || {}).controlId,
        isAsc: (sortControl || {}).isAsc,
      });
      const res = await request;
      const newRecords = res.data;
      const isLastPage = pageIndex === Math.ceil(res.count / PAGE_SIZE) || res.count === 0;
      let controls = tableControls.slice(0);
      if (res.worksheet) {
        const newTableControls = control.showControls
          .map(scid => _.find(res.worksheet.template.controls.concat(SYSTEM_CONTROL), c => c.controlId === scid))
          .filter(
            c =>
              c &&
              controlState({
                ...c,
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
        showHideTip &&
        !keywordsForSearch &&
        isLastPage &&
        res.count < +relateNum.current
      ) {
        newRecords.push({
          [controls[0] ? controls[0].controlId : 'tip']: {
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
      setPageIndexForHead(pageIndex);
      tableActions.updateCount(res.count);
      setLoading(false);
      setTableLoading(false);
    } catch (err) {
      console.log(err);
    }
  }
  async function deleteRelateRow(deleteRecordId, slient) {
    try {
      if (recordId) {
        await updateRelateRecords({
          ...recordbase,
          controlId: control.controlId,
          isAdd: false,
          recordIds: [deleteRecordId],
        });
        loadRows();
        if (!slient) {
          alert(_l('取消关联成功！'));
        }
      } else {
        tableActions.deleteRecord(deleteRecordId);
      }
    } catch (err) {
      alert(_l('取消关联失败！'), 2);
    }
  }
  useEffect(() => {
    if (isNewRecord) {
      loadRows({ showHideTip: true });
    }
  }, [control.controlId, _.isEmpty(relateRecordData)]);
  useEffect(() => {
    if (!isNewRecord) {
      setTableControls([]);
      setPageIndex(1);
      setPageIndexForHead(1);
      setKeywords('');
      setKeywordsForSearch('');
      setSortControl();
    }
    loadSheetSwitchPermition();
    loadSheetSearchConfig();
  }, [recordId, control.controlId]);
  useEffect(() => {
    if (!isNewRecord) {
      setLoading(true);
      loadRows({ showHideTip: true });
    }
  }, [recordId, control.controlId, pageIndex, sortControl, keywordsForSearch, refreshFlag]);
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
  useEffect(() => {
    addRefreshEvents('reloadRelateRecordsTable', () => {
      setLoading(true);
      setRefreshFlag(Math.random());
      setLayoutChanged(false);
      setSortControl(undefined);
      setFixedColumnCount(0);
      setSheetHiddenColumnIds([]);
      setSheetColumnWidths({});
    });
  }, []);
  useEffect(() => {
    if (_.includes(['ADD_RECORDS', 'DELETE_RECORDS', 'UPDATE_RECORD', 'UPDATE_COUNT'], lastAction)) {
      if (isNewRecord) {
        onRelateRecordsChange(records);
      } else {
        setRelateNumOfControl(count);
      }
    }
  }, [count, records, lastAction]);
  const columns = tableControls.length
    ? tableControls.filter(c => !_.find(sheetHiddenColumnIds, id => c.controlId === id))
    : [{ controlId: 'tip' }];
  const controlPermission = controlState(control, recordId ? 3 : 2);
  const addVisible =
    !control.disabled &&
    allowEdit &&
    controlPermission.editable &&
    !_.isEmpty(worksheetOfControl) &&
    worksheetOfControl.allowAdd &&
    control.enumDefault2 !== 1 &&
    control.enumDefault2 !== 11 &&
    !disabledManualWrite;
  const selectVisible =
    !control.disabled &&
    !_.isEmpty(worksheetOfControl) &&
    controlPermission.editable &&
    control.enumDefault2 !== 10 &&
    control.enumDefault2 !== 11 &&
    allowEdit &&
    !disabledManualWrite;
  const titleControl = formdata.filter(c => c.attribute === 1) || {};
  const defaultRelatedSheetValue = {
    name: titleControl.value,
    sid: recordId,
    type: 8,
    sourcevalue: JSON.stringify({
      ..._.assign(...formdata.map(c => ({ [c.controlId]: c.value }))),
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
  const rowCount = records.length > 3 ? records.length + 1 : 4;
  const numberWidth = String(pageIndex * PAGE_SIZE).length * 8;
  let rowHeadWidth = (numberWidth > 24 ? numberWidth : 24) + 32;
  function handleUpdateCell({ cell, cells, updateRecordId }, options = {}) {
    updateRecordControl({
      appId: worksheetOfControl.appId,
      worksheetId: worksheetOfControl.worksheetId,
      recordId: updateRecordId,
      cells,
      cell,
    }).then(updatedRow => {
      if (_.isFunction(options.updateSucessCb)) {
        options.updateSucessCb(updatedRow);
      }
      tableActions.updateRecord({ ...updatedRow, allowedit: true, allowdelete: true }, true);
    });
  }
  const tableComp = useMemo(
    () => (
      <WorksheetTable
        scrollBarHoverShow
        ref={worksheetTableRef}
        loading={tableLoading}
        fromModule={WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD}
        fixedColumnCount={fixedColumnCount}
        rowCount={rowCount}
        allowlink={allowlink}
        viewId={control.viewId}
        sheetSwitchPermit={sheetSwitchPermit}
        lineeditable={
          !control.disabled &&
          allowEdit &&
          controlPermission.editable &&
          isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, control.viewId)
        }
        noRenderEmpty
        projectId={worksheetOfControl.projectId}
        appId={worksheetOfControl.appId}
        worksheetId={worksheetOfControl.worksheetId}
        // rules={worksheetOfControl.rules}
        rowHeadWidth={rowHeadWidth}
        rowHeight={34}
        controls={tableControls}
        columns={overrideControls(columns)}
        data={isNewRecord ? records : records.slice(0, PAGE_SIZE)}
        sheetColumnWidths={{ ...columnWidthsOfSetting, ...sheetColumnWidths }}
        sheetViewHighlightRows={highlightRows}
        renderRowHead={({ className, style, rowIndex, row }) => (
          <RowHead
            className={className}
            style={style}
            rowIndex={rowIndex}
            row={row}
            layoutChangeVisible={isCharge && layoutChanged}
            allowRemoveRelation={
              typeof control.advancedSetting.allowcancel === 'undefined'
                ? true
                : control.advancedSetting.allowcancel === '1'
            }
            tableControls={tableControls}
            sheetSwitchPermit={sheetSwitchPermit}
            appId={worksheetOfControl.appId}
            viewId={control.viewId}
            worksheetId={worksheetOfControl.worksheetId}
            relateRecordControlPermission={controlPermission}
            allowAdd={addVisible}
            allowEdit={allowEdit}
            pageIndex={pageIndexForHead}
            pageSize={PAGE_SIZE}
            recordId={recordId}
            projectId={worksheetOfControl.projectId}
            deleteRelateRow={deleteRelateRow}
            removeRecords={rows => {
              tableActions.deleteRecord(rows.map(r => r.rowid));
            }}
            addReocord={(record, afterRecordId) => {
              setHighlightRows({ [record.rowid]: true });
              tableActions.addRecords(record, afterRecordId);
            }}
            saveSheetLayout={() => {
              const newControl = _.omit(control, ['relationControls']);
              if (!_.isEmpty(sheetColumnWidths)) {
                const newWidths = JSON.stringify(
                  columns.map(c => ({ ...columnWidthsOfSetting, ...sheetColumnWidths }[c.controlId] || 160)),
                );
                newControl.advancedSetting.widths = newWidths;
              }
              if (!_.isUndefined(fixedColumnCount)) {
                newControl.advancedSetting.fixedcolumncount = fixedColumnCount;
              }
              if (!_.isEmpty(sheetHiddenColumnIds)) {
                newControl.showControls = newControl.showControls.filter(id => !_.includes(sheetHiddenColumnIds, id));
              }
              editWorksheetControls({
                worksheetId,
                controls: [{ ..._.pick(newControl, ['controlId', 'advancedSetting']), editattrs: ['advancedSetting'] }],
              }).then(res => {
                setLayoutChanged(false);
              });
            }}
            resetSehetLayout={() => {
              setLayoutChanged(false);
              setSortControl(undefined);
              setFixedColumnCount(0);
              setSheetHiddenColumnIds([]);
              setSheetColumnWidths({});
            }}
          />
        )}
        renderColumnHead={({ ...rest }) => {
          return (
            <ColumnHead
              {...rest}
              disabled={isNewRecord}
              sheetHiddenColumnIds={sheetHiddenColumnIds}
              getPopupContainer={() => conRef.current}
              isAsc={rest.control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined}
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
            />
          );
        }}
        onCellClick={(cell, row) => {
          setActiveRecord({
            id: row.rowid,
            activeRelateTableControlIdOfRecord: cell.type === 29 ? cell.controlId : undefined,
          });
          setHighlightRows({});
        }}
        updateCell={({ cell, row }, options = {}) => {
          const dataFormat = new DataFormat({
            data: tableControls
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
                needUpdateCells.push(changes);
              }
              handleUpdateCell({ cells: needUpdateCells, updateRecordId: row.rowid }, options);
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
          handleUpdateCell({ cell, cells: updatedCells, updateRecordId: row.rowid }, options);
        }}
        onColumnWidthChange={(controlId, value) => {
          setLayoutChanged(true);
          setSheetColumnWidths({ ...sheetColumnWidths, [controlId]: value });
        }}
      />
    ),
    [tableVersion, tableLoading, isCharge, layoutChanged, sheetColumnWidths, sheetHiddenColumnIds, fixedColumnCount],
  );
  return (
    <React.Fragment>
      {control.desc && <Desc>{control.desc}</Desc>}
      <Con
        ref={conRef}
        className="flexRow"
        padding="10px 0px"
        style={{
          ...(recordId && { padding: '10px 24px' }),
        }}
      >
        {(addVisible || selectVisible) && (
          <RelateRecordBtn
            entityName={worksheetOfControl.entityName || control.sourceEntityName || ''}
            addVisible={addVisible}
            selectVisible={selectVisible}
            onNew={() => {
              addRecord({
                worksheetId: control.dataSource,
                masterRecord: {
                  rowId: recordId,
                  controlId: control.controlId,
                  worksheetId,
                },
                defaultRelatedSheet: {
                  worksheetId,
                  relateSheetControlId: control.controlId,
                  value: defaultRelatedSheetValue,
                },
                directAdd: true,
                showFillNext: true,
                onAdd: record => {
                  if (record) {
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
                filterRowIds: [recordId].concat(recordId ? [] : records.map(r => r.rowid)),
                onOk: async selectedRecords => {
                  try {
                    if (!isNewRecord) {
                      await updateRelateRecords({
                        ...recordbase,
                        controlId: control.controlId,
                        isAdd: true,
                        recordIds: selectedRecords.map(c => c.rowid),
                      });
                    }
                    tableActions.addRecords(selectedRecords);
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
          />
        )}
        <div className="flex"></div>
        {!loading && !isNewRecord && (
          <TableBtnCon className="flexRow" style={{ lineHeight: '36px' }}>
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
                          setTableLoading(true);
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
            <Pagination
              className="pagination"
              pageIndex={pageIndex}
              pageSize={PAGE_SIZE}
              allCount={count}
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
                  pageIndex + 1 > Math.ceil(count / PAGE_SIZE) ? Math.ceil(count / PAGE_SIZE) : pageIndex + 1,
                );
              }}
            />
          </TableBtnCon>
        )}
      </Con>
      <div
        className={cx({ flex: isSplit })}
        style={{
          ...(recordId && { padding: '0 24px' }),
          ...(isSplit && { overflow: 'auto' }),
        }}
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
            {tableComp}
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
            viewId={control.viewId}
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
              deleteRelateRow(recordId, true);
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
}

RelateRecordTable.propTypes = {
  isSplit: PropTypes.bool,
  loading: PropTypes.bool,
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  control: PropTypes.shape({}),
  relateRecordData: PropTypes.shape({}),
  setLoading: PropTypes.func,
  onRelateRecordsChange: PropTypes.func,
  addRefreshEvents: PropTypes.func,
};
