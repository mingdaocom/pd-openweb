import React, { Fragment } from 'react';
import { Checkbox, Select } from 'antd';
import cx from 'classnames';
import { Dialog, Icon, LoadDiv, Tooltip } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import account from 'src/api/account';
import accountController from 'src/api/account';
import accountGuideController from 'src/api/accountGuide';
import accountSetting from 'src/api/accountSetting';
import workwxImg from 'src/pages/Admin/integration/platformIntegration/images/workwx.png';
import microsoftImg from 'src/pages/NewPrivateDeployment/images/microsoft.png';
import { encrypt } from 'src/utils/common';
import common from '../common';
import { initBindAcoount } from '../components/InitBindAccountDialog';
import { validateFunc } from '../components/ValidateInfo';
import googleImg from '../images/google.png';
import EditPassword from './EditPassword';
import './index.less';

let accountList = [
  { key: 'weiXinBind', icon: 'wechat', color: 'weiBindColor', label: _l('微信') },
  { key: 'qqBind', icon: 'qq', color: 'qqBindColor', label: _l('QQ') },
  {
    key: 'workBind',
    iconIsImage: true,
    color: 'workBindColor',
    label: _l('企业微信'),
    needHide: true,
  },
  {
    key: 'googleBind',
    iconIsImage: true,
    color: 'googleBindColor',
    label: _l('谷歌'),
  },
  {
    key: 'microsoftBind',
    iconIsImage: true,
    color: 'microsoftBindColor',
    label: _l('微软'),
  },
];

const tipsConfig = {
  mobilePhone: _l(
    '绑定手机号作为你的登录账号。同时也是管理个人账户和使用系统服务的重要依据。为便于您以后的操作及账户安全，请您尽快绑定。',
  ),
  isTwoauthentication: _l('两步验证是在输入账号密码后，额外增加一道安全屏障（手机短信或邮箱验证码），保障您的账号安全'),
};

const ERROR_MESSAGE = {
  0: _l('解绑失败'),
  5: _l('解绑失败，账号不存在'),
  6: _l('解绑失败，密码错误'),
  7: _l('解绑失败，邮箱和手机，请至少保留其一'),
};

const TPType = {
  weiXinBind: 1,
  qqBind: 2,
  googleBind: 13,
  microsoftBind: 14,
};

const WORKBINDOPTION = state => {
  switch (state) {
    case 1:
      return { icon: 'invite-ding', label: _l('钉钉'), iconIsImage: false };
    case 2:
    case 3:
      return { icon: 'enterprise_wechat', label: _l('企业微信'), iconIsImage: false };
    case 4:
      return { icon: 'welink', label: _l('Welink'), iconIsImage: false };
    case 5:
    case 6:
      return { icon: 'feishu', label: _l('飞书'), iconIsImage: false };
  }
};
export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      mobilePhone: '',
      qqBind: { isBind: false },
      weiXinBind: { isBind: false },
      workBind: { isBind: false },
      loading: false,
      joinFriendMode: 1,
      isVerify: false,
      isPrivateMobile: false,
      isPrivateEmail: false,
      needInit: false, //是否需要初始化
      showWarn: true,
      isTwoauthentication: false,
      wxQRCodeLoading: true,
      editPasswordVisible: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    Promise.all([this.getAccount(), this.getInfo()]).then(([account, info]) => {
      this.setState({
        isNullCredential: account.isNullCredential, // 未设置过密码
        email: account.email,
        isVerify: account.isVerify,
        mobilePhone: account.mobilePhone,
        isHavePrj: account.isHavePrj,
        qqBind: account.qqBind,
        weiXinBind: account.weiXinBind,
        workBind: account.workBind,
        googleBind: account.googleBind,
        microsoftBind: account.microsoftBind,
        needInit: account.isIntergration && !account.mobilePhone,
        joinFriendMode: info.joinFriendMode,
        isPrivateMobile: info.isPrivateMobile,
        isPrivateEmail: info.isPrivateEmail,
        isTwoauthentication: info.isTwoauthentication,
        loading: false,
      });
    });
  };

  getAccount() {
    return account.getAccountInfo({});
  }

  getInfo() {
    return accountSetting.getAccountSettings({});
  }

  //微信或qq绑定
  handleBind(type) {
    const currentType = this.state[type] || {};
    if (!currentType.state) {
      if (type === 'weiXinBind') {
        var url = md.global.Config.WebUrl + 'orgsso/weixin/auth';
        var wWidth = 400;
        var wHeight = 400;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      } else if (type === 'googleBind') {
        var url = md.global.Config.WebUrl + 'orgsso/google/auth';
        var wWidth = 750;
        var wHeight = 500;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      } else if (type === 'microsoftBind') {
        var url = md.global.Config.WebUrl + 'orgsso/microsoft/auth';
        var wWidth = 750;
        var wHeight = 500;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      } else {
        var url = md.global.Config.WebUrl + 'orgsso/qq/auth';
        var wWidth = 750;
        var wHeight = 500;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      }
    } else {
      const text =
        type === 'googleBind'
          ? _l('谷歌')
          : type === 'weiXinBind'
            ? _l('微信')
            : type === 'microsoftBind'
              ? _l('微软')
              : 'QQ';
      Dialog.confirm({
        title: _l('解绑%0', text),
        description: _l('确认解绑%0，解绑之后不能通过%1登录？', text, text),
        onOk: () => this.cancelBindAccount(currentType.state, type),
      });
    }
  }

  //微信或qq解绑
  cancelBindAccount(state, type) {
    account
      .unBindAccount({
        state: state,
        tpType: TPType[type],
      })
      .then(data => {
        if (data) {
          this.setState({
            [type]: { isBind: false },
          });
        } else {
          alert(_l('取消绑定失败'), 2);
        }
      })
      .catch();
  }

  showNewWindow(url, width, height, left, top) {
    window.open(
      url,
      'newWindow',
      'width=' +
        width +
        ',height=' +
        height +
        ',left=' +
        left +
        ',top=' +
        top +
        ',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no, status=no',
    );
  }

  getWindowPosition(width, height) {
    return {
      top: ($(window).height() - height) / 2,
      left: ($(window).width() - width) / 2,
    };
  }

  // 绑定账号（邮箱和手机）
  handleBindAccount(type) {
    validateFunc({
      title: type === 'email' ? _l('绑定邮箱') : _l('绑定手机号码'),
      type,
      des: '',
      showStep: true,
      callback: function () {
        location.reload();
      },
    });
  }

  // 解绑账号（邮箱和手机）
  handleUnBindAccount(type) {
    const { email, mobilePhone, isVerify } = this.state;
    if (!(mobilePhone && email && isVerify)) {
      alert(_l('无法解绑，邮箱和手机，请至少保留其一'), 2);
      return;
    }
    validateFunc({
      title: type === 'email' ? _l('解绑邮箱') : _l('解绑手机号'),
      type,
      callback: ({ password }) => {
        accountController[type === 'email' ? 'unbindEmail' : 'unbindMobile']({
          password: encrypt(password),
        }).then(data => {
          if (data === 1) {
            location.reload();
          } else {
            alert(ERROR_MESSAGE[data], 2);
          }
        });
      },
    });
  }

  // 修改账号
  handleChangeAccount(type) {
    validateFunc({
      title: type === 'email' ? _l('修改邮箱') : _l('修改手机号码'),
      type,
      showStep: true,
      callback: function () {
        location.reload();
      },
    });
  }

  // common修改
  sureSettings(settingNum, value, successCallback) {
    accountSetting
      .editAccountSetting({
        settingType: common.settingOptions[settingNum],
        settingValue: value,
      })
      .then(data => {
        if (data) {
          alert(_l('设置成功'));
          if (_.isFunction(successCallback)) {
            successCallback();
          }
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch();
  }

  // 隐私设置
  joinFriend = () => {
    return (
      <Fragment>
        <div className="LineHeight36 accountJoinFrirndBox">
          <span className="InlineBlock accountLabel Gray_75">{_l('添加我为好友的认证方式')}</span>
          <Select
            value={this.state.joinFriendMode}
            onChange={joinFriendMode =>
              this.sureSettings('joinFriendMode', joinFriendMode, () => {
                this.setState({ joinFriendMode });
              })
            }
          >
            <Select.Option value={0}>{_l('允许任何人')}</Select.Option>
            <Select.Option value={1}>{_l('需要身份验证')}</Select.Option>
            <Select.Option value={2}>{_l('不允许任何人')}</Select.Option>
          </Select>
        </div>
        <div className="mTop16 flexRow">
          <span className="InlineBlock accountLabel Gray_75">{_l('手机和邮箱')}</span>
          <span className="flexColumn">
            <Checkbox
              className="Gray"
              checked={this.state.isPrivateMobile}
              onChange={e => {
                const isPrivateMobile = e.target.checked;
                this.sureSettings('isPrivateMobile', isPrivateMobile, () => {
                  this.setState({ isPrivateMobile });
                });
              }}
            >
              {_l('手机号仅自己可见')}
            </Checkbox>
            <Checkbox
              className="Gray"
              checked={this.state.isPrivateEmail}
              onChange={e => {
                const isPrivateEmail = e.target.checked;
                this.sureSettings('isPrivateEmail', isPrivateEmail, () => {
                  this.setState({ isPrivateEmail });
                });
              }}
            >
              {_l('邮箱仅自己可见')}
            </Checkbox>
          </span>
        </div>
      </Fragment>
    );
  };

  // 取消绑定手机或邮箱红点提示
  handleCancelRed(type) {
    accountGuideController
      .setAccountGuide({
        userGuideSetting: common.guideType[type],
      })
      .then(() => {
        window.location.reload();
      });
  }

  //验证邮箱
  handleReviewEmail() {
    var throttled = _.throttle(
      function (res) {
        if (res.ret === 0) {
          account
            .sendProjectBindEmail({
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.global.getCaptchaType(),
            })
            .then(function (data) {
              if (data) {
                alert(_l('发送成功'));
              } else {
                alert(_l('发送失败'), 2);
              }
            });
        }
      },
      10000,
      { leading: true },
    );

    new captcha(throttled);
  }

  //提示框
  renderWarning() {
    const { needInit, showWarn } = this.state;
    return (
      <div className={cx('initPasswordWarning', { Hidden: !(needInit && showWarn) })}>
        <span className="warnColor">
          <span className="icon-error1 Font16 mRight8 TxtMiddle" />
          <span>{_l('建议您绑定手机号，绑定后可以直接在官网和 App 登录')}</span>
        </span>
        <span className="icon-clear Font16 ThemeHoverColor3 Hand" onClick={() => this.setState({ showWarn: false })} />
      </div>
    );
  }

  renderTips = key => {
    return (
      <Tooltip popupPlacement="top" text={<span>{tipsConfig[key]}</span>}>
        <span className="icon-novice-circle Gray_bd Hand mLeft5 Font15" />
      </Tooltip>
    );
  };

  renderRedDot = (isShow, key) => {
    return (
      <span
        className={cx('Right Gray_9e Hover_49 Hand redDot', { Hidden: !isShow })}
        onClick={() => this.handleCancelRed(key)}
      >
        {_l('取消红点提示')}
      </span>
    );
  };

  // 注销
  dealLoagout = () => {
    account.validateLogoffAccount().then(res => {
      if (res === 1) {
        location.href = '/cancellation';
      } else if (res === 20) {
        alert(_l('您是平台唯一管理员，无法注销'), 2);
      } else if (res === 30) {
        alert(_l('您尚有未退出的组织，请先至 个人中心-我的组织 退出所有组织，方可注销'), 2);
      }
    });
  };

  render() {
    const {
      email,
      mobilePhone,
      loading,
      isVerify,
      needInit,
      workBind = {},
      editPasswordVisible,
      isNullCredential,
    } = this.state;
    const mobilePhoneWarnLight = md.global.Account.guideSettings.accountMobilePhone && !mobilePhone;
    const emailWarnLight = md.global.Account.guideSettings.accountEmail && (!email || !isVerify);

    if (workBind.isBind) {
      const workBindDetail = WORKBINDOPTION(Number(workBind.state)) || {};
      accountList = accountList.map(item => (item.key === 'workBind' ? { ...item, ...workBindDetail } : item));
    }

    if (loading) {
      return <LoadDiv className="mTop40" />;
    }
    return (
      <div className="accountChartContainer">
        <div className="Font17 Bold Gray mBottom6">{_l('账户')}</div>
        {this.renderWarning()}
        <div className="accountRowItem clearfix">
          <div className="accountLabel Gray_75">
            {_l('手机')}
            {!mobilePhone && this.renderTips('mobilePhone')}
          </div>
          <span>
            <span className="Gray Relative">
              {mobilePhone || _l('未绑定')}
              {mobilePhoneWarnLight && <span className="warnLight warnLightMEPosition warnLightPhone" />}
            </span>
            {md.global.SysSettings.enableEditAccountInfo && (
              <Fragment>
                {mobilePhone ? (
                  <Fragment>
                    <span
                      className="Hand ThemeColor3 Hover_49 mLeft24 mRight24"
                      onClick={() => this.handleChangeAccount('mobile')}
                    >
                      {_l('修改')}
                    </span>
                    <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleUnBindAccount('mobile')}>
                      {_l('解绑')}
                    </span>
                  </Fragment>
                ) : (
                  <span
                    className="Hand ThemeColor3 Hover_49 mLeft24"
                    onClick={() => {
                      if (needInit) {
                        initBindAcoount({
                          title: _l('绑定手机号'),
                          showFooter: false,
                          getData: this.getData,
                        });
                      } else {
                        this.handleBindAccount('mobile');
                      }
                    }}
                  >
                    {_l('绑定')}
                  </span>
                )}
              </Fragment>
            )}
          </span>
          {this.renderRedDot(mobilePhoneWarnLight, 'accountMobilePhone')}
        </div>
        {needInit && isNullCredential ? null : (
          <Fragment>
            <div className="accountRowItem clearfix">
              <div className="accountLabel Gray_75">{_l('邮箱')}</div>
              <span>
                <span className="Gray Relative">
                  {email ? (
                    <span>
                      <span className={cx(isVerify ? '' : 'Gray_9e mRight12')}>{email}</span>
                      {!isVerify && md.global.SysSettings.enableEditAccountInfo && <span>{_l('未验证')}</span>}
                    </span>
                  ) : md.global.SysSettings.enableEditAccountInfo ? (
                    _l('未绑定')
                  ) : (
                    ''
                  )}
                  {emailWarnLight ? <span className="warnLight warnLightMEPosition warnLightEmail" /> : null}
                </span>
                {md.global.SysSettings.enableEditAccountInfo && (
                  <Fragment>
                    {email ? (
                      <Fragment>
                        <span
                          className="Hand ThemeColor3 Hover_49 mLeft24 mRight24"
                          onClick={() => this.handleChangeAccount('email')}
                        >
                          {_l('修改')}
                        </span>
                        {isVerify ? (
                          <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleUnBindAccount('email')}>
                            {_l('解绑')}
                          </span>
                        ) : (
                          <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleReviewEmail()}>
                            {_l('验证')}
                          </span>
                        )}
                      </Fragment>
                    ) : (
                      <span
                        className="Hand ThemeColor3 Hover_49 mLeft24"
                        onClick={() => this.handleBindAccount('email')}
                      >
                        {_l('绑定')}
                      </span>
                    )}
                  </Fragment>
                )}
              </span>
              {this.renderRedDot(emailWarnLight, 'accountEmail')}
            </div>
            <div className="accountRowItem">
              <div className="accountLabel Gray_75">{_l('密码')}</div>
              <span className="Hand ThemeColor3 Hover_49" onClick={() => this.setState({ editPasswordVisible: true })}>
                {isNullCredential ? _l('设置') : _l('修改')}
              </span>
            </div>
          </Fragment>
        )}

        {md.global.Config.IsPlatformLocal && (
          <div className="accountRowItem">
            <div className="accountLabel Gray_75">{_l('账户注销')}</div>
            <div className="logout Hand" onClick={this.dealLoagout}>
              {_l('注销')}
            </div>
          </div>
        )}

        {
          <Fragment>
            <div className="Font17 Bold Gray mBottom4 mTop20">{_l('第三方账户')}</div>
            <div className="Gray_75 mBottom20">{_l('绑定后，可通过第三方应用快速登录')}</div>
            <div className="bindingWrap mBottom24">
              {accountList.map(({ key, label, color, icon, needHide = false, iconIsImage = false }, index) => {
                const data = this.state[key] || {};

                if (needHide && !data.isBind) return null;

                return (
                  <span className="bingingItem" key={`bingingItem-${key}`}>
                    {iconIsImage ? (
                      <img
                        src={key === 'googleBind' ? googleImg : key === 'microsoftBind' ? microsoftImg : workwxImg}
                        className={cx('mRight8 iconImg', { googleImg: ['microsoftBind', 'googleBind'].includes(key) })}
                      />
                    ) : (
                      <Icon icon={icon} className={cx(color, 'Font18 mRight8')} />
                    )}
                    {data.isBind && key === 'workBind' && <span>{_l('账号ID：')}</span>}
                    <Tooltip text={data.nickName || ''} disable={!data.isBind}>
                      <span className="text overflow_ellipsis flex">
                        {data.isBind ? data.nickName || label : label}
                      </span>
                    </Tooltip>
                    {!needHide && (
                      <span
                        className={cx(data.isBind ? 'Gray_6 Hover_red' : 'ThemeColor3 Hover_49', 'Hand')}
                        onClick={() => this.handleBind(key)}
                      >
                        {data.isBind ? _l('解绑') : _l('绑定')}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="splitLine"></div>
          </Fragment>
        }
        <div className="Font17 Bold Gray mBottom16 mTop20">{_l('隐私')}</div>
        {this.joinFriend()}
        <Dialog
          title={isNullCredential ? _l('设置密码') : _l('修改密码')}
          showFooter={false}
          visible={editPasswordVisible}
          onCancel={() => this.setState({ editPasswordVisible: false })}
          className="editPasswordDialogId"
        >
          <EditPassword
            isNullCredential={isNullCredential}
            closeDialog={() => this.setState({ editPasswordVisible: false })}
          />
        </Dialog>
      </div>
    );
  }
}
