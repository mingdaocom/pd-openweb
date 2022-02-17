import React, { useState, useEffect, useRef } from 'react';
import { getRequest } from 'src/util';
import { tpLogin } from 'src/api/externalPortal';
import { accountResultAction } from './util';
import { LoadDiv } from 'ming-ui';
import styled from 'styled-components';
const Wrap = styled.div`
  flex: 1;
  .pTop120 {
    padding-top: 120px;
  }
`;
export default function TPAuth(props) {
  useEffect(() => {
    login();
  }, []);

  const goPortalLogin = subUrl => {
    location.href = `${window.subPath || ''}/login?${subUrl}`; // 跳转到登录
  };

  const login = () => {
    const request = getRequest();
    const { state = '', appid = '', code = '', ReturnUrl = '' } = request;
    tpLogin({
      state,
      wxAppId: appid,
      code,
    }).then(function (res) {
      const { accountResult, sessionId, state, accountId } = res;
      let mdAppId = res.appId;
      if (accountResult === 1) {
        accountResultAction(res);
      } else {
        goPortalLogin(`mdAppId=${mdAppId || ''}&wxState=${res.state || ''}&status=${accountResult}&accountId=${accountId}`);
      }
    });
  };

  return (
    <Wrap>
      <div className="pTop120">
        <LoadDiv className="" style={{ margin: '30px auto' }} />
      </div>
      <p className="" style={{ textAlign: 'center' }}>
        {_l('微信授权登录中...')}
      </p>
    </Wrap>
  );
}
