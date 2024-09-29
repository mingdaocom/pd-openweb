import React, { Fragment, Component } from 'react';
import { List } from 'antd-mobile';
import { Icon } from 'ming-ui';
import TabBar from '../components/TabBar';
import login from 'src/api/login';
import { navigateToLogin } from 'src/router/navigateTo';
import { getCurrentProject } from 'src/util';
import localForage from 'localforage';
import { removePssId } from 'src/util/pssId';

class MyHome extends Component {
  constructor(props) {
    super(props);
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
  render() {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };

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
              prefix={
                <div className="businessWrapper valignWrapper flexRow">
                  <Icon icon="business" className="Font16" />
                </div>
              }
              extra={<div className="Font17 Gray_75 ellipsis" style={{ width: 120 }}>{currentProject.companyName}</div>}
              onClick={() => {
                this.props.history.push(`/mobile/enterprise`);
              }}
            >
              {_l('切换组织')}
            </List.Item>
            {md.global.Config.IsLocal || window.isWxWork || window.isDingTalk ? null : (
              <Fragment>
                <List.Item
                  prefix={<Icon icon="workflow_help" className="Font26" />}
                  onClick={() => {
                    this.props.history.push(`/mobile/iframe/help`);
                  }}
                >
                  {_l('帮助中心')}
                </List.Item>
              </Fragment>
            )}
          </List>
          <a className="logOutBtn" onClick={this.logout} rel="external">
            {_l('退出登录')}
          </a>
        </div>
        <TabBar action="myHome" />
      </div>
    );
  }
}

export default MyHome;
