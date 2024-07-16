import { arrayOf, bool, func, number, shape } from 'prop-types';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { Icon } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';

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
    border-radius: 2px;
  }
`;

const RowHead = styled.div`
  color: #757575;
  text-align: center;
`;

export default function ControlsDataTable(props) {
  const {
    loading,
    controls = [],
    data = [],
    lineNumberBegin = 0,
    onCellClick = () => {},
    showIcon,
    enableRules,
    emptyText = '',
    chatButton,
    sortByControl,
    showEmptyForResize = true,
    canSort,
  } = props;
  const [{ isAsc, controlId, datatype }, setState] = useSetState({
    isAsc: undefined,
    controlId: '',
    datatype: '',
  });
  useEffect(() => {
    const { sortControls = {} } = props;
    setState({
      isAsc: sortControls.isAsc,
      controlId: sortControls.controlId,
      datatype: sortControls.datatype,
    });
  }, [props.sortControls]);
  const getType = control => {
    const { type, sourceControlType } = control;
    let itemType = type;
    if (type === 30) {
      itemType = sourceControlType;
    }
    if (itemType === 38) {
      itemType = 6;
    }
    return itemType;
  };

  const getSortIcon = () => {
    if (isAsc === true) {
      return <i className="icon icon-score-up sortIcon" />;
    } else if (isAsc === false) {
      return <i className="icon icon-score-down sortIcon" />;
    }
  };
  return (
    <WorksheetTable
      watchHeight
      loading={loading}
      lineNumberBegin={lineNumberBegin}
      columns={controls}
      enableRules={enableRules}
      // rowCount={data.length}
      emptyText={emptyText}
      data={data}
      showEmptyForResize={showEmptyForResize}
      chatButton={chatButton}
      renderColumnHead={({ control, style, className }) => (
        <ColumnHead
          style={style}
          className={cx(className + ' columnHead flexRow alignItemsCenter', {
            'Hand ThemeHoverColor3': !!control.controlId && canSort,
          })}
          onClick={() => {
            if (!control.controlId || !canSort) {
              return;
            }
            let newSortType;
            if (controlId !== control.controlId || _.isUndefined(isAsc)) {
              newSortType = true;
            } else if (isAsc === true) {
              newSortType = false;
            }
            let sortControl = {
              controlId: control.controlId,
              datatype: getType(control),
              isAsc: newSortType,
            };
            sortByControl(newSortType === undefined ? [] : [sortControl]);
            setState(sortControl);
          }}
        >
          {showIcon && control.icon && (
            <React.Fragment>
              {control.color && <div className="colorCon" style={{ backgroundColor: control.color }}></div>}
              <Icon icon={control.icon} className="Font16 mRight5" style={{ color: control.color || '#9e9e9e' }} />
            </React.Fragment>
          )}
          <span className="ellipsis">{control.controlName}</span>
          {typeof isAsc !== 'undefined' && controlId === control.controlId && (
            <span className="sortIcon">{getSortIcon(control)}</span>
          )}
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
