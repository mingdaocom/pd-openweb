import React, { Component } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import account from 'src/api/account';
import externalPortalAjax from 'src/api/externalPortal';
import login from 'src/api/login';
import { getAppId } from 'src/pages/AuthService/portalAccount/util.js';
import 'src/pages/PageHeader/AppNameHeader/index.less';
import 'src/pages/PageHeader/AppPkgHeader/index.less';
import LanguageList from 'src/pages/PageHeader/components/LanguageList';
import { browserIsMobile } from 'src/utils/common';
import { removePssId } from 'src/utils/pssId';
import PortalMessage from './PortalMessage';
import PortalUserInfoDrawer from './PortalUserInfoDrawer';
import { WrapHeader } from './style';
import './index.less';

export default class PortalUserSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: '',
      data: null,
      icon: '',
      name: '',
      iconColor: '',
      showUserInfo: false,
      currentData: [],
      avatar: md.global.Account.avatar,
      appSectionId: '',
      isAppItemOverflow: false,
      disabledPointer: 'left',
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      approved: false, //允许外部用户允许查看审批流转详情
      url: '',
      baseInfo: {},
      hasPassword: false,
      showBind: false,
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    const appId = this.props.appId || getAppId(this.props.match.params);

    if (!appId) {
      return;
    }

    Promise.all([
      externalPortalAjax.getLoginUrl({ appId }),
      externalPortalAjax.getPortalSetByAppId({ appId }),
      externalPortalAjax.getDetail({ exAccountId: md.global.Account.accountId, appId }),
    ]).then(([loginUrlRes, baseInfo, detailRes = {}]) => {
      const info = this.formatDetailRes(detailRes);
      this.setState(
        {
          url: loginUrlRes,
          baseInfo,
          ...info,
        },
        () => {
          md.global.Account.avatar = info.avatar;
        },
      );
    });
  };

  formatDetailRes = res => {
    const avatarData = res.receiveControls.find(o => o.controlId === 'portal_avatar') || {};
    return {
      currentData: res.receiveControls,
      avatar: avatarData.value || md.global.Account.avatar,
      hasPassword: res.hasPassword,
      showBind: res.doubleBinding,
    };
  };

  updatePortalDetail = (appId, data) => {
    externalPortalAjax
      .getDetail({
        exAccountId: md.global.Account.accountId,
        appId,
      })
      .then(res => {
        const info = this.formatDetailRes(res);
        this.setState({ ...info, ...data }, () => {
          md.global.Account.avatar = info.avatar;
        });
      });
  };

  logout = isManualExit => {
    window.currentLeave = true;
    login.loginOut().then(data => {
      if (data) {
        let { worksheetId } = this.props;
        // 清除不走缓存
        window.clearLocalDataTime({
          requestData: { worksheetId: worksheetId },
          clearSpecificKeys: ['Worksheet_GetWorksheetInfo', 'Worksheet_GetWorksheetBaseInfo'],
        });
        removePssId();
        //删除自动登录的key
        const appId = this.props.appId || getAppId(this.props.match.params);
        window.localStorage.removeItem(`PortalLoginInfo-${appId}`);
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        location.href = `${window.subPath || ''}/login?ReturnUrl=${encodeURIComponent(this.state.url)}${isManualExit ? '&ref=logout' : ''}`; // 跳转到登录
      }
    });
  };
  getUserInfo() {
    return account.getAccountListInfo({});
  }

  render() {
    const { iconColor = 'var(--color-primary)', showUserInfo, currentData, baseInfo, showBind } = this.state;
    const { isMobile, noAvatar, currentPcNaviStyle, appId, projectId, originalLang } = this.props;
    const color = this.props.iconColor || iconColor;
    const isM = browserIsMobile();
    return (
      <WrapHeader className={cx({ isMobile, leftNaviStyle: [1, 3].includes(currentPcNaviStyle) })}>
        <div className={cx('appNameHeaderBoxPortal appNameHeaderBox flexRow noBorder', { isMobile })}>
          <React.Fragment>
            {isMobile && <div className="flex appName Font16 Hand appNameM">{this.props.name}</div>}
            <PortalMessage color={color} isMobile={isMobile} />
            {!isM && (
              <LanguageList
                placement={[1, 3].includes(currentPcNaviStyle) ? 'topLeft' : 'bottomRight'}
                app={{
                  id: appId,
                  projectId,
                  originalLang,
                }}
                isCharge={false}
              >
                <Tooltip placement="bottom" title={_l('应用语言')}>
                  <div
                    className={cx(
                      'h100 flexColumn justifyContentCenter',
                      [1, 3].includes(currentPcNaviStyle) ? 'mLeft20 mRight20' : 'mRight20',
                    )}
                  >
                    <Icon icon="language" className="Font20 textWhite pointer" />
                  </div>
                </Tooltip>
              </LanguageList>
            )}
            {!noAvatar && (
              <div
                className={cx('InlineBlock mRight16 Hand', { avatarM: isMobile })}
                ref={avatar => {
                  this.avatar = avatar;
                }}
                onClick={() =>
                  this.setState({
                    showUserInfo: true,
                  })
                }
              >
                <img
                  src={(this.state.avatar || '').split('imageView2')[0]}
                  style={{ width: isMobile ? 32 : 30, height: isMobile ? 32 : 30, borderRadius: '50%' }}
                />
              </div>
            )}
          </React.Fragment>
        </div>
        <PortalUserInfoDrawer
          visible={showUserInfo}
          onClose={() => this.setState({ showUserInfo: false })}
          isMobile={isMobile}
          currentPcNaviStyle={currentPcNaviStyle}
          appId={appId}
          currentData={currentData}
          avatar={this.state.avatar}
          hasPassword={this.state.hasPassword}
          baseInfo={baseInfo}
          url={this.state.url}
          onLogout={this.logout}
          onAvatarUpdate={avatar => this.setState({ avatar }, () => (md.global.Account.avatar = avatar))}
          onDetailUpdate={data => this.setState({ currentData: data })}
          updatePortalDetail={this.updatePortalDetail}
          showBind={showBind}
          onBindComplete={() => {
            this.setState({ showBind: false });
            this.updatePortalDetail(this.props.appId || getAppId(this.props.match.params), { showBind: false });
          }}
        />
      </WrapHeader>
    );
  }
}
