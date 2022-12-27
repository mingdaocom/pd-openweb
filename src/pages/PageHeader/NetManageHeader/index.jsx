import React, { Component } from 'react';
import CommonUserHandle from '../components/CommonUserHandle';
import styled from 'styled-components';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import _ from 'lodash';

const HomeEntry = styled.div`
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid #eaeaea;
  margin: 0 12px 0 16px;
  color: #9e9e9e;
  text-align: center;
  line-height: 29px;
  cursor: pointer;
  &:hover {
    border-color: #ddd;
    color: #2196f3;
  }
`;

const MODULE_TO_TEXT = {
  account: _l('个人账户'),
  admin: _l('组织管理'),
  user: _l('个人资料'),
  group: _l('群组信息'),
  search: _l('智能搜索'),
  systemSetting: _l('系统配置'),
};

const PAGE_HEADER_ROUTE = {
  systemSetting: ['/privateDeployment/:routeType?', '/appInstallSetting'],
  account: ['/personal'],
  admin: ['/admin/:roleType/:projectId'],
  group: ['/group/groupValidate'],
  user: ['user', '/user_:userId?'],
  search: ['/search'],
};

export default class NetManageHeader extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    indexSideVisible: false,
  };

  getModule = () => {
    const { path = '' } = this.props;
    if (_.isEqual(PAGE_HEADER_ROUTE.user, path)) return 'user';
    if (_.includes(PAGE_HEADER_ROUTE.account, path)) return 'account';
    if (_.includes(PAGE_HEADER_ROUTE.admin, path)) return 'admin';
    if (_.includes(PAGE_HEADER_ROUTE.group, path)) return 'group';
    if (_.includes(PAGE_HEADER_ROUTE.search, path)) return 'search';
    if (_.includes(PAGE_HEADER_ROUTE.systemSetting, path)) return 'systemSetting';
    return '';
  };
  render() {
    const text = MODULE_TO_TEXT[this.getModule()];
    return (
      <div className="netManageHeaderWrap">
        <div className="netManageLogo">
          <HomeEntry data-tip={_l('主页')} onClick={() => navigateTo('/app/my')}>
            <i className="icon-home_page Font18"></i>
          </HomeEntry>
          {text && <div className="netManageTitle">{text}</div>}
        </div>
        <CommonUserHandle />
      </div>
    );
  }
}
