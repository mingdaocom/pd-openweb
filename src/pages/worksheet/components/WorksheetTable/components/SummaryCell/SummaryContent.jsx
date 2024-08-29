import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { toFixed, formatNumberThousand } from 'src/util';
import { SUMMARY_TYPE, checkCellIsEmpty, controlIsNumber, getSummaryNameByType } from 'worksheet/util';
import { arrayOf, bool, number, shape, string } from 'prop-types';

const getSummaryResult = (rows, control, summaryType) => {
  let result;
  switch (summaryType) {
    case SUMMARY_TYPE.COMPLETED:
      result = rows.filter(row => !checkCellIsEmpty(row[control.controlId])).length;
      break;
    case SUMMARY_TYPE.INCOMPLETE:
      result = rows.filter(row => checkCellIsEmpty(row[control.controlId])).length;
      break;
    case SUMMARY_TYPE.SUM:
      result = _.sum(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
    case SUMMARY_TYPE.AVERAGE:
      result =
        _.sum(rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value))) /
        rows.length;
      break;
    case SUMMARY_TYPE.MAXIMUM:
      result = _.max(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
    case SUMMARY_TYPE.MINIMUM:
      result = _.min(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
  }
  return result;
};

export default function SummaryContent({
  control,
  type,
  summaryType,
  summaryValue,
  rows,
  selectedIds,
  allWorksheetIsSelected,
}) {
  const isPercent = _.get(control, 'advancedSetting.numshow') === '1';
  let summaryName;
  let summaryDataValue = summaryValue;
  if (summaryType) {
    summaryName = getSummaryNameByType(summaryType);
    if (rows.length && selectedIds.length && !allWorksheetIsSelected) {
      summaryDataValue = getSummaryResult(
        rows.filter(row => _.includes(selectedIds, row.rowid)),
        control,
        summaryType,
      );
    }
    if (!_.isUndefined(summaryDataValue)) {
      if (_.includes([3, 4, 5, 6], summaryType)) {
        summaryDataValue = toFixed(summaryDataValue * (isPercent ? 100 : 1), control.dot);
        summaryDataValue =formatNumberThousand(summaryDataValue);
      }
      if (isPercent) {
        summaryDataValue = summaryDataValue + '%';
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
      <i className="iconArrow icon icon-arrow-down-border"></i>
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
};
