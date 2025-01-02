import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import config from '../../utils/config';
import * as actions from '../../redux/actions';
import * as socket from '../../utils/socket';
import * as utils from '../../utils/';
import Constant from '../../utils/constant';
import Tooltip from 'ming-ui/components/Tooltip';
import GroupController from 'src/api/group';
import { createDiscussion } from '../../utils/group';
import SettingGroup from 'src/components/group/settingGroup/settingGroups';

const { GROUPACTION } = Constant;

class ChatPanelHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchVisible: false,
      focus: false,
      value: '',
      triggerVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.searchText) {
      this.setState({
        focus: false,
        searchVisible: false,
        value: '',
      });
    }
  }
  handleClosePanel() {
    this.props.dispatch(actions.setNewCurrentSession({}));
    socket.Contact.recordAction({ id: '' });
  }
  handleSearch() {
    this.setState(
      {
        searchVisible: true,
      },
      () => {
        $(this.input).focus();
      },
    );
  }
  handleSearchHidden() {
    this.setState({
      searchVisible: false,
      value: '',
    });
    this.props.onSearchText('');
  }
  handleFocus() {
    this.setState({
      focus: true,
    });
  }
  handleBlur() {
    const { value } = this.state;
    if (value) {
      return;
    }
    this.setState({
      focus: false,
      searchVisible: false,
    });
    this.props.onSearchText('');
  }
  handleChange(event) {
    this.setState({
      value: event.target.value,
    });
  }
  handleKeyDown(event) {
    // ESC
    if (event.which === 27) {
      this.handleSearchHidden();
    }
    // 回车
    if (event.which === 13) {
      const { value } = this.state;
      if (value) {
        this.props.onSearchText(value);
      }
    }
  }
  handleTriggerChange(triggerVisible) {
    this.setState({
      triggerVisible,
    });
  }
  handleSettingGroup() {
    const { session } = this.props;
    SettingGroup({
      groupID: session.id,
      isApprove: false,
      isChat: true,
      success: (type, data) => {
        switch (type) {
          case GROUPACTION.RENAME:
            this.props.dispatch(actions.resetGroupName(data.groupId, data.groupName));
            break;
          case GROUPACTION.UPDATE_AVATAR:
            this.props.dispatch(actions.updateGroupAvatar(data.groupID, data.groupAvatar));
            break;
          case GROUPACTION.UPDATE_DESC:
            this.props.dispatch(actions.updateGroupAbout(data.groupId, data.groupAbout));
            break;
          case GROUPACTION.ADD_MEMBERS:
            // this.props.dispatch(actions.updateMember(data.groupId, data.accounts.length));
            break;
          case GROUPACTION.REMOVE_MEMBER:
            // this.props.dispatch(actions.updateMember(data.groupId, -1));
            break;
          case GROUPACTION.TROUBLE_FREE:
            this.props.dispatch(actions.updateGroupPushNotice(data.groupId, data.isPushNotice));
            break;
          case GROUPACTION.FORBID_INVITE:
            // this.props.dispatch(actions.updateForbIdInvite(data.groupId, data.isForbidInvite));
            break;
          default:
            break;
        }
      },
    });
    this.handleTriggerChange(false);
  }
  handleUpdateGroupPushNotice() {
    const { session } = this.props;
    const isPushNotice = !session.isPushNotice;
    GroupController.updateGroupPushNotice({
      groupId: session.id,
      isPushNotice,
    }).then(result => {
      this.props.dispatch(actions.updateGroupPushNotice(session.id, isPushNotice));
      // isPushNotice ? alert(_l('已关闭消息免打扰')) : alert(_l('已开启消息免打扰'));
    });
    this.handleTriggerChange(false);
  }
  handleAddSession() {
    const { session } = this.props;
    createDiscussion(session.id, result => {});
  }
  handleOpenChatWindow() {
    const { session, isWindow } = this.props;
    if (isWindow) {
      utils.chatWindow.remove(session.id);
      socket.Contact.setCurrentChat({});
      if (window.opener && window.opener.reloadChatPanel) {
        window.opener.reloadChatPanel(session.id, session.isGroup);
      }
      window.close();
    } else {
      const { id, isGroup } = session;
      const name = session.name || session.fullname;
      utils.windowOpen(id, name, isGroup);
      this.props.dispatch(actions.removeCurrentSession(id));
      this.props.dispatch(actions.removeMessages(id));
      this.props.dispatch(actions.setNewCurrentSession({}));
    }
  }
  handleStick() {
    const { session } = this.props;
    const { isTop, id, groupId } = session;
    this.props.dispatch(
      actions.sendSetTop({
        type: groupId ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER,
        value: id,
        isTop: !isTop,
      }),
    );
    this.handleTriggerChange(false);
  }
  handleGoto() {
    const { session } = this.props;
    const { isGroup, id } = session;
    const isFileTrsnsfer = id === Constant.FILE_TRANSFER.id;
    if (isFileTrsnsfer || (isGroup && !session.isPost)) {
      return;
    }
    if (isGroup) {
      window.open(`/feed?groupId=${id}`);
    } else {
      window.open(`/user_${id}`);
    }
  }
  renderIcon() {
    const { session } = this.props;
    if (session.isPushNotice) {
      return <i className="icon-notifications_off" />;
    } else {
      return <i className="icon-notifications" />;
    }
  }
  renderMenu() {
    const { session } = this.props;
    const { isGroup, isTop, groupId } = session;
    const isSet = 'isSession' in session ? (groupId ? true : false) : true;
    // const isSet = false;
    const hideChat = md.global.SysSettings.forbidSuites.includes('6');
    return (
      <div className="ChatPanel-addToolbar-menu">
        {isSet ? (
          <div className="menuItem ThemeBGColor3" onClick={this.handleStick.bind(this)}>
            <i className="icon-set_top" />
            <div className="menuItem-text">{isTop ? _l('取消置顶') : _l('置顶')}</div>
          </div>
        ) : undefined}
        {isGroup ? (
          <div className="menuItem ThemeBGColor3" onClick={this.handleUpdateGroupPushNotice.bind(this)}>
            {session.isGroup ? this.renderIcon() : undefined}
            <div className="menuItem-text">{session.isPushNotice ? _l('消息免打扰') : _l('允许提醒')}</div>
          </div>
        ) : undefined}
        {/* <div className="menuItem ThemeBGColor3" onClick={this.handleStick.bind(this)}>
          <i className="icon-text" />
          <div className="menuItem-text">{_l('字体大小')}</div>
          <i className="icon-arrow-right-tip" style={{marginLeft: 60, fontSize: 12}}/>
        </div> */}
        {!hideChat && isGroup ? (
          <div className="menuItem ThemeBGColor3" onClick={this.handleSettingGroup.bind(this)}>
            <i className="icon-group" />
            <div className="menuItem-text">{session.isPost ? _l('群组设置') : _l('聊天设置')}</div>
          </div>
        ) : undefined}
      </div>
    );
  }
  renderSetting() {
    const { triggerVisible } = this.state;
    return (
      <Trigger
        popupVisible={triggerVisible}
        onPopupVisibleChange={this.handleTriggerChange.bind(this)}
        popupClassName="ChatPanel-Trigger"
        action={['click']}
        popupPlacement="bottom"
        builtinPlacements={config.builtinPlacements}
        popup={this.renderMenu()}
        popupAlign={{ offset: [80, 10] }}
      >
        <i className={cx('icon-settings ThemeColor3', { iconHover: !triggerVisible })} />
      </Trigger>
    );
  }
  render() {
    const { infoVisible, session, isWindow, isOpenFile } = this.props;
    const { searchVisible, focus, value } = this.state;
    const name = session.name || session.fullname;
    const isFileTrsnsfer = session.id === Constant.FILE_TRANSFER.id;
    const isSet = 'isSession' in session ? (session.groupId ? true : false) : true;
    const hideChat = md.global.SysSettings.forbidSuites.includes('6');
    // const isSet = session.groupId ? true : false;

    return (
      <div className="ChatPanel-header">
        <div className="title" title={name}>
          {session.isGroup && !session.isPushNotice ? (
            <Tooltip popupPlacement="top" text={<span>{_l('关闭消息免打扰')}</span>}>
              <i onClick={this.handleUpdateGroupPushNotice.bind(this)} className="icon-chat-bell-nopush" />
            </Tooltip>
          ) : undefined}
          <span onClick={this.handleGoto.bind(this)} className="ThemeColor3 name">
            {name}
          </span>
          {session.isVerified ? (
            <Tooltip popupPlacement="top" text={<span>{_l('已设为官方群')}</span>}>
              <i className="icon-chat-vip"></i>
            </Tooltip>
          ) : undefined}
          {isSet ? this.renderSetting() : undefined}
        </div>
        <div className="other" style={{ marginRight: isWindow ? 15 : 0 }}>
          {isFileTrsnsfer ? undefined : (
            <div className={cx('search-wrapper', { 'hidden-wrapper': !searchVisible })}>
              <i onClick={this.handleSearch.bind(this)} className="icon-search ThemeColor3 iconHover" />
              <input
                ref={input => {
                  this.input = input;
                }}
                className={cx('search-input', { ThemeBorderColor3: focus })}
                placeholder={session.isGroup ? _l('搜索成员、文件或聊天记录') : _l('搜索文件或聊天记录')}
                onFocus={this.handleFocus.bind(this)}
                onBlur={this.handleBlur.bind(this)}
                onChange={this.handleChange.bind(this)}
                onKeyDown={this.handleKeyDown.bind(this)}
                type="text"
                value={value}
              />
              <i onClick={this.handleSearchHidden.bind(this)} className="icon-delete ThemeColor3 iconHover" />
            </div>
          )}
          {session.isGroup || isFileTrsnsfer || hideChat ? undefined : (
            <Tooltip text={<span>{_l('发起聊天')}</span>}>
              <i onClick={this.handleAddSession.bind(this)} className="icon-invite ThemeColor3 iconHover" />
            </Tooltip>
          )}
          <Tooltip text={<span>{_l('查看文件')}</span>}>
            <i
              onClick={this.props.onOpenFile.bind(this, !isOpenFile)}
              className={cx('icon-task-folder-solid ThemeColor3', { iconHover: !isOpenFile })}
            />
          </Tooltip>
          {session.isGroup ? (
            <Tooltip popupPlacement="top" text={<span>{infoVisible ? _l('隐藏会话详情') : _l('显示会话详情')}</span>}>
              {infoVisible ? (
                <i
                  onClick={this.props.onSetInfoVisible.bind(this, false)}
                  className="icon-sidebar-start ThemeColor3 iconHover"
                />
              ) : (
                <i
                  onClick={this.props.onSetInfoVisible.bind(this, true)}
                  className="icon-drop_down_menu ThemeColor3 iconHover"
                />
              )}
            </Tooltip>
          ) : undefined}
          {isFileTrsnsfer ? undefined : (
            <Tooltip text={<span>{isWindow ? _l('恢复') : _l('新窗口聊天')}</span>}>
              <i
                onClick={this.handleOpenChatWindow.bind(this)}
                className={`${isWindow ? 'icon-maximizing_b' : 'icon-maximizing_a'} ThemeColor3 iconHover`}
              />
            </Tooltip>
          )}
          {isWindow ? undefined : (
            <i onClick={this.handleClosePanel.bind(this)} className="icon-close ThemeColor3 iconHover" />
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession, visible, isWindow } = state.chat;

  return {
    currentSession,
    visible,
    isWindow,
  };
})(ChatPanelHeader);
