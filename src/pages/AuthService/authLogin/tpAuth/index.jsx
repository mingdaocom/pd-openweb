import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSetState } from 'react-use';
import { LoadDiv } from 'ming-ui';
import loginController from 'src/api/login';
import { LoginResult } from 'src/pages/AuthService/login/config.js';
import { getDataByFilterXSS } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { setPssId } from 'src/utils/pssId';
import { checkLogin } from 'src/utils/sso';
import { Wrap } from './style';

const request = getRequest();

const TPTYPES = {
  weixin: 1,
  qq: 2,
  xiaomi: 4,
  sso: 5,
  haers: 7,
};
function Container(props) {
  const [{ account, password, unionId, state, tpType, returnUrl, autoLogin, bindSuc, loading }, setState] = useSetState(
    {
      account: request.account,
      password: request.password,
      unionId: request.unionId,
      state: request.state,
      tpType: request.tpType,
      returnUrl: request.ReturnUrl || request.returnUrl || '',
      autoLogin: request.autoLogin,
      bindSuc: false,
      loading: true,
    },
  );

  useEffect(() => {
    if ((unionId && state && tpType) || (account && password)) {
      const isApp = window.isDingTalk || window.isWxWork || window.isWeLink || window.isFeiShu;
      if (isApp && checkLogin()) {
        const redirectUrl = returnUrl ? getDataByFilterXSS(returnUrl) : '/dashboard';
        window.location.replace(redirectUrl);
      } else {
        login();
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const login = () => {
    let loginAjax = null;
    if (account && password) {
      loginAjax = loginController.tPMDAccountLogin({
        account: decodeURIComponent(account),
        password: decodeURIComponent(password),
      });
    } else {
      loginAjax = loginController.tPLogin({
        unionId,
        state,
        tpType,
      });
    }
    loginAjax.then(data => {
      if (!data) {
        // 没有对应的unionid记录
        window.location.replace('/login');
      } else {
        if (!data.accountId) {
          // 没有绑定过账号
          setState({ loading: false });
          if (tpType == TPTYPES.sso) {
            alert(_l('登录失败'), 2, 5000);
          } else {
            const params = `?state=${state}&tpType=${tpType}&unionId=${unionId}`;
            navigateTo(`/register${params}`);
          }
        } else {
          if (data.accountResult === LoginResult.accountSuccess) {
            import('src/common/preall').then(preall => {
              preall.default({ type: 'function' });
              setPssId(data.sessionId, autoLogin);
              // 登录成功
              if (data.isLoginState) {
                setState({ bindSuc: true, loading: false });
                setTimeout(() => {
                  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    window.open('', '_top');
                    window.top.close();
                  } else {
                    window.close();
                  }
                  if (window.opener) {
                    window.opener.location.href = window.opener.location.href;
                  }
                }, 2000);
              } else {
                const redirectUrl = returnUrl || '/dashboard';
                window.location.replace(redirectUrl);
              }
            });
          } else {
            // 登录失败
            alert(data.accountResult === LoginResult.userFromError ? _l('账号来源类型受限') : _l('登录失败'), 2, 5000);
          }
        }
      }
    });
  };
  return (
    <Wrap>
      <div class="main">
        {loading ? (
          <LoadDiv size="big" className="mTop80" />
        ) : (
          <div class="tpLoginContent">
            {bindSuc && (
              <div class="tpAutoBind">
                <div class="Left sucIcon"></div>
                <div class="Left txt">{_l('绑定成功')}</div>
                <div class="Clear"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </Wrap>
  );
}

const root = createRoot(document.getElementById('app'));

root.render(<Container />);
