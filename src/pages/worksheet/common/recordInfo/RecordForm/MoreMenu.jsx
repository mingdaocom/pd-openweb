import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dialog } from 'ming-ui';
import cx from 'classnames';
import RecordOperate from 'worksheet/components/RecordOperate';
import IconBtn from './IconBtn';
export default function MoreMenu(props) {
  const {
    recordbase,
    buttons,
    btnDisable,
    recordinfo,
    sheetSwitchPermit,
    onButtonClick,
    onDelete,
    reloadRecord,
    onUpdate,
    handleAddSheetRow,
  } = props;
  const { from, isCharge, notDialog, appId, worksheetId, viewId, recordId, workId, instanceId } = recordbase;
  const { allowDelete, receiveControls, projectId, allowAdd } = recordinfo;
  return (
    <RecordOperate
      from={from}
      showDeleteHr={false}
      shows={['share', 'share', 'print', 'task', 'copy', 'editform', cx({ openinnew: !notDialog })]}
      isCharge={isCharge}
      allowDelete={allowDelete}
      allowCopy={allowAdd}
      projectId={projectId}
      appId={appId}
      viewId={viewId}
      worksheetId={worksheetId}
      recordId={recordId}
      workId={workId}
      instanceId={instanceId}
      formdata={receiveControls}
      disableLoadCustomButtons
      defaultCustomButtons={buttons}
      btnDisable={btnDisable}
      sheetSwitchPermit={sheetSwitchPermit}
      onDelete={onDelete}
      onButtonClick={onButtonClick}
      reloadRecord={reloadRecord}
      onUpdate={onUpdate}
      onCopySuccess={handleAddSheetRow}
    >
      <IconBtn className="moreBtn Hand Gray_9e Font22 mLeft10">
        <Icon icon="task-point-more" className="ThemeHoverColor3" />
      </IconBtn>
    </RecordOperate>
  );
}

MoreMenu.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.shape({})),
  recordbase: PropTypes.shape({}),
  btnDisable: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  reloadRecord: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onButtonClick: PropTypes.func,
};
