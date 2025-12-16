import React from 'react';
import { find } from 'lodash';
import CellControl from 'worksheet/components/CellControls';

export default function MDCell(props) {
  const {
    key,
    isTrash,
    className,
    style,
    columnIndex,
    rowIndex,
    cellIndex,
    row,
    getRow = () => undefined,
    control,
    getPopupContainer,
    from,
    isDraft,
    leftFixedCount,
    inView,
  } = props;
  const {
    tableType,
    triggerClickImmediate,
    tableId,
    cache,
    worksheetId,
    rowFormData,
    masterData,
    columnStyle,
    isSubList,
    rowHeight,
    rowHeightEnum,
    updateCell = () => {},
    onCellClick = () => {},
    onFocusCell = () => {},
    onCellMouseDown = () => {},
    setActiveRow = () => {},
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
    chatButton,
  } = props;
  const onClick = (options = {}) => {
    if (control.key === 'number' || !row.rowid || allowlink === '0') return;
    onCellClick(control, row, rowIndex, columnIndex, options);
  };
  // console.log('data cell render');
  return (
    <CellControl
      chatButton={chatButton}
      key={key}
      isTrash={isTrash}
      tableId={tableId}
      tableType={tableType}
      triggerClickImmediate={triggerClickImmediate}
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
      isDraft={isDraft}
      canedit={
        lineEditable &&
        !find(
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
      cell={{ ...control, disabled: !row.allowedit || control.disabled, inView }}
      row={row}
      rowIndex={rowIndex}
      cellIndex={cellIndex}
      columnIndex={columnIndex}
      rowFormData={rowFormData}
      masterData={masterData}
      columnStyle={columnStyle}
      rowHeight={rowHeight}
      rowHeightEnum={rowHeightEnum}
      from={from === 21 ? from : 1}
      popupContainer={() => getPopupContainer(columnIndex <= leftFixedCount - 1)}
      projectId={projectId}
      setActiveRow={setActiveRow}
      scrollTo={scrollTo}
      tableScrollTop={tableScrollTop}
      updateCell={(cell, options) => {
        updateCell({ cell, control, row: getRow() || row }, options);
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
