import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { Button, Icon, LoadDiv } from 'ming-ui';
import userAuthorization from 'src/api/userAuthorization';
import preall from 'src/common/preall';
import { getRequest } from 'src/utils/common';
import { ACTION_RESULT, ERROR_MSG, getScopeDisplayListFromScopes } from './constants';
import { BtnGroup, Card, ErrorContent, ErrorIconWrap, LogoWrap, PageWrap, ScopeListWrap } from './style';

function OAuthConsentPage() {
  const {
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    response_type: responseType,
  } = getRequest() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appInfo, setAppInfo] = useState(null);
  const [authorizeLoading, setAuthorizeLoading] = useState(false);

  const userName = _.get(md, 'global.Account.fullname') || _l('当前用户');

  const doAddUserAuthorization = () => {
    setAuthorizeLoading(true);
    const args = { clientId, redirectUri, scope, state, responseType };
    userAuthorization
      .addUserAuthorization(args, { silent: true })
      .then(res => {
        const isSuccess =
          res && [ACTION_RESULT.Success, ACTION_RESULT.ClientAlreadyAuthorized].includes(res.actionResult);

        if (isSuccess) {
          const targetUri = res.redirectUri || redirectUri;

          if (targetUri) {
            alert(_l('授权成功'), 1);
            window.location.href = targetUri;
            return;
          }
        } else {
          alert(_l('授权失败'), 2);
        }

        setAuthorizeLoading(false);
      })
      .catch(() => {
        setAuthorizeLoading(false);
      });
  };

  useEffect(() => {
    const setErrorPage = () => setError({ title: ERROR_MSG.title(), desc: ERROR_MSG.desc() });

    if (!clientId || clientId === 'error') {
      setErrorPage();
      setLoading(false);
      return;
    }

    if (!redirectUri) {
      setErrorPage();
      setLoading(false);
      return;
    }

    const args = { clientId, redirectUri, scope, state, responseType };
    userAuthorization
      .getUserAuthorizationInfo(args, { silent: true })
      .then(res => {
        // 已授权且 Scope 未变：直接调 addUserAuthorization 颁发 code 并跳转，无需展示同意页
        if (res && res.actionResult === ACTION_RESULT.ClientAlreadyAuthorized) {
          setLoading(false);
          doAddUserAuthorization();
          return;
        }

        // 未授权 或 已授权但 Scope 变更：展示应用/用户/Scope 信息，等待用户点击同意后再调接口
        if (
          res &&
          (res.actionResult === ACTION_RESULT.Success || res.actionResult === ACTION_RESULT.ClientScopeChanged)
        ) {
          setAppInfo(res || { name: _l('集成应用'), iconUrl: '' });
          return;
        }

        setErrorPage();
      })
      .catch(setErrorPage)
      .finally(() => {
        setLoading(false);
      });
  }, [clientId, redirectUri]);

  // 点击授权：调用授权接口，成功后跳转接口返回的 redirectUri
  const onAuthorize = () => {
    if (!appInfo || authorizeLoading) return;
    doAddUserAuthorization();
  };

  // 点击取消，关闭窗口，
  const onCancel = () => {
    window.close();
    setTimeout(() => {
      alert(_l('授权已取消'));
    }, 300);
  };

  if (loading) {
    return (
      <PageWrap className="flexCenter justifyContentCenter">
        <LoadDiv size="big" />
      </PageWrap>
    );
  }

  if (error) {
    return (
      <PageWrap className="flexCenter justifyContentCenter pTop40 pBottom40 pLeft24 pRight24">
        <Card>
          <ErrorContent className="flexColumn alignItemsCenter">
            <ErrorIconWrap className="textError mBottom16">
              <Icon icon="close" className="Font48" />
            </ErrorIconWrap>
            <div className="Font20 Bold mBottom8 titleTxt">{error.title}</div>
            <div className="Font16 mBottom32 titleTxt">{error.desc}</div>
          </ErrorContent>
        </Card>
      </PageWrap>
    );
  }

  const appName = appInfo.name || _l('集成应用');
  const appLogo = appInfo.iconUrl || '';
  const displayScopeList =
    appInfo.scopes && appInfo.scopes.length > 0 ? getScopeDisplayListFromScopes(appInfo.scopes) : [];

  return (
    <PageWrap className="flexCenter justifyContentCenter">
      <DocumentTitle
        title={
          !window.platformENV.isOverseas && !window.platformENV.isLocal
            ? _l('%0 请求授权 - 明道云', appName)
            : _l('%0 请求授权', appName)
        }
      />
      <Card>
        <div className="TxtCenter mBottom20">
          {appLogo ? (
            <LogoWrap>
              <img src={appLogo} alt="" />
            </LogoWrap>
          ) : (
            <LogoWrap className="flexCenter boderRadAll_4 logoPlaceholder">
              <Icon icon="android-apps" className="Font28 textWhite" />
            </LogoWrap>
          )}
          <div className="Font20 LineHeight30 titleTxt mBottom16">
            <span className="Bold mRight3">{appName}</span>
            {_l('请求授权')}
          </div>
        </div>
        <div className="topLine mBottom8" />
        {displayScopeList.length > 0 && (
          <div className="mBottom12 titleTxt Font16">
            {_l('授权后该应用将获得')}
            <span className="Bold mRight5 mLeft5">{userName}</span>
            {_l('的以下权限，您可以随时撤销')}
          </div>
        )}
        <ScopeListWrap className="Font13 LineHeight24 mBottom32">
          {displayScopeList.map((item, i) => (
            <li key={i} className="textString">
              {item.prefix ? <span className="Bold">{item.prefix}</span> : null}
              {item.suffix}
            </li>
          ))}
        </ScopeListWrap>
        <BtnGroup className="flexColumn">
          <Button
            type="primary"
            className="w100 Bold boderRadAll_3 authorizeBtn"
            fullWidth
            height={44}
            disabled={authorizeLoading}
            onClick={onAuthorize}
          >
            {authorizeLoading ? _l('授权中...') : _l('授权')}
          </Button>
          <Button
            className="w100 mTop12 boderRadAll_3 Border cancelBtn"
            fullWidth
            height={44}
            type="link"
            onClick={onCancel}
          >
            {_l('取消')}
          </Button>
        </BtnGroup>
      </Card>
    </PageWrap>
  );
}

const WrappedComp = preall(OAuthConsentPage, { allowNotLogin: false });
const root = createRoot(document.querySelector('#app'));
root.render(<WrappedComp />);
