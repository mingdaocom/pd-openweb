import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Modal } from 'ming-ui/antd-components';

const AddContent = styled.div`
  .textareaWrap {
    height: 320px;
    overflow-y: auto;
  }
`;

const ADD_PLUGIN_MODAL_STYLES = {
  body: { paddingBottom: 0 },
};
const TEXTAREA_STYLE = { maxHeight: 500, minHeight: 450 };

export default function AddDialog(props) {
  const { onCancel, onOk } = props;
  const [value, setValue] = useState('');
  return (
    <Modal
      styles={ADD_PLUGIN_MODAL_STYLES}
      width={720}
      open
      title={_l('输入JSON代码添加配置')}
      onOk={() => onOk(value)}
      onCancel={() => onCancel()}
    >
      <AddContent>
        <Input.TextArea
          autoSize
          name="textarea"
          style={TEXTAREA_STYLE}
          value={value}
          onChange={event => setValue(event.target.value)}
        />
      </AddContent>
    </Modal>
  );
}
