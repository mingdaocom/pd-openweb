import React, { useState } from 'react';
import cx from 'classnames';
import { includes, isUndefined } from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { SUMMARY_TYPE } from 'src/utils/record';
import SummaryCell from '../WorksheetTable/components/SummaryCell';

export default function ChildTableSummaryCell({ disabled, className, style, control, rows = [], selectedIds = [] }) {
  const [types, setTypes] = useState({});
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
      summaryType={
        isUndefined(types[control?.controlId]) &&
        includes(
          [
            WIDGETS_TO_API_TYPE_ENUM.NUMBER,
            WIDGETS_TO_API_TYPE_ENUM.MONEY,
            WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER,
            WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL,
          ],
          control?.type,
        )
          ? SUMMARY_TYPE.SUM
          : types[control?.controlId]
      }
      rows={rows}
      selectedIds={selectedIds}
      changeWorksheetSheetViewSummaryType={changes => {
        setTypes(prev => ({ ...prev, [control?.controlId]: changes.value }));
      }}
    />
  );
}
