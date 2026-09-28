import React, { useState } from 'react';
import { Input, Modal } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/worksheet';

export default function WorkAliasDialog(props) {
  const { type = 'worksheet', appId, worksheetId, updateAlias, onClose } = props;
  const [alias, setAlias] = useState(props.alias || '');
  const workType = type === 'worksheet' ? _l('工作表') : _l('工作流');

  const onOk = () => {
    if (type === 'worksheet') {
      ajaxRequest.updateWorksheetAlias({ appId, worksheetId, alias }).then(res => {
        if (res === 0) {
          updateAlias(alias);
        } else if (res === 3) {
          alert(_l('工作表别名格式不匹配'), 3);
        } else if (res === 2) {
          alert(_l('工作表别名已存在，请重新输入'), 3);
        } else {
          alert(_l('别名修改失败'), 3);
        }
      });
      return;
    }
  };

  return (
    <Modal
      width={480}
      open
      title={_l('设置%0别名', workType)}
      mask={{ closable: true }}
      keyboard
      onCancel={onClose}
      onOk={onOk}
    >
      <Input
        className="name mTop6"
        placeholder={_l('请输入')}
        value={alias}
        onChange={e => {
          setAlias(e.target.value.trim());
        }}
      />
    </Modal>
  );
}
