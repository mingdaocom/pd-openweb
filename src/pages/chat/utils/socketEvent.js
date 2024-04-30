import React from 'react';
import * as actions from '../redux/actions';
import { mdNotification } from 'ming-ui/functions';
import renderLogout from '../components/Logout';
import { getPssId } from 'src/util/pssId';
import { removeFlashTitle } from './index';
import sessionNewMsgAudio from 'src/pages/chat/lib/mp3player/sessionNewMsgAudio.html';
import systemNewMsgAudio from 'src/pages/chat/lib/mp3player/systemNewMsgAudio.html';

export const socketInitEvent = function () {
  $(sessionNewMsgAudio).appendTo('html > body');
  $(systemNewMsgAudio).appendTo('html > body');

  stateInit.call(this);

  userInit.call(this);

  groupInit.call(this);

  notifyInit.call(this);

  sync.call(this);

  IM.socket.on('logout message', ({ sessionId }) => {
    if ((getPssId() || '') === sessionId) {
      $('.mdAlertDialog').remove();
      setTimeout(() => {
        if (!window.currentLeave) {
          renderLogout();
        }
      }, 200);
    }
  });
};

export const groupInit = function () {
  // 创建群组
  IM.socket.on('new group', message => {
    this.props.dispatch(actions.newGroup(message));
  });

  // 新的群组信息
  IM.socket.on('new group message', message => {
    this.props.dispatch(actions.newGroupMessage(message));
  });

  // 群组收到 @ 消息
  IM.socket.on('group shake', message => {
    this.props.dispatch(actions.groupShake(message));
  });

  // 添加群组成员
  IM.socket.on('group member added', data => {
    const { id, users } = data;
    this.props.dispatch(actions.updateMember(id, users.length));
  });

  // 群组成员被移除
  IM.socket.on('group member removed', data => {
    const { id } = data;
    this.props.dispatch(actions.updateMember(id, -1));
  });

  // 自己被移除出群组 或者是关闭群组 解散群组
  IM.socket.on('removed from group', data => {
    this.props.dispatch(actions.removedFromGroup(data));
  });

  // 仅允许群主及管理员邀请新成员
  IM.socket.on('can add member', data => {
    const { gid, can } = data;
    this.props.dispatch(actions.updateForbIdInvite(gid, !can));
  });

  // 群组添加管理
  IM.socket.on('group admin added', data => {
    const { gid, addAid } = data;
    const { accountId } = md.global.Account;
    if (accountId === addAid) {
      this.props.dispatch(actions.updateAdmin(gid, true));
    }
  });

  // 群组移除管理
  IM.socket.on('group admin removed', data => {
    const { gid, removedAid } = data;
    const { accountId } = md.global.Account;
    if (accountId === removedAid) {
      this.props.dispatch(actions.updateAdmin(gid, false));
    }
  });

  // 收到群组撤回的消息
  IM.socket.on('new withdraw groupmessage', message => {
    this.props.dispatch(actions.newWithdrawGroupMessage(message));
  });

  // 同步设置群组消息免打扰
  IM.socket.on('set group notice', message => {
    const { isPush, gid } = message;
    this.props.dispatch(actions.updateGroupPushNotice(gid, isPush));
    isPush ? alert(_l('已关闭消息免打扰')) : alert(_l('已开启消息免打扰'));
  });
};

export const userInit = function () {
  // 新的个人信息
  IM.socket.on('new message', message => {
    this.props.dispatch(actions.newUserMessage(message));
  });

  // 个人收到抖动消息
  IM.socket.on('shake shake', message => {
    this.props.dispatch(actions.userShake(message));
  });

  // 收到个人撤回消息
  IM.socket.on('new withdraw usermessage', message => {
    const id = md.global.Account.accountId === message.from ? message.to : message.from;
    this.props.dispatch(actions.updateWithdrawMessage(id, message));
    this.props.dispatch(
      actions.updateSessionList({
        id,
        addMsg: message.msg.con,
      }),
    );
  });
};

export const notifyInit = function () {
  // 新的系统消息
  IM.socket.on('new notify', message => {
    this.props.dispatch(actions.newNotifyMessage(message));
  });
};

export const stateInit = function () {
  const key = 'chat';
  const reconnectDelayTime = 5000;
  let disconnectTime = 0;
  let isOpen = true;
  let reconnectCount = 1;

  const reconnectFn = () => {
    mdNotification.close(key);
    mdNotification.success({
      key,
      title: _l('网络已连接'),
      duration: 2,
    });
    IM.socket.off('reconnect', reconnectFn);
    IM.socket.off('reconnect_failed', reconnectFailedFn);
  };
  const reconnectFailedFn = () => {
    mdNotification.close(key);
    mdNotification.error({
      key,
      title: _l('网络连接已断开'),
      duration: null,
      description: <div className="Gray_9e">{_l('重连失败，请重新刷新页面')}</div>,
      btnList: [
        {
          text: _l('刷新'),
          onClick: () => {
            location.reload();
          },
        },
      ],
    });
    IM.socket.off('reconnect', reconnectFn);
    IM.socket.off('reconnect_failed', reconnectFailedFn);
  };
  const notificationInit = () => {
    mdNotification.error({
      key,
      title: _l('网络连接已断开'),
      loading: true,
      className: 'closable',
      duration: null,
      description: <div className="ThemeColor TxtRight">{_l('正在重新连接')}</div>,
    });
    IM.socket.on('reconnect', reconnectFn);
    IM.socket.on('reconnect_failed', reconnectFailedFn);
  };

  const open = () => {
    mdNotification.close('connectedError');
    notificationInit();
  };
  let reconnectTime = null;

  IM.socket.on('error', error => {
    if (error && error.code === 'parser error') {
      return;
    }
    if (isOpen) {
      isOpen = false;
      open();
    }
  });

  IM.socket.on('disconnect', () => {
    disconnectTime = Date.now();
    reconnectTime = setTimeout(() => {
      if (isOpen) {
        isOpen = false;
        open();
      }
      removeFlashTitle('', []);
    }, reconnectDelayTime);
  });

  IM.socket.on('reconnecting', () => {
    if (reconnectCount > 1) {
    } else {
      reconnectCount++;
    }
    if (window.localStorage.getItem('websocket') == 'polling') {
      IM.socket.io.opts.transports = ['polling'];
    }
  });

  IM.socket.on('reconnect', () => {
    if (Date.now() - disconnectTime < reconnectDelayTime) {
      clearTimeout(reconnectTime);
    }
    if (reconnectCount > 1) {
      isOpen = true;
      setTimeout(() => {
        mdNotification.close(key);
        mdNotification.close('connectedError');
      }, 3000);
      this.props.dispatch(actions.refresh());
    }
  });
};

export const sync = function () {
  // 清除单个会话 其他页面接收到推送
  IM.socket.on('session removed', message => {
    this.props.dispatch(actions.sessionRemoved(message));
  });

  // 清除会话（个人和群组）的未读消息计数
  IM.socket.on('clear unread', message => {
    this.props.dispatch(actions.clearUnread(message));
  });

  // 清除 inbox 的未读计数
  IM.socket.on('clear notification', message => {
    this.props.dispatch(actions.clearNotification(message));
  });

  // 操作状态更改时，在Chat上操作
  IM.socket.on('operate', status => {
    this.props.dispatch(actions.operate(status));
  });

  IM.socket.on('new sticky on top', status => {
    this.props.dispatch(actions.setTop(status));
  });

  IM.socket.on('clear all unread', status => {
    this.props.dispatch(actions.clearAllUnread());
  });

  IM.socket.on('new silence message', status => {
    const { isSilent } = status;
    this.props.dispatch(actions.setSlience(status));
    isSilent ? alert(_l('已开启消息免打扰')) : alert(_l('已关闭消息免打扰'));
  });
};
