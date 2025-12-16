import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import preall from 'src/common/preall';
import 'src/pages/AuthService/components/form.less';
import { WrapCom } from 'src/pages/AuthService/style.jsx';
import { browserIsMobile } from 'src/utils/common';
import { getRequest } from 'src/utils/sso';
import Container from './Container';
import Info from './Info';
import { Wrap, WrapWx } from './style';
import TPAuth from './TpAuthLogin';
import { accountResultAction, getCurrentExt, getCurrentId, isErrSet, setAutoLoginKey, statusList } from './util';

function ContainerCon(props) {
  const [baseSetInfo, setBaseSetInfo] = useState({}); //门户配置
  const [loading, setLoading] = useState(true);
  const [{ account, accountId }, setAccount] = useSetState({ account: '', accountId: '' });
  const [paramForPcWx, setParamForPcWx] = useState(); //pc端二维码扫码后的返回值
  const [appId, setAppId] = useState('');
  const [isWXOfficialExist, setIsWXOfficialExist] = useState(false);
  const [isErrUrl, setIsErrUrl] = useState(false); // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数
  //0登录  1注册成功 2您的账号已停用 3待审核 4 审核未通过! 12您访问的门户成员已满额 10000  你访问的链接错误! 20000  你访问的链接已停止访问 是否进入填写信息  9 收集信息
  const [status, setStatus] = useState(0);
  const [isAutoLogin, setAutoLogin] = useState(true); //是否自动登录
  const [
    { currentAppId, fixInfo, state, documentTitle, customLink, isTpauth, isWXauth, loginForType, authorizerInfo },
    setState,
  ] = useSetState({
    currentAppId: '',
    fixInfo: {},
    state: '', //微信跳转回到登录需要带的信息
    documentTitle,
    customLink: '',
    isTpauth: false, //是否进入微信登录流程 weixin回跳的地址
    isWXauth: false, //是否手机微信扫码进入外部门户登录页面
    loginForType: '', //微信点击相应登录方式
    authorizerInfo: {}, //微信公众号信息
  });

  useEffect(() => {
    window.clientId = '';
    sessionStorage.removeItem('clientId');
    if (window.location.pathname.indexOf('wxscanauth') >= 0) {
      //手机微信扫码后=>获取跳转地址
      const request = getRequest();
      const { state = '' } = request;
      // 二维码所需的临时状态码
      externalPortalAjax.getSelfTpLoginUrlInfo({ state }).then(function (res) {
        if (!res) {
          //应用状态不对，没返回URL
          setLoading(false);
          setStatus(10000); //你访问的链接错误
        } else {
          safeLocalStorageSetItem('pcScan', res);
          location.href = res; // 跳转到登录
        }
      });
    } else {
      getCurrentId((id, suffix) => {
        const ext = getCurrentExt(id, suffix);
        setState({
          currentAppId: id,
          customLink:
            ext || (window.isWeiXin && id !== 'NotExist' ? localStorage.getItem(`${id}_portalCustomLink`) : ''),
        });
        window.localStorage.removeItem(`${id}_portalCustomLink`);
      });
    }
  }, []);

  useEffect(() => {
    currentAppId &&
      onAutoLogin(() => {
        if (window.location.pathname.indexOf('wxauth') >= 0) {
          //微信登录的流程
          setState({ isTpauth: true });
          setLoading(false);
        } else {
          //手机验证码登录流程
          getUrlData();
        }
      });
  }, [currentAppId]);

  useEffect(() => {
    //手机验证码登录流程
    !!paramForPcWx && getUrlData();
  }, [paramForPcWx]);

  //自动登录
  const onAutoLogin = cb => {
    const autoLoginKey = window.localStorage.getItem(`PortalLoginInfo-${currentAppId}`) || '';
    if (autoLoginKey) {
      externalPortalAjax.autoLogin({ appId: currentAppId, autoLoginKey }).then(res => {
        const { accountResult } = res;
        setAutoLoginKey({ ...res, appId: currentAppId }, !window.isWeiXin || accountResult === 1);
        if (accountResult === 1) {
          accountResultAction({ ...res, appId: currentAppId });
        } else {
          cb();
        }
      });
    } else {
      cb();
    }
  };

  const getUrlData = () => {
    let request = getRequest();
    if (paramForPcWx) {
      request = paramForPcWx;
    }
    const { wxState = '', mdAppId = '', accountId = '' } = request;
    request.status && setStatus(Number(request.status));
    wxState && setState({ state: wxState });
    accountId && setAccount({ accountId });
    request.mdAppId && setAppId(request.mdAppId);
    if (!request.status || (request.mdAppId && request.status)) {
      if (request.mdAppId && request.wxState) {
        window.clientId = request.wxState;
        sessionStorage.setItem('clientId', request.wxState);
        window.shareState.isPublicFormPreview = true;
        window.shareState.isPublicForm = true;
      }
      //微信登录后的跳转 进入正常登录流程 带mdAppId 获取登录相关配置信息
      getBaseInfo({
        cb: res => {
          if (window.isWeiXin && !request.status) {
            //微信打开 并且不是wxauth 跳转来的
            const { portalSetResult = {}, isWXOfficialExist, isExist } = res;
            const { loginMode = {}, isEnable } = portalSetResult;
            const { weChat } = loginMode;
            if (isWXOfficialExist && weChat && isEnable && isExist) {
              //配置了微信登录//且 门户开启 门户存在
              //进入微信登录落地页
              setLoading(false);
              setState({ isWXauth: true });
            } else {
              //没有配置微信登录 直接进入手机号登录流程
              setLoading(false);
            }
          } else {
            // 流览器打开 直接进入手机号登录流程
            if (
              customLink &&
              !_.get(res, 'portalSetResult.registerMode.email') &&
              !_.get(res, 'portalSetResult.registerMode.phone')
            ) {
              setStatus(40); //自定义链接无效
            }
            setLoading(false);
          }
        },
      });
    } else {
      setLoading(false);
      if (request.status && !mdAppId) {
        //带了状态 但是没有返回 mdAppId
        setStatus(10000); //你访问的链接错误
      }
      // 根据当前链接的status 呈现页面
    }
  };

  //根据appid 或  domainName 获取当前应用的登录页面 以及应用状态
  const getBaseInfo = ({ cb }) => {
    let domainName = '';
    let ajaxPromise = '';
    let request = getRequest();
    if (paramForPcWx) {
      request = paramForPcWx;
    }
    const param = customLink ? { customLink } : {};
    const { mdAppId = '', accountId = '' } = request;
    if (!mdAppId) {
      //从returnUrl里提取appid
      domainName = currentAppId;
      if (!domainName) {
        setStatus(10000);
        setLoading(false);
        return false;
      }
      setAppId(domainName);
      ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId: domainName, ...param });
    } else {
      accountId && setAccount({ accountId });
      domainName = mdAppId;
      setAppId(domainName);
      ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId: domainName, ...param });
    }
    if (!domainName) {
      setStatus(10000);
      setLoading(false);
      return false;
    }
    ajaxPromise &&
      ajaxPromise.then(res => {
        const { portalSetResult = {}, authorizerInfo = {}, isExist, status, isWXOfficialExist } = res;
        const { isEnable, appId } = portalSetResult;
        setAppId(appId);
        setState({
          documentTitle: portalSetResult.pageTitle ? _l('登录/注册 - %0', portalSetResult.pageTitle) : _l('登录/注册'),
        });
        const isErrCustomUrl = customLink && isErrSet(portalSetResult);
        if (status === 12) {
          setIsErrUrl(true); // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数
        }
        if (status === 40 || isErrCustomUrl) {
          //扩展链接不存在 || 你访问的链接已停止访问
          setStatus(40);
          setLoading(false);
          setState({ customLink: '' });
        }
        if (!isEnable || !isExist) {
          !isEnable && setStatus(20000);
          !isExist && setStatus(10000);
          setLoading(false);
        }
        setState({ fixInfo: { fixAccount: res.fixAccount, fixRemark: res.fixRemark }, authorizerInfo });
        setBaseSetInfo(portalSetResult);
        // setBaseSetInfo({ ...portalSetResult, autoLogin: !false });
        setIsWXOfficialExist(isWXOfficialExist);
        if (statusList.includes(status)) {
          //直接进入相应状态页面
          setStatus(status);
          setLoading(false);
        } else {
          cb && cb(res);
        }
      });
  };

  if (loading) {
    return <LoadDiv className="" style={{ margin: '120px auto' }} />;
  }
  if (isWXauth) {
    const { loginMode = {}, registerMode = {} } = baseSetInfo;
    return (
      <WrapWx className="flexColumn">
        {baseSetInfo.logoImageUrl ? <img src={baseSetInfo.logoImageUrl} height={40} /> : ''}
        <p className="Font26 Gray mAll0 Bold pageTitle flex" style={{ WebkitBoxOrient: 'vertical' }}>
          {baseSetInfo.pageTitle}
        </p>
        <div className="actCon">
          <div
            className="wxLogin flexRow alignItemsCenter justifyContentCenter"
            onClick={() => {
              //进入对应授权登录流程
              const { appId } = baseSetInfo;
              externalPortalAjax.getTpLoginUrlInfo({ appId }).then(res => {
                setLoading(false);
                customLink && window.isWeiXin
                  ? safeLocalStorageSetItem(`${appId}_portalCustomLink`, customLink)
                  : window.localStorage.removeItem(`${appId}_portalCustomLink`);
                window.location.href = res; //进入微信授权=>微信登录 流程
                //微信登录 的地址应该是 wxauth?xxxxxxx参数
              });
            }}
          >
            <Icon type="wechat" />
            {_l('微信一键登录')}
          </div>
          {(registerMode.email || registerMode.phone) && (
            <React.Fragment>
              {loginMode.phone && (
                <div
                  className="phoneLogin flexRow alignItemsCenter justifyContentCenter"
                  onClick={() => {
                    //进入对应登录流程
                    setState({ isWXauth: false, loginForType: 'phone' });
                  }}
                >
                  <Icon type="phone" />
                  {_l('验证码登录')}
                </div>
              )}
              {loginMode.password && (
                <div
                  className="passwordLogin flexRow alignItemsCenter justifyContentCenter"
                  onClick={() => {
                    //进入对应登录流程
                    setState({ isWXauth: false, loginForType: 'password' });
                  }}
                >
                  <Icon type="lock" />
                  {_l('密码登录')}
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </WrapWx>
    );
  }
  const renderCon = () => {
    const param = {
      ...props,
      status,
      isAutoLogin,
      setStatus: data => setStatus(data),
      ...baseSetInfo,
      appId,
      state,
      account,
      setAccount: data => setAccount({ ...data }),
      fixInfo,
      customLink,
    };
    return (
      <React.Fragment>
        {baseSetInfo.pageMode === 6 && (
          <div
            className={cx('backImageUrl', { isM: browserIsMobile() })}
            style={{ backgroundImage: `url(${baseSetInfo.backImageUrl})` }}
          />
        )}
        {isTpauth ? (
          <TPAuth customLink={customLink} />
        ) : status === 9 ? (
          <Info {...param} accountId={accountId} />
        ) : (
          <Container
            {...param}
            setAutoLogin={setAutoLogin}
            setLogState={state => setState({ state })}
            getBaseInfo={getBaseInfo}
            isErrUrl={isErrUrl}
            isWXOfficialExist={isWXOfficialExist}
            authorizerInfo={authorizerInfo}
            setParamForPcWx={setParamForPcWx}
            paramForPcWx={paramForPcWx}
            loginForType={loginForType}
            loginForTypeBack={() => setState({ isWXauth: true, loginForType: '' })}
          />
        )}
      </React.Fragment>
    );
  };
  return (
    <WrapCom>
      <Wrap
        style={
          baseSetInfo.backGroundType !== 6
            ? { backgroundColor: baseSetInfo.backColor }
            : baseSetInfo.pageMode !== 6
              ? { backgroundImage: `url(${baseSetInfo.backImageUrl})` }
              : {}
        }
        className={cx({ isCenter: baseSetInfo.pageMode !== 6 })}
      >
        <DocumentTitle title={documentTitle} />
        {baseSetInfo.pageMode !== 6 ? <div className="con">{renderCon()}</div> : renderCon()}
      </Wrap>
    </WrapCom>
  );
}

const WrappedComp = preall(ContainerCon, { allowNotLogin: true });
const root = createRoot(document.getElementById('app'));

root.render(<WrappedComp />);
