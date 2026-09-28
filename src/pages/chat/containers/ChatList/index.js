import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { canShowMingoEntry } from 'src/components/Mingo/permission';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { emitter } from 'src/utils/platform/browser/dom';
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
    this.state = { projectChangeNonce: 0 };
  }
  // 非应用页面按当前选中组织判断 Mingo 入口显隐，切换组织后需重算
  handleChangeCurrentProject = () => {
    this.setState(({ projectChangeNonce }) => ({ projectChangeNonce: projectChangeNonce + 1 }));
  };
  componentDidMount() {
    emitter.on('CHANGE_CURRENT_PROJECT', this.handleChangeCurrentProject);

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
  componentWillUnmount() {
    emitter.off('CHANGE_CURRENT_PROJECT', this.handleChangeCurrentProject);
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
    // 组织级 MingoAI 开关：应用内按应用所属组织判断，三项全关即隐藏入口；
    // 首页等可切换组织的场景只要还有一个组织可用就保留入口（进入后在组织下拉里切换）
    const showMingo = !isSandboxEnvironment() && canShowMingoEntry();

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
    // 订阅应用所属组织：进入 / 离开应用后需按该组织的 MingoAI 开关重算右下角入口显隐
    appProjectId: state.appPkg.projectId,
  };
})(Chat);
