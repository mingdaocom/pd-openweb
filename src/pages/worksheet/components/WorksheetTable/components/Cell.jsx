import { every, findIndex, get, includes, isEqual, isFunction, isUndefined, pick, some } from 'lodash';
import React, { Fragment, memo, useCallback, useRef } from 'react';
import DataCell from './DataCell';
import { value } from 'jsonpath';
import cx from 'classnames';
import { ROW_HEIGHT } from 'worksheet/constants/enum';
import { checkCellIsEmpty, controlIsNumber, getRecordColor } from 'worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

/**
 * 测试：
 * row 值 默认值
 * rowFormData // 整理
 * TODO
 * getIndex
 * 键盘事件改为 数据驱动型
 */

export function getIndex({
  columnIndex,
  rowIndex,
  columnCount,
  leftFixed,
  rightFixed,
  topFixed,
  bottomFixed,
  rightFixedCount,
  leftFixedCount,
} = {}) {
  let result = {
    columnIndex: columnIndex,
    rowIndex: rowIndex,
  };

  if (leftFixed) {
    result.columnIndex = columnIndex;
  } else if (rightFixed) {
    result.columnIndex = columnCount - rightFixedCount + columnIndex;
  } else {
    result.columnIndex = leftFixedCount + columnIndex;
  }

  if (topFixed || bottomFixed) {
    result.rowIndex = undefined;
  }

  return result;
}

const MemorizedDataCell = memo(DataCell, (prevProps, nextProps) => {
  const compareKeys = [
    'lineEditable',
    'style',
    'className',
    'row.rowid',
    'error',
    'control.controlId',
    'control.value',
    'control.options',
    'control.controlPermissions',
    'control.fieldPermission',
    'control.relationControls',
    'control.advancedSetting.datamask',
  ];
  return every(compareKeys, key => isEqual(get(prevProps, key), get(nextProps, key)));
});

function getCellType(id) {
  if (id.startsWith('top')) {
    return 'head';
  } else if (id.startsWith('bottom')) {
    return 'foot';
  } else {
    return 'data';
  }
}

function Cell(props) {
  const { key, style = {}, data = {} } = props;
  const {
    grid = {},
    tableId,
    isTrash,
    from,
    allowlink,
    isSubList,
    fromModule,
    projectId,
    appId,
    worksheetId,
    viewId,
    tableType,
    cache,
    rows = [],
    controls = [],
    visibleColumns = [],
    columns = [],
    cellColumnCount,
    rowHeight,
    lineEditable,
    fixedColumnCount,
    columnHeadHeight,
    recordColorConfig,
    cellErrors,
    rowHeightEnum,
    rulePermissions,
    masterData,
    masterFormData,
    sheetSwitchPermit,
    sheetViewHighlightRows,
    registerRef,
    // functions
    updateSheetColumnWidths,
    renderFunctions,
    clearCellError,
    getPopupContainer,
    enterEditing,
    onCellClick,
    checkRulesErrorOfControl,
    onFocusCell,
    cellUniqueValidate,
    updateCell,
  } = data;
  const cellCache = useRef({});
  const { columnIndex, rowIndex } = getIndex({
    columnIndex: props.columnIndex,
    rowIndex: props.rowIndex,
    ...grid,
  });
  const cellStyle = { ...style };
  const cellIndex = rowIndex * cellColumnCount + columnIndex;
  const row = rows[rowIndex] || {};
  cellCache.current.row = row;
  const control = {
    ...(visibleColumns[columnIndex] || {}),
  };
  control.fieldPermission = rulePermissions[`${row.rowid}-${control.controlId}`] || control.fieldPermission || '111';
  if (row.isSubListFooter) {
    return <span style={{ ...cellStyle, height: 26 }} />;
  }
  if (control.type === 'emptyForResize') {
    return <div style={style} />;
  }
  const value = row[control.controlId];
  const cellType = getCellType(grid.id, control, rowIndex, columnIndex);
  let className = cx(
    `control-${control.type === 30 ? control.sourceControlType || control.type : control.type}`,
    `row-${includes(['head', 'foot'], cellType) ? cellType : rowIndex}`,
    `col-${columnIndex}`,
    `cell-${cellIndex}`,
    'cell',
    `rowHeight-${findIndex(ROW_HEIGHT, h => h === rowHeight) || 0}`,
    {
      [`control-val-${control.controlId}`]: cellType !== 'head',
      placeholder: !row.rowid,
      emptyRow: row.rowid && isFunction(row.rowid.startsWith) && row.rowid.startsWith('empty'),
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
      // focus: !_.isUndefined(cache.focusIndex) && cellIndex === cache.focusIndex,
      highlight:
        !isUndefined(window[`sheetTableHighlightRow${tableId}`]) &&
        window[`sheetTableHighlightRow${tableId}`] === rowIndex,
      highlightFromProps: sheetViewHighlightRows[row.rowid],
      focusShowEditIcon:
        tableType === 'classic' &&
        includes(
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
  if (grid.id.startsWith('bottom') || grid.id.startsWith('top')) {
    cellStyle.height = 34;
  }
  if (grid.id.startsWith('top') && columnHeadHeight > 34) {
    cellStyle.height = columnHeadHeight;
    className += ' wrapControlName';
  }
  const recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls,
      row,
    });
  if (recordColor && recordColorConfig.showBg && recordColor.lightColor && control.type !== 'emptyForResize') {
    cellStyle.backgroundColor = recordColor.lightColor;
  }
  if (isFunction(renderFunctions.rowHead) && control.type === 'rowHead' && cellType !== 'foot') {
    const rowHeadComp = renderFunctions.rowHead({
      className,
      key,
      style: cellStyle,
      rowIndex: cellType === 'head' ? -1 : rowIndex,
      control,
      row,
      data: rows,
    });
    return recordColor && recordColorConfig.showLine ? (
      <Fragment>
        {rowHeadComp}
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
      rowHeadComp
    );
  }
  if (isFunction(renderFunctions.head) && cellType === 'head') {
    return renderFunctions.head({
      className,
      fixedColumnCount: fixedColumnCount + 1,
      key,
      style: cellStyle,
      columnIndex,
      rowIndex,
      control,
      updateSheetColumnWidths,
    });
  }
  if (isFunction(renderFunctions.foot) && cellType === 'foot') {
    return renderFunctions.foot({
      style: cellStyle,
      columnIndex,
    });
  }
  const error = cellErrors[`${row.rowid}-${control.controlId}`];
  return (
    <MemorizedDataCell
      key={key}
      isTrash={isTrash}
      from={from}
      allowlink={allowlink}
      isSubList={isSubList}
      fromModule={fromModule}
      projectId={projectId}
      cache={cache}
      appId={appId}
      worksheetId={worksheetId}
      viewId={viewId}
      tableId={tableId}
      tableType={tableType}
      fixedColumnCount={fixedColumnCount}
      lineEditable={lineEditable}
      className={className}
      style={cellStyle}
      columnIndex={columnIndex}
      rowIndex={rowIndex}
      cellIndex={cellIndex}
      control={{ ...control, value }}
      row={row}
      error={error}
      rowHeight={rowHeight}
      rowHeightEnum={rowHeightEnum}
      sheetSwitchPermit={sheetSwitchPermit}
      masterData={masterData}
      // functions
      rowFormData={() =>
        (controls || columns)
          .map(c => ({ ...c, value: (cellCache.current.row || {})[c.controlId] }))
          .concat(masterFormData().filter(c => c.controlId.length === 24))
      }
      clearCellError={clearCellError}
      getPopupContainer={getPopupContainer}
      enterEditing={() => enterEditing(cellIndex)}
      onCellClick={onCellClick}
      onFocusCell={() => onFocusCell({ row, cellIndex, rowIndex, columnIndex })}
      scrollTo={scrollTo}
      checkRulesErrorOfControl={checkRulesErrorOfControl}
      cellUniqueValidate={cellUniqueValidate}
      updateCell={(args, options) => updateCell({ row, rowIndex, args, options })}
      registerRef={ref => registerRef(ref, cellIndex)}
    />
  );
}

export default Cell;
