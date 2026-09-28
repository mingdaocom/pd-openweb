import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Modal } from 'ming-ui/antd-components';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';

const VerifyModifyDialogWrap = styled.div`
  p {
    color: var(--color-text-secondary);
    margin: 0;
  }
  .btns {
    margin-top: 32px;
    text-align: right;
    .close {
      margin-right: 16px;
    }
  }
`;

export default function VerifyModifyDialog({ desc, cancelText, onClose, onOk, onCancel }) {
  return (
    <Modal
      width={480}
      open
      styles={{ header: { marginBottom: 8 } }}
      title={_l('您是否保存此次更改')}
      mask={{ closable: true }}
      keyboard
      onCancel={onCancel}
    >
      <VerifyModifyDialogWrap>
        <p>{desc || _l('当前有尚未保存的更改，您在离开当前页面前是否需要保存这些更改。')}</p>
        <div className="btns">
          <Button className="close" onClick={onClose}>
            {cancelText || _l('否，放弃保存')}
          </Button>
          <Button type="primary" onClick={onOk}>
            {_l('是，保存更改')}
          </Button>
        </div>
      </VerifyModifyDialogWrap>
    </Modal>
  );
}

export function verifyModifyDialog(props) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);

  function handleClose() {
    root.unmount();
    document.body.removeChild(div);
  }

  root.render(
    <AntdConfigProvider>
      <VerifyModifyDialog
        onClose={() => {
          handleClose();
        }}
        onOk={() => {
          props.handleSave(() => {
            handleClose();
            if (_.isFunction(props.toPage)) {
              props.toPage();
            }
          });
        }}
        onCancel={handleClose}
        {...props}
      />
    </AntdConfigProvider>,
  );
  return handleClose;
}
