import React, { useEffect } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { initIntlTelInput } from 'ming-ui/components/intlTelInput';
import appManagementController from 'src/api/appManagement';
import loginController from 'src/api/login';
import privateSysSetting from 'src/api/privateSysSetting';
import projectApi from 'src/api/project';
import Footer from 'src/pages/AuthService/components/Footer.jsx';
import 'src/pages/AuthService/components/form.less';
import { browserIsMobile, getRequest } from 'src/utils/sso';
import WrapBg from '../components/Bg';
import Header from '../components/Header';
import { WrapCom } from '../style';
import { checkReturnUrl, getDataByFilterXSS, isTel } from '../util';
import Container from './Container';
import { loginCallback, ssoLogin } from './util';

export default function Login() {
  const request = getRequest();
  const [state, setState] = useSetState({
    modeType: 1, // 1:手机号邮箱 2:用户名登录 其他:不使用账户登录方式
    verifyType: request.loginModeType === 'verify' ? 'verifyCode' : 'password', //验证方式 'passWord' 密码 'verifyCode' 验证码
    step: '', //verifyCode 验证码 默认账户
    isNetwork: location.href.indexOf('network') >= 0 || md.global.Config.IsLocal,
    hideOther:
      window.isMiniProgram || // 小程序隐藏第三方登录入口
      !!request.unionId || //第三方
      request.loginMode === 'systemLogin' || //  指定进到平台登陆,隐藏其他登陆方式
      window.isMingDaoApp, //  移动端app登录,隐藏其他登陆方式
    loading: true,
    warnList: [], //报错信息
    openLDAP: false, //是否开启LDAP
    isOpenSystemLogin: true, //是否允许平台登录
    intergrationScanEnabled: false, //开启企业微信扫码登录
    linkInvite: '',
    companyName: '',
    title: _l('登录'),
    loadProjectName: false,
    projectNameLang: '', // 组织简称多语言翻译
    verifyResult: '',

    projectId: request.projectId || '',
    dialCode: '',
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '', // 8-20位，需包含字母和数字
    fullName: '', // 姓名
    isCheck: false,
    logo: '',
    hasGetLogo: false,
    isDefaultLogo: false,
    state: request.state || '',
    firstSendVerifyCode: false,
  });

  useEffect(() => {
    onInit();
  }, []);

  const onInit = () => {
    const request = getRequest();
    //检测是否已登录
    loginController.checkLogin().then(data => {
      if (data) {
        if (request.ReturnUrl) {
          checkReturnUrl(request.ReturnUrl);
          location.replace(getDataByFilterXSS(request.ReturnUrl));
          return;
        }
        location.href = browserIsMobile() ? `/mobile/dashboard` : `/dashboard`;
        return;
      }
    });
    //检查是否sso登录
    ssoLogin(request.ReturnUrl);
    //获取本地缓存的登录信息
    const {
      accountId = '',
      encryptPassword = '',
      account = '',
      projectId = '',
      loginType = 0,
      time,
      ua,
    } = JSON.parse(window.localStorage.getItem('LoginCheckList') || '{}');

    const toAutoLogin =
      !(request.unionId || !accountId || !encryptPassword || (loginType === 1 && (!projectId || !account))) &&
      (!time || Math.ceil((new Date() - new Date(time)) / (1000 * 60 * 60 * 24)) <= 14);
    //检查是否自动登录
    if (toAutoLogin) {
      let param = { loginType, accountId, encryptPassword };
      if (loginType === 1) {
        param = { ...param, account, projectId };
      }
      loginController.mDAccountAutoLogin({ ...param, regFrom: request.s }).then(data => {
        const { projectId, modeType, isNetwork } = state;
        //自动登录失败后，直接进入到登录界面
        if (data.accountResult !== 1) {
          setState({ loading: false });
          console.log(ua, data);
          return;
        }
        loginCallback({
          data: { ...data, projectId, modeType, isNetwork },
          onChange: data => setState(data),
        });
      });
    } else {
      //进入登录流程  回填上次缓存的账号信息
      const loginName = window.localStorage.getItem('LoginName');
      const loginLDAPName = window.localStorage.getItem('LoginLDAPName');
      if (loginName || loginLDAPName) {
        let dialCode = '';
        if (loginName && isTel(loginName)) {
          const iti = initIntlTelInput();
          dialCode = `+${iti.getSelectedCountryData().dialCode}`;
        }
        setState({ emailOrTel: loginName || '', fullName: loginLDAPName || '', dialCode });
      }
      if (!state.isNetwork) {
        setState({ loading: false });
      } else {
        getProjectBaseInfo();
      }
    }
  };

  //获取登录页面相关配置信息
  const getProjectBaseInfo = () => {
    const request = getRequest();
    projectApi.getProjectSubDomainInfo({ host: location.host, projectId: request.projectId || '' }).then(async res => {
      if (!res || !res.companyName) {
        location.replace('/privateImageInstall');
        return;
      }
      let googleSsoSet;
      if (md.global.Config.IsLocal) {
        googleSsoSet = await privateSysSetting.getSsonSettingsFroLogin({});
      }
      //request.loginMode === 'systemLogin' 指定平台账号登录方式
      if (request.loginMode === 'systemLogin') {
        res.openLDAP = false;
        res.isOpenSystemLogin = true;
      }
      setState({
        ...res,
        googleSsoSet,
        modeType: res.openLDAP ? 2 : 1, // 1:手机号邮箱 2:用户名登录
        linkInvite: res.projectId ? `/linkInvite?projectId=${res.projectId}` : '',
        title: res.companyName,
        homeImage: res.homeImage,
        logo: res.logo,
        isDefaultLogo: res.isDefaultLogo,
        hasGetLogo: true,
      });
      if (res.projectId) {
        getProjectLang(res.projectId);
      } else {
        setState({ loading: false });
      }
    });
  };

  //网络名称多语言
  const getProjectLang = projectId => {
    appManagementController.getProjectLang({ projectId }).then(res => {
      setState({
        loading: false,
        projectNameLang: _.get(
          _.find(res, o => o.langType === getCurrentLangCode()),
          'data[0].value',
        ),
      });
    });
  };

  return (
    <WrapCom>
      <DocumentTitle title={state.title} />
      <WrapBg homeImage={state.homeImage} />
      <div className="loginBox">
        <div className="loginContainer">
          <Header
            lineLoading={state.lineLoading}
            logo={state.logo}
            hasGetLogo={state.hasGetLogo}
            isDefaultLogo={state.isDefaultLogo}
            loading={state.loading}
          />
          <Container {...state} onChange={state => setState({ ...state })} />
        </div>
      </div>
      {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
    </WrapCom>
  );
}
