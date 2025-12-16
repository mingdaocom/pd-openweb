import React, { Component } from 'react';
import _ from 'lodash';
import { match } from 'path-to-regexp';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { navigateTo } from 'src/router/navigateTo';
import CommonUserHandle from '../components/CommonUserHandle';
import './index.less';

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
    color: #1677ff;
  }
`;

const MODULE_TO_TEXT = {
  account: _l('个人账户'),
  admin: _l('组织管理'),
  user: _l('个人资料'),
  group: _l('群组信息'),
  systemSetting: _l('系统配置'),
  search: _l('超级搜索'),
  certification: _l('认证'),
};

const PAGE_HEADER_ROUTE = {
  systemSetting: ['/appInstallSetting'],
  account: ['/personal'],
  admin: ['/admin/:roleType/:projectId'],
  group: ['/group/groupValidate'],
  user: ['user', '/user_:userId?'],
  search: ['/search'],
  certification: ['/certification/:roleType?'],
};

const fn = match('/admin/:roleType/:projectId');
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
    if (_.includes(PAGE_HEADER_ROUTE.certification, path)) return 'certification';
    return '';
  };
  render() {
    const text = MODULE_TO_TEXT[this.getModule()];
    return (
      <div className="netManageHeaderWrap">
        <div className="netManageLogo">
          <Tooltip title={_l('工作台')}>
            <HomeEntry
              onClick={() => {
                const { params } = fn(location.pathname) || {};
                if (!_.isEmpty(params)) {
                  localStorage.setItem('currentProjectId', params.projectId);
                }
                navigateTo('/dashboard');
              }}
            >
              <i className="icon-home_page Font18"></i>
            </HomeEntry>
          </Tooltip>
          {text && <div className="netManageTitle">{text}</div>}
        </div>
        <CommonUserHandle />
      </div>
    );
  }
}
