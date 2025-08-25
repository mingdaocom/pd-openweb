import React, { Component } from 'react';
import { connect } from 'react-redux';
import LoadDiv from 'ming-ui/components/LoadDiv';
import preall from 'src/common/preall';
import { socketInit } from 'src/socket';
import * as actions from '../../redux/actions';
import * as utils from '../../utils/';
import * as ajax from '../../utils/ajax';
import Constant from '../../utils/constant';
import * as socket from '../../utils/socket';
import * as socketEvent from '../../utils/socketEvent';
import ChatPanelSession from '../ChatPanelSession';
import '../ChatPanel/index.less';

let hasMounted = false;

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

    if (hasMounted) return;
    hasMounted = true;
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
    const { currentSessionList } = this.props;
    return (
      <div className="ChatPanel-wrapper ChatPanel-window">
        {loading ? (
          <div className="ChatPanel ChatPanel-loading">
            <LoadDiv size="middle" />
          </div>
        ) : (
          currentSessionList.map(item => <ChatPanelSession session={item} key={item.accountId || item.groupId} />)
        )}
      </div>
    );
  }
}

const ConnectChatWindow = connect(state => {
  const { currentSessionList, isWindow } = state.chat;
  return {
    currentSessionList,
    isWindow,
  };
})(ChatWindow);

export default ConnectChatWindow;
