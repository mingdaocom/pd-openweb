import React from 'react';
import ReactDOM from 'react-dom';
import ChangeLang from 'src/components/ChangeLang';
import Container from './container/loginContainer';
import './login.less';
import projectController from 'src/api/project';
import loginController from 'src/api/login';
import workWeiXinController from 'src/api/workWeiXin';
import { getRequest } from 'src/util';
import { setPssId } from 'src/util/pssId';
import { LoadDiv } from 'ming-ui';
import cx from 'classnames';
import { checkLogin } from 'src/util/sso';
import { browserIsMobile } from 'src/util';
import { getDataByFilterXSS } from './util';
import preall from 'src/common/preall';

let request = getRequest();
let ActionResult = {
  failed: 0,
  accountSuccess: 1, // 帐号验证成功
  accountError: 2, // 账号不存在
  passwordError: 3, // 密码错误
  verifyCodeError: 4, // 验证码输入错误
  accountFrequentLoginError: 5, // 频繁登录错误，需要验证码
  accountNotExist: 7, // 账号不存在
  userFromError: 8, // 账号来源类型受限
  accountDisabled: 9, // 账号被禁用
  needTwofactorVerifyCode: 10, // 开启了两步验证
  isLock: 12, // 登陆次数过多被锁定，会增加剩余锁定时间，时间为秒
  passwordOverdue: 14, // 密码过期需要重新设置密码
  firstLoginResetPassword: 13, //首次登录需修改密码
};
class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logo: `${md.global.FileStoreConfig.pictureHost}ProjectLogo/default.png`,
      loading: true,
      openLDAP: false, //
      canLDAP: false, // 可否使用LDAP
      isNetwork: window.navigator.userAgent.toLowerCase().includes('miniprogram'), // 小程序隐藏第三方登录入口
      hideRegister: true,
      text: '',
      logo: '',
      step: 0,
      intergrationScanEnabled: false,
      projectId: request.projectId,
      linkInvite: '',
      loginData: {
        dialCode: '',
        warnningData: {},
        emailOrTel: '', // 邮箱或手机
        verifyCode: '', // 验证码
        password: '', // 8-20位，需包含字母和数字
        fullName: '', // 姓名
        regcode: '', // 企业码
        isCheck: false,
        confirmation: request.confirmation,
        isLink: !!request.confirmation,
        company: {
          companyName: '',
          departmentId: '',
          jobId: '', // 加入网络使用
          workSiteId: '',
          jobNumber: '',
          job: '', // 加入网络使用
          email: '', // 邮箱
          scaleId: '', // 预计人数
        },
      },
      isFrequentLoginError: false, // 是否需要验证登录
      homeImage: '',
    };
  }

  componentDidMount() {
    $('html').addClass('loginContainerCon');
    document.title = _l('登录');
    if (checkLogin()) {
      if (request.ReturnUrl) {
        location.replace(getDataByFilterXSS(request.ReturnUrl));
        return;
      }
      location.href = browserIsMobile() ? `/mobile` : `/app`;
      return;
    }
    const { accountId = '', encryptPassword = '', account = '', projectId = '', loginType = 0 } = JSON.parse(
      window.localStorage.getItem('LoginCheckList') || '{}',
    );
    if (request.unionId || !accountId || !encryptPassword || (loginType === 1 && (!projectId || !account))) {
      if (location.href.indexOf('network') < 0) {
        //network =>getProjectBaseInfo 获取信息后 更新loading
        this.setState({ loading: false });
      }
    } else {
      let param = { loginType, accountId, encryptPassword };
      if (loginType === 1) {
        param = { ...param, account, projectId };
      }
      loginController.mDAccountAutoLogin({ ...param, regFrom: request.s }).then(data => this.loginCallback(data, true));
    }

    // 记录登录用户名
    const loginName = window.localStorage.getItem('LoginName');
    const loginLDAPName = window.localStorage.getItem('LoginLDAPName');
    if (loginName) {
      this.setState({
        loginData: {
          ...this.state.loginData,
          emailOrTel: loginName,
          fullName: loginLDAPName,
        },
      });
    }

    this.setState({ isNetwork: true });
    this.getProjectBaseInfo();
    this.ssoLogin(request.ReturnUrl);
  }

  componentWillUnmount() {
    $('html').removeClass('loginContainerCon');
  }

  loginCallback = (data, isMDLogin, callback, ignoreError) => {
    if ([ActionResult.accountSuccess, ActionResult.needTwofactorVerifyCode].includes(data.accountResult)) {
    }
    if (data.accountResult === ActionResult.needTwofactorVerifyCode) {
      //开启了两步验证
      if (request.ReturnUrl) {
        location.href = `/twofactor?state=${data.state}&ReturnUrl=${encodeURIComponent(request.ReturnUrl)}`;
      } else {
        location.href = `/twofactor?state=${data.state}`;
      }
      return;
    }
    if (data.accountResult === ActionResult.accountSuccess) {
      setPssId(data.sessionId);
      if (request.ReturnUrl) {
        location.replace(getDataByFilterXSS(request.ReturnUrl));
      } else {
        window.location.replace('/dashboard');
      }
    } else {
      // 如果登录失败，需要把本地保存的 accountId 和 encryptPassword 清理掉
      window.localStorage.removeItem('LoginCheckList');
      this.setState({ loading: false });

      if (ignoreError) return;

      var msg = '';
      if (data.accountResult === ActionResult.accountNotExist) {
        this.setState({
          loginData: {
            ...this.state.loginData,
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
      if (data.accountResult === ActionResult.accountFrequentLoginError) {
        this.setState({ isFrequentLoginError: true }, () => {
          if (callback) {
            callback();
          }
        });
        return;
      } else if (data.accountResult === ActionResult.isLock) {
        let t = data.state ? Math.ceil(data.state / 60) : 20;
        this.setState({
          loginData: {
            ...this.state.loginData,
            warnningData: [
              {
                tipDom: '.warnningDiv',
                warnningText: _l(
                  '错误次数过多，出于安全考虑，暂时锁定您的账户，请 %0 分钟后尝试，或%1重置密码%2解除锁定',
                  t,
                  '<a href="/findPassword" target="_blank">',
                  '</a>',
                ),
              },
            ],
          },
        });
        return;
      } else if (data.accountResult === ActionResult.userFromError) {
        msg = _l('账号来源类型受限');
      } else if (data.accountResult === ActionResult.accountDisabled) {
        msg = _l('账号被禁用，请联系系统管理员进行恢复');
      } else {
        //密码错误
        if (isMDLogin && data.accountResult === ActionResult.passwordError) {
          const { state } = data;
          const t = (state || '').split('|');
          if (t.length > 1) {
            this.setState({
              loginData: {
                ...this.state.loginData,
                warnningData: [
                  {
                    tipDom: '.warnningDiv',
                    warnningText: _l('您输入错误%0次，还可尝试%1次', t[1], t[0] - t[1]),
                  },
                ],
              },
            });
            return;
          }
          msg = _l('用户名或密码不正确');
        } else {
          msg = data.accountResult === ActionResult.verifyCodeError ? _l('验证码输入错误') : _l('用户名或密码不正确');
        }
      }
      alert(msg, 3);
    }
  };

  // 获取页面信息
  getProjectBaseInfo = callback => {
    projectController
      .getProjectSubDomainInfo({
        host: location.host,
        projectId: request.projectId || '',
      })
      .then(data => {
        if (!data || !data.companyName) {
          location.replace('/privateImageInstall.htm');
        } else {
          this.setState(
            {
              logo: data.logo,
              openLDAP: data.openLDAP,
              canLDAP: data.openLDAP,
              isOpenSso: data.isOpenSso,
              ssoWebUrl: data.ssoWebUrl,
              ssoAppUrl: data.ssoAppUrl,
              projectId: data.projectId,
              text: data.companyName,
              logo: data.logo,
              linkInvite: '/linkInvite?projectId=' + data.projectId,
              homeImage: data.homeImage,
              intergrationScanEnabled: data.intergrationScanEnabled,
              hideRegister: data.hideRegister,
              loading: false,
            },
            () => {
              document.title = data.companyName;
              if (callback) {
                callback();
              }
            },
          );
        }
      });
  };

  // 在集成环境如果 ReturnUrl 包含 appId，去 sso 页面登录
  ssoLogin = (returnUrl = '') => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const getAppId = pathname => {
      if (pathname.includes('mobile')) {
        const match = pathname.match(/\/mobile\/([^\/]+)\/([^\/]+)/);
        return match && match[2];
      } else if (pathname.includes('embed/view')) {
        const match = pathname.match(/\/embed\/view\/([^\/]+)/);
        return match && match[1];
      } else {
        const match = pathname.match(/\/app\/([^\/]+)/);
        return match && match[1];
      }
    };
    const isApp =
      userAgent.includes('dingtalk') ||
      userAgent.includes('wxwork') ||
      userAgent.includes('huawei-anyoffice') ||
      userAgent.includes('feishu');
    if (isApp && returnUrl) {
      const { pathname, search } = new URL(returnUrl);
      const appId = getAppId(pathname);
      if (appId) {
        workWeiXinController
          .getIntergrationInfo({
            appId,
          })
          .then(data => {
            const { item1, item2 } = data;
            const url = encodeURIComponent(pathname + search);
            // 钉钉
            if (item1 === 1) {
              const url = encodeURIComponent(pathname.replace(/^\//, '') + search);
              location.href = `/sso/sso?t=2&p=${item2}&ret=${url}`;
            }
            // 企业微信
            if (item1 === 3) {
              location.href = `/auth/workwx?p=${item2}&url=${url}`;
            }
            // welink
            if (item1 === 4) {
              location.href = `/auth/welink?p=${item2}&url=${url}`;
            }
            // 飞书
            if (item1 === 6) {
              location.href = `/auth/feishu?p=${item2}&url=${url}`;
            }
          });
      }
    }
  };

  getWorkWeiXinCorpInfoByApp = () => {
    const { projectId } = this.state;
    loginController
      .getWorkWeiXinCorpInfoByApp({
        projectId,
      })
      .then(result => {
        const { corpId, state, agentId, scanUrl } = result;
        const redirect_uri = encodeURIComponent(`${location.origin}/auth/workwx`);
        const url = `${scanUrl}/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&state=${state}`;
        location.href = url;
      });
  };

  changeStep = step => {
    this.setState({
      step,
    });
  };

  changeOpenLDAP = () => {
    this.setState({
      openLDAP: !this.state.openLDAP,
      loginData: { ...this.state.loginData, password: '', isCheck: false },
    });
  };

  renderCon = () => {
    let pram = {
      projectId: this.state.projectId,
      step: this.state.step,
      changeStep: this.changeStep,
      isNetwork: this.state.isNetwork,
      openLDAP: this.state.openLDAP,
      loginData: this.state.loginData,
      isFrequentLoginError: this.state.isFrequentLoginError,
      canLDAP: this.state.canLDAP,
      onChangeData: (data, callback) => {
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
      },
      loginCallback: this.loginCallback,
      ActionResult: ActionResult,
    };
    switch (this.state.step) {
      case 0:
        return <Container {...pram} changeOpenLDAP={this.changeOpenLDAP} />;
    }
  };

  renderFooter = () => {
    let {
      linkInvite,
      isNetwork,
      openLDAP,
      canLDAP,
      intergrationScanEnabled,
      isOpenSso,
      ssoWebUrl,
      ssoAppUrl,
      hideRegister,
    } = this.state;
    const isBindAccount = !!request.unionId;
    const isMobile = browserIsMobile();
    const scanLoginEnabled = intergrationScanEnabled && !isMobile;

    return (
      <React.Fragment>
        {!isBindAccount && (
          <React.Fragment>
            <div className="tpLogin TxtCenter">
              {(!isNetwork || canLDAP || scanLoginEnabled || isOpenSso) && <div className="title">{_l('或')}</div>}
              <div className="mBottom20">
                {scanLoginEnabled && (
                  <a title={_l('企业微信登录')} onClick={this.getWorkWeiXinCorpInfoByApp}>
                    <i className="workWeixinIcon hvr-pop" />
                  </a>
                )}
                {isOpenSso && (
                  <a href={isMobile ? ssoAppUrl : ssoWebUrl} title={_l('sso登录')}>
                    <i className="ssoIcon hvr-pop" />
                  </a>
                )}
              </div>
              {!isNetwork && (
                <React.Fragment>
                  {!isMobile && (
                    <a href="//tp.mingdao.com/weixin/authRequest" title={_l('微信登录')}>
                      <i className="weixinIcon hvr-pop" />
                    </a>
                  )}
                  <a href="//tp.mingdao.com/qq/authRequest" title={_l('个人QQ登录')}>
                    <i className="personalQQIcon hvr-pop" />
                  </a>
                  {/* {!isMobile && (
                    <a href="//liteapi.mingdao.com/workwx/authRequest" title={_l('企业微信登录')}>
                      <i className="workWeixinIcon hvr-pop"></i>
                    </a>
                  )} */}
                </React.Fragment>
              )}
              <div className="Clear" />
            </div>
            <span className={cx('line', { mTop80: !canLDAP })} />
          </React.Fragment>
        )}
        {!hideRegister && (
          <span
            className="btnUseOldAccount Hand"
            onClick={() => {
              if (md.global.Config.IsPlatformLocal) {
                //平台版=>/register
                location.href = '/register';
              } else if (linkInvite) {
                location.href = linkInvite;
              } else {
                let request = getRequest();
                let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');
                if (returnUrl.indexOf('type=privatekey') > -1) {
                  location.href = '/register?ReturnUrl=' + encodeURIComponent(returnUrl);
                } else if (isBindAccount) {
                  location.href = `/register?state=${request.state}&tpType=${request.tpType}&unionId=${request.unionId}`;
                } else {
                  location.href = '/register';
                }
              }
            }}
          >
            {_l('注册新账号')}
          </span>
        )}
      </React.Fragment>
    );
  };

  render() {
    const { SysSettings } = md.global;
    if (this.state.loading) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    } else {
      this.state.homeImage &&
        this.state.isNetwork &&
        $('.loginContainerCon').css({
          'background-image': 'url(' + this.state.homeImage + ')',
          'background-size': 'cover',
        });

      return (
        <div className="loginBox">
          <div className="loginContainer">
            <div className="titleHeader">
              {this.state.isNetwork && !SysSettings.hideBrandLogo && this.state.logo && (
                <img src={this.state.logo} height={SysSettings.brandLogoHeight || 30} />
              )}
              {this.state.isNetwork && !SysSettings.hideBrandName && (
                <p className="Font17 Gray mAll0 mTop8">{this.state.text}</p>
              )}
            </div>
            {this.renderCon()}
            {this.renderFooter()}
          </div>
          <ChangeLang />
          {md.global.Config.IsPlatformLocal && md.global.Config.IsCobranding && (
            <div
              className={cx('powered w100 flexRow valignWrapper Font12', this.state.homeImage ? 'White' : 'Gray_9e', {
                linearGradientBg: this.state.homeImage,
              })}
            >
              <span className="pointer info mTop10" onClick={() => window.open('https://www.mingdao.com')}>
                {_l('基于明道云应用平台内核')}
              </span>
            </div>
          )}
        </div>
      );
    }
  }
}

const Comp = preall(LoginContainer, { allownotlogin: true });

ReactDOM.render(<Comp />, document.querySelector('#app'));
