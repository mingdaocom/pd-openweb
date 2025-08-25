import React from 'react';
import { isEmpty, isEqual } from 'lodash';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Radio } from 'ming-ui';

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

export default function RowHeadForSelectRecords({
  className,
  style = {},
  type = 0,
  rowIndex,
  data = [],
  selectedRowIds = [],
  onToggleSelect = () => {},
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
    </Con>
  );
}

RowHeadForSelectRecords.propTypes = {
  className: propTypes.string,
  style: propTypes.shape({}),
  type: propTypes.number,
  rowIndex: propTypes.number,
  data: propTypes.arrayOf(propTypes.shape({})),
};
