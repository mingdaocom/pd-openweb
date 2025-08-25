import React from 'react';
import store from 'redux/configureStore';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { LoadDiv } from 'ming-ui';
import GroupController from 'src/api/group';
import UserController from 'src/api/user';
import UserBaseProfile from 'src/components/UserInfoComponents/UserBaseProfile.jsx';
import { maskValue } from 'src/pages/Admin/security/account/utils';
import * as actions from 'src/pages/chat/redux/actions';
import { browserIsMobile } from 'src/utils/common';
import placements from './placements';
import './css/userCard.less';

const USER_STATUS = {
  DEFAULT: 0, // 辅助
  NORMAL: 1, // 正常
  LOGOFF: 2, // 注销
  INACTIVE: 3, // 未激活
  REMOVED: 4, // 已删除
};

const CardContentBoxWrap = styled.div`
  position: relative;
  box-shadow:
    0 9px 12px -6px rgba(0, 0, 0, 0.2),
    0 19px 29px 2px rgba(0, 0, 0, 0.14),
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
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const BusinessCardWrap = styled.div`
  .cardHeader {
    align-items: center;
  }
  .imgLink {
    .avatar {
      width: 44px;
      height: 44px;
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

  .cardContentTag {
    display: inline-block;
    padding: 0 5px;
    color: #757575;
    width: unset;
    height: 19px;
    line-height: 19px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .cardContent-wrapper {
    position: relative;
  }

  .overflow_ellipsis_line2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

const DisplayFieldForNameInfo = {
  51: 'currentDepartmentName',
  52: 'currentDepartmentFullName',
  53: 'currentJobTitleName',
  54: 'currentJobNumber',
  55: 'mobilePhone',
  56: 'mobilePhone',
  57: 'email',
  58: 'email',
  59: 'currentWorkPhone',
  60: 'currentWorkSiteName',
};

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
      visible: props.visible,
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

    if (isMobile || disabled || !id || isPublic || !md.global.Account.accountId) return;

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

    if (!isPortal) return null;

    return infos.map(item => (
      <div
        className="itemInfo flexRow LineHeight30"
        key={`userCard-contentItem-${this.props.sourceId || ''}-${item.value}`}
      >
        <div className="Gray_75 mRight8">{item.key}</div>
        <div className="flex ellipsis mRight5">{item.value}</div>
      </div>
    ));
  }

  getUserLink = () => {
    const { sourceId = '', type } = this.props;
    const { data } = this.state;
    const isPortal = _.includes(sourceId, '#');

    return data.status === USER_STATUS.INACTIVE ||
      md.global.Account.isPortal ||
      isPortal ||
      type !== 1 ||
      !data.isContact
      ? 'javascript:void(0);'
      : '/user_' + data.accountId;
  };

  openChat = () => {
    const { type } = this.props;
    const { data } = this.state;
    const isModal = document.querySelector('.mdModal.workSheetRecordInfo');

    if (type === 1) {
      if (isModal) {
        window.open(`/windowChat?id=${data.accountId}&type=${type}`);
      } else {
        store.dispatch(actions.addUserSession(data.accountId));
      }
    } else if (type === 2) {
      if (isModal) {
        window.open(`/windowChat?id=${data.groupId}&type=${type}`);
      } else {
        store.dispatch(actions.addGroupSession(data.groupId));
      }
    }

    this.setState({ visible: false });
  };

  renderContent() {
    const { type, sourceId = '', accountId, groupId, chatButton, projectId } = this.props;
    const { data, isSourceValid } = this.state;
    const isPortal = _.includes(sourceId, '#');
    const url = this.getUserLink();
    const isSecret = !sourceId && !accountId && !groupId;
    const noInfo = md.global.Account.accountId.includes('#') && !isPortal;
    const notContact = type === 1 && !data.isContact;
    const isOutsourcing = type === 1 && !noInfo && projectId && !data.currentProjectName && !isPortal; // 外协

    if (!isSourceValid) {
      if (![1, 2].includes(type)) return null;
      const text = type === 1 ? _l('用户') : data && data.isPost === false ? _l('聊天') : _l('群组');
      return <div className="Gray_c pLeft15 pBottom15">{_l('未找到此%0', text)}</div>;
    } else {
      if (isSecret) {
        return (
          <BusinessCardWrap className="cardHeader BusinessCard flexRow">
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
      const portalValues = (data.portalValues || []).filter(l => l.value);
      const flag =
        isPortal || data.status === USER_STATUS.INACTIVE || type !== 1 || md.global.Account.isPortal || notContact;
      const hideChat = md.global.SysSettings.forbidSuites.includes('6');

      return (
        <BusinessCardWrap>
          <div className="cardHeader flexRow mBottom10">
            <a href={url} className="imgLink" target="_blank" onClick={e => flag && e.preventDefault()}>
              <img src={data.avatar} className="circle avatar" />
            </a>
            <div className="flex mLeft12">
              <a
                className={cx('name ellipsis bold', {
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
                {data.status === USER_STATUS.LOGOFF && <span className="mLeft3">{_l('账号已注销')}</span>}
              </a>
              {!isOutsourcing && data.displayFieldForName && data[DisplayFieldForNameInfo[data.displayFieldForName]] ? (
                <div className="Gray_75">
                  {_.includes([56, 58], data.displayFieldForName)
                    ? maskValue(
                        data[DisplayFieldForNameInfo[data.displayFieldForName]],
                        DisplayFieldForNameInfo[data.displayFieldForName],
                      )
                    : data[DisplayFieldForNameInfo[data.displayFieldForName]]}
                </div>
              ) : (!projectId && !isPortal) || isOutsourcing ? (
                <div className="Gray_75">{data.companyName}</div>
              ) : (
                ''
              )}
            </div>

            <div className="Font20">
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
                chatButton &&
                !notContact &&
                !hideChat && (
                  <span className="Hand mLeft10" data-tip={_l('发消息')} onClick={this.openChat}>
                    <span className="actionButton icon-chat-session ThemeColor3" />
                  </span>
                )}
            </div>
          </div>
          {isOutsourcing && <div className="cardContentTag">{_l('外协')}</div>}
          <div className="cardContent-wrapper">
            <div className="cardContentDesc userCard">
              <UserBaseProfile
                className="noBorder pBottom0 mLeft2"
                infoWrapClassName="flexColumn"
                isCard={true}
                projects={[]}
                currentUserProject={data.project || { projectId }}
                userInfo={data}
                updateUserInfo={data => this.setState({ data })}
              />
              {this.renderInfo(portalValues)}
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

    if (isMobile || disabled || isPublic || !md.global.Account.accountId) return this.props.children;

    return (
      <Trigger key={wrapKey} {...props}>
        {this.props.children}
      </Trigger>
    );
  }
}

export default UserCard;
