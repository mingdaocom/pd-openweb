import React from 'react';
import { Dialog, Button } from 'ming-ui';
import styled from 'styled-components';
import { createRoot } from 'react-dom/client';

const VerifyModifyDialogWrap = styled.div`
  p {
    color: #757575;
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
    <Dialog
      visible
      footer={null}
      onCancel={onCancel}
      title={<span style={{ color: '#000' }}>{_l('您是否保存此次更改')}</span>}
    >
      <VerifyModifyDialogWrap>
        <p>{desc || _l('当前有尚未保存的更改，您在离开当前页面前是否需要保存这些更改。')}</p>
        <div className="btns">
          <Button type="ghost" className="close" onClick={onClose}>
            {cancelText || _l('否，放弃保存')}
          </Button>
          <Button type="primary" onClick={onOk}>
            {_l('是，保存更改')}
          </Button>
        </div>
      </VerifyModifyDialogWrap>
    </Dialog>
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
    <VerifyModifyDialog
      onClose={() => {
        handleClose();
      }}
      onOk={() => {
        handleClose();
        props.handleSave();
        if (_.isFunction(props.toPage)) {
          props.toPage();
        }
      }}
      onCancel={handleClose}
      {...props}
    />,
  );
  return handleClose;
}
