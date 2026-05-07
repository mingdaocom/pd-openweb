import React, { useState } from 'react';
import cx from 'classnames';
import SummaryCell from '../WorksheetTable/components/SummaryCell';

export default function ChildTableSummaryCell({
  disabled,
  className,
  style,
  control,
  defaultSummaryTypes,
  rows = [],
  selectedIds = [],
}) {
  const [types, setTypes] = useState(defaultSummaryTypes);

  if (control?.type === 'summaryhead') {
    control = undefined;
  }

  return (
    <SummaryCell
      isChildTableSummaryCell
      disabled={disabled}
      className={cx(className, 'childTableSummaryCell')}
      style={style}
      control={control}
      noBackground
      summaryType={types[control?.controlId]}
      rows={rows}
      selectedIds={selectedIds}
      changeWorksheetSheetViewSummaryType={changes => {
        setTypes(prev => ({ ...prev, [control?.controlId]: changes.value }));
      }}
    />
  );
}
