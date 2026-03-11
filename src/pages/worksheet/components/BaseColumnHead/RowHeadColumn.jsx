import React from 'react';
import styled from 'styled-components';

const Con = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  background-color: #fafafa !important;
  .number {
    font-size: 13px;
    color: #888;
    margin-right: 8px;
  }
  .requiredStatus {
    color: var(--color-error);
    margin-right: 2px;
  }
  .controlName {
    font-weight: bold;
    font-size: 13px;
    color: #151515;
  }
  &.cell:not(.columnHead) {
    padding: 0 12px !important;
  }
`;

export default function RowHeadColumn(props) {
  const { className, style, control, showNumber = true, showRequired = false, rowIndex } = props;
  return (
    <Con
      style={{
        lineHeight: style.height + 'px',
        ...style,
      }}
      className={className}
    >
      {showNumber && <div className="number">{rowIndex + 1}</div>}
      {showRequired && control.required && <div className="requiredStatus">*</div>}
      <div className="controlName ellipsis" title={control.controlName}>
        {control.controlName}
      </div>
    </Con>
  );
}
