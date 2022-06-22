import React from 'react';
import CellControl from 'worksheet/components/CellControls';

export default function MDCell(props) {
  const { className, style, columnIndex, rowIndex, row, control, value, fixedColumnCount, getPopupContainer, from } =
    props;
  const {
    worksheetId,
    formdata,
    masterData,
    isSubList,
    rowHeight,
    updateCell = () => {},
    onCellClick = () => {},
    onCellMouseDown = () => {},
    projectId,
    lineeditable,
    scrollTo,
    tableScrollTop,
    gridHeight,
    isediting,
    error,
    updateEditingControls,
    clearCellError,
    cellUniqueValidate,
    clickEnterEditing,
    fromModule,
    sheetSwitchPermit,
    viewId,
    appId,
    allowlink,
    onCellFocus,
    checkRulesErrorOfControl,
  } = props;
  const onClick = () => {
    if (control.key === 'number' || rowIndex === 0 || !row.rowid || allowlink === '0') return;
    onCellClick(control, row, rowIndex);
  };
  return (
    <CellControl
      viewId={viewId}
      appId={appId}
      worksheetId={worksheetId}
      sheetSwitchPermit={sheetSwitchPermit}
      tableFromModule={fromModule}
      clickEnterEditing={clickEnterEditing}
      isSubList={isSubList}
      isediting={isediting}
      error={error}
      updateEditingControls={updateEditingControls}
      clearCellError={clearCellError}
      cellUniqueValidate={cellUniqueValidate}
      className={className}
      style={style}
      allowlink={allowlink}
      canedit={lineeditable && !_.find(['caid', 'ctime', 'utime'], id => id === control.controlId)}
      cell={{ ...control, value, disabled: !row.allowedit || control.disabled }}
      row={row}
      rowIndex={rowIndex}
      formdata={formdata}
      masterData={masterData}
      rowHeight={rowHeight}
      from={1}
      popupContainer={() => getPopupContainer(columnIndex < fixedColumnCount)}
      projectId={projectId}
      scrollTo={scrollTo}
      tableScrollTop={tableScrollTop}
      gridHeight={gridHeight}
      updateCell={(cell, options) => {
        updateCell({ cell, control, row }, options);
      }}
      onClick={onClick}
      onMouseDown={() => onCellMouseDown({ rowIndex })}
      onCellFocus={onCellFocus}
      checkRulesErrorOfControl={checkRulesErrorOfControl}
    />
  );
}
