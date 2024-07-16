import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input, Dialog } from 'ming-ui';
const EditShowNameCon = styled.div`
  .title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }
`;
export default function ChangeName(props) {
  const { name, onCancel, onChange, title, deduplication, list } = props;
  const [value, setValue] = useState(name);
  return (
    <Dialog
      visible
      title={title || _l('重命名')}
      onCancel={onCancel}
      onOk={() => {
        let name = value.trim();
        if (deduplication && list.find(item => item.alias === name)) {
          return alert(_l('名称重复，请修改后提交'), 3);
        }
        if (!value.trim()) {
          return alert(_l('名称不能为空'), 3);
        }
        onChange(value.trim());
        onCancel();
      }}
    >
      <EditShowNameCon>
        <Input className="w100" value={value} onChange={setValue} autoFocus maxLength={60} />
      </EditShowNameCon>
    </Dialog>
  );
}
