import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import * as actions from '../../redux/actions';
import * as socket from '../../utils/socketEvent';
import Apps from '../Apps';
import SessionList from '../SessionList';
import Mingo from './Mingo';
import Toolbar from './Toolbar';
import ToolbarDrawer from './Toolbar/Drawer';
import './index.less';

class Chat extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (location.href.includes('chat_window')) return;
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
    const { Account } = md.global;
    const settings = {
      isOpenMessageSound: Account.isOpenMessageSound,
      isOpenMessageTwinkle: Account.isOpenMessageTwinkle,
      backHomepageWay: Account.backHomepageWay || 1,
    };
    Object.assign(window, settings);
    // 获取工具栏配置
    const {
      isOpenMingoAI = true,
      isOpenMessage = true,
      isOpenSearch = true,
      isOpenFavorite = true,
      isShowToolName = false,
      isOpenMessageList = true,
      isOpenCommonApp = true,
      commonAppShowType = 2,
      commonAppOpenType = 1,
      messageListShowType = 1,
    } = Account;
    this.props.dispatch(
      actions.setToolbarConfig({
        isOpenMingoAI,
        isOpenMessage,
        isOpenSearch,
        isOpenFavorite,
        isShowToolName,
        isOpenMessageList,
        isOpenCommonApp,
        commonAppShowType,
        commonAppOpenType,
        messageListShowType,
      }),
    );
  }
  onCloseSessionList = () => {
    const { toolbarConfig } = this.props;
    const { sessionListVisible, isOpenCommonApp } = toolbarConfig;
    if (sessionListVisible && !isOpenCommonApp) {
      this.props.dispatch(
        actions.setToolbarConfig({
          sessionListVisible: false,
        }),
      );
    }
  };
  render() {
    const { toolbarConfig } = this.props;
    const { isOpenMessageList, isOpenCommonApp, sessionListVisible, hideOpenCommonApp } = toolbarConfig;
    const isLocal = md.global.Config.IsLocal && !location.hostname.includes('nocoly.com'); //除nocoly外的私有部署环境
    const isInApp = _.get(location.pathname.match(/\/app\/([A-Za-z0-9-]{36})(?=\/|$)/), [1]); //应用
    //除nocoly外的私有部署环境或应用内展示mingo 同时受开关影响（sysconfig.hideAIBasicFun）
    const showMingo = !md.global.SysSettings.hideAIBasicFun && (!isLocal || isInApp);

    return (
      <Fragment>
        <ToolbarDrawer />
        <div className="ChatList-wrapper">
          <Toolbar />
          <div className="divider" />
          <div className="flexColumn flex minHeight0" onClick={this.onCloseSessionList}>
            {isOpenMessageList && (
              <div className={cx('flexColumn flex minHeight0 mTop12 mBottom14', { hide: sessionListVisible })}>
                <SessionList visible={false} />
              </div>
            )}
            {isOpenMessageList && isOpenCommonApp && !sessionListVisible && (
              <div className={cx('divider', { hide: hideOpenCommonApp })} />
            )}
            {isOpenCommonApp && (
              <div
                className={cx('flexColumn alignItemsCenter mTop14 mBottom8', { hide: hideOpenCommonApp })}
                style={{ height: isOpenMessageList && !sessionListVisible ? '30%' : '100%' }}
              >
                <Apps />
              </div>
            )}
          </div>
          <div className={cx({ Hidden: !showMingo })}>
            <div className="divider" />
            <Mingo />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(state => {
  const { toolbarConfig } = state.chat;
  return {
    toolbarConfig,
  };
})(Chat);
