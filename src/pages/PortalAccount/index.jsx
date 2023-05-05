import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import Container from './Container';
import TPAuth from './tpAuth';
import Info from './Info';
import { LoadDiv, Icon } from 'ming-ui';
import { getRequest } from 'src/util/sso';
import { statusList, urlList, getSuffix, accountResultAction, setAutoLoginKey, getCurrentId } from './util';
import externalPortalAjax from 'src/api/externalPortal';
import preall from 'src/common/preall';
import SvgIcon from 'src/components/SvgIcon';

const Wrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
  .backImageUrl {
    background-color: #ebebeb;
    background-position: center;
    flex: 1;
    background-repeat: no-repeat;
    background-size: cover;
    &.isM {
      position: fixed;
      width: 100%;
      min-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
`;
const WrapWx = styled.div`
  padding: 0 32px;
  padding-top: 100px;
  text-align: center;
  img {
    max-width: 100%;
    object-fit: contain;
    margin: 0 auto;
    display: block;
  }
  border-radius: 4px;
  box-sizing: border-box;
  height: 100%;
  background: #fff;
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .pageTitle {
    margin-top: 40px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    width: 100%;
    text-align: center;
    overflow: hidden;
    line-height: 1.5;
  }
  .actCon {
    padding-bottom: 60px;
    & > div {
      text-align: center;
      height: 40px;
      width: 100%;
      border-radius: 4px;
      background: #f8f8f8;
      color: #333;
      line-height: 40px;
      font-size: 14px;
      margin-top: 13px;
      .icon {
        margin-right: 13px;
        font-size: 20px;
        color: #9d9d9d;
      }
      &.wxLogin {
        background: #4caf50;
        color: #ffffff;
        .icon {
          color: #fff;
        }
      }
    }
  }
`;
function ContainerCon(props) {
  const [isTpauth, setIsTpauth] = useState(false); //是否进入微信登录流程 weixin回跳的地址
  const [isWXauth, setIsWXauth] = useState(false); //是否手机微信扫码进入外部门户登录页面
  const [loginForType, setLoginForType] = useState(''); //微信点击相应登录方式
  const [baseSetInfo, setBaseSetInfo] = useState({}); //门户配置
  const [authorizerInfo, setAuthorizerInfo] = useState({}); //微信公众号信息
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(''); //微信跳转回到登录需要带的信息
  const [account, setAccount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paramForPcWx, setParamForPcWx] = useState(); //pc端二维码扫码后的返回值
  const [appId, setAppId] = useState('');
  const [isWXOfficialExist, setIsWXOfficialExist] = useState(false);
  const [isErrUrl, setIsErrUrl] = useState(false); // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数
  const [status, setStatus] = useState(0); //0登录  1注册成功 2您的账号已停用 3待审核 4 审核未通过! 12您访问的门户成员已满额 10000  你访问的链接错误! 20000  你访问的链接已停止访问 是否进入填写信息  status = 9
  const [isAutoLogin, setAutoLogin] = useState(false); //是否自动登录
  const [currentAppId, setCurrentAppId] = useState('');
  const [fixInfo, setFixInfo] = useState({});

  const isWeiXin = () => {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (window.location.pathname.indexOf('wxscanauth') >= 0) {
      //手机微信扫码后=>获取跳转地址
      const request = getRequest();
      const { state = '' } = request;
      externalPortalAjax
        .getSelfTpLoginUrlInfo({
          state, // 二维码所需的临时状态码
        })
        .then(function (res) {
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
      getCurrentId(id => {
        setCurrentAppId(id);
      });
    }
  }, []);

  useEffect(() => {
    currentAppId &&
      onAutoLogin(() => {
        if (window.location.pathname.indexOf('wxauth') >= 0) {
          //微信登录的流程
          setIsTpauth(true);
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
    if (!!autoLoginKey) {
      externalPortalAjax
        .autoLogin({
          appId: currentAppId,
          autoLoginKey,
        })
        .then(res => {
          const { accountResult } = res;
          setAutoLoginKey({ ...res, appId: currentAppId });
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
    if (!!paramForPcWx) {
      request = paramForPcWx;
    }
    const { wxState = '', status = '', mdAppId = '', accountId = '' } = request;
    request.status && setStatus(Number(request.status));
    wxState && setState(wxState);
    accountId && setAccountId(accountId);
    request.mdAppId && setAppId(request.mdAppId);
    if (!request.status || (request.mdAppId && request.status)) {
      //微信登录后的跳转 进入正常登录流程 带mdAppId 获取登录相关配置信息
      getBaseInfo({
        cb: res => {
          if (isWeiXin() && !request.status) {
            //微信打开 并且不是wxauth 跳转来的
            const { portalSetResult = {}, authorizerInfo = {}, isWXOfficialExist, isExist } = res;
            const { loginMode = {}, isEnable } = portalSetResult;
            const { weChat } = loginMode;
            if (isWXOfficialExist && weChat && isEnable && isExist) {
              //配置了微信登录//且 门户开启 门户存在
              //进入微信登录落地页
              setLoading(false);
              setIsWXauth(true);
            } else {
              //没有配置微信登录 直接进入手机号登录流程
              setLoading(false);
            }
          } else {
            // 流览器打开 直接进入手机号登录流程
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
    if (!!paramForPcWx) {
      request = paramForPcWx;
    }
    const { wxState = '', status = '', mdAppId = '', accountId = '' } = request;
    if (!mdAppId) {
      //从returnUrl里提取appid
      domainName = currentAppId;
      if (!domainName) {
        setStatus(10000);
        setLoading(false);
        return false;
      }
      setAppId(domainName);
      ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId: domainName });
    } else {
      accountId && setAccountId(accountId);
      domainName = mdAppId;
      setAppId(domainName);
      ajaxPromise = externalPortalAjax.getPortalSetByAppId({ appId: domainName });
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
        if (portalSetResult.pageTitle) {
          document.title = _l('登录/注册 - %0', portalSetResult.pageTitle);
        } else {
          document.title = _l('登录/注册');
        }
        if (status === 12) {
          setIsErrUrl(true); // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数
        }
        if (!isEnable || !isExist) {
          !isEnable && setStatus(20000);
          !isExist && setStatus(10000);
          setLoading(false);
        }
        setFixInfo({
          fixAccount: res.fixAccount,
          fixRemark: res.fixRemark,
        });
        setAuthorizerInfo(authorizerInfo);
        setBaseSetInfo(portalSetResult);
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
    let appColor = baseSetInfo.appColor || '#00bcd4';
    let appLogoUrl =
      baseSetInfo.appLogoUrl || md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg';
    const { loginMode = {} } = baseSetInfo;
    return (
      <WrapWx className="flexColumn">
        {baseSetInfo.logoImageUrl ? (
          <img src={baseSetInfo.logoImageUrl} height={40} />
        ) : appColor && appLogoUrl ? (
          <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: appColor }}>
            <SvgIcon url={appLogoUrl} fill={'#fff'} size={28} />
          </span>
        ) : (
          ''
        )}
        <p className="Font26 Gray mAll0 Bold pageTitle flex" style={{ WebkitBoxOrient: 'vertical' }}>
          {baseSetInfo.pageTitle}
        </p>
        <div className="actCon">
          <div
            className="wxLogin flexRow alignItemsCenter justifyContentCenter"
            onClick={() => {
              //进入对应授权登录流程
              const { appId } = baseSetInfo;
              externalPortalAjax
                .getTpLoginUrlInfo({
                  appId, //应用ID
                })
                .then(res => {
                  setLoading(false);
                  window.location.href = res; //进入微信授权=>微信登录 流程
                  //微信登录 的地址应该是 wxauth?xxxxxxx参数
                });
            }}
          >
            <Icon type="wechat" />
            {_l('微信一键登录')}
          </div>
          {loginMode.phone && (
            <div
              className="phoneLogin flexRow alignItemsCenter justifyContentCenter"
              onClick={() => {
                //进入对应登录流程
                setLoginForType('phone');
                setIsWXauth(false);
              }}
            >
              <Icon type="phone2" />
              {_l('验证码登录')}
            </div>
          )}
          {loginMode.password && (
            <div
              className="passwordLogin flexRow alignItemsCenter justifyContentCenter"
              onClick={() => {
                //进入对应登录流程
                setLoginForType('password');
                setIsWXauth(false);
              }}
            >
              <Icon type="lock" />
              {_l('密码登录')}
            </div>
          )}
        </div>
      </WrapWx>
    );
  }
  return (
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
      {baseSetInfo.pageMode === 6 && (
        <div
          className={cx('backImageUrl', { isM: browserIsMobile() })}
          style={{ backgroundImage: `url(${baseSetInfo.backImageUrl})` }}
        />
      )}
      {isTpauth ? (
        <TPAuth />
      ) : status === 9 ? (
        //9 收集信息
        <Info
          {...props}
          status={status}
          isAutoLogin={isAutoLogin}
          accountId={accountId}
          setStatus={setStatus}
          {...baseSetInfo}
          appId={appId}
          state={state}
          setState={state => setState(state)}
          account={account}
          setAccount={setAccount}
          fixInfo={fixInfo}
        />
      ) : (
        <Container
          {...props}
          state={state}
          isAutoLogin={isAutoLogin}
          setAutoLogin={setAutoLogin}
          status={status}
          setStatus={setStatus}
          setAccountId={setAccountId}
          setLogState={state => setState(state)}
          {...baseSetInfo}
          fixInfo={fixInfo}
          appId={appId}
          getBaseInfo={getBaseInfo}
          account={account}
          setAccount={setAccount}
          isErrUrl={isErrUrl}
          isWXOfficialExist={isWXOfficialExist}
          authorizerInfo={authorizerInfo}
          setParamForPcWx={setParamForPcWx}
          paramForPcWx={paramForPcWx}
          loginForType={loginForType}
          loginForTypeBack={() => {
            setLoginForType('');
            setIsWXauth(true);
          }}
        />
      )}
    </Wrap>
  );
}

const WrappedComp = preall(ContainerCon, { allownotlogin: true });

ReactDOM.render(<WrappedComp />, document.querySelector('#app'));
