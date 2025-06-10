import React, { Component, Fragment } from 'react';
import { ActionSheet, List } from 'antd-mobile';
import localForage from 'localforage';
import { Icon } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import login from 'src/api/login';
import langConfig from 'src/common/langConfig';
import { navigateToLogin } from 'src/router/navigateTo';
import { getCurrentProject } from 'src/utils/project';
import { removePssId } from 'src/utils/pssId';
import TabBar from '../components/TabBar';

class MyHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadNewForm: localStorage.getItem('LOAD_MOBILE_FORM'),
      visible: false,
      actionKey: getCookie('i18n_langtag'),
    };
  }

  get languageActions() {
    return langConfig.map(({ key, value }) => ({
      key,
      text: (
        <div className="flexRow languageActionSheetItem">
          <span className="Bold">{value}</span>
          {key === this.state.actionKey && <Icon icon="done" className="Font30" />}
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

  handleWorksheetChange = () => {
    let { isLoadNewForm } = this.state;

    isLoadNewForm = isLoadNewForm === 'new' ? 'old' : 'new';

    this.setState({ isLoadNewForm });
    safeLocalStorageSetItem('LOAD_MOBILE_FORM', isLoadNewForm);
    window.location.reload();
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

  render() {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const { isLoadNewForm } = this.state;

    return (
      <div className="MyHome flexColumn h100">
        <div className="flex flexColumn WhiteBG">
          <div className="header">
            <div className="flexColumn flex pRight20 overflowHidden">
              <span className="name overflow_ellipsis mBottom5">{md.global.Account.fullname}</span>
              <span className="profession overflow_ellipsis">{md.global.Account.profession}</span>
            </div>
            <div>
              <img className="avatarMiddle" src={md.global.Account.avatar} />
            </div>
          </div>
          <List className="body flex mTop20">
            <List.Item
              arrowIcon={<Icon icon="arrow-right-border" className="Font18 Gray_9e" />}
              prefix={
                <div className="businessWrapper valignWrapper flexRow">
                  <Icon icon="business" className="Font16" />
                </div>
              }
              extra={
                <div className="Font15 Gray_15 ellipsis" style={{ maxWidth: 180 }}>
                  {currentProject.companyName}
                </div>
              }
              onClick={() => {
                this.props.history.push(`/mobile/enterprise`);
              }}
            >
              {_l('切换组织')}
            </List.Item>
            <List.Item
              arrowIcon={<Icon icon="arrow-right-border" className="Font18 Gray_9e" />}
              prefix={
                <div className="languageWrapper valignWrapper flexRow">
                  <Icon icon="language" className="Font16" />
                </div>
              }
              onClick={() => this.setState({ visible: true })}
            >
              {_l('系统语言')}
            </List.Item>
            {md.global.Config.IsLocal || window.isWxWork || window.isDingTalk ? null : (
              <Fragment>
                <List.Item
                  arrowIcon={<Icon icon="arrow-right-border" className="Font18 Gray_9e" />}
                  prefix={<Icon icon="help_center" className="Font30" />}
                  onClick={() => {
                    this.props.history.push(`/mobile/iframe/help`);
                  }}
                >
                  {_l('帮助中心')}
                </List.Item>
              </Fragment>
            )}
            <div className="splitter"></div>
            {localStorage.getItem('PROJECT_NAME') !== 'md' && (
              <div className="worksheetChange flexRow" onClick={this.handleWorksheetChange}>
                <div className="worksheetChangeIconBox flexRow">
                  <Icon icon="calendar-synchronous" className="Font16" />
                </div>
                <div className="descBox">
                  <div className="titleBox flexRow">
                    <div className="title">{_l('工作表版本切换')}</div>
                    <div className="worksheetStatus flexCenter">
                      <div className="status">{isLoadNewForm === 'new' ? _l('新版') : _l('旧版')}</div>
                      {isLoadNewForm === 'new' && <Icon icon="beta1" className="Font14" />}
                    </div>
                  </div>
                  <div className="desc">
                    {_l('新版本重构了工作表的架构。如遇问题，可点击按钮返回旧版本，继续使用熟悉的功能和界面。')}
                  </div>
                </div>
              </div>
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
        <TabBar action="myHome" />
      </div>
    );
  }
}

export default MyHome;
