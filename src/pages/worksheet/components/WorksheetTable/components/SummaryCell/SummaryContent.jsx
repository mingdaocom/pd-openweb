import React from 'react';
import cx from 'classnames';
import _, { isEmpty } from 'lodash';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { toFixed } from 'src/utils/control';
import { controlIsNumber, formatNumberThousand } from 'src/utils/control';
import { getSummaryNameByType, getSummaryResult } from 'src/utils/record';

export default function SummaryContent({
  isChildTableSummaryCell,
  control,
  type,
  summaryType,
  summaryValue,
  rows = [],
  selectedIds,
  allWorksheetIsSelected,
  disabled,
}) {
  const isPercent = _.get(control, 'advancedSetting.numshow') === '1';
  let summaryName;
  let summaryDataValue = summaryValue;
  if (summaryType) {
    summaryName = getSummaryNameByType(summaryType);
    if (rows.length && ((selectedIds.length && !allWorksheetIsSelected) || isChildTableSummaryCell)) {
      if (isChildTableSummaryCell && isEmpty(selectedIds)) {
        selectedIds = rows.map(row => row.rowid);
      }
      summaryDataValue = getSummaryResult(
        rows.filter(row => _.includes(selectedIds, row.rowid)),
        control,
        summaryType,
      );
    }
    if (!_.isUndefined(summaryDataValue)) {
      if (_.includes([3, 4, 5, 6], summaryType)) {
        summaryDataValue = toFixed(summaryDataValue * (isPercent ? 100 : 1), control.dot);
        summaryDataValue = formatNumberThousand(summaryDataValue);
        if (isPercent) {
          summaryDataValue = summaryDataValue + '%';
        }
      }
    }
  }
  const isNumber = controlIsNumber(control);
  return (
    <div
      className={cx('flexRow', {
        hide: type === 25,
        empty: !summaryType,
      })}
    >
      <span className="summaryName">{summaryName}：</span>
      {isNumber && <div className="flex"></div>}
      <div className="summaryValue" title={summaryDataValue}>
        {typeof summaryDataValue === 'undefined' || summaryType === 0 ? '-' : summaryDataValue}
      </div>
      {!isNumber && <div className="flex"></div>}
      {!disabled && <i className="iconArrow icon icon-arrow-down-border"></i>}
    </div>
  );
}

SummaryContent.propTypes = {
  control: shape({}),
  type: number,
  summaryType: number,
  summaryValue: string,
  rows: arrayOf(shape({})),
  selectedIds: arrayOf(string),
  allWorksheetIsSelected: bool,
  disabled: bool,
};
