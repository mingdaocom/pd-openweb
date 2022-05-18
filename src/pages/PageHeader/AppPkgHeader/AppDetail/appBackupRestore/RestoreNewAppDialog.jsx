import React from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import { restore } from 'src/api/appManagement.js';
import { getPssId } from 'src/util/pssId';

const RestoreNewAppCon = styled.div`
  font-size: 13px;
  line-height: 17px;
  color: #757575;
`;

export default function RestoreNewAppDialog(props) {
  const { visible, projectId, appId, token, actCurrentFileInfo, getList = () => {} } = props;

  const onOk = () => {
    let params = {
      projectId,
      appId,
      id: actCurrentFileInfo.id,
      autoEndMaintain: false,
      backupCurrentVersion: false,
      isRestoreNew: true,
    };
    props.closeRestoreNewAppDialog();
    restore(params).then(res => {
      getList(1);
    });
  };
  return (
    <Dialog
      title={_l('还原为新应用')}
      visible={visible}
      widhth={480}
      onCancel={() => props.closeRestoreNewAppDialog()}
      onOk={onOk}
      overlayClosable={false}
    >
      <RestoreNewAppCon>
        {_l('确定将备份文件“%0”还原为一个新的应用吗？', actCurrentFileInfo.backupFileName)}
      </RestoreNewAppCon>
    </Dialog>
  );
}
