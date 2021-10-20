import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';

const Con = styled.span`
  padding: 0 !important;
  line-height: 34px;
  .rowIndex {
    display: inline-block;
    width: 44px;
    text-align: center;
    .num {
      font-size: 13px;
      color: #9e9e9e;
    }
  }
  .moreOperate {
    margin: 5px 8px 0 12px;
  }
  .open,
  .moreOperate {
    display: none;
  }
  .open .icon {
    font-size: 18px;
    color: #9e9e9e;
    cursor: pointer;
  }
  .delete {
    display: none;
  }
  &.hover {
    .open {
      display: inline-block;
    }
  }
  &:not(.disabled).hover {
    .delete,
    .open,
    .moreOperate {
      display: inline-block;
    }
    .rowIndex {
      display: none;
    }
  }
`;

export default function RowHead(props) {
  const {
    changeSheetLayoutVisible,
    disabled,
    className,
    style,
    rowIndex,
    onOpen = () => {},
    onDelete = () => {},
    onCopy = () => {},
    saveSheetLayout = () => {},
    resetSehetLayout = () => {},
  } = props;
  if (rowIndex === 0) {
    return (
      <div className={className} style={style}>
        {changeSheetLayoutVisible && (
          <ChangeSheetLayout
            title={_l('你变更了表格列宽，是否保存？')}
            description={_l('保存当前表格的列宽配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSehetLayout}
          />
        )}
      </div>
    );
  }
  return (
    <Con className={cx(className, { disabled })} style={style}>
      <span className="rowIndex">
        <span className="num">{rowIndex}</span>
      </span>
      {!disabled && (
        <RecordOperate
          popupAlign={{
            offset: [-12, 0],
            points: ['tl', 'bl'],
          }}
          isSubList
          allowCopy
          shows={['copy']}
          disableLoadCustomButtons
          allowDelete
          showTask={false}
          showHr={false}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      )}
      <span className="open" onClick={() => onOpen(rowIndex - 1)}>
        <i className="icon icon-worksheet_enlarge ThemeHoverColor3"></i>
      </span>
    </Con>
  );
}

//

RowHead.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  rowIndex: PropTypes.number,
  style: PropTypes.shape({}),
  onOpen: PropTypes.func,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func,
};
