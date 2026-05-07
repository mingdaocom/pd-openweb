import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { BgIconButton, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import SearchMember from 'src/pages/chat/components/SearchMember';
import * as actions from 'src/pages/chat/redux/actions';
import * as socket from 'src/pages/chat/utils/socket';
import Avatar from '../ChatList/Avatar';
import RenderAddressBook from '../ChatList/Toolbar/RenderAddressBook';
import SessionList from '../SessionList';
import errorIcon from '../SessionList/resource/errorIcon.png';
import CreateGroup from './CreateGroup';

const Wrap = styled.div`
  box-shadow: var(--shadow-md);
  .icon-home_page {
    border: 1px solid var(--color-border-secondary);
    padding: 3px;
    border-radius: 50%;
  }
  .errorIcon {
    transform: scale(0.5);
  }
`;

const SessionListDrawer = props => {
  const { toolbarConfig, setToolbarConfig, embed = false, socketState } = props;
  const { sessionListFixing } = toolbarConfig;
  const [searchValue, setSearchValue] = useState(null);
  const hideChat = md.global.SysSettings.forbidSuites.includes('6');

  return (
    <Wrap className={cx('flexColumn h100 w100 bgPrimary pLeft10 pRight10', embed ? 'pTop4' : 'pTop10')}>
      <div className="header flexRow alignItemsCenter justifyContentBetween">
        {embed ? (
          <BgIconButton
            tooltip={_l('首页')}
            icon="home_page"
            iconClassName="Font20 textSecondary"
            onClick={() => {
              location.href = '/dashboard';
            }}
          />
        ) : (
          <BgIconButton
            icon="set_top"
            tooltip={sessionListFixing ? _l('取消固定') : _l('固定')}
            iconClassName="Font20"
            iconStyle={
              sessionListFixing ? { color: 'var(--color-text-title)' } : { color: 'var(--color-text-placeholder)' }
            }
            onClick={() => {
              setToolbarConfig({ sessionListFixing: !sessionListFixing });
              localStorage.setItem('sessionListFixing', !sessionListFixing);
            }}
          />
        )}
        <div className="flexRow alignItemsCenter">
          <BgIconButton
            icon="clean"
            tooltip={_l('已读全部消息')}
            className="Font19 pointer textSecondary mRight10"
            onClick={() => {
              socket.Contact.clearAllUnread();
              alert(_l('操作成功'));
            }}
          />
          {embed ? (
            <Avatar embed={embed} />
          ) : (
            <Fragment>
              <BgIconButton
                icon="launch"
                tooltip={_l('新窗口打开')}
                className="Font19 pointer textSecondary mRight10"
                onClick={() => {
                  window.open('/windowChat');
                }}
              />
              <BgIconButton
                icon="close"
                className="Font22 pointer textSecondary"
                onClick={() => {
                  setToolbarConfig({ sessionListVisible: false });
                  localStorage.removeItem('toolBarOpenType');
                }}
              />
            </Fragment>
          )}
        </div>
      </div>
      {socketState === 1 && (
        <div className="flexRow alignItemsCenter mTop10">
          <LoadDiv className="mp0 mLeft5" size="small" />
          <div className="mLeft5 bold">{_l('正在连接...')}</div>
        </div>
      )}
      {socketState === 2 && (
        <div className="flexRow alignItemsCenter mTop10 textError">
          <Tooltip title={_l('连接失败，点击刷新重试')} placement="bottom">
            <img src={errorIcon} className="errorIcon pointer" onClick={() => location.reload()} />
          </Tooltip>
          <div className="mLeft5 bold">{_l('连接已断开')}</div>
        </div>
      )}
      <div className="content flexColumn mTop10 flex Font14 Relative minHeight0">
        {embed && (
          <Fragment>
            <div className="textPrimary bold Font28 pLeft12 pRight12 mBottom5" style={{ lineHeight: 1 }}>
              {_l('消息')}
            </div>
            <RenderAddressBook />
          </Fragment>
        )}
        {!hideChat && (
          <div className="flexRow alignItemsCenter pLeft4 pRight4 mTop5 mBottom10">
            <SearchMember embed={embed} searchValue={searchValue} setSearchValue={setSearchValue} />
            <BgIconButton
              icon="contacts-book"
              iconClassName="Font19 pointer textSecondary"
              tooltip={`${_l('通讯录')}`}
              onClick={() => props.setShowAddressBook(true)}
              shortcut={'E'}
            />
          </div>
        )}
        <div className="flexColumn flex Relative minHeight0">
          <SessionList visible={true} />
        </div>
        {!searchValue && !hideChat && <CreateGroup />}
      </div>
    </Wrap>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
    socketState: state.chat.socketState,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig', 'setShowAddressBook']), dispatch),
)(SessionListDrawer);
