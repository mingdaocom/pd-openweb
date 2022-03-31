import React, { Fragment, Component } from 'react';
import { List } from 'antd-mobile';
import { Icon } from 'ming-ui';
import TabBar from '../components/TabBar';
import login from 'src/api/login';
// import './index.less';

const { Item } = List;
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isDingTalk = window.navigator.userAgent.toLowerCase().includes('dingtalk');
const {
  app: { commonUserHandle },
} = window.private;

export default class MyHome extends Component {
  constructor(props) {
    super(props);
  }
  logout = () => {
    window.currentLeave = true;

    login.loginOut().then(data => {
      if (data) {
        window.localStorage.removeItem('LoginCheckList');
        location.href = '/network';
      }
    });
  };
  render() {
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
            <Item
              thumb={
                <div className="businessWrapper valignWrapper flexRow">
                  <Icon icon="business" className="Font16" />
                </div>
              }
              arrow="horizontal"
              onClick={() => {
                this.props.history.push(`/mobile/enterprise`);
              }}
            >
              {_l('组织')}
            </Item>
            {commonUserHandle.help || md.global.Config.IsLocal || isWxWork || isDingTalk ? null : (
              <Fragment>
                <Item
                  thumb={<Icon icon="workflow_help" className="Font26" />}
                  arrow="horizontal"
                  onClick={() => {
                    this.props.history.push(`/mobile/iframe/help`);
                  }}
                >
                  {_l('帮助中心')}
                </Item>
              </Fragment>
            )}
          </List>
          <a className='logOutBtn' onClick={this.logout} rel="external">{_l('退出登录')}</a>
        </div>
        <TabBar action="myHome" />
      </div>
    );
  }
}
