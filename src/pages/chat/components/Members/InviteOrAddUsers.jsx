import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import addFriends from 'src/components/addFriends';
import Constant from '../../utils/constant';
import { addGroupMembers } from '../../utils/group';

const ITEMS = [
  {
    value: 'addUsers',
    text: _l('从通讯录添加'),
  },
  {
    value: 'inviteUsers',
    text: _l('更多邀请'),
  },
];

export default class InviteOrAddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClick = ({ key }) => {
    const { isAdmin, isForbidInvite, id, groupId, name } = this.props;

    if (key === 'addUsers') {
      if (isAdmin || !isForbidInvite) {
        addGroupMembers({
          id: id,
          type: Constant.SESSIONTYPE_GROUP,
        });
      } else {
        alert(_l('当前仅允许群主及管理员邀请新成员'), 2);
        return false;
      }
    } else {
      addFriends({
        projectId: groupId,
        fromType: 1,
        fromText: name,
      });
    }
  };

  render() {
    return (
      <Dropdown
        trigger={['click']}
        placement="bottom"
        overlayClassName="addMembersMoreAction"
        overlay={
          <Menu onClick={this.handleClick}>
            {ITEMS.map(i => (
              <Menu.Item key={i.value}>
                <span>{i.text}</span>
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <span className="Hand Gray_9e ThemeHoverColor3 icon-invite Font18" ref={con => (this.$wrap = con)}></span>
      </Dropdown>
    );
  }
}
