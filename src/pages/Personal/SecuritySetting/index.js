import React, { Fragment, Component } from 'react';
import { Tooltip, Dialog, Button, Switch, Icon, LoadDiv } from 'ming-ui';
import accountController from 'src/api/account';
import actionLogAjax from 'src/api/actionLog';
import accountSetting from 'src/api/accountSetting';
import wxController from 'src/api/weixin';
import { validateFunc } from '../components/ValidateInfo';
import StepsVerifyDialog from '../components/stepsVerifyDialog/index';
import { formatFormulaDate } from 'src/pages/worksheet/util.js';
import common from '../common';
import moment from 'moment';
import './index.less';
import _ from 'lodash';

const tipsConfig = {
  mobilePhone: _l(
    '绑定手机号作为你的登录账号。同时也是管理个人账户和使用系统服务的重要依据。为便于您以后的操作及账户安全，请您尽快绑定。',
  ),
  isTwoauthentication: _l('两步验证是在输入账号密码后，额外增加一道安全屏障（手机短信或邮箱验证码），保障您的帐号安全'),
  openWeixinLogin: _l('开启后，登录系统会收到微信通知'),
};

export default class SecuritySetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTwoauthentication: false,
      openWXRemindDialog: false,
      allowMultipleDevicesUse: false,
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
      const { app = [], web = [], other = [] } = _.get(data3, 'data');

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
        allowMultipleDevicesUse: data2.allowMultipleDevicesUse,
        isHasWeixin: data2.isHasWeixin,
        serviceListApp,
        serviceListWeb,
        serviceListOther,
        loading: false,
      });
    });
  }

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
  renderTips = key => {
    return (
      <Tooltip popupPlacement="top" text={<span>{tipsConfig[key]}</span>}>
        <span className="icon-novice-circle Gray_bd Hand mLeft5 Font15" />
      </Tooltip>
    );
  };

  openVerify = checked => {
    if (checked) {
      validateFunc({
        title: _l('关闭两步验证'),
        callback: () =>
          this.sureSettings('isTwoauthentication', 0, () => {
            this.setState({ isTwoauthentication: false });
          }),
      });
      return;
    }
    this.setState({ visible: true });
  };

  openopenWeixinLogin = openWeixinLogin => {
    if (!this.state.isHasWeixin) {
      wxController
        .getWeiXinServiceNumberQRCode()
        .then(res => {
          this.setState({ openWXRemindDialog: true, wxQRCode: res, wxQRCodeLoading: false });
        })
        .catch(err => {
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
        alert(_l('您的帐号还未绑定微信，请扫描二维码'), 3);
      } else {
        alert(_l('您的帐号已绑定微信，赶快去开启微信登录提醒吧'));
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
  changeAllowMultipleDevicesUse = allowMultipleDevicesUse => {
    this.sureSettings('allowMultipleDevicesUse', !allowMultipleDevicesUse ? 1 : 0, () => {
      this.setState({
        allowMultipleDevicesUse: !allowMultipleDevicesUse,
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
      <div className="equipmentItem Gray_9e">
        <div className="flex4">
          <div className="Bold Gray">
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
          <Tooltip popupPlacement="right" text={<span>{_l('退出账号')} </span>}>
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
              <Icon icon="closeelement-bg-circle" className="Font15" />
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
      allowMultipleDevicesUse,
      serviceListApp,
      serviceListWeb,
      serviceListOther,
      loading,
    } = this.state;

    if (loading) {
      return <LoadDiv />;
    }

    return (
      <div className="securitySettingContainer">
        {!md.global.Config.IsLocal && (
          <Fragment>
            <div className="Font17 mBottom30 Bold">{_l('安全')}</div>
            <div>
              {!md.global.Config.IsLocal && (
                <div className="setRowItem">
                  <div className="label Gray_75">
                    {_l('两步验证')}
                    {this.renderTips('isTwoauthentication')}
                  </div>
                  <Switch checked={isTwoauthentication} onClick={this.openVerify} />
                </div>
              )}
              {!md.global.Config.IsLocal && (
                <div className="setRowItem">
                  <div className="label Gray_75">
                    {_l('微信通知')}
                    {this.renderTips('openWeixinLogin')}
                  </div>
                  <Switch checked={openWeixinLogin} onClick={this.openopenWeixinLogin} />
                </div>
              )}
            </div>
          </Fragment>
        )}
        <div className="Font17 mTop30 Bold">{_l('设备管理')}</div>
        {!md.global.Config.IsLocal && (
          <div className="setRowItem loginSameTime">
            <div className="label Gray_75">{_l('允许同时登录')}</div>
            <div className="flexColumn">
              <div className="Gray mBottom14">{_l('关闭后不允许在同类型设备（网页端、移动客户端）上同时登录')}</div>
              <Switch
                checked={allowMultipleDevicesUse}
                onClick={this.changeAllowMultipleDevicesUse}
                style={{ width: 44 }}
              />
            </div>
          </div>
        )}
        <div className="equipmentInfo">
          <div className="label Gray_75">{_l('登录设备列表')}</div>
          <div className="flexColumn flex">
            <div className="Gray">{_l('您当前已在以下设备上登录')}</div>
            {!_.isEmpty(serviceListWeb) && <div className="Font14 mTop30 mBottom8 Bold">{_l('网页端')}</div>}
            {!_.isEmpty(serviceListWeb) && (
              <div className="Gray_9e mBottom15">{_l('包括桌面端和移动端浏览器，桌面客户端')}</div>
            )}
            {serviceListWeb.map(item => this.renderEquipmentItem({ ...item, platform: 'web' }))}
            {!_.isEmpty(serviceListApp) && <div className="Font14 mTop30 mBottom15 Bold">{_l('移动客户端')}</div>}
            {serviceListApp.map(item => this.renderEquipmentItem({ ...item, platform: 'app' }))}
            {!_.isEmpty(serviceListOther) && <div className="Font14 mTop30 mBottom15 Bold">{_l('其他')}</div>}
            {serviceListOther.map(item => this.renderEquipmentItem({ ...item, platform: 'other' }))}
          </div>
        </div>

        {visible && (
          <StepsVerifyDialog
            mobilePhone={mobilePhone}
            email={email}
            isVerify={isVerify}
            visible={visible}
            onOk={() => {
              this.sureSettings('isTwoauthentication', 1, () => {
                this.setState({ isTwoauthentication: true, visible: false });
              });
            }}
            onCancel={() => this.setState({ visible: false })}
          />
        )}

        {openWXRemindDialog && this.openWeixinLoginDialog()}
      </div>
    );
  }
}
