import React from 'react';
import { createRoot } from 'react-dom/client';
import Dialog from './Dialog';
import ConfirmButton from './ConfirmButton';
import '../less/Dialog.less';
import _ from 'lodash';

export default function confirm(props) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);
  const handleClose = (needExecCancel = true, isOkBtn) => {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(div);
      if (needExecCancel && _.isFunction(props.onCancel)) {
        props.onCancel(isOkBtn);
      }
    }, 0);
  };

  let footer = (
    <div className="Dialog-footer-btns">
      {!props.removeCancelBtn && (
        <ConfirmButton
          action={props.onCancel}
          onClose={() => handleClose(!props.onlyClose)}
          type={props.cancelType || 'link'}
          className={props.cancelClassName}
        >
          {props.cancelText || _l('取消')}
        </ConfirmButton>
      )}
      {!props.removeOkBtn && (
        <ConfirmButton
          disabled={props.okDisabled}
          action={props.onOk}
          onClose={() => handleClose(!props.onlyClose, true)}
          type={props.buttonType || 'primary'}
          className={props.okClassName}
        >
          {props.okText || _l('确认')}
        </ConfirmButton>
      )}
    </div>
  );
  if (props.noFooter) {
    footer = null;
  }

  let dealProps = props;
  if (props.onlyClose) {
    dealProps = { ...dealProps, handleClose: () => handleClose(false) };
  }

  root.render(
    <Dialog
      bindEnterTriggerOk={false}
      {...dealProps}
      visible
      overlayClosable={props.overlayClosable || false}
      description={props.description}
      footer={props.footer || footer}
      onOk={handleClose}
      confirmOnOk={props.onOk}
      onCancel={handleClose}
      confirm={props.type || 'confirm'}
    />,
  );

  return handleClose;
}
