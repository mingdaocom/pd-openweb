import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import Container from './loginContainer';
import projectApi from 'src/api/project';
import { getRequest, browserIsMobile } from 'src/util';
import { checkLogin } from 'src/util/sso';
import { LoadDiv } from 'ming-ui';
import { getDataByFilterXSS, initIntlTelInput, isTel } from 'src/pages/accountLogin/util.js';
import DocumentTitle from 'react-document-title';
import { Wrap } from './style.jsx';
import { ssoLogin, getWorkWeiXinCorpInfoByApp } from './util';
import ChangeLang from 'src/components/ChangeLang';
import { navigateTo } from 'src/router/navigateTo';
import loginController from 'src/api/login';

let request = getRequest();

const mapStateToProps = ({ accountInfo, stateList, warnningData }) => ({
  loginData: accountInfo,
  loading: stateList.loading,
  stateList,
  warnningData,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);
@connect(mapStateToProps, mapDispatchToProps)
export default class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNetwork: location.href.indexOf('network') >= 0 || md.global.Config.IsLocal,
      useMessage: true,
      loginMode: 1, //1.手机/邮箱登录 2.用户名登录（LDAP)
      hideOther:
        isMiniProgram || // 小程序隐藏第三方登录入口
        !!request.unionId || //第三方
        request.loginMode == 1, //  直接进到平台登陆,隐藏其他登陆方式
      openLDAP: false, //是否开启LDAP
      isOpenSystemLogin: true, //是否允许平台登录
      intergrationScanEnabled: false, //开启企业微信扫码登录
      projectId: request.projectId,
      linkInvite: '',
      companyName: '',
      title: _l('登录'),
    };
  }

  componentDidMount() {
    const { loginCallback = () => {}, setData = () => {}, setLoading = () => {} } = this.props;
    if (checkLogin()) {
      if (request.ReturnUrl) {
        location.replace(getDataByFilterXSS(request.ReturnUrl));
        return;
      }
      location.href = browserIsMobile() ? `/mobile` : `/app`;
      return;
    }
    ssoLogin(request.ReturnUrl);
    const {
      accountId = '',
      encryptPassword = '',
      account = '',
      projectId = '',
      loginType = 0,
    } = JSON.parse(window.localStorage.getItem('LoginCheckList') || '{}');
    if (!(request.unionId || !accountId || !encryptPassword || (loginType === 1 && (!projectId || !account)))) {
      //自动登录
      let param = { loginType, accountId, encryptPassword };
      if (loginType === 1) {
        param = { ...param, account, projectId };
      }
      loginController.mDAccountAutoLogin({ ...param, regFrom: request.s }).then(data =>
        loginCallback({
          ...data,
          projectId: projectId || this.state.projectId,
          loginMode: this.state.loginMode,
          isNetwork: this.state.isNetwork,
        }),
      );
    } else {
      // 回填上次缓存的账号信息
      const loginName = window.localStorage.getItem('LoginName');
      const loginLDAPName = window.localStorage.getItem('LoginLDAPName');
      if (loginName || loginLDAPName) {
        let dialCode = '';
        if (loginName && isTel(loginName)) {
          const iti = initIntlTelInput();
          dialCode = `+${iti.getSelectedCountryData().dialCode}`;
        }
        setData({ emailOrTel: loginName || '', fullName: loginLDAPName || '', dialCode });
      }
      if (!this.state.isNetwork) {
        setLoading(false);
      }
      this.getProjectBaseInfo();
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  getProjectBaseInfo = () => {
    const { setData = () => {}, setLoading = () => {} } = this.props;
    if (!this.state.isNetwork) {
      return;
    }
    projectApi
      .getProjectSubDomainInfo({
        host: location.host,
        projectId: request.projectId || '',
      })
      .then(res => {
        if (!res || !res.companyName) {
          location.replace('/privateImageInstall');
          return;
        }
        this.setState({
          ...res,
          //request.loginMode == 1 =>进入默认的平台登陆
          loginMode: request.loginMode == 1 ? 1 : res.openLDAP ? 2 : 1,
          linkInvite: res.projectId ? `/linkInvite?projectId=${res.projectId}` : '',
          title: res.companyName,
          //可通过输入账号的方式登录
          useMessage:
            request.loginMode == 1 ||
            res.openLDAP || //开启了LDAP
            res.isOpenSystemLogin || //开启了平台登录
            this.state.hideOther, //  当前环境关闭了其他登录方式，保留默认登录方式托底
        });
        setData({ homeImage: res.homeImage, logo: res.logo });
        setLoading(false);
      });
  };

  render() {
    const { setData = () => {} } = this.props;
    const {
      isNetwork,
      title,
      companyName,
      useMessage,
      loginMode,
      projectId,
      linkInvite,
      hideOther,
      intergrationScanEnabled,
      isOpenSso,
      ssoWebUrl,
      ssoAppUrl,
      openLDAP,
      isOpenSystemLogin,
      ssoName,
      ldapName,
    } = this.state;
    const isMobile = browserIsMobile();
    const scanLoginEnabled = intergrationScanEnabled && !isMobile;
    const isCanWeixin = !isNetwork && !isMobile;
    const isCanQQ = !isNetwork;
    const canChangeSysOrLDAP = openLDAP && isOpenSystemLogin && isNetwork;
    return (
      <React.Fragment>
        <Wrap>
          <DocumentTitle title={title} />
          {this.props.loading ? (
            <LoadDiv className="" style={{ margin: '50px auto' }} />
          ) : (
            <React.Fragment>
              <div className="titleHeader">
                {isNetwork && !_.get(md, 'global.SysSettings.hideBrandName') && (
                  <p className="Font17 Gray mAll0 mTop8">{companyName}</p>
                )}
              </div>
              <div
                className={`titleHeader flexRow alignItemsCenter Bold ${isNetwork ? 'mTop30' : 'mTop40'}
              `}
              >
                <div className="title WordBreak hTitle" style={{ WebkitBoxOrient: 'vertical' }}>
                  {loginMode === 2 ? ldapName || _l('LDAP登录') : _l('登录%14002')}
                </div>
              </div>
              {useMessage && (
                <Container
                  warnningData={this.props.warnningData}
                  {...this.props.loginData}
                  {..._.pick(this.props, ['isValid', 'setData', 'loginCallback'])}
                  loginMode={loginMode}
                  projectId={projectId}
                  isNetwork={isNetwork}
                />
              )}
              {!hideOther && (
                <div className="tpLogin">
                  {/* 开启了ldap或系统登录,并且存在其他登录方式 */}
                  {useMessage && (canChangeSysOrLDAP || scanLoginEnabled || isOpenSso || isCanWeixin || isCanQQ) && (
                    <div className="title Font14">{_l('或通过以下方式')}</div>
                  )}
                  {canChangeSysOrLDAP && (
                    <a
                      onClick={() => {
                        this.setState({
                          loginMode: loginMode === 1 ? 2 : 1,
                        });
                        this.props.setData({
                          password: '',
                          isCheck: false,
                        });
                        this.props.updateWarn([]);
                      }}
                      className="WordBreak overflow_ellipsis Block pLeft10 pRight10"
                    >
                      {loginMode === 1 ? ldapName || 'LDAP登录' : _l('平台账号登录')}
                    </a>
                  )}
                  {isOpenSso && <a href={isMobile ? ssoAppUrl : ssoWebUrl}>{ssoName || 'SSO登录'}</a>}
                  {scanLoginEnabled && (
                    <a onClick={() => getWorkWeiXinCorpInfoByApp(projectId, request.ReturnUrl)}>
                      <i className="workWeixinIcon mRight8" /> {_l('企业微信登录')}
                    </a>
                  )}
                  {isCanWeixin && (
                    <a href="//tp.mingdao.com/weixin/authRequest">
                      <i className="weixinIcon mRight8" /> {_l('微信登录')}
                    </a>
                  )}
                  {isCanQQ && (
                    <a href="//tp.mingdao.com/qq/authRequest">
                      <i className="personalQQIcon mRight8" /> {_l('QQ登录')}
                    </a>
                  )}
                </div>
              )}
              {isMiniProgram && (
                <div className="flexRow alignItemsCenter justifyContentCenter mTop25 Gray_75">
                  {_l('此小程序仅支持组织内部员工登录使用')}
                </div>
              )}
              <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
                {!isMiniProgram && !_.get(md, 'global.SysSettings.hideRegister') && (
                  <React.Fragment>
                    <span
                      className="changeBtn Hand TxtRight"
                      onClick={() => {
                        this.props.updateWarn([]);
                        if (md.global.Config.IsPlatformLocal) {
                          //平台版=>/register
                          navigateTo('/register');
                        } else if (linkInvite) {
                          setData({ isLink: true, projectId: projectId });
                          navigateTo(linkInvite);
                        } else {
                          let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');
                          if (returnUrl.indexOf('type=privatekey') > -1) {
                            navigateTo('/register?ReturnUrl=' + encodeURIComponent(returnUrl));
                          } else if (request.unionId) {
                            setData({
                              TPParams: {
                                unionId: request.unionId,
                                state: request.state,
                                tpType: parseInt(request.tpType) || 0,
                              },
                            });
                            navigateTo(
                              `/register?state=${request.state}&tpType=${request.tpType}&unionId=${request.unionId}`,
                            );
                          } else {
                            navigateTo('/register');
                          }
                        }
                      }}
                    >
                      {_l('注册新账号')}
                    </span>
                    <span className="lineCenter mLeft24"></span>
                  </React.Fragment>
                )}
                <div className="mLeft16 TxtLeft">
                  <ChangeLang className="justifyContentLeft" />
                </div>
              </div>
            </React.Fragment>
          )}
        </Wrap>
      </React.Fragment>
    );
  }
}
