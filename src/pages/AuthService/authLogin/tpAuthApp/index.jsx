import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DocumentTitle from 'react-document-title';
import { LoadDiv } from 'ming-ui';
import preall from 'src/common/preall';
import { getRequest } from 'src/utils/common';
import { HintText, LoginDialog, LoginTitle, ReturnButton, Wrap } from './style';

const request = getRequest();

function Container() {
  const [showDialog, setShowDialog] = useState(false);
  const [schemeUrl, setSchemeUrl] = useState('');

  const showLoginSuccessDialog = (response, appscheme) => {
    const accessToken = response?.access_token || '';
    const refreshToken = response?.refresh_token || '';
    const expiresIn = response?.expires_in || '';

    // 构建 scheme URL
    const url =
      appscheme +
      '://ssocallback?access_token=' +
      encodeURIComponent(accessToken) +
      '&refresh_token=' +
      encodeURIComponent(refreshToken) +
      '&expires_in=' +
      encodeURIComponent(expiresIn);

    setSchemeUrl(url);
    setShowDialog(true);
    window.location.href = url;
  };

  const login = () => {
    const xhr = new XMLHttpRequest();
    const ApiUrl = md.global.Config.ApiUrl;
    xhr.open('POST', ApiUrl + '/oauth2/h5login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            // 如果存在 appscheme，显示对话框并返回 scheme URL
            if (request.appscheme) {
              showLoginSuccessDialog(response, request.appscheme);
            }
            const ua = navigator.userAgent;
            const isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            const info = {
              sessionId: '',
              type: 'native',
              settings: {
                action: 'login',
                accessTokenInfo: response,
              },
            };
            const string = JSON.stringify(info);
            const base64 = window.btoa(string);
            if (isIOS) {
              window.webkit.messageHandlers.MD_APP_REQUEST.postMessage(base64);
            } else {
              window.Android.MD_APP_REQUEST(base64);
            }
          } else {
            alert(_l('登录失败!'), 2);
          }
        }
      }
    };
    xhr.send(JSON.stringify(request));
  };

  useEffect(() => {
    login();
  }, []);

  const handleReturnClick = () => {
    if (schemeUrl) {
      window.location.href = schemeUrl;
    }
  };

  return (
    <>
      <DocumentTitle title={_l('登录')} />
      <Wrap className="ThemeBG w100">
        {showDialog ? (
          <LoginDialog className="WhiteBG TxtCenter w100">
            <LoginTitle className="Bold">{_l('已完成登录')}</LoginTitle>
            <ReturnButton className="White pointer w100" onClick={handleReturnClick}>
              {_l('点击返回App')}
            </ReturnButton>
            <HintText>{_l('若未自动返回App,请点击按钮返回。')}</HintText>
          </LoginDialog>
        ) : (
          <LoadDiv size="big" className="mTop80" />
        )}
      </Wrap>
    </>
  );
}

const WrappedComp = preall(Container, { allowNotLogin: true });

const root = createRoot(document.getElementById('app'));
root.render(<WrappedComp />);
