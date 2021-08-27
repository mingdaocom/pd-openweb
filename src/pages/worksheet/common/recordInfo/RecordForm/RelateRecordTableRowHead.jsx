import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { Dialog, ConfirmPanel } from 'ming-ui';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';

const Con = styled.span`
  padding: 0 16px !important;
  text-align: center;
  line-height: 34px;
  color: #9e9e9e;
  .moreOperate,
  .deleteRowIcon {
    display: none;
  }
  .moreOperate {
    margin-top: 5px;
  }
  .deleteRowIcon {
    margin-top: 2px;
  }
  &.hover {
    .number {
      display: none;
    }
    .moreOperate,
    .deleteRowIcon {
      display: inline-block;
    }
  }
`;

export default function RowHead(props) {
  const [confirmVisible, setConfirmVisible] = useState();
  const {
    layoutChangeVisible,
    allowRemoveRelation,
    className,
    style,
    rowIndex,
    tableControls,
    row,
    projectId,
    appId,
    viewId,
    worksheetId,
    sheetSwitchPermit,
    relateRecordControlPermission,
    allowEdit,
    pageIndex,
    pageSize,
    recordId,
    deleteRelateRow,
    addReocord = () => {},
    saveSheetLayout = () => {},
    resetSehetLayout = () => {},
    removeRecords = () => {},
  } = props;
  return (
    <ConfirmPanel
      visible={confirmVisible}
      angleLeft={style.width / 2 - 8}
      placement="bottomLeft"
      content={_l('你确定要取消关联吗？')}
      onPopupVisibleChange={value => !value && setConfirmVisible(false)}
      onOk={e => {
        e.stopPropagation();
        deleteRelateRow(row.rowid);
      }}
      okText={_l('确定')}
      cancelText={_l('取消')}
    >
      <Con className={className} style={style}>
        {layoutChangeVisible && rowIndex === 0 && (
          <ChangeSheetLayout
            description={_l('保存表格当前的列宽配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSehetLayout}
          />
        )}
        {row.rowid && (
          <span
            className="number"
            key="number"
            style={relateRecordControlPermission.editable && allowEdit ? {} : { display: 'inline-block' }}
          >
            {(pageIndex - 1) * pageSize + rowIndex}
          </span>
        )}
        {row.rowid &&
          relateRecordControlPermission.editable &&
          allowEdit &&
          (recordId ? (
            <RecordOperate
              {...{ appId, viewId, worksheetId, recordId: row.rowid, projectId }}
              allowCopy
              shows={cx('share', 'print', 'copy', { openinnew: viewId, removeRelation: allowRemoveRelation })}
              formdata={tableControls.map(c => ({ ...c, value: row[c.controlId] }))}
              disableLoadCustomButtons={!viewId}
              allowDelete={row.allowdelete}
              showTask={false}
              sheetSwitchPermit={sheetSwitchPermit}
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
              }}
              onRemoveRelation={() => setConfirmVisible(true)}
              onCopySuccess={addReocord}
              onDeleteSuccess={() => {
                removeRecords([row]);
              }}
            />
          ) : (
            <div
              className="deleteRowIcon"
              key="deleteRowIcon"
              onClick={() => {
                Dialog.confirm({
                  title: _l('是否删除此条记录'),
                  buttonType: 'danger',
                  onOk: () => deleteRelateRow(row.rowid),
                });
              }}
            >
              <i className="icon icon-close deleteRow Font18 Hand"></i>
            </div>
          ))}
      </Con>
    </ConfirmPanel>
  );
}

RowHead.propTypes = {
  allowEdit: PropTypes.bool,
  className: PropTypes.string,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  recordId: PropTypes.string,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  sheetSwitchPermit: PropTypes.shape({
    editable: PropTypes.any,
  }),
  relateRecordControlPermission: PropTypes.shape({
    editable: PropTypes.any,
  }),
  row: PropTypes.shape({
    rowid: PropTypes.string,
  }),
  tableControls: PropTypes.arrayOf(PropTypes.shape({})),
  rowIndex: PropTypes.number,
  style: PropTypes.shape({}),
  deleteRelateRow: PropTypes.func,
  onDelete: PropTypes.func,
};
