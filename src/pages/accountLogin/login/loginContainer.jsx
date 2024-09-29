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

  onBtnForLogin = async frequentLogin => {
    const { loginDisabled } = this.state;
    const { loginMode, isValid } = this.props;
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
      this.doLogin(res);
    };
    let isV = await isValid(false, loginMode === 2 ? ['fullName', 'password'] : [getAccountTypes(true), 'password']);

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
    const { isCheck = false, loginMode, setData = () => {}, clearInfoByUrl = () => {} } = this.props;
    let { loginDisabled, version } = this.state;
    return (
      <React.Fragment>
        <MessageCon
          type="login"
          keys={loginMode === 2 ? ['fullName', 'password'] : [getAccountTypes(true), 'password']}
          key={version}
        />
        {loginDisabled && <div className="loadingLine"></div>}
        <div className="mTop16 clearfix Font14">
          {loginMode !== 2 && (
            <div className="Left">
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
          <div
            className="cbRememberPasswordDiv Right Hand flexRow alignItemsCenter"
            onClick={() => {
              setData({ isCheck: !isCheck });
            }}
          >
            <Checkbox checked={isCheck} className="InlineBlock" />
            {_l('下次自动登录')}
          </div>
        </div>
        <span
          className="btnForLogin Hand"
          onClick={() => {
            this.onBtnForLogin();
          }}
        >
          {loginDisabled ? _l('登录中...') : _l('登 录')}
        </span>
      </React.Fragment>
    );
  }
}
