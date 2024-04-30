import React, { useEffect } from 'react';
import { render } from 'react-dom';
import preall from 'src/common/preall';
import { useSetState } from 'react-use';
import { getRequest } from 'src/util';
import loginController from 'src/api/login';
import { setPssId } from 'src/util/pssId';
import { checkLogin } from 'src/util/sso';
import { Wrap } from './style';
const request = getRequest();
import { LoginResult } from 'src/pages/accountLogin/login/config.js';
import { LoadDiv } from 'ming-ui';

const TPTYPES = {
  weixin: 1,
  qq: 2,
  xiaomi: 4,
  sso: 5,
  haers: 7,
};
function Container(props) {
  const [{ account, password, unionId, state, tpType, returnUrl, autoLogin, unBind, bindSuc, loading }, setState] =
    useSetState({
      account: request.account,
      password: request.password,
      unionId: request.unionId,
      state: request.state,
      tpType: request.tpType,
      returnUrl: request.ReturnUrl || request.returnUrl || '',
      autoLogin: request.autoLogin,
      unBind: false,
      bindSuc: false,
      loading: true,
    });

  useEffect(() => {
    if ((unionId && state && tpType) || (account && password)) {
      const isApp = window.isDingTalk || window.isWxWork || window.isWeLink || window.isFeiShu;
      if (isApp && checkLogin()) {
        const redirectUrl = returnUrl || '/dashboard';
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
          setState({
            loading: false,
          });
          if (tpType == TPTYPES.sso) {
            alert(_l('登录失败'), 2, 5000);
          } else {
            setState({
              unBind: true,
            });
          }
        } else {
          if (data.accountResult === LoginResult.accountSuccess) {
            preall({ type: 'function' });
            setPssId(data.sessionId, autoLogin);
            // 登录成功
            if (data.isLoginState) {
              setState({
                bindSuc: true,
                loading: false,
              });
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
          } else {
            // 登录失败
            alert(data.accountResult === LoginResult.userFromError ? _l('账号来源类型受限') : _l('登录失败'), 2, 5000);
          }
        }
      }
    });
  };
  const params = `?state=${state}&tpType=${tpType}&unionId=${unionId}`;
  return (
    <Wrap>
      <div class="main">
        {loading ? (
          <LoadDiv size="big" className="mTop80" />
        ) : (
          <div class="tpLoginContent">
            {bindSuc ? (
              <div class="tpAutoBind">
                <div class="Left sucIcon"></div>
                <div class="Left txt">{_l('绑定成功')}</div>
                <div class="Clear"></div>
              </div>
            ) : (
              unBind && (
                <div class="tpLoginContentArea contianerBGStyle">
                  <div class="title">{_l('还未绑定系统帐号')}</div>
                  <div class="desc">{_l('请选择绑定已有帐户，或创建新帐号')}</div>
                  <div class="mBottom20">
                    <a href={`/login${params}`} class="btn btnEnabled btnBind">
                      {_l('登录并绑定')}
                    </a>
                  </div>
                  {!_.get(md, 'global.SysSettings.hideRegister') && (
                    <div>
                      <a href={`/register${params}`} class="btn btnEnabled btnReg">
                        {_l('注册新帐号')}
                      </a>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Wrap>
  );
}

render(<Container />, document.getElementById('app'));
