import React, { Component } from 'react';
import cx from 'classnames';
import { LoadDiv, UserCard } from 'ming-ui';
import GroupController from 'src/api/group';
import { getCurrentProjectId } from 'src/pages/globalSearch/utils';
import InviteOrAddUsers from './InviteOrAddUsers';
import './index.less';

class Avatar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id, avatar, projectId } = this.props;

    return (
      <UserCard sourceId={id || ''} disabled={!id} projectId={projectId}>
        <img
          ref={avatar => {
            this.avatar = avatar;
          }}
          src={avatar}
        />
      </UserCard>
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
    }).then(result => {
      const { groupUsers } = result;
      this.setState({
        loading: false,
        members: groupUsers,
        groupMemberCount: session.groupMemberCount,
      });
    });
  }

  render() {
    const { session } = this.props;
    const { groupMemberCount, isPost } = session;
    const { loading, members } = this.state;
    const hideChat = md.global.SysSettings.forbidSuites.includes('6');

    return (
      <div className="ChatPanel-Members ChatPanel-sessionInfo-item">
        <div className="ChatPanel-Members-hander ChatPanel-sessionInfo-hander">
          <span>
            {`${isPost ? _l('群成员') : _l('成员')} (${groupMemberCount})`}
            {!hideChat && <InviteOrAddUsers {...session} />}
          </span>
          <span
            onClick={this.props.onSetPanelVisible.bind(this, true)}
            className="ChatPanel-sessionInfo-hander-entry ThemeColor3"
          >
            {' '}
            {_l('所有成员')}
            <i className="icon-sidebar-more" />{' '}
          </span>
        </div>
        <div className="ChatPanel-Members-body">
          <div className="ChatPanel-Members-list">
            {members.map((item, index) => (
              <div
                key={item.accountId}
                className={cx('ChatPanel-Members-item', { 'ChatPanel-Members-creator': index === 0 })}
              >
                <Avatar id={item.accountId} avatar={item.avatar} projectId={_.get(session, 'project.projectId')} />
              </div>
            ))}
            {loading ? <LoadDiv size="small" /> : undefined}
          </div>
        </div>
      </div>
    );
  }
}
