import React from 'react';
import { Icon } from 'ming-ui';
import Message from '../components/message';
import cx from 'classnames';
import loginController from 'src/api/login';
import { getRequest } from 'src/util';
import captcha from 'src/components/captcha';
import { hasCaptcha } from '../util';
import { encrypt } from 'src/util';
import { removePssId } from 'src/util/pssId';
import moment from 'moment';

const request = getRequest();

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDisabled: false,
    };
  }

  componentDidMount() {
    // 组件挂载时候，注册keypress事件
    document.addEventListener('keypress', this.handleEnterKey);
  }
  componentWillUmount() {
    // 组件卸载时候，注销keypress事件
    document.removeEventListener('keypress', this.handleEnterKey);
  }

  handleEnterKey = e => {
    if (e.keyCode === 13 && !hasCaptcha()) {
      $('.btnForLogin').click();
    }
  };

  doLogin = res => {
    const { loginData = {}, isNetwork, openLDAP, loginCallback, projectId, ActionResult } = this.props;
    const { emailOrTel, password, fullName, isCheck, dialCode } = loginData;
    let account = !openLDAP ? emailOrTel : fullName;
    if (!openLDAP) {
      safeLocalStorageSetItem('LoginName', emailOrTel);
    } else {
      safeLocalStorageSetItem('LoginLDAPName', fullName);
    }
    var params = {
      password: encrypt(password),
      isCookie: isCheck,
    };

    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = res.captchaType;
    }

    removePssId();
    let cb = data => {
      const { accountResult, loginType, state } = data;
      if (isCheck && [ActionResult.accountSuccess, ActionResult.needTwofactorVerifyCode].includes(accountResult)) {
        safeLocalStorageSetItem(
          'LoginCheckList',
          JSON.stringify({
            accountId: data.accountId,
            encryptPassword: data.encryptPassword,
            loginType,
            account,
            projectId,
          }),
        );
      }
      if (accountResult === ActionResult.needTwofactorVerifyCode) {
        //开启了两步验证
        if (request.ReturnUrl) {
          location.href = `/twofactor.htm?state=${state}&ReturnUrl=${encodeURIComponent(request.ReturnUrl)}`;
        } else {
          location.href = `/twofactor.htm?state=${state}`;
        }
        return;
      }
      if (
        [
          ActionResult.passwordOverdue, // 密码过期需要重新设置密码
          ActionResult.firstLoginResetPassword, //首次登录需修改密码
        ].includes(accountResult)
      ) {
        let type = ActionResult.firstLoginResetPassword === accountResult ? 1 : 2;
        //需要重置密码
        if (request.ReturnUrl) {
          location.href = `/resetPassword.htm?state=${state}&type=${type}&ReturnUrl=${encodeURIComponent(
            request.ReturnUrl,
          )}`;
        } else {
          location.href = `/resetPassword.htm?state=${state}&type=${type}`;
        }
        return;
      }
      this.setState({ loginDisabled: false });
      safeLocalStorageSetItem(
        'loginStatus',
        JSON.stringify({ state: data.state, createStateTime: moment().format('YYYY-MM-DD HH:mm:ss') }),
      );
      loginCallback(data, !(openLDAP && isNetwork), () => {
        $('.btnForLogin').click();
      });
      if (accountResult === 15) {
        location.href = '/cancellation.htm';
      }
    };
    if (!(openLDAP && isNetwork)) {
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
    } else {
      params.projectId = projectId;
      params.userName = encrypt(account);
      params.regFrom = request.s;
      loginController.lDAPLogin(params).then(data => {
        data.loginType = 1;
        cb(data);
      });
    }
  };

  loginFn = isValid => {
    const { loginDisabled } = this.state;
    const { isFrequentLoginError } = this.props;
    if (loginDisabled) {
      return;
    }
    let callback = (res = {}) => {
      if (isFrequentLoginError && res.ret !== 0) {
        return;
      }
      this.setState(
        {
          loginDisabled: true,
        },
        () => {
          this.doLogin(
            Object.assign({}, res, {
              captchaType: md.staticglobal.getCaptchaType(),
            }),
          );
        },
      );
    };
    if (isValid()) {
      if (isFrequentLoginError) {
        if (md.staticglobal.getCaptchaType() === 1) {
          new captcha(callback);
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
        }
      } else {
        callback();
      }
    }
  };

  render() {
    const { loginData = {}, onChangeData, isNetwork, openLDAP, canLDAP } = this.props;
    let { isCheck = false } = loginData;
    let { loginDisabled } = this.state;
    return (
      <React.Fragment>
        <div className={cx('titleHeader flexRow alignItemsCenter', { mTop40: !isNetwork, mTop30: isNetwork })}>
          <div className="title">{openLDAP ? _l('LDAP登录') : _l('登录')}</div>
          <div className="flex TxtRight">
            {canLDAP && (
              <span className="changeLoginType Hand Gray_9e Hover_49" onClick={this.props.changeOpenLDAP}>
                <Icon icon="swap_horiz" className="mRight5" /> {!openLDAP ? _l('LDAP登录') : _l('平台账户登录')}
              </span>
            )}
          </div>
        </div>
        <Message
          type="login"
          keys={openLDAP && isNetwork ? ['fullName', 'password'] : ['emailOrTel', 'password']}
          openLDAP={openLDAP}
          dataList={loginData}
          isNetwork={isNetwork}
          onChangeData={onChangeData}
          nextHtml={isValid => {
            return (
              <React.Fragment>
                {loginDisabled && <div className="loadingLine"></div>}
                <div className="mTop15 clearfix Font14">
                  <div className="Left">
                    <a target="_blank" href="/findPassword.htm" className="findPassword">
                      {_l('忘记密码？')}
                    </a>
                  </div>
                  <div
                    className="cbRememberPasswordDiv Right Hand"
                    onClick={() => {
                      onChangeData({
                        ...loginData,
                        isCheck: !isCheck,
                      });
                    }}
                  >
                    <span className={cx('cb', { checkedIcon: isCheck, unCheckedIcon: !isCheck })}></span>
                    {_l('下次自动登录')}
                  </div>
                </div>
                <span
                  className="btnForLogin Hand"
                  onClick={() => {
                    this.loginFn(isValid);
                  }}
                >
                  {loginDisabled ? _l('登录中...') : _l('登 录')}
                </span>
              </React.Fragment>
            );
          }}
        />
      </React.Fragment>
    );
  }
}
