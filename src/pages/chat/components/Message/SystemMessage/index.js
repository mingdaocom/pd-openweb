import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import Constant from '../../../utils/constant';
import dialog from 'src/components/addFriendConfirm/addFriendConfirm';
import invite from 'src/components/invite';

export default class SystemMessage extends Component {
  constructor(props) {
    super(props);
  }
  addFriend() {
    const { session } = this.props;
    dialog({
      accountId: session.id,
    });
  }
  invite() {
    const { session } = this.props;
    invite({
      friendVisible: false,
      accountId: session.id,
    });
  }
  handleClick(event) {
    const { target } = event;
    if (target.tagName === 'SPAN') {
      target.classList.contains('addFriend') && this.addFriend();
      target.classList.contains('invite') && this.invite();
    }
  }
  render() {
    const { message } = this.props;
    return (
      <div className="Message-sysType">
        <div
          className={cx('Message-sysType-icon', {
            'Message-sysType-reduceIcon': message.sysType === Constant.MSGTYPE_SYSTEM_ERROR,
          })}
        >
          <i className="icon-wc-sysmsg" />
        </div>
        {'isContact' in message ? (
          <div
            onClick={this.handleClick.bind(this)}
            className="Message-sysType-text"
            dangerouslySetInnerHTML={{
              __html: _l(
                `对方不是您的联系人，可以%0或%1成为组织成员`,
                `<span class="ThemeColor3 Font13 pointer addFriend">${_l('添加好友')}</span>`,
                `<span class="ThemeColor3 Font13 pointer invite">${_l('邀请')}</span>`,
              ),
            }}
          />
        ) : (
          <div onClick={this.handleClick.bind(this)} className="Message-sysType-text">
            {message.msg.con}
          </div>
        )}
      </div>
    );
  }
}
