import React, { Component, Fragment } from 'react';
import { ActionSheet, List } from 'antd-mobile';
import localForage from 'localforage';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import login from 'src/api/login';
import langConfig from 'src/common/langConfig';
import { logoBase64 } from 'src/pages/mingo/embed';
import { navigateToLogin } from 'src/router/navigateTo';
import { emitter, setBodyThemeMode } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import { removePssId } from 'src/utils/pssId';
import TabBar from '../components/TabBar';
import MobileMyStatus from '../MobileMyStatus';

const THEME_LIST = [
  { text: _l('浅色'), key: 'light', icon: 'light_mode' },
  { text: _l('深色'), key: 'dark', icon: 'dark_mode' },
  { text: _l('跟随设备'), key: 'system', icon: 'mobile_phone' },
];

class MyHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      actionKey: getCookie('i18n_langtag'),
      themeVisible: false,
      themeKey: localStorage.getItem('themeMode') || 'light',
    };
  }

  get languageActions() {
    return langConfig.map(({ key, value }) => ({
      key,
      text: (
        <div className="flexRow languageActionSheetItem">
          <span className="Bold">{value}</span>
          {key === this.state.actionKey && <Icon icon="done" />}
        </div>
      ),
    }));
  }

  get themeActions() {
    return THEME_LIST.map(({ key, text, icon }) => ({
      key,
      text: (
        <div className="flexRow themeActionSheetItem">
          <div className="actionItemTextBox">
            <Icon icon={icon} />
            <span className="Bold">{text}</span>
          </div>
          {key === this.state.themeKey && <Icon icon="done" />}
        </div>
      ),
    }));
  }

  logout = () => {
    window.currentLeave = true;

    login.loginOut().then(data => {
      if (data) {
        localForage.clear();
        removePssId();
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        navigateToLogin({ needReturnUrl: false });
      }
    });
  };

  handleAction = ({ key }) => {
    this.setState({ actionKey: key });
    accountSetting
      .editAccountSetting({ settingType: '6', settingValue: getCurrentLangCode(key).toString() })
      .then(res => {
        if (res) {
          setCookie('i18n_langtag', key);
          window.location.reload();
        } else {
          alert(_l('设置失败，请稍后再试'), 2);
        }
      });
  };

  handleTheme = ({ key }) => {
    this.setState({ themeKey: key, themeVisible: false });
    localStorage.setItem('themeMode', key);
    window.themeMode = key;
    setBodyThemeMode(key);
    if (['dark', 'light'].includes(key)) {
      emitter.emit('CHANGE_THEME_MODE', key);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      emitter.emit('CHANGE_THEME_MODE', isDark ? 'dark' : 'light');
    }
    // window.location.reload();
  };

  render() {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };

    return (
      <div className="MyHome flexColumn h100">
        <div className="flex flexColumn bgPrimary">
          <div className="header">
            <div className="flexColumn flex pRight20 overflowHidden">
              <span className="name overflow_ellipsis mBottom5 Bold">{md.global.Account.fullname}</span>
              <span className="profession overflow_ellipsis">{md.global.Account.profession}</span>
            </div>
            <div>
              <img className="avatarMiddle" src={md.global.Account.avatar} />
            </div>
          </div>
          <MobileMyStatus />
          <List className="body flex mTop20">
            <List.Item
              arrowIcon={<Icon icon="arrow-right-border" className="Font18 textTertiary" />}
              prefix={
                <div className="businessWrapper valignWrapper flexRow">
                  <Icon icon="business" className="Font16" />
                </div>
              }
              extra={
                <div className="Font15 textPrimary ellipsis" style={{ maxWidth: 180 }}>
                  {currentProject.companyName}
                </div>
              }
              onClick={() => {
                this.props.history.push(`/mobile/enterprise`);
              }}
            >
              {_l('切换组织')}
            </List.Item>
            {window.themeModeVisible && (
              <List.Item
                arrowIcon={<Icon icon="arrow-right-border" className="Font18 textTertiary" />}
                prefix={
                  <div className="themeWrapper valignWrapper flexRow">
                    <Icon icon="dark-mode" className="Font16" />
                  </div>
                }
                extra={
                  <div className="Font15 textPrimary ellipsis" style={{ maxWidth: 180 }}>
                    {THEME_LIST.find(item => item.key === this.state.themeKey)?.text}
                  </div>
                }
                onClick={() => this.setState({ themeVisible: true })}
              >
                {_l('主题')}
                <Icon icon="beta1" className="mLeft5" style={{ color: 'var(--color-success)' }} />
              </List.Item>
            )}
            <List.Item
              arrowIcon={<Icon icon="arrow-right-border" className="Font18 textTertiary" />}
              prefix={
                <div className="languageWrapper valignWrapper flexRow">
                  <Icon icon="language" className="Font16" />
                </div>
              }
              onClick={() => this.setState({ visible: true })}
            >
              {_l('系统语言')}
            </List.Item>
            {window.platformENV.isOverseas ||
            window.platformENV.isLocal ||
            window.isWxWork ||
            window.isDingTalk ? null : (
              <Fragment>
                <List.Item
                  arrowIcon={<Icon icon="arrow-right-border" className="Font18 textTertiary" />}
                  prefix={<img className="mingoLogo" src={logoBase64} />}
                  onClick={() => {
                    window.location.href = '/mingo?header=0';
                  }}
                >
                  {_l('使用帮助')}
                </List.Item>
              </Fragment>
            )}
          </List>
          <a className="logOutBtn" onClick={this.logout} rel="external">
            {_l('退出登录')}
          </a>
        </div>
        <ActionSheet
          extra={
            <div className="flexRow header">
              <span className="Font13">{_l('系统语言')}</span>
              <div className="closeIcon" onClick={() => this.setState({ visible: false })}>
                <Icon icon="close" />
              </div>
            </div>
          }
          visible={this.state.visible}
          actions={this.languageActions}
          onAction={this.handleAction}
          onClose={() => this.setState({ visible: false })}
        />
        <ActionSheet
          extra={
            <div className="flexRow header">
              <span className="Font13">{_l('主题')}</span>
              <div className="closeIcon" onClick={() => this.setState({ themeVisible: false })}>
                <Icon icon="close" />
              </div>
            </div>
          }
          visible={this.state.themeVisible}
          actions={this.themeActions}
          onAction={this.handleTheme}
          onClose={() => this.setState({ themeVisible: false })}
        />
        <TabBar action="myHome" />
      </div>
    );
  }
}

export default MyHome;
