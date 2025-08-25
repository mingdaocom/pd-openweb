import React, { useMemo } from 'react';
import { get, includes, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { formatNumberThousand, toFixed } from 'src/utils/control';
import { getSummaryResult } from 'src/utils/record';

const Con = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  .summary_list {
    margin-left: 20px;
    .summary_item {
      margin-left: 8px;
    }
    .summary_title {
      color: #757575;
    }
    .summary_value {
      margin-left: 4px;
    }
  }in
`;

export default function SelectedInfo({ selectedRowIds = [], summaryControls = [], records = [] }) {
  const selectedRecords = useMemo(() => {
    return records.filter(record => record && selectedRowIds.includes(record.rowid));
  }, [records, selectedRowIds]);
  return (
    <Con>
      <span>{_l('已选择：')}</span>
      <span>{selectedRowIds.length}</span>
      <div className="flex summary_list">
        {summaryControls.map(control => {
          let summaryResult = getSummaryResult(selectedRecords, control, control.summaryType);
          const isPercent = get(control, 'advancedSetting.numshow') === '1';
          if (!isUndefined(summaryResult)) {
            if (includes([3, 4, 5, 6], control.summaryType)) {
              summaryResult = toFixed(summaryResult * (isPercent ? 100 : 1), control.dot);
              summaryResult = formatNumberThousand(summaryResult);
              if (isPercent) {
                summaryResult = summaryResult + '%';
              }
            }
          }
          return (
            <span key={control.controlId} className="summary_item">
              <span className="summary_title">{control.controlName}:</span>
              <span className="summary_value">{summaryResult}</span>
            </span>
          );
        })}
      </div>
    </Con>
  );
}

SelectedInfo.propTypes = {
  selectedRowIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  summaryControls: PropTypes.arrayOf(
    PropTypes.shape({
      controlId: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  records: PropTypes.arrayOf(
    PropTypes.shape({
      rowid: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
