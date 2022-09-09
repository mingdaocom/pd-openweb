import React, { Component } from 'react';
import './index.less';
import config from '../../utils/config';
import Constant from '../../utils/constant';

export default class MessageSendText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: config.inputMode,
    };
  }
  handleSwitchSendWay() {
    const { type } = this.state;
    const newType = type === Constant.INPUT_MODE_ENTER ? Constant.INPUT_MODE_CTRLENTER : Constant.INPUT_MODE_ENTER;
    this.setState({
      type: newType,
    });
    config.inputMode = newType;
    safeLocalStorageSetItem('im_input_mode', newType);
  }
  render() {
    const { type } = this.state;
    const { value } = this.props;
    return (
      <div className="chatPanel-message-send-text" style={{ visibility: value ? 'initial' : 'hidden' }}>
        <div data-tip={_l('点击切换输入方式')} className="tip-top" onClick={this.handleSwitchSendWay.bind(this)}>
          {type === Constant.INPUT_MODE_CTRLENTER ? _l('Enter换行，') : _l('Ctrl+Enter换行，')}
        </div>
        <div data-tip={_l('点击发送')} className="tip-top" onClick={this.props.onSendMsg.bind(this, '')}>
          {type === Constant.INPUT_MODE_CTRLENTER ? _l('Ctrl+Enter发送') : _l('Enter发送')}
        </div>
      </div>
    );
  }
}
