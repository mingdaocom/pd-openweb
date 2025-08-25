import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import SearchMember from 'src/pages/chat/components/SearchMember';
import * as actions from 'src/pages/chat/redux/actions';
import * as socket from 'src/pages/chat/utils/socket';
import Avatar from '../ChatList/Avatar';
import RenderAddressBook from '../ChatList/Toolbar/RenderAddressBook';
import SessionList from '../SessionList';
import CreateGroup from './CreateGroup';

const Wrap = styled.div`
  .icon-home_page {
    border: 1px solid #eaeaea;
    padding: 3px;
    border-radius: 50%;
  }
`;

const SessionListDrawer = props => {
  const { toolbarConfig, setToolbarConfig, embed = false } = props;
  const { sessionListFixing } = toolbarConfig;
  const [searchValue, setSearchValue] = useState(null);
  const hideChat = md.global.SysSettings.forbidSuites.includes('6');

  return (
    <Wrap className={cx('flexColumn h100 w100 WhiteBG pLeft10 pRight10', embed ? 'pTop4' : 'pTop10')}>
      <div className="header flexRow alignItemsCenter justifyContentBetween">
        {embed ? (
          <BgIconButton
            tooltip={_l('首页')}
            icon="home_page"
            iconClassName="Font20 Gray_75"
            onClick={() => {
              location.href = '/dashboard';
            }}
          />
        ) : (
          <BgIconButton
            icon="set_top"
            tooltip={sessionListFixing ? _l('取消固定') : _l('固定')}
            iconClassName="Font20"
            iconStyle={sessionListFixing ? { color: '#515151' } : { color: '#cccccc' }}
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
            className="Font19 pointer Gray_75 mRight10"
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
                className="Font19 pointer Gray_75 mRight10"
                onClick={() => {
                  window.open('/windowChat');
                }}
              />
              <BgIconButton
                icon="close"
                className="Font22 pointer Gray_75"
                onClick={() => {
                  setToolbarConfig({ sessionListVisible: false });
                  localStorage.removeItem('toolBarOpenType');
                }}
              />
            </Fragment>
          )}
        </div>
      </div>
      <div className="content flexColumn mTop10 flex Font14 Relative minHeight0">
        {embed && (
          <Fragment>
            <div className="Gray bold Font28 pLeft12 pRight12 mBottom5" style={{ lineHeight: 1 }}>
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
              iconClassName="Font19 pointer Gray_75"
              tooltip={`${_l('通讯录')} (E)`}
              onClick={() => props.setShowAddressBook(true)}
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
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig', 'setShowAddressBook']), dispatch),
)(SessionListDrawer);
