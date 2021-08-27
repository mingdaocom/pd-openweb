import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import config from '../../utils/config';
import * as utils from '../../utils';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import { addGroupMembers } from '../../utils/group';
import Constant from '../../utils/constant';
import GroupController from 'src/api/group';
import LoadDiv from 'ming-ui/components/LoadDiv';

class Avatar extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { id } = this.props;
    const { avatar } = this;
    if (id) {
      $(avatar).mdBusinessCard({
        chatByLink: true,
        accountId: id,
      });
    }
  }
  render() {
    const { id, avatar } = this.props;
    return (
      <img
        ref={(avatar) => {
          this.avatar = avatar;
        }}
        src={avatar}
      />
    );
  }
}

export default class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      loading: true,
      groupMemberCount: 0,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { session } = nextProps;
    if (session.groupMemberCount !== this.state.groupMemberCount) {
      this.getGroupUsers();
    }
  }
  componentDidMount() {
    const { groupMemberCount, groupUsers } = this.props.session;
    this.setState({
      loading: false,
      members: groupUsers,
      groupMemberCount: groupMemberCount,
    });
  }
  getGroupUsers() {
    const { session } = this.props;
    GroupController.getGroupUsers({
      groupId: session.id,
      pageSize: 8,
      type: 1,
    }).then((result) => {
      const { groupUsers } = result;
      this.setState({
        loading: false,
        members: groupUsers,
        groupMemberCount: session.groupMemberCount,
      });
    });
  }
  handleAddMembers() {
    const { session } = this.props;
    const { isAdmin, isForbidInvite } = session;
    if (isAdmin || !isForbidInvite) {
      addGroupMembers({
        id: session.id,
        type: Constant.SESSIONTYPE_GROUP,
      });
    } else {
      alert(_l('当前仅允许群主及管理员邀请新成员'), 2);
      return false;
    }
  }
  render() {
    const { session } = this.props;
    const { groupMemberCount, isPost } = session;
    const { loading, members } = this.state;
    return (
      <div className="ChatPanel-Members ChatPanel-sessionInfo-item">
        <div className="ChatPanel-Members-hander ChatPanel-sessionInfo-hander">
          <span>
            {`${isPost ? _l('群成员') : _l('成员')} (${groupMemberCount})`}
            <i onClick={this.handleAddMembers.bind(this)} className="ThemeColor3 icon-invite" />
          </span>
          <span onClick={this.props.onSetPanelVisible.bind(this, true)} className="ChatPanel-sessionInfo-hander-entry ThemeColor3">
            {' '}
            {_l('所有成员')}
            <i className="icon-sidebar-more" />{' '}
          </span>
        </div>
        <div className="ChatPanel-Members-body">
          <div className="ChatPanel-Members-list">
            {members.map((item, index) => (
              <div key={item.accountId} className={cx('ChatPanel-Members-item', { 'ChatPanel-Members-creator': index === 0 })}>
                <Avatar id={item.accountId} avatar={item.avatar} />
              </div>
            ))}
            {loading ? <LoadDiv size="small" /> : undefined}
          </div>
        </div>
      </div>
    );
  }
}
