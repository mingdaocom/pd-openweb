import React, { createRef } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import cx from 'classnames';
import './message.less';
import Config from '../config';
import RegisterController from 'src/api/register';
import captcha from 'src/components/captcha';
import { inputFocusFn, inputBlurFn, warnningTipFn, setCNFn } from '../util';
import RegExp from 'src/util/expression';

let sendVerifyCodeTimer = null;
let hasClick = false;
// keys =>
// 'emailOrTel','tel', //手机号 或 邮箱
// 'fullName' //验证用户名
// 'code'  //验证码
// 'password' //密码
class Message extends React.Component {
  constructor(props) {
    super(props);
    this.iti = null;
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    this.state = {
      isMobile: false,
      isSendVerifyCode: false, // 已发送验证码
      loading: false,
      firstSendVerifyCode: true,
      verifyCodeText: '',
      verifyCodeLoading: false, // 已发送并在30内true
      focusDiv: '',
      passwordRegexTip,
      passwordRegex,
    };
  }
  componentDidMount() {
    const { keys = [] } = this.props;
    if (keys.includes('emailOrTel') || keys.includes('tel')) {
      this.itiFn();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { keys = [] } = nextProps;
    if (!hasClick && (keys.includes('emailOrTel') || keys.includes('tel')) && nextProps.dataList.emailOrTel) {
      $(this.mobile).focus();
      keys.includes('password') &&
        setTimeout(() => {
          $(this.password).focus();
        }, 200);
      hasClick = true;
    } else {
      hasClick = true;
    }
    if (keys.includes('fullName')) {
      this.itiHideFn();
    } else {
      if (!this.iti) {
        this.itiFn();
      }
      if (
        this.props.dataList.emailOrTel !== nextProps.dataList.emailOrTel ||
        nextProps.openLDAP !== this.props.openLDAP
      ) {
        if (this.mobile) {
          this.eventItiFn(nextProps);
        }
      }
    }
    const { dataList = {} } = nextProps;
    const { warnningData = [] } = dataList;
    if (warnningData.length > 0) {
      if (!this.state.focusDiv) {
        $(warnningData[0].tipDom).focus();
      }
    }
    const { emailOrTel = '' } = dataList;
    let { isMobile } = this.state;
    let str = this.iti && isMobile ? this.getEmailOrTel(emailOrTel) : emailOrTel;
    if (this.mobile && str !== this.mobile.value) {
      this.mobile.value = str || '';
    }
  }

  componentDidUpdate(prevProps) {
    const { keys = [], openLDAP } = prevProps;
    if ((keys.includes('emailOrTel') || keys.includes('tel')) && openLDAP !== this.props.openLDAP) {
      this.itiFn();
    }
  }

  componentWillUnmount() {
    this.iti && this.iti.destroy();
  }

  inputOnFocus = e => {
    inputFocusFn(e, () => {
      this.setState({
        focusDiv: e.target,
      });
    });
  };

  inputOnBlur = e => {
    inputBlurFn(e, () => {
      this.setState({
        focusDiv: '',
      });
    });
  };

  itiShowFn = () => {
    this.setState({
      isMobile: true,
    });
    $('.iti__flag-container').show();
    $(this.mobile).css({ 'padding-left': '52px' });
  };

  itiHideFn = () => {
    if (this.iti) {
      this.setState({
        isMobile: false,
      });
      $('.iti__flag-container').hide();
      $(this.mobile).css({ 'padding-left': '10px' });
    }
  };

  initFn = props => {
    if (this.mobile) {
      this.setValue(props);
      this.eventItiFn(props);
    }
  };

  getDialCode = () => {
    return this.iti ? (this.state.isMobile ? `+${this.iti.getSelectedCountryData().dialCode}` : '') : '';
  };

  getEmailOrTel = (str = '', withDialCode) => {
    let emailOrTel = str.indexOf(' ') >= 0 ? str.replace(/\s*/g, '') : str; //去除空格
    if (!this.iti) {
      return emailOrTel;
    }
    return withDialCode ? emailOrTel : emailOrTel.replace(`+${this.iti.getSelectedCountryData().dialCode}`, '');
  };

  getEmailOrTelLen = props => {
    const { dataList = {} } = props;
    const { emailOrTel = '' } = dataList;
    return this.getEmailOrTel(emailOrTel).length >= 4;
  };

  setValue = props => {
    const { dataList = {}, setDataFn, type } = props;
    let { emailOrTel = '' } = dataList;
    if (this.iti) {
      if (emailOrTel.indexOf('+') >= 0) {
        this.iti.setNumber(emailOrTel || '');
      }
      if (
        !!emailOrTel &&
        emailOrTel.indexOf('@') < 0 &&
        !isNaN(emailOrTel.replace(/\s*/g, '')) &&
        this.getEmailOrTelLen(props)
      ) {
        setDataFn({
          ...dataList,
          emailOrTel: this.getEmailOrTel(emailOrTel),
          dialCode: `+${this.iti.getSelectedCountryData().dialCode}`,
        });
        this.itiShowFn();
      } else {
        setDataFn({
          ...dataList,
          emailOrTel: this.getEmailOrTel(emailOrTel),
          dialCode: '',
        });
        this.itiHideFn();
      }
    }
  };

  itiFn = () => {
    const { dataList = {}, setDataFn, type } = this.props;
    let { emailOrTel = '' } = dataList;
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
      this.initFn(this.props);
      $(this.mobile).on('close:countrydropdown keyup paste', () => {
        this.initFn(this.props);
      });
    }
  };

  eventItiFn = props => {
    const { type = 'register', dataList = {}, keys = [] } = props;
    const { emailOrTel = '' } = dataList;
    if (emailOrTel.indexOf('+') >= 0 && this.iti) {
      this.iti.setNumber(emailOrTel || '');
    }
    if (keys.includes('tel')) {
      // 注册时只要手机号
      if (!!emailOrTel && !isNaN(emailOrTel.replace(/\s*/g, '')) && this.getEmailOrTelLen(props)) {
        this.itiShowFn();
      } else {
        this.itiHideFn();
      }
    } else {
      if (
        !!emailOrTel &&
        emailOrTel.indexOf('@') < 0 &&
        !isNaN(emailOrTel.replace(/\s*/g, '')) &&
        this.getEmailOrTelLen(props)
      ) {
        this.itiShowFn();
      } else {
        this.itiHideFn();
      }
    }
  };

  isPasswordRule = str => {
    return RegExp.isPasswordRule(str, this.state.passwordRegex);
  };

  // 验证input内容 手机 验证码 密码
  isValid = isForSendCode => {
    const { type = 'register', dataList = {}, setDataFn, keys = [] } = this.props;
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', onlyRead } = dataList;
    let isRight = true;
    let warnningData = [];
    if (keys.includes('emailOrTel') || keys.includes('tel')) {
      if (!!emailOrTel.replace(/\s*/g, '')) {
        //手机号或者邮箱 不为空
        if (keys.includes('tel')) {
          // 注册只有手机号
          if (!this.iti.isValidNumber()) {
            warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号格式错误') });
            isRight = false;
          }
        } else {
          if (this.state.isMobile) {
            if (!this.iti.isValidNumber()) {
              warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号格式错误') });
              isRight = false;
            }
          } else {
            //邮箱验证规则
            var emailReg =
              /^[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*@[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*\.[\u4e00-\u9fa5\w-]+$/i;
            if (!emailReg.test(emailOrTel.trim())) {
              warnningData.push({ tipDom: this.mobile, warnningText: _l('邮箱格式错误') });
              isRight = false;
            }
          }
        }
      } else {
        //手机号或者邮箱 为空
        if (keys.includes('tel')) {
          warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号不能为空') });
          isRight = false;
        } else {
          warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号或邮箱不能为空') });
          isRight = false;
        }
      }
    }
    if (keys.includes('fullName')) {
      // openLDAP  isNetwork  验证用户名
      if (!fullName) {
        warnningData.push({ tipDom: this.fullName, warnningText: _l('用户名不能为空') });
        isRight = false;
      }
    }
    if (!isForSendCode) {
      //获取验证码时，不需要校验验证码 以及 密码
      if (
        keys.includes('code') &&
        (!verifyCode || verifyCode.length < 4 || verifyCode.length > 8) //登录地方验证码必须4-8位才合法
      ) {
        warnningData.push({
          tipDom: '.txtLoginCode',
          warnningText: !verifyCode ? _l('请输入验证码') : _l('验证码不合法'),
          isError: true,
        });
        isRight = false;
      }
      if (keys.includes('password')) {
        if (!password) {
          warnningData.push({ tipDom: this.password, warnningText: _l('密码不能为空') });
          isRight = false;
        } else {
          if (type !== 'login') {
            //登录时，不需要验证密码的合法性
            if (!this.isPasswordRule(password)) {
              warnningData.push({
                tipDom: this.password,
                warnningText: this.state.passwordRegexTip || _l('8-20位，需包含字母和数字'),
              });
              isRight = false;
            }
          }
        }
      }
    }
    setDataFn({
      ...dataList,
      warnningData: warnningData,
    });
    return isRight;
  };

  // 获取验证码
  handleSendVerifyCode = codeType => {
    const { setDataFn } = this.props;
    if (this.isValid(true)) {
      const { dataList = {}, type, sendVerifyCode, appId } = this.props;
      const { emailOrTel = '', dialCode } = dataList;
      const { firstSendVerifyCode } = this.state;
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
          account: dialCode + emailOrTel,
          verifyCodeType: codeType,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.staticglobal.getCaptchaType(),
        };
        let thenFn = data => {
          const { ActionResult } = Config;
          if (data.actionResult == ActionResult.success) {
            setDataFn({
              ...dataList,
              warnningData: [
                {
                  tipDom: '.warnningDiv',
                  warnningText: _l('验证码发送成功'),
                },
              ],
            });
            this.countDown();
          } else if (data.actionResult == ActionResult.userAccountExists) {
            setDataFn({
              ...dataList,
              warnningData: [{ tipDom: this.mobile, warnningText: _l('该号码已注册，您可以使用已有账号登录') }],
            });
          } else if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
            setDataFn({
              ...dataList,
              warnningData: [
                {
                  tipDom: '.warnningDiv',
                  warnningText: _l('验证码发送过于频繁'),
                },
              ],
            });
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            setDataFn({
              ...dataList,
              warnningData: [{ tipDom: '.warnningDiv', warnningText: _l('账号不正确') }],
            });
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            setDataFn({
              ...dataList,
              warnningData: [{ tipDom: '.warnningDiv', warnningText: _l('验证码错误') }],
            });
          } else {
            setDataFn({
              ...dataList,
              warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码发送失败'), isError: true }],
            });
            if (data.actionResult == ActionResult.balanceIsInsufficient) {
              alert(_l('当前企业账号余额不足，无法发送短信'), 2);
            }
            // 非第一次
            if (codeType == Config.CodeTypeEnum.message) {
              this.setState({
                firstSendVerifyCode: false,
              });
            }
          }

          if (data.actionResult != ActionResult.success) {
            if (codeType == Config.CodeTypeEnum.message) {
              this.setState({
                verifyCodeLoading: false,
              });
            } else {
              this.setState({
                verifyCodeLoading: false,
                verifyCodeText: '',
              });
            }
          }
        };
        if (type === 'portalLogin') {
          sendVerifyCode({ ...param, appId }).then(data => {
            thenFn({ ...data, ...param });
          });
        } else if (type !== 'findPassword') {
          param.isFirstTime = firstSendVerifyCode;
          RegisterController.sendRegisterVerifyCode(param).then(data => {
            thenFn(data);
          });
        } else {
          RegisterController.sendFindPasswordVerifyCode(param).then(data => {
            thenFn(data);
          });
        }
      };

      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
      }
    }
  };

  countDown = () => {
    const { setDataFn } = this.props;
    let seconds = 30;
    let hasWarn = false;
    $(this.code).focus();
    sendVerifyCodeTimer = setInterval(() => {
      if (seconds <= 0) {
        this.setState({
          verifyCodeText: '',
          verifyCodeLoading: false,
          firstSendVerifyCode: false,
        });
        const { dataList = {} } = this.props;
        const { verifyCode = '' } = dataList;
        if (!verifyCode) {
          setDataFn({
            ...dataList,
            warnningData: [
              {
                tipDom: '.warnningDiv',
                warnningText: 'txt',
              },
            ],
          });
        }
        clearInterval(sendVerifyCodeTimer);
        sendVerifyCodeTimer = null;
      } else {
        if (seconds < 22 && !hasWarn) {
          // 8秒后提示收不到验证码的帮助
          const { dataList = {} } = this.props;
          setDataFn({
            ...dataList,
            warnningData: [
              {
                tipDom: '.warnningDiv',
                warnningText: _l('验证码发送成功'),
              },
            ],
          });
          hasWarn = true;
        }
        this.setState({
          verifyCodeText: _l('%0秒后重发', seconds),
        });
        seconds--;
      }
    }, 1000);
  };

  render() {
    const { type = 'register', dataList = {}, setDataFn, nextHtml, maxLength, keys = [] } = this.props;
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', warnningData = [], onlyRead } = dataList;
    let { isMobile, verifyCodeText, verifyCodeLoading, focusDiv } = this.state;
    let str = this.iti && isMobile ? this.getEmailOrTel(emailOrTel) : emailOrTel;

    let warnningDiv = _.find(warnningData, it => it.tipDom === '.warnningDiv');
    let autoCompleteData = {
      autoComplete: type !== 'login' ? 'new-password' : 'on',
    };
    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          {warnningDiv ? (
            warnningDiv.warnningText === 'txt' ? (
              <div
                className={cx('warnningDiv', {
                  warnningRed: warnningDiv.isError,
                  warnningGreen: !warnningDiv.isError,
                })}
              >
                {_l('收不到验证码？请重新获取')}
              </div>
            ) : (
              <div
                className={cx('warnningDiv', { warnningRed: warnningDiv.isError, warnningGreen: !warnningDiv.isError })}
                dangerouslySetInnerHTML={{ __html: warnningDiv.warnningText }}
              ></div>
            )
          ) : null}
          {(keys.includes('emailOrTel') || keys.includes('tel')) && (
            <div
              className={cx('mesDiv', {
                ...setCNFn(warnningData, [this.mobile, '#txtMobilePhone'], focusDiv, emailOrTel),
              })}
            >
              <input
                type="text"
                className=""
                id="txtMobilePhone"
                className={cx({ onlyRead: onlyRead })}
                disabled={onlyRead ? 'disabled' : ''}
                ref={mobile => (this.mobile = mobile)}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                placeholder={str}
                onPaste={e => {
                  setDataFn(
                    {
                      ...dataList,
                      emailOrTel: this.getEmailOrTel(e.target.value),
                      dialCode: this.getDialCode(),
                    },
                    () => {
                      this.eventItiFn(this.props);
                      $(this.mobile).focus();
                    },
                  );
                }}
                onChange={e => {
                  let data = _.filter(dataList.warnningData, it => it.tipDom !== this.mobile);
                  setDataFn(
                    {
                      ...dataList,
                      warnningData: data,
                      emailOrTel: this.getEmailOrTel(e.target.value),
                      dialCode: this.getDialCode(),
                    },
                    () => {
                      this.eventItiFn(this.props);
                      $(this.mobile).focus();
                    },
                  );
                }}
                {...autoCompleteData}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.mobile).focus();
                }}
              >
                {['register', 'portalLogin'].includes(type) ? _l('手机号') : _l('手机号或邮箱')}
              </div>
              {warnningTipFn(warnningData, [this.mobile, '#txtMobilePhone'], focusDiv)}
            </div>
          )}
          {keys.includes('fullName') && (
            <div
              className={cx('mesDiv', {
                ...setCNFn(warnningData, [this.fullName, '#fullName'], focusDiv, fullName),
              })}
            >
              <input
                type="text"
                id="fullName"
                ref={fullName => (this.fullName = fullName)}
                value={fullName || ''}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                placeholder={fullName || ''}
                onChange={e => {
                  let data = _.filter(dataList.warnningData, it => it.tipDom !== this.fullName);
                  setDataFn({
                    ...dataList,
                    warnningData: data,
                    fullName: e.target.value,
                  });
                }}
                {...autoCompleteData}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.fullName).focus();
                }}
              >
                {_l('用户名')}
              </div>
              {warnningTipFn(warnningData, [this.fullName, '#fullName'], focusDiv)}
            </div>
          )}
          {keys.includes('code') && (
            <div
              className={cx('mesDiv', {
                ...setCNFn(warnningData, ['.txtLoginCode'], focusDiv, verifyCode),
              })}
            >
              <input
                type="text"
                maxLength={maxLength || '4'}
                className="loginInput Left txtLoginCode"
                value={verifyCode}
                ref={code => (this.code = code)}
                placeholder={verifyCode}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                onChange={e => {
                  let data = _.filter(dataList.warnningData, it => it.tipDom !== '.txtLoginCode');
                  setDataFn({
                    ...dataList,
                    warnningData: data,
                    verifyCode: e.target.value.replace(/[^\d]/g, ''),
                  });
                }}
              />
              <input
                disabled={verifyCodeLoading}
                type="button"
                className={cx('btn btnSendVerifyCode Right', {
                  btnDisabled: verifyCodeLoading,
                  btnEnabled: !verifyCodeLoading,
                })}
                id="btnSendVerifyCode"
                value={verifyCodeText || (verifyCodeLoading ? _l('发送中...') : _l('获取验证码'))}
                onClick={e => {
                  this.handleSendVerifyCode(Config.CodeTypeEnum.message);
                }}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.code).focus();
                }}
              >
                {_l('验证码')}
              </div>
              {warnningTipFn(warnningData, ['.txtLoginCode'], focusDiv)}
            </div>
          )}
          {keys.includes('password') && (
            <div
              className={cx('mesDiv', {
                ...setCNFn(warnningData, ['.passwordIcon', this.password], focusDiv, password),
              })}
            >
              <input
                type="password"
                className="passwordIcon"
                placeholder={password}
                ref={password => (this.password = password)}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                onChange={e => {
                  let data = _.filter(dataList.warnningData, it => it.tipDom !== this.password);
                  setDataFn({
                    ...dataList,
                    warnningData: data,
                    password: e.target.value,
                  });
                }}
                value={password}
                {...autoCompleteData}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.password).focus();
                }}
              >
                {type !== 'login' ? this.state.passwordRegexTip || _l('8-20位，需包含字母和数字') : _l('密码')}
              </div>
              {warnningTipFn(warnningData, ['.passwordIcon', this.password], focusDiv)}
            </div>
          )}
        </div>
        {nextHtml(this.isValid)}
      </React.Fragment>
    );
  }
}

export default Message;
