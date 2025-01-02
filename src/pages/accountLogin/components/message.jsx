import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/accountLogin/redux/actions.js';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import cx from 'classnames';
import './message.less';
import { ActionResult, SupportFindVerifyCodeUrl, CodeTypeEnum } from 'src/pages/accountLogin/config.js';
import RegisterController from 'src/api/register';
import { captcha } from 'ming-ui/functions';
import {
  warnningTipFn,
  setWarnningData,
  getEmailOrTel,
  getDialCode,
  toMDApp,
  getDefaultCountry,
  isTel,
} from 'src/pages/accountLogin/util.js';
import _ from 'lodash';
import { encrypt } from 'src/util';
import Icon from 'ming-ui/components/Icon';
import RegExpValidator from 'src/util/expression';

let sendVerifyCodeTimer = null;
let hasClick = false;
// keys =>
// 'emailOrTel','tel','email' //手机号 或 邮箱
// 'fullName' //验证用户名
// 'code'  //验证码
// 'password','setPassword' //密码
const mapStateToProps = ({ accountInfo, warnningData }) => ({
  dataList: accountInfo,
  warnningData,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);
@connect(mapStateToProps, mapDispatchToProps)
class MessageCon extends React.Component {
  constructor(props) {
    super(props);
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    this.state = {
      firstSendVerifyCode: true,
      verifyCodeText: '',
      verifyCodeLoading: false, // 已发送并在60内true
      passwordRegexTip,
      passwordRegex,
      isOpen: false,
      showIti: false,
    };
  }
  componentDidMount() {
    const { keys = [] } = this.props;
    if (keys.includes('emailOrTel') || keys.includes('tel')) {
      this.renderItiInput();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { keys = [] } = nextProps;
    if (!hasClick && (keys.includes('emailOrTel') || keys.includes('tel')) && _.get(nextProps, 'dataList.emailOrTel')) {
      $(this.mobileInput).focus();
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
      if (!window.initIntlTelInput || !$('.iti__country-container').length) {
        this.renderItiInput();
      }
      if (_.get(this.props, 'dataList.emailOrTel') !== _.get(nextProps, 'dataList.emailOrTel') && this.mobile) {
        this.eventItiFn(nextProps);
      }
    }
    let str = getEmailOrTel(_.get(nextProps, 'dataList.emailOrTel'));
    if (this.mobileInput && str !== this.mobileInput.value && !!_.get(nextProps, 'dataList.emailOrTel')) {
      this.mobileInput.value = str || '';
      this.mobile.value = str || '';
    }
  }

  componentWillUnmount() {
    window.initIntlTelInput = null;
    clearInterval(sendVerifyCodeTimer);
    sendVerifyCodeTimer = null;
  }

  inputOnFocus = (e, focusDiv) => {
    e.persist();
    this.props.setData({ focusDiv });
  };

  inputOnBlur = e => {
    e.persist();
    this.props.setData({ focusDiv: '' });
  };

  itiShowFn = () => {
    this.setState({
      showIti: true,
    });
  };

  itiHideFn = () => {
    this.setState({
      showIti: false,
    });
  };

  setInputValue = props => {
    const { dataList = {}, setData } = props;
    const { emailOrTel = '' } = dataList;
    if (window.initIntlTelInput) {
      if (isTel(emailOrTel)) {
        window.initIntlTelInput.setNumber(emailOrTel || '');
        setData({
          emailOrTel: getEmailOrTel(emailOrTel),
          dialCode: getDialCode(),
        });
        this.itiShowFn();
      } else {
        setData({
          emailOrTel: getEmailOrTel(emailOrTel),
          dialCode: '',
        });
        this.itiHideFn();
      }
    }
  };

  onChangeAccount = e => {
    const { keys, warnningData, setData, updateWarn } = this.props;
    let data = _.filter(warnningData, it => ![this.mobileInput, '#txtMobilePhone'].includes(it.tipDom));
    let value = getEmailOrTel(e.target.value);
    setData({
      focusDiv: '#txtMobilePhone',
      emailOrTel: value,
      dialCode: keys.includes('email') ? '' : getDialCode(value.indexOf('@') < 0 && !isNaN(value.replace(/\s*/g, ''))),
    });
    updateWarn(data);
    this.eventItiFn(this.props);
    $(this.mobileInput).focus();
  };

  renderItiInput = () => {
    const { dataList = {} } = this.props;
    let { emailOrTel = '' } = dataList;
    if (this.mobile) {
      window.initIntlTelInput = null;
      window.initIntlTelInput = intlTelInput(this.mobile, {
        i18n: {
          searchPlaceholder: _l('搜索'),
        },
        customPlaceholder: () => {
          return emailOrTel;
        },
        autoPlaceholder: 'off',
        initialCountry: getDefaultCountry(),
        preferredCountries: _.get(md, 'global.Config.DefaultConfig.preferredCountries') || [getDefaultCountry()],
        loadUtils: '',
        utilsScript: utils,
        separateDialCode: false,
        showSelectedDialCode: true,
      });
      const initFn = () => {
        this.setInputValue(this.props);
        this.eventItiFn(this.props);
      };
      initFn();
      $(this.mobile).on('close:countrydropdown keyup', e => {
        initFn();
        safeLocalStorageSetItem('DefaultCountry', window.initIntlTelInput.getSelectedCountryData().iso2);
      });
    }
  };

  eventItiFn = props => {
    const { dataList = {}, keys = [] } = props;
    const { emailOrTel = '' } = dataList;
    if (emailOrTel.indexOf('+') >= 0 && window.initIntlTelInput) {
      window.initIntlTelInput.setNumber(emailOrTel || '');
    }
    if (keys.includes('tel')) {
      if (isTel(emailOrTel)) {
        this.itiShowFn();
      } else {
        this.itiHideFn();
      }
    } else {
      if (isTel(emailOrTel) && !keys.includes('email')) {
        this.itiShowFn();
      } else {
        this.itiHideFn();
      }
    }
  };

  // 获取验证码
  handleSendVerifyCode = async codeType => {
    let isValid = await this.props.isValid(true, this.props.keys, this.props.type);
    if (isValid) {
      const { dataList = {}, type, sendVerifyCode, appId, updateWarn } = this.props;
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
        const account = (isTel(emailOrTel) ? dialCode : '') + emailOrTel;
        let param = {
          account: encrypt(account),
          verifyCodeType: codeType,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
          lang: getCurrentLangCode(),
        };
        let thenFn = data => {
          if (data.actionResult == ActionResult.success) {
            updateWarn([
              {
                tipDom: '.warnningDiv',
                warnningText: _l('验证码发送成功'),
              },
            ]);
            this.countDown();
          } else if (data.actionResult == ActionResult.userAccountExists) {
            updateWarn([
              {
                tipDom: this.mobileInput,
                warnningText: _l('账号已注册'),
                onClick: () => {
                  toMDApp(dataList);
                },
              },
            ]);
          } else if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
            updateWarn([
              {
                tipDom: '.warnningDiv',
                warnningText: _l(
                  '验证码发送过于频繁',
                ),
              },
            ]);
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            if (type === 'findPassword') {
              updateWarn([
                {
                  tipDom: '#txtMobilePhone',
                  warnningText: _l('账号未注册'),
                },
              ]);
            } else {
              updateWarn([{ tipDom: '.warnningDiv', warnningText: _l('账号不正确') }]);
            }
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            updateWarn([{ tipDom: '.warnningDiv', warnningText: _l('验证码错误') }]);
          } else {
            updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码发送失败'), isError: true }]);
            if (data.actionResult === ActionResult.accoutRegisterClosed && type === 'portalLogin') {
              alert(_l('当前门户不在设置的注册时间范围内，暂不支持注册'), 3);
            }
            if (data.actionResult == ActionResult.balanceIsInsufficient) {
              alert(_l('当前企业账户余额不足，无法发送短信/邮件'), 2);
            }
            // 非第一次
            if (codeType == CodeTypeEnum.message) {
              this.setState({
                firstSendVerifyCode: false,
              });
            }
          }

          if (data.actionResult != ActionResult.success) {
            if (codeType == CodeTypeEnum.message) {
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

      if (md.global.getCaptchaType() === 1) {
        new captcha(callback);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback, { needFeedBack: false }).show();
      }
    }
  };

  countDown = () => {
    const { updateWarn } = this.props;
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
          updateWarn([
            {
              tipDom: '.warnningDiv',
              warnningText: 'txt',
            },
          ]);
        }
        clearInterval(sendVerifyCodeTimer);
        sendVerifyCodeTimer = null;
      } else {
        if (seconds < 22 && !hasWarn) {
          // 8秒后提示收不到验证码的帮助
          updateWarn([
            {
              tipDom: '.warnningDiv',
              warnningText: _l(
                '验证码发送成功',
              ),
            },
          ]);
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
    const {
      type = 'register',
      dataList = {},
      maxLength,
      keys = [],
      canChangeEmailOrTel,
      onChangeEmailOrTel,
      warnningData = [],
      updateWarn,
      setData,
    } = this.props;
    const { emailOrTel = '', verifyCode = '', password = '', fullName = '', onlyRead, focusDiv } = dataList;
    let { verifyCodeText, verifyCodeLoading, isOpen, showIti } = this.state;
    let warnningDiv = _.find(warnningData, it => it.tipDom === '.warnningDiv');
    let autoCompleteData = {
      autoComplete: type !== 'login' ? 'new-password' : 'on',
    };
    const passwordOnWran = (txt, changeWarn) => {
      if (keys.includes('setPassword') || (changeWarn && keys.includes('password'))) {
        let data = _.filter(warnningData, it => !('.passwordIcon' === it.tipDom));
        //设置密码时，提示密码规则 符合验证则不再提示
        if (!RegExpValidator.isPasswordValid(txt) && keys.includes('setPassword')) {
          data = data.concat({
            tipDom: '.passwordIcon',
            noErr: true,
            warnningText:
              this.state.passwordRegexTip ||
              `${_l('· 密码长度为8-20 字符')}<br/>${_l('· 需包含字母和数字，区分大小写')}`,
          });
        }
        updateWarn(data);
      }
    };
    return (
      <React.Fragment>
        <div className="messageBox mTop24">
          {warnningDiv ? (
            warnningDiv.warnningText === 'txt' ? (
              <div
                className={cx('warnningDiv', {
                  warnningRed: warnningDiv.isError,
                  warnningGreen: !warnningDiv.isError,
                })}
              >
                {_l('收不到验证码？')}
                {(keys.includes('emailOrTel') || keys.includes('tel')) &&
                isTel(emailOrTel) &&
                type !== 'portalLogin' ? (
                  <React.Fragment>
                    {_l('重新获取')}
                  </React.Fragment>
                ) : (
                  _l('重新获取')
                )}
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
                ...setWarnningData(warnningData, [this.mobileInput, '#txtMobilePhone'], focusDiv, emailOrTel),
                showIti,
              })}
            >
              <input
                type="text"
                className="itiCon"
                tabIndex="-1"
                ref={mobile => (this.mobile = mobile)}
                disabled={onlyRead ? 'disabled' : ''}
              />
              <input
                type="text"
                id="txtMobilePhone"
                className={cx({ onlyRead: onlyRead, showIti })}
                disabled={onlyRead ? 'disabled' : ''}
                ref={mobile => (this.mobileInput = mobile)}
                onBlur={e => {
                  e.persist();
                  setTimeout(() => {
                    this.inputOnBlur(e);
                  }, 500);
                }}
                onFocus={e => this.inputOnFocus(e, '#txtMobilePhone')}
                onPaste={e => this.onChangeAccount(e)}
                onChange={e => this.onChangeAccount(e)}
                {...autoCompleteData}
              />
              {canChangeEmailOrTel && (
                <Icon
                  type="swap_horiz"
                  className="Gray_9e Hand ThemeHoverColor3 changeEmailOrTel Font20"
                  onClick={() => {
                    onChangeEmailOrTel();
                    setTimeout(() => {
                      this.renderItiInput();
                    }, 0);
                  }}
                />
              )}
              <div
                className="title"
                onClick={e => {
                  $(this.mobileInput).focus();
                }}
              >
                {keys.includes('tel') ? _l('手机号') : keys.includes('email') ? _l('邮箱') : _l('手机号或邮箱')}
              </div>
              {warnningTipFn(warnningData, [this.mobileInput, '#txtMobilePhone'], focusDiv)}
            </div>
          )}
          {keys.includes('fullName') && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, ['#fullName'], focusDiv, fullName),
              })}
            >
              <input
                type="text"
                id="fullName"
                value={fullName || ''}
                onBlur={this.inputOnBlur}
                onFocus={e => this.inputOnFocus(e, '#fullName')}
                placeholder={fullName || ''}
                onChange={e => {
                  let data = _.filter(warnningData, it => it.tipDom !== '#fullName');
                  setData({
                    fullName: e.target.value,
                    focusDiv: '#fullName',
                  });
                  updateWarn(data);
                }}
                {...autoCompleteData}
              />
              <div
                className="title"
                onClick={e => {
                  $('#fullName').focus();
                }}
              >
                {_l('用户名')}
              </div>
              {warnningTipFn(warnningData, ['#fullName'], focusDiv)}
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
                onFocus={e => this.inputOnFocus(e, '.txtLoginCode')}
                onChange={e => {
                  let data = _.filter(warnningData, it => it.tipDom !== '.txtLoginCode');
                  setData({
                    verifyCode: e.target.value.replace(/[^\d]/g, ''),
                    focusDiv: '.txtLoginCode',
                  });
                  updateWarn(data);
                }}
                autoComplete="off"
              />
              <input
                disabled={verifyCodeLoading}
                type="button"
                tabIndex="-1"
                className={cx('btn btnSendVerifyCode Right', {
                  btnDisabled: verifyCodeLoading,
                  btnEnabled: !verifyCodeLoading,
                })}
                id="btnSendVerifyCode"
                value={verifyCodeText || (verifyCodeLoading ? _l('发送中...') : _l('获取验证码'))}
                onClick={e => {
                  this.handleSendVerifyCode(CodeTypeEnum.message);
                }}
              />
              <input type="text" tabIndex="-1" className="Alpha0 inputHidden" />
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
                ...setWarnningData(warnningData, ['.passwordIcon'], focusDiv, password),
              })}
            >
              <input
                type={
                  (keys.includes('setPassword') && isOpen) || (keys.includes('setPassword') && !password)
                    ? 'text'
                    : 'password'
                }
                className="passwordIcon"
                onBlur={e => {
                  this.inputOnBlur(e);
                  let data = _.filter(warnningData, it => !('.passwordIcon' === it.tipDom && it.noErr));
                  updateWarn(data);
                }}
                onFocus={e => {
                  passwordOnWran(e.target.value.trim());
                  this.inputOnFocus(e, '.passwordIcon');
                }}
                onChange={e => {
                  passwordOnWran(e.target.value.trim(), true);
                  setData({
                    password: e.target.value.trim(),
                  });
                }}
                autoComplete={
                  //keys.includes('password') ? 'account-password' :
                  'new-password'
                } //密码不自动填充
              />
              <div
                className="title"
                onClick={e => {
                  $('.passwordIcon').focus();
                }}
              >
                {
                  //keys.includes('setPassword') ? _l('新密码%14001') :
                  _l('密码')
                }
              </div>
              {keys.includes('setPassword') && (
                <span className="passwordTip Hand" onClick={() => this.setState({ isOpen: !isOpen })}>
                  <Icon type={!isOpen ? 'eye_off' : 'eye'} />
                </span>
              )}
              {warnningTipFn(warnningData, ['.passwordIcon'], focusDiv)}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default MessageCon;
