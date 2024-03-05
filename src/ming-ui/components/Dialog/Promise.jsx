import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog';
import ConfirmButton from './ConfirmButton';
import '../less/Dialog.less';

export default function promise(props) {
  // 在Document中创建父节点
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 记录状态
  let step = null;
  let confirm = false;

  // 封装Promise
  return new Promise((resolve, reject) => {
    step = (async function* () {
      // 关闭弹框处理函数
      const handlerClose = value => {
        // 判断用户点击确定还是取消
        confirm = value;

        // 关闭弹框，执行后续步骤
        if (step.next) step.next();
      };

      // 底部
      const footer = (
        <div className="Dialog-footer-btns">
          {!props.removeCancelBtn && (
            <ConfirmButton
              action={props.onCancel}
              onClose={() => handlerClose(false)}
              type={props.cancelType || 'link'}
            >
              {props.cancelText || '取消'}
            </ConfirmButton>
          )}
          <ConfirmButton action={props.onOk} onClose={() => handlerClose(true)} type={props.buttonType || 'primary'}>
            {props.okText || '确认'}
          </ConfirmButton>
        </div>
      );

      // 显示弹框
      const dialog = (
        <Dialog
          {...props}
          visible
          overlayClosable={props.overlayClosable || false}
          description={props.description}
          footer={footer}
          onOk={() => handlerClose(true)}
          onCancel={() => handlerClose(false)}
          confirm={props.type || 'confirm'}
        />
      );
      ReactDOM.render(dialog, container);

      // 等待用户点击确定 / 取消
      yield;

      // 关闭弹框
      const res = ReactDOM.unmountComponentAtNode(container);
      if (res && container.parentNode) container.parentNode.removeChild(container);

      // 判断用户点击确定还是取消
      if (confirm) resolve();
      else reject();
    })();

    // 展示弹框
    step.next();
  });
}
