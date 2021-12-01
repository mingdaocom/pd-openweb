import React, { Component } from 'react';
import './style.less';
import _ from 'lodash';
import LoadDiv from 'ming-ui/components/LoadDiv';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import ScrollView from 'ming-ui/components/ScrollView';
import cx from 'classnames';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import smartSearchCtrl from 'src/api/smartSearch';
import CommonAjax from 'src/api/addressBook';
import { getClassNameByExt, htmlEncodeReg } from 'src/util';

const ClickAwayable = createDecoratedComponent(withClickAway);

export default class SearchContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftLoading: false,
      rightLoading: false,
      searchKeyword: '',
      result: false,
      rightResult: false,
    };
  }
  componentWillMount() {
    const { searchKeyword } = this.props;
    if (searchKeyword) {
      this.requestDebounce(searchKeyword);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.searchKeyword !== this.props.searchKeyword) {
      const { searchKeyword } = nextProps;
      if (searchKeyword) {
        this.requestDebounce(searchKeyword);
      }
    }
  }
  requestDebounce = _.debounce(searchKeyword => {
    this.request(searchKeyword);
    this.getAllAddressbookByKeywords(searchKeyword);
  }, 500);
  request(searchKeyword) {
    const { leftLoading } = this.state;
    this.setState({
      leftLoading: true,
      searchKeyword,
    });
    if (this.leftAjax && this.leftAjax.state() === 'pending') {
      this.leftAjax.abort && this.leftAjax.abort();
    }
    this.leftAjax = smartSearchCtrl.searchByTypes({
      keywords: searchKeyword,
      searchTypes: ['post', 'task', 'kcnode'],
    });
    this.leftAjax.then(data => {
      this.setState({
        leftLoading: false,
      });
      if (data && data.length > 0) {
        this.setState({
          result: data,
        });
      } else {
        this.setState({
          result: [],
        });
      }
    });
  }
  getAllAddressbookByKeywords(value) {
    this.setState({
      rightLoading: true,
    });
    this.rightAjax && this.rightAjax.abort();
    this.rightAjax = CommonAjax.getAllChatAddressbookByKeywords({
      keywords: value,
    });
    this.rightAjax.then(result => {
      this.setState({
        rightLoading: false,
        rightResult: result,
      });
    });
  }
  handleGoto(type) {
    const { searchKeyword } = this.state;
    const isType = typeof type === 'string';
    if (isType) {
      window.location.href = '/search?search_key=' + encodeURIComponent(searchKeyword) + '&searchType=' + type;
    } else {
      window.location.href = '/search?search_key=' + encodeURIComponent(searchKeyword);
    }
  }
  formattingText(content) {
    const { searchKeyword } = this.state;
    return htmlEncodeReg(content).replace(
      new RegExp(`(${searchKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'),
      '<span class="ThemeColor3">$1</span>',
    );
  }
  renderHeader(name, count, type) {
    return (
      <div className="header">
        <div className="name ThemeColor3">{name}</div>
        <div className="count ThemeColor3" onClick={this.handleGoto.bind(this, type)}>
          {count}
        </div>
      </div>
    );
  }
  renderPost(post) {
    const { postList, count, type } = post;
    return (
      <div className="post module">
        {this.renderHeader(_l('动态'), count, 'post')}
        <div className="content">
          {postList.map(item => (
            <a
              href={`/feeddetail?itemID=${item.postID}`}
              target="_blank"
              key={item.postID}
              className="item"
              dangerouslySetInnerHTML={{ __html: this.formattingText(`${item.postUserName}：${item.postContent}`) }}
            />
          ))}
        </div>
      </div>
    );
  }
  renderTask(task) {
    const { taskList, count, type } = task;
    return (
      <div className="task module">
        {this.renderHeader(_l('任务'), count, type)}
        <div className="content">
          {taskList.map(item => (
            <a target="_blank" href={`/apps/task/task_${item.taskID}`} className="item" key={item.taskID}>
              <i className="icon-check_circle" />
              <span
                dangerouslySetInnerHTML={{ __html: this.formattingText(`${item.taskUserName}：${item.taskContent}`) }}
              />
            </a>
          ))}
        </div>
      </div>
    );
  }
  renderKcNode(kcnode) {
    const { kcnodeList, count, type } = kcnode;
    return (
      <div className="kcNode module">
        {this.renderHeader(_l('知识'), count, type)}
        <div className="content">
          {kcnodeList.map(item => (
            <a target="_blank" href={item.link} className="item" key={item.nodeId}>
              <i className={cx(getClassNameByExt(`.${File.GetExt(item.fileName)}`), 'fileIcon')} />
              <span
                dangerouslySetInnerHTML={{
                  __html: this.formattingText(`${item.postCreateAccountName}：${item.fileName}`),
                }}
              />
            </a>
          ))}
        </div>
      </div>
    );
  }
  renderUser(user) {
    return (
      <div className="user module">
        {this.renderHeader(_l('联系人'), user.length, 'user')}
        <div className="content">
          {user.map(item => (
            <div
              className="item"
              key={item.accountId}
              onClick={() => {
                store.dispatch(actions.addUserSession(item.accountId));
              }}
            >
              <img className="avatar" src={item.avatarMiddle} />
              <span className="name" dangerouslySetInnerHTML={{ __html: this.formattingText(item.fullname) }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderGroup(group) {
    return (
      <div className="group module">
        {this.renderHeader(_l('聊天/群组'), group.length, 'group')}
        <div className="content">
          {group.map(item => (
            <div
              className="item"
              key={item.groupId}
              onClick={() => {
                store.dispatch(actions.addGroupSession(item.groupId));
              }}
            >
              <img className="avatar" src={item.avatar} />
              <span className="name" dangerouslySetInnerHTML={{ __html: this.formattingText(item.name) }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderLeftContent() {
    const { leftLoading, result } = this.state;
    if (leftLoading) {
      return (
        <div className="searchContent loading">
          <LoadDiv size="middle" />
        </div>
      );
    } else {
      if (result.length) {
        const post = _.filter(result, { type: 'post' })[0];
        const task = _.filter(result, { type: 'task' })[0];
        const kcnode = _.filter(result, { type: 'kcnode' })[0];
        return (
          <ScrollView>
            {post && post.postList.length ? this.renderPost(post) : undefined}
            {task && task.taskList.length ? this.renderTask(task) : undefined}
            {kcnode && kcnode.kcnodeList.length ? this.renderKcNode(kcnode) : undefined}
          </ScrollView>
        );
      } else {
        return <div className="nodata">{_l('暂无动态、任务、知识、搜索结果')}</div>;
      }
    }
  }
  renderRightContent() {
    const { rightLoading, rightResult } = this.state;
    if (rightLoading) {
      return (
        <div className="searchContent loading">
          <LoadDiv size="middle" />
        </div>
      );
    } else {
      const { groups = { list: [] }, accounts = { list: [] } } = rightResult;
      if (accounts.list.length || groups.list.length) {
        return (
          <ScrollView>
            {accounts.list.length ? this.renderUser(accounts.list) : undefined}
            {groups.list.length ? this.renderGroup(groups.list) : undefined}
          </ScrollView>
        );
      } else {
        return <div className="nodata">{_l('暂无联系人与群组搜索结果')}</div>;
      }
    }
  }
  render() {
    return (
      <ClickAwayable component="div" id="SmartSearchResultDiv" onClickAwayExceptions={['#SmartSearch']}>
        <div className="searchContent">
          <div className="other">{this.renderLeftContent()}</div>
          <div className="addressBook">{this.renderRightContent()}</div>
        </div>
      </ClickAwayable>
    );
  }
}
