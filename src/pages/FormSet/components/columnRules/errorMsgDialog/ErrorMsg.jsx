import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'antd';
import { Dialog } from 'ming-ui';
import cx from 'classnames';
import './ErrorMsg.less';
import _ from 'lodash';
const { TextArea } = Input;

class ErrorMsg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: this.props.value || '',
    };
  }

  render() {
    const { errorMsg } = this.state;
    const { onClose, onOk } = this.props;
    return (
      <Dialog
        title={_l('设置错误提示')}
        className={'ruleWarnMsgDialog'}
        visible={true}
        footer={null}
        width={480}
        overlayClosable={false}
        onCancel={() => onClose()}
      >
        <div className="ruleErrorDialog">
          <span className="Gray_9e">{_l('在输入或提交记录时校验并提示错误，错误时不允许提交')}</span>
          <span className="Gray Bold mTop24 mBottom12 Block">{_l('提示内容')}</span>
          <TextArea
            value={errorMsg}
            rows={4}
            onChange={e => this.setState({ errorMsg: e.target.value })}
            placeholder={_l('请输入提示内容...')}
          />
          <div className="ruleFooter">
            <button type="button" className="ming Button Button--link Gray_9e" onClick={() => onClose()}>
              {_l('取消')}
            </button>
            <button
              type="button"
              disabled={!errorMsg}
              className={cx('ming Button', errorMsg ? 'Button--primary' : 'disabled')}
              onClick={() => {
                onOk(errorMsg);
                onClose();
              }}
            >
              {_l('保存')}
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default function handleSetMsg(props) {
  const $container = document.createElement('div');
  document.body.appendChild($container);
  function handleClose() {
    const timer = setTimeout(() => {
      const isHaveComponent = ReactDOM.unmountComponentAtNode($container);
      if (isHaveComponent && $container.parentElement) {
        $container.parentElement.removeChild($container);
        clearTimeout(timer);
        if (_.isFunction(props.onCancel)) {
          props.onCancel();
        }
      }
    }, 0);
  }
  ReactDOM.render(<ErrorMsg onClose={handleClose} {...props} />, $container);
  return handleClose;
}
