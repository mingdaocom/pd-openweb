import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import PropTypes from 'prop-types';
import CellControl from 'worksheet/components/CellControls';
import styled from 'styled-components';
import { Modal } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';

const alert = Modal.alert;

const MobileTableContent = styled.div`
  .mobileTableHeader {
    background-color: #f7f7f7;
  }
  .tableIndex {
    width: 20px !important;
    .icon-task-new-delete {
      margin-left: -4px;
    }
  }
  .mobileTableItem {
    width: 0;
    padding: 8px 0 8px 6px;
    min-height: 36px;
    .editableCellCon {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: top;
    }
  }
  tbody tr:nth-child(even) {
    background-color: #00000003;
  }
  .showAll {
    color: #2196f3;
    padding: 10px 0;
    justify-content: center;
  }
  .icon-arrow-right-tip {
    width: 15px;
    text-align: center;
  }
`;

export default function MobileTable(props) {
  const { onOpen, controls, rows, isEdit, allowcancel, allowadd, disabled, sheetSwitchPermit, onDelete } = props;
  const defaultMaxLength = 10;
  const [maxShowLength, setMaxShowLength] = useState(defaultMaxLength);
  const showRows = isEdit ? rows : rows.slice(0, maxShowLength);
  const showControls = controls.slice(0, 3);
  const isShowAll = maxShowLength === rows.length;
  return (
    <MobileTableContent>
      <div className="mobileTableHeader flexRow valignWrapper">
        {!_.isEmpty(showRows) && <div className="mobileTableItem tableIndex"></div>}
        {showControls.map((c, cIndex) => (
          <div key={cIndex} className={cx('mobileTableItem flex Font13', { mRight30: cIndex === showControls.length - 1 })}>
            {c.controlName}
          </div>
        ))}
      </div>
      {showRows.map((row, i) => (
        <div className="flexRow valignWrapper Font12" key={i}>
          <div className="mobileTableItem tableIndex">
            {isEdit && !disabled && !/^temp/.test(row.rowid) && allowcancel ? (
              <i
                className="icon icon-task-new-delete Font16 Gray_9e"
                onClick={() => {
                  alert(_l('确定删除此记录 ?'), '', [
                    { text: _l('取消') },
                    {
                      text: <span className="Red">{_l('确定')}</span>,
                      onPress: () => {
                        onDelete(row.rowid);
                      },
                    },
                  ]);
                }}
              ></i>
            ) : (
              i + 1
            )}
          </div>
          {showControls.map((c, cIndex) => (
            <div
              key={cIndex}
              className="mobileTableItem flex"
              onClick={() => {
                onOpen(i);
              }}
            >
              <CellControl
                className="cell flex"
                sheetSwitchPermit={sheetSwitchPermit}
                cell={{ ...c, value: row[c.controlId] }}
                row={row}
                rowHeight={30}
                from={4}
                mode="mobileSub"
              />
            </div>
          ))}
          <div className="flexRow valignWrapper">
            <Icon className="Gray_9e" icon="arrow-right-tip" />
          </div>
        </div>
      ))}
      {!isEdit && _.isEmpty(rows) && <div className="Gray_9e mTop15 mLeft15 bold">{_l('暂无记录')}</div>}
      {!isEdit && rows.length > defaultMaxLength && (
        <div
          className="flexRow valignWrapper showAll"
          onClick={() => {
            setMaxShowLength(isShowAll ? defaultMaxLength : rows.length);
          }}
        >
          <span>{isShowAll ? _l('收起') : _l('查看全部')}</span>
          <Icon className="mLeft5" icon={isShowAll ? 'arrow-up' : 'arrow-down'} />
        </div>
      )}
    </MobileTableContent>
  );
}

MobileTable.propTypes = {
  onOpen: PropTypes.func,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  isEdit: PropTypes.bool,
};
