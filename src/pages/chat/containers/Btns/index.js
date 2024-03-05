import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import config from '../../utils/config';
import * as actions from '../../redux/actions';
import * as socket from '../../utils/socket';
import Constant from '../../utils/constant';
import SearchMember from '../../components/SearchMember';
import Trigger from 'rc-trigger';
import './index.less';
import { createDiscussion } from '../../utils/group';
import AddressBook from '../../lib/addressBook';
import Tooltip from 'ming-ui/components/Tooltip';
import CreateGroup from 'src/components/group/create/creatGroup';
import addFriends from 'src/components/addFriends';

class Btns extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchVisible: false,
      menuVisible: false,
      tooltipVisible: true,
      dark: !this.props.visible,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      dark: !nextProps.visible,
    });
    if (nextProps.showNewFriends !== this.props.showNewFriends && nextProps.showNewFriends) {
      this.props.dispatch(actions.setShowAddressBook(true));
    }
  }
  handleOpenChatList() {
    const { visible } = this.props;

    this.props.dispatch(actions.setVisible(!visible));
    // 优化交互体验
    this.setState(
      {
        tooltipVisible: false,
        dark: false,
      },
      () => {
        this.setState({
          tooltipVisible: true,
        });
        setTimeout(() => {
          this.setState({
            dark: visible,
          });
        }, 500);
      },
    );
  }
  handleOpenSession(data = {}) {
    const { groupId, accountId } = data;
    if (groupId) {
      const msg = {
        to: groupId,
        avatar: data.avatar,
        groupname: data.name,
        msg: { con: '' },
      };
      this.props.dispatch(actions.addGroupSession(groupId, msg));
    } else {
      const msg = {
        logo: data.avatarMiddle,
        uname: data.fullname,
        sysType: 1,
      };
      this.props.dispatch(actions.addUserSession(accountId, msg));
    }
  }
  handleMenuChange() {
    const { menuVisible } = this.state;
    this.setState({
      menuVisible: !menuVisible,
    });
  }
  handleInvite() {
    addFriends({ selectProject: true });
    this.handleMenuChange();
  }
  handleAddSession() {
    createDiscussion(undefined, (result, isGroup) => {
      if (isGroup) {
        // const message = {
        //   count: 0,
        //   msg: {
        //     con: `${_l('我')}：${_l('聊天创建成功')}`,
        //   },
        // };
        // this.props.dispatch(actions.setCurrentSessionId(result.groupId, message));
      } else {
        const { accountId, avatar, fullname } = result[0];
        const msg = {
          logo: avatar,
          uname: fullname,
          sysType: 1,
        };
        this.props.dispatch(actions.addUserSession(accountId, msg));
      }
    });
    this.handleMenuChange();
  }
  handleCreateGroup() {
    CreateGroup.createInit({
      callback(group) {},
    });
    this.handleMenuChange();
  }
  handleAddressBook(data) {
    const { accountId, groupId, type } = data;
    if (accountId) {
      this.props.dispatch(
        actions.addUserSession(accountId, {
          msg: { con: '' },
          sysType: 1,
        }),
      );
      return;
    }
    if (groupId) {
      this.props.dispatch(actions.addGroupSession(groupId));
      return;
    }
    if (type === 'file-transfer') {
      const { name } = Constant.FILE_TRANSFER;
      const message = {
        uname: name,
        sysType: 1,
      };
      this.props.dispatch(actions.addUserSession(type, message));
    } else {
      const message = {
        count: 0,
        id: type,
        type,
        dtype: type,
      };
      switch (type) {
        case 'post':
          message.type = Constant.SESSIONTYPE_POST;
          break;
        case 'system':
          message.type = Constant.SESSIONTYPE_SYSTEM;
          break;
        case 'calendar':
          message.type = Constant.SESSIONTYPE_CALENDAR;
          break;
        case 'task':
          message.type = Constant.SESSIONTYPE_TASK;
          break;
        case 'knowledge':
          message.type = Constant.SESSIONTYPE_KNOWLEDGE;
          break;
        case 'hr':
          message.type = Constant.SESSIONTYPE_HR;
          break;
        case 'worksheet':
          message.type = Constant.SESSIONTYPE_WORKSHEET;
          break;
        case 'workflow':
          message.type = Constant.SESSIONTYPE_WORKFLOW;
          break;
        default:
          break;
      }
      socket.Contact.recordAction({
        id: message,
        type: 3,
      });
      socket.Contact.clearUnread({
        type: message.type,
        value: type,
      }).then(result => {
        this.props.dispatch(
          actions.updateSessionList({
            id: type,
            clearCount: 0,
          }),
        );
      });
      this.props.dispatch(actions.addSysSession(type, message));
    }
  }
  handleMouseEnter() {
    $('body,html').addClass('overflowHidden');
  }
  handleMouseLeave() {
    $('body,html').removeClass('overflowHidden');
  }
  renderMenu() {
    return (
      <div className="ChatPanel-addToolbar-menu">
        {/* <div className="menuItem ThemeBGColor3" onClick={this.handleInvite.bind(this)}>
          <i className="icon-invite" />
          <div className="menuItem-text">{_l('邀请联系人')}</div>
        </div> */}
        <div
          className="menuItem ThemeBGColor3"
          title={_l('快速发起一个临时聊天，有需要可以转为群组')}
          onClick={this.handleAddSession.bind(this)}
        >
          <i className="icon-task-reply-msg" />
          <div className="menuItem-text">
            {_l('发起聊天')}
            {' ( Q )'}
          </div>
        </div>
        <div
          className="menuItem ThemeBGColor3"
          title={_l('创建群组进行协作，群组可以设置管理员管理群组成员，并可作为动态分享范围，关联部门')}
          onClick={this.handleCreateGroup.bind(this)}
        >
          <i className="icon-group" />
          <div className="menuItem-text">{_l('创建群组')}</div>
        </div>
      </div>
    );
  }
  renderBtns(name) {
    const { visible } = this.props;
    const { menuVisible, tooltipVisible, dark } = this.state;
    const direction = visible ? 'top' : 'left';
    const isEn = (getCookie('i18n_langtag') || md.global.Config.DefaultLang) == 'en';
    return (
      <div className={name}>
        <Tooltip popupPlacement={direction} text={<span>{_l('搜索')}</span>}>
          <div
            className="ChatList-btn search-btn"
            onClick={() => {
              this.setState({ searchVisible: true });
            }}
          >
            <i className="ThemeColor3 icon-search" />
          </div>
        </Tooltip>
        <Tooltip
          popupPlacement={direction}
          text={
            <span>
              {_l('通讯录')}
              {' ( E )'}
            </span>
          }
        >
          <div
            className="ChatList-btn addressBook-btn"
            onClick={() => {
              this.props.dispatch(actions.setShowAddressBook(true));
            }}
          >
            <i className="ThemeColor3 icon-topbar-addressList" />
          </div>
        </Tooltip>
        <Tooltip
          popupPlacement={direction}
          text={
            <span>
              {_l('发起聊天')}
              {' ( Q )'}
            </span>
          }
        >
          <div className="ChatList-btn chat-btn" onClick={this.handleMenuChange.bind(this)}>
            <i className="ThemeColor3 icon-initiate_chat" />
          </div>
        </Tooltip>
        <Tooltip
          popupPlacement={direction}
          text={
            <span>
              {visible ? _l('收起') : _l('展开')}
              {' (~)'}
            </span>
          }
          disable={!tooltipVisible}
          tooltipClass={cx({ 'ChatList-btn-Tooltip': visible, 'ChatList-btn-Tooltip-en': visible && isEn })}
          offset={visible ? [isEn ? -20 : -10, 1] : [1, 1]}
        >
          <div className={cx('ChatList-btn sidebar-btn', { dark: dark })} onClick={this.handleOpenChatList.bind(this)}>
            <i className={`${visible ? 'ThemeColor3' : ''} ${visible ? 'icon-menu_right' : 'icon-menu_left'}`} />
          </div>
        </Tooltip>
      </div>
    );
  }
  renderAddressBook() {
    const { history, location, showAddressBook, showNewFriends } = this.props;
    const props = {
      showAddressBook,
      showNewFriends,
      closeDialog: data => {
        this.props.dispatch(actions.setShowAddressBook(false));
        if (data && !data.target) {
          this.handleAddressBook(data);
        }
        if (showNewFriends) {
          const { pathname, search, hash } = location;
          history.replace(`${pathname}${search}${hash ? '#' + hash : hash}`, {
            showNewFriends: false,
          });
        }
      },
    };
    return <AddressBook {...props} />;
  }
  render() {
    const { visible } = this.props;
    const { searchVisible, menuVisible } = this.state;
    return (
      <div
        className={cx('ChatList-btns-wrapper ThemeBGColor9', { visible: !visible })}
        onMouseEnter={this.handleMouseEnter.bind(this)}
        onMouseLeave={this.handleMouseLeave.bind(this)}
      >
        {this.renderBtns(cx('ChatList-btns ChatList-column-btns', { visible }))}
        {this.renderBtns(cx('ChatList-btns ChatList-row-btns', { visible: !visible }))}
        {searchVisible ? (
          <SearchMember
            onOpenSession={this.handleOpenSession.bind(this)}
            onHideSearch={() => {
              this.setState({ searchVisible: false });
            }}
          />
        ) : undefined}
        {this.renderAddressBook()}
        <Trigger
          popupVisible={menuVisible}
          onPopupVisibleChange={this.handleMenuChange.bind(this)}
          popupClassName="ChatPanel-Trigger"
          action={['click']}
          popupPlacement="top"
          builtinPlacements={config.builtinPlacements}
          popup={this.renderMenu()}
          popupAlign={{ offset: visible ? [14, 0] : [-70, 40] }}
        >
          <div />
        </Trigger>
      </div>
    );
  }
}

export default connect(({ chat }, ownProps) => {
  const { visible, showAddressBook } = chat;
  const {
    location: { state },
  } = ownProps;
  const showNewFriends = (state || {}).showNewFriends;
  return {
    visible,
    showNewFriends,
    showAddressBook,
  };
})(Btns);
