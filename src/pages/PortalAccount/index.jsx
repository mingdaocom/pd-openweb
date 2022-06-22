import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import cx from 'classnames';
import 'uploadAttachment';
import { browserIsMobile } from 'src/util';
import Container from './Container';
import TPAuth from './tpAuth';
import Info from './Info';
import { LoadDiv } from 'ming-ui';
import { getRequest } from 'src/util/sso';
import { statusList, urlList } from './util';
import { getPortalSetByDomain, getTpLoginUrlInfo, getPortalSetByAppId } from 'src/api/externalPortal';
import preall from 'src/common/preall';
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
function ContainerCon(props) {
  const [isTpauth, setIsTpauth] = useState(false); //是否进入微信登录流程 weixin回跳的地址
  const [baseSetInfo, setBaseSetInfo] = useState({}); //门户配置
  const [authorizerInfo, setAuthorizerInfo] = useState({}); //微信公众号信息
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(''); //微信跳转回到登录需要带的信息
  const [account, setAccount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paramForPcWx, setParamForPcWx] = useState();//pc端二维码扫码后的返回值
  const [appId, setAppId] = useState('');
  const [isWXOfficialExist, setIsWXOfficialExist] = useState(false);
  const [isErrUrl, setIsErrUrl] = useState(false); // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数
  const [status, setStatus] = useState(0); //0登录  1注册成功 2您的账号已停用 3待审核 4 审核未通过! 12您访问的门户成员已满额 10000  你访问的链接错误! 20000  你访问的链接已停止访问 是否进入填写信息  status = 9
  const isWeiXin = () => {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (window.location.pathname.indexOf('wxauth') >= 0) {
      //微信登录的流程
      setIsTpauth(true);
      setLoading(false);
    } else {
      //手机验证码登录流程
      getUrlData();
    }
  }, []);

  useEffect(() => {
    //手机验证码登录流程
    !!paramForPcWx && getUrlData();
  }, [paramForPcWx]);

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
              const { appId, projectId } = portalSetResult;
              getTpLoginUrlInfo({
                appId, //应用ID
                projectId, //网络ID
                wxAppId: authorizerInfo.appId, //微信公众号应用ID
              }).then(res => {
                setLoading(false);
                window.location.href = res; //进入微信授权=>微信登录 流程
                //微信登录 的地址应该是 wxauth?xxxxxxx参数
              });
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
    let href = decodeURIComponent(location.href);
    let request = getRequest();
    if (!!paramForPcWx) {
      request = paramForPcWx;
    }
    const { wxState = '', status = '', mdAppId = '', accountId = '' } = request;
    if (!mdAppId) {
      //从returnUrl里提取appid
      urlList.map(o => {
        if (href.indexOf(o) >= 0) {
          domainName = href.substr(href.indexOf(o) + o.length, 36);
        }
      });
      setAppId(domainName);
      ajaxPromise = getPortalSetByAppId({ appId: domainName });
    } else {
      accountId && setAccountId(accountId);
      if (mdAppId) {
        domainName = mdAppId;
        setAppId(domainName);
        ajaxPromise = getPortalSetByAppId({ appId: domainName });
      } else {
        let domainNames = location.host.split('.');
        domainName = location.host.split(
          '.' + domainNames[domainNames.length - 2] + '.' + domainNames[domainNames.length - 1],
        )[0];
        ajaxPromise = getPortalSetByDomain({ domainName: domainName });
      }
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
          accountId={accountId}
          setStatus={setStatus}
          {...baseSetInfo}
          appId={appId}
          state={state}
          setState={state => setState(state)}
          account={account}
          setAccount={setAccount}
        />
      ) : (
        <Container
          {...props}
          state={state}
          status={status}
          setStatus={setStatus}
          setAccountId={setAccountId}
          setState={state => setState(state)}
          {...baseSetInfo}
          appId={appId}
          getBaseInfo={getBaseInfo}
          account={account}
          setAccount={setAccount}
          isErrUrl={isErrUrl}
          isWXOfficialExist={isWXOfficialExist}
          authorizerInfo={authorizerInfo}
          setParamForPcWx={setParamForPcWx}
          paramForPcWx={paramForPcWx}
        />
      )}
    </Wrap>
  );
}

const WrappedComp = preall(ContainerCon, { allownotlogin: true });

ReactDOM.render(<WrappedComp />, document.querySelector('#app'));
