import React, { Component } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Dialog, Icon, Menu } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import account from 'src/api/account';
import accountSetting from 'src/api/accountSetting';
import externalPortalAjax from 'src/api/externalPortal';
import login from 'src/api/login';
import langConfig from 'src/common/langConfig';
import { getAppId } from 'src/pages/AuthService/portalAccount/util.js';
import 'src/pages/PageHeader/AppNameHeader/index.less';
import 'src/pages/PageHeader/AppPkgHeader/index.less';
import LanguageList from 'src/pages/PageHeader/components/LanguageList';
import AvatorInfo from 'src/pages/Personal/personalInfo/modules/AvatorInfo.jsx';
import 'src/pages/Personal/personalInfo/modules/index.less';
import UserInfoDialog from 'src/pages/Role/PortalCon/components/UserInfoDialog';
import { formatDataForPortalControl, renderText } from 'src/pages/Role/PortalCon/tabCon/util';
import { browserIsMobile } from 'src/utils/common';
import { removePssId } from 'src/utils/pssId';
import BindContactDialog from './BindContactDialog';
import ChangeAccountDialog from './ChangeAccountDialog';
import DelDialog from './DelDialog';
import FindPwdDialog from './FindPwdDialog';
import PortalMessage from './PortalMessage';
import { ModalWrap, RedMenuItemWrap, Wrap, WrapHeader } from './style';
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
      showUserInfoDialog: false,
      currentData: [],
      avatar: md.global.Account.avatar,
      appSectionId: '',
      isAppItemOverflow: false,
      disabledPointer: 'left',
      showTelDialog: false,
      showDelDialog: false,
      allowExAccountDiscuss: false, //允许外部用户讨论
      exAccountDiscussEnum: 0, //外部用户的讨论类型 0：所有讨论 1：不可见内部讨论
      approved: false, //允许外部用户允许查看审批流转详情
      url: '',
      baseInfo: {},
      type: '',
      showChangePwd: false,
      hasPassword: false,
      showMenu: false,
      showModel: false,
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
          clearSpecificKey: 'Worksheet_GetWorksheetInfo',
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
  //编辑详细资料
  handleUploadImg = () => {
    const { currentData, avatar = '' } = this.state;

    Dialog.confirm({
      dialogClasses: 'uploadAvatorDialogId',
      width: browserIsMobile() ? '335px' : '460px',
      title: _l('上传头像'),
      noFooter: true,
      children: (
        <AvatorInfo
          editAvatar={res => {
            ///更新数据 /////
            externalPortalAjax
              .saveUserDetail({
                appId: this.props.appId || getAppId(this.props.match.params),
                exAccountId: md.global.Account.accountId,
                newCell: currentData
                  .filter(o => ['avatar'].includes(o.alias))
                  .map(o => {
                    return { ...o, value: res.fileName };
                  }),
              })
              .then(res => {
                this.setState({ avatar: res.data.portal_avatar }, () => {
                  md.global.Account.avatar = res.data.portal_avatar;
                  $('.uploadAvatorDialogId').parent().remove();
                });
              });
          }}
          avatar={avatar.split('imageView2')[0]}
          closeDialog={() => {
            $('.uploadAvatorDialogId').parent().remove();
          }}
        />
      ),
    });
  };

  //头像和徽章
  getUserInfo() {
    return account.getAccountListInfo({});
  }

  render() {
    const {
      name,
      iconColor = '#1677ff',
      showUserInfo,
      showUserInfoDialog,
      currentData,
      showTelDialog,
      showDelDialog,
      baseInfo,
      type,
      showChangePwd,
      showMenu,
      showModel,
      showBind,
    } = this.state;
    const { isMobile, noAvatar, currentPcNaviStyle, appId, projectId, originalLang } = this.props;
    const info = currentData.filter(
      o =>
        !['name', 'mobilephone', 'avatar', 'firstLoginTime', 'roleid', 'status', 'openid', 'portal_email'].includes(
          o.alias,
        ),
    );
    const color = this.props.iconColor || iconColor;
    const account =
      (currentData.find(o => [type !== 'email' ? 'portal_mobile' : 'portal_email'].includes(o.controlId)) || {})
        .value ||
      (currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ||
      (currentData.find(o => ['portal_email'].includes(o.controlId)) || {}).value;
    const isM = browserIsMobile();
    return (
      <WrapHeader className={cx({ isMobile, leftNaviStyle: [1, 3].includes(currentPcNaviStyle) })}>
        <div className={cx('appNameHeaderBoxPortal appNameHeaderBox flexRow noBorder', { isMobile })}>
          <React.Fragment>
            <div className="headerCenter">
              <div
                className={cx('appName Font16 Hand', { appNameM: isMobile })}
                style={{ color: isMobile ? '#151515' : '#fff' }}
              >
                {this.props.name || name}
              </div>
            </div>
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
                    <Icon icon="language" className="Font20 White pointer" />
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
        <Drawer
          width={isMobile ? '100%' : 480}
          className={[1, 3].includes(currentPcNaviStyle) ? '' : 'Absolute'}
          onClose={() => this.setState({ showUserInfo: false })}
          placement="right"
          visible={showUserInfo}
          maskClosable={true}
          closable={false}
          getContainer={![1, 3].includes(currentPcNaviStyle)}
          mask={true}
          bodyStyle={{ padding: 0 }}
        >
          <Wrap className={cx('flexColumn h100', { isMobile, leftNaviStyle: [1, 3].includes(currentPcNaviStyle) })}>
            {isMobile && (
              <React.Fragment>
                <span
                  className="Font17 Hand InlineBlock back pLeft16"
                  onClick={() => {
                    this.setState({ showUserInfo: false });
                  }}
                >
                  <Icon icon="backspace mRight8 Gray_9e" />
                  {_l('我的账户')}
                </span>
              </React.Fragment>
            )}
            <div className="infoConBox flex">
              <div className="account flexRow">
                <div className="userImage" onClick={this.handleUploadImg}>
                  <img
                    className="avatarImg"
                    src={(this.state.avatar || '').split('imageView2')[0]}
                    style={{ width: 56, height: 56, borderRadius: '50%' }}
                  />
                  <div className="hoverAvatar">
                    <span className="Font20 icon-upload_pictures"></span>
                  </div>
                </div>
                <span className="userName flex mLeft20 Font17">
                  {(currentData.find(o => o.alias === 'name') || {}).value}
                </span>
              </div>
              <div className={cx('email mTop32')}>
                <span className="title Gray_9e Block w100">{_l('手机号')}</span>
                <span className="telNumber mTop10 Block">
                  {(currentData.find(o => o.alias === 'mobilephone') || {}).value}
                  <span
                    className={cx('edit ThemeColor3 Hand InlineBlock', {
                      mLeft10: (currentData.find(o => o.alias === 'mobilephone') || {}).value,
                    })}
                    onClick={() => {
                      this.setState({
                        showTelDialog: true,
                        type: 'phone',
                      });
                    }}
                  >
                    {(currentData.find(o => o.alias === 'mobilephone') || {}).value ? _l('修改') : _l('绑定')}
                  </span>
                </span>
              </div>
              <div className={cx('tel mTop24')}>
                <span className="title Gray_9e Block w100">{_l('邮箱')}</span>
                <span className="telNumber mTop10 Block">
                  {(currentData.find(o => o.controlId === 'portal_email') || {}).value}
                  <span
                    className={cx('edit ThemeColor3 Hand InlineBlock', {
                      mLeft10: (currentData.find(o => o.controlId === 'portal_email') || {}).value,
                    })}
                    onClick={() => {
                      this.setState({
                        showTelDialog: true,
                        type: 'email',
                      });
                    }}
                  >
                    {(currentData.find(o => o.controlId === 'portal_email') || {}).value ? _l('修改') : _l('绑定')}
                  </span>
                </span>
              </div>
              <div className={cx('tel mTop24')}>
                <span className="title Gray_9e Block w100">{_l('密码')}</span>
                <span
                  className={cx('telNumber Block mTop10', {
                    Gray_bd: !this.state.hasPassword,
                  })}
                >
                  {this.state.hasPassword ? _l('已设置') : _l('未设置')}
                  <span
                    className="edit ThemeColor3 Hand mLeft10 InlineBlock"
                    onClick={() => {
                      this.setState({
                        showChangePwd: true,
                      });
                    }}
                  >
                    {_l('修改')}
                  </span>
                </span>
              </div>
              <div className={cx('tel alignItemsCenter mTop24')}>
                <span className="title Gray_9e Block w100">{_l('语言设置')}</span>
                <div className="languagueSetting flexRow mTop10">
                  {langConfig.map(item => {
                    return (
                      <div
                        className={cx('languagueItem flex Hand', {
                          active: (getCookie('i18n_langtag') || md.global.Config.DefaultLang) === item.key,
                        })}
                        onClick={() => {
                          accountSetting
                            .editAccountSetting({
                              settingType: '6',
                              settingValue: getCurrentLangCode(item.key).toString(),
                            })
                            .then(res => {
                              if (res) {
                                setCookie('i18n_langtag', item.key);
                                window.location.reload();
                              } else {
                                alert(_l('设置失败，请稍后再试'), 2);
                              }
                            });
                        }}
                      >
                        {item.value}
                      </div>
                    );
                  })}
                </div>
              </div>

              <h6 className={cx('Font16', { mTop32: !isMobile, mTop24: isMobile })}>{_l('我的信息')}</h6>
              <div className="infoBox">
                {info
                  .filter(o => o.fieldPermission[2] !== '1') //不收集的信息，用户个人信息不显示
                  .sort((a, b) => {
                    return a.row - b.row;
                  })
                  .map(o => {
                    return (
                      <div className="tel flexRow mTop10">
                        <span className="title InlineBlock Gray_9e WordBreak">{o.controlName}</span>
                        <span className={cx('flex mLeft24 rInfo', { isOption: [9, 10, 11].includes(o.type) })}>
                          {renderText({ ...o })}
                        </span>
                      </div>
                    );
                  })}
                <span
                  className="edit ThemeColor3 Hand mTop12 InlineBlock"
                  onClick={() => {
                    this.setState({
                      showUserInfoDialog: true,
                    });
                  }}
                >
                  {_l('修改')}
                </span>
              </div>
            </div>
            <div className="logoutBox">
              <div
                className="logout Hand Font14 Bold"
                onClick={() => {
                  this.logout(true);
                }}
              >
                <Icon icon="exit_to_app" className="mRight5 Font18" />
                {_l('退出登录')}
              </div>
              {browserIsMobile() ? (
                <div
                  className="opt Hand TxtCenter"
                  onClick={() => {
                    this.setState({
                      showModel: true,
                    });
                  }}
                >
                  <Icon icon="more_horiz" className="Font18" />
                </div>
              ) : (
                <Trigger
                  action={['click']}
                  popupVisible={showMenu}
                  onPopupVisibleChange={visible => {
                    this.setState({
                      showMenu: visible,
                    });
                  }}
                  popup={
                    <Menu>
                      <RedMenuItemWrap
                        className="RedMenuItem"
                        onClick={() => {
                          this.setState({
                            showDelDialog: true,
                            showMenu: false,
                          });
                        }}
                      >
                        <span>{_l('注销此账户')}</span>
                      </RedMenuItemWrap>
                    </Menu>
                  }
                  popupClassName={cx('dropdownTrigger')}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    overflow: {
                      adjustX: true,
                      adjustY: true,
                    },
                  }}
                >
                  <div
                    className="opt Hand TxtCenter"
                    onClick={() => {
                      this.setState({
                        showMenu: true,
                      });
                    }}
                  >
                    <Icon icon="more_horiz" className="Font18" />
                  </div>
                </Trigger>
              )}
            </div>
          </Wrap>
        </Drawer>
        {showModel && (
          <ModalWrap
            visible={showModel}
            className="appMoreActionWrap mobileModal minFull topRadius"
            onClose={() => {
              this.setState({
                showModel: false,
              });
            }}
          >
            <div className="flexRow header">
              <div className="Font13 Gray_9e flex">{_l('更多')}</div>
              <div
                className="closeIcon"
                onClick={() => {
                  this.setState({
                    showModel: false,
                  });
                }}
              >
                <Icon icon="close" className="Font17 Gray_9e bold" />
              </div>
            </div>
            <div className="actionContent">
              <div
                className="RedMenuItem"
                onClick={() => {
                  this.setState({
                    showModel: false,
                    showDelDialog: true,
                  });
                }}
              >
                <span>{_l('注销此账户')}</span>
              </div>
            </div>
          </ModalWrap>
        )}
        {showUserInfoDialog && (
          <UserInfoDialog
            appId={this.props.appId || getAppId(this.props.match.params)}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showUserInfoDialog}
            currentData={currentData
              .filter(
                o =>
                  !['avatar', 'firstLoginTime', 'portal_logintime', 'roleid', 'status'].includes(o.alias) &&
                  o.fieldPermission[2] !== '1', //不收集的信息，用户个人信息不显示
              )
              .map(o => {
                if (['portal_mobile', 'portal_email'].includes(o.controlId)) {
                  return { ...o, disabled: true };
                } else {
                  return o;
                }
              })}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showUserInfoDialog: false })}
            onOk={(data, ids) => {
              ///更新数据 /////
              externalPortalAjax
                .saveUserDetail({
                  appId: this.props.appId || getAppId(this.props.match.params),
                  exAccountId: md.global.Account.accountId,
                  newCell: formatDataForPortalControl(data.filter(o => ids.includes(o.controlId))),
                })
                .then(() => {
                  this.setState({ showUserInfoDialog: false, currentData: data });
                  ids.includes('portal_name') && location.reload();
                });
            }}
          />
        )}
        {showTelDialog && (
          //更换手机号|邮箱
          <ChangeAccountDialog
            type={type}
            baseInfo={baseInfo}
            isBind={
              (!(currentData.find(o => o.controlId === 'portal_email') || {}).value && type === 'email') ||
              (!(currentData.find(o => o.controlId === 'portal_mobile') || {}).value && type === 'phone')
            }
            appId={this.props.appId || getAppId(this.props.match.params)}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showTelDialog}
            account={account}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showTelDialog: false, type: '' })}
            onOk={() => {
              //绑定
              if (
                (!(currentData.find(o => o.controlId === 'portal_email') || {}).value && type === 'email') ||
                (!(currentData.find(o => o.controlId === 'portal_mobile') || {}).value && type === 'phone')
              ) {
                this.setState({ showTelDialog: false, type: '' }, () => {
                  this.updatePortalDetail(this.props.appId || getAppId(this.props.match.params));
                });
              } else {
                // 修改
                this.logout();
              }
            }}
          />
        )}
        {showChangePwd && (
          //更换密码
          <FindPwdDialog
            type={type}
            baseInfo={baseInfo}
            appId={this.props.appId || getAppId(this.props.match.params)}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showChangePwd}
            account={account}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showChangePwd: false })}
            onOk={() => {
              this.logout();
            }}
          />
        )}
        {showDelDialog && (
          //注销
          <DelDialog
            url={this.state.url}
            type={!(currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ? 'email' : 'phone'}
            appId={this.props.appId || getAppId(this.props.match.params)}
            classNames={browserIsMobile() ? 'forMobilePortal' : ''}
            show={showDelDialog}
            account={account}
            exAccountId={md.global.Account.accountId}
            setShow={() => this.setState({ showDelDialog: false })}
            onOk={() => {
              this.logout();
            }}
          />
        )}
        {showBind && (
          <BindContactDialog
            type={(currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ? 'email' : 'phone'}
            appId={this.props.appId || getAppId(this.props.match.params)}
            onOk={() => {
              this.setState({ showBind: false });
              this.updatePortalDetail(this.props.appId || getAppId(this.props.match.params), { showBind: false });
            }}
          />
        )}
      </WrapHeader>
    );
  }
}
