import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import * as actions from 'src/pages/chat/redux/actions';
import * as ajax from '../../utils/ajax';
import './index.less';

const SearchWrap = styled.div`
  input {
    border: none;
    border-radius: 17px;
    background: #f5f5f5;
    border: 1px solid #f5f5f5;
    padding: 4px 5px 4px 35px;
    width: 100%;
    &:focus {
      border-color: #1677ff;
      background: #fff;
    }
  }
  .icon-cancel {
    right: 5px;
  }
`;

const flatten = res => {
  const result = [];
  result.push(...res.accounts.list, ...res.groups.list);
  return result;
};

class SearchMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      loading: true,
      result: [],
      flattenResult: [],
      currentIndex: -1,
      accountsVisible: true,
      groupsVisible: true,
    };
  }
  inputRef = React.createRef();
  componentDidMount() {
    this.handleFocus();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sessionListVisible && !this.props.sessionListVisible) {
      this.handleFocus();
    }
  }
  handleFocus = () => {
    if (this.inputRef.current && !location.href.includes('windowChat')) {
      setTimeout(() => {
        this.inputRef.current.focus();
      }, 300);
    }
  };
  getAllAddressbookByKeywords = () => {
    const { value } = this.state;
    this.setState({ loading: true });
    this.ajax && this.ajax.abort();
    this.ajax = ajax.getAllAddressbookByKeywords(value.trim());
    this.ajax.then(result => {
      this.setState({
        loading: false,
        result,
        flattenResult: flatten(result),
      });
    });
  };
  adjustViewport(direction) {
    const { flattenResult, currentIndex } = this.state;
    const { viewport } = this.scrollView && this.scrollView.getScrollInfo();
    const $scrollViewEl = $(viewport);
    const current = flattenResult[currentIndex] || {};
    const id = current.accountId ? (current.user ? current.user.userId : current.accountId) : current.groupId;
    const $currentEl = $(`#project-container-item-${id}`);

    if (!viewport || currentIndex === -1) {
      return;
    }
    const position = $currentEl.position() || {};
    if (direction === 'up') {
      if (position.top < 0 || position.top + $currentEl.height() >= $scrollViewEl.height()) {
        this.scrollView.scrollToElement($currentEl[0]);
      }
    } else if (direction === 'down') {
      if (position.top + $currentEl.height() >= $scrollViewEl.height()) {
        const { scrollTop, scrollHeight, maxScrollTop } = this.scrollView.getScrollInfo() || {};
        const bottom = scrollHeight - scrollTop - position.top - $currentEl.height();
        this.scrollView.scrollTo({ top: maxScrollTop - bottom });
      } else if (position.top < 0) {
        this.scrollView.scrollToElement($currentEl[0]);
      }
    }
  }
  handleChange = _.debounce(value => {
    if (!value.trim()) return;
    this.setState(
      {
        value,
        flattenResult: [],
        currentIndex: -1,
      },
      () => {
        value && this.getAllAddressbookByKeywords();
      },
    );
  }, 300);
  handleKeyDown = event => {
    const { flattenResult, currentIndex } = this.state;
    const { which } = event;
    if (which === 38 && flattenResult.length) {
      this.setState(
        {
          currentIndex: currentIndex === -1 || currentIndex === 0 ? flattenResult.length - 1 : currentIndex - 1,
        },
        () => {
          this.adjustViewport('up');
        },
      );
    } else if (which === 40 && flattenResult.length) {
      this.setState(
        {
          currentIndex: currentIndex === flattenResult.length - 1 ? 0 : currentIndex + 1,
        },
        () => {
          this.adjustViewport('down');
        },
      );
    } else if (which === 13 && flattenResult.length && currentIndex !== -1) {
      this.handleOpenSession(flattenResult[currentIndex]);
    } else if (which === 27) {
      this.setState({ value: '' });
    }
  };
  handleOpenSession(data) {
    const { groupId, accountId } = data;
    if (groupId) {
      const msg = {
        to: groupId,
        avatar: data.avatar,
        groupname: data.name,
        msg: { con: '' },
      };
      this.props.addGroupSession(groupId, msg);
    } else {
      const msg = {
        logo: data.avatarMiddle,
        uname: data.fullname,
        sysType: 1,
      };
      this.props.addUserSession(accountId, msg);
    }
    this.setState({ value: '' });
  }
  renderAccount(account, currentResult) {
    const id = account.user ? account.user.userId : account.accountId;
    const isCurrent = id === (currentResult.user ? currentResult.user.userId : currentResult.accountId);
    return (
      <div
        id={`project-container-item-${id}`}
        className={cx('project-container-item', { active: isCurrent })}
        onClick={this.handleOpenSession.bind(this, account)}
        key={account.accountId}
      >
        <img src={account.avatarMiddle} />
        <div className="flexColumn flex minWidth0 mLeft10">
          <span className="username Gray bold Font13" title={account.fullname}>
            {account.fullname}
          </span>
          <span className="department Gray_75 ellipsis Font12">
            {account.profession}
            {account.profession && account.companyName && ' | '}
            {account.companyName}
          </span>
        </div>
      </div>
    );
  }
  renderGroup(group, currentResult) {
    const isCurrent = group.groupId === currentResult.groupId;
    return (
      <div
        id={`project-container-item-${group.groupId}`}
        className={cx('project-container-item', { active: isCurrent })}
        onClick={this.handleOpenSession.bind(this, group)}
        key={group.groupId}
      >
        <img src={group.avatar} />
        <div className="flex minWidth0 mLeft10 ellipsis">
          <span className="groupname Gray bold Font13" title={group.name}>
            {group.name}
          </span>
        </div>
      </div>
    );
  }
  renderProject() {
    const { result, loading, flattenResult, currentIndex, accountsVisible, groupsVisible } = this.state;
    const currentResult = flattenResult[currentIndex] || {};
    const count = result.groups.list.length + result.accounts.list.length;
    return (
      <div className="content">
        {!!result.accounts.list.length && (
          <div>
            <div
              className="project-container-head flexRow alignItemsCenter"
              onClick={() => this.setState({ accountsVisible: !accountsVisible })}
            >
              <div className="flex bold">
                {_l('联系人')}
                <span className="mLeft5 ThemeColor">{result.accounts.list.length}</span>
              </div>
              <Icon icon={accountsVisible ? 'arrow-up-border' : 'arrow-down-border'} className="Gray_75 Font16" />
            </div>
            {accountsVisible && (
              <div>{result.accounts.list.map(account => this.renderAccount(account, currentResult))}</div>
            )}
          </div>
        )}
        {!!result.groups.list.length && (
          <div>
            <div
              className="project-container-head flexRow alignItemsCenter"
              onClick={() => this.setState({ groupsVisible: !groupsVisible })}
            >
              <div className="flex bold">
                {_l('聊天/群组')}
                <span className="mLeft5 ThemeColor">{result.groups.list.length}</span>
              </div>
              <Icon icon={groupsVisible ? 'arrow-up-border' : 'arrow-down-border'} className="Gray_75 Font16" />
            </div>
            {groupsVisible && <div>{result.groups.list.map(group => this.renderGroup(group, currentResult))}</div>}
          </div>
        )}
        {!loading && !count ? (
          <div className="nodata-wrapper">
            <div className="nodata-img" />
            <p>{_l('没有搜索结果')}</p>
          </div>
        ) : undefined}
      </div>
    );
  }
  renderContent() {
    const { embed } = this.props;
    const { loading } = this.state;
    return (
      <div className={cx('ChatList-SearchMember-Content', { embed })}>
        <ScrollView
          ref={scrollView => {
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
    const { value } = this.state;
    return (
      <Fragment>
        <SearchWrap className="searchWrap flexRow alignItemsCenter flex mRight10 Relative">
          <Icon icon="search" className="Gray_75 Font20 mLeft10 Absolute" />
          <input
            ref={this.inputRef}
            type="text"
            className="Font13"
            placeholder={_l('搜索用户 / 群组')}
            value={value}
            onChange={event => {
              const value = event.target.value;
              this.setState({ value }, () => {
                this.handleChange(value);
              });
            }}
            onKeyDown={this.handleKeyDown}
          />
          {value.trim() && (
            <Icon
              icon="cancel"
              className="Gray_75 Font20 pointer Absolute"
              onClick={() => this.setState({ value: '' })}
            />
          )}
        </SearchWrap>
        {value.trim() && this.renderContent()}
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    sessionListVisible: state.chat.toolbarConfig.sessionListVisible,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['addGroupSession', 'addUserSession']), dispatch),
)(SearchMember);
