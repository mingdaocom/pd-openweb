import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Button, Dialog, Icon, LoadDiv, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import accountController from 'src/api/account';
import accountSetting from 'src/api/accountSetting';
import actionLogAjax from 'src/api/actionLog';
import wxController from 'src/api/weixin';
import { formatFormulaDate } from 'src/utils/control';
import common from '../common';
import { identityVerificationFunc } from '../components/IdentityVerification';
import StepsVerifyDialog from '../components/stepsVerifyDialog/index';
import './index.less';

export default class SecuritySetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTwoauthentication: false,
      openWXRemindDialog: false,
      allowSingleDeviceUse: false,
      openWeixinLogin: false,
      serviceListApp: [],
      serviceListWeb: [],
      serviceListOther: [],
      loading: false,
    };
  }
  componentDidMount() {
    this.getData();
  }
  getData() {
    this.setState({ loading: true });
    Promise.all([
      accountController.getAccountInfo({}),
      accountSetting.getAccountSettings({}),
      actionLogAjax.getAccountDevices({}),
    ]).then(([data1, data2, data3]) => {
      const { app = [], web = [], other = [] } = _.get(data3, 'data') || {};

      let serviceListApp = app.filter(v => !v.current);
      let serviceListWeb = web.filter(v => !v.current);
      let serviceListOther = other.filter(v => !v.current);
      !_.isEmpty(app.find(it => it.current)) && serviceListApp.unshift(app.find(it => it.current));
      !_.isEmpty(web.find(it => it.current)) && serviceListWeb.unshift(web.find(it => it.current));
      !_.isEmpty(other.find(it => it.current)) && serviceListOther.unshift(other.find(it => it.current));
      this.setState({
        mobilePhone: data1.mobilePhone,
        email: data1.email,
        isVerify: data1.isVerify,
        openWeixinLogin: data2.openWeixinLogin,
        isTwoauthentication: data2.isTwoauthentication,
        allowSingleDeviceUse: !data2.allowMultipleDevicesUse,
        isHasWeixin: data2.isHasWeixin,
        twoAuthenticationMobilePhoneEnabled: data2.twoAuthenticationMobilePhoneEnabled,
        twoAuthenticationEmailEnabled: data2.twoAuthenticationEmailEnabled,
        twoAuthenticationTotpEnabled: data2.twoAuthenticationTotpEnabled,
        serviceListApp,
        serviceListWeb,
        serviceListOther,
        loading: false,
      });
    });
  }

  getAccountSettings = () => {
    accountSetting.getAccountSettings({}).then(res => {
      this.setState({
        isTwoauthentication: res.isTwoauthentication,
        twoAuthenticationMobilePhoneEnabled: res.twoAuthenticationMobilePhoneEnabled,
        twoAuthenticationEmailEnabled: res.twoAuthenticationEmailEnabled,
        twoAuthenticationTotpEnabled: res.twoAuthenticationTotpEnabled,
      });
    });
  };

  sureSettings(settingNum, value, successCallback) {
    accountSetting
      .editAccountSetting({
        settingType: common.settingOptions[settingNum],
        settingValue: value,
      })
      .then(data => {
        if (data) {
          if (settingNum === 'isTwoauthentication') {
            if (value === 0) {
              alert(_l('已关闭两步验证'));
            }
          } else {
            alert(_l('设置成功'));
          }

          if (_.isFunction(successCallback)) {
            successCallback();
          }
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch();
  }

  openVerify = checked => {
    identityVerificationFunc({
      verificationSuccess: () => {
        if (!checked) {
          this.setState({ visible: true });
          return;
        }
        this.sureSettings('isTwoauthentication', 0, () => {
          this.setState({
            isTwoauthentication: !checked,
            twoAuthenticationEmailEnabled: false,
            twoAuthenticationMobilePhoneEnabled: false,
            twoAuthenticationTotpEnabled: false,
          });
        });
      },
    });
  };

  openopenWeixinLogin = openWeixinLogin => {
    if (!this.state.isHasWeixin) {
      wxController
        .getWeiXinServiceNumberQRCode()
        .then(res => {
          this.setState({ openWXRemindDialog: true, wxQRCode: res, wxQRCodeLoading: false });
        })
        .catch(() => {
          this.setState({ openWXRemindDialog: true });
        });
    } else {
      this.sureSettings('openWeixinLogin', !openWeixinLogin ? 1 : 0, () => {
        // 开启微信登录提醒
        this.setState({
          openWeixinLogin: !openWeixinLogin,
        });
      });
    }
  };

  checkIsBindWX = () => {
    wxController.checkWeiXinServiceNumberBind().then(res => {
      if (!res) {
        alert(_l('您的账号还未绑定微信，请扫描二维码'), 3);
      } else {
        alert(_l('您的账号已绑定微信，赶快去开启微信登录提醒吧'));
      }
    });
  };

  openWeixinLoginDialog = () => {
    const { wxQRCode, openWXRemindDialog, wxQRCodeLoading } = this.state;
    return (
      <Dialog
        className="loginMessageDialog"
        title={_l('登录通知')}
        visible={openWXRemindDialog}
        footer={null}
        onCancel={() => this.setState({ openWXRemindDialog: false })}
      >
        <div className="weixinImg">
          {wxQRCodeLoading ? <LoadDiv className="mTop40" /> : <img className="w100 h100" src={wxQRCode} />}
        </div>
        <div className="mTop8 mBottom24 Font17">{_l('使用微信扫码绑定账号，开启登录微信提醒')}</div>
        <Button type="primary" onClick={this.checkIsBindWX}>
          {_l('我已经绑定了微信账号')}
        </Button>
      </Dialog>
    );
  };

  // 切换同时登录
  changeAllowMultipleDevicesUse = allowSingleDeviceUse => {
    this.sureSettings('allowMultipleDevicesUse', allowSingleDeviceUse ? 1 : 0, () => {
      this.setState({
        allowSingleDeviceUse: !allowSingleDeviceUse,
      });
    });
  };

  renderEquipmentItem = item => {
    const { current, systemInfo, browserName, date, ip, geoCity, sessionId, platform } = item;
    const { serviceListApp = [], serviceListWeb = [], serviceListOther } = this.state;
    const diff = moment().diff(date, 'm');
    const passTime =
      formatFormulaDate({ value: diff, unit: '1', hideUnitStr: false }) === _l('0分钟')
        ? _l('1分钟')
        : formatFormulaDate({ value: diff, unit: '1', hideUnitStr: false });

    return (
      <div className="equipmentItem textTertiary">
        <div className="flex4">
          <div className="Bold textPrimary">
            {systemInfo}
            {current && <span className="current mLeft10">{_l('当前')}</span>}
          </div>
          <div>{browserName}</div>
        </div>
        <div class="flex2">{current ? _l('现在') : `${_l('%0前使用', passTime)}`}</div>
        <div class="flex3 pLeft24">
          {ip}
          {!!geoCity && `（${geoCity}）`}
        </div>
        {!current ? (
          <Tooltip placement="right" title={_l('退出账号')}>
            <div
              class="iconWrap Hand"
              onClick={() => {
                if (current) return;
                accountController
                  .exitAccount({
                    platform,
                    sessionId,
                  })
                  .then(res => {
                    if (res) {
                      alert(_l('退出成功'));
                      if (platform === 'app') {
                        this.setState({ serviceListApp: serviceListApp.filter(v => v.sessionId !== sessionId) });
                      } else if (platform === 'other') {
                        this.setState({ serviceListOther: serviceListOther.filter(v => v.sessionId !== sessionId) });
                      } else {
                        this.setState({ serviceListWeb: serviceListWeb.filter(v => v.sessionId !== sessionId) });
                      }
                      return;
                    }
                    alert(_l('退出失败'), 2);
                  });
              }}
            >
              <Icon icon="cancel" className="Font15" />
            </div>
          </Tooltip>
        ) : (
          <div className="iconWrap bgWhite" />
        )}
      </div>
    );
  };

  render() {
    const {
      isTwoauthentication,
      openWeixinLogin,
      visible,
      mobilePhone,
      email,
      isVerify,
      openWXRemindDialog,
      allowSingleDeviceUse,
      serviceListApp,
      serviceListWeb,
      serviceListOther,
      loading,
      twoAuthenticationMobilePhoneEnabled,
      twoAuthenticationEmailEnabled,
      twoAuthenticationTotpEnabled,
    } = this.state;

    if (loading) {
      return <LoadDiv />;
    }
    //多设备同时登录开关
    const showMultipleDevicesUse =
      (!window.platformENV.isOverseas && !window.platformENV.isLocal) ||
      md.global?.SysSettings?.multipleDevicesUseSwitchType === 3;

    //两步验证开关
    const showTwoFactorAuthentication =
      (!window.platformENV.isOverseas && !window.platformENV.isLocal) ||
      md.global?.SysSettings?.twoFactorAuthenticationSwitchType === 3;
    // 构建优先级顺序文案：TOTP > 配置的类型 > 其他类型
    const priorityType = md.global?.SysSettings?.twoFactorAuthenticationPriorityType;
    const priorityTypeMap = {
      1: _l('短信'),
      2: _l('邮箱'),
      3: _l('TOTP'),
    };
    let txtMap = [3, 1, 2]; // 默认：TOTP > 短信 > 邮箱
    // 如果配置了类型，则排在第一位
    if (priorityType) {
      txtMap = [priorityType, ..._.without(txtMap, priorityType)];
    }
    const priorityText = txtMap.map(item => priorityTypeMap[item]).join(' > ');
    return (
      <div className="securitySettingContainer textPrimary">
        {((!window.platformENV.isOverseas && !window.platformENV.isLocal) || showTwoFactorAuthentication) && (
          <Fragment>
            <div className="Font17 pBottom20 Bold borderBottom">{_l('安全设置')}</div>
            {showTwoFactorAuthentication && (
              <div className="setRowItem alignStart">
                <div className="label bold Font14">{_l('两步验证 (2FA)')}</div>
                <div className="flex minWidth0">
                  <div className={cx('flexRow pTop0 alignStart', { setRowItem: isTwoauthentication })}>
                    <Switch
                      className="mRight20 mTop3"
                      size="small"
                      checked={isTwoauthentication}
                      onClick={this.openVerify}
                    />
                    <div className="flex minWidth0">
                      <div className="Font13">{_l('开启两步验证')}</div>
                      <div className="textSecondary">{_l('在密码登录时额外验证一次身份，保障账号安全')}</div>
                    </div>
                  </div>
                  {isTwoauthentication && (
                    <div className="pTop20">
                      <div className="Font13 mBottom15">
                        <span className="TxtMiddle">{_l('验证方式')}</span>
                        <Tooltip title={_l('当启用多种验证方式时，首选的验证方式为：') + priorityText}>
                          <Icon icon="help" className="Font16 textTertiary TxtMiddle mLeft3" />
                        </Tooltip>
                      </div>
                      <div className="settingTwoAuthentication">
                        <div className="flex minWidth0">
                          {[
                            {
                              label: _l('短信验证码'),
                              value: 'mobilePhone',
                              checked: 'twoAuthenticationMobilePhoneEnabled',
                            },
                            { label: _l('邮箱验证码'), value: 'email', checked: 'twoAuthenticationEmailEnabled' },
                            {
                              label: _l('身份验证器应用 (TOTP)'),
                              value: 'authenticator',
                              desc: _l('使用手机上的身份验证器应用获得验证码'),
                              checked: 'twoAuthenticationTotpEnabled',
                            },
                          ].map(item => {
                            return (
                              <div className="flexRow LineHeight30">
                                <div className="checkedIcon">
                                  {this.state[item.checked] && <Icon icon="done" className="Font16" />}
                                </div>
                                <div className={cx('flex minWidth0', { textTertiary: !this.state[item.checked] })}>
                                  <span className="mRight15">{item.label}</span>
                                  <span>
                                    {_.includes(['mobilePhone', 'email'], item.value) && !this.state[item.value]
                                      ? _l('未绑定')
                                      : this.state[item.value]}
                                  </span>
                                  <span className="textPrimary mLeft12">
                                    {!isVerify && item.value === 'email' && email && _l('未验证')}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          <span
                            className="settingTwoAuthenticationBtn ThemeColor3 ThemeHoverColor2"
                            onClick={() => {
                              identityVerificationFunc({
                                verificationSuccess: () => {
                                  this.setState({ visible: true });
                                },
                              });
                            }}
                          >
                            {_l('设置')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
              <div className="setRowItem alignStart">
                <div className="label bold">{_l('登录通知')}</div>
                <div className="flex minWidth0 flexRow">
                  <Switch
                    className="mRight20 mTop3"
                    size="small"
                    checked={openWeixinLogin}
                    onClick={this.openopenWeixinLogin}
                  />
                  <div className="flex minWidth0">
                    <div className="Font13">{_l('微信公众号通知')}</div>
                    <div className="textSecondary">{_l('每次登录后，发送微信消息通知')}</div>
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        )}
        <div className="flexRow">
          <div className="label bold pTop20">{_l('登录设备')}</div>
          <div className="flex minWidth0">
            {showMultipleDevicesUse && (
              <div className="setRowItem alignStart">
                <Switch
                  className="mRight20 mTop3"
                  size="small"
                  checked={allowSingleDeviceUse}
                  onClick={this.changeAllowMultipleDevicesUse}
                  style={{ width: 44 }}
                />
                <div className="flex minWidth0">
                  <div className="Font13">{_l('仅允许单设备登录')}</div>
                  <div className="textSecondary">
                    {_l('PC或移动端各只允许同时登录一个设备。账号在新设备登录时，原设备自动下线')}
                  </div>
                </div>
              </div>
            )}
            <div className="equipmentInfo">
              <div>{_l('您当前已在以下设备上登录')}</div>
              <div className="flexColumn flex">
                {!_.isEmpty(serviceListWeb) && <div className="Font14 mTop30 mBottom8 Bold">{_l('网页端')}</div>}
                {!_.isEmpty(serviceListWeb) && (
                  <div className="textTertiary mBottom15">{_l('包括桌面端和移动端浏览器，桌面客户端')}</div>
                )}
                {serviceListWeb.map(item => this.renderEquipmentItem({ ...item, platform: 'web' }))}
                {!_.isEmpty(serviceListApp) && <div className="Font14 mTop30 mBottom15 Bold">{_l('移动客户端')}</div>}
                {serviceListApp.map(item => this.renderEquipmentItem({ ...item, platform: 'app' }))}
                {!_.isEmpty(serviceListOther) && <div className="Font14 mTop30 mBottom15 Bold">{_l('其他')}</div>}
                {serviceListOther.map(item => this.renderEquipmentItem({ ...item, platform: 'other' }))}
              </div>
            </div>
          </div>
        </div>

        {visible && (
          <StepsVerifyDialog
            mobilePhone={mobilePhone}
            email={email}
            isVerify={isVerify}
            visible={visible}
            twoAuthenticationMobilePhoneEnabled={twoAuthenticationMobilePhoneEnabled}
            twoAuthenticationEmailEnabled={twoAuthenticationEmailEnabled}
            twoAuthenticationTotpEnabled={twoAuthenticationTotpEnabled}
            updateTwoAuthentication={data => this.setState(data)}
            onCancel={() => this.setState({ visible: false })}
            getAccountSettings={this.getAccountSettings}
          />
        )}

        {openWXRemindDialog && this.openWeixinLoginDialog()}
      </div>
    );
  }
}
