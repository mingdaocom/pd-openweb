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
import Twofactor from './twofactorCon';

export default class TwofactorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasSend: false, //是否已发送默认的第一次验证
      hasSendTel: false, //是否发动过一次手机号验证
      state: getRequest().state,
      type: _.get(md, 'global.SysSettings.twoFactorAuthenticationPriorityType') || 1, //1为手机号，2为邮箱,
      isFail: false, //验证码是否发送失败
      tel: '',
      email: '',
    };
  }

  componentDidMount() {
    this.sendFn();
  }

  //获取验证码ajaxFn
  sendTwofactorVerifyCode = data => {
    this.setState({
      isFail: false,
    });
    const { ticket, randstr, captchaType } = data;
    const { state, type, hasSendTel } = this.state;
    let info = {};
    if (data) {
      info = {
        ticket,
        randstr,
        captchaType,
      };
    }
    const { s } = getRequest();
    loginAjax
      .sendTwofactorVerifyCode({
        state,
        type, //1为手机号，2为邮箱,
        ...info,
        regFrom: s,
        lang: getCurrentLangCode(),
      })
      .then(data => {
        this.setState({
          needTicket: true, //除了第一次 都需要图形验证码
          hasSend: true,
        });
        const { actionResult, user = {} } = data;
        const { failed, success, failInvalidVerifyCode, userInvalid, sendFrequent, noEmail, noTel } =
          TwofactorVerifyCodeActionResult;
        //图形验证码错误 //需要图形验证
        if ([failInvalidVerifyCode].includes(actionResult)) {
          this.setState({ needTicket: true, isFail: true }, () => {
            this.sendFn();
          });
          return;
        } else if ([failed, noEmail, noTel, sendFrequent].includes(actionResult)) {
          //失败
          this.setState({
            isFail: true,
          });
          let msg = _l('验证码发送失败!');
          if (actionResult === sendFrequent) {
            msg = _l('验证码发送过于频繁，请切换验证方式!');
          }
          if ([noEmail, noTel].includes(actionResult)) {
            //未绑定手机号 除第一次外，提示未绑定
            if (hasSendTel) {
              msg =
                actionResult === noTel ? _l('手机未绑定，请使用邮箱验证！') : _l('邮箱未绑定，请使用手机短信验证！');
              this.setState({
                type: type !== 1 ? 1 : 2,
                account: '',
              });
            } else {
              this.setState({
                type: type !== 1 ? 1 : 2,
                hasSendTel: true,
              });
              return;
            }
          }
          alert(msg, 3);
          return;
        } else if (actionResult === userInvalid) {
          navigateTo('/login');
        } else if (actionResult === success) {
          let parm = {};
          if (type === 1) {
            parm = { telTime: new Date(), tel: user.account };
          } else {
            parm = { emailTime: new Date(), email: user.account };
          }
          this.setState({
            ...parm,
            account: user.account,
            isFail: false,
          });
        }
      });
  };
  //获取验证码
  sendFn = (data = {}) => {
    const { needTicket } = this.state;
    let callback = (res = {}) => {
      if (needTicket && res.ret !== 0) {
        return;
      }
      if (data.btnCb) {
        data.btnCb();
      }
      this.sendTwofactorVerifyCode(
        Object.assign({}, res, {
          captchaType: md.global.getCaptchaType(),
        }),
      );
    };
    if (needTicket) {
      new captcha(callback);
    } else {
      callback();
    }
  };

  renderCon = () => {
    let pram = {
      ...this.state,
      sendFn: this.sendFn,
    };

    return <Twofactor {...pram} />;
  };

  renderFooter = () => {
    let { type } = this.state;

    return (
      <React.Fragment>
        <div className="tpLogin TxtCenter">
          <div className="Clear"></div>
        </div>
        <div className="line" style={{ marginTop: 150 }}></div>
        <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
          <span
            className="changeBtn Hand TxtRight"
            onClick={() => {
              this.setState({
                type: type !== 1 ? 1 : 2,
                account: '',
              });
            }}
          >
            {type !== 2 ? _l('使用邮箱验证') : _l('使用手机短信验证')}
          </span>
          <span className="lineCenter mLeft24"></span>
          <div className="mLeft16 TxtLeft">
            <ChangeLang className="justifyContentLeft" />
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    return (
      <WrapCom>
        <DocumentTitle title={_l('两步验证')} />
        <WrapBg />
        <div className="loginBox">
          <div className="loginContainer">
            <Header />
            {!this.state.hasSend ? (
              <LoadDiv className="" style={{ margin: '50px auto' }} />
            ) : (
              <Wrap>
                {this.renderCon()}
                {this.renderFooter()}
              </Wrap>
            )}
          </div>
        </div>
        {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
      </WrapCom>
    );
  }
}
