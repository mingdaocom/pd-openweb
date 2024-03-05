import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import antd from 'antd';
import Trigger from 'rc-trigger';
import { TYPES, TYPE_GROUP } from '../constants';
import InboxFilter from './baseComponent/inboxFilter';
import { Dropdown, Icon } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import Config from 'src/pages/chat/utils/config';
import * as actions from '../../../redux/actions';
import { connect } from 'react-redux';
// const ClickAwayable = createDecoratedComponent(withClickAway);

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
        text: dict[key],
        value: key,
      };
    });

    if (parsedData.length <= 1) {
      return <span>{parsedData[0].text}</span>;
    } else {
      return (
        <Dropdown
          value={type}
          data={parsedData}
          onChange={data => {
            this.handleClick(false);
            changeType(data);
          }}
        />
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
    }, 500)

  }

  handleUpdatePushNotice() {
    const { currentSession } = this.props;
    const { type, isPush, value, isSilent } = currentSession;

    this.props.dispatch(
      actions.sendSetSlience({
        type,
        AccountID: md.global.Account.accountId,
        isSilent: !isSilent,
      }),
    );
    this.handleTriggerChange(false);
  }

  renderMenu = () => {
    const { currentSession } = this.props;
    const { top_info,  type, isPush, isSilent } = currentSession;
    const isTop = top_info ? top_info.isTop : false;
    const isPushNotice = 'isPush' in currentSession || 'isSilent' in currentSession;
    const isPushNoticeValue = type === 2 ? isPush : !isSilent;

    return (
      <div className="ChatPanel-addToolbar-menu">
        <div className="menuItem ThemeBGColor3" onClick={this.handleStick.bind(this)}>
          <i className="icon-set_top" />
          <div className="menuItem-text">{isTop ? _l('取消置顶') : _l('置顶')}</div>
        </div>

        {isPushNotice && (
          <div className="menuItem ThemeBGColor3" onClick={this.handleUpdatePushNotice.bind(this)}>
            <Icon icon={isPushNoticeValue ? 'notifications_off' : 'notifications'} className="Font16" />
            <div className="menuItem-text">{isPushNoticeValue ? _l('消息免打扰') : _l('允许提醒')}</div>
          </div>
        )}
      </div>
    );
  };

  renderSetting() {
    const { settingVisible } = this.state;

    return (
      <Trigger
        popupVisible={settingVisible}
        onPopupVisibleChange={this.handleTriggerChange.bind(this)}
        popupClassName="ChatPanel-Trigger"
        action={['click']}
        popupPlacement="bottom"
        popup={this.renderMenu()}
        builtinPlacements={Config.builtinPlacements}
        popupAlign={{ offset: [80, 10] }}
      >
        <i className={cx('icon-settings mLeft10 Hand iconSetting', { ThemeColor: settingVisible })} />
      </Trigger>
    );
  }

  render() {
    const { inboxFavorite, title, filter, currentSession } = this.props;
    const { user, timeName } = filter || {};
    const clsNameFunc = flag =>
      cx('inboxItem Hand', {
        'ThemeColor3 ThemeBorderColor3': flag,
        'ThemeHoverBorderColor3 ThemeHoverColor3': !flag,
      });
    const fullname = user ? user.fullname : '';
    const { isSilent } = currentSession;

    return (
      <div className="inboxHeader">
        <div className="inboxType Absolute">
          {isSilent && <i className='icon-notifications_off Gray_9e mRight10'></i>}
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
        {!md.global.Account.isPortal && (
          <antd.Dropdown
            overlay={this.renderOverlay()}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="inboxFilterDropdown"
          >
            <div className={cx('filterWrapper flexRow valignWrapper', { transparent: _.isEmpty(filter) })}>
              {filter ? (
                <Fragment>
                  <Icon className="Font20" icon="filter" />
                  <span>
                    {fullname}
                    {fullname && timeName ? ', ' : ''}
                    {timeName}
                  </span>
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
                <Icon className="Font20 Gray_9e pointer" icon="filter" />
              )}
            </div>
          </antd.Dropdown>
        )}
      </div>
    );
  }
}

export default connect(state => {
  const { currentSession } = state.chat;

  return {
    currentSession,
  };
})(InboxHeader);
