import React from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import ScrollView from 'ming-ui/components/ScrollView';
import API, { openGroup, closeGroup } from '../api';
import { config } from '../config';
import SettingGroup from 'src/components/group/settingGroup/settingGroups';

export default class GroupDetail extends React.Component {
  constructor(props) {
    super();

    this.openSettingDialog = this.openSettingDialog.bind(this);
  }

  openSettingDialog() {
    const {
      group: { groupId },
    } = this.props;
    SettingGroup({
      groupId,
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
                <i className="Font16 Gray_9e icon-settings TxtMiddle mLeft10 Hand ThemeHoverColor3" onClick={this.openSettingDialog} />
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
    openGroup(groupId).then((result) => {
      if (result) {
        updateGroupModel(groupId, true);
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
    closeGroup(groupId).then((result) => {
      if (result) {
        updateGroupModel(groupId, false);
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  renderDetail() {
    const {
      group: { groupMemberCount, createTime, isAdmin, isOpen, createAccount },
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
