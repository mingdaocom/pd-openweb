import React, { Component } from 'react';
import { Tooltip } from 'ming-ui/antd-components';
import config from '../../utils/config';
import Constant from '../../utils/constant';
import './index.less';

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
        <Tooltip title={_l('点击切换输入方式')}>
          <div onClick={this.handleSwitchSendWay.bind(this)}>
            {type === Constant.INPUT_MODE_CTRLENTER ? _l('Enter换行，') : _l('Ctrl+Enter换行，')}
          </div>
        </Tooltip>
        <Tooltip title={_l('点击发送')}>
          <div onClick={this.props.onSendMsg.bind(this, '')}>
            {type === Constant.INPUT_MODE_CTRLENTER ? _l('Ctrl+Enter发送') : _l('Enter发送')}
          </div>
        </Tooltip>
      </div>
    );
  }
}
