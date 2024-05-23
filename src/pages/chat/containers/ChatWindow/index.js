import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import _ from 'lodash';
import cx from 'classnames';
import preall from 'src/common/preall';
import '../ChatPanel/index.less';
import * as actions from '../../redux/actions';
import * as utils from '../../utils/';
import * as ajax from '../../utils/ajax';
import ChatPanelSession from '../ChatPanelSession';
import Inbox from '../../components/Inbox';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { socketInit } from 'src/socket';
import * as socket from '../../utils/socket';
import * as socketEvent from '../../utils/socketEvent';
import Constant from '../../utils/constant';
import { TYPES } from '../../lib/addressBook/constants';

@preall
class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const { session } = this.props;
    const { id, type } = session;

    ajax
      .chatSessionItem({
        type,
        value: id,
      })
      .then(result => {
        let data = {};
        if (type == Constant.SESSIONTYPE_USER) {
          data = {
            isGroup: false,
            uname: result.fullname,
            count: 0,
            from: result.accountId,
            logo: result.avatar,
            sysType: 1,
            msg: { con: '' },
          };
        } else if (type == Constant.SESSIONTYPE_GROUP) {
          data = {
            isGroup: true,
            groupname: result.name,
            count: 0,
            to: result.groupId,
            from: result.from,
            avatar: result.avatar,
            sysType: 1,
            msg: { con: '' },
          };
        }
        this.props.dispatch(actions.setIsWindow(true));
        this.props.dispatch(actions.addSession(data));

        this.props.dispatch(
          actions.setNewCurrentSession({
            value: id,
          }),
        );
        this.props.dispatch(actions.addCurrentSession(result));
        this.setState({ loading: false });
      });

    // socket 连接
    socketInit();
    // 注册事件
    type == Constant.SESSIONTYPE_USER ? socketEvent.userInit.call(this) : socketEvent.groupInit.call(this);
    socketEvent.stateInit.call(this);
    socket.Contact.setCurrentChat({
      value: id,
      type: Number(type),
    });

    utils.chatWindow.set(id);
    window.addEventListener('beforeunload', () => {
      utils.chatWindow.remove(id);
      socket.Contact.setCurrentChat({});
    });
  }
  render() {
    const { loading } = this.state;
    const { currentSession, currentSessionList } = this.props;
    return (
      <div className="ChatPanel-wrapper ChatPanel-window">
        {currentSessionList.map(item => (
          <ChatPanelSession session={item} key={item.accountId || item.groupId} />
        ))}
        {loading ? (
          <div className="ChatPanel ChatPanel-loading">
            <LoadDiv size="middle" />
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }
}

const ConnectChatWindow = connect(state => {
  const { currentSession, currentSessionList, sessionList, isWindow } = state.chat;
  return {
    currentSession,
    currentSessionList,
    sessionList,
    isWindow,
  };
})(ChatWindow);

export default ConnectChatWindow;
