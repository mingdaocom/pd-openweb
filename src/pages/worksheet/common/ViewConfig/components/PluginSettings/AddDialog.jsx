import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Textarea } from 'ming-ui';

const AddContent = styled.div`
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
`;

export default function AddDialog(props) {
  const { onCancel, onOk } = props;
  const [value, setValue] = useState('');
  return (
    <Dialog
      bodyClass="pBottom0"
      width={720}
      visible
      title={_l('输入JSON代码添加配置')}
      onOk={() => onOk(value)}
      onCancel={() => onCancel()}
    >
      <AddContent>
        <Textarea name="textarea" style={{ maxHeight: '500px', minHeight: 450 }} value={value} onChange={setValue} />
      </AddContent>
    </Dialog>
  );
}
