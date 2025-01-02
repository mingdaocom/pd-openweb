import React from 'react';
import MessageCon from 'src/pages/accountLogin/components/message';
import loginController from 'src/api/login';
import { getRequest } from 'src/util';
import { captcha } from 'ming-ui/functions';
import { hasCaptcha, getAccountTypes, clickErrInput } from 'src/pages/accountLogin/util.js';
import { encrypt } from 'src/util';
import { removePssId } from 'src/util/pssId';
import { navigateTo } from 'src/router/navigateTo';
import { Checkbox } from 'ming-ui';

const request = getRequest();

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDisabled: false,
      version: Math.random().toString(),
    };
  }

  componentDidMount() {
    document.addEventListener('keypress', this.handleEnterKey);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.loginMode !== this.props.loginMode) {
      this.setState({
        version: Math.random().toString(),
      });
    }
    if (
      _.get(nextProps, 'warnningData') !== _.get(this.props, 'warnningData') &&
      (_.get(nextProps, 'warnningData') || []).length > 0
    ) {
      clickErrInput(_.get(nextProps, 'warnningData'), _.get(nextProps, 'focusDiv'));
    }
    if (_.get(nextProps, 'frequentLogin') !== _.get(this.props, 'frequentLogin') && _.get(nextProps, 'frequentLogin')) {
      this.setState(
        {
          loginDisabled: false,
        },
        () => {
          //呼出图形验证
          this.onBtnForLogin(true);
          this.props.setData({ frequentLogin: false });
        },
      );
    }
  }
  componentWillUmount() {
    document.removeEventListener('keypress', this.handleEnterKey);
  }

  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      this.onBtnForLogin();
    }
  };

  doLogin = res => {
    const { emailOrTel, password, fullName, isCheck, dialCode, loginCallback, projectId, loginMode, isNetwork } =
      this.props;
    let account = loginMode === 1 ? emailOrTel : fullName;
    let params = {
      password: encrypt(password),
      isCookie: isCheck,
    };
    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = md.global.getCaptchaType();
    }
    removePssId();
    let cb = data => {
      this.setState({ loginDisabled: false });
      loginCallback({ ...data, projectId, loginMode, isNetwork });
    };
    if (loginMode === 2) {
      params.projectId = projectId;
      params.userName = encrypt(account);
      params.regFrom = request.s;
      loginController.lDAPLogin(params).then(data => {
        data.loginType = 1;
        cb(data);
      });
    } else {
      params.account = encrypt(dialCode + account.trim());
      params.state = request.state;
      params.unionId = request.unionId;
      params.tpType = request.tpType;
      params.regFrom = request.s;
      loginController.mDAccountLogin(params).then(data => {
        data.account = account;
        data.loginType = 0;
        cb(data);
      });
    }
  };
  //验证码登录=>发送验证码
  sendForVerifyCodeLogin = data => {
    const { emailOrTel, dialCode, changeVerifyActionResult = () => {}, updateWarn = () => {} } = this.props;
    let { ticket, randstr } = data;
    loginController
      .sendLoginVerifyCode({
        ticket,
        randStr: randstr,
        captchaType: md.global.getCaptchaType(),
        account: encrypt(dialCode + emailOrTel),
        lang: getCurrentLangCode(),
      })
      .then(res => {
        this.setState({ loginDisabled: false });
        switch (res.actionResult) {
          case 1: // 1、发送成功
          case 8: // 8：发送验证码过于频繁
            changeVerifyActionResult(res.actionResult);
            updateWarn([]);
            break;
          case 3: // 3：前端图形验证码校验失败
            this.onBtnForLogin(true);
            break;
          case 5: // 5：用户不存在
            alert(_l('账号不正确'), 3);
            break;
          case 21: // 21之前登录锁定了，不能进行发送，通常通过忘记密码重置
            alert(_l('当前账户已锁定，验证码发送失败'), 3);
            break;
          default: // 0：失败
            alert(_l('验证码发送失败'), 3);
            break;
        }
      });
  };

  onBtnForLogin = async frequentLogin => {
    const { loginDisabled } = this.state;
    const { loginMode, isValid, loginModeType, changeVerifyActionResult } = this.props;
    if (loginDisabled) {
      return;
    }
    let callback = (res = {}) => {
      if (frequentLogin && res.ret !== 0) {
        return;
      }
      this.setState({
        loginDisabled: true,
      });
      if (loginModeType !== 2) {
        this.doLogin(res);
      } else {
        // changeVerifyActionResult(1);
        this.sendForVerifyCodeLogin(res);
      }
    };
    let isV = await isValid(
      false,
      loginMode === 2
        ? ['fullName', 'password']
        : loginModeType !== 2
          ? [getAccountTypes(true), 'password']
          : [getAccountTypes(true)],
    );

    if (isV) {
      if (frequentLogin) {
        if (md.global.getCaptchaType() === 1) {
          new captcha(callback);
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback, { needFeedBack: false }).show();
        }
      } else {
        callback();
      }
    }
  };

  render() {
    const { isCheck = false, loginMode, loginModeType, setData = () => {}, clearInfoByUrl = () => {} } = this.props;
    let { loginDisabled, version } = this.state;
    return (
      <React.Fragment>
        <MessageCon
          type="login"
          keys={
            loginMode === 2
              ? ['fullName', 'password']
              : loginModeType === 2
                ? [getAccountTypes(true)]
                : [getAccountTypes(true), 'password']
          }
          key={version}
        />
        {loginDisabled && <div className="loadingLine"></div>}
        <div className="mTop24 clearfix Font14">
          <div
            className="cbRememberPasswordDiv Gray Font14 Left Hand flexRow alignItemsCenter"
            onClick={() => {
              setData({ isCheck: !isCheck });
            }}
          >
            <Checkbox checked={isCheck} className="InlineBlock" />
            {_l('下次自动登录')}
          </div>
          {loginMode !== 2 && loginModeType !== 2 && (
            <div className="Right">
              <a
                target="_blank"
                className="findPassword"
                onClick={() => {
                  clearInfoByUrl();
                  navigateTo('/findPassword');
                }}
              >
                {_l('忘记密码？')}
              </a>
            </div>
          )}
        </div>
        <span
          className="btnForLogin Hand"
          onClick={() => {
            this.onBtnForLogin(loginModeType === 2);
          }}
        >
          {loginModeType !== 2 ? _l('登 录') : _l('继 续')}
          {loginDisabled ? '...' : ''}
        </span>
      </React.Fragment>
    );
  }
}
