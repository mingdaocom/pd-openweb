import React from 'react';
import ReactDOM from 'react-dom';
import ChangeLang from 'src/components/ChangeLang';
import Container from './container/loginContainer';
import './login.less';
import projectController from 'src/api/project';
import loginController from 'src/api/login';
import { getRequest } from 'src/util';
import { setPssId } from 'src/util/pssId';
import { LoadDiv } from 'ming-ui';
import cx from 'classnames';
import { checkLogin } from 'src/util/sso';
import { browserIsMobile } from 'src/util';

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
      scanUrl: '',
      projectId: request.projectId,
      linkInvite: '',
      loginData: {
        dialCode: '',
        warnningData: {},
        emailOrTel: '', // 邮箱或手机
        verifyCode: '', // 验证码
        password: '', // 8-20位，只支持字母+数字
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
    };
  }

  componentDidMount() {
    $('html').addClass('loginContainerCon');
    document.title = _l('登录');
    if (checkLogin()) {
      if (request.ReturnUrl) {
        location.replace(request.ReturnUrl);
        return;
      }
      location.href = browserIsMobile() ? `/mobile` : `/app`;
      return;
    }
    const {
      accountId = '',
      encryptPassword = '',
      account = '',
      projectId = '',
      loginType = 0,
    } = JSON.parse(window.localStorage.getItem('LoginCheckList') || '{}');
    if (request.unionId || !accountId || !encryptPassword || (loginType === 1 && (!projectId || !account))) {
      this.setState({ loading: false });
    } else {
      let param = { loginType, accountId, encryptPassword };
      if (loginType === 1) {
        param = { ...param, account, projectId };
      }
      loginController.mDAccountAutoLogin({ ...param }).then(data => this.loginCallback(data, true));
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
  }

  componentWillUnmount() {
    $('html').removeClass('loginContainerCon');
  }

  loginCallback = (data, isMDLogin, callback, ignoreError) => {
    if (data.accountResult === ActionResult.accountSuccess) {
      setPssId(data.sessionId);

      if (request.ReturnUrl) {
        location.replace(request.ReturnUrl);
      } else {
        window.location.replace('/app/my');
      }
    } else {
      // 如果登录失败，需要把本地保存的 accountId 和 encryptPassword 清理掉
      window.localStorage.removeItem('LoginCheckList');
      this.setState({ loading: false });

      if (ignoreError) return;

      var msg = '';
      if (data.accountResult === ActionResult.accountFrequentLoginError) {
        this.setState({ isFrequentLoginError: true }, () => {
          if (callback) {
            callback();
          }
        });
        return;
      } else if (data.accountResult === ActionResult.isLock) {
        let t = data.state ? Math.ceil(data.state / 60) : 20;
        msg = _l('密码错误次数过多被锁定，请 %0 分钟后再试，或 重置密码', t);
      } else if (data.accountResult === ActionResult.userFromError) {
        msg = _l('账号来源类型受限');
      } else if (data.accountResult === ActionResult.accountDisabled) {
        msg = _l('账号被禁用，请联系系统管理员进行恢复');
      } else {
        if (isMDLogin && data.accountResult === ActionResult.accountNotExist) {
          msg = _l('该帐号未注册');
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
        if (!data) {
          location.replace('/privateImageInstall.htm');
        } else {
          const isMobile = browserIsMobile();
          if (data.intergrationScanEnabled && !isMobile) {
            this.getWorkWeiXinCorpInfoByApp(data.projectId);
          }
          this.setState(
            {
              logo: data.logo,
              openLDAP: data.openLDAP,
              canLDAP: data.openLDAP,
              projectId: data.projectId,
              text: data.companyName,
              logo: data.logo,
              loading: false,
              linkInvite: '/linkInvite.htm?projectId=' + data.projectId,
              hideRegister: data.hideRegister,
            },
            () => {
              document.title = data.companyName;
              $('.loginContainerCon').css({
                'background-image': 'url(' + data.homeImage + ')',
                'background-size': 'cover',
              });
              if (callback) {
                callback();
              }
            },
          );
        }
      });
  };

  getWorkWeiXinCorpInfoByApp = projectId => {
    loginController
      .getWorkWeiXinCorpInfoByApp({
        projectId,
      })
      .then(result => {
        const { corpId, state, agentId, scanUrl } = result;
        const redirect_uri = encodeURIComponent(`${location.origin}/auth/workwx`);
        const url = `${scanUrl}/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&state=${state}`;
        this.setState({
          scanUrl: url,
        });
      });
  };

  changeStep = step => {
    this.setState({
      step,
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
      setDataFn: (data, callback) => {
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
        return <Container {...pram} />;
    }
  };

  renderFooter = () => {
    let { linkInvite, isNetwork, openLDAP, canLDAP, hideRegister, intergrationScanEnabled, scanUrl } = this.state;
    const isBindAccount = !!request.unionId;
    return (
      <React.Fragment>
        {!isBindAccount && (
          <React.Fragment>
            <div className="tpLogin TxtCenter">
              {(!isNetwork || canLDAP || !_.isEmpty(scanUrl)) && <div className="title">{_l('或')}</div>}
              {!_.isEmpty(scanUrl) && (
                <div className="mBottom20">
                  <a href={scanUrl} title={_l('企业微信登录')}>
                    <i className="workWeixinIcon hvr-pop"></i>
                  </a>
                </div>
              )}
              {canLDAP && (
                <span
                  className="changeLoginType Hand Font14 Gray_75"
                  onClick={() => {
                    this.setState({
                      openLDAP: !openLDAP,
                    });
                  }}
                >
                  {!openLDAP ? _l('切换LDAP登录') : _l('切换系统账户登录')}
                </span>
              )}
              <div className="Clear"></div>
            </div>
            <div className={cx({ line: !hideRegister, mTop80: !canLDAP })}></div>
          </React.Fragment>
        )}
        {!hideRegister && (
          <span
            className="btnUseOldAccount Hand"
            onClick={() => {
              if (linkInvite) {
                location.href = linkInvite;
              } else {
                let request = getRequest();
                let returnUrl = request.ReturnUrl || '';
                if (returnUrl.indexOf('type=privatekey') > -1) {
                  location.href = '/register.htm?ReturnUrl=' + encodeURIComponent(returnUrl);
                } else if (isBindAccount) {
                  location.href = `/register.htm?state=${request.state}&tpType=${request.tpType}&unionId=${request.unionId}`;
                } else {
                  location.href = '/register.htm';
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

  showLangChang = () => {
    $('.showLangChangeBottom').removeClass('Hidden');
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    } else {
      return (
        <div className="loginBox">
          <div className="loginContainer">
            <div className="titleHeader">
              {this.state.isNetwork && this.state.logo && <img src={this.state.logo} height={30} />}
              {this.state.isNetwork && <p className="Font17 Gray mAll0 mTop8">{this.state.text}</p>}
            </div>
            {this.renderCon()}
            {this.renderFooter()}
            {this.showLangChang()}
          </div>
          <ChangeLang />
        </div>
      );
    }
  }
}

ReactDOM.render(<LoginContainer />, document.querySelector('#app'));
