import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { FixedTable } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetApi from 'src/api/worksheet';
import DragMask from 'worksheet/common/DragMask';
import { SHEET_VIEW_HIDDEN_TYPES, WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import { useRefStore } from 'worksheet/hooks';
import useTableWidth from 'worksheet/hooks/useTableWidth';
import { emitter } from 'src/utils/common';
import { getScrollBarWidth } from 'src/utils/common';
import { getControlStyles } from 'src/utils/control';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { checkRulesErrorOfRowControl } from 'src/utils/rule';
import { Cell, NoRecords, NoSearch } from './components';
import {
  checkCellFullVisible,
  columnWidthFactory,
  getControlFieldPermissionsAfterRules,
  getRulePermissions,
  getTableHeadHeight,
  handleLifeEffect,
} from './util';
import './style.less';

const StyledFixedTable = styled(FixedTable)`
  font-size: 13px;
  user-select: text !important;
  .colorTag {
    position: absolute;
    width: 4px;
    border-radius: 3px;
    display: inline-block;
  }
  .top-right,
  .main-right,
  .bottom-right {
    .cell {
      border-left: 1px solid rgba(0, 0, 0, 0.09) !important;
    }
  }
  .cell {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.09) !important;
    border-left: none !important;
    border-top: none !important;
    padding: 7px 6px;
    overflow: hidden;
    .ghostAngle {
      display: none;
    }
    &.lastFixedColumn {
      border-right-width: 2px !important;
    }
    &:not(.showAsTextWithBg).highlight,
    &:not(.showAsTextWithBg).highlightFromProps {
      background-color: #f5fbff !important;
      .editIcon {
        background-color: #f5fbff !important;
      }
    }
    &.grayHover:not(.cellControlErrorStatus):not(.control-operates):not(.placeholder):not(.treeNode) {
      box-shadow: inset 0 0 0 1px #e0e0e0 !important;
    }
    &.focus:not(.control-10.isediting):not(.control-11.isediting) {
      box-shadow: inset 0 0 0 2px #2d7ff9 !important;
      z-index: 2;
    }
    &.treeNode {
      border-right: none !important;
    }
  }
  .row-head {
    background-color: #fafafa !important;
  }
  .readOnlyTip {
    position: absolute;
    display: none;
    border: 2px solid #2d7ff9;
    background: #fff;
    padding: 4px 5px;
    color: #bdbdbd;
    z-index: 9;
    white-space: nowrap;
    overflow: hidden;
  }
  ${({ controlStyles }) => controlStyles || ''}
  &.isChangeColumnWidth {
    * {
      user-select: none !important;
    }
  }
  &.hideVerticalLine {
    .cell:not(.lastFixedColumn) {
      border-right: none !important;
    }
    .cell.row-head-hover {
      .resizeDrag {
        &::after {
          background-color: rgba(155, 155, 155, 0.4);
        }
      }
    }
  }
  &.showAsZebra {
    .cell.oddRow {
      background-color: #fafafa;
    }
  }
  &:not(.classic) {
    .cell.hover:not(.isediting):not(.highlight):not(.highlightFromProps):not(.showAsTextWithBg):not(.rowIsEmpty) {
      background-color: #f5f5f5 !important;
    }
  }
  &.classic {
    .cell.canedit:not(.isediting):not(.focus) {
      .editIcon {
        display: none !important;
      }
    }
    .cell.canedit:not(.isediting):is(.control-2, .control-3, .control-5, .control-7, .control-6, .control-8) {
      .editIcon {
        display: none !important;
      }
    }
  }
  &:not(.classic) {
    .editIcon,
    .OperateIcon,
    .addChildBtn {
      background: #f5f5f5;
      &:hover {
        background: #ebebeb;
      }
    }
  }
`;

/**
 * 取消选择页面中选中的文字
 */
export function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    // IE
    document.selection.empty();
  }
}

function WorksheetTable(props, ref) {
  const {
    isTreeTableView,
    treeTableViewData,
    fromModule = WORKSHEETTABLE_FROM_MODULE.APP,
    showControlStyle,
    enableRules = true,
    recordColorConfig,
    showHead = true,
    // 相关 id
    view,
    appId,
    worksheetId,
    viewId,
    tableType,
    triggerClickImmediate,
    className,
    noRenderEmpty,
    masterRecord,
    loading,
    showLoadingMask,
    loadingMaskChildren,
    isSubList,
    isRelateRecordList,
    readonly,
    controls,
    projectId,
    columns,
    lineEditable,
    disableQuickEdit,
    width,
    height,
    setHeightAsRowCount,
    rowCount,
    minRowCount,
    rowHeight = 34,
    rowHeightEnum,
    showRowHead = true,
    showSearchEmpty = true,
    showEmptyForResize = true,
    disablePanVertical,
    defaultScrollLeft,
    sheetViewHighlightRows = {},
    cellErrors = {},
    clearCellError = () => {},
    expandCellAppendWidth,
    treeLayerControlId,
    fixedColumnCount = 0,
    rightFixedCount = 0,
    renderColumnHead,
    renderFooterCell,
    cellPopupContainer,
    sheetSwitchPermit,
    from,
    isTrash,
    allowlink,
    addNewRow,
    cellUniqueValidate,
    onUpdateRules = () => {},
    tableFooter,
    actions = {},
    chatButton,
    onColumnHeadHeightUpdate = () => {},
    isDraft,
  } = props;
  const { emptyIcon, emptyText, sheetIsFiltered, allowAdd, noRecordAllowAdd, showNewRecord } = props; // 空状态
  const { keyWords } = props; // 搜索
  const {
    columnStyles,
    showSummary = false,
    scrollBarHoverShow,
    showVerticalLine = true,
    showAsZebra = true,
    wrapControlName = false,
    headTitleCenter = false,
  } = props; // 显示
  const { rowHeadWidth = 70, renderRowHead, renderOperates } = props;
  const { onColumnWidthChange = () => {}, onCellClick, onFocusCell = () => {} } = props;
  const { masterFormData = () => [], masterData = () => {} } = props; // 获取子表所在记录表单数据
  const { updateCell } = props;
  const isRelateRecordTable = fromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD;
  const [state, setState] = useSetState({
    tableId: props.tableId || Math.random().toString(32).slice(2),
    rules: (enableRules || isRelateRecordTable) && props.rules && props.rules.length ? props.rules : [],
    rulesLoading: !props.rules && (enableRules || isRelateRecordTable),
    data: props.data,
    maskVisible: false,
    isChangeColumnWidth: false,
    sheetColumnWidths: props.sheetColumnWidths || {},
  });
  const {
    tableId,
    rules,
    data,
    maskVisible,
    isChangeColumnWidth,
    sheetColumnWidths,
    maskLeft = 0,
    maskMinLeft = 0,
    maskMaxLeft = 0,
    maskOnChange,
  } = state;
  const [cache, setCache] = useRefStore({});
  const [cellRefs, setCellRefs] = useRefStore({});
  const defaultRulePermissions = useMemo(
    () =>
      rules.length
        ? getRulePermissions({
            isSubList,
            columns,
            controls,
            rules: rules,
            data,
          })
        : {},
    [],
  );
  const [rulePermissions, updateRulePermissions] = useState(defaultRulePermissions);
  const [xIsScroll, setXIsScroll] = useState(false);
  const tableRef = useRef();
  window.tableRef = tableRef;
  const handleUpdateRulePermissions = useCallback(newRulePermissions => {
    updateRulePermissions(old => ({ ...(old || {}), ...newRulePermissions }));
  }, []);
  const visibleColumns = useMemo(
    () =>
      [{ type: 'rowHead', width: showRowHead ? rowHeadWidth : 10, empty: !showRowHead }]
        .concat(columns)
        .concat(showEmptyForResize && !rightFixedCount ? { type: 'emptyForResize', width: 60 } : [])
        .filter(c => !_.includes(SHEET_VIEW_HIDDEN_TYPES, c.type)),
    [columns, rowHeadWidth],
  );
  let tableRowCount = rowCount || data.length;
  if (minRowCount && tableRowCount < minRowCount) {
    tableRowCount = minRowCount;
  }
  const subListDataLength = isSubList && data.filter(r => r.rowid).length;
  const cellColumnCount = visibleColumns.filter(c => c.type !== 'emptyForResize').length;
  let tableHeight = height;
  const YIsScroll = tableRowCount * rowHeight > height - 34 - (showSummary ? 28 : 0);
  const getColumnWidth = useTableWidth({
    width: width - (YIsScroll ? getScrollBarWidth() : 0),
    visibleControls: visibleColumns,
    sheetColumnWidths,
    xIsScroll,
  });
  const columnHeadHeight = useMemo(() => {
    if (!wrapControlName) {
      return 34;
    }
    const headHeight = getTableHeadHeight(visibleColumns.map((c, i) => ({ ...c, width: getColumnWidth(i) })));
    onColumnHeadHeightUpdate(headHeight + 16);
    return headHeight + 16;
  }, [visibleColumns]);
  // 按照传入记录数计算宽度
  if (setHeightAsRowCount || !_.isUndefined(rowCount)) {
    const XIsScroll = _.sum(visibleColumns.map((a, i) => getColumnWidth(i, true) || 200)) > width;
    if (xIsScroll !== XIsScroll) {
      setXIsScroll(XIsScroll);
    }
    tableHeight = tableRowCount * rowHeight + columnHeadHeight + (XIsScroll ? getScrollBarWidth() : 0);
    if (showSummary) {
      tableHeight += 28;
    }
    if (isSubList && (_.last(data) || {}).isSubListFooter) {
      tableHeight -= rowHeight - 26;
    }
  }
  function showColumnWidthChangeMask({ columnWidth, defaultLeft, maskMinLeft, callback }) {
    setState({
      maskVisible: true,
      isChangeColumnWidth: true,
      maskLeft: defaultLeft,
      maskMinLeft: maskMinLeft || defaultLeft - (columnWidth - 10),
      maskMaxLeft: window.innerWidth,
      maskOnChange: left => {
        const newWidth = columnWidth + (left - defaultLeft);
        callback(newWidth);
        setState({
          maskVisible: false,
        });
        setTimeout(() => {
          setState({
            isChangeColumnWidth: false,
          });
          clearSelection();
        }, 100);
      },
    });
  }
  function focusCell(newIndex) {
    setCache('focusIndex', newIndex > 0 ? newIndex : undefined);
    [...tableRef.current.dom.current.querySelectorAll('.cell')].forEach(ele => {
      ele.classList.remove('focus');
      ele.classList.remove('rowHadFocus');
      const input = ele.querySelector('input');
      if (input) {
        try {
          ele.removeChild(input);
        } catch (err) {}
      }
    });
    if (newIndex === -10000) {
      return;
    }
    window.activeTableId = tableId;
    const focusElement = tableRef.current && tableRef.current.dom.current.querySelector(`.cell-${newIndex}`);
    const focusRowHeadElement = tableRef.current.dom.current.querySelector(
      `.cell-${newIndex - (newIndex % cellColumnCount)}`,
    );
    if (focusElement) {
      const checkResult = checkCellFullVisible(focusElement);
      if (!checkResult.fullvisible) {
        tableRef.current.setScroll(checkResult.newLeft);
      }
      focusElement.classList.add('focus');
      if (focusElement.classList.contains('focusInput')) {
        const input = document.createElement('input');
        input.className = 'body';
        input.style = 'position: absolute; left: 0px; top: -40px;';
        focusElement.appendChild(input);
        input.addEventListener('compositionend', e => {
          setTimeout(() => {
            emitter.emit('TRIGGER_TABLE_KEYDOWN_' + tableId, {
              key: e.target.value,
              isInputValue: true,
              stopPropagation: () => {},
              preventDefault: () => {},
            });
          }, 10);
        });
        input.onkeydown = e => {
          if (e.keyCode !== 229) {
            return;
          }
          e.stopPropagation();
        };
        input.focus();
      }
      focusRowHeadElement.classList.add('rowHadFocus');
    }
  }
  function handleTableKeyDown(editIndex, e) {
    if (_.isUndefined(editIndex)) {
      return;
    }
    const cell = cellRefs[editIndex];
    if (
      !e.isInputValue &&
      ((e.target && e.target.classList.contains('stopPropagation')) ||
        (e.key === 'Enter' &&
          e.target.tagName.toLowerCase() !== 'body' &&
          !e.target.classList.contains('body') &&
          !e.target.classList.contains('mdModalWrap') &&
          !e.target.classList.contains('nano-content'))) &&
      !(_.includes([26, 27], get(cell, 'props.cell.type')) && e.key !== 'Enter')
    ) {
      return;
    }
    if (cell && _.isFunction(cell.handleTableKeyDown)) {
      cell.handleTableKeyDown(e, cache);
    }
  }
  function focusRow(rowIndex) {
    const contentHeight = document.querySelector(`.sheetViewTable.id-${tableId}-id .main-center`).clientHeight;
    const contentScrollTop = document.querySelector(`.sheetViewTable.id-${tableId}-id .scroll-y`).scrollTop;
    const targetRowFullVisible =
      rowIndex * rowHeight >= contentScrollTop && (rowIndex + 1) * rowHeight < contentScrollTop + contentHeight;
    const closeToBottom = rowIndex * rowHeight - contentScrollTop > contentHeight / 2;
    if (!targetRowFullVisible) {
      tableRef.current.setScroll(0, closeToBottom ? (rowIndex + 1) * rowHeight - contentHeight : rowIndex * rowHeight);
    }
  }
  useImperativeHandle(ref, () => ({
    refs: tableRef.current,
    focusRow,
    rules,
  }));
  function loadRules() {
    worksheetApi
      .getControlRules({
        type: 1,
        worksheetId,
      })
      .then(newRules => {
        if (newRules.length) {
          onUpdateRules(newRules);
          handleUpdateRulePermissions(
            getRulePermissions({
              isSubList,
              columns,
              controls,
              rules: newRules,
              data,
            }),
          );
          setState({
            rules: newRules,
            rulesLoading: false,
          });
        } else {
          setState({
            rulesLoading: false,
          });
        }
      });
  }
  useEffect(() => {
    let tableRowCountForCache = tableRowCount;
    if (isSubList && _.find(data, r => r.isSubListFooter)) {
      tableRowCountForCache -= 1;
    }
    setCache('columnCount', cellColumnCount);
    setCache('rowCount', tableRowCountForCache);
    setCache('fixedColumnCount', fixedColumnCount);
    focusCell(-10000);
  }, [cellColumnCount, tableRowCount, fixedColumnCount, subListDataLength]);
  useEffect(() => {
    setState({ sheetColumnWidths: props.sheetColumnWidths || {} });
  }, [props.sheetColumnWidths]);
  useEffect(() => {
    // 显示列变更，列宽变更
    tableRef.current.forceUpdate();
  }, [
    tableType,
    width,
    rowHeight,
    rowHeadWidth,
    expandCellAppendWidth,
    fixedColumnCount,
    columns.map(c => c.controlId).join(','),
    JSON.stringify(sheetColumnWidths),
  ]);
  useEffect(() => {
    setCache('data', data);
    const propsData = props.data.filter(r => !r.isSubListFooter);
    const filteredData = data.filter(r => !r.isSubListFooter);
    let updatedRows = [];
    if (
      cache.prevColumns &&
      !_.isEqual(
        cache.prevColumns.map(c => c.fieldPermission),
        columns.map(c => c.fieldPermission),
      )
    ) {
      updatedRows = props.data;
    } else if (
      filterEmptyChildTableRows(propsData).length !== filterEmptyChildTableRows(filteredData).length &&
      filterEmptyChildTableRows(propsData).length > filterEmptyChildTableRows(filteredData).length
    ) {
      updatedRows = propsData.filter(row => !_.find(filteredData, r => r.rowid === row.rowid));
    } else if (
      !_.intersection(
        propsData.map(c => c.rowid),
        filteredData.map(c => c.rowid),
      ).length
    ) {
      updatedRows = propsData;
    } else {
      props.data.forEach(row => {
        const oldRow = _.find(data, r => r.rowid === row.rowid);
        if (oldRow && !_.isEqual(oldRow, row)) {
          updatedRows.push(row);
        }
      });
    }
    setState({ data: props.data });
    if (updatedRows.length && rules.length) {
      handleUpdateRulePermissions(
        getRulePermissions({
          isSubList,
          columns,
          controls,
          rules,
          data: updatedRows,
        }),
      );
    }
  }, [props.data]);
  useEffect(() => {
    setCache('prevColumns', columns);
  }, [columns]);
  useEffect(
    handleLifeEffect.bind(null, tableId, {
      cache,
      tableType,
      isSubList,
      isRelateRecordList,
      showColumnWidthChangeMask,
      focusCell,
      handleTableKeyDown,
      addNewRow,
      setScroll: (...args) => tableRef.current.setScroll(...args),
    }),
    [],
  );
  useEffect(() => {
    if (state.rulesLoading) {
      loadRules();
    }
  }, []);
  return (
    <React.Fragment>
      {maskVisible && <DragMask value={maskLeft} min={maskMinLeft} max={maskMaxLeft} onChange={maskOnChange} />}
      <StyledFixedTable
        isSubList={isSubList}
        controlStyles={showControlStyle && getControlStyles(visibleColumns)}
        disablePanVertical={disablePanVertical}
        noRenderEmpty={noRenderEmpty}
        loading={loading}
        showLoadingMask={showLoadingMask}
        loadingMaskChildren={loadingMaskChildren}
        ref={tableRef}
        className={cx(`worksheetTableComp sheetViewTable id-${tableId}-id`, className, tableType, {
          scrollBarHoverShow,
          hideVerticalLine: !showVerticalLine,
          showAsZebra,
          isChangeColumnWidth,
        })}
        width={width}
        height={tableHeight}
        hasSubListFooter={isSubList && (_.last(data) || {}).isSubListFooter}
        columnHeadHeight={columnHeadHeight} // 列头高度
        setHeightAsRowCount={setHeightAsRowCount}
        sheetColumnWidths={sheetColumnWidths}
        rowHeight={rowHeight}
        defaultScrollLeft={defaultScrollLeft}
        getColumnWidth={getColumnWidth}
        rowCount={(rowCount || data.length) > 0 ? tableRowCount : rowCount || data.length}
        columnCount={visibleColumns.length}
        leftFixedCount={fixedColumnCount + 1}
        rightFixedCount={rightFixedCount}
        Cell={Cell}
        showHead={showHead}
        showFoot={showSummary}
        tableData={{
          columnStyles,
          triggerClickImmediate,
          chatButton,
          masterRecord,
          isTreeTableView,
          treeTableViewData,
          expandCellAppendWidth,
          treeLayerControlId,
          tableId,
          isTrash,
          from,
          isDraft,
          view,
          readonly,
          allowAdd,
          allowlink,
          isSubList,
          isRelateRecordList,
          fromModule,
          appId,
          worksheetId,
          viewId,
          projectId,
          tableType,
          controls,
          visibleColumns,
          columns,
          cellColumnCount,
          rowHeight,
          rowHeightEnum,
          fixedColumnCount,
          columnHeadHeight,
          recordColorConfig,
          cellErrors,
          lineEditable: !readonly && lineEditable,
          disableQuickEdit,
          rulePermissions,
          masterData,
          masterFormData,
          sheetViewHighlightRows,
          sheetSwitchPermit,
          cache,
          rows: data,
          headTitleCenter, // 列头垂直居中
          // functions
          clearCellError,
          updateSheetColumnWidths: ({ controlId, value }) => {
            onColumnWidthChange(controlId, value);
            setState({
              sheetColumnWidths: Object.assign({}, sheetColumnWidths, { [controlId]: value }),
            });
          },
          // 获取浮层插入位置
          getPopupContainer: isFixed => {
            if (cellPopupContainer) {
              return cellPopupContainer;
            }
            return (
              document.querySelector(`.sheetViewTable.id-${tableId}-id ${isFixed ? '.main-left' : '.main-center'}`) ||
              document.body
            );
          },
          enterEditing: cellIndex => {
            if (tableType === 'classic') {
              if (cache.focusIndex !== cellIndex) {
                focusCell(cellIndex);
              }
            }
          },
          onCellClick,
          onFocusCell: ({ row, cellIndex, rowIndex, columnIndex }) => {
            onFocusCell(row, cellIndex);
            focusCell(rowIndex * cellColumnCount + columnIndex);
          },
          // 校验
          checkRulesErrorOfControl: ({ control, row, validateRealtime } = {}) => {
            return checkRulesErrorOfRowControl({
              from: 3,
              rules: rules.filter(rule => !validateRealtime || rule.hintType !== 1),
              controls,
              control,
              row,
            });
          },
          cellUniqueValidate,
          scrollTo: ({ left, top } = {}) => {
            tableRef.current.setScroll(left, top);
          },
          // 更新数据
          updateCell: ({ row, rowIndex, args, options } = {}) => {
            const { cell } = args;
            updateCell(args, {
              ...options,
              updateSuccessCb: async newRow => {
                if (rules.length && !_.isEqual(row[cell.controlId] || '', newRow[cell.controlId] || '')) {
                  handleUpdateRulePermissions(
                    getControlFieldPermissionsAfterRules(
                      newRow,
                      (isSubList ? columns : controls).map(c => ({
                        ...c,
                        fieldPermission: c.fieldPermission,
                      })),
                      rules,
                    ),
                  );
                }
              },
            });
          },
          // 挂载 ref
          registerRef: (cellRef, cellIndex) => {
            setCellRefs(cellIndex, cellRef);
          },
          renderFunctions: {
            head: renderColumnHead,
            foot: renderFooterCell,
            rowHead: renderRowHead,
            operates: renderOperates,
          },
          actions,
        }}
        // 空状态
        renderEmpty={({ style }) => {
          if (keyWords && showSearchEmpty) {
            return;
          }
          return (
            <NoRecords
              icon={emptyIcon}
              text={emptyText}
              style={style}
              sheetIsFiltered={sheetIsFiltered}
              allowAdd={allowAdd && noRecordAllowAdd}
              showNewRecord={showNewRecord}
            />
          );
        }}
        tableFooter={tableFooter}
      />
      {!data.length && showSearchEmpty && keyWords && (
        <NoSearch keyWords={keyWords} columnHeadHeight={columnHeadHeight} />
      )}
    </React.Fragment>
  );
}
export default autoSize(forwardRef(WorksheetTable));
