import React from 'react';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import RegisterController from 'src/api/register';
import ChangeLang from 'src/components/ChangeLang';
import WrapBg from 'src/pages/AuthService/components/Bg.jsx';
import Footer from 'src/pages/AuthService/components/Footer.jsx';
import 'src/pages/AuthService/components/form.less';
import Header from 'src/pages/AuthService/components/Header.jsx';
import { ActionResult } from 'src/pages/AuthService/config.js';
import { Wrap } from 'src/pages/AuthService/login/style.jsx';
import { WrapCom } from 'src/pages/AuthService/style.jsx';
import { getAccountTypes, hasCaptcha } from 'src/pages/AuthService/util.js';
import { validation } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { encrypt } from 'src/utils/common';
import From from './Form';

const keys = [getAccountTypes(true), 'code', 'setPassword'];
export default class FindPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDisabled: false,
      loading: false,
      warnList: [],
      focusDiv: '',
      emailOrTel: '',
      password: '',
      verifyCode: '',
      dialCode: '',
      verifyCodeLoading: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keypress', this.handleEnterKey);
  }

  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
  }

  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      this.onBtn();
    }
  };

  updateWarn = data => this.setState({ warnList: data });

  submitAccountVerify = () => {
    const { emailOrTel, password, verifyCode, dialCode } = this.state;
    const _this = this;
    const cb = function (res) {
      if (res.ret !== 0) {
        _this.setState({ loginDisabled: false });
        return;
      }
      RegisterController.updatePassword({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        verifyCode: verifyCode,
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.global.getCaptchaType(),
      }).then(data => {
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        if (data) {
          _this.setState({
            loginDisabled: false,
          });
          let actionResult = ActionResult;
          if (data.actionResult == actionResult.success) {
            alert(_l('密码重置成功！'), '1', 3000, () => {
              _this.updateWarn([]);
              navigateTo('/login');
            });
          } else {
            if (data.accountResult === actionResult.userInfoNotFound) {
              _this.updateWarn([
                {
                  tipDom: 'inputAccount',
                  warnTxt: _l('账号未注册'),
                },
              ]);
              return;
            }
            if (data.actionResult == actionResult.failInvalidVerifyCode) {
              _this.updateWarn([{ tipDom: 'inputCode', warnTxt: _l('验证码错误'), isError: true }]);
            } else if (data.actionResult == actionResult.noEfficacyVerifyCode) {
              let str = _l('验证码已经失效，请重新发送');
              _this.updateWarn([{ tipDom: 'inputCode', warnTxt: str, isError: true }]);
              alert(str, 3);
            } else if (data.actionResult == actionResult.userInfoNotFound) {
              _this.updateWarn([{ tipDom: 'inputAccount', warnTxt: _l('账号不存在') }]);
            } else if (data.actionResult == actionResult.samePassword) {
              return alert('新密码不可与旧密码一样', 3);
            } else if (data.actionResult === actionResult.accountFrequentLoginError) {
              //需要前端图形验证码
              new captcha(cb, isOk => {
                if (isOk) return;
                _this.setState({
                  loginDisabled: false,
                });
              });
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

    // 前3次关闭图像验证
    cb({ ret: 0 });
  };

  onBtn = async () => {
    if (this.state.loginDisabled) {
      return;
    }

    const validationData = validation({
      isForSendCode: false,
      keys,
      type: 'findPassword',
      info: _.pick(this.state, ['emailOrTel', 'verifyCode', 'password', 'dialCode']),
    });
    this.setState({ warnList: validationData.warnList });
    let isV = await validationData.isRight;
    if (isV) {
      this.setState(
        {
          loginDisabled: true,
        },
        () => {
          this.submitAccountVerify();
        },
      );
    }
  };

  renderCon = () => {
    const { loginDisabled, loading } = this.state;
    if (loading) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    }
    return (
      <React.Fragment>
        <div className="titleHeader">
          <div className="title mTop40 Bold">{_l('重置密码')}</div>
        </div>
        <From {...this.state} onChange={data => this.setState(data)} keys={keys} type="findPassword" />
        <React.Fragment>
          {loginDisabled && <div className="loadingLine"></div>}
          <span
            className="btnForLogin Hand"
            onClick={() => {
              this.onBtn();
            }}
          >
            {_l('确认')}
          </span>
        </React.Fragment>
        {!isMingDaoApp ? (
          <React.Fragment>
            <div className="flexRow alignItemsCenter justifyContentCenter footerCon" style={{ marginTop: '125px' }}>
              <span
                className="changeBtn Hand TxtRight"
                onClick={() => {
                  let request = getRequest();
                  let returnUrl = request.ReturnUrl;
                  this.updateWarn([]);
                  if (returnUrl) {
                    navigateTo('/login?ReturnUrl=' + encodeURIComponent(returnUrl));
                  } else {
                    navigateTo('/login');
                  }
                }}
              >
                {_l('返回登录页面')}
              </span>
              <span className="lineCenter mLeft24"></span>
              <div className="mLeft16 TxtLeft">
                <ChangeLang className="justifyContentLeft" />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div style={{ marginTop: '125px' }}></div>
        )}
      </React.Fragment>
    );
  };

  render() {
    return (
      <WrapCom>
        <DocumentTitle title={_l('找回密码')} />
        <WrapBg />
        <div className="loginBox">
          <div className="loginContainer">
            <Header />
            <Wrap>{this.renderCon()}</Wrap>
          </div>
        </div>
        {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
      </WrapCom>
    );
  }
}
