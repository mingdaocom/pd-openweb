import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import './index.less';
import * as ajax from '../../utils/ajax';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';

const flatten = (res) => {
  const result = [];
  result.push(...res.accounts.list, ...res.groups.list);
  return result;
};

export default class SearchMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      contentVisible: false,
      style: {},
      loading: false,
      result: [],
      flattenResult: [],
      currentIndex: -1,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      $(this.input).focus();
    }, 0);
  }
  getInnerHeight() {
    const { offsetHeight, clientHeight } = this.SearchMember;
    const { innerHeight } = window;
    const headerHeight = 46; // 页面导航高度
    return {
      top: -(innerHeight - clientHeight - headerHeight),
      height: innerHeight - offsetHeight - headerHeight,
    };
  }
  getAllAddressbookByKeywords(value) {
    this.setState({
      loading: true,
    });
    this.ajax && this.ajax.abort();
    this.ajax = ajax.getAllAddressbookByKeywords(value);
    this.ajax.then((result) => {
      this.setState({
        loading: false,
        result,
        flattenResult: flatten(result),
      });
    });
  }
  adjustViewport(direction) {
    const { flattenResult, currentIndex } = this.state;
    const scrollViewEl = findDOMNode(this.scrollView);
    const $scrollViewEl = $(scrollViewEl);
    const current = flattenResult[currentIndex] || {};
    const id = current.accountId ? (current.user ? current.user.userId : current.accountId) : current.groupId;
    const $currentEl = $(`#project-container-item-${id}`);

    if (!scrollViewEl.nanoscroller.isActive || currentIndex === -1) {
      return;
    }
    if (direction === 'up') {
      if ($currentEl.position().top < 0 || $currentEl.position().top + $currentEl.height() >= $scrollViewEl.height()) {
        $scrollViewEl.nanoScroller({ scrollTo: $currentEl });
      }
    } else if (direction === 'down') {
      if ($currentEl.position().top + $currentEl.height() >= $scrollViewEl.height()) {
        const bottom =
          $scrollViewEl.find('.nano-content').get(0).scrollHeight -
          $scrollViewEl.find('.nano-content').get(0).scrollTop -
          $currentEl.position().top -
          $currentEl.height();
        $scrollViewEl.nanoScroller({ scrollBottom: bottom });
      } else if ($currentEl.position().top < 0) {
        $scrollViewEl.nanoScroller({ scrollTo: $currentEl });
      }
    }
  }
  handleChange(event) {
    const { value } = event.target;
    const { result } = this.state;

    this.setState({
      value,
      flattenResult: [],
      currentIndex: -1,
    });
    setTimeout(() => {
      const { result, contentVisible } = this.state;
      this.setState({
        contentVisible: value ? contentVisible : false,
      });
      if (value.trim()) {
        const style = this.getInnerHeight();
        this.getAllAddressbookByKeywords(value.trim());
        this.setState({
          style,
          contentVisible: true,
        });
      }
    }, window.isWindows ? 500 : 0);
  }
  handleKeyDown(event) {
    const { flattenResult, currentIndex } = this.state;
    const { which } = event;
    if (which === 38 && flattenResult.length) {
      this.setState(
        {
          currentIndex: currentIndex === -1 || currentIndex === 0 ? flattenResult.length - 1 : currentIndex - 1,
        },
        () => {
          this.adjustViewport('up');
        }
      );
    } else if (which === 40 && flattenResult.length) {
      this.setState(
        {
          currentIndex: currentIndex === flattenResult.length - 1 ? 0 : currentIndex + 1,
        },
        () => {
          this.adjustViewport('down');
        }
      );
    } else if (which === 13 && flattenResult.length && currentIndex !== -1) {
      this.handleOpenSession(flattenResult[currentIndex]);
    } else if (which === 27) {
      this.handleClose();
    }
  }
  handleOpenSession(data) {
    this.props.onOpenSession(data);
    this.handleClose();
  }
  handleClose() {
    this.handleChange({ target: { value: '' } });
    this.props.onHideSearch();
  }
  handleBlur() {
    const { value } = this.state;
    if (!value) {
      this.props.onHideSearch();
    }
  }
  renderAccount(account, currentResult) {
    const id = account.user ? account.user.userId : account.accountId;
    const isCurrent = id !== (currentResult.user ? currentResult.user.userId : currentResult.accountId);
    return (
      <div
        id={`project-container-item-${id}`}
        className={cx('project-container-item ThemeBorderColor3 ThemeBGColor3', { 'project-container-hover': isCurrent })}
        onClick={this.handleOpenSession.bind(this, account)}
        key={account.accountId}
      >
        <img src={account.avatarMiddle} />
        <span className="username" title={account.fullname}>
          {account.fullname}
        </span>
        {account.profession ? (
          <span className="department" title={account.profession}>
            {account.profession}
          </span>
        ) : (
          undefined
        )}
      </div>
    );
  }
  renderGroup(group, currentResult) {
    const isCurrent = group.groupId !== currentResult.groupId;
    return (
      <div
        id={`project-container-item-${group.groupId}`}
        className={cx('project-container-item ThemeBorderColor3 ThemeBGColor3', { 'project-container-hover': isCurrent })}
        onClick={this.handleOpenSession.bind(this, group)}
        key={group.groupId}
      >
        <img src={group.avatar} />
        <span className="groupname" title={group.name}>
          {group.name}
        </span>
      </div>
    );
  }
  renderProject() {
    const { result, loading, flattenResult, currentIndex } = this.state;
    const currentResult = flattenResult[currentIndex] || {};
    const count = result.groups.list.length + result.accounts.list.length;
    return (
      <div className="content">
        {
          result.accounts.list.length ?
          <div>
            <div className="project-container-head">{`${_l('联系人')} ${result.accounts.list.length}`}</div>
            <div>
              {result.accounts.list.map(account => this.renderAccount(account, currentResult))}
            </div>
          </div> : undefined
        }
        {
          result.groups.list.length ?
          <div>
            <div className="project-container-head">{`${_l('聊天/群组')} ${result.groups.list.length}`}</div>
            <div>
              {result.groups.list.map(group => this.renderGroup(group, currentResult))}
            </div>
          </div> : undefined
        }
        {!loading && !count ? (
          <div className="nodata-wrapper">
            <div className="nodata-img" />
            <p>{_l('没有搜索结果')}</p>
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }
  renderContent() {
    const { style, loading } = this.state;
    return (
      <div className="ChatList-SearchMember-Content" style={style}>
        <ScrollView
          ref={(scrollView) => {
            this.scrollView = scrollView;
          }}
        >
          {loading ? (
            <div className="loading">
              <LoadDiv size="big" />
            </div>
          ) : (
            this.renderProject()
          )}
        </ScrollView>
      </div>
    );
  }
  render() {
    const { visible } = this.props;
    const { value, contentVisible } = this.state;
    return (
      <div
        className="ChatList-SearchMember"
        ref={(SearchMember) => {
          this.SearchMember = SearchMember;
        }}
      >
        <i className="icon-search" />
        <input
          ref={(input) => {
            this.input = input;
          }}
          className="search-input"
          placeholder={_l('搜索')}
          onBlur={this.handleBlur.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
          type="text"
          value={value}
        />
        {value ? <i onClick={this.handleClose.bind(this)} className="icon-delete" /> : undefined}
        {contentVisible ? this.renderContent() : undefined}
      </div>
    );
  }
}
