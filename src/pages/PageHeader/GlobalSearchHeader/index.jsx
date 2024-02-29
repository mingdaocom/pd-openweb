import React, { Component } from 'react';
import { withRouter } from 'react-router';
import CommonUserHandle from '../components/CommonUserHandle';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/util'
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
  search: _l('超级搜索'),
};

const PAGE_HEADER_ROUTE = {
  account: ['/personal'],
  admin: ['/admin/:roleType/:projectId'],
  group: ['/group/groupValidate'],
  user: ['user', '/user_:userId?'],
  search: ['/search'],
};

@withRouter
export default class GlobalSearchHeader extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    indexSideVisible: false,
    searchValue: undefined,
    searchKey: undefined,
  };

  componentDidMount() {
    const urlParam = getRequest(this.props.search);
    this.setState({
      searchKey: urlParam.search_key || undefined,
      searchValue: urlParam.search_key || undefined,
    });
  }

  getModule = () => {
    const { path = '' } = this.props;
    if (_.isEqual(PAGE_HEADER_ROUTE.user, path)) return 'user';
    if (_.includes(PAGE_HEADER_ROUTE.account, path)) return 'account';
    if (_.includes(PAGE_HEADER_ROUTE.admin, path)) return 'admin';
    if (_.includes(PAGE_HEADER_ROUTE.group, path)) return 'group';
    if (_.includes(PAGE_HEADER_ROUTE.search, path)) return 'search';
    return '';
  };

  onSearchChange = value => this.setState({searchValue: value});

  onSearch = () => {
    const {searchValue, searchKey} = this.state;
    if(searchValue===searchKey) return;
    const urlParam = getRequest(this.props.search);
    this.setState({searchKey: searchValue});
    navigateTo(`/search?search_key=${searchValue || ''}&search_type=${urlParam.search_type || ''}`)
  }

  onClearSearch = () => this.setState({searchValue: ''});

  render() {
    const text = MODULE_TO_TEXT[this.getModule()];
    const {searchValue} = this.state;
    return (
      <div className="globalSearchHeaderWrap">
        <div className="netManageLogo">
          <HomeEntry data-tip={_l('主页')} onClick={() => navigateTo('/dashboard')}>
            <i className="icon-home_page Font18"></i>
          </HomeEntry>
          {text && <div className="netManageTitle">{text}</div>}
        </div>
        <div className="searchCon">
          <div className="search">
            <span className='searchIconCon' onClick={this.onSearch}><Icon icon="search" className="Font20" style={{ color: '#4a4a4a'}} /></span>
            <Input
              className="flex borderNone"
              value={searchValue}
              placeholder={_l('输入关键词搜索')}
              onChange={this.onSearchChange}
              onKeyUp={e => {
                if (e.keyCode === 13) {
                  this.onSearch();
                }
              }}
            />
            {searchValue && <Icon icon="delete_out" className="Gray_bd Font14" onClick={this.onClearSearch} />}
          </div>
        </div>
        <CommonUserHandle />
      </div>
    );
  }
}
