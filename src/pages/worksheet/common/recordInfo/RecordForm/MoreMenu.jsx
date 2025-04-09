import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dialog } from 'ming-ui';
import cx from 'classnames';
import RecordOperate from 'worksheet/components/RecordOperate';
import IconBtn from './IconBtn';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { handleRowData } from 'src/util/transControlDefaultValue';
export default function MoreMenu(props) {
  const {
    recordbase,
    btnDisable,
    recordinfo,
    sheetSwitchPermit,
    onButtonClick,
    onDelete,
    reloadRecord,
    onUpdate,
    handleAddSheetRow,
    hideRecordInfo,
    hideFav,
    isDraft,
    printCharge,
  } = props;
  const { from, isCharge, appId, worksheetId, viewId, recordId, workId, instanceId } = recordbase;
  const { allowDelete, formData, projectId, allowAdd, rowData } = recordinfo;

  return (
    <RecordOperate
      printCharge={printCharge}
      from={from}
      hideFav={hideFav}
      showDeleteHr={false}
      shows={['share', 'share', 'print', 'copy', 'copyId', 'editform', 'recreate', 'openinnew', 'fav']}
      isCharge={isCharge}
      allowDelete={allowDelete}
      allowCopy={allowAdd && recordinfo.allowEdit}
      allowRecreate={allowAdd}
      projectId={projectId}
      appId={appId}
      viewId={viewId}
      worksheetId={worksheetId}
      recordId={recordId}
      workId={workId}
      instanceId={instanceId}
      formdata={formData}
      btnDisable={btnDisable}
      defaultCustomButtons={[]}
      sheetSwitchPermit={sheetSwitchPermit}
      onDelete={onDelete}
      onButtonClick={onButtonClick}
      reloadRecord={reloadRecord}
      onUpdate={onUpdate}
      onCopySuccess={handleAddSheetRow}
      hideRecordInfo={hideRecordInfo}
      isDraft={isDraft}
      printBtnType={2}
      onRecreate={() => {
        handleRowData({
          rowId: recordId,
          worksheetId: worksheetId,
          columns: formData,
        }).then(res => {
          const { defaultData, defcontrols } = res;
          addRecord({
            worksheetId,
            appId,
            viewId,
            defaultFormData: defaultData,
            defaultFormDataEditable: true,
            directAdd: false,
            writeControls: defcontrols,
            isDraft,
            onAdd: record => {
              handleAddSheetRow({ ...record }, recordId);
              alert(_l('创建成功'));
            },
          });
        });
      }}
    >
      <IconBtn className="moreBtn Hand Font22 mLeft10">
        <Icon icon="task-point-more" className="ThemeHoverColor3" />
      </IconBtn>
    </RecordOperate>
  );
}

MoreMenu.propTypes = {
  recordbase: PropTypes.shape({}),
  btnDisable: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  reloadRecord: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onButtonClick: PropTypes.func,
};
