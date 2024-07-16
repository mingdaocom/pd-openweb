import React, { useRef, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, number, shape } from 'prop-types';
import { WORKSHEETTABLE_FROM_MODULE, RECORD_INFO_FROM, ROW_HEIGHT } from 'worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { permitList } from 'src/pages/FormSet/config.js';
import { addBehaviorLog } from 'src/util';
import { useClickAway } from 'react-use';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { find, findIndex, get, identity, includes, isEmpty, isEqual, uniq, uniqBy } from 'lodash';
import * as actions from './redux/action';
import RowHead from './RelateRecordTableRowHead';
import ColumnHead from './RelateRecordTableColumnHead';
import { bindActionCreators } from 'redux';

// 业务规则
function overrideControls(control, controls) {
  return controls.map(c => {
    const resetControl = find(control.relationControls, { controlId: c.controlId });
    if (resetControl) {
      c.required = resetControl.required;
      c.fieldPermission = resetControl.fieldPermission;
    }
    return c;
  });
}

function getVisibleControls(control, controls, sheetHiddenColumnIds = [], disableMaskDataControls = {}) {
  const overriddenControls = overrideControls(control, controls)
    .filter(c => !find(sheetHiddenColumnIds, id => c.controlId === id))
    .map(c =>
      disableMaskDataControls[c.controlId]
        ? {
            ...c,
            advancedSetting: Object.assign({}, c.advancedSetting, {
              datamask: '0',
            }),
          }
        : c,
    );
  return control.showControls.map(sid => find(overriddenControls, { controlId: sid })).filter(identity);
}

function getCellWidths(control, controls) {
  const result = {};
  let widths = [];
  try {
    widths = JSON.parse(control.advancedSetting.widths);
  } catch (err) {}
  if (widths.length) {
    control.showControls
      .map(scid => find((controls || control.relationControls || []).concat(SYSTEM_CONTROL), c => c.controlId === scid))
      .filter(c => c)
      .forEach((c, i) => {
        result[c.controlId] = widths[i];
      });
  }
  return result;
}

function getTableConfig(control) {
  const {
    allowdelete = '1', // 允许删除
    allowexport = '1', // 允许导出
    allowedit = '1', // 允许行内编辑
    showquick = '1', // 允许快捷操作
    allowbatch = '0', // 允许批量操作
    alternatecolor = '1', // 交替显示行颜色
    sheettype = '0', // 表格交互方式
    allowlink, // 允许打开记录,
  } = control.advancedSetting;
  return {
    showAsZebra: alternatecolor === '1',
    allowLineEdit: allowedit === '1',
    tableType: sheettype === '1' ? 'classic' : 'simple',
    showQuickFromSetting: showquick === '1',
    allowOpenRecord: allowlink !== '0',
    allowDeleteFromSetting: allowdelete === '1',
  };
}

const PAGE_SIZE = 20;

function getPageRecords({ records = [], pageSize = PAGE_SIZE, pageIndex = 1 } = {}) {
  if (pageIndex !== 1) {
    return records.slice(0, pageSize);
  }
  const newRecords = records.filter(record => record.isNew);
  const savedRecords = records.filter(record => !record.isNew);
  return newRecords.concat(savedRecords.slice(0, pageSize));
}

function TableComp(props) {
  const {
    tableId,
    cache,
    control,
    base = {},
    tableState = {},
    changes = {},
    controls,
    useHeight,
    appendRecords,
    deleteRecords,
    updateTableState,
    updateRecord,
    handleOpenRecordInfo,
    handleRecreateRecord,
    updateCell,
    updateSort,
    handleRemoveRelation,
    handleSaveSheetLayout,
    onUpdateCell = () => {},
  } = props;
  const { addedRecords = [] } = changes;
  let { records } = props;
  const { updateWorksheetControls } = props;
  const {
    isTab,
    from,
    initialCount,
    isCharge,
    recordId,
    allowEdit,
    sheetSwitchPermit,
    controlPermission,
    allowRemoveRelation,
    relateWorksheetInfo = {},
    addVisible,
    isHiddenOtherViewRecord,
  } = base;
  const {
    tableLoading,
    pageIndex,
    count,
    keywords,
    fixedColumnCount,
    layoutChanged,
    disableMaskDataControls = {},
    sheetHiddenColumnIds = [],
    sortControl,
    defaultScrollLeft,
    highlightRows = {},
    sheetColumnWidths = {},
    selectedRowIds = [],
    isBatchEditing,
  } = tableState;
  const worksheetTableRef = useRef();
  const columns = useMemo(
    () => getVisibleControls(control, controls, sheetHiddenColumnIds, disableMaskDataControls),
    [controls, control, sheetHiddenColumnIds],
  );
  const columnWidthsOfSetting = useMemo(() => getCellWidths(control, controls), [control, controls]);
  const tableConfig = getTableConfig(control);
  const { showQuickFromSetting, allowOpenRecord, allowDeleteFromSetting } = tableConfig;
  const emptyRowCount = isTab ? 3 : 1;
  if (recordId && !base.saveSync && pageIndex === 1) {
    records = addedRecords.concat(records);
  }
  let rowCount = records.length > emptyRowCount ? records.length : emptyRowCount;
  const isNewRecord = !recordId;
  const pageSize = tableState.pageSize || PAGE_SIZE;
  const rowHeight = Number((control.advancedSetting || {}).rowheight || 0);
  const allIsSelected = isEqual(
    uniq(selectedRowIds),
    (recordId && !base.saveSync ? getPageRecords({ records, pageIndex, pageSize }) : records).map(r => r.rowid),
  );
  const numberWidth = String(isNewRecord ? records.length * 10 : pageIndex * pageSize).length * 8;
  let rowHeadWidth =
    (numberWidth > 24 ? numberWidth : 24) + 32 + (tableConfig.tableType === 'classic' && allowOpenRecord ? 34 : 0);
  if (recordId && base.saveSync && rowCount > pageSize) {
    rowCount = pageSize;
  }
  const addHiddenTip = useCallback(
    oldRecords => {
      if (
        isHiddenOtherViewRecord &&
        get(control, 'advancedSetting.showcount') !== '1' &&
        !keywords &&
        (pageIndex === Math.ceil(count / pageSize) || count === 0) &&
        control.type !== 51 &&
        count < Number(initialCount)
      ) {
        return oldRecords.concat({
          [get(controls, '0.controlId') && _.get(controls, '0.controlId') !== 'rowid'
            ? get(controls, '0.controlId')
            : 'tip']: {
            customCell: true,
            type: 'text',
            value: _l('%0条记录已隐藏', initialCount - count),
            style: {
              color: '#9e9e9e',
            },
          },
        });
      } else {
        return oldRecords;
      }
    },
    [control.controlId],
  );
  useClickAway({ current: get(worksheetTableRef, 'current.con') }, e => {
    if (window.activeTableId === tableId && !e.target.closest(`.sheetViewTable.id-${tableId}-id`)) {
      window.activeTableId = undefined;
    }
  });
  if (isEmpty(columns)) {
    return <div className="TxtCenter Gray_9e mAll30">{_l('没有可见字段')}</div>;
  }
  return (
    <WorksheetTable
      tableId={tableId}
      scrollBarHoverShow
      isRelateRecordList
      disablePanVertical
      {...tableConfig}
      ref={worksheetTableRef}
      loading={tableLoading}
      fromModule={WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD}
      fixedColumnCount={fixedColumnCount}
      rowCount={!useHeight ? rowCount : undefined}
      defaultScrollLeft={defaultScrollLeft}
      allowlink={get(control, 'advancedSetting.allowlink')}
      viewId={control.viewId}
      sheetSwitchPermit={sheetSwitchPermit}
      lineEditable={
        tableConfig.allowLineEdit &&
        !control.disabled &&
        allowEdit &&
        controlPermission.editable &&
        isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, control.viewId)
      }
      noRenderEmpty
      projectId={relateWorksheetInfo.projectId}
      appId={relateWorksheetInfo.appId}
      worksheetId={relateWorksheetInfo.worksheetId}
      rules={relateWorksheetInfo.rules}
      rowHeadWidth={rowHeadWidth}
      rowHeight={ROW_HEIGHT[rowHeight] || 34}
      controls={controls}
      data={recordId ? addHiddenTip(getPageRecords({ records, pageIndex, pageSize })) : records}
      columns={columns}
      sheetColumnWidths={{ ...columnWidthsOfSetting, ...sheetColumnWidths }}
      sheetViewHighlightRows={highlightRows}
      renderRowHead={({ className, style, rowIndex, row }) => (
        <RowHead
          tableType={tableConfig.tableType}
          isBatchEditing={isBatchEditing}
          showQuickFromSetting={showQuickFromSetting}
          selected={includes(selectedRowIds, row.rowid)}
          allIsSelected={allIsSelected}
          relateRecordControlId={control.controlId}
          allowOpenRecord={allowOpenRecord}
          className={className}
          style={style}
          rowIndex={rowIndex}
          row={row}
          layoutChangeVisible={isCharge && layoutChanged}
          allowRemoveRelation={allowRemoveRelation}
          tableControls={controls}
          sheetSwitchPermit={sheetSwitchPermit}
          appId={relateWorksheetInfo.appId}
          viewId={control.viewId}
          worksheetId={relateWorksheetInfo.worksheetId}
          relateRecordControlPermission={controlPermission}
          allowAdd={addVisible}
          allowDelete={allowDeleteFromSetting}
          allowEdit={allowEdit && control.type !== 51 && !control.disabled}
          pageIndex={pageIndex}
          pageSize={pageSize}
          recordId={recordId}
          projectId={relateWorksheetInfo.projectId}
          deleteRelateRow={handleRemoveRelation}
          removeRecords={rows => {
            deleteRecords(rows.map(r => r.rowid));
          }}
          openRecord={id => handleOpenRecordInfo({ recordId: id })}
          addRecord={(record, afterRecordId) => {
            updateTableState({
              highlightRows: { [record.rowid]: true },
            });
            appendRecords([record], { afterRecordId });
          }}
          saveSheetLayout={() => {
            handleSaveSheetLayout({ updateWorksheetControls, columns, columnWidthsOfSetting });
          }}
          resetSheetLayout={() => {
            updateTableState({
              layoutChanged: false,
              sheetHiddenColumnIds: [],
              sortControl: undefined,
              fixedColumnCount: 0,
              sheetColumnWidths: {},
            });
          }}
          onRecreate={() => {
            handleRecreateRecord(row, {
              openRecord: id => handleOpenRecordInfo({ recordId: id }),
            });
          }}
          updateRows={newRow => {
            updateRecord(newRow);
          }}
          onSelect={({ action } = {}) => {
            let isSelect, selectRowIndex, selectedRecords;
            switch (action) {
              case 'toggleSelectRow':
                selectRowIndex = findIndex(records, { rowid: row.rowid });
                isSelect = !includes(selectedRowIds, row.rowid);
                if (isSelect && cache.current.shiftActive && typeof cache.current.lastSelectRowIndex !== 'undefined') {
                  selectedRecords = records.slice(
                    Math.min(cache.current.lastSelectRowIndex, selectRowIndex),
                    Math.max(cache.current.lastSelectRowIndex, selectRowIndex) + 1,
                  );
                  updateTableState({
                    selectedRowIds: uniq(selectedRowIds.concat(selectedRecords.map(r => r.rowid))),
                  });
                } else {
                  updateTableState({
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
                updateTableState({
                  selectedRowIds: (recordId && !base.saveSync
                    ? getPageRecords({ records, pageIndex, pageSize })
                    : records
                  ).map(r => r.rowid),
                });
                break;
              case 'clearSelectAll':
                updateTableState({ selectedRowIds: [] });
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
            isAsc={rest.control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined}
            changeSort={newIsAsc => {
              let newDefaultScrollLeft;
              try {
                const scrollX = worksheetTableRef.current.con.querySelector(`.sheetViewTable .scroll-x`);
                if (scrollX) {
                  newDefaultScrollLeft = scrollX.scrollLeft;
                }
              } catch (err) {
                console.error(err);
              }
              updateSort({
                newIsAsc,
                controlId: rest.control.controlId,
                newDefaultScrollLeft,
              });
            }}
            hideColumn={controlId => {
              updateTableState({
                sheetHiddenColumnIds: uniqBy(sheetHiddenColumnIds.concat(controlId)),
              });
            }}
            clearHiddenColumn={() => {
              updateTableState({
                layoutChanged: true,
                sheetHiddenColumnIds: [],
              });
            }}
            frozen={index => {
              updateTableState({
                layoutChanged: true,
                fixedColumnCount: index,
              });
            }}
            onShowFullValue={() => {
              updateTableState({
                disableMaskDataControls: { ...disableMaskDataControls, [control.controlId]: true },
              });
            }}
          />
        );
      }}
      onCellClick={(cell, row) => {
        addBehaviorLog('worksheetRecord', control.dataSource, { rowId: row.rowid }); // 埋点
        handleOpenRecordInfo({
          recordId: row.rowid,
          activeRelateTableControlIdOfRecord: cell.type === 29 ? cell.controlId : undefined,
        });
        updateTableState({
          highlightRows: {},
        });
      }}
      updateCell={(...args) => {
        onUpdateCell();
        updateCell(...args);
      }}
      onColumnWidthChange={(controlId, value) => {
        updateTableState({
          layoutChanged: true,
          sheetColumnWidths: { ...sheetColumnWidths, [controlId]: value },
        });
      }}
    />
  );
}

TableComp.propTypes = {
  cache: shape({}),
  base: shape({}),
  tableState: shape({}),
  records: arrayOf(shape({})),
  rowHeight: number,
  useHeight: bool,
  appendRecords: func,
  deleteRecords: func,
  updateTableState: func,
  updateRecord: func,
  handleOpenRecordInfo: func,
  handleRecreateRecord: func,
  updateCell: func,
  updateSort: func,
  handleRemoveRelation: func,
  handleSaveSheetLayout: func,
  updateWorksheetControls: func,
  onUpdateCell: func,
};

export default connect(
  state => ({ ...state }),
  dispatch => ({
    updateTableState: bindActionCreators(actions.updateTableState, dispatch),
    appendRecords: bindActionCreators(actions.appendRecords, dispatch),
    updateRecord: bindActionCreators(actions.updateRecord, dispatch),
    deleteRecords: bindActionCreators(actions.deleteRecords, dispatch),
    handleRecreateRecord: bindActionCreators(actions.handleRecreateRecord, dispatch),
    updateCell: bindActionCreators(actions.updateCell, dispatch),
    updateSort: bindActionCreators(actions.updateSort, dispatch),
    handleRemoveRelation: bindActionCreators(actions.handleRemoveRelation, dispatch),
    handleSaveSheetLayout: bindActionCreators(actions.handleSaveSheetLayout, dispatch),
  }),
)(TableComp);
