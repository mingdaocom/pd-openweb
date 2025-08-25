import React from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import registerAjax from 'src/api/register';
import Footer from 'src/pages/AuthService/components/Footer.jsx';
import 'src/pages/AuthService/components/form.less';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { encrypt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { WrapCom } from '../style';

let request = getRequest();

const WrapBtn = styled.div`
  font-weight: 600;
  width: 100%;
  height: 40px;
  line-height: 40px;
  display: block;
  background: #2296f3;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  margin-top: 32px;
  text-align: center;

  &:hover {
    background: #1182dd;
  }
  &:active {
    background: #1585dd;
  }
`;

export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: request.type,
      warnList: [],
      focusDiv: '',
      passwordRegexTip: _.get(window, 'md.global.SysSettings.passwordRegexTip'),
      passwordRegex: _.get(window, 'md.global.SysSettings.passwordRegex'),
      sending: false,
      loading: !request.type || !request.state,
    };
    this.password = React.createRef();
    this.passwordCopy = React.createRef();
  }
  componentDidMount() {
    if (!request.state) {
      return alert(_l('当前地址错误'), 3);
    } else {
      !request.type && this.getResetPasswordTrigerInfo();
    }
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

  isPasswordRule = str => {
    return RegExpValidator.isPasswordValid(str, this.state.passwordRegex);
  };

  // 验证密码
  isValid = () => {
    const { password = '', passwordCopy = '' } = this.state;
    let isRight = true;
    let warnList = [];
    if (!password) {
      warnList.push({ tipDom: 'passwordIcon', warnTxt: _l('请输入密码') });
      isRight = false;
    }
    if (isRight && !this.isPasswordRule(password)) {
      warnList.push({
        tipDom: 'passwordIcon',
        warnTxt: _l('密码格式错误'),
      });
      isRight = false;
    }
    if (!passwordCopy && isRight) {
      warnList.push({ tipDom: 'passwordCopy', warnTxt: _l('请输入确认密码') });
      isRight = false;
    }
    if (passwordCopy !== password && isRight) {
      warnList.push({ tipDom: 'passwordCopy', warnTxt: _l('请确保确认密码与密码一致') });
      isRight = false;
    }
    this.setState({ warnList });
    return isRight;
  };

  sendPassword = async () => {
    const { password } = this.state;
    const isV = await this.isValid();
    if (!isV) {
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
          alert(_l('密码修改成功，请使用新密码重新登录'), 1, 3000, function () {
            if (request.ReturnUrl) {
              navigateTo('/login?ReturnUrl=' + encodeURIComponent(request.ReturnUrl));
            } else {
              navigateTo('/login');
            }
          });
        } else if (res.actionResult == 20) {
          alert(_l('新密码不可与旧密码一样'), 3);
        } else {
          alert(_l('密码修改失败，请稍后再试'), 2);
        }
      });
  };

  renderCon = () => {
    const { type, warnList, focusDiv, password, passwordCopy, sending } = this.state;
    const renderWarn = key => {
      const warn = warnList.find(o => o.tipDom === key);
      if (!warn) return;
      return <div className={cx('warnTips')}>{warn.warnTxt}</div>;
    };
    const renderClassName = (key, value) => {
      const warn = warnList.find(o => o.tipDom === key);
      return {
        hasValue: !!value || focusDiv === key,
        errorDiv: warn,
        warnDiv: warn && warn.noErr,
        errorDivCu: !!focusDiv && focusDiv === key,
      };
    };
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
          <div className={cx('mesDiv', renderClassName('passwordIcon', password))}>
            <input
              type="password"
              className="passwordIcon"
              placeholder={password}
              ref={password => (this.password = password)}
              onBlur={() => this.setState({ focusDiv: '' })}
              onFocus={() => this.setState({ focusDiv: 'passwordIcon' })}
              onChange={e => {
                this.setState({
                  password: e.target.value,
                });
              }}
              value={password}
              autoComplete="new-password"
            />
            <div className="title" onClick={() => this.setState({ focusDiv: 'passwordIcon' })}>
              {_l('请设置密码')}
            </div>
            {renderWarn('passwordIcon')}
          </div>
          <div className={cx('mesDiv', renderClassName('passwordCopy', passwordCopy))}>
            <input
              type="password"
              className="passwordCopy"
              placeholder={passwordCopy}
              ref={passwordCopy => (this.passwordCopy = passwordCopy)}
              onBlur={() => this.setState({ focusDiv: '' })}
              onFocus={() => this.setState({ focusDiv: 'passwordCopy' })}
              onChange={e => {
                this.setState({
                  passwordCopy: e.target.value,
                });
              }}
              value={passwordCopy}
              autoComplete="new-password"
            />
            <div className="title" onClick={() => this.setState({ focusDiv: 'passwordCopy' })}>
              {_l('请确认密码')}
            </div>
            {renderWarn('passwordCopy')}
          </div>
          <div className="tipWar mTop10 Gray_9e">{this.state.passwordRegexTip}</div>
          <WrapBtn
            className="Hand mTop80"
            onClick={() => {
              this.sendPassword();
            }}
          >
            {sending ? _l('确认...') : _l('确认')}
          </WrapBtn>
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.state;
    const { SysSettings } = md.global;
    return (
      <WrapCom className="flexColumn">
        <DocumentTitle title={_l('修改密码')} />
        {!loading && (
          <div className="loginBox flex">
            <div className="loginContainer">
              {!SysSettings.hideBrandLogo && (
                <div className="titleHeader">
                  <img src={SysSettings.brandLogoUrl} height={SysSettings.brandLogoHeight || 40} />
                </div>
              )}
              {this.renderCon()}
            </div>
          </div>
        )}
        {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
      </WrapCom>
    );
  }
}
