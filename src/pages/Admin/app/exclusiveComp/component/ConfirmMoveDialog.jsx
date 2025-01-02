import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import { MIGRATE_CODE } from '../config';

const Content = styled.div`
  .warningInfo {
    color: #f51744 !important;
    line-height: 24px;
    font-size: 13px;
    margin-bottom: 20px;
  }
`;

function ConfirmMoveDialog(props) {
  const { visible = false, type = 'move', projectId, dataBaseInfo = {}, appInfo = {}, onClose } = props;

  const [name, setName] = useState(undefined);

  const handleOk = () => {
    appManagementAjax
      .migrate({
        appId: appInfo.appId,
        dbInstanceId: dataBaseInfo.id,
        projectId,
      })
      .then(({ code }) => {
        alert(MIGRATE_CODE[code], code === 1 ? 1 : 2);
        onClose();
      });
  };

  return (
    <Dialog
      visible={visible}
      width={460}
      title={
        <span>
          {type === 'move'
            ? _l('将应用迁移到数据库：%0', dataBaseInfo.name)
            : _l('将应用从数据库 "%0" 中移出', dataBaseInfo.name)}
        </span>
      }
      okDisabled={(name || '').trim() !== appInfo.appName}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Content>
        <div className="Font13 Gray mBottom20">{_l('点击确认后开始迁移应用 "%0" 的所有数据', appInfo.appName)}</div>
        <div className="warningInfo">
          <div>{_l('迁移过程中，应用将无法使用')}</div>
          <div>{_l('迁移过程中，正在写入的数据可能会丢失，请保证在空闲时间进行操作')}</div>
          <div>{_l('应用迁移不允许频繁操作，每天只能移动一次')}</div>
        </div>
        <div className="Font13 mBottom8 Gray_75">{_l('请输入应用名称，表示您确认迁移此应用')}</div>
        <Input autoFocus className="w100" value={name} onChange={value => setName(value)} />
      </Content>
    </Dialog>
  );
}

export default ConfirmMoveDialog;
