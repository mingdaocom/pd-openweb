import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { Dialog, ConfirmPanel } from 'ming-ui';
import _ from 'lodash';
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
    allowAdd,
    allowOpenRecord,
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
    relateRecordControlId,
    deleteRelateRow,
    updateRows = () => {},
    addReocord = () => {},
    saveSheetLayout = () => {},
    resetSheetLayout = () => {},
    removeRecords = () => {},
    onRecreate = () => {},
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
        {layoutChangeVisible && rowIndex === -1 && (
          <ChangeSheetLayout
            description={_l('保存表格当前的列宽配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSheetLayout}
          />
        )}
        {row.rowid && (
          <span
            className="number"
            key="number"
            style={relateRecordControlPermission.editable && allowEdit ? {} : { display: 'inline-block' }}
          >
            {(pageIndex - 1) * pageSize + rowIndex + 1}
          </span>
        )}
        {row.rowid &&
          relateRecordControlPermission.editable &&
          allowEdit &&
          (recordId ? (
            <RecordOperate
              {...{ appId, viewId, worksheetId, recordId: row.rowid, projectId }}
              relateRecordControlId={relateRecordControlId}
              allowCopy
              allowAdd={allowAdd}
              allowRecreate={allowAdd}
              isRelateRecordTable
              shows={cx('share', 'print', 'copy', 'recreate', {
                openinnew: viewId && allowOpenRecord,
                removeRelation: allowRemoveRelation,
              })}
              formdata={tableControls.map(c => ({ ...c, value: row[c.controlId] }))}
              allowDelete={row.allowdelete}
              showTask={false}
              sheetSwitchPermit={sheetSwitchPermit}
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
              }}
              onRemoveRelation={({ confirm = true } = {}) => {
                if (confirm) {
                  setConfirmVisible(true);
                } else {
                  deleteRelateRow(row.rowid);
                }
              }}
              onCopySuccess={addReocord}
              onDeleteSuccess={() => {
                removeRecords([row]);
              }}
              onRecreate={onRecreate}
              onUpdate={(rowdata, row) => {
                updateRows(_.omit(row, ['allowedit', 'allowdelete']));
              }}
            />
          ) : (
            <div className="deleteRowIcon" key="deleteRowIcon" onClick={() => setConfirmVisible(true)}>
              <i className="icon icon-close deleteRow Font18 Hand"></i>
            </div>
          ))}
      </Con>
    </ConfirmPanel>
  );
}

RowHead.propTypes = {
  allowEdit: PropTypes.bool,
  allowAdd: PropTypes.bool,
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
  updateRows: PropTypes.func,
  onDelete: PropTypes.func,
};
