import { arrayOf, bool, func, number, shape } from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { Icon } from 'ming-ui';

const ColumnHead = styled.div`
  background-color: #fafafa !important;
  padding: 0 5px !important;
  font-weight: bold;
  font-size: 13px;
  color: #757575;
  line-height: 34px;
  .colorCon {
    width: 2px;
    height: 18px;
    position: absolute;
    left: 0;
  }
`;

const RowHead = styled.div`
  color: #757575;
  text-align: center;
`;

export default function ControlsDataTable(props) {
  const { loading, controls = [], data = [], lineNumberBegin = 0, onCellClick = () => {}, showIcon } = props;
  return (
    <WorksheetTable
      loading={loading}
      lineNumberBegin={lineNumberBegin}
      columns={controls}
      // rowCount={data.length}
      data={data}
      renderColumnHead={({ control, style, className }) => (
        <ColumnHead style={style} className={className + ' columnHead flexRow alignItemsCenter'}>
          {showIcon && control.icon && (
            <React.Fragment>
              {control.color && <div className="colorCon" style={{ backgroundColor: control.color }}></div>}
              <Icon icon={control.icon} className="Font16 mRight5" style={{ color: control.color || '#9e9e9e' }} />
            </React.Fragment>
          )}
          <span className="ellipsis"> {control.controlName}</span>
        </ColumnHead>
      )}
      renderRowHead={({ className, style, rowIndex, row }) => (
        <RowHead style={style} className={className}>
          {rowIndex >= 0 && <span className="ellipsis"> {lineNumberBegin + rowIndex + 1}</span>}
        </RowHead>
      )}
      onCellClick={(control, row) => {
        onCellClick(control, row);
      }}
    />
  );
}

ControlsDataTable.propTypes = {
  loading: bool,
  lineNumberBegin: number,
  controls: arrayOf(shape({})),
  data: arrayOf(shape({})),
  onCellClick: func,
};
