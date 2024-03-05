import React from 'react';
import ReactDOM from 'react-dom';
import './login.less';
import './components/message.less';
import cx from 'classnames';
import registerAjax from 'src/api/register';
import preall from 'src/common/preall';
import { inputFocusFn, inputBlurFn, warnningTipFn, setWarnningData } from './util';
import { encrypt, getRequest } from 'src/util';
import RegExp from 'src/util/expression';

let request = getRequest();

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    const { md = {} } = window;
    const { global = {} } = md;
    const { SysSettings = {} } = global;
    const { passwordRegexTip, passwordRegex } = SysSettings;
    this.state = {
      type: request.type,
      warnningData: [],
      focusDiv: '',
      passwordRegexTip,
      passwordRegex,
      sending: false,
      loading: !request.type || !request.state,
    };
    this.password = React.createRef();
    this.passwordCopy = React.createRef();
  }
  componentDidMount() {
    $('html').addClass('loginContainerCon');
    document.title = _l('修改密码');
    if (!request.state) {
      return alert(_l('当前地址错误'), 3);
    } else {
      !request.type && this.getResetPasswordTrigerInfo();
    }
  }

  componentWillUnmount() {
    $('html').removeClass('loginContainerCon');
  }

  getResetPasswordTrigerInfo = () => {
    registerAjax
      .getResetPasswordTrigerInfo({
        state: request.state,
      })
      .then(res => {
        this.setState({
          type: res.type,
          loading: false,
        });
      });
  };

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

  isPasswordRule = str => {
    return RegExp.isPasswordValid(str, this.state.passwordRegex);
  };

  // 验证密码
  isValid = () => {
    const { password = '', passwordCopy = '' } = this.state;
    let isRight = true;
    let warnningData = [];
    if (!password) {
      warnningData.push({
        tipDom: this.password,
        warnningText: _l('请输入密码'),
      });
      isRight = false;
    }
    if (isRight && !this.isPasswordRule(password)) {
      warnningData.push({
        tipDom: this.password,
        warnningText: this.state.passwordRegexTip || _l('密码，8-20位，必须含字母+数字'),
      });
      isRight = false;
    }
    if (!passwordCopy && isRight) {
      warnningData.push({
        tipDom: this.passwordCopy,
        warnningText: _l('请输入确认密码'),
      });
      isRight = false;
    }
    if (passwordCopy !== password && isRight) {
      warnningData.push({
        tipDom: this.passwordCopy,
        warnningText: _l('请确保确认密码与密码一致'),
      });
      isRight = false;
    }
    this.setState({
      warnningData,
    });
    if (!isRight) {
      warnningData[0].tipDom.focus();
    }
    return isRight;
  };

  sendPassword = isValid => {
    const { password } = this.state;
    if (!isValid()) {
      return;
    }
    this.setState({
      sending: true,
    });
    registerAjax
      .resetPasswordByState({
        state: request.state,
        password: encrypt(password),
      })
      .then(res => {
        this.setState({
          sending: false,
        });
        if (res.actionResult == 1) {
          alert('密码修改成功，请使用新密码重新登录', 1, 3000, function () {
            if (request.ReturnUrl) {
              location.href = '/login?ReturnUrl=' + encodeURIComponent(request.ReturnUrl);
            } else {
              location.href = '/login';
            }
          });
        } else if (res.actionResult == 20) {
          alert('新密码不可与旧密码一样', 3);
        } else {
          alert(_l('密码修改失败，请稍后再试', 2));
        }
      });
  };

  renderCon = () => {
    const { type, warnningData, focusDiv, password, passwordCopy, sending } = this.state;
    return (
      <div className="pBottom100">
        <span
          className="mTop40 Font15 InlineBlock Hand backspaceT"
          onClick={() => {
            // 返回上一层
            window.history.back();
          }}
        >
          <span className="backspace"></span>
          {_l('返回')}
        </span>
        <div className="titleHeader">
          <div className={cx('title mTop20')}>{_l('修改密码')}</div>
          <div className="mTop8">
            <span style={{ color: '#757575' }}>
              {type == 2 ? _l('旧密码已过期，请重新设置密码') : _l('首次登录需设置密码')}
            </span>
          </div>
        </div>
        <div className="messageBox mTop20">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, ['.passwordIcon', this.password], focusDiv, password),
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
                this.setState({
                  password: e.target.value,
                });
              }}
              value={password}
              autoComplete="new-password"
            />
            <div
              className="title"
              onClick={e => {
                $(this.password).focus();
              }}
            >
              {_l('请设置密码')}
            </div>
            {warnningTipFn(warnningData, ['.passwordIcon', this.password], focusDiv)}
          </div>
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, ['.passwordCopy', this.passwordCopy], focusDiv, passwordCopy),
            })}
          >
            <input
              type="password"
              className="passwordCopy"
              placeholder={passwordCopy}
              ref={passwordCopy => (this.passwordCopy = passwordCopy)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                this.setState({
                  passwordCopy: e.target.value,
                });
              }}
              value={passwordCopy}
              autoComplete="new-password"
            />
            <div
              className="title"
              onClick={e => {
                $(this.passwordCopy).focus();
              }}
            >
              {_l('请确认密码')}
            </div>
            {warnningTipFn(warnningData, ['.passwordCopy', this.passwordCopy], focusDiv)}
          </div>
          <div className="tipWar mTop10 Gray_9e">{this.state.passwordRegexTip || _l('两次输入的密码不一致')}</div>
          <span
            className="btnForLogin Hand mTop80"
            onClick={() => {
              this.sendPassword(this.isValid);
            }}
          >
            {sending ? _l('确认...') : _l('确认')}
          </span>
        </div>
      </div>
    );
  };

  showLangChang = () => {
    $('.showLangChangeBottom').removeClass('Hidden');
  };

  render() {
    const { loading } = this.state;
    if (loading) {
      return null;
    }
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
          {this.showLangChang()}
        </div>
      </div>
    );
  }
}

const WrappedComp = md.global.Config.IsLocal ? preall(ResetPassword, { allownotlogin: true }) : ResetPassword;
ReactDOM.render(<WrappedComp />, document.querySelector('#contractWrap'));
