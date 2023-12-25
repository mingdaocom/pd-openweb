import React from 'react';
import ReactDOM from 'react-dom';
import ChangeLang from 'src/components/ChangeLang';
import './login.less';
import Message from './components/message';
import RegisterController from 'src/api/register';
import Config from './config';
import { encrypt } from 'src/util';
import { getRequest } from 'src/util';
let request = getRequest();
import { hasCaptcha } from './util';
import preall from 'src/common/preall';
import { browserIsMobile } from 'src/util';
import MatchApp from './matchApp';
import captcha from 'src/components/captcha';

class FindPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDisabled: false,
      projectId: request.projectId,
      loginData: {
        warnningData: [],
        emailOrTel: '', // 邮箱或手机
        verifyCode: '', // 验证码
        password: '', // 8-20位，需包含字母和数字
        dialCode: '',
      },
    };
  }

  componentDidMount() {
    $('html').addClass('loginContainerCon');
    document.title = _l('找回密码');
    document.addEventListener('keypress', this.handleEnterKey);
  }
  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
    $('html').removeClass('loginContainerCon');
  }
  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      $('.btnForLogin').click();
    }
  };
  submitAccountVerify = () => {
    const { loginData = {} } = this.state;
    const { emailOrTel, password, verifyCode, dialCode } = loginData;
    const _this = this;
    const cb = function (res) {
      if (res.ret !== 0) {
        _this.setState({
          loginDisabled: false,
        });
        return;
      }
      RegisterController.updatePassword({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        verifyCode: verifyCode,
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
      }).then(data => {
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        if (data) {
          _this.setState({
            loginDisabled: false,
          });
          let actionResult = Config.ActionResult;
          if (data.actionResult == actionResult.success) {
            alert(_l('密码重置成功！'), '1', 3000, () => {
              if (!browserIsMobile()) {
                window.location.href = '/login';
              } else {
                MatchApp.init();
              }
            });
          } else {
            if (data.accountResult === actionResult.userInfoNotFound) {
              _this.setState({
                loginData: {
                  ..._this.state.loginData,
                  warnningData: [
                    {
                      tipDom: '#txtMobilePhone',
                      warnningText: _l('账号未注册'),
                    },
                  ],
                },
              });
              return;
            }
            if (data.actionResult == actionResult.failInvalidVerifyCode) {
              _this.setState({
                loginData: {
                  ..._this.state.loginData,
                  warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误'), isError: true }],
                },
              });
            } else if (data.actionResult == actionResult.noEfficacyVerifyCode) {
              let str = _l('验证码已经失效，请重新发送');
              _this.setState({
                loginData: {
                  ..._this.state.loginData,
                  warnningData: [{ tipDom: '.txtLoginCode', warnningText: str, isError: true }],
                },
              });
              alert(str, 3);
            } else if (data.actionResult == actionResult.userInfoNotFound) {
              _this.setState({
                loginData: {
                  ..._this.state.loginData,
                  warnningData: [{ tipDom: '#txtMobilePhone', warnningText: _l('账号不存在') }],
                },
              });
            } else if (data.actionResult == actionResult.samePassword) {
              return alert('新密码不可与旧密码一样', 3);
            } else if (data.actionResult === actionResult.accountFrequentLoginError) {
              //需要前端图形验证码
              captchaFuc();
            } else if (data.actionResult === actionResult.fieldRequired) {
              //前端图形验证码校验失败
              return alert('图形验证码校验失败', 3);
            } else {
              let msg = '';
              msg = _l('操作失败');
              alert(msg, 3);
            }
          }
        }
      });
    };
    const onCancel = isOk => {
      if (isOk) return;
      _this.setState({
        loginDisabled: false,
      });
    };
    const captchaFuc = () => {
      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(cb, onCancel);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb).show();
      }
    };
    // 前3次关闭图像验证
    cb({ ret: 0 });
  };

  renderCon = () => {
    const { loginDisabled } = this.state;
    const isMingdaoApp = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
    return (
      <React.Fragment>
        <div className="titleHeader">
          <div className="title mTop40">
            {_l('重置密码')}
            {/* <span></span> */}
          </div>
        </div>
        <Message
          type="findPassword"
          keys={['emailOrTel', 'code', 'setPassword']}
          maxLength="6"
          dataList={this.state.loginData}
          onChangeData={(data, callback) => {
            this.setState(
              {
                loginData: {
                  ...data,
                },
              },
              () => {
                if (callback) {
                  callback();
                }
              },
            );
          }}
          nextHtml={isValid => {
            return (
              <React.Fragment>
                {loginDisabled && <div className="loadingLine"></div>}
                <span
                  className="btnForLogin Hand"
                  onClick={() => {
                    if (loginDisabled) {
                      return;
                    }
                    let callback = () => {
                      this.setState(
                        {
                          loginDisabled: true,
                        },
                        () => {
                          this.submitAccountVerify();
                        },
                      );
                    };
                    if (isValid()) {
                      callback();
                    }
                  }}
                >
                  {_l('确认')}
                </span>
              </React.Fragment>
            );
          }}
        />
        {!isMingdaoApp ? (
          <React.Fragment>
            <span className="line" style={{ marginTop: '125px' }}></span>
            <span
              className="btnUseOldAccount Hand"
              onClick={() => {
                let request = getRequest();
                let returnUrl = request.ReturnUrl;

                if (returnUrl) {
                  location.href = '/login?ReturnUrl=' + encodeURIComponent(returnUrl);
                } else {
                  location.href = '/login';
                }
              }}
            >
              {_l('返回登录页面')}
            </span>
          </React.Fragment>
        ) : (
          <div style={{ marginTop: '125px' }}></div>
        )}
      </React.Fragment>
    );
  };

  render() {
    const { SysSettings } = md.global;
    return (
      <div className="loginBox">
        <div className="loginContainer">
          {!SysSettings.hideBrandLogo && (
            <div className="titleHeader">
              <img src={SysSettings.brandLogoUrl} height={SysSettings.brandLogoHeight || 40} />
            </div>
          )}
          {this.renderCon()}
        </div>
        <ChangeLang />
      </div>
    );
  }
}

const WrappedComp = preall(FindPassword, { allownotlogin: true });

ReactDOM.render(<WrappedComp />, document.querySelector('#app'));
