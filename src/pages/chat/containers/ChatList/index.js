import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import cx from 'classnames';
import './index.less';
import SessionList from '../SessionList';
import Btns from '../Btns';
import * as socket from '../../utils/socketEvent';
import * as actions from '../../redux/actions';
import accountSettingApi from 'src/api/accountSetting';

class Chat extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // 注册事件
    socket.socketInitEvent.call(this);
    // 回复窗口
    window.reloadChatPanel = _.debounce((id, isGroup) => {
      if (isGroup) {
        this.props.dispatch(actions.addGroupSession(id));
      } else {
        this.props.dispatch(actions.addUserSession(id));
      }
    });
    // 更新草稿
    window.updateChatSessionList = _.debounce((id, value) => {
      this.props.dispatch(
        actions.updateSessionList({
          id,
          sendMsg: value,
        }),
      );
    });
    // 获取新消息通知配置
    accountSettingApi.getAccountSettings({}).then(data => {
      const settings = {
        isOpenMessageSound: data.isOpenMessageSound,
        isOpenMessageTwinkle: data.isOpenMessageTwinkle,
        backHomepageWay: data.backHomepageWay || 1,
      }
      Object.assign(window, settings);
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.visible !== this.props.visible) {
      return true;
    }
    return false;
  }
  render() {
    const { visible, location, history } = this.props;

    return (
      <div className={cx('ChatList-wrapper', { open: visible })}>
        <div className="ThemeBG ChatList-blur" />
        <SessionList />
        <Btns {...{ location, history }} />
      </div>
    );
  }
}

export default connect(state => {
  const { visible } = state.chat;
  return {
    visible,
  };
})(Chat);
