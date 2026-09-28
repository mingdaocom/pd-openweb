import React, { useState } from 'react';
import { Input, Modal } from 'ming-ui/antd-components';

export default function ChangeName(props) {
  const { name, onCancel, onChange, title, deduplication, list } = props;
  const [value, setValue] = useState(name);
  return (
    <Modal
      open
      title={title || _l('重命名')}
      onCancel={onCancel}
      onOk={() => {
        let name = (value || '').trim();

        if (deduplication && list.find(item => item.alias === name)) {
          return alert(_l('名称重复，请修改后提交'), 3);
        }

        if (!name) {
          return alert(_l('名称不能为空'), 3);
        }

        onChange(name);
        onCancel();
      }}
    >
      <div>
        <Input
          className="w100"
          value={value}
          onChange={event => setValue(event.target.value)}
          autoFocus
          maxLength={60}
        />
      </div>
    </Modal>
  );
}
