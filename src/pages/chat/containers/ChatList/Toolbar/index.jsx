import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import * as actions from 'src/pages/chat/redux/actions';
import GlobalSearch from 'src/pages/PageHeader/components/GlobalSearch';
import { getAppFeaturesVisible } from 'src/utils/app';
import errorIcon from '../../SessionList/resource/errorIcon.png';
import Avatar from '../Avatar';
import RenderAddressBook from './RenderAddressBook';

const Wrap = styled.div`
  .iconWrap {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    position: relative;
    &:hover {
      background-color: var(--color-background-hover);
    }
    &.active {
      .icon {
        color: var(--color-primary) !important;
      }
      background-color: var(--color-primary-transparent);
    }
  }
  .unread {
    color: var(--color-white);
    position: absolute;
    right: 6px;
    top: -2px;
    border-radius: 16px;
    text-align: center;
    min-width: 18px;
    background-color: var(--color-error);
    z-index: 1;
    font-size: 12px;
    font-weight: bold;
    padding: 3px 4px;
    line-height: 1;
  }
  .errorIcon {
    position: absolute;
    right: -2px;
    bottom: -6px;
    border-radius: 3px;
    transform: scale(0.5);
    background: var(--color-background-card);
  }
`;

const Toolbar = props => {
  const { sessionList, socketState } = props;
  const { toolbarConfig, setToolbarConfig } = props;
  const { ss, ac } = getAppFeaturesVisible();
  const count = sessionList.reduce((count, item) => {
    if (item.count && 'isSilent' in item) {
      return item.isSilent ? count : (count += item.count);
    } else if (item.count && ('isPush' in item ? item.isPush : true)) {
      return (count += item.count);
    } else {
      return count;
    }
  }, 0);
  const { sessionListVisible } = toolbarConfig;
  const { isOpenMingoAI, isOpenSearch, isShowToolName, isOpenMessageList } = toolbarConfig;

  const handleOpenSessionList = () => {
    if (sessionListVisible) {
      setToolbarConfig({
        sessionListVisible: false,
      });
      localStorage.removeItem('toolBarOpenType');
    } else {
      setToolbarConfig({
        mingoVisible: false,
        sessionListVisible: true,
        favoriteVisible: false,
        userDrawerVisible: false,
        settingDrawerVisible: false,
      });
      localStorage.setItem('toolBarOpenType', 'sessionList');
    }
  };

  const handleOpenGlobalSearch = () => {
    const match = location.pathname.match(/\/app\/([A-Za-z0-9-]{36})(?=\/|$)/);
    GlobalSearch({
      match: {
        params: {
          appId: match ? match[1] : null,
        },
      },
      onClose: () => {},
    });
  };

  return (
    <Wrap>
      <div className="flexColumn toolbarWrap mBottom4">
        {ac && <Avatar setToolbarConfig={setToolbarConfig} />}
        <div
          className={cx(
            'sessionList flexColumn alignItemsCenter justifyContentCenter pointer mTop8 mBottom8 Relative',
            { mTop10: !isOpenMingoAI },
          )}
          onClick={handleOpenSessionList}
        >
          <Tooltip
            title={socketState === 2 ? _l('连接已断开') : isShowToolName ? '' : `${_l('消息')}`}
            shortcut={socketState === 2 ? undefined : 'w'}
            placement="left"
            mouseLeaveDelay={0.1}
          >
            <div className={cx('iconWrap', { active: sessionListVisible })}>
              <Icon className="Font22 textSecondary" icon={sessionListVisible ? 'chat-full' : 'chat-line'} />
              {socketState === 2 && !sessionListVisible && <img src={errorIcon} className="errorIcon" />}
            </div>
          </Tooltip>
          {isShowToolName && <div className="Font12 textSecondary">{_l('消息')}</div>}
          {!!count && !isOpenMessageList && <div className="unread">{count > 99 ? 99 : count}</div>}
        </div>
        {ss && isOpenSearch && (
          <div
            className="search flexColumn alignItemsCenter justifyContentCenter pointer mBottom8"
            onClick={handleOpenGlobalSearch}
          >
            <Tooltip
              title={isShowToolName ? '' : `${_l('超级搜索')}`}
              shortcut="F"
              placement="left"
              mouseLeaveDelay={0.1}
            >
              <div className="iconWrap">
                <Icon className="Font22 textSecondary" icon="search" />
              </div>
            </Tooltip>
            {isShowToolName && <div className="Font12 textSecondary">{_l('搜索')}</div>}
          </div>
        )}
        {/*isOpenFavorite && (
          <div
            className="favorite flexColumn alignItemsCenter justifyContentCenter pointer mBottom8"
            onClick={() => {
              setToolbarConfig({ mingoVisible: false, sessionListVisible: false, favoriteVisible: true, userDrawerVisible: false, settingDrawerVisible: false });
              localStorage.setItem('toolBarOpenType', 'favorite');
            }}
          >
            <Tooltip title={isShowToolName ? '' : _l('收藏')} placement="left" mouseLeaveDelay={0.1}>
              <div className={cx('iconWrap', { active: favoriteVisible })}>
                <Icon className="Font22 textSecondary" icon={favoriteVisible ? 'fav-full' : 'fav-line'} />
              </div>
            </Tooltip>
            {isShowToolName && <div className="Font12 textSecondary">{_l('收藏')}</div>}
          </div>
        )*/}
      </div>
      <RenderAddressBook />
    </Wrap>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
    sessionList: state.chat.sessionList,
    socketState: state.chat.socketState,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Toolbar);
