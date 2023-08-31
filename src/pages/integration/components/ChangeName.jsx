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
  const { name, onCancel, onChange } = props;
  const [value, setValue] = useState(name);
  return (
    <Dialog
      visible
      title={_l('重命名')}
      onCancel={onCancel}
      onOk={() => {
        onChange(value.trim());
        onCancel();
      }}
    >
      <EditShowNameCon>
        <Input className="w100" value={value} onChange={setValue} autoFocus />
      </EditShowNameCon>
    </Dialog>
  );
}
