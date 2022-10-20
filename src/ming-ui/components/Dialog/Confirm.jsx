import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog';
import ConfirmButton from './ConfirmButton';
import '../less/Dialog.less';

export default function confirm(props) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const handleClose = (needExecCancel = true, isOkBtn) => {
    setTimeout(() => {
      const res = ReactDOM.unmountComponentAtNode(container);
      if (res && container.parentNode) {
        container.parentNode.removeChild(container);
      }
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
        >
          {props.cancelText || '取消'}
        </ConfirmButton>
      )}
      <ConfirmButton
        action={props.onOk}
        onClose={() => handleClose(!props.onlyClose, true)}
        type={props.buttonType || 'primary'}
      >
        {props.okText || '确认'}
      </ConfirmButton>
    </div>
  );
  if (props.noFooter) {
    footer = null;
  }

  let dealProps = props;
  if (props.onlyClose) {
    dealProps = { ...dealProps, handleClose: () => handleClose(false) };
  }
  ReactDOM.render(
    <Dialog
      {...dealProps}
      visible
      overlayClosable={props.overlayClosable || false}
      description={props.description}
      footer={footer}
      onOk={handleClose}
      onCancel={handleClose}
      confirm={props.type || 'confirm'}
    />,
    container,
  );

  return handleClose;
}
