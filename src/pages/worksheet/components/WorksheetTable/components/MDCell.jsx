import React from 'react';
import _ from 'lodash';
import CellControl from 'worksheet/components/CellControls';

export default function MDCell(props) {
  const {
    isTrash,
    className,
    style,
    columnIndex,
    rowIndex,
    cellIndex,
    row,
    control,
    value,
    fixedColumnCount,
    getPopupContainer,
    from,
  } = props;
  const {
    tableType,
    tableId,
    cache,
    worksheetId,
    rowFormData,
    masterData,
    isSubList,
    rowHeight,
    rowHeightEnum,
    updateCell = () => {},
    onCellClick = () => {},
    onFocusCell = () => {},
    onCellMouseDown = () => {},
    projectId,
    lineEditable,
    scrollTo,
    tableScrollTop,
    isediting,
    error,
    clearCellError,
    enterEditing,
    cellUniqueValidate,
    clickEnterEditing,
    fromModule,
    sheetSwitchPermit,
    viewId,
    appId,
    allowlink,
    isCharge,
    onCellFocus,
    checkRulesErrorOfControl,
    registerRef,
  } = props;
  const onClick = () => {
    if (control.key === 'number' || !row.rowid || allowlink === '0') return;
    onCellClick(control, row, rowIndex, columnIndex);
  };
  return (
    <CellControl
      isTrash={isTrash}
      tableId={tableId}
      tableType={tableType}
      cache={cache}
      viewId={viewId}
      appId={appId}
      worksheetId={worksheetId}
      sheetSwitchPermit={sheetSwitchPermit}
      tableFromModule={fromModule}
      clickEnterEditing={clickEnterEditing}
      isSubList={isSubList}
      isediting={isediting}
      isCharge={isCharge}
      error={error}
      clearCellError={clearCellError}
      enterEditing={enterEditing}
      cellUniqueValidate={cellUniqueValidate}
      className={className}
      style={style}
      allowlink={allowlink}
      canedit={
        lineEditable &&
        !_.find(
          [
            'caid',
            'ctime',
            'utime',
            'wfname',
            'wfstatus',
            'wfcuaids',
            'wfrtime',
            'wfftime',
            'wfdtime',
            'wfcaid',
            'wfctime',
            'wfcotime',
            'rowid',
            'uaid',
          ],
          id => id === control.controlId,
        )
      }
      cell={{ ...control, value, disabled: !row.allowedit || control.disabled }}
      row={row}
      rowIndex={rowIndex}
      cellIndex={cellIndex}
      columnIndex={columnIndex}
      rowFormData={rowFormData}
      masterData={masterData}
      rowHeight={rowHeight}
      rowHeightEnum={rowHeightEnum}
      from={from === 21 ? from : 1}
      popupContainer={() => getPopupContainer(columnIndex <= fixedColumnCount)}
      projectId={projectId}
      scrollTo={scrollTo}
      tableScrollTop={tableScrollTop}
      updateCell={(cell, options) => {
        updateCell({ cell, control, row }, options);
      }}
      onClick={onClick}
      onFocusCell={onFocusCell}
      onMouseDown={() => onCellMouseDown({ rowIndex })}
      onCellFocus={onCellFocus}
      checkRulesErrorOfControl={checkRulesErrorOfControl}
      registerRef={registerRef}
    />
  );
}
