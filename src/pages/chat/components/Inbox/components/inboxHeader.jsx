import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown, Popover } from 'ming-ui/antd-components';
import * as socket from 'src/pages/chat/utils/socket';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import * as actions from '../../../redux/actions';
import { TYPE_GROUP, TYPES } from '../constants';
import InboxFilter from './baseComponent/inboxFilter';

class InboxHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    type: PropTypes.oneOf(_.values(TYPES)),
    inboxFavorite: PropTypes.bool,
    changeType: PropTypes.func,
    changeFaviorite: PropTypes.func,
  };

  state = {
    settingVisible: false,
  };

  renderOverlay() {
    const { filter, inboxType } = this.props;
    return <InboxFilter inboxType={inboxType} filter={filter} onChange={this.props.changeInboxFilter} />;
  }

  renderDropDown() {
    const { type, dropdownData, inboxType, changeType } = this.props;
    const parsedData = _.map(dropdownData, key => {
      const dict = TYPE_GROUP[inboxType];
      return {
        label: dict[key],
        value: key,
      };
    });

    if (parsedData.length <= 1) {
      return <span>{parsedData[0].label}</span>;
    } else {
      const currentLabel = _.get(
        _.find(parsedData, item => item.value === type),
        'label',
      );

      return (
        <Dropdown
          trigger={['click']}
          placement="bottom"
          menu={{
            selectable: true,
            selectedKeys: [type],
            items: parsedData.map(item => ({
              key: item.value,
              label: item.label,
              onClick: () => {
                this.handleClick(false);
                changeType(item.value);
              },
            })),
          }}
        >
          <span className="flexRow alignItemsCenter">
            <span>{currentLabel}</span>
            <span className="InlineBlock mLeft6">
              <Icon icon="arrow-down-border" className="Font12 textTertiary" />
            </span>
          </span>
        </Dropdown>
      );
    }
  }

  handleClick = flag => {
    const { inboxFavorite, changeFaviorite } = this.props;

    if (inboxFavorite !== flag) {
      changeFaviorite(flag);
    }
  };

  handleTriggerChange(visible) {
    this.setState({
      settingVisible: visible,
    });
  }

  handleStick() {
    const { type, value, top_info } = this.props.currentSession;
    const isTop = top_info ? top_info.isTop : false;
    this.props.dispatch(
      actions.sendSetTop({
        type,
        value,
        isTop: !isTop,
      }),
    );
    setTimeout(() => {
      this.handleTriggerChange(false);
    }, 500);
  }

  handleUpdatePushNotice() {
    const { currentSession } = this.props;
    const { type, isSilent } = currentSession;

    this.props.dispatch(
      actions.sendSetSlience({
        type,
        AccountID: md.global.Account.accountId,
        isSilent: !isSilent,
      }),
    );
    this.handleTriggerChange(false);
  }

  handleClearUnread = () => {
    const { currentSession, sessionList } = this.props;
    const item = _.find(sessionList, { value: currentSession.value }) || {};

    if (item.count || item.weak_count) {
      socket.Contact.clearUnread(Object.assign({}, item)).then(() => {
        this.props.dispatch(
          actions.updateSessionList({
            id: item.value,
            clearCount: item.count,
          }),
        );
      });
    }
  };

  renderMenuItems = () => {
    const { currentSession } = this.props;
    const { top_info, type, isPush, isSilent } = currentSession;
    const isTop = top_info ? top_info.isTop : false;
    const isPushNotice = 'isPush' in currentSession || 'isSilent' in currentSession;
    const isPushNoticeValue = type === 2 ? isPush : !isSilent;

    if (md.global.Account.isPortal && !isPushNotice) {
      return [];
    }

    return [
      !md.global.Account.isPortal
        ? {
            key: 'stick',
            icon: <Icon icon="set_top" className="Font16 textSecondary" />,
            label: isTop ? _l('取消置顶') : _l('置顶'),
            onClick: this.handleStick.bind(this),
          }
        : null,
      isPushNotice
        ? {
            key: 'pushNotice',
            icon: (
              <Icon icon={isPushNoticeValue ? 'notifications_off' : 'notifications'} className="Font16 textSecondary" />
            ),
            label: isPushNoticeValue ? _l('消息免打扰') : _l('允许提醒'),
            onClick: this.handleUpdatePushNotice.bind(this),
          }
        : null,
    ].filter(Boolean);
  };

  renderSetting() {
    const { settingVisible } = this.state;
    const items = this.renderMenuItems();
    if (!items.length) return null;

    return (
      <Dropdown
        align={{ offset: [80, 10] }}
        menu={{ items, style: { width: 180 } }}
        open={settingVisible}
        placement="bottom"
        trigger={['click']}
        onOpenChange={this.handleTriggerChange.bind(this)}
      >
        <i className={cx('icon-settings mLeft10 Hand iconSetting', { colorPrimary: settingVisible })} />
      </Dropdown>
    );
  }

  render() {
    const { inboxFavorite, title, filter, currentSession } = this.props;
    const clsNameFunc = flag =>
      cx('inboxItem Hand', {
        'colorPrimary borderColorPrimary': flag,
        hoverColorPrimary: !flag,
      });
    const { isSilent } = currentSession;

    return (
      <div className="inboxHeader">
        <div className="inboxType Absolute">
          {isSilent && <i className="icon-notifications_off textTertiary mRight10"></i>}
          {title}
          {this.renderSetting()}
        </div>
        <span
          className={clsNameFunc(!inboxFavorite)}
          onClick={() => {
            this.handleClick(false);
          }}
        >
          {this.renderDropDown()}
        </span>
        <span
          className={clsNameFunc(inboxFavorite)}
          onClick={() => {
            this.handleClick(true);
          }}
        >
          {_l('星标')}
        </span>
        <div className="btnWrapper flexRow alignItemsCenter">
          <Icon
            className={cx('Font20 textTertiary pointer hoverColorPrimary refreshBtn', {
              mRight15: !md.global.Account.isPortal,
            })}
            icon="task-later"
            onClick={() => {
              if (filter) {
                this.props.changeInboxFilter(null);
              } else {
                this.props.changeUpdateNow();
              }

              this.handleClearUnread();
            }}
          />
          {!md.global.Account.isPortal && (
            <Popover trigger="click" placement="bottomRight" destroyOnHidden={false} content={this.renderOverlay()}>
              <div className={cx('filterWrapper flexRow valignWrapper mRight15', { transparent: _.isEmpty(filter) })}>
                {filter ? (
                  <Fragment>
                    <Icon className="Font20" icon="filter" />
                    <span>{_l('已筛选')}</span>
                    <Icon
                      icon="close"
                      className="Font15 mBottom2"
                      onClick={event => {
                        event.stopPropagation();
                        this.props.changeInboxFilter(null);
                      }}
                    />
                  </Fragment>
                ) : (
                  <Icon className="Font20 textTertiary pointer" icon="filter" />
                )}
              </div>
            </Popover>
          )}
          {!md.global.Account.isPortal && (
            <Icon
              className="Font20 textTertiary pointer hoverColorPrimary"
              icon="maximizing_a"
              onClick={() => {
                window.open(pathCompletion(`/windowChat?id=${currentSession.id}&type=${currentSession.type}`));
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession, sessionList } = state.chat;

  return {
    currentSession,
    sessionList,
  };
})(InboxHeader);
