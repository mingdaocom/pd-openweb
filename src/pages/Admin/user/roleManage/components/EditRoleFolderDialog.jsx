import React, { useState } from 'react';
import { Input, Modal } from 'ming-ui/antd-components';
import organizeAjax from 'src/api/organize.js';

function EditRoleFolderDialog(props) {
  const { visible, info, projectId, refresh, onClose } = props;

  const [name, setName] = useState(info.name || undefined);

  const onOk = () => {
    if (!name || !name.trim()) {
      alert(_l('请输入名称'), 3);
      return;
    }

    organizeAjax
      .upsertOrgRoleGroup({
        projectId,
        orgRoleGroupId: info.id,
        orgRoleGroupName: name,
      })
      .then(res => {
        switch (res) {
          case 0:
            alert(_l('添加失败'), 2);
            break;
          case 1:
            alert(_l('添加成功'));
            break;
          case 2:
            alert(_l('名称已存在'), 3);
            break;
          case 3:
            alert(_l('最多可添加50个分组'), 2);
            break;
        }

        res !== 2 && onClose();
        res === 1 && refresh();
      });
  };

  return (
    <Modal
      open={visible}
      title={info.id ? _l('编辑角色组') : _l('添加角色组')}
      okText={info.id ? _l('保存') : _l('添加')}
      onCancel={onClose}
      onOk={onOk}
    >
      <div>
        <div className="Font14 mBottom13">{_l('名称')}</div>
        <Input
          type="text"
          value={name}
          maxLength={64}
          autoFocus
          className="roleFolderName TxtBottom w100"
          onChange={e => setName(e.target.value || '')}
        />
      </div>
    </Modal>
  );
}

export default EditRoleFolderDialog;
