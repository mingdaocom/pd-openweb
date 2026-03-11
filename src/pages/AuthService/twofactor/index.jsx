import React from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import loginAjax from 'src/api/login';
import ChangeLang from 'src/components/ChangeLang';
import WrapBg from 'src/pages/AuthService/components/Bg.jsx';
import Footer from 'src/pages/AuthService/components/Footer.jsx';
import 'src/pages/AuthService/components/form.less';
import Header from 'src/pages/AuthService/components/Header.jsx';
import { Wrap } from 'src/pages/AuthService/login/style.jsx';
import { WrapCom } from 'src/pages/AuthService/style.jsx';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { TwofactorVerifyCodeActionResult } from '../login/config';
import { TwofactorType } from './config';
import Twofactor from './twofactorCon';

export default class TwofactorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasSend: false, // 验证码发送接口是否成功（用于控制是否显示提示文案）
      hasSendTel: false, //是否发动过一次手机号验证
      state: getRequest().state,
      type: null, // 验证方式
      isFail: false, //验证码是否发送失败
      loading: true, // 是否正在加载两步验证配置信息
      enabledTypes: [], // 用户开启的验证方式列表
      timeMap: {}, // 存储各验证方式的发送时间
    };
    this.twofactorRef = React.createRef();
  }

  componentDidMount() {
    this.getTwofactorSettingInfo();
  }

  // 获取用户开启的两步验证方式
  getTwofactorSettingInfo = () => {
    const { state } = this.state;
    loginAjax
      .getTwofactorSettingInfo({ state })
      .then(data => {
        const {
          mobilePhoneEnabled = false,
          emailEnabled = false,
          totpEnabled = false,
          mobilePhone,
          email,
        } = data || {};

        // 按照优先级顺序收集开启的验证方式：如果配置了类型，则配置的类型排在第一位
        const priorityType = _.get(md, 'global.SysSettings.twoFactorAuthenticationPriorityType');
        const typeMap = {
          [TwofactorType.totp]: totpEnabled,
          [TwofactorType.mobilePhone]: mobilePhoneEnabled,
          [TwofactorType.email]: emailEnabled,
        };
        // 默认顺序：TOTP > 短信 > 邮箱
        let order = [TwofactorType.totp, TwofactorType.mobilePhone, TwofactorType.email];
        // 如果配置了类型，则排在第一位
        if (priorityType) {
          order = [priorityType, ..._.without(order, priorityType)];
        }
        // 只保留已开启的验证方式
        const enabledTypes = order.filter(type => typeMap[type]);

        // 如果没有开启任何验证方式，跳转到登录页
        if (enabledTypes.length <= 0) {
          navigateTo('/login');
          return;
        }

        // 默认类型就是第一个
        const defaultType = enabledTypes[0];

        this.setState(
          {
            enabledTypes,
            type: defaultType,
            loading: false,
            mobilePhone,
            email,
          },
          () => {
            // TOTP验证方式不需要调用发送验证码接口，验证码由验证器应用生成，直接设置为 true 表示已准备好显示提示文案
            if (defaultType === TwofactorType.totp) {
              this.setState({
                hasSend: true, // TOTP 不需要发送接口，直接设置为 true
              });
            } else {
              // 其他方式需要调用发送接口，接口成功后会设置 hasSend 为 true
              this.sendFn();
            }
          },
        );
      })
      .catch(error => {
        console.log(error);
        this.setState({ loading: false });
        // 获取失败时跳转到登录页
        navigateTo('/login');
      });
  };

  //获取验证码ajaxFn
  sendTwofactorVerifyCode = (data, callbacks = {}) => {
    this.setState({ isFail: false });
    const { ticket, randstr, captchaType } = data || {};
    const { state, type, hasSendTel } = this.state;
    const info = data ? { ticket, randstr, captchaType } : {};
    const { s } = getRequest();
    loginAjax
      .sendTwofactorVerifyCode({
        state,
        type, //1为手机号，2为邮箱
        ...info,
        regFrom: s,
        lang: getCurrentLangCode(),
      })
      .then(data => {
        this.setState({
          needTicket: true, //除了第一次 都需要图形验证码
        });
        const { actionResult } = data;
        const { failed, success, failInvalidVerifyCode, userInvalid, sendFrequent, noEmail, noTel } =
          TwofactorVerifyCodeActionResult;
        //图形验证码错误 //需要图形验证
        if (actionResult === failInvalidVerifyCode) {
          callbacks?.onError?.();
          this.setState({ isFail: true, hasSend: false }, () => {
            // 图形验证失败，重置发送状态，允许重新发送
            this.twofactorRef.current?.resetOtpSending?.();
            this.sendFn();
          });
          return;
        } else if ([failed, noEmail, noTel, sendFrequent].includes(actionResult)) {
          //失败
          this.setState({ isFail: true, hasSend: false });
          callbacks?.onError?.();
          // 接口返回失败，重置发送状态，允许重新发送
          this.twofactorRef.current?.resetOtpSending?.();
          let msg = _l('验证码发送失败!');
          if (actionResult === sendFrequent) {
            msg = _l('验证码发送过于频繁，请切换验证方式!');
          }
          if ([noEmail, noTel].includes(actionResult)) {
            //未绑定手机号 除第一次外，提示未绑定
            const switchToType = type !== TwofactorType.mobilePhone ? TwofactorType.mobilePhone : TwofactorType.email;
            if (hasSendTel) {
              msg =
                actionResult === noTel ? _l('手机未绑定，请使用邮箱验证！') : _l('邮箱未绑定，请使用手机短信验证！');
              this.setState({
                type: switchToType,
              });
            } else {
              this.setState({
                type: switchToType,
                hasSendTel: true,
              });
              return;
            }
          }
          alert(msg, 3);
          return;
        } else if (actionResult === userInvalid) {
          callbacks?.onError?.();
          this.setState({ hasSend: false });
          // 用户无效，重置发送状态
          this.twofactorRef.current?.resetOtpSending?.();
          navigateTo('/login');
        } else if (actionResult === success) {
          // 只有接口返回成功时才设置 hasSend 为 true（表示验证码发送接口成功）
          callbacks?.onSuccess?.();
          this.setState({
            hasSend: true, // 验证码发送接口成功
            timeMap: {
              ...this.state.timeMap,
              [type]: new Date(),
            },
            isFail: false,
          });
        } else {
          // 其他未知情况，发送失败，不显示文案
          this.setState({ hasSend: false });
          // 其他错误，重置发送状态，允许重新发送
          this.twofactorRef.current?.resetOtpSending?.();
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({ isFail: true, hasSend: false });
        callbacks?.onError?.();
        // 接口调用失败，重置发送状态，允许重新发送
        this.twofactorRef.current?.resetOtpSending?.();
      });
  };
  //获取验证码
  sendFn = () => {
    // 从子组件获取 callbacks
    const callbacks = this.twofactorRef.current?.getSendFnCallbacks?.() || {};
    const { needTicket, type } = this.state;
    // TOTP方式验证不需要图形验证码
    const shouldUseCaptcha = needTicket && type !== TwofactorType.totp;
    let callback = (res = {}) => {
      if (shouldUseCaptcha && res.ret !== 0) {
        callbacks?.onError?.();
        // 图形验证失败，重置发送状态，允许重新发送
        this.twofactorRef.current?.resetOtpSending?.();
        return;
      }
      this.sendTwofactorVerifyCode(
        {
          ...res,
          captchaType: md.global.getCaptchaType(),
        },
        {
          onSuccess: callbacks.onSuccess,
          onError: callbacks.onError,
        },
      );
    };
    const onCancel = () => {
      callbacks?.onCancel?.();
      callbacks?.onError?.();
    };
    if (shouldUseCaptcha) {
      new captcha(callback, onCancel);
    } else {
      callback();
    }
  };

  handleSwitchType = newType => {
    // 切换到TOTP方式验证时，不需要图形验证码，也不需要调用发送验证码接口
    const isTotp = newType === TwofactorType.totp;
    if (isTotp) {
      this.setState({ type: newType, hasSend: true }); // TOTP 不需要发送接口，直接设置为 true
      return;
    }

    // 切换验证方式时，禁用重新发送按钮（确保在发送前按钮已被禁用）
    this.twofactorRef.current?.setOtpSending?.(true);

    // 检查该验证方式是否已有发送记录且在30秒内
    const sendTime = this.state.timeMap[newType];
    if (sendTime) {
      const now = new Date();
      const elapsedSeconds = parseInt((now - sendTime) / 1000);
      // 如果还在30秒内，保留计时器，不重新发送（之前已经发送成功，保持 hasSend 为 true）
      if (elapsedSeconds < 30 && elapsedSeconds >= 0) {
        this.setState({ type: newType, hasSend: true }); // 之前已经发送成功，保持为 true
        return;
      }
    }

    // 否则重新发送验证码（接口成功后会设置 hasSend 为 true）
    this.setState({ type: newType, hasSend: false }, () => {
      this.sendFn();
    });
  };

  render() {
    return (
      <WrapCom>
        <DocumentTitle title={_l('两步验证')} />
        <WrapBg />
        <div className="loginBox">
          <div className="loginContainer">
            <Header />
            {this.state.loading ? (
              <LoadDiv className="" style={{ margin: '50px auto' }} />
            ) : (
              <Wrap>
                <Twofactor
                  ref={this.twofactorRef}
                  {...this.state}
                  sendFn={this.sendFn}
                  onSwitchType={this.handleSwitchType}
                />
                <React.Fragment>
                  <div className="tpLogin TxtCenter">
                    <div className="Clear"></div>
                  </div>
                  <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
                    <div className="mLeft16 TxtLeft">
                      <ChangeLang className="justifyContentLeft" />
                    </div>
                  </div>
                </React.Fragment>
              </Wrap>
            )}
          </div>
        </div>
        {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
      </WrapCom>
    );
  }
}
