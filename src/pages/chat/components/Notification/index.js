import React, { Component } from 'react';
import { notification, NotificationContent } from 'ming-ui/components/Notification';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './index.less';

export class ChatNotificationContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: false,
      isFailed: false,
    };
  }
  componentDidMount() {
    this.reconnectFn = this.reconnect.bind(this);
    this.reconnectFailedFn = this.reconnectFailed.bind(this);

    IM.socket.on('reconnect', this.reconnectFn);
    IM.socket.on('reconnect_failed', this.reconnectFailedFn);
  }
  componentWillUnmount() {
    IM.socket.off('reconnect', this.reconnectFn);
    IM.socket.off('reconnect_failed', this.reconnectFailedFn);
  }
  reconnect() {
    // console.log('reconnect 重连成功');
    this.setState({
      status: true,
    });
  }
  reconnectFailed() {
    // console.log('reconnect_failed 重连失败，区别于连接失败');
    this.setState({
      isFailed: true,
    });
  }
  handleClose() {
    notification.close('chat');
    notification.close('connectedError');
  }
  renderHeader() {
    const { status, isFailed } = this.state;
    if (status) {
      return (
        <div className="Chat-Notification-header">
          <i className="icon-plus-interest" />
          <span className="title">{_l('网络已连接')}</span>
        </div>
      );
    } else {
      return (
        <div className="Chat-Notification-header">
          {isFailed ? (
            <i className="icon-task-setting_promet" />
          ) : (
            <span>
              <LoadDiv size="small" />
            </span>
          )}
          <span className="title">{_l('网络连接已断开')}</span>
        </div>
      );
    }
  }
  renderReset() {
    const { isFailed } = this.state;
    return isFailed ? (
      <div
        className="ThemeColor3"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          location.reload();
        }}
      >
        {_l('刷新页面')}
      </div>
    ) : (
      <div className="ThemeColor3">{_l('正在重新连接')}</div>
    );
  }
  renderFooter() {
    const { status } = this.state;
    return status ? (
      <div onClick={this.handleClose.bind(this)} className="ThemeColor3" style={{ cursor: 'pointer' }}>
        {_l('关闭')}
      </div>
    ) : (
      this.renderReset()
    );
  }
  render() {
    const { status, stateText } = this.state;
    return <NotificationContent themeColor={status ? 'success' : 'error'} header={this.renderHeader()} footer={this.renderFooter()} />;
  }
}
