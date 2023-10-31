import React, { useCallback, useRef, useMemo, useImperativeHandle, forwardRef, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import cx from 'classnames';
import { FixedTable } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { useSetState } from 'react-use';
import { useRefStore } from 'worksheet/hooks';
import DragMask from 'worksheet/common/DragMask';
import { generate } from '@ant-design/colors';
import store from 'redux/configureStore';
import worksheetApi from 'src/api/worksheet';
import {
  emitter,
  controlIsNumber,
  checkRulesErrorOfRowControl,
  getScrollBarWidth,
  checkCellIsEmpty,
  getRecordColor,
  filterEmptyChildTableRows,
} from 'worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { ROW_HEIGHT, WORKSHEETTABLE_FROM_MODULE, SHEET_VIEW_HIDDEN_TYPES } from 'worksheet/constants/enum';
import {
  handleLifeEffect,
  columnWidthFactory,
  getControlFieldPermissionsAfterRules,
  getRulePermissions,
  getTableHeadHeight,
} from './util';
import { MDCell, NoSearch, NoRecords } from './components';
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
    &.highlight,
    &.highlightFromProps {
      background-color: #f5fbff !important;
      .editIcon {
        background-color: #f5fbff !important;
      }
    }
    &.grayHover:not(.cellControlErrorStatus):not(.placeholder) {
      box-shadow: inset 0 0 0 1px #e0e0e0 !important;
    }
    &.focus:not(.cellControlErrorStatus):not(.control-10.isediting):not(.control-11.isediting) {
      box-shadow: inset 0 0 0 2px #2d7ff9 !important;
      z-index: 2;
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
  &.hideVerticalLine {
    .cell:not(.lastFixedColumn) {
      border-right: none !important;
    }
  }
  &.showAsZebra {
    .cell.oddRow {
      background-color: #fafafa;
    }
  }
  &:not(.classic) {
    .cell.hover:not(.isediting):not(.highlight):not(.highlightFromProps) {
      background-color: #fafafa !important;
      .editIcon {
        background-color: #fafafa !important;
      }
    }
  }
  &.classic {
    .cell.canedit:not(.isediting):not(.focus) {
      .editIcon {
        display: none !important;
      }
    }
    .cell.canedit:not(.isediting):is(
        .control-2,
        .control-3,
        .control-5,
        .control-7,
        .control-6,
        .control-8
      ) {
      .editIcon {
        display: none !important;
      }
  }
`;

function WorksheetTable(props, ref) {
  const {
    fromModule = WORKSHEETTABLE_FROM_MODULE.APP,
    enableRules = true,
    recordColorConfig,
    // 相关 id
    appId,
    worksheetId,
    viewId,
    tableType,
    className,
    noRenderEmpty,
    loading,
    isSubList,
    readonly,
    controls,
    projectId,
    columns,
    lineEditable,
    width,
    height,
    setHeightAsRowCount,
    rowCount,
    rowHeight,
    rowHeightEnum,
    showRowHead = true,
    showSearchEmpty = true,
    defaultScrollLeft,
    sheetViewHighlightRows = {},
    cellErrors = {},
    clearCellError = () => {},
    fixedColumnCount = 0,
    renderColumnHead,
    renderFooterCell,
    cellPopupContainer,
    sheetSwitchPermit,
    from,
    isTrash,
    allowlink,
    addNewRow,
    cellUniqueValidate,
  } = props;
  const { emptyIcon, emptyText, sheetIsFiltered, allowAdd, noRecordAllowAdd, showNewRecord } = props; // 空状态
  const { keyWords } = props; // 搜索
  const {
    showSummary = false,
    scrollBarHoverShow,
    showVerticalLine = true,
    showAsZebra = true,
    wrapControlName = false,
  } = props; // 显示
  const { rowHeadWidth = 70, renderRowHead } = props;
  const { onColumnWidthChange = () => {}, onCellClick, onFocusCell = () => {} } = props;
  const { masterFormData = () => [], masterData = () => {}, getRowsCache } = props; // 获取子表所在记录表单数据
  const { updateCell } = props;
  const isRelateRecordTable = fromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD;
  const [state, setState] = useSetState({
    tableId: props.tableId || Math.random().toString(32).slice(2),
    rules: (enableRules || isRelateRecordTable) && props.rules && props.rules.length ? props.rules : [],
    rulesLoading: !props.rules && (enableRules || isRelateRecordTable),
    data: props.data,
    maskVisible: false,
    sheetColumnWidths: props.sheetColumnWidths || {},
  });
  const {
    tableId,
    rules,
    data,
    maskVisible,
    sheetColumnWidths,
    maskLeft = 0,
    maskMinLeft = 0,
    maskMaxLeft = 0,
    maskOnChange,
  } = state;
  const [cachedRows, updateCachedRow] = useRefStore({});
  const [cache, setCache] = useRefStore({});
  const [cellRefs, setCellRefs] = useRefStore({});
  const [rulePermissions, updateRulePermissions] = useRefStore(
    rules.length
      ? getRulePermissions({
          isSubList,
          columns,
          controls,
          rules: rules,
          data,
        })
      : {},
  );
  const tableRef = useRef();
  window.tableRef = tableRef;
  const visibleColumns = useMemo(
    () =>
      (showRowHead ? [{ type: 'rowHead', width: rowHeadWidth }] : [])
        .concat(columns)
        .concat({ type: 'emptyForResize', width: 60 })
        .filter(c => !_.includes(SHEET_VIEW_HIDDEN_TYPES, c.type)),
    [columns, rowHeadWidth],
  );
  const tableRowCount = rowCount || data.length;
  const subListDataLength = isSubList && data.filter(r => r.rowid).length;
  const cellColumnCount = visibleColumns.filter(c => c.type !== 'emptyForResize').length;
  let tableHeight = height;
  const getColumnWidth = useCallback(
    columnWidthFactory({
      width,
      visibleColumns,
      sheetColumnWidths,
    }),
    [width, visibleColumns, sheetColumnWidths],
  );
  const columnHeadHeight = useMemo(() => {
    if (!wrapControlName) {
      return 34;
    }
    const headHeight = getTableHeadHeight(visibleColumns.map((c, i) => ({ ...c, width: getColumnWidth(i) })));
    return headHeight + 16;
  }, [visibleColumns]);
  // 按照传入记录数计算宽度
  if (setHeightAsRowCount || !_.isUndefined(rowCount)) {
    const XIsScroll = _.sum(visibleColumns.map((a, i) => getColumnWidth(i, true) || 200)) > width;
    tableHeight = tableRowCount * rowHeight + 34 + (XIsScroll ? getScrollBarWidth() : 0);
    if (isSubList && (_.last(data) || {}).isSubListFooter) {
      tableHeight -= rowHeight - 26;
    }
  }
  function renderCell({ columnIndex, rowIndex, style, key, type }) {
    const control = { ...visibleColumns[columnIndex] };
    let row = data[rowIndex] || {};
    if (cachedRows[row.rowid]) {
      row = cachedRows[row.rowid];
    }
    if (row.isSubListFooter) {
      return <span style={{ ...style, height: 26 }} />;
    }
    control.fieldPermission = rulePermissions[`${row.rowid}-${control.controlId}`] || control.fieldPermission || '111';
    const cellIndex = rowIndex * cellColumnCount + columnIndex;
    let value;
    if (_.isFunction(getRowsCache)) {
      value = _.get(getRowsCache(), row.rowid + '.' + control.controlId) || row[control.controlId];
    } else {
      const rowCache = store.getState().sheet.sheetview.rowCache || {};
      value = rowCache[row.rowid + '-' + control.controlId] || row[control.controlId];
    }
    let className = cx(
      `control-${control.type === 30 ? control.sourceControlType || control.type : control.type}`,
      `row-${_.includes(['head', 'footer'], type) ? type : rowIndex}`,
      `col-${columnIndex}`,
      `cell-${cellIndex}`,
      'cell',
      `rowHeight-${_.findIndex(ROW_HEIGHT, h => h === rowHeight) || 0}`,
      {
        placeholder: !row.rowid,
        emptyRow: row.rowid && _.isFunction(row.rowid.startsWith) && row.rowid.startsWith('empty'),
        oddRow: rowIndex % 2 === 1,
        readonly:
          lineEditable &&
          rowIndex >= 0 &&
          columnIndex > 0 &&
          control.fieldPermission &&
          (control.fieldPermission[1] === '0' || control.fieldPermission[0] === '0'),
        fixedRow: rowIndex === 0,
        lastFixedColumn: columnIndex === fixedColumnCount,
        alignRight: controlIsNumber(control),
        focus: !_.isUndefined(cache.focusIndex) && cellIndex === cache.focusIndex,
        highlight:
          !_.isUndefined(window[`sheetTableHighlightRow${tableId}`]) &&
          window[`sheetTableHighlightRow${tableId}`] === rowIndex,
        highlightFromProps: sheetViewHighlightRows[row.rowid],
        focusShowEditIcon:
          tableType === 'classic' &&
          _.includes(
            [
              WIDGETS_TO_API_TYPE_ENUM.DATE,
              WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
              WIDGETS_TO_API_TYPE_ENUM.TIME,
              WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
              WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
              WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
              WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
              WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
              WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
              WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT,
              WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
              WIDGETS_TO_API_TYPE_ENUM.LOCATION,
              WIDGETS_TO_API_TYPE_ENUM.SIGNATURE,
              WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
              WIDGETS_TO_API_TYPE_ENUM.CASCADER,
            ],
            control.type,
          ) &&
          checkCellIsEmpty(value),
      },
    );
    const recordColor =
      recordColorConfig &&
      getRecordColor({
        controlId: recordColorConfig.controlId,
        colorItems: recordColorConfig.colorItems,
        controls,
        row,
      });
    if (recordColor && recordColorConfig.showBg && recordColor.lightColor && control.type !== 'emptyForResize') {
      style.backgroundColor = recordColor.lightColor;
    }
    if (_.includes(['head', 'footer'], type)) {
      style.height = 34;
    }
    if (state.rulesLoading) {
      return <div className={className} style={{ ...style }} />;
    }
    if (control.type === 'emptyForResize') {
      return <div style={style} />;
    }
    if (control.type === 'rowHead' && type !== 'footer') {
      if (type === 'head' && columnHeadHeight > 34) {
        style.height = columnHeadHeight;
        className += ' wrapControlName';
      }
      const rowHead = renderRowHead({
        className,
        key,
        style,
        control,
        row,
        rowIndex: type === 'head' ? -1 : rowIndex,
        data,
      });
      return recordColor && recordColorConfig.showLine ? (
        <Fragment>
          {rowHead}
          <span
            className="colorTag"
            style={{
              left: style.left + style.width - 10,
              top: style.top + 6,
              height: style.height - 12,
              zIndex: 2,
              backgroundColor: recordColor.color,
            }}
          />
        </Fragment>
      ) : (
        rowHead
      );
    }
    const error = cellErrors[`${row.rowid}-${control.controlId}`];
    if (type === 'head') {
      if (wrapControlName && columnHeadHeight > 34) {
        style.height = columnHeadHeight;
        className += ' wrapControlName';
      }
      return renderColumnHead({
        tableId,
        className,
        control,
        style,
        columnIndex,
        rowIndex,
        data,
        fixedColumnCount: fixedColumnCount + 1,
        updateSheetColumnWidths: ({ controlId, value }) => {
          onColumnWidthChange(controlId, value);
          setState({
            sheetColumnWidths: Object.assign({}, sheetColumnWidths, { [controlId]: value }),
          });
        },
      });
    } else if (type === 'footer') {
      return renderFooterCell({ style, columnIndex });
    } else {
      return (
        <MDCell
          isTrash={isTrash}
          from={from}
          allowlink={allowlink}
          isSubList={isSubList}
          fromModule={fromModule}
          appId={appId}
          worksheetId={worksheetId}
          viewId={viewId}
          tableId={tableId}
          tableType={tableType}
          fixedColumnCount={fixedColumnCount}
          lineEditable={!readonly && lineEditable}
          className={className}
          projectId={projectId}
          control={control}
          value={value}
          cache={cache}
          row={row}
          error={error}
          clearCellError={clearCellError}
          rowHeight={rowHeight}
          rowHeightEnum={rowHeightEnum}
          rowFormData={() =>
            (controls || columns)
              .map(c => ({ ...c, value: row[c.controlId] }))
              .concat(masterFormData().filter(c => c.controlId.length === 24))
          }
          masterData={masterData} // 子表字段所在记录数据 { worksheetId, formData }
          sheetSwitchPermit={sheetSwitchPermit}
          key={key}
          style={{ ...style }}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
          // 获取浮层插入位置
          getPopupContainer={isFixed => {
            if (cellPopupContainer) {
              return cellPopupContainer;
            }
            return (
              document.querySelector(`.sheetViewTable.id-${tableId}-id ${isFixed ? '.main-left' : '.main-center'}`) ||
              document.body
            );
          }}
          enterEditing={() => {
            if (tableType === 'classic') {
              if (cache.focusIndex !== cellIndex) {
                focusCell(cellIndex);
              }
            }
          }}
          // 方法
          onCellClick={onCellClick}
          onFocusCell={action => {
            onFocusCell(row, cellIndex);
            if (action === 'openRecord') {
              onCellClick();
            } else {
              focusCell(rowIndex * cellColumnCount + columnIndex);
            }
          }}
          scrollTo={({ left, top } = {}) => {
            tableRef.current.setScroll(left, top);
          }}
          // 校验
          checkRulesErrorOfControl={(control, row) => {
            return checkRulesErrorOfRowControl({ from: 3, rules, controls, control, row });
          }}
          cellUniqueValidate={cellUniqueValidate}
          // 更新数据
          updateCell={(args, options) => {
            updateCell(args, {
              ...options,
              updateTable: () => {
                tableRef.current.forceUpdate();
              },
              updateSuccessCb: async newRow => {
                if (rules.length) {
                  updateRulePermissions(
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
                updateCachedRow(row.rowid, { ...row, ..._.omit(newRow, ['allowedit', 'allowdelete']) });
                tableRef.current.updateRow(rowIndex);
              },
            });
          }}
          // 挂载 ref
          registerRef={cellRef => {
            setCellRefs(cellIndex, cellRef);
          }}
        />
      );
    }
  }
  function showColumnWidthChangeMask({ columnWidth, defaultLeft, maskMinLeft, callback }) {
    setState({
      maskVisible: true,
      maskLeft: defaultLeft,
      maskMinLeft: maskMinLeft || defaultLeft - (columnWidth - 10),
      maskMaxLeft: window.innerWidth,
      maskOnChange: left => {
        const newWidth = columnWidth + (left - defaultLeft);
        callback(newWidth);
        setState({
          maskVisible: false,
        });
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
        ele.removeChild(input);
      }
    });
    if (newIndex === -10000) {
      return;
    }
    const focusElement = tableRef.current.dom.current.querySelector(`.cell-${newIndex}`);
    if (focusElement.classList.contains('emptyRow') && cache.data[Math.floor(newIndex / cellColumnCount)]) {
      onFocusCell(cache.data[Math.floor(newIndex / cellColumnCount)], newIndex);
    }
    const focusRowHeadElement = tableRef.current.dom.current.querySelector(
      `.cell-${newIndex - (newIndex % cellColumnCount)}`,
    );
    if (focusElement) {
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
          !e.target.classList.contains('nano-content'))) &&
      !(_.includes([26, 27], cell.props.cell.type) && e.key !== 'Enter')
    ) {
      return;
    }
    if (cell && _.isFunction(cell.handleTableKeyDown)) {
      cell.handleTableKeyDown(e, cache);
    }
  }
  useImperativeHandle(ref, () => ({
    refs: tableRef.current,
    rules,
    updateSheetRow: newRow => {
      const rowIndex = _.findIndex(data, { rowid: newRow.rowid });
      if (!_.isUndefined(rowIndex)) {
        updateCachedRow(newRow.rowid, {
          ...data[rowIndex],
          ..._.omit(newRow, data[rowIndex] ? ['allowedit', 'allowdelete'] : []),
        });
        tableRef.current.updateRow(rowIndex);
      }
    },
  }));
  function loadRules() {
    worksheetApi
      .getControlRules({
        type: 1,
        worksheetId,
      })
      .then(newRules => {
        if (newRules.length) {
          updateRulePermissions(
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
    tableRef.current.forceUpdate();
  }, [showSummary, getColumnWidth, controls]);
  useEffect(() => {
    setCache('data', data);
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
      filterEmptyChildTableRows(props.data).length !== filterEmptyChildTableRows(data).length &&
      filterEmptyChildTableRows(props.data).length > filterEmptyChildTableRows(data).length
    ) {
      updatedRows = props.data.filter(row => !_.find(data, r => r.rowid === row.rowid));
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
      updateRulePermissions(
        getRulePermissions({
          isSubList,
          columns,
          controls,
          rules,
          data: updatedRows,
        }),
      );
    }
    if (updatedRows.length) {
      updatedRows.forEach(r => {
        const rowIndex = _.findIndex(data, { rowid: r.rowid });
        if (!_.isUndefined(rowIndex)) {
          updateCachedRow(r.rowid, undefined);
          tableRef.current.updateRow(rowIndex);
        }
      });
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
        noRenderEmpty={noRenderEmpty}
        loading={loading}
        ref={tableRef}
        className={cx(`worksheetTableComp sheetViewTable id-${tableId}-id`, className, tableType, {
          scrollBarHoverShow,
          hideVerticalLine: !showVerticalLine,
          showAsZebra,
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
        rowCount={tableRowCount}
        columnCount={visibleColumns.length}
        leftFixedCount={fixedColumnCount + 1}
        renderHeadCell={args => renderCell({ ...args, type: 'head' })}
        renderCell={renderCell}
        renderFooterCell={showSummary && renderFooterCell ? args => renderCell({ ...args, type: 'footer' }) : undefined}
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
      />
      {!data.length && showSearchEmpty && keyWords && <NoSearch keyWords={keyWords} />}
    </React.Fragment>
  );
}
export default autoSize(forwardRef(WorksheetTable));
