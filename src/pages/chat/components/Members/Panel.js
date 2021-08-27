import React, { Component } from 'react';
import cx from 'classnames';
import Constant from '../../utils/constant';
import Dropdown from 'ming-ui/components/Dropdown';
import GroupController from 'src/api/group';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { addGroupMembers } from '../../utils/group';

export class Member extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { item } = this.props;
    const { accountId } = md.global.Account;
    return (
      <div className="ChatPanel-Member-item">
        <div className="userAvatar">
          <img src={item.avatar} />
        </div>
        <div className="userInfo">
          <div className="name" title={item.fullname}>
            {item.fullname}
          </div>
          {item.groupUserRole === 1 ? <i className="icon-crown" /> : undefined}
          <div className="memberInfo">
            {item.companyName ? <span>{item.companyName}</span> : undefined}
            {item.job ? <span>{item.job}</span> : undefined}
          </div>
        </div>
        {accountId === item.accountId ? (
          undefined
        ) : (
          <div className="userAction" onClick={this.props.onOpenSession.bind(this, item)}>
            <i className="ThemeColor3 icon-chat-session" />
          </div>
        )}
      </div>
    );
  }
}

export default class MembersPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      loading: false,
      members: [],
      dropdownData: [{ text: _l('全部'), value: 1 }, { text: _l('仅显示其他协作关系'), value: 4 }],
      dropdownValue: 1,
      groupMemberCount: 0,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { session } = nextProps;
    if (session.groupMemberCount !== this.state.groupMemberCount) {
      this.setState(
        {
          pageIndex: 1,
          loading: false,
          members: [],
        },
        () => {
          this.getGroupUsers();
        }
      );
    }
  }
  componentDidMount() {
    this.getGroupUsers();
  }
  getGroupUsers() {
    const { session } = this.props;
    const { members, loading, pageIndex, dropdownValue } = this.state;
    if (loading || !pageIndex) {
      return;
    }
    this.setState({
      loading: true,
    });
    GroupController.getGroupUsers({
      groupId: session.id,
      pageIndex,
      pageSize: 15,
      type: dropdownValue,
    }).then((result) => {
      const { groupUsers, groupMemberCount } = result;
      this.setState({
        pageIndex: groupUsers.length >= 15 ? pageIndex + 1 : 0,
        loading: false,
        members: members.concat(groupUsers),
        groupMemberCount,
      });
    });
  }
  handleDropdownChange(value) {
    this.setState(
      {
        pageIndex: 1,
        loading: false,
        dropdownValue: value,
        members: [],
      },
      () => {
        this.getGroupUsers();
      }
    );
  }
  handleScrollEnd() {
    this.getGroupUsers();
  }
  handleAddMembers() {
    const { session } = this.props;
    const { isForbidInvite, isAdmin } = session;
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
    const { dropdownValue, dropdownData, loading, members } = this.state;
    const { session } = this.props;
    const { groupMemberCount } = session;
    return (
      <div className="ChatPanel-MembersPanel">
        <div className="header">
          <span className="slideInfoBar ThemeColor3" onClick={this.props.onSetPanelVisible.bind(this, false)}>
            <i className="icon-arrow-left-border" />
            {_l('返回')}
          </span>
          <span className="title">{`${_l('成员')} (${groupMemberCount})`}</span>
          <span onClick={this.handleAddMembers.bind(this)} data-tip={_l('添加成员')} className="addMember tip-bottom-left ThemeColor3">
            <i className="icon-invite" />
          </span>
        </div>
        <div className="filter">
          <Dropdown className="dropdown" value={dropdownValue} data={dropdownData} onChange={this.handleDropdownChange.bind(this)} />
        </div>
        <div className="content">
          <ScrollView onScrollEnd={this.handleScrollEnd.bind(this)} className="flex">
            {members.map(item => <Member item={item} key={item.accountId} onOpenSession={this.props.onOpenSession} />)}
            <LoadDiv className={cx({ Hidden: !loading })} size="small" />
          </ScrollView>
        </div>
      </div>
    );
  }
}
