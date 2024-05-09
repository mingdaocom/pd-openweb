import React, { Fragment, Component } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import { Dialog, VerifyPasswordInput } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import accountController from 'src/api/account';
import { captcha } from 'ming-ui/functions';
import RegExp from 'src/util/expression';
import { verifyPassword } from 'src/util';
import styled from 'styled-components';

const InputCom = styled.input`
  width: 100%;
  line-height: 38px;
  height: 38px;
  background-color: #f5f5f5;
  border-radius: 3px;
  padding-left: 10px;
  border: 0px;
  padding-right: 40px;
  box-sizing: border-box;
`;

const MobileInputWrap = styled.div`
  margin-bottom: 20px;
  .iti {
    width: 100%;
  }
`;

const StepLine = styled.div`
  .stepName {
    justify-content: space-between;
  }
  .stepline {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background-color: ${({ step }) => (step === 1 ? ' #ececec' : '#1e88e5')};
    position: relative;
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      position: absolute;
      top: -4px;
      border: ${({ step }) => (step === 1 ? '2px solid #ececec' : '2px solid #1e88e5')};
      background-color: ${({ step }) => (step === 1 ? ' #ececec' : '#1e88e5')};
    }
    &:first-child {
      margin-left: 8px;
      background-color: #1e88e5;
      .dot {
        left: 15px;
        border: 2px solid #1e88e5;
        background-color: #1e88e5;
      }
    }
    &:nth-child(2) {
      margin-right: 8px;
      .dot {
        right: 15px;
      }
    }
  }
`;

let timer = null;

export default class ValidateInfoCon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      email: '',
      verifyCode: '', // 验证码
      nextBtnDisabled: '',
      sendCodeLoading: '',
      sendCodeTxt: _l('发送验证码'),
      step: 1,
      submitLoading: false,
    };
    this.iti = null;
  }
  componentDidMount() {}

  changeValue = (e, filed) => {
    let val = e.target.value;
    this.setState({ [filed]: val.trim() });
  };

  clickNext = () => {
    this.setState({ nextBtnDisabled: true });

    const { showStep, callback = () => {}, onCancel = () => {} } = this.props;
    const { password } = this.state;

    verifyPassword({
      checkNeedAuth: false,
      ignoreAlert: false,
      customActionName: 'checkAccount',
      password,
      success: () => {
        this.setState({ nextBtnDisabled: false });
        if (showStep) {
          this.setState({ step: 2 }, () => {
            setTimeout(() => {
              this.initTel();
            }, 200);
          });
        } else {
          callback({ password });
          onCancel();
        }
      },
      fail: () => {
        this.setState({ nextBtnDisabled: false });
      },
    });
  };

  initTel = () => {
    if (!this.mobile) return;

    this.iti && this.iti.destroy();

    this.iti = intlTelInput(this.mobile, {
      loadUtils: '',
      initialCountry: _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn',
      preferredCountries: _.get(md, 'global.Config.DefaultConfig.preferredCountries') || ['cn'],
      utilsScript: utils,
      separateDialCode: true,
      showSelectedDialCode: true,
    });
  };

  validate = () => {
    const { email } = this.state;
    const { type } = this.props;

    if (type === 'email') {
      if (!email) {
        alert(_l('请输入邮箱'), 3);
        this.email.focus();
        return;
      }
      if (!RegExp.isEmail(email)) {
        alert(_l('请输入正确的邮箱'), 3);
        this.email.focus();
        return;
      }
    } else {
      let mobilePhone = this.iti.isValidNumber();
      if (!mobilePhone) {
        alert(_l('请输入正确的手机号码'), 3);
        this.mobile.focus();
        return;
      }
    }
    return true;
  };

  // 发送更新帐号验证码到手机或邮箱
  sendChangeAccountVerifyCode = () => {
    if (!this.validate()) return;

    const { type } = this.props;
    const { email } = this.state;
    const _this = this;

    var callback = function (res) {
      if (res.ret !== 0) {
        return;
      }

      _this.setState({ sendCodeLoading: true, sendCodeTxt: _l('发送中...') });

      accountController
        .sendVerifyCode({
          account: type === 'email' ? email : _this.iti.getNumber(),
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        })
        .then(data => {
          if (data === 1) {
            alert(_l('验证码发送成功'), 1);
            _this.countdown();
          } else {
            const accountTypeDesc = type === 'email' ? _l('邮箱') : _l('手机号');
            if (data === 2) {
              alert(_l('发送失败，新%0与现有%1一致', accountTypeDesc, accountTypeDesc), 2);
            } else if (data === 8) {
              alert(_l('验证码错误'), 3);
            } else if (data === 9) {
              alert(_l('此%0已被其它帐号绑定', accountTypeDesc), 2);
            } else {
              alert(_l('验证码发送失败'), 2);
            }
            _this.setState({ sendCodeLoading: false, sendCodeTxt: _l('获取验证码') });
          }
        });
    };
    if (md.global.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
  };

  // 验证码倒计时
  countdown = () => {
    let seconds = 30;
    timer = setInterval(() => {
      if (seconds <= 0) {
        this.setState({ sendCodeLoading: false, sendCodeTxt: _l('重新发送验证码') });
        clearInterval(timer);
      } else {
        this.setState({ sendCodeTxt: _l('%0秒后重新发送', seconds) });
        seconds--;
      }
    }, 1000);
  };

  // 更新绑定帐号
  updateAccount = () => {
    if (!this.validate()) return;

    const { type, callback = () => {} } = this.props;
    const { verifyCode, email } = this.state;

    if (!verifyCode) {
      alert(_l('请输入验证码'), 3);
      this.verifyCode.focus();
      return;
    }

    this.setState({ submitLoading: true });

    accountController
      .editAccount({
        account: type === 'email' ? email : this.iti.getNumber(),
        verifyCode,
      })
      .then(data => {
        if (data === 1) {
          let accountTypeDesc = type === 'email' ? _l('邮箱') : _l('手机号');
          alert(_l('%0修改绑定成功', accountTypeDesc), 1);
          // 删除自动登录
          window.localStorage.removeItem('LoginCheckList');
          // 修改cookie
          let loginName = window.localStorage.getItem('LoginName');
          if (
            loginName &&
            ((RegExp.isEmail(loginName) && type === 'email') || (!RegExp.isEmail(loginName) && type !== 'email'))
          ) {
            safeLocalStorageSetItem('LoginName', type === 'email' ? email : this.iti.getNumber());
          }
          setTimeout(function () {
            callback();
          }, 2000);
        } else if (data === 8) {
          alert(_l('验证码错误'), 2);
        } else if (data === 2) {
          alert(_l('修改的账号与原来相同'), 3);
        } else {
          alert(_l('%0修改失败', accountTypeDesc), 2);
        }
      });
  };

  render() {
    const { title, des, showStep, type, onCancel = () => {} } = this.props;
    const { nextBtnDisabled, sendCodeLoading, step, sendCodeTxt } = this.state;

    return (
      <Dialog title={title} visible onCancel={onCancel} showFooter={false}>
        {des && <div className="Gray_9 Font13 mBottom5">{des}</div>}
        {showStep && (
          <StepLine step={step}>
            <div className="stepName flexRow mBottom15">
              <div>{_l('验证身份')}</div>
              <div>{type === 'email' ? _l('验证邮箱地址') : _l('验证新手机号码')}</div>
            </div>
            <div className="flexRow mBottom20">
              <div className="flex stepline">
                <div className="dot"></div>
              </div>
              <div className="flex stepline">
                <div className="dot"></div>
              </div>
            </div>
          </StepLine>
        )}
        {step === 2 ? (
          <Fragment>
            {type == 'email' ? (
              <MobileInputWrap>
                <InputCom
                  type="text"
                  ref={ele => (this.email = ele)}
                  placeholder={_l('请输入邮箱地址')}
                  className="inputBox txtEmail w100"
                  maxlength={64}
                  onChange={e => this.changeValue(e, 'email')}
                />
              </MobileInputWrap>
            ) : (
              <MobileInputWrap>
                <InputCom
                  type="text"
                  ref={ele => (this.mobile = ele)}
                  placeholder={_l('请输入手机号')}
                  className="inputBox txtMobilePhone w100 box-sizing"
                  maxlength={64}
                />
              </MobileInputWrap>
            )}
            <div className="flexRow mBottom20">
              <InputCom
                type="text"
                ref={ele => (this.verifyCode = ele)}
                placeholder={_l('请输入验证码')}
                className="mRight15 inputBox txtVerifyCode flex"
                maxlength={6}
                onChange={e => this.changeValue(e, 'verifyCode')}
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    this.sendChangeAccountVerifyCode();
                  }
                }}
              />
              <button
                disabled={sendCodeLoading}
                className="Button ming Button--primary Button--medium pLeft0 pRight0"
                style={{ minWidth: 120 }}
                onClick={this.sendChangeAccountVerifyCode}
              >
                {sendCodeTxt}
              </button>
            </div>
            <button
              className="Button ming Button--primary Button--medium btnUpdateAccount w100"
              onClick={this.updateAccount}
            >
              {_l('确认')}
            </button>
          </Fragment>
        ) : (
          <Fragment>
            <VerifyPasswordInput
              showAccountEmail={type === 'email'}
              className="mBottom10"
              showSubTitle={false}
              onChange={({ password }) => this.setState({ password })}
            />
            <button
              type="button"
              className="btnUnBind ming Button Button--primary Button--medium w100 Font14 mBottom20"
              disabled={nextBtnDisabled}
              onClick={this.clickNext}
            >
              {_l('下一步')}
            </button>
          </Fragment>
        )}
      </Dialog>
    );
  }
}

export const validateFunc = props => FunctionWrap(ValidateInfoCon, props);
