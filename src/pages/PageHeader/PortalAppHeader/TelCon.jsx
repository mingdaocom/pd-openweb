import React, { createRef } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import captcha from 'src/components/captcha';
import cx from 'classnames';
import Config from 'src/pages/account/config';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import { sendAccountVerifyCode } from 'src/api/externalPortal';

const { ActionResult } = Config;
const TelWrap = styled.div`
  .iti {
    width: 100%;
    .telInput {
      width: 100%;
      padding-left: 52px !important;
    }
  }
  .isMobile {
    display: block !important;
    .title {
      width: 100%;
      display: block;
    }
    .telBox,
    .telInput {
      flex: initial;
      width: 100%;
      display: block;
    }
    .txtLoginCode {
    }
  }
  .hidInput {
    .iti {
      display: none;
    }
  }
  .mesDiv {
    display: flex;
    width: 100%;
    .title {
      width: 100px;
      min-width: 100px;
      font-weight: 600;
      line-height: 36px;
    }
    .txtLoginCode,
    .telBox,
    .telInput {
      flex: 1;
      height: 36px;
      background: #fff;
      border: 1px solid #e0e0e0;
      opacity: 1;
      border-radius: 3px;
      padding: 0 12px;
      line-height: 36px;
      &.telBox {
        background: #f8f8f8;
      }
      &.hid {
        width: 0;
        height: 0;
        opacity: 0;
        display: none;
      }
    }
    .code {
      flex: 1;
      display: flex;
    }
    .btnSendVerifyCode {
      width: 130px;
      height: 36px;
      background: #2196f3;
      opacity: 1;
      border-radius: 3px;
      border: 0;
      color: #fff;
      &.btnEnabled {
        background-color: #2196f3;
        cursor: pointer;
        -webkit-transition: background-color 0.5s;
        transition: background-color 0.5s;
      }

      &.btnEnabled:hover {
        background-color: #1565c0;
        -webkit-transition: background-color 0.5s;
        transition: background-color 0.5s;
      }
      &.btnDisabled {
        background-color: #ccc;
        cursor: default;
      }
    }
  }
`;
let sendVerifyCodeTimer = null;
class TelCon extends React.Component {
  constructor(props) {
    super(props);
    this.iti = null;
    this.state = {
      loading: false,
      verifyCodeText: '',
      verifyCodeLoading: false, // 已发送并在30内true
      focusDiv: '',
    };
  }
  componentDidMount() {
    this.itiFn();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.props.type) {
      sendVerifyCodeTimer && clearInterval(sendVerifyCodeTimer);
      sendVerifyCodeTimer = null;
      this.setState({
        verifyCodeLoading: false,
        verifyCodeText: '',
      });
    }
  }

  componentWillUnmount() {
    this.iti && this.iti.destroy();
  }

  itiFn = () => {
    if (this.mobile) {
      this.iti && this.iti.destroy();
      this.iti = intlTelInput(this.mobile, {
        customPlaceholder: () => {
          return emailOrTel;
        },
        autoPlaceholder: 'off',
        initialCountry: 'cn',
        loadUtils: '',
        preferredCountries: ['cn'],
        utilsScript: utils,
        separateDialCode: false,
      });
    }
  };

  // 验证input内容 手机
  isValid = () => {
    const { tel } = this.props;
    if (!!tel) {
      //老手机号 不需要验证
      return true;
    }
    let isRight = true;
    if (!!this.iti.getNumber().replace(/\s*/g, '')) {
      // 注册只有手机号
      if (!this.iti.isValidNumber()) {
        // 手机号格式错误
        isRight = false;
        alert(_l('手机号格式错误'), 2);
      }
    } else {
      //手机号 为空
      isRight = false;
      alert(_l('请输入手机号'), 2);
    }
    return isRight;
  };

  // 获取验证码
  handleSendVerifyCode = () => {
    if (this.isValid()) {
      let callback = res => {
        if (res.ret !== 0) {
          this.setState({
            verifyCodeLoading: false,
          });
          return;
        } else {
          this.setState({
            verifyCodeLoading: true,
          });
        }
        let param = {
          appId: this.props.appId,
          portalSmsType: this.props.type, //1：注销 2：修改手机号 3：绑定手机号（不能为0）
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.staticglobal.getCaptchaType(),
          account: this.props.type === 3 ? this.iti.getNumber().replace(/\s*/g, '') : this.props.tel,
        };
        let thenFn = data => {
          if (data.actionResult === 1) {
            this.countDown();
          } else {
            this.setState({
              verifyCodeLoading: false,
            });
            if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
              alert(_l('验证码发送过于频繁，请稍后再试'), 3);
            } else if (data.actionResult == ActionResult.userInfoNotFound) {
              alert(_l('账号不正确'), 3);
            } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
              alert(_l('验证码错误'), 3);
            } else if (data.actionResult == ActionResult.balanceIsInsufficient) {
              alert(_l('当前企业账号余额不足，无法发送短信'), 2);
            } else if (data.actionResult == ActionResult.userAccountExists) {
              alert(_l('发送失败，新手机号与现有手机号一致'), 2);
            } else {
              alert(_l('验证码发送失败'), 3);
            }
            return;
          }
        };
        sendAccountVerifyCode(param).then(data => {
          thenFn(data);
        });
      };

      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
      }
    }
  };

  countDown = () => {
    let seconds = 30;
    $(this.code).focus();
    sendVerifyCodeTimer = setInterval(() => {
      if (seconds <= 0) {
        this.setState({
          verifyCodeText: '',
          verifyCodeLoading: false,
        });
        clearInterval(sendVerifyCodeTimer);
        sendVerifyCodeTimer = null;
      } else {
        this.setState({
          verifyCodeText: _l('%0秒后重发', seconds),
        });
        seconds--;
      }
    }, 1000);
  };

  render() {
    const { tel, setCode, setNewTel, setIsValidNumber } = this.props;
    const { verifyCodeLoading, verifyCodeText } = this.state;
    return (
      <TelWrap>
        <div className={cx('mesDiv', { hidInput: !!tel, isMobile: browserIsMobile() })}>
          <span className="title">{!!tel ? _l('手机号') : _l('新手机号')}</span>
          <span className={cx('telBox', { hid: !tel })}>{tel}</span>
          <input
            type="text"
            className={cx('telInput')}
            ref={mobile => (this.mobile = mobile)}
            onChange={e => {
              if (e.target.value.replace(/[^\d]/g, '').length < e.target.value.length) {
                setNewTel(e.target.value.replace(/[^\d]/g, ''));
                this.iti.setNumber(`${e.target.value.replace(/[^\d]/g, '')}`);
              } else {
                setIsValidNumber(this.iti.isValidNumber());
                setNewTel(this.iti.getNumber());
              }
            }}
          />
        </div>
        <div className={cx('mesDiv mTop16', { isMobile: browserIsMobile() })}>
          <span className="title">{_l('验证码')}</span>
          <div className="code">
            <input
              type="text"
              maxLength={'4'}
              className="loginInput txtLoginCode"
              value={this.props.code}
              ref={code => (this.code = code)}
              onChange={e => {
                setCode(e.target.value.replace(/[^\d]/g, ''));
              }}
            />
            <input
              disabled={verifyCodeLoading}
              type="button"
              className={cx('btn btnSendVerifyCode mLeft16', {
                btnDisabled: verifyCodeLoading,
                btnEnabled: !verifyCodeLoading,
              })}
              id="btnSendVerifyCode"
              value={verifyCodeText || (verifyCodeLoading ? _l('发送中...') : _l('获取验证码'))}
              onClick={e => {
                this.handleSendVerifyCode(Config.CodeTypeEnum.message);
              }}
            />
          </div>
        </div>
      </TelWrap>
    );
  }
}

export default TelCon;
