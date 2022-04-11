import React from 'react';
import cx from 'classnames';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import { encrypt } from 'src/util';
import accountController from 'src/api/account';
import captcha from 'src/components/captcha';
import { Input } from 'antd';
import './index.less';
import RegExp from 'src/util/expression';

const checkFuncs = {
  account: ([input, iti]) => {
    if (iti) {
      if (!(input && iti.isValidNumber())) {
        return _l('手机号码格式错误');
      }
    }
  },
  newPwd: pwd => {
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    if (!(pwd && RegExp.isPasswordRule(pwd, passwordRegex))) {
      return passwordRegexTip || _l('密码，至少8-20位，且含字母+数字');
    }
  },
};

export default class InitPasswordDialog extends React.Component {
  constructor(props) {
    super(props);
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    this.state = {
      passwordRegexTip,
      passwordRegex,
      account: '',
      verifyCode: '',
      newPwd: '',
      errorMsg: {},
      isSendVerify: false,
      seconds: 30,
      loading: false,
    };
    this.handleFieldInput = this.handleFieldInput.bind(this);
    this.handleFieldBlur = this.handleFieldBlur.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  componentDidMount() {
    this.itiFn();
  }

  itiFn = () => {
    this.iti = intlTelInput(this.mobile, {
      customPlaceholder: '',
      autoPlaceholder: 'off',
      initialCountry: 'cn',
      loadUtils: '',
      preferredCountries: ['cn'],
      utilsScript: utils,
      separateDialCode: true,
    });
  };

  handleFieldInput(field) {
    return e => {
      this.setState({
        [field]: e.target.value,
      });
    };
  }

  handleFieldBlur(field) {
    return e => {
      let value;
      if (typeof e !== 'undefined') {
        value = field === 'account' ? [this.mobile, this.iti] : e.target.value;
      } else {
        value = field === 'account' ? [this.mobile, this.iti] : this.state[field];
      }
      const errorMsg = this.state.errorMsg || {};
      const checkResult = checkFuncs[field](value);
      if (checkResult) {
        errorMsg[field] = checkResult;
      }
      this.setState({ errorMsg });
    };
  }

  clearError(field) {
    return () => {
      let errorMsg = this.state.errorMsg;
      delete errorMsg[field];
      this.setState({ errorMsg });
    };
  }

  getVerifyCode() {
    const _this = this;
    var throttled = _.throttle(
      function (res) {
        if (res.ret === 0) {
          accountController
            .sendVerifyCode({
              account: _this.iti.getNumber(),
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.staticglobal.getCaptchaType(),
            })
            .then(data => {
              if (data === 1) {
                alert(_l('验证码发送成功'));
                _this.setState(
                  {
                    isSendVerify: true,
                  },
                  _this.countdown,
                );
              } else {
                if (data === 2) {
                  alert(_l('发送失败，新手机号与现有手机号一致'), 2);
                  _this.mobile.focus();
                } else if (data === 8) {
                  alert(_l('验证码错误'), 3);
                }
                if (data === 9) {
                  alert(_l('此手机号已被其它帐号绑定'), 2);
                  _this.mobile.focus();
                } else {
                  alert(_l('验证码发送失败'), 2);
                }
              }
            })
            .fail();
        }
      },
      10000,
      { leading: true },
    );

    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(throttled);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
    }
  }

  countdown = () => {
    const _this = this;
    if (verifyCodeTimer) {
      clearInterval(verifyCodeTimer);
    }
    let verifyCodeTimer = setInterval(function () {
      if (_this.state.seconds <= 0) {
        _this.setState({ isSendVerify: false });
      } else {
        _this.setState({ seconds: _this.state.seconds - 1 });
      }
    }, 1000);
  };

  handleSubmit() {
    this.setState({ loading: true });
    const { verifyCode, newPwd } = this.state;
    const params = {
      account: this.iti.getNumber(),
      verifyCode,
      newPwd: encrypt(newPwd),
    };
    accountController.editIntergrationAccount(params).then(data => {
      if (data === 1) {
        alert(_l('绑定成功'));
        this.props.closeDialog();
      } else if (data === 8) {
        alert(_l('验证码错误'), 2);
      } else if (data === 9) {
        alert(_l('新账号已经被占用'), 2);
      } else if (data === 6) {
        alert(_l('密码错误，需要加密'), 2);
      } else if (data === 0) {
        alert(_l('操作失败'), 2);
      }
      this.setState({ loading: false });
    });
  }

  render() {
    const { account, verifyCode, newPwd, errorMsg = {}, isSendVerify, seconds, loading } = this.state;
    const disabled = account && verifyCode && newPwd && !_.keys(errorMsg).length && !loading;
    return (
      <div className="initPassowrdDialog">
        <div className="mTop12">{_l('手机号')}</div>
        <div className="inputWrap" id="txtMobilePhone">
          <input
            className={cx('inputBox', { errors: errorMsg.account })}
            ref={mobile => (this.mobile = mobile)}
            placeholder={_l('请输入手机号')}
            value={account}
            maxLength="11"
            onChange={this.handleFieldInput('account')}
            onBlur={this.handleFieldBlur('account')}
            onFocus={this.clearError('account')}
          />
        </div>
        <div className="warnBox">{errorMsg.account && <span className="warnMsg">{errorMsg.account}</span>}</div>
        <div className="mTop10">{_l('验证码')}</div>
        <div className="inputWrap">
          <input
            className={cx('inputBox', { errors: errorMsg.verifyCode })}
            placeholder={_l('请输入验证码')}
            maxLength="6"
            value={verifyCode}
            onChange={this.handleFieldInput('verifyCode')}
            onFocus={this.clearError('verifyCode')}
          />
          <button
            type="button"
            className={cx('ming Button Button--primary codeBtn', {
              disable: !this.state.account || (this.iti && !this.iti.isValidNumber()) || isSendVerify,
            })}
            disabled={!this.state.account || (this.iti && !this.iti.isValidNumber()) || isSendVerify}
            onClick={() => this.getVerifyCode()}
          >
            {isSendVerify ? _l('%0秒后重新发送', seconds) : _l('获取验证码')}
          </button>
        </div>
        <div className="warnBox">{errorMsg.verifyCode && <span className="warnMsg">{errorMsg.verifyCode}</span>}</div>
        <div className="mTop10">{_l('设置登录密码')}</div>
        <div className="inputWrap">
          <Input.Password
            className={cx('inputBox', { errors: errorMsg.newPwd })}
            placeholder={_l('请输入密码')}
            maxLength="20"
            value={newPwd}
            onChange={this.handleFieldInput('newPwd')}
            onBlur={this.handleFieldBlur('newPwd')}
            onFocus={this.clearError('newPwd')}
          />
        </div>
        <div className="warnBox">
          {errorMsg.newPwd ? (
            <span className="warnMsg">{errorMsg.newPwd}</span>
          ) : (
            <span className="Gray_9e">{this.state.passwordRegexTip || _l('8-20位，需包含字母和数字')}</span>
          )}
        </div>
        <div className="clearfix">
          <button
            type="button"
            disabled={!disabled}
            className={cx('submitBtn ming Button Right Button--primary', { disable: !disabled })}
            onClick={() => this.handleSubmit()}
          >
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}
