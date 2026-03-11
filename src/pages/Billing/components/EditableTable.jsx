import React from 'react';
import styled from 'styled-components';

const TableWrap = styled.div`
  .editableTable {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    border-radius: 4px;
    border: 1px solid var(--color-border-secondary);
    table-layout: fixed;
    border-bottom: none;
    th,
    td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid var(--color-border-secondary);
      border-right: 1px solid var(--color-border-secondary);
      vertical-align: middle;

      &:last-child {
        border-right: none;
      }

      &.editMode {
        padding: 4px 8px;
      }
    }

    th {
      background-color: var(--color-background-secondary);
      font-weight: 500;
      color: #262626;
    }

    tr:hover {
      background-color: var(--color-background-secondary);
    }
    .flex1 {
      flex: 1;
    }
    .flex2 {
      flex: 2;
    }
    .flex3 {
      flex: 3;
    }
    .flex4 {
      flex: 4;
    }
  }

  .priceInput {
    width: 120px;
    text-align: right;
    height: 28px;
    line-height: 28px;

    .ant-input-number-input {
      height: 26px;
      line-height: 26px;
    }
  }

  .unitText {
    margin-left: 8px;
    color: var(--color-text-secondary);
  }

  .lastUpdateTime {
    margin-top: 16px;
    text-align: right;
    color: var(--color-text-secondary);
    font-size: 12px;
  }
`;

const EditableTable = ({ children, className }) => {
  return <TableWrap className={className}>{children}</TableWrap>;
};

export default EditableTable;
