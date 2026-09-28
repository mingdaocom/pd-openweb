import React, { useCallback, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useClickAway } from 'react-use';
import { find, findIndex, get, includes, isArray, isEmpty, isEqual, uniq, uniqBy } from 'lodash';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape } from 'prop-types';
import styled from 'styled-components';
import { useBatchEditRecord } from 'worksheet/common/BatchEditRecord';
import { useAddRecord } from 'worksheet/common/newRecord/addRecord';
import { getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import RowHeadColumn from 'worksheet/components/BaseColumnHead/RowHeadColumn';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { SummaryCell } from 'worksheet/components/WorksheetTable/components/';
import { permitList } from 'src/utils/domain/control/formEnum';
import { SYSTEM_CONTROL } from 'src/utils/domain/control/widget';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { RECORD_INFO_FROM, ROW_HEIGHT, WORKSHEETTABLE_FROM_MODULE } from 'src/utils/domain/worksheet/constants';
import { getSheetStylesOfRelateRecordTable } from 'src/utils/domain/worksheet/helpers';
import { getRecordColorConfig } from 'src/utils/domain/worksheet/record';
import { getSheetViewRows } from 'src/utils/domain/worksheet/tree';
import { emitter } from 'src/utils/platform/browser/dom';
import { addBehaviorLog } from 'src/utils/services/project';
import * as actions from './redux/action';
import ColumnHead from './RelateRecordTableColumnHead';
import RowHead from './RelateRecordTableRowHead';
import { getVisibleControls } from './utils';

const ColumnPopupOperateCon = styled.div`
  border-radius: 4px;
  border: 1px solid var(--color-border-primary);
  background-color: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  visibility: hidden;
  .iconButton {
    line-height: 26px;
    cursor: pointer;
    padding: 0 8px;
    .icon {
      font-size: 18px;
      color: #9e9e9e;
      cursor: pointer;
      top: 2px;
      position: relative;
      &.delete {
        color: var(--color-error);
      }
    }
    &:hover {
      background-color: #f8f8f8;
    }
  }
`;

function getCellWidths(control, controls) {
  let widths = [];

  try {
    widths = safeParse(control.advancedSetting.widths);
  } catch (err) {
    console.log(err);
  }

  if (isArray(widths)) {
    const result = {};
    control.showControls
      .map(scid => find((controls || control.relationControls || []).concat(SYSTEM_CONTROL), c => c.controlId === scid))
      .filter(c => c)
      .forEach((c, i) => {
        result[c.controlId] = widths[i];
      });
    return result;
  }

  return widths;
}

function getTableConfig(control) {
  const {
    allowdelete = '1', // 允许删除
    allowedit = '1', // 允许行内编辑
    showquick = '1', // 允许快捷操作
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

function getPageRecords({ records = [], pageSize = PAGE_SIZE, pageIndex = 1, isTreeTableView } = {}) {
  if (pageIndex !== 1) {
    return records.slice(0, pageSize);
  }

  const newRecords = records.filter(record => record.isNew);
  const savedRecords = records.filter(record => !record.isNew);
  return newRecords.concat(savedRecords.slice(0, isTreeTableView ? undefined : pageSize));
}

function TableComp(props) {
  const {
    view,
    iseditting,
    tableId,
    cache,
    control,
    base = {},
    treeTableViewData = {},
    tableState = {},
    rowsSummary = { types: {}, values: {} },
    changes = {},
    controls,
    useHeight,
    appendRecords,
    deleteRecords,
    updateTableState,
    updateRecord,
    updateRecordByRecordId,
    handleOpenRecordInfo,
    handleRecreateRecord,
    updateCell,
    updateSort,
    handleRemoveRelation,
    handleSaveSheetLayout,
    batchUpdateRecords,
    changeRelateRecordSummaryType,
    updateTreeNodeExpansion = () => {},
    onUpdateCell = () => {},
    isDraft,
  } = props;
  const { open: openAddRecord, holder: addRecordHolder } = useAddRecord();
  const { open: openBatchEditRecord, holder: batchEditRecordHolder } = useBatchEditRecord();
  const { isCustomButtonFillRecord } = control || {};
  const { addedRecords = [] } = changes;
  let { records } = props;
  // records = records.filter(r => !find(addedRecords, { rowid: r.rowid }));
  const { updateWorksheetControls } = props;
  const {
    isTab,
    from,
    direction,
    initialCount,
    isTreeTableView,
    treeLayerControlId,
    isCharge,
    recordId,
    worksheetId,
    formData,
    allowEdit,
    sheetSwitchPermit,
    controlPermission,
    allowRemoveRelation,
    relateWorksheetInfo = {},
    manageView,
    addVisible,
    isHiddenOtherViewRecord,
    showNumber,
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
    originalRecords = [],
  } = tableState;
  const worksheetTableRef = useRef();
  const dataCache = useRef({});
  const columns = useMemo(() => {
    const visibleControls = getVisibleControls(control, controls, sheetHiddenColumnIds, disableMaskDataControls);

    if (isTreeTableView && visibleControls[0]) {
      const appendWidth = getTreeExpandCellWidth(treeTableViewData.maxLevel, records.length);
      dataCache.current.expandCellAppendWidth = appendWidth;
      visibleControls[0].appendWidth = appendWidth;
      visibleControls[0].hideFrozen = true;
      visibleControls[0].isTreeExpandCell = true;
    }

    return visibleControls;
  }, [controls, control, sheetHiddenColumnIds, records, treeTableViewData.maxLevel]);
  const isRelationRecord = control.type === 51;
  const columnWidthsOfSetting = useMemo(() => getCellWidths(control, controls), [control, controls]);
  // 勾选「列样式与工作表保持一致」后，继承关联工作表指定视图/数据管理视图的列样式（列宽 + 对齐方式 + 样式），
  // 此时忽略字段自身保存的列宽；拖拽列宽仅临时生效、不保存。
  const useColumnStyle = get(control, 'advancedSetting.usecolumnstyle') === '1';
  const inheritedSheetStyles = useMemo(
    () =>
      useColumnStyle
        ? getSheetStylesOfRelateRecordTable({
            control,
            viewId: control.viewId,
            worksheetInfo: relateWorksheetInfo,
            manageView,
          })
        : undefined,
    [useColumnStyle, control, relateWorksheetInfo, manageView],
  );
  const columnStyles = useColumnStyle ? get(inheritedSheetStyles, 'columnStyles') : undefined;
  const baseColumnWidths = useColumnStyle
    ? get(inheritedSheetStyles, 'sheetColumnWidths') || {}
    : columnWidthsOfSetting;
  const tableConfig = getTableConfig(control);
  const { showQuickFromSetting, allowOpenRecord, allowDeleteFromSetting } = tableConfig;
  const emptyRowCount = isTab ? 3 : 1;

  if (recordId && !base.saveSync && pageIndex === 1) {
    records = addedRecords.concat(records.filter(r => !find(addedRecords, { rowid: r.rowid })));
  }

  const isNewRecord = !recordId;
  const pageSize = tableState.pageSize || PAGE_SIZE;
  const rowHeight = Number((control.advancedSetting || {}).rowheight || 0);
  const allIsSelected = isEqual(
    uniq(selectedRowIds),
    (recordId && !base.saveSync ? getPageRecords({ records, pageIndex, pageSize, isTreeTableView }) : records).map(
      r => r.rowid,
    ),
  );
  // 序号列宽按实际会渲染的最大序号取位数：分页正常页为 pageIndex * pageSize，
  // 表格形态全量/树形展示或第 1 页拼接新增行时，实际行数会超过 pageSize，需取 (pageIndex - 1) * pageSize + records.length
  const maxRowNumber = isNewRecord
    ? records.length * 10
    : Math.max(pageIndex * pageSize, (pageIndex - 1) * pageSize + records.length);
  const numberWidth = String(maxRowNumber).length * 8;
  let rowHeadWidth =
    (numberWidth > 24 ? numberWidth : 24) + 32 + (tableConfig.tableType === 'classic' && allowOpenRecord ? 34 : 0);
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
              color: 'var(--color-text-tertiary)',
            },
          },
        });
      } else {
        return oldRecords;
      }
    },
    [control.controlId],
  );
  let tableData = recordId ? addHiddenTip(getPageRecords({ records, pageIndex, pageSize, isTreeTableView })) : records;
  let rowCount = records.length > emptyRowCount ? records.length : emptyRowCount;

  if (isTreeTableView) {
    tableData = getSheetViewRows({ rows: records }, { treeMap: treeTableViewData.treeMap });
    rowCount = tableData.length > emptyRowCount ? tableData.length : emptyRowCount;
  }

  if (recordId && base.saveSync && rowCount > pageSize && !isTreeTableView) {
    rowCount = pageSize;
  }

  const renderRowHead = ({ className, style, rowIndex, row, isColumnPopup = false }) => {
    const isSavedRecord = !!find(originalRecords, { rowid: row.rowid });
    const canRemoveRelation = allowRemoveRelation || !isSavedRecord;
    return (
      <RowHead
        tableId={tableId}
        isColumnPopup={isColumnPopup}
        showNumber={showNumber && !isTreeTableView}
        tableType={tableConfig.tableType}
        isBatchEditing={isBatchEditing}
        showQuickFromSetting={showQuickFromSetting}
        selected={includes(selectedRowIds, row.rowid)}
        allIsSelected={allIsSelected}
        relateRecordControlId={control.controlId}
        allowOpenRecord={allowOpenRecord}
        view={view}
        className={className}
        style={style}
        rowIndex={rowIndex}
        row={row}
        layoutChangeVisible={isCharge && layoutChanged}
        isCharge={isCharge}
        allowRemoveRelation={canRemoveRelation}
        tableControls={controls}
        sheetSwitchPermit={sheetSwitchPermit}
        appId={relateWorksheetInfo.appId}
        viewId={control.viewId}
        worksheetId={relateWorksheetInfo.worksheetId}
        printCountEnabled={get(relateWorksheetInfo, 'advancedSetting.print_count_enabled') === '1'}
        relateRecordControlPermission={controlPermission}
        allowAdd={addVisible}
        allowDelete={allowDeleteFromSetting}
        allowEdit={allowEdit && control.type !== 51 && !control.disabled}
        pageIndex={pageIndex}
        pageSize={pageSize}
        recordId={recordId}
        projectId={relateWorksheetInfo.projectId}
        deleteRelateRow={handleRemoveRelation}
        isDraft={isDraft}
        from={from}
        removeRecords={rows => {
          deleteRecords(rows.map(r => r.rowid));
        }}
        openRecord={id => handleOpenRecordInfo({ recordId: id })}
        addRecord={(record, afterRecordId) => {
          updateTableState({
            highlightRows: { [record.rowid]: true },
          });
          appendRecords([{ ...record, pid: row.pid }], { afterRecordId });
        }}
        saveSheetLayout={() => {
          handleSaveSheetLayout({
            updateWorksheetControls,
            columns,
            columnWidthsOfSetting,
            skipWidths: useColumnStyle,
          });
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
            openAddRecord,
            isDraft,
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
                  ? getPageRecords({ records, pageIndex, pageSize, isTreeTableView })
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
    );
  };

  useClickAway({ current: get(worksheetTableRef, 'current.con') }, e => {
    if (window.activeTableId === tableId && !e.target.closest(`.sheetViewTable.id-${tableId}-id`)) {
      window.activeTableId = undefined;
    }
  });
  if (isEmpty(columns)) {
    return <div className="TxtCenter textTertiary mAll30">{_l('没有可见字段')}</div>;
  }

  const showSummary =
    direction !== 'vertical' &&
    String(get(control, 'advancedSetting.openstatistics')) === '1' &&
    !isTreeTableView &&
    !!recordId &&
    records.length > 0;

  const renderFooterCell = ({ columnIndex, className, style }) => {
    const summaryControl = [{ type: 'summaryhead' }].concat(columns)[columnIndex];
    return (
      <SummaryCell
        className={className}
        style={style}
        control={summaryControl}
        summaryType={summaryControl && rowsSummary.types[summaryControl.controlId]}
        summaryValue={summaryControl && rowsSummary.values[summaryControl.controlId]}
        rows={records}
        selectedIds={selectedRowIds}
        changeWorksheetSheetViewSummaryType={({ controlId, value }) =>
          changeRelateRecordSummaryType({ controlId, value })
        }
      />
    );
  };

  return (
    <React.Fragment>
      {addRecordHolder}
      {batchEditRecordHolder}
      <WorksheetTable
        showControlStyle
        isDraft={isDraft}
        isTreeTableView={isTreeTableView}
        treeLayerControlId={treeLayerControlId}
        treeTableViewData={treeTableViewData}
        expandCellAppendWidth={dataCache.current.expandCellAppendWidth}
        tableId={tableId}
        scrollBarHoverShow
        isRelateRecordList
        wrapControlName={get(control, 'advancedSetting.titlewrap') === '1'}
        headTitleCenter={get(control, 'advancedSetting.rctitlestyle') === '1'}
        direction={direction}
        recordColorConfig={view ? getRecordColorConfig(view) : undefined}
        disablePanVertical
        showSummary={showSummary}
        renderFooterCell={showSummary ? renderFooterCell : undefined}
        {...tableConfig}
        ref={worksheetTableRef}
        loading={tableLoading}
        fromModule={WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD}
        fixedColumnCount={fixedColumnCount}
        masterData={() => ({
          controlId: control.controlId,
          recordId,
          worksheetId,
          formData,
        })}
        masterRecord={
          base.saveSync
            ? {
                rowId: recordId,
                controlId: control.controlId,
                worksheetId,
              }
            : undefined
        }
        rowCount={!useHeight ? rowCount : undefined}
        defaultScrollLeft={defaultScrollLeft}
        allowlink={get(control, 'advancedSetting.allowlink')}
        viewId={control.viewId}
        sheetSwitchPermit={sheetSwitchPermit}
        lineEditable={
          (tableConfig.allowLineEdit || control.type === 51) &&
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
        data={tableData}
        allowAdd={addVisible}
        columns={columns}
        columnStyles={columnStyles}
        sheetColumnWidths={{ ...baseColumnWidths, ...sheetColumnWidths }}
        sheetViewHighlightRows={highlightRows}
        renderRowHead={renderRowHead}
        renderColumnHead={({ ...rest }) => {
          const { control } = rest;

          if (direction === 'vertical') {
            return <RowHeadColumn columnIndex={rest.rowIndex} control={control} showNumber={showNumber} {...rest} />;
          }

          return (
            <ColumnHead
              {...rest}
              iseditting={iseditting}
              hideFilter={isTreeTableView}
              isCustomButtonFillRecord={isCustomButtonFillRecord}
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
              visibleControls={columns}
              isRelationRecord={isRelationRecord}
              disabled={isNewRecord || from === RECORD_INFO_FROM.DRAFT}
              isNewRecord={isNewRecord}
              sheetHiddenColumnIds={sheetHiddenColumnIds}
              tableId={tableId}
              selectedRowIds={selectedRowIds}
              isAsc={rest.control.controlId === (sortControl || {}).controlId ? (sortControl || {}).isAsc : undefined}
              isDraft={isDraft}
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
                addBehaviorLog('worksheetBatchDecode', _.get(props, 'control.dataSource'), {
                  controlId: control.controlId,
                });
                updateTableState({
                  disableMaskDataControls: { ...disableMaskDataControls, [control.controlId]: true },
                });
              }}
              handleBatchUpdateRecords={activeControl => {
                batchUpdateRecords({ selectedRowIds, records, activeControl, openBatchEditRecord });
              }}
            />
          );
        }}
        onCellClick={(cell, row) => {
          addBehaviorLog('worksheetRecord', _.get(props, 'control.dataSource'), { rowId: row.rowid }); // 埋点
          handleOpenRecordInfo({
            recordId: row.rowid,
            activeRelateTableControlIdOfRecord: cell.type === 29 ? cell.controlId : undefined,
          });
          updateTableState({
            highlightRows: {},
          });
        }}
        updateCell={(args, options = {}) => {
          updateCell(args, {
            ...options,
            updateSuccessCb: (...cbArgs) => {
              onUpdateCell();
              if (_.isFunction(options.updateSuccessCb)) {
                options.updateSuccessCb(...cbArgs);
              }
            },
          });
        }}
        onColumnWidthChange={(controlId, value) => {
          updateTableState({
            // 继承列样式时，拖拽列宽仅临时生效，不进入可保存的布局变更
            ...(useColumnStyle ? {} : { layoutChanged: true }),
            sheetColumnWidths: { ...sheetColumnWidths, [controlId]: value },
          });
        }}
        actions={{
          updateTreeNodeExpansion,
          onTreeAddRecord: (parentRow, record) => {
            const newRecord = { ...record, pid: parentRow.rowid };
            appendRecords([newRecord]);
            updateTreeNodeExpansion(parentRow, {
              forceUpdate: true,
              getNewRows: () => Promise.resolve([newRecord]),
              updateRows: ([recordId], changes) => {
                updateRecordByRecordId(recordId, changes);
              },
            });
          },
        }}
        renderCompInMainCenter={() => {
          return (
            <ColumnPopupOperateCon>
              <span className="iconButton">
                <i className="icon icon-worksheet_enlarge"></i>
              </span>
            </ColumnPopupOperateCon>
          );
        }}
        cellProps={{
          renderColumnPopupContent: args =>
            renderRowHead({
              ...args,
              isColumnPopup: true,
            }),
        }}
        onHoverColumnChange={columnIndex => {
          console.log('onHoverColumnChange', columnIndex);
          if (typeof columnIndex === 'undefined') {
            emitter.emit('TRIGGER_CELL_POPUP_OPERATE_VISIBLE_' + tableId, { visible: false });
          } else {
            emitter.emit('TRIGGER_CELL_POPUP_OPERATE_VISIBLE_' + tableId, {
              newHoverColumnIndex: columnIndex,
              visible: true,
            });
          }
        }}
      />
    </React.Fragment>
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
    updateRecordByRecordId: bindActionCreators(actions.updateRecordByRecordId, dispatch),
    deleteRecords: bindActionCreators(actions.deleteRecords, dispatch),
    handleRecreateRecord: bindActionCreators(actions.handleRecreateRecord, dispatch),
    batchUpdateRecords: bindActionCreators(actions.batchUpdateRecords, dispatch),
    updateCell: bindActionCreators(actions.updateCell, dispatch),
    updateSort: bindActionCreators(actions.updateSort, dispatch),
    handleRemoveRelation: bindActionCreators(actions.handleRemoveRelation, dispatch),
    handleSaveSheetLayout: bindActionCreators(actions.handleSaveSheetLayout, dispatch),
    updateTreeNodeExpansion: bindActionCreators(actions.updateTreeNodeExpansion, dispatch),
    changeRelateRecordSummaryType: bindActionCreators(actions.changeRelateRecordSummaryType, dispatch),
  }),
)(TableComp);
