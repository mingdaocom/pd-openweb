import React, { Component, forwardRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Tooltip } from 'ming-ui/antd-components';
import defaultGroupAvatar from './resource/defaultGroupAvatar.png';
import './index.less';

const AvatarImage = forwardRef(({ className, isGroup, isPost, logo, ...restProps }, ref) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const showDefaultGroupAvatar = isGroup && loadFailed;

  return (
    <img
      {...restProps}
      ref={ref}
      src={showDefaultGroupAvatar ? defaultGroupAvatar : logo}
      className={cx(className, { radius: isPost !== false, 'default-group-avatar': showDefaultGroupAvatar })}
      draggable={false}
      onError={isGroup && !showDefaultGroupAvatar ? () => setLoadFailed(true) : undefined}
    />
  );
});

AvatarImage.displayName = 'AvatarImage';

class SessionItem extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps) {
    const next = {
      isActive: nextProps.isActive,
      isHover: nextProps.isHover,
      visible: nextProps.visible,
      item: nextProps.item,
    };
    const current = {
      isActive: this.props.isActive,
      isHover: this.props.isHover,
      visible: this.props.visible,
      item: this.props.item,
    };

    if (_.isEqual(next, current)) {
      return false;
    }

    return true;
  }
  renderImportantInfo() {
    const { item, isActive } = this.props;
    const isPush = 'isPush' in item ? item.isPush : true;
    const showBadge = 'showBadge' in item ? item.showBadge : 0;

    if (
      (item.refer && item.refer.user && item.refer.user.account_id === md.global.Account.accountId) ||
      (item.reflist && item.reflist.length) ||
      (showBadge === 2 && item.isSilent)
    ) {
      return <span className="msg-at msg-reply">[{_l('有人回复我')}]</span>;
    } else if ((item.atlist && item.atlist.length) || (showBadge === 1 && item.isSilent)) {
      return <span className="msg-at">[{_l('有人@我')}]</span>;
    } else if (item.sendMsg && !isActive) {
      return <span className="msg-draft">[{_l('草稿')}]</span>;
    } else if (!isPush && item.count) {
      return <span className="msg-unread">[{_l('%0条', item.count)}]</span>;
    } else {
      return undefined;
    }
  }
  renderListInfo(item) {
    const { isActive } = this.props;
    const { msg } = item;
    const isPush = 'isPush' in item ? ('iconType' in item ? true : item.isPush) : true;
    const isDraft = item.sendMsg && !isActive;
    const isSilent = 'isSilent' in item ? item.isSilent : false;
    return (
      <div className="SessionList-info">
        <div className="name textPrimary" title={item.name}>
          {item.name}
        </div>
        <div className="time textTertiary" title={item.time}>
          {item.time}
        </div>
        <div className="msg textSecondary" title={msg.con}>
          {this.renderImportantInfo()}
          <span className="msg-con">{isDraft ? `${_l('我')}: ${item.sendMsg}` : msg.con}</span>
          {!isPush || isSilent ? <i className="textTertiary icon-chat-bell-nopush" /> : undefined}
        </div>
      </div>
    );
  }
  renderAvatar(item) {
    const { logo, isPost } = item;

    if (logo) {
      return <AvatarImage key={logo} logo={logo} isGroup={item.isGroup} isPost={isPost} />;
    } else {
      if (item.iconType === 'calendar') {
        return <div className={cx('circle', `chat_${item.iconType}`)} data-date={new Date().getDate()} />;
      } else {
        return <div className={cx('circle', `chat_${item.iconType}`)} />;
      }
    }
  }
  handleClick = event => {
    this.props.onClick?.(event);
    this.props.onOpenPanel?.(event);
  };
  render() {
    const { item, visible, isActive, isHover } = this.props;
    const { top_info } = item;
    const isPush = 'isPush' in item ? item.isPush : 'weak_count' in item ? item.count : true;
    const isTop = top_info ? top_info.isTop : false;
    const isSilent = 'isSilent' in item ? item.isSilent : false;

    return (
      <div
        ref={this.props.forwardedRef}
        className={cx('SessionList-item', this.props.className, {
          active: isActive,
          bgTertiary: isHover,
          topBGColor: visible && isTop,
        })}
        onClick={this.handleClick}
        onContextMenu={this.props.onContextMenu}
        data-id={item.value}
      >
        {/*visible ? (
          <div onClick={this.props.onRemoveSession} title={_l('关闭会话')} className="delete textSecondary">
            <i className="icon-delete" />
          </div>
        ) : undefined*/}
        <div className="SessionList-avatar">
          {item.count || item.weak_count ? (
            <div
              className={cx('unread', {
                'unread-nopush': 'isSilent' in item ? isSilent || (item.weak_count && item.count === 0) : !isPush,
              })}
            >
              {item.count > 99 ? 99 : item.count}
            </div>
          ) : undefined}
          {visible ? (
            this.renderAvatar(item)
          ) : (
            <Tooltip placement="left" title={item.name} mouseLeaveDelay={0.1}>
              {this.renderAvatar(item)}
            </Tooltip>
          )}
          {item.sendMsg && !isActive ? (
            <div className="SessionList-draft">
              <i className="icon-edit" />
            </div>
          ) : undefined}
        </div>
        {visible && this.renderListInfo(item)}
      </div>
    );
  }
}

const ForwardedSessionItem = forwardRef((props, ref) => <SessionItem {...props} forwardedRef={ref} />);

ForwardedSessionItem.displayName = 'SessionItem';

export default ForwardedSessionItem;
