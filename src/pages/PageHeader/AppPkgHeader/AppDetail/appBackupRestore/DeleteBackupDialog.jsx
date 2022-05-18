import React from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import { deleteBackupFile } from 'src/api/appManagement';
import './less/manageBackupFilesDialog.less';

const DeleteBackupCon = styled.div`
  font-size: 13px;
  line-height: 17px;
  color: #757575;
`;

export default function DeleteBackupDialog(props) {
  const { visible, projectId, appId, actCurrentFileInfo, getList = () => {}, getBackupCount = () => {} } = props;

  const onOk = () => {
    deleteBackupFile({
      id: actCurrentFileInfo.id,
      projectId,
      appId,
      fileName: actCurrentFileInfo.backupFileName,
    }).then(res => {
      if (res) {
        alert(_l('删除成功 '));
        getList(1);
        getBackupCount();
      } else {
        alert(_l('删除失败 '), 2);
      }
    });
    props.closeDeleteBackupDialog();
  };
  return (
    <Dialog
      className="deleteBackupDialog"
      title={<span className="Red">{_l('删除备份')}</span>}
      visible={visible}
      widhth={480}
      onCancel={() => props.closeDeleteBackupDialog()}
      onOk={onOk}
      overlayClosable={false}
    >
      <DeleteBackupCon>{_l('确定将备份文件“%0”删除吗？', actCurrentFileInfo.backupFileName)}</DeleteBackupCon>
    </Dialog>
  );
}
