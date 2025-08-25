import React, { Fragment, memo, useCallback, useRef } from 'react';
import cx from 'classnames';
import { every, find, findIndex, get, includes, isEmpty, isEqual, isFunction, isUndefined } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { getTreeExpandCellWidth } from 'worksheet/common/TreeTableHelper';
import { ROW_HEIGHT, WORKSHEET_ALLOW_SET_ALIGN_CONTROLS } from 'worksheet/constants/enum';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { checkCellIsEmpty, controlIsNumber, isRelateRecordTableControl } from 'src/utils/control';
import { getRecordColor } from 'src/utils/record';
import CollapseExpandButton from './CollapseExpandButton';
import DataCell from './DataCell';

export function getRelateRecordCountOfControlFromRow(control, row = {}) {
  try {
    const isTable = isRelateRecordTableControl(control);
    if (isTable) {
      return row['rq' + control.controlId] || row[control.controlId];
    } else {
      const records = safeParse(row[control.controlId], 'array');
      return records.length || 0;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
}

/**
 * 高性能比较 rowFormData 的 value 字段
 * @param {Array} prevRowFormData - 之前的 rowFormData 数组
 * @param {Array} nextRowFormData - 新的 rowFormData 数组
 * @returns {boolean} - 如果所有 value 都相同返回 true，否则返回 false
 */
function compareRowFormDataValues(prevRowFormData, nextRowFormData) {
  // 处理空值情况
  const prevData = prevRowFormData || [];
  const nextData = nextRowFormData || [];

  // 先比较数组长度
  if (prevData.length !== nextData.length) {
    return false;
  }

  // 逐个比较 value，有任何不同立即返回 false（短路执行）
  for (let i = 0; i < prevData.length; i++) {
    if (prevData[i]?.value !== nextData[i]?.value) {
      return false;
    }
    if (prevData[i]?.fieldPermission === nextData[i]?.fieldPermission) {
      return false;
    }
  }

  return true;
}
const CellCon = styled.div`
  .hoverShow {
    visibility: hidden;
  }
  &.hover .hoverShow {
    visibility: visible;
  }
  &.editable:hover .canedit .editIcon {
    display: inline-flex;
  }
`;

const TreeExpandCell = styled.div`
  padding: 0px;
  display: flex;
  align-items: center;
`;

const TreeExpandIcon = styled.div`
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  &:hover {
    .icon {
      color: #1677ff;
    }
    background: rgba(0, 0, 0, 0.05);
    .line {
      transition: transform 0.2s ease-in;
    }
  }
  .icon {
    color: #757575;
    &.folded {
      transform: rotate(-90deg);
    }
  }
`;

const TreeLoadingIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  .icon {
    font-size: 14px;
    color: #757575;
    animation: 2s linear infinite rotate;
  }
`;

const AddChildBtn = styled.div`
  position: absolute;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 4px;
  width: 24px;
  height: 24px;
  color: #9e9e9e;
  border-radius: 3px;
  background: #fff;
  .icon {
    font-size: 20px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

/**
 * TODO
 * getIndex
 * 键盘事件改为 数据驱动型
 */

export function getIndex({
  columnIndex,
  rowIndex,
  tableColumnCount,
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
    result.columnIndex = tableColumnCount - rightFixedCount + columnIndex;
  } else {
    result.columnIndex = leftFixedCount + columnIndex;
  }

  if (topFixed || bottomFixed) {
    result.rowIndex = undefined;
  }

  return result;
}

const MemorizedDataCell = memo(DataCell, (prevProps, nextProps) => {
  // 快速检查：如果rowid不同或控件ID不同，肯定需要更新
  if (prevProps.row?.rowid !== nextProps.row?.rowid || prevProps.control?.controlId !== nextProps.control?.controlId) {
    return false;
  }

  // 只有在row和control相同时才进行详细比较
  const compareKeys = [
    'style',
    'columnStyle',
    'lineEditable',
    'disableQuickEdit',
    'className',
    'error',
    'control.value',
    'control.options',
    'control.controlPermissions',
    'control.fieldPermission',
    'control.relationControls',
    'control.advancedSetting.datamask',
    'row.allowedit',
    'row.sys_lock',
    'row.utime', // 添加更新时间比较
  ];

  // 先比较简单属性（字符串、数字）
  const simpleKeys = [
    'lineEditable',
    'disableQuickEdit',
    'className',
    'error',
    'row.allowedit',
    'row.sys_lock',
    'row.utime',
  ];
  if (!every(simpleKeys, key => get(prevProps, key) === get(nextProps, key))) {
    return false;
  }

  // 再比较复杂属性（对象、数组）
  const complexKeys = compareKeys.filter(key => !simpleKeys.includes(key));
  if (!every(complexKeys, key => isEqual(get(prevProps, key), get(nextProps, key)))) {
    return false;
  }

  // 高性能比较 rowFormData 的 value 字段
  if (!compareRowFormDataValues(get(prevProps, 'rowFormData'), get(nextProps, 'rowFormData'))) {
    return false;
  }

  return true;
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
    tableDataWithRowFormData,
    columnStyles = {},
    treeTableViewData,
    masterRecord,
    grid = {},
    tableId,
    isTrash,
    from,
    readonly,
    allowAdd,
    allowlink,
    isSubList,
    isRelateRecordList,
    fromModule,
    projectId,
    appId,
    worksheetId,
    viewId,
    view,
    tableType,
    triggerClickImmediate,
    cache,
    rows = [],
    controls = [],
    visibleColumns = [],
    cellColumnCount,
    rowHeight,
    lineEditable,
    disableQuickEdit,
    fixedColumnCount,
    columnHeadHeight,
    recordColorConfig,
    cellErrors,
    rowHeightEnum,
    rulePermissions,
    masterData,
    sheetSwitchPermit,
    sheetViewHighlightRows,
    registerRef,
    treeLayerControlId,
    headTitleCenter,
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
    actions = {},
    getColumnWidth,
    isDraft,
  } = data;
  const cellCache = useRef({});
  const { columnIndex, rowIndex } = getIndex({
    columnIndex: props.columnIndex,
    rowIndex: props.rowIndex,
    ...grid,
  });
  const leftFixedCount = grid.leftFixedCount || 1;
  const cellStyle = { ...style };
  const cellIndex = rowIndex * cellColumnCount + columnIndex;
  const row = rows[rowIndex] || {};
  cellCache.current.row = row;

  // 缓存 getRow 函数
  const getRow = useCallback(() => {
    return row;
  }, [row]);
  const control = {
    ...(visibleColumns[columnIndex] || {}),
  };
  control.fieldPermission = rulePermissions[`${row.rowid}-${control.controlId}`] || control.fieldPermission || '111';
  const currentColumnStyle = columnStyles[control.controlId] || {};
  if (row.isSubListFooter) {
    return <span style={{ ...cellStyle, height: 26 }} />;
  }
  if (control.type === 'emptyForResize') {
    return <div style={style} />;
  }
  const value = row[control.controlId];
  const cellType = getCellType(grid.id, control, rowIndex, columnIndex);
  const needHightLight =
    !isUndefined(window[`sheetTableHighlightRow${tableId}`]) && window[`sheetTableHighlightRow${tableId}`] === rowIndex;
  let className = cx(
    `control-${control.type === 30 ? control.sourceControlType || control.type : control.type}`,
    `row-${includes(['head', 'foot'], cellType) ? cellType : rowIndex}`,
    `row-id-${row.rowid}`,
    `col-${columnIndex}`,
    `cell-${cellIndex}`,
    'cell',
    `rowHeight-${findIndex(ROW_HEIGHT, h => h === rowHeight) || 0}`,
    {
      rowIsEmpty: isEmpty(row) && cellType === 'data',
      [`control-val-${control.controlId}`]: cellType !== 'head',
      [`control-head-${control.controlId}`]: cellType === 'head',
      placeholder: !row.rowid,
      emptyRow: row.rowid && isFunction(row.rowid.startsWith) && row.rowid.startsWith('empty'),
      oddRow: rowIndex % 2 === 1,
      readonly:
        lineEditable &&
        !disableQuickEdit &&
        rowIndex >= 0 &&
        columnIndex > 0 &&
        control.fieldPermission &&
        (control.fieldPermission[1] === '0' || control.fieldPermission[0] === '0'),
      fixedRow: rowIndex === 0,
      lastFixedColumn: columnIndex === fixedColumnCount && fixedColumnCount !== 0,
      // focus: !_.isUndefined(cache.focusIndex) && cellIndex === cache.focusIndex,
      highlight: needHightLight,
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
    (() => {
      if (isUndefined(get(currentColumnStyle, 'direction'))) {
        return controlIsNumber(control) ? 'alignRight' : '';
      } else {
        if (
          cellType !== 'head' &&
          !WORKSHEET_ALLOW_SET_ALIGN_CONTROLS.includes(control.type === 30 ? control.sourceControlType : control.type)
        ) {
          return '';
        }
        return ['', 'alignCenter', 'alignRight'][get(currentColumnStyle, 'direction')];
      }
    })(),
  );
  if (grid.id.startsWith('bottom') || grid.id.startsWith('top')) {
    cellStyle.height = 34;
  }
  if (grid.id.startsWith('top') && columnHeadHeight > 34) {
    cellStyle.height = columnHeadHeight;
    className += ' wrapControlName';
    if (headTitleCenter) {
      className += ' headAlignCenter';
    }
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
  if (isFunction(renderFunctions.groupMore) && row.rowid === 'loadGroupMore') {
    return renderFunctions.groupMore({
      className,
      key,
      row,
      rowIndex,
      columnIndex,
      style: cellStyle,
      getColumnWidth,
    });
  }
  if (isFunction(renderFunctions.groupTitle) && row.rowid === 'groupTitle') {
    return renderFunctions.groupTitle({
      className,
      key,
      row,
      rowIndex,
      columnIndex,
      style: cellStyle,
      getColumnWidth,
    });
  }
  if (isFunction(renderFunctions.rowHead) && control.type === 'rowHead' && cellType !== 'foot') {
    const rowHeadComp = control.empty ? (
      <span className={className} style={cellStyle} />
    ) : (
      renderFunctions.rowHead({
        className,
        key,
        style: cellStyle,
        rowIndex: cellType === 'head' ? -1 : rowIndex,
        control,
        row,
        data: rows,
      })
    );
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
      className,
      style: cellStyle,
      columnIndex,
    });
  }
  if (!isEmpty(row) && isFunction(renderFunctions.operates) && control.type === 'operates') {
    return renderFunctions.operates({
      className,
      key,
      style: cellStyle,
      rowIndex: cellType === 'head' ? -1 : rowIndex,
      control,
      row,
      data: rows,
      onCellClick,
    });
  }
  const error = cellErrors[`${row.rowid}-${control.controlId}`];
  const cellEditable =
    !readonly && row && row.allowedit && controlState(control).editable && lineEditable && !disableQuickEdit;
  const newCellStyle = { ...cellStyle };
  let cellWidth;
  const treeNodeData = get(treeTableViewData, `treeMap.${row.key}`);
  if (control.isTreeExpandCell && treeNodeData) {
    cellWidth = getTreeExpandCellWidth(treeNodeData.index, rows.length);
    newCellStyle.width = cellStyle.width - cellWidth;
    newCellStyle.left = cellWidth;
    newCellStyle.top = 0;
  }
  const cell = (
    <MemorizedDataCell
      chatButton={data.chatButton}
      key={key}
      isTrash={isTrash}
      from={from}
      isDraft={isDraft}
      allowlink={allowlink}
      leftFixedCount={leftFixedCount}
      isSubList={isSubList}
      fromModule={fromModule}
      projectId={projectId}
      cache={cache}
      appId={appId}
      worksheetId={worksheetId}
      viewId={viewId}
      tableId={tableId}
      tableType={tableType}
      triggerClickImmediate={triggerClickImmediate}
      fixedColumnCount={fixedColumnCount}
      lineEditable={lineEditable && !disableQuickEdit}
      className={className}
      style={newCellStyle}
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
      columnStyle={currentColumnStyle}
      // functions
      rowFormData={tableDataWithRowFormData[rowIndex]}
      getRow={getRow}
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
  if (control.isTreeExpandCell && treeNodeData) {
    const targetControlId = treeLayerControlId || _.get(view, 'viewControl');
    const addParentControl = find(controls, c => c.controlId === targetControlId);
    const addChildControl = find(controls, c => c.sourceControlId === targetControlId);
    const treeStyle = get(view, 'advancedSetting.treestyle') || '1';
    const expandShowAsPlus = treeStyle === '2';
    const addSubRecordVisible =
      addParentControl &&
      allowAdd &&
      lineEditable &&
      controlState({
        ...addParentControl,
        ...(isSubList
          ? {
              fieldPermission: addParentControl.originalFieldPermission || addParentControl.fieldPermission,
            }
          : {}),
      }).editable;
    return (
      <CellCon
        className={cx('expandCell', `row-${includes(['head', 'foot'], cellType) ? cellType : rowIndex}`, {
          editable: lineEditable && !disableQuickEdit && cellEditable,
        })}
        style={{ ...cellStyle }}
      >
        <TreeExpandCell
          className={cx(
            `cell row-${includes(['head', 'foot'], cellType) ? cellType : rowIndex} row-id-${row.rowid} treeNode`,
            {
              oddRow: rowIndex % 2 === 1,
              highlightFromProps: sheetViewHighlightRows[row.rowid],
              highlight: needHightLight,
            },
          )}
          style={{
            width: cellWidth,
            height: '100%',
            textAlign: 'right',
            borderRight: 'none',
            backgroundColor: cellStyle.backgroundColor,
          }}
        >
          <div className="flex"></div>
          {((!treeNodeData.loading && !treeNodeData.hideExpand && (treeNodeData.childrenIds || []).length > 0) ||
            (isSubList &&
              treeNodeData.index > 5 &&
              getRelateRecordCountOfControlFromRow(addChildControl, row) > 0)) && (
            <Tooltip
              mouseEnterDelay={0.8}
              text={
                !(isSubList || isRelateRecordList) &&
                !get(treeTableViewData, 'expandedAllKeys.' + row.key) &&
                _l('Shift + 点击展开所有下级')
              }
              popupPlacement="bottom"
            >
              <TreeExpandIcon
                onClick={e => {
                  if (isFunction(actions.updateTreeNodeExpansion)) {
                    actions.updateTreeNodeExpansion(row, {
                      expandAll: !(isSubList || isRelateRecordList) && e.shiftKey,
                      forceUpdate: !(isSubList || isRelateRecordList) && e.shiftKey,
                    });
                  }
                  delete window[`sheetTableHighlightRow${tableId}`];
                }}
              >
                {expandShowAsPlus ? (
                  <CollapseExpandButton folded={treeNodeData.folded} />
                ) : (
                  <i className={cx('icon-default icon icon-arrow-down', { folded: treeNodeData.folded })} />
                )}
              </TreeExpandIcon>
            </Tooltip>
          )}
          {treeNodeData.loading && (
            <TreeLoadingIcon>
              <i className="icon icon-loading_button" />
            </TreeLoadingIcon>
          )}
          <span className="Gray_9e">{(treeNodeData.levelList || []).join('.')}</span>
        </TreeExpandCell>
        {cell}
        {addSubRecordVisible && (
          <Tooltip mouseEnterDelay={0.6} text={_l('添加子记录')} popupPlacement="bottom">
            <AddChildBtn
              className={cx('addChildBtn hoverShow ThemeHoverColor3', tableType)}
              style={{ right: tableType === 'classic' || !(lineEditable && cellEditable) ? 8 : 36 }}
              onClick={() => {
                if (_.isFunction(actions.handleAddNewRecord)) {
                  actions.handleAddNewRecord(row, { addParentControl, addChildControl });
                } else {
                  import('worksheet/common/newRecord/addRecord').then(addRecord => {
                    addRecord.default({
                      worksheetId,
                      isDraft,
                      masterRecord,
                      defaultRelatedSheet: {
                        worksheetId,
                        relateSheetControlId: addParentControl.sourceControlId,
                        value: {
                          sid: row.rowid,
                          sourcevalue: JSON.stringify(row),
                          type: 8,
                        },
                      },
                      directAdd: true,
                      showFillNext: true,
                      onAdd: actions.onTreeAddRecord
                        ? record => actions.onTreeAddRecord(row, record)
                        : record => {
                            if (record) {
                              if (isFunction(actions.updateTreeNodeExpansion)) {
                                actions.updateTreeNodeExpansion(row, { forceUpdate: true });
                              }
                            }
                          },
                    });
                  });
                }
              }}
            >
              <i className="icon icon-add" />
            </AddChildBtn>
          </Tooltip>
        )}
      </CellCon>
    );
  }
  return cell;
}

export default Cell;
