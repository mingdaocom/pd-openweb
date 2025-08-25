import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, FunctionWrap, Icon } from 'ming-ui';
import account from 'src/api/account';
import { checkCertification } from 'src/components/checkCertification';
import { getMyPermissions, hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getCurrentProjectId } from 'src/pages/globalSearch/utils';
import { getCurrentProject } from 'src/utils/project';
import AddressBookInvite from './AddressBookInvite';
import DetailList from './DetailList';
import { DETAIL_MODE, DETAIL_MODE_TEXT, FROM_TYPE, TAB_MODE, TABS } from './enum';
import MobileOrEmailInvite from './MobileOrEmailInvite';
import PublicLink from './PublicLink';
import './index.less';

class AddFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      selectTab: TABS[0].value,
      isPayUsers: true,
      authType: 0, // 0未认证 1: 个人认证 2: 组织认证
      detailMode: 0, //
      url: '',
      code: '',
      tokens: [],
      myPermissions: [],
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    const { Config: { IsLocal } = {}, Account: { projects = [] } = {} } = md.global;
    const myPermissions = projectId ? getMyPermissions(projectId) : [];
    const hasMemberManageAuth = hasPermission(myPermissions, PERMISSION_ENUM.MEMBER_MANAGE);
    const licenseType = getCurrentProject(projectId).licenseType;

    this.setState(
      {
        isPayUsers: projects.some(item => item.licenseType === 1) || IsLocal,
        myPermissions,
        selectTab: [0, 2].includes(licenseType) ? TABS[2].value : hasMemberManageAuth ? TABS[0].value : TABS[1].value,
      },
      () => {
        // 非付费用户获取认证信息
        if (!this.state.isPayUsers) {
          account.getAccountListInfo({}).then(res => {
            this.setState({ authType: _.get(res, 'accountInfo.authType') || 0 });
          });
        }
      },
    );
  }

  get showCertification() {
    const { fromType } = this.props;
    const { isPayUsers, authType } = this.state;
    // 非付费用户
    if (!isPayUsers) {
      // 个人邀请、群组邀请
      if (fromType === FROM_TYPE.PERSONAL || fromType === FROM_TYPE.GROUPS) {
        return authType === 0;
      }
    }
    return false;
  }

  setDetailMode = value => {
    this.setState({ detailMode: value });
  };

  setInfo = obj => {
    this.setState({ ...obj });
  };

  // 关闭弹层
  onCancel = () => {
    this.setState({ visible: false });
  };

  renderHeader = () => {
    const { fromType, fromText, projectId } = this.props;
    let content = '';

    if (fromType === FROM_TYPE.PERSONAL) {
      content = (
        <div className="headerText ellipsis">
          <span className="Gray_75">{_l('邀请用户为')}</span>
          <span className="mLeft3 mRight3">{_l('个人好友')}</span>
          <span className="Gray_75">({_l('非同事')})</span>
        </div>
      );
    } else {
      content = (
        <div className="headerText ellipsis w100 TxtCenter">
          <span className="Gray_75">{_l('邀请用户加入')}</span>
          <span className="mLeft3">
            {fromText ||
              _.get(
                _.find(md.global.Account.projects, i => i.projectId === projectId),
                'companyName',
              )}
          </span>
        </div>
      );
    }

    return (
      <div className="addFriendsHeader">
        <Icon icon="airplane" />
        {content}
      </div>
    );
  };

  renderTabs = () => {
    const { selectTab, myPermissions = [] } = this.state;
    const { fromType, projectId } = this.props;
    const isPersonal = fromType === FROM_TYPE.PERSONAL;
    const hasMemberManageAuth = hasPermission(myPermissions, PERMISSION_ENUM.MEMBER_MANAGE);

    return (
      <ul className="AddFriends-head-navbar">
        {TABS.map(tab => {
          if (tab.value === TAB_MODE.PUBLIC_LINK && !hasMemberManageAuth) {
            return null;
          }
          if ((isPersonal || fromType === FROM_TYPE.GROUPS) && tab.value === TAB_MODE.ADDRESS_BOOK) {
            return null;
          }
          return (
            <li
              key={tab.value}
              onClick={() => {
                if (tab.value === selectTab) return;

                checkCertification({ projectId, checkSuccess: () => this.setState({ selectTab: tab.value }) });
              }}
              className={cx('AddFriends-head-navbar__item', {
                'AddFriends-head-navbar__item--active': selectTab === tab.value,
              })}
            >
              {isPersonal ? tab.subText : tab.text}
            </li>
          );
        })}
      </ul>
    );
  };

  renderContent = () => {
    const { selectTab, url, code, tokens, myPermissions = [] } = this.state;
    const showInviteRules = hasPermission(myPermissions, PERMISSION_ENUM.SECURITY);
    const options = {
      onCancel: this.onCancel,
      projectId: this.props.projectId,
      fromType: this.props.fromType,
      needAlert: this.showCertification,
      setDetailMode: this.setDetailMode,
      showInviteRules,
    };
    if (selectTab === TAB_MODE.PUBLIC_LINK) {
      return <PublicLink {...options} {...{ url, code, tokens, setInfo: this.setInfo }} />;
    } else if (selectTab === TAB_MODE.MOBILE_EMAIL) {
      return <MobileOrEmailInvite {...options} />;
    } else {
      return <AddressBookInvite {...options} />;
    }
  };

  render() {
    const { onClose, projectId } = this.props;
    const { detailMode } = this.state;

    return (
      <Dialog
        className="dialogAddFriendsBox"
        width={640}
        visible={this.state.visible}
        title={null}
        footer={null}
        onCancel={onClose}
      >
        <div className="dialogAddFriendsContainer">
          {this.renderHeader()}
          {this.showCertification && (
            <div class="safeWarning">
              {_l(
                '近期有不法分子利用平台进行诈骗活动。为了保护平台安全，此功能需要完成身份认证后才能使用。对您使用造成的不便，深表歉意！',
              )}
              <span
                className="ThemeColor ThemeHoverColor2 pointer"
                onClick={() =>
                  (location.href = `/certification/project/${projectId || getCurrentProjectId()}?returnUrl=${encodeURIComponent(location.href)}`)
                }
              >
                {_l('前往认证')}
              </span>
            </div>
          )}
          {this.renderTabs()}
          {this.renderContent()}
        </div>

        <Dialog
          width={640}
          visible={detailMode}
          title={
            <div className="inviteBackIcon">
              <div className="iconBox" onClick={() => this.setDetailMode(DETAIL_MODE.NORMAL)}>
                <Icon icon="backspace" />
              </div>
              {DETAIL_MODE_TEXT[detailMode]}
            </div>
          }
          footer={null}
          onCancel={() => this.setDetailMode(DETAIL_MODE.NORMAL)}
        >
          <div className="dialogAddFriendsContainer pTop0" style={{ height: 510 }}>
            <DetailList detailMode={detailMode} {...this.props} />
          </div>
        </Dialog>
      </Dialog>
    );
  }
}

class SelectProject extends Component {
  constructor(props) {
    super(props);
  }

  defaultProps = {
    friendVisible: true,
  };

  onSelect(projectId) {
    FunctionWrap(AddFriends, { ...this.props, onClose: () => {}, fromType: projectId ? 4 : 0, projectId });
  }

  render() {
    const { friendVisible, onClose } = this.props;

    return (
      <Dialog className="inviteDialog" width={420} visible title={_l('邀请到')} footer={null} onCancel={onClose}>
        <div className="inviteList">
          <ul className="projectList">
            {md.global.Account.projects.concat(friendVisible ? { projectId: '' } : []).map((item, index) => {
              const type = (index % 5) + 2;

              return (
                <Fragment key={index}>
                  {!item.projectId && friendVisible && <li className="splitLine" />}

                  <li className="projectItem flexRow pointer" onClick={() => this.onSelect(item.projectId)}>
                    {item.projectId ? (
                      <Fragment>
                        <span className={cx('Font18', 'icon-chatnetwork-type' + type)}></span>
                        <span className="flex pLeft12 ellipsis">{item.companyName}</span>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <span className="icon-account_circle Font18 ThemeColor3"></span>
                        <span className="flex pLeft12 ellipsis">
                          {_l('个人好友')}
                          <span className="Font12">{_l('(非同事)')}</span>
                        </span>
                      </Fragment>
                    )}

                    <span className="icon-arrow-right-border"></span>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </div>
      </Dialog>
    );
  }
}

export default function (options) {
  if (options.selectProject && md.global.Account.projects.length) {
    FunctionWrap(SelectProject, Object.assign({ friendVisible: true }, options));
  } else {
    FunctionWrap(AddFriends, Object.assign({ projectId: '', fromType: 0 }, options));
  }
}
