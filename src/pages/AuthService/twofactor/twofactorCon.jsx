import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { get } from 'lodash';
import loginAjax from 'src/api/login';
import { LoginResult } from 'src/pages/AuthService/login/config.js';
import { loginSuccessRedirect } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { setPssId } from 'src/utils/pssId';

function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function Twofactor(props) {
  let { type, sendFn, state, isFail } = props;
  let [codeLoading, setCodeLoading] = useState(true); // 已发送并在30内true
  let [verifyCodeText, setVerifyCodeText] = useState('');
  let [sending, setSending] = useState(false);
  let [verifyCode, setVerifyCodeSecond] = useState('');
  let [seconds, setSeconds] = useState(30);
  let [account, setAccount] = useState('');
  const [{ warnTxt, focusDiv }, setState] = useSetState({
    warnTxt: '',
    focusDiv: '',
  });

  useEffect(() => {
    let t = type === 1 ? props.telTime : props.emailTime;
    let now = new Date();
    let se = parseInt(30 - parseInt(now - t) / 1000);
    let isIn30 = se <= 30 && se > 0;
    if (isFail || !isIn30) {
      setSeconds(-1);
      setVerifyCodeText('');
      setCodeLoading(false);
    }
    if (isIn30) {
      setCodeLoading(true);
      setSeconds(se);
      setVerifyCodeText(_l('%0秒后重发', se));
    }
    setAccount(type === 1 ? props.tel : props.email);
  }, [isFail, type, props.telTime, props.emailTime]);
  let code = useRef(null);
  useInterval(
    () => {
      if (seconds <= 0) {
        setVerifyCodeText('');
        setCodeLoading(false);
      } else {
        setVerifyCodeText(_l('%0秒后重发', seconds));
        setSeconds(seconds - 1);
      }
    },
    seconds >= 0 ? 1000 : null,
  );

  // 获取验证码
  const handleSendVerifyCode = () => {
    if (codeLoading || verifyCodeText) {
      return;
    }
    sendFn({
      btnCb: () => {
        setCodeLoading(true);
      },
    });
  };
  //确认逻辑
  const sendCode = () => {
    if (sending) {
      return;
    }
    if (!verifyCode) {
      setState({ warnTxt: _l('请输入验证码'), focusDiv: 'txtLoginCode' });
      code.current.focus();
      return;
    }
    setSending(true);
    onLogin();
  };

  const onLogin = () => {
    loginAjax
      .mDTwofactorLogin({
        state,
        type,
        verifyCode,
      })
      .then(res => {
        const { accountResult } = res;
        const {
          accountSuccess,
          accountError,
          verifyCodeError,
          accountNotExist,
          userFromError,
          needTwofactorVerifyCode,
          invalidVerifyCode,
        } = LoginResult;
        if (accountResult === accountSuccess) {
          setPssId(res.sessionId);
          let data = { sessionId: res.sessionId, state: state };
          //手机端来源 postMessage
          if (window.isMingDaoApp) {
            if (get(window, ['webkit', 'messageHandlers', 'Save', 'postMessage'])) {
              window.webkit.messageHandlers.Save.postMessage(data);
            } else {
              let str = JSON.stringify(data);
              window.Android.Save(str);
            }
          } else {
            loginSuccessRedirect();
          }
        } else {
          setSending(false);
          let msg = '';
          if (accountResult === userFromError) {
            msg = _l('账号来源类型受限');
          } else if ([accountError, accountNotExist].includes(accountResult)) {
            msg = _l('该账号未注册');
          } else if (accountResult === verifyCodeError) {
            msg = _l('验证码错误');
          } else if (accountResult === invalidVerifyCode) {
            msg = _l('验证码失效');
          } else if (accountResult === needTwofactorVerifyCode) {
            //代表用户未进入两步验证流程
            navigateTo('/login');
          } else {
            msg = _l('验证失败');
          }
          alert(msg, 3);
        }
      })
      .catch(error => {
        console.log(error);
        setSending(false);
      });
  };

  return (
    <div className="">
      <span
        className="mTop40 Font15 InlineBlock Hand backspaceT"
        onClick={() => {
          // 返回上一层
          window.localStorage.removeItem('LoginCheckList'); //避免自动登录过来的带LoginCheckList来回跳转
          window.history.back();
        }}
      >
        <span className="backspace"></span>
        {_l('返回')}
      </span>
      <div className="titleHeader">
        <div className={cx('title mTop20')}>{_l('登录两步验证')}</div>
        <div className="mTop8">
          {!account ? (
            <span className="Gray_75">
              {_l('使用绑定的')}
              <b className="Gray"> {type === 2 ? _l('邮箱') : _l('手机号')} </b>
              {_l('接收验证码')}
            </span>
          ) : (
            <span className="Gray_75">
              {_l('验证码已发送至')}
              <b className="Gray"> {account} </b>
            </span>
          )}
        </div>
      </div>
      {account && (
        <div className="messageBox mTop15">
          <div
            className={cx('warnTxtDiv GreenWarn')}
            dangerouslySetInnerHTML={{
              __html: _l('验证码发送成功'),
            }}
          ></div>
        </div>
      )}
      <div className="messageBox mTop30">
        <div
          className={cx('mesDiv', {
            hasValue: !!verifyCode || 'txtLoginCode' === focusDiv,
            errorDiv: !!warnTxt,
            warnDiv: 'txtLoginCode' === focusDiv,
            errorDivCu: !!focusDiv && warnTxt,
          })}
        >
          <input
            type="text"
            maxLength="6"
            className="loginInput Left txtLoginCode"
            value={verifyCode}
            ref={code}
            placeholder={verifyCode}
            onBlur={() => setState({ focusDiv: '' })}
            onFocus={() => setState({ focusDiv: 'txtLoginCode' })}
            onChange={e => {
              setVerifyCodeSecond(e.target.value.replace(/[^\d]/g, ''));
            }}
          />
          <input
            disabled={codeLoading}
            type="button"
            className={cx('btn btnSendVerifyCode Right', {
              btnDisabled: codeLoading,
              btnEnabled: !codeLoading,
            })}
            id="btnSendVerifyCode"
            value={verifyCodeText || (codeLoading ? _l('再次获取...') : !account ? _l('获取验证码') : _l('再次获取'))}
            onClick={() => {
              handleSendVerifyCode();
            }}
          />
          <div
            className="title"
            onClick={() => {
              code.current.focus();
            }}
          >
            {_l('验证码')}
          </div>
          {warnTxt && <div className={'warnTips'}>{warnTxt}</div>}
        </div>
        <span
          className="btnForLogin Hand mTop80"
          onClick={() => {
            sendCode();
          }}
        >
          {sending ? _l('确认...') : _l('确认')}
        </span>
      </div>
    </div>
  );
}
