import React, { createRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import intlTelInput from 'ming-ui/components/intlTelInput';
import { captcha } from 'ming-ui/functions';
import externalPortalAjax from 'src/api/externalPortal';
import { ActionResult, CodeTypeEnum } from 'src/pages/AuthService/config';
import { browserIsMobile } from 'src/utils/common';
import { encrypt } from 'src/utils/common';

const AccountWrap = styled.div`
  .iti {
    width: 100%;
    height: 36px;
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
    .iti,
    .telInput {
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
    if (this.props.inputType === 'phone') {
      this.itiFn();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.props.type) {
      sendVerifyCodeTimer && clearInterval(sendVerifyCodeTimer);
      sendVerifyCodeTimer = null;
      this.setState({
        verifyCodeLoading: false,
        verifyCodeText: '',
      });
      if (nextProps.type === 3) {
        setTimeout(() => {
          this.mobile.focus();
        }, 500);
      }
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
        separateDialCode: false,
      });
      $(this.mobile).on('onBlur', e => this.onChangeAccount(e));
    }
  };

  isValidEmail = newAccount => {
    //邮箱验证规则
    var emailReg =
      /^[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*@[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*\.[\u4e00-\u9fa5\w-]+$/i;
    return emailReg.test(newAccount);
  };

  // 验证input内容 手机
  isValid = () => {
    const { account, newAccount } = this.props;
    if (!!account) {
      //老手机号 不需要验证
      return true;
    }
    let isRight = true;
    if (this.props.inputType === 'phone') {
      if (!!this.iti.getNumber().replace(/\s*/g, '')) {
        // 手机号
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
    } else {
      if (newAccount.replace(/\s*/g, '')) {
        //邮箱验证规则
        if (!this.isValidEmail(newAccount)) {
          // 邮箱格式错误
          isRight = false;
          alert(_l('邮箱格式错误'), 2);
        }
      } else {
        //邮箱 为空
        isRight = false;
        alert(_l('请输入邮箱'), 2);
      }
      return isRight;
    }
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
          // portalSmsType: this.props.type, //1：注销 2：修改手机号 3：绑定手机号（不能为0）
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
          codeType: this.props.type, //验证码类型(不能为0) 1：注销；2：申请修改；3：绑定新账号
          account: encrypt(
            this.props.type === 3
              ? this.props.inputType === 'phone'
                ? this.iti.getNumber().replace(/\s*/g, '')
                : this.props.newAccount
              : this.props.account,
          ),
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
              alert(_l('当前企业账户余额不足，无法发送短信/邮件'), 2);
            } else if (data.actionResult == ActionResult.userAccountExists) {
              alert(_l('发送失败，新手机号与现有手机号一致'), 2);
            } else {
              alert(_l('验证码发送失败'), 3);
            }
            return;
          }
        };
        externalPortalAjax
          .sendAccountVerifyCode(param)
          .then(data => {
            thenFn(data);
          })
          .catch(() => this.setState({ verifyCodeLoading: false }));
      };

      new captcha(callback);
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

  onChangeAccount = e => {
    const { setNewAccount, setIsValidNumber, inputType, setCountry } = this.props;
    const isPhone = inputType === 'phone';
    if ((isPhone ? e.target.value.replace(/[^\d]/g, '') : e.target.value.trim()).length < e.target.value.length) {
      setNewAccount(isPhone ? e.target.value.replace(/[^\d]/g, '') : e.target.value.trim());
      isPhone && this.iti.setNumber(`${e.target.value.replace(/[^\d]/g, '')}`);
    } else {
      setNewAccount(isPhone ? this.iti.getNumber() : e.target.value.trim());
    }
    setCountry(isPhone ? `+${this.iti.getSelectedCountryData().dialCode}` : '');
    setIsValidNumber(isPhone ? this.iti.isValidNumber() : this.isValidEmail(e.target.value.trim()));
  };

  render() {
    const { account, setCode, setNewAccount, setIsValidNumber, inputType } = this.props;
    const { verifyCodeLoading, verifyCodeText } = this.state;
    return (
      <AccountWrap>
        <div className={cx('mesDiv', { hidInput: !!account, isMobile: browserIsMobile() })}>
          <span className="title">
            {!!account
              ? this.isValidEmail(account)
                ? _l('邮箱')
                : _l('手机号')
              : inputType === 'phone'
                ? _l('新手机号')
                : _l('新邮箱')}
          </span>
          <span className={cx('telBox', { hid: !account })}>{account}</span>
          <input
            type="text"
            className={cx('telInput')}
            ref={mobile => (this.mobile = mobile)}
            onBlur={this.onChangeAccount}
          />
        </div>
        <div
          className={cx('mesDiv', {
            isMobile: browserIsMobile(),
            mTop16: !browserIsMobile(),
            mTop6: browserIsMobile(),
          })}
        >
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
                this.handleSendVerifyCode(CodeTypeEnum.message);
              }}
            />
          </div>
        </div>
      </AccountWrap>
    );
  }
}

export default TelCon;
