import React, { Component } from 'react';
import { Tooltip } from 'ming-ui/antd-components';
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
    const { value, socketState = 0 } = this.props;
    return (
      <div className="chatPanel-message-send-text flexRow Font12 textTertiary">
        <div className="flexRow alignItemsCenter" style={{ flex: 2 }}>
          {socketState === 1 && _l('正在尝试重新连接，暂时无法发送消息。')}
          {socketState === 2 && _l('连接失败，暂时无法发送消息，请刷新页面重试。')}
        </div>
        <div
          className="flex flexRow alignItemsCenter justifyContentRight pointer"
          style={{ visibility: value ? 'initial' : 'hidden' }}
        >
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
      </div>
    );
  }
}
