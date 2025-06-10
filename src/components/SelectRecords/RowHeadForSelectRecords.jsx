import React from 'react';
import { get, isEmpty, isEqual } from 'lodash';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Radio } from 'ming-ui';
import { FlexCenter } from 'worksheet/components/Basics';

const Con = styled.div`
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  .openRecord {
    visibility: hidden;
  }
  &.hover {
    .openRecord {
      visibility: visible;
    }
  }
`;

const OpenRecordBtn = styled(FlexCenter)`
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  height: 24px;
  color: #2196f3;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

export default function RowHeadForSelectRecords({
  className,
  style = {},
  type = 0,
  rowIndex,
  data = [],
  selectedRowIds = [],
  onToggleSelect = () => {},
  onOpenRecord = () => {},
  onUpdateSelectedRowIds = () => {},
}) {
  const row = data[rowIndex] || {};
  const checked = row.rowid && selectedRowIds.includes(row.rowid);
  const isAllSelected =
    selectedRowIds.length &&
    isEqual(
      selectedRowIds,
      data.map(item => item.rowid),
    );
  if ((isEmpty(row) && rowIndex > -1) || (type === 1 && rowIndex === -1)) {
    return <Con className={className} style={style} />;
  }
  if (rowIndex === -1 && type === 0) {
    return (
      <Con className={className} style={style}>
        <Checkbox
          disabled={!data.length}
          size="small"
          noMargin
          clearselected={data.length && selectedRowIds.length && !isAllSelected}
          checked={isAllSelected}
          onClick={() => {
            if (selectedRowIds.length) {
              onUpdateSelectedRowIds([]);
            } else {
              onUpdateSelectedRowIds(data.map(item => item.rowid));
            }
          }}
        />
        <div style={{ width: 32 }}></div>
      </Con>
    );
  }
  return (
    <Con className={className} style={style}>
      {type === 0 ? (
        <Checkbox checked={checked} noMargin size="small" onClick={() => onToggleSelect(row.rowid, rowIndex)} />
      ) : (
        <Radio checked={checked} noMargin size="small" onClick={() => onToggleSelect(row.rowid, rowIndex)} />
      )}
      {!get(window, 'shareState.shareId') && (
        <OpenRecordBtn className="openRecord" onClick={onOpenRecord}>
          <i className="icon icon-worksheet_enlarge Hand ThemeHoverColor3" />
        </OpenRecordBtn>
      )}
    </Con>
  );
}

RowHeadForSelectRecords.propTypes = {
  className: propTypes.string,
  style: propTypes.shape({}),
  type: propTypes.number,
  rowIndex: propTypes.number,
  data: propTypes.arrayOf(propTypes.shape({})),
  onOpenRecord: propTypes.func,
};
