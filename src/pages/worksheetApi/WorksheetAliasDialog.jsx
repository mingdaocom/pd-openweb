import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';

const Wrap = styled.div`
  input {
    border: 1px solid #ddd;
    border-radius: 3px;
    height: 36px;
    line-height: 36px;
    padding: 0 6px;
    width: 100%;
    box-sizing: border-box;
    &:focus {
      border: 1px solid #1677ff;
    }
  }
`;

export default function WorksheetAliasDialog(props) {
  const { onOk, onClose } = props;
  const [alias, setAlias] = useState(props.alias || '');

  return (
    <Dialog className="" visible={true} onCancel={onClose} title={_l('设置工作表别名')} onOk={() => onOk(alias)}>
      <Wrap>
        <input
          type="text"
          className="name mTop6"
          placeholder={_l('请输入')}
          value={alias}
          onChange={e => {
            setAlias(e.target.value.trim());
          }}
        />
      </Wrap>
    </Dialog>
  );
}
