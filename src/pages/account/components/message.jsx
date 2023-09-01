import React, { createRef } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import cx from 'classnames';
import './message.less';
import Config from '../config';
import RegisterController from 'src/api/register';
import captcha from 'src/components/captcha';
import { inputFocusFn, inputBlurFn, warnningTipFn, setWarnningData } from '../util';
import RegExp from 'src/util/expression';
import { specialTelVerify } from 'src/pages/account/util.js';
import _ from 'lodash';
import { encrypt, mdAppResponse } from 'src/util';
import Checkbox from 'ming-ui/components/Checkbox';
import Icon from 'ming-ui/components/Icon';
import Tooltip from 'ming-ui/components/Tooltip';

let sendVerifyCodeTimer = null;
let hasClick = false;
// keys =>
// 'emailOrTel','tel','email' //手机号 或 邮箱
// 'fullName' //验证用户名
// 'code'  //验证码
// 'password','setPassword' //密码
// 'privacy' //隐私
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
      verifyCodeLoading: false, // 已发送并在60内true
      focusDiv: '',
      passwordRegexTip,
      passwordRegex,
      hasCheck: false,
      isUpperCase: false,
      // isCapsLock: false,
      isOpen: false,
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
      (keys.includes('password') || keys.includes('setPassword')) &&
        setTimeout(() => {
          $(this.password).focus();
        }, 200);
      hasClick = true;
    } else {
      hasClick = true;
    }
    if (keys.includes('fullName') || keys.includes('email')) {
      this.itiHideFn();
    } else {
      if (!this.iti || !$('.iti__flag-container').length) {
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
    const { openLDAP } = prevProps;
    if (openLDAP !== this.props.openLDAP && openLDAP) {
      this.itiFn();
    }
  }

  componentWillUnmount() {
    this.iti && this.iti.destroy();
  }

  inputOnFocus = e => {
    e.persist();
    inputFocusFn(e, () => {
      this.setState({
        focusDiv: e.target,
      });
    });
  };

  inputOnBlur = e => {
    e.persist();
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

  goLogin = () => {
    const { dataList = {} } = this.props;
    const { emailOrTel = '', dialCode = '' } = dataList;
    const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
    if (isMingdao) {
      mdAppResponse({
        sessionId: 'register',
        type: 'native',
        settings: { action: 'registerSuccess', account: dialCode + emailOrTel },
      });
    }
  };

  getDialCode = isMobile => {
    return this.iti ? (isMobile ? `+${this.iti.getSelectedCountryData().dialCode}` : '') : '';
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
    const { dataList = {}, onChangeData, type } = props;
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
        onChangeData({
          ...dataList,
          emailOrTel: this.getEmailOrTel(emailOrTel),
          dialCode: `+${this.iti.getSelectedCountryData().dialCode}`,
        });
        this.itiShowFn();
      } else {
        onChangeData({
          ...dataList,
          emailOrTel: this.getEmailOrTel(emailOrTel),
          dialCode: '',
        });
        this.itiHideFn();
      }
    }
  };

  itiFn = () => {
    const { dataList = {}, onChangeData, type } = this.props;
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
        this.getEmailOrTelLen(props) &&
        !keys.includes('email')
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
    const { dataList = {}, onChangeData, keys = [] } = this.props;
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', onlyRead } = dataList;
    const { hasCheck } = this.state;
    let isRight = true;
    let warnningData = [];
    if (keys.includes('emailOrTel') || keys.includes('tel') || keys.includes('email')) {
      if (!!emailOrTel.replace(/\s*/g, '')) {
        //手机号或者邮箱 不为空
        if (keys.includes('tel')) {
          // 注册只有手机号
          if (!this.iti.isValidNumber() && !specialTelVerify(this.iti.getNumber())) {
            warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号格式错误') });
            isRight = false;
          }
        } else {
          if (this.state.isMobile) {
            if (!this.iti.isValidNumber() && !specialTelVerify(this.iti.getNumber())) {
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
        } else if (keys.includes('email')) {
          warnningData.push({ tipDom: this.mobile, warnningText: _l('邮箱不能为空') });
          isRight = false;
        } else {
          warnningData.push({ tipDom: this.mobile, warnningText: _l('手机号或邮箱不能为空') });
          isRight = false;
        }
      }
    }
    if (keys.includes('fullName')) {
      // openLDAP  isNetwork  验证用户名
      if (!_.trim(fullName)) {
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
      if (keys.includes('password') || keys.includes('setPassword')) {
        if (!password) {
          warnningData.push({ tipDom: this.password, warnningText: _l('密码不能为空') });
          isRight = false;
        } else {
          if (keys.includes('setPassword')) {
            //登录时，不需要验证密码的合法性
            if (!this.isPasswordRule(password)) {
              warnningData.push({
                tipDom: this.password,
                warnningText: _l('密码格式错误'),
              });
              isRight = false;
            }
          }
        }
      }
      if (keys.includes('privacy') && !hasCheck) {
        warnningData.push({
          tipDom: this.privacy,
          warnningText: _l('请勾选同意后注册'),
          isError: true,
        });
        isRight = false;
      }
    }
    onChangeData({
      ...dataList,
      warnningData: warnningData,
    });
    if (!isRight) {
      setTimeout(() => {
        $(warnningData[0].tipDom).click();
      }, 200);
    }
    return isRight;
  };

  // 获取验证码
  handleSendVerifyCode = codeType => {
    const { onChangeData } = this.props;
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
          account: encrypt(dialCode + emailOrTel),
          verifyCodeType: codeType,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.staticglobal.getCaptchaType(),
        };
        let thenFn = data => {
          const { ActionResult } = Config;
          if (data.actionResult == ActionResult.success) {
            onChangeData({
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
            onChangeData({
              ...dataList,
              warnningData: [
                {
                  tipDom: this.mobile,
                  warnningText: _l('账号已注册'),
                  onClick: () => this.goLogin(),
                },
              ],
            });
          } else if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
            onChangeData({
              ...dataList,
              warnningData: [
                {
                  tipDom: '.warnningDiv',
                  warnningText: _l('验证码发送过于频繁'),
                },
              ],
            });
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            if (type === 'findPassword') {
              onChangeData({
                ...dataList,
                warnningData: [
                  {
                    tipDom: '#txtMobilePhone',
                    warnningText: _l('账号未注册'),
                  },
                ],
              });
            } else {
              onChangeData({
                ...dataList,
                warnningData: [{ tipDom: '.warnningDiv', warnningText: _l('账号不正确') }],
              });
            }
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            onChangeData({
              ...dataList,
              warnningData: [{ tipDom: '.warnningDiv', warnningText: _l('验证码错误') }],
            });
          } else {
            onChangeData({
              ...dataList,
              warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码发送失败'), isError: true }],
            });
            if (data.actionResult == ActionResult.balanceIsInsufficient) {
              alert(_l('当前企业账户余额不足，无法发送短信/邮件'), 2);
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
    const { onChangeData } = this.props;
    let seconds = 60;
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
          onChangeData({
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
          onChangeData({
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

  handleKeyPress = event => {
    const isCapsLockOn = event.getModifierState('CapsLock');
    const key = event.key;
    if (key.length === 1 && key.match(/[a-z]/i)) {
      this.setState({
        // isCapsLock: isCapsLockOn,
        isUpperCase: isCapsLockOn || key === key.toUpperCase(),
      });
    }
  };

  render() {
    const { type = 'register', dataList = {}, onChangeData, nextHtml, maxLength, keys = [] } = this.props;
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', warnningData = [], onlyRead } = dataList;
    let { isMobile, verifyCodeText, verifyCodeLoading, focusDiv, hasCheck, isUpperCase, isOpen } = this.state;
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
          {(keys.includes('emailOrTel') || keys.includes('tel') || keys.includes('email')) && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, [this.mobile, '#txtMobilePhone'], focusDiv, emailOrTel),
              })}
            >
              <input
                type="text"
                id="txtMobilePhone"
                className={cx({ onlyRead: onlyRead })}
                disabled={onlyRead ? 'disabled' : ''}
                ref={mobile => (this.mobile = mobile)}
                onBlur={e => {
                  e.persist();
                  setTimeout(() => {
                    this.inputOnBlur(e);
                  }, 500);
                }}
                onFocus={this.inputOnFocus}
                placeholder={str}
                onPaste={e => {
                  let value = this.getEmailOrTel(e.target.value);
                  onChangeData(
                    {
                      ...dataList,
                      emailOrTel: value,
                      dialCode: keys.includes('email')
                        ? ''
                        : this.getDialCode(value.indexOf('@') < 0 && !isNaN(value.replace(/\s*/g, ''))),
                    },
                    () => {
                      this.eventItiFn(this.props);
                      $(this.mobile).focus();
                    },
                  );
                }}
                onChange={e => {
                  let data = _.filter(
                    dataList.warnningData,
                    it => !(it.tipDom === this.mobile || '#txtMobilePhone' === it.tipDom),
                  );
                  let value = this.getEmailOrTel(e.target.value);
                  onChangeData(
                    {
                      ...dataList,
                      warnningData: data,
                      emailOrTel: value,
                      dialCode: keys.includes('email')
                        ? ''
                        : this.getDialCode(value.indexOf('@') < 0 && !isNaN(value.replace(/\s*/g, ''))),
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
                {['register'].includes(type) || keys.includes('tel')
                  ? _l('手机号')
                  : keys.includes('email')
                  ? _l('邮箱')
                  : _l('手机号或邮箱')}
              </div>
              {warnningTipFn(warnningData, [this.mobile, '#txtMobilePhone'], focusDiv)}
            </div>
          )}
          {keys.includes('fullName') && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, [this.fullName, '#fullName'], focusDiv, fullName),
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
                  onChangeData({
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
                ...setWarnningData(warnningData, ['.txtLoginCode', this.code], focusDiv, verifyCode),
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
                  onChangeData({
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
              {warnningTipFn(warnningData, ['.txtLoginCode', this.code], focusDiv)}
            </div>
          )}
          {(keys.includes('password') || keys.includes('setPassword')) && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, ['.passwordIcon', this.password], focusDiv, password),
              })}
            >
              <input
                type={keys.includes('setPassword') && isOpen ? 'text' : 'password'}
                className="passwordIcon"
                placeholder={password}
                ref={password => (this.password = password)}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                onChange={e => {
                  let data = _.filter(dataList.warnningData, it => it.tipDom !== this.password);
                  if (keys.includes('setPassword')) {
                    //设置密码时，提示密码规则
                    data = [
                      {
                        tipDom: this.password,
                        noErr: true,
                        warnningText:
                          this.state.passwordRegexTip ||
                          `${_l('·密码长度为8-20 字符')}<br/>${_l('·需包含字母和数字,区分大小写')}`,
                      },
                    ];
                  }
                  onChangeData({
                    ...dataList,
                    warnningData: data,
                    password: e.target.value.trim(),
                  });
                  if (keys.includes('setPassword')) {
                    this.inputOnFocus(e);
                  }
                }}
                value={password}
                autocomplete={
                  //keys.includes('password') ? 'account-password' :
                  'new-password'
                } //密码不自动填充
                onKeyPress={this.handleKeyPress}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.password).focus();
                }}
              >
                {keys.includes('setPassword') ? _l('新密码') : _l('密码')}
              </div>
              {isUpperCase && keys.includes('password') && (
                <span className="isUpperCase">
                  <Tooltip text={<span>{_l('大写锁定已打开')}</span>} action={['hover']} popupPlacement={'right'}>
                    <Icon type="up" />
                  </Tooltip>
                </span>
              )}
              {keys.includes('setPassword') && (
                <span className="isUpperCase Hand" onClick={() => this.setState({ isOpen: !isOpen })}>
                  <Icon type={!isOpen ? 'eye_off' : 'eye'} />
                </span>
              )}
              {warnningTipFn(warnningData, ['.passwordIcon', this.password], focusDiv)}
            </div>
          )}
          {keys.includes('privacy') && (
            <div
              className={cx('termsText Gray_75 privacyText mesDiv', {
                ...setWarnningData(warnningData, [this.privacy], focusDiv, hasCheck),
              })}
              onClick={e => {
                if (!!warnningData[0] && (warnningData.length <= 1 || !$(focusDiv).is($(warnningData[0].tipDom)))) {
                  this.inputOnFocus(e);
                } else {
                  this.inputOnBlur(e);
                }
              }}
              ref={ref => (this.privacy = ref)}
            >
              <span
                className="flexRow alignItemsCenter Hand"
                onClick={() => {
                  if (!hasCheck) {
                    let data = _.filter(dataList.warnningData, it => it.tipDom !== this.privacy);
                    onChangeData({
                      ...dataList,
                      warnningData: data,
                    });
                  }
                  this.setState({
                    hasCheck: !hasCheck,
                  });
                }}
              >
                <Checkbox checked={hasCheck} className="InlineBlock" />
                {_l('同意')}
                <a target="_blank" className="terms Hand" href="/terms">
                  {_l('《使用条款》%14000')}
                </a>
                {_l('和')}
                <a target="_blank" className="terms Hand" href="/privacy">
                  {_l('《隐私条款》')}
                </a>
              </span>
              {warnningTipFn(warnningData, [this.privacy], focusDiv)}
            </div>
          )}
        </div>
        {nextHtml(this.isValid)}
      </React.Fragment>
    );
  }
}

export default Message;
