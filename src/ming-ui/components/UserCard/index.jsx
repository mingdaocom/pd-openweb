import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import UserController from 'src/api/user';
import GroupController from 'src/api/group';
import placements from './placements';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import { LoadDiv } from 'ming-ui';
import './css/userCard.less';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentProjectId } from 'src/pages/globalSearch/utils';

const USER_STATUS = {
  DEFAULT: 0, // 辅助
  NORMAL: 1, // 正常
  LOGOFF: 2, // 注销
  INACTIVE: 3, // 未激活
  REMOVED: 4, // 已删除
};

const CardContentBoxWrap = styled.div`
  position: relative;
  box-shadow: 0 9px 12px -6px rgba(0, 0, 0, 0.2), 0 19px 29px 2px rgba(0, 0, 0, 0.14),
    0 7px 36px 6px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: #fff;

  .arrowBoxUserCard {
    position: absolute;
    display: inline-block;
    width: 16px;
    height: 10px;
  }
  .arrowBoxUserCard.arrowTop {
    top: -8px;
  }
  .arrowBoxUserCard .arrow {
    border: 8px transparent solid;
    display: inline-block;
    vertical-align: top;
  }

  .cardContent {
    padding: 16px 16px 16px 16px;
    > .TxtCenter {
      margin: 0 !important;
      padding: 0 0 10px;
    }
  }

  .cardContent-wrapper {
    flex: 1;
    min-width: 0;
  }
`;

const BusinessCardWrap = styled.div`
  display: flex;
  flex-direction: row;
  .imgLink {
    padding-right: 15px;
    .avatar {
      width: 47px;
      height: 47px;
    }
    &:hover {
      text-decoration: none;
    }
  }
  .name {
    color: #000;
    font-weight: bold;
    font-size: 15px;
    width: 170px;
    display: inline-block;
    vertical-align: top;
    margin-top: 3px;
    &:hover {
      text-decoration: none;
    }
  }

  .smallEarth {
    color: rgba(0, 0, 0, 0.32) !important;
  }

  .cardContentDesc {
    color: #aaa;
    padding: 7px 0 0 0;
    word-wrap: break-word;
    word-break: break-all;
    .cardContentTag {
      display: inline-block;
      min-width: 36px;
      padding: 0 4px;
      height: 19px;
      line-height: 19px;
      text-align: center;
      background: #f0f0f0;
      border-radius: 4px;
      color: #757575;
    }
  }

  .cardContentDesc.userCard {
    min-height: 35px;
  }

  .cardContentDesc .contentItem {
    width: 100%;
    color: #757575;
    display: block;
    margin-top: 4px;
    .label {
      max-width: 88px;
      display: inline-block;
      vertical-align: bottom;
    }
  }

  .cardContent-wrapper {
    position: relative;
  }

  .actionButtons {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 10px;
    align-items: center;
    .actionButton {
      display: inline-block;
      cursor: pointer;
      color: #0091ea;
      font-size: 20px;

      vertical-align: top;
      text-decoration: none;
      &:hover {
        color: #0084e6;
      }
    }
  }

  .overflow_ellipsis_line2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

class UserCard extends React.Component {
  static propTypes = {
    projectId: PropTypes.string,
    appId: PropTypes.string,
    sourceId: PropTypes.string,
    type: PropTypes.number,
    disabled: PropTypes.bool,
    chatButton: PropTypes.bool, // 是否显示发消息按钮
  };
  static defaultProps = {
    type: 1, // 1 人员 2 群组 3 通用`小秘书` 4 `任务 文件夹 群组 小秘书`
    chatButton: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isSourceValid: true,
      visible: props.visible || false,
      data: {},
      appId: props.appId,
      isMobile: browserIsMobile(),
      wrapKey: uuidv4(),
      preSourceId: props.sourceId,
    };
  }

  componentDidMount() {
    if (this.state.visible) {
      this.fetchData();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { data, preSourceId } = this.state;

    if (
      (!this.state.visible && nextState.visible && _.isEmpty(data)) ||
      (nextProps.sourceId &&
        preSourceId &&
        nextProps.sourceId !== preSourceId &&
        !this.state.visible &&
        nextState.visible)
    ) {
      this.fetchData();
    }

    if (nextProps.disabled !== this.props.disabled) {
      this.setState({ visible: false });
    }
  }

  formatData = function (result) {
    const { type, sourceId = '', accountId, groupId } = this.props;
    const id = (type === 1 ? accountId : groupId) || sourceId;

    const status = type === 1 ? result.accountStatus : null;

    return {
      ...result,
      detail_closed: result.accountStatus == 2,
      sameProjectIds: result.sameProjectIds || [],
      status,
      groupName: type === 2 ? result.name : null,
      [type === 1 ? 'accountId' : 'groupId']: result[type === 1 ? 'accountId' : 'groupId'] || id,
    };
  };

  fetchData(refresh = false) {
    const { sourceId = '', disabled, accountId, groupId, type, projectId } = this.props;
    const { isMobile } = this.state;
    const id = (type === 1 ? accountId : groupId) || sourceId;
    const isPublic = location.pathname.startsWith('/public/') || location.pathname.startsWith('/app/lib/');

    if (isMobile || disabled || !id || isPublic) return;

    this.setState({
      isLoading: true,
      isSourceValid: true,
      preSourceId: sourceId,
    });

    this.promise =
      type === 1
        ? UserController.getAccountBaseInfo({
            accountId: id,
            appId: sourceId.includes('#') ? this.state.appId : undefined,
            refresh: refresh,
            onProjectId: sourceId.includes('#') ? undefined : projectId,
          })
        : GroupController.getGroupCardInfo({
            groupId: id,
          });

    this.promise.then(result => {
      if (result) {
        this.setState({
          isLoading: false,
          data: {
            ...this.props.data,
            ...this.formatData(result),
          },
        });
      } else {
        this.setState({ isSourceValid: false });
      }
    });
  }

  getPopupNode() {
    const { operation, sourceId, accountId, groupId } = this.props;
    const { isLoading, visible, data } = this.state;
    this.haveOpened = this.haveOpened || visible;

    if (!this.haveOpened) return <div />;
    const isSecret = !sourceId && !accountId && !groupId;

    return (
      <CardContentBoxWrap className="cardContentBox" onClick={e => e.stopPropagation()}>
        <div className="cardContent">
          {isLoading || (_.isEmpty(data) && !isSecret) ? <LoadDiv /> : this.renderContent()}
        </div>
        {!!operation && <div className="userOperatorCon">{operation}</div>}
        <span className="arrowBoxUserCard">
          <span className="arrow" />
        </span>
      </CardContentBoxWrap>
    );
  }

  renderInfo(infos) {
    const isPortal = (this.props.sourceId || '').includes('#');

    return infos.map(item => (
      <span
        className="overflow_ellipsis_line2 contentItem"
        key={`userCard-contentItem-${this.props.sourceId || ''}-${item.value}`}
      >
        {isPortal ? (
          <Fragment>
            <span className="label overflow_ellipsis">{item.key}</span>：{item.value}
          </Fragment>
        ) : (
          item.value
        )}
      </span>
    ));
  }

  getUserLink = () => {
    const { sourceId = '', type } = this.props;
    const { data } = this.state;
    const isPortal = _.includes(sourceId, '#');

    return data.status === USER_STATUS.INACTIVE || md.global.Account.isPortal || isPortal || type !== 1
      ? 'javascript:void(0);'
      : '/user_' + data.accountId;
  };

  openChat = () => {
    const { type } = this.props;
    const { data } = this.state;
    this.setState({ visible: false });

    // 用户
    if (type === 1) {
      data.accountId !== md.global.Account.accountId && store.dispatch(actions.addUserSession(data.accountId));
    } else if (type === 2) {
      store.dispatch(actions.addGroupSession(data.groupId));
    }
  };

  renderContent() {
    const { type, sourceId = '', accountId, groupId, chatButton, projectId } = this.props;
    const { data, isSourceValid } = this.state;
    const isPortal = _.includes(sourceId, '#');
    const url = this.getUserLink();
    const isSecret = !sourceId && !accountId && !groupId;
    const noInfo = md.global.Account.accountId.includes('#') && !isPortal;
    const currentProjectId = getCurrentProjectId();

    if (!isSourceValid) {
      if (![1, 2].includes(type)) return null;
      const text = type === 1 ? _l('用户') : data && data.isPost === false ? _l('聊天') : _l('群组');
      return <div className="Gray_c pLeft15 pBottom15">{_l('未找到此%0', text)}</div>;
    } else {
      if (isSecret) {
        return (
          <BusinessCardWrap className="cardHeader BusinessCard">
            <span className="imgLink">
              <img
                src={`${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/littleSecretary.png`}
                className="circle avatar"
              />
            </span>

            <div className="cardContent-wrapper">
              <span className="name overflow_ellipsis TxtCenter">{_l('企业小秘书')}</span>
            </div>
          </BusinessCardWrap>
        );
      }

      const infos = [
        {
          key: _l('组织'),
          value:
            projectId && !data.currentProjectName && !isPortal
              ? data.companyName
              : currentProjectId === projectId
              ? ''
              : data.currentProjectName,
        },
        {
          key: _l('职位'),
          value: `${data.currentDepartmentName || ''}${data.currentDepartmentName && data.profession ? ' | ' : ''}${
            data.profession || ''
          }`,
        },
        { key: '', value: data.currentJobNumber },
        { key: _l('手机'), value: data.mobilePhone },
        { key: _l('邮箱'), value: data.email },
      ].filter(l => l.value);
      const portalValues = (data.portalValues || []).filter(l => l.value);
      const flag = isPortal || data.status === USER_STATUS.INACTIVE || type !== 1 || md.global.Account.isPortal;
      const hideChat = md.global.SysSettings.forbidSuites.includes('6');

      return (
        <BusinessCardWrap className="cardHeader BusinessCard">
          <a href={url} className="imgLink" target="_blank" onClick={e => flag && e.preventDefault()}>
            <img src={data.avatar} className="circle avatar" />
          </a>

          <div className="cardContent-wrapper">
            <a
              className={cx('name overflow_ellipsis', {
                ThemeColor3: flag,
                ThemeHoverColor3: !flag,
              })}
              target="_blank"
              href={url}
              title={type === 2 ? data.groupName : data.fullname}
              onClick={e => flag && e.preventDefault()}
            >
              {type === 2 ? data.groupName : data.fullname}
              {data.status === USER_STATUS.INACTIVE && <span className="icon-folder-public smallEarth mLeft8" />}
              {data.status === USER_STATUS.LOGOFF && <span className="mLeft3">{_l('帐号已注销')}</span>}
            </a>

            <div className="cardContentDesc userCard">
              {type === 1 && !noInfo && (
                <Fragment>
                  {projectId && !data.currentProjectName && !isPortal && (
                    <div className="cardContentTag">{_l('外协')}</div>
                  )}
                  {this.renderInfo(infos)}
                  {this.renderInfo(portalValues)}
                  {type === 1 && !infos.length && !portalValues.length && (
                    <span className="overflow_ellipsis contentItem Gray_c">
                      {isPortal ? _l('没有可见信息') : _l('这个家伙什么也没有留下')}
                    </span>
                  )}
                </Fragment>
              )}

              {type === 2 && data.project && (
                <span>
                  <span class="icon-company Font18 mRight5"></span>
                  {data.project.companyName}
                </span>
              )}
            </div>
            <div className="actionButtons">
              <span
                className="Hand"
                data-tip={_l('刷新')}
                onClick={e => {
                  e.stopPropagation();
                  this.fetchData(true);
                }}
              >
                <span className="actionButton icon-task-later ThemeHoverColor3 Gray_9e" />
              </span>
              {data.status === USER_STATUS.NORMAL &&
                md.global.Account &&
                ![md.global.Account.accountId, 'user-workflow'].includes(data.accountId) &&
                !md.global.Account.isPortal &&
                !isPortal &&
                chatButton && !hideChat && (
                  <span className="Hand" data-tip={_l('发消息')} onClick={this.openChat}>
                    <span className="actionButton icon-chat-session ThemeColor3" />
                  </span>
                )}
            </div>
          </div>
        </BusinessCardWrap>
      );
    }
  }

  render() {
    const { isMobile, visible, wrapKey } = this.state;
    const { className, disabled } = this.props;
    const isPublic = location.pathname.includes('/public/') || location.href.includes('#publicapp');

    const props = {
      popupClassName: cx('userCardSite', className),
      popup: this.getPopupNode(),
      popupVisible: visible,
      action: ['hover'],
      builtinPlacements: placements,
      popupPlacement: 'topLeft',
      destroyPopupOnHide: true,
      getPopupContainer: () => document.body,
      mouseEnterDelay: 0.1,
      mouseLeaveDelay: 0.3,
      onPopupVisibleChange: visible => {
        this.setState({ visible });
        if (!visible) this.setState({ wrapKey: uuidv4() });
        if (!visible && this.props.onClose) {
          this.props.onClose();
        }
      },
      zIndex: 10002,
    };

    if (isMobile || disabled || isPublic) return this.props.children;

    return (
      <Trigger key={wrapKey} {...props}>
        {this.props.children}
      </Trigger>
    );
  }
}

export default UserCard;
