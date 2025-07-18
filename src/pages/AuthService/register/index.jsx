import React, { useEffect, useRef } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import { LoadDiv } from 'ming-ui';
import accountApi from 'src/api/account';
import registerApi from 'src/api/register';
import Footer from 'src/pages/AuthService/components/Footer.jsx';
import 'src/pages/AuthService/components/form.less';
import { AccountNextActions, ActionResult, InviteFromType } from 'src/pages/AuthService/config.js';
import { getDes, getTitle } from 'src/pages/AuthService/register/util.js';
import { getDialCode, isTel } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { htmlEncodeReg } from 'src/utils/common';
import { getRequest } from 'src/utils/sso';
import WrapBg from '../components/Bg';
import Header from '../components/Header';
import { WrapCom } from '../style';
import { Add, CreateComp, CreateOrAdd, EditInfo, Form, InviteLinkExpirate, Name } from './container';
import createPermissionCheckWrapper from './container/createPermissionCheckWrapper';
import { Wrap } from './style';

const Create = createPermissionCheckWrapper(CreateComp);

const defaultNextAction = () => {
  const request = getRequest();
  //url 中的 tpType 参数为 7 或 8 ，则直接进去
  return (request.ReturnUrl || '').indexOf('type=privatekey') > -1 ||
    (request.tpType && [7, 8].includes(parseInt(request.tpType)))
    ? AccountNextActions.login
    : AccountNextActions.createProject;
};

export default function (props) {
  const request = getRequest();
  const [state, setState] = useSetState({
    // modeType: 1, // 1:手机号邮箱 2:用户名登录 其他:不使用账户登录方式
    // verifyType: request.loginModeType === 'verify' ? 'verifyCode' : 'password', //验证方式 'passWord' 密码 'verifyCode' 验证码
    step: 'register',
    loading: true,
    warnList: [], //报错信息
    linkInvite: '',
    companyName: '',
    loadProjectName: false,
    projectNameLang: '', // 组织简称多语言翻译

    projectId: request.projectId || '',
    dialCode: '',
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '', // 8-20位，需包含字母和数字
    fullName: '', // 姓名
    regcode: '', // 企业码
    inviteInfo: [],
    confirmation: request.confirmation || '',
    isLink: !!request.confirmation || location.href.indexOf('linkInvite') >= 0 || location.href.indexOf('join') >= 0,
    onlyRead: false,
    onlyReadName: false,
    loginForAdd: false,
    hasCheckPrivacy: false,
    isApplyJoin: false, // 主动申请加入网络
    TPParams: {
      unionId: request.unionId || '',
      state: request.state || '',
      tpType: parseInt(request.tpType) || 0,
    },
    logo: '',
    hasGetLogo: false,
    isDefaultLogo: false,
    state: request.state || '',
    firstSendVerifyCode: false,
    email: '',

    company: {
      companyName: '',
      departmentId: '',
      jobId: '', // 加入网络使用
      workSiteId: '',
      jobNumber: '',
      job: '', // 加入网络使用
      email: '', // 邮箱
      scaleId: '', // 预计人数
      code: request.code || '',
    },
    nextAction: defaultNextAction(),
    userCard: {},
    tokenProjectCode: '',
    title: getTitle(),
    titleStr: '',
    isFrequentLoginError: false,
    createAccountLoading: false,
    lineLoading: false,
  });

  useEffect(() => {
    onInit();
  }, []);

  const onInit = () => {
    // 注册来源
    const s = request.s || '';
    if (s) {
      safeLocalStorageSetItem('RegFrom', s);
    }
    //私有部署关闭注册入口，跳转到/login
    if (
      _.get(md, 'global.Config.IsLocal') &&
      _.get(md, 'global.SysSettings.hideRegister') &&
      (location.href.indexOf('/register') >= 0 ||
        (location.href.indexOf('/linkInvite') >= 0 && request.projectId) || //主动注册
        ((location.href.indexOf('/enterpriseRegister') >= 0 || location.href.indexOf('/enterpriseRegister') >= 0) &&
          !request.type))
    ) {
      navigateTo('/login');
      return;
    }
    //(加入 ｜ 创建)组织
    if (location.href.match(/enterpriseRegister(\.htm)?/i)) {
      enterpriseRegister();
      initRegisterData();
    } else if (state.isLink) {
      // 公共链接邀请|手机号邮箱邀请
      if (state.confirmation) {
        checkInviteLink();
      } else {
        checkInviteJoin();
      }
    } else {
      initRegisterData();
    }
  };

  //注册相关数据处理
  const initRegisterData = () => {
    let accountInfo = {};
    // 如果 url 带 mobile 参数
    let { mobile } = request;
    if (mobile) {
      let dialCode = '';
      if (isTel(mobile)) {
        mobile = getEmailOrTel(mobile);
        dialCode = getDialCode();
      }
      accountInfo = { emailOrTel: mobile, dialCode };
    }
    if (request.type) {
      accountInfo.step = request.type;
    }
    setState({ ...accountInfo, loading: false });
  };

  // (加入 ｜ 创建)组织
  const enterpriseRegister = async () => {
    switch (request.type) {
      case 'create':
        const accountData = await registerApi.checkExistAccountByCurrentAccount();
        if (accountData.actionResult == ActionResult.success) {
          updateCompany({ email: _.get(accountData, 'user.email') });
        }
        break;
      case 'editInfo':
        const data = await accountApi.checkJoinProjectByTokenWithCard({
          projectId: request.projectId,
          token: request.token,
        });
        if (data.joinProjectResult === 1) {
          // 验证通过
          updateCompany({ companyName: _.get(data, 'userCard.user.companyName') });
          setState({ userCard: data.userCard, tokenProjectCode: data.token });
        }
        break;
    }
  };

  const checkInviteLink = () => {
    registerApi
      .checkInviteLink({
        confirmation: state.confirmation,
        isLink: location.href.indexOf('linkInvite') >= 0,
      })
      .then(data => {
        setState({ loading: false });
        if (data && data.actionResult == ActionResult.success) {
          const { inviteInfo = {}, userCard = {}, logo = '', token } = data;
          let { user = {} } = userCard;
          let { fullname } = user;
          let param = {
            inviteInfo,
            projectId: inviteInfo.sourceId,
            fullName: fullname,
            onlyReadName: !!fullname,
            logo,
            tokenProjectCode: token,
          };
          if (inviteInfo.account) {
            param.emailOrTel = inviteInfo.account;
            param.onlyRead = true;
            param.loginForAdd = !!inviteInfo.isNormal;
            if (isTel(inviteInfo.account)) {
              param.dialCode = getDialCode();
            }
          }
          const titleDesc = getDes(inviteInfo);
          setState({
            ...param,
            company: { ...state.company, companyName: inviteInfo.sourceName },
            userCard,
            nextAction:
              inviteInfo.fromType === InviteFromType.project
                ? AccountNextActions.userCardInfo
                : AccountNextActions.login,
            titleStr: htmlEncodeReg(inviteInfo.sourceName) + titleDesc,
            title: inviteInfo.createUserName + _l('邀请您加入') + inviteInfo.sourceName + titleDesc,
          });
        } else {
          setState({ step: 'inviteLinkExpirate' });
        }
      });
  };

  const checkInviteJoin = () => {
    const { projectId } = state;
    registerApi.checkJoinLink({ projectId }).then(data => {
      setState({ loading: false });
      let actionResult = ActionResult;
      if (data && data.actionResult == actionResult.success) {
        let inviteInfo = data.inviteInfo;
        setState({
          logo: data.logo,
          isDefaultLogo: data.isDefaultLogo,
          hasGetLogo: true,
          inviteInfo,
          isApplyJoin: true,
          nextAction: AccountNextActions.userCardInfo,
          titleStr: inviteInfo.sourceName,
          title: _l('您正在加入') + inviteInfo.sourceName,
          company: { ...state.company, companyName: inviteInfo.sourceName },
          userCard: data.userCard,
        });
      } else {
        setState({ step: 'inviteLinkExpirate' });
      }
    });
  };

  const updateCompany = data => setState({ company: { ...state.company, ...data } });

  const renderCon = () => {
    const param = {
      ..._.cloneDeep(state),
      onChange: state => setState({ ...state }),
      updateCompany,
    };
    switch (state.step) {
      case 'register':
        return <Form {...param} />;
      case 'registerName':
        return <Name {...param} />;
      case 'createOrAdd':
        return <CreateOrAdd {...param} />;
      case 'create':
        return <Create {...param} />;
      case 'add':
        return <Add {...param} />;
      case 'editInfo':
        return <EditInfo {...param} />;
      case 'inviteLinkExpirate':
        return <InviteLinkExpirate />;
    }
  };

  if (state.loading) return <LoadDiv className="mTop80" />;

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
          <Wrap>{renderCon()}</Wrap>
        </div>
      </div>
      {_.get(md, 'global.SysSettings.enableFooterInfo') && <Footer />}
    </WrapCom>
  );
}
