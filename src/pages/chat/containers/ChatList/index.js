import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import zendeskApi from 'src/api/Zendesk';
import * as actions from '../../redux/actions';
import * as socket from '../../utils/socketEvent';
import Apps from '../Apps';
import SessionList from '../SessionList';
import Mingo from './Mingo';
import Toolbar from './Toolbar';
import ToolbarDrawer from './Toolbar/Drawer';
import './index.less';

const KEY_STORAGE_KEY = 'zendeskToken';
const KEY_TIMESTAMP_KEY = 'zendeskTokenTimestamp';
const EXPIRATION_TIME = 50 * 60 * 1000;

async function fetchKey() {
  try {
    const key = await zendeskApi.getWidgetJwt();
    const currentTime = new Date().getTime();
    localStorage.setItem(KEY_STORAGE_KEY, key);
    localStorage.setItem(KEY_TIMESTAMP_KEY, currentTime.toString());
    return key;
  } catch (error) {
    console.error('Error fetching key:', error);
  }
}

function getZendeskKey() {
  const storedKey = localStorage.getItem(KEY_STORAGE_KEY);
  const storedTimestamp = localStorage.getItem(KEY_TIMESTAMP_KEY);

  if (storedKey && storedTimestamp) {
    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - parseInt(storedTimestamp, 10);

    if (timeElapsed < EXPIRATION_TIME) {
      return Promise.resolve(storedKey);
    } else {
      return fetchKey();
    }
  }

  return fetchKey();
}

class Chat extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (location.href.includes('chat_window')) return;

    // 获取 Zendesk Key
    if (!window.platformENV.isLocal && window.platformENV.isOverseas) {
      getZendeskKey().then(key => {
        window.zE('messenger', 'loginUser', callback => {
          callback(key);
        });
      });
    }

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
    const showMingo = !md.global.SysSettings.hideAIBasicFun;

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
