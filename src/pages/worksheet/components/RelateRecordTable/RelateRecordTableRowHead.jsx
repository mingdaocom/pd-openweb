import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { Checkbox, ConfirmPanel } from 'ming-ui';
import _ from 'lodash';
import RecordOperate from 'worksheet/components/RecordOperate';
import ChangeSheetLayout from 'worksheet/components/ChangeSheetLayout';
import { FlexCenter } from 'worksheet/components/Basics';

const Con = styled.span`
  padding: 0 16px !important;
  text-align: center;
  line-height: 34px;
  color: #9e9e9e;
  .moreOperate,
  .openRecord,
  .deleteRowIcon {
    display: none;
  }
  .moreOperate {
    margin-top: 5px;
  }
  .deleteRowIcon {
    margin-top: 2px;
  }
  .Checkbox-box {
    margin-right: -2px !important;
  }
  &.isNew {
    &::before {
      content: '';
      position: absolute;
      z-index: 3;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #2196f3;
    }
  }
  &.hover {
    ${({ hideOperate }) =>
      !hideOperate &&
      `
    .number {
      display: none;
    }`}
    .openRecord {
      display: inline-flex;
    }
    .moreOperate,
    .deleteRowIcon {
      display: inline-block;
    }
  }
`;

const OpenRecordBtn = styled(FlexCenter)`
  display: inline-flex;
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  height: 24px;
  color: #2196f3;
  border-radius: 4px;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;
export default function RowHead(props) {
  const [confirmVisible, setConfirmVisible] = useState();
  const {
    tableType,
    isBatchEditing,
    allIsSelected,
    selected,
    allowAdd,
    allowDelete,
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
    showQuickFromSetting,
    allowEdit,
    pageIndex = 1,
    pageSize,
    recordId,
    relateRecordControlId,
    deleteRelateRow,
    isDraft,
    from,
    updateRows = () => {},
    addRecord = () => {},
    saveSheetLayout = () => {},
    resetSheetLayout = () => {},
    removeRecords = () => {},
    onRecreate = () => {},
    onSelect = () => {},
    openRecord = () => {},
  } = props;
  const isShareState = !!_.get(window, 'shareState.shareId');
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
      <Con
        className={cx(className, { isNew: row.isNew })}
        style={style}
        hideOperate={!recordId && !allowRemoveRelation}
      >
        {layoutChangeVisible && rowIndex === -1 && (
          <ChangeSheetLayout
            description={_l('保存表格当前的列宽配置，并应用给所有用户')}
            onSave={saveSheetLayout}
            onCancel={resetSheetLayout}
          />
        )}
        {isBatchEditing && (rowIndex === -1 || row.rowid) && (
          <Checkbox
            size="small"
            checked={rowIndex === -1 ? allIsSelected : selected}
            onClick={() => {
              if (rowIndex === -1) {
                onSelect({ action: allIsSelected ? 'clearSelectAll' : 'selectAll' });
              } else {
                onSelect({ action: 'toggleSelectRow' });
              }
            }}
          />
        )}
        {!isBatchEditing && (
          <Fragment>
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
              !(!showQuickFromSetting && !allowDelete && !allowRemoveRelation) &&
              relateRecordControlPermission.editable &&
              allowEdit &&
              (recordId && !isShareState ? (
                <RecordOperate
                  {...{ appId, viewId, worksheetId, recordId: row.rowid, projectId }}
                  relateRecordControlId={relateRecordControlId}
                  allowCopy={allowAdd}
                  allowAdd={allowAdd}
                  allowRecreate={allowAdd}
                  isRelateRecordTable
                  disableCustomButtons={!showQuickFromSetting}
                  isDraft={isDraft}
                  from={from}
                  shows={
                    showQuickFromSetting
                      ? cx('share', 'print', 'copy', 'recreate', 'fav', {
                          openinnew: viewId && allowOpenRecord,
                          removeRelation: allowRemoveRelation,
                        })
                      : cx({ removeRelation: allowRemoveRelation })
                  }
                  formdata={tableControls.map(c => ({ ...c, value: row[c.controlId] }))}
                  allowDelete={allowDelete && row.allowdelete}
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
                  onCopySuccess={addRecord}
                  onDeleteSuccess={() => {
                    removeRecords([row]);
                  }}
                  onRecreate={onRecreate}
                  onUpdate={(rowdata, row) => {
                    updateRows(_.omit(row, ['allowedit', 'allowdelete']));
                  }}
                />
              ) : (
                allowRemoveRelation && (
                  <div className="deleteRowIcon" key="deleteRowIcon" onClick={() => setConfirmVisible(true)}>
                    <i className="icon icon-close deleteRow Font18 Hand"></i>
                  </div>
                )
              ))}
            {row.rowid && allowOpenRecord && tableType === 'classic' && (
              <OpenRecordBtn className="openRecord allowOutClick" onClick={() => openRecord(row.rowid)}>
                <i className="icon icon-worksheet_enlarge allowOutClick Hand ThemeHoverColor3" />
              </OpenRecordBtn>
            )}
          </Fragment>
        )}
      </Con>
    </ConfirmPanel>
  );
}

RowHead.propTypes = {
  showQuickFromSetting: PropTypes.bool,
  isBatchEditing: PropTypes.bool,
  allIsSelected: PropTypes.bool,
  selected: PropTypes.bool,
  allowDelete: PropTypes.bool,
  allowOpenRecord: PropTypes.bool,
  layoutChangeVisible: PropTypes.bool,
  allowRemoveRelation: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowAdd: PropTypes.bool,
  projectId: PropTypes.string,
  relateRecordControlId: PropTypes.string,
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
  addRecord: PropTypes.func,
  saveSheetLayout: PropTypes.func,
  resetSheetLayout: PropTypes.func,
  removeRecords: PropTypes.func,
  onRecreate: PropTypes.func,
  onSelect: PropTypes.func,
  openRecord: PropTypes.func,
};
