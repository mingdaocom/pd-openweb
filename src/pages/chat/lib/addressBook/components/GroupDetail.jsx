import React from 'react';
import { Icon, ScrollView } from 'ming-ui';
import settingGroup from 'src/pages/Group/settingGroup';
import { closeGroup, openGroup } from '../api';
import { config } from '../config';

export default class GroupDetail extends React.Component {
  constructor(props) {
    super(props);

    this.openSettingDialog = this.openSettingDialog.bind(this);
  }

  openSettingDialog() {
    const {
      group: { groupId, groupMemberCount },
      groupStatus,
      updateGroupModel,
    } = this.props;
    settingGroup({
      groupID: groupId,
      success: (type, groupInfo) => {
        if (
          ![
            'UPDATE_AVATAR',
            'RENAME',
            'ADD_MEMBERS',
            'REMOVE_USER',
            'VERIFY',
            'APPROVE',
            'CLOSE_GROUP',
            'DELETE',
            'EXIT_GROUP',
          ].includes(type)
        )
          return;

        let newInfo = {};
        switch (type) {
          case 'UPDATE_AVATAR':
            newInfo.avatar = groupInfo.groupAvatar;
            break;
          case 'RENAME':
            newInfo.name = groupInfo.groupName;
            break;
          case 'ADD_MEMBERS':
          case 'REMOVE_USER':
            newInfo.groupMemberCount =
              type === 'REMOVE_USER' ? Math.max(0, groupMemberCount - 1) : groupMemberCount + groupInfo.accounts.length;
            break;
          case 'CLOSE_GROUP':
            newInfo.isOpen = false;
            newInfo.isDelete = groupStatus === 1;
            break;
          case 'DELETE':
          case 'EXIT_GROUP':
            newInfo.isDelete = true;
            break;
          default:
            newInfo = { ...groupInfo };
            break;
        }
        updateGroupModel(groupId, newInfo);
      },
    });
  }

  renderHeader() {
    const {
      group: { avatar, name, groupId, isOpen },
    } = this.props;
    return (
      <React.Fragment>
        {isOpen === false ? (
          <div className="detail-header">
            <img src={avatar} className="detail-header-avatar disabled" />
            <div className="detail-header-info Gray_bd">
              <div className="Font18 clearfix">{name}</div>
            </div>
          </div>
        ) : (
          <div className="detail-header">
            <img src={avatar} className="detail-header-avatar" />
            <div className="detail-header-info">
              <div className="Font18 clearfix">
                {name}
                <i
                  className="Font16 Gray_9e icon-settings TxtMiddle mLeft10 Hand ThemeHoverColor3"
                  onClick={this.openSettingDialog}
                />
              </div>
            </div>
          </div>
        )}
        {isOpen === false ? null : (
          <div className="detail-btns mTop24">
            <a
              href="javascript:void 0;"
              className="detail-btn ThemeBGColor3 ThemeHoverBGColor2 NoUnderline"
              onClick={() => {
                config.callback({ groupId });
              }}
            >
              <Icon icon="chat" className="mRight5 Font18" />
              {_l('发消息')}
            </a>
            <a href={'/feed?groupId=' + groupId} target="_blank" className="detail-btn Gray_75 mLeft10 NoUnderline">
              <Icon icon="dynamic-empty" className="mRight10 Font17" />
              {_l('群组动态')}
            </a>
          </div>
        )}
      </React.Fragment>
    );
  }

  openGroup() {
    const {
      group: { groupId },
      updateGroupModel,
    } = this.props;
    openGroup(groupId).then(result => {
      if (result) {
        updateGroupModel(groupId, { isOpen: true });
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  closeGroup() {
    const {
      group: { groupId },
      updateGroupModel,
    } = this.props;
    closeGroup(groupId).then(result => {
      if (result) {
        updateGroupModel(groupId, { isOpen: false });
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  renderDetail() {
    const {
      group: { groupMemberCount, createTime, isOpen, createAccount },
    } = this.props;
    return (
      <div className="Font13 mTop24">
        <div className="detail-info-row">
          <span className="Gray_75">{_l('创建人')}：</span>
          {createAccount.fullname}
        </div>
        <div className="detail-info-row clearfix">
          <span className="Gray_75">{_l('群组状态')}：</span>
          {isOpen === false ? _l('关闭') : _l('开启')}
          {isOpen === false ? (
            <span
              className="ThemeHoverColor3 Right Hand"
              onClick={() => {
                this.openGroup();
              }}
            >
              {_l('开启')}
            </span>
          ) : null}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('群组成员')}：</span>
          {groupMemberCount}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('创建时间')}：</span>
          {createTime}
        </div>
      </div>
    );
  }

  render() {
    if (!this.props.group) return null;
    return (
      <ScrollView>
        <div className="contacts-detail-wrapper">
          {this.renderHeader()}
          {this.renderDetail()}
        </div>
      </ScrollView>
    );
  }
}
