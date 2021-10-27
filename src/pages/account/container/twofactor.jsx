import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import Config from '../config';
import { mDTwofactorLogin } from 'src/api/login';
import { inputFocusFn, inputBlurFn } from '../util';
import { getRequest } from 'src/util';
import { setPssId } from 'src/util/pssId';
import '../components/message.less';
import { get } from 'lodash';
import { getDataByFilterXSS } from '../util';
let request = getRequest();
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
  const ActionResult = {
    failed: 0, //失败
    success: 1, // 成功
    accountError: 2, // 账号不存在
    passwordError: 3, // 密码错误
    verifyCodeError: 4, // 验证码错误
    accountNotExist: 7, // 账号不存在
    userFromError: 8, // 账号来源类型受限
    noTwofactorLogin: 10, //代表用户未进入两步验证流程
    invalidVerifyCode: 11, //验证码失效；
  };
  let { updataState, type, sendFn, state, isFail } = props;
  let [codeLoading, setCodeLoading] = useState(true); // 已发送并在30内true
  let [warnningText, setWarnningText] = useState(_l('请输入验证码'));
  let [verifyCodeText, setVerifyCodeText] = useState('');
  let [sending, setSending] = useState(false);
  let [verifyCode, setVerifyCodeSecond] = useState('');
  let [seconds, setSeconds] = useState(30);
  let [account, setAccount] = useState('');
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
      $(code)
        .closest('.mesDiv')
        .addClass('errorDiv');
      code.current.focus();
      return;
    }
    setSending(true);
    loginFn();
  };

  const loginFn = () => {
    mDTwofactorLogin({
      state,
      type,
      verifyCode,
    }).then(res => {
      const { accountResult } = res;
      const {
        failed,
        success,
        accountError,
        passwordError,
        verifyCodeError,
        accountNotExist,
        userFromError,
        noTwofactorLogin,
        invalidVerifyCode,
      } = ActionResult;
      if (accountResult === success) {
        setPssId(res.sessionId);
        const ua = navigator.userAgent.toLowerCase();
        let data = { sessionId: res.sessionId, state: state };
        //手机端来源 postMessage
        if (ua.indexOf('mingdao') >= 0) {
          if (get(window, ['webkit', 'messageHandlers', 'Save', 'postMessage'])) {
            window.webkit.messageHandlers.Save.postMessage(data);
          } else {
            let str = JSON.stringify(data);
            window.Android.Save(str);
          }
        } else {
          if (request.ReturnUrl) {
            location.replace(getDataByFilterXSS(request.ReturnUrl));
          } else {
            window.location.replace('/app/my');
          }
        }
      } else {
        setSending(false);
        var msg = '';
        if (accountResult === userFromError) {
          msg = _l('账号来源类型受限');
        } else if ([accountError, accountNotExist].includes(accountResult)) {
          msg = _l('该帐号未注册');
        } else if (accountResult === verifyCodeError) {
          msg = _l('验证码错误');
        } else if (accountResult === invalidVerifyCode) {
          msg = _l('验证码失效');
        } else if (accountResult === noTwofactorLogin) {
          //代表用户未进入两步验证流程
          window.location.replace('/login');
        } else {
          msg = _l('验证失败');
        }
        alert(msg, 3);
      }
    });
  };
  return (
    <div className="">
      <span
        className="mTop40 Font15 InlineBlock Hand backspaceT"
        onClick={() => {
          // 返回上一层
          window.history.back();
        }}
      >
        <span className="backspace"></span>
        {_l('返回')}
      </span>
      <div className="titleHeader">
        <div className={cx('title mTop20')}>{_l('登录两步验证')}</div>
        <div className="mTop8">
          {type === 2 && !account ? (
            <span style={{ color: '#757575' }}>
              {_l('使用绑定的')}
              <b style={{ color: '#333' }}> {_l('邮箱')} </b>
              {_l('接收验证码')}
            </span>
          ) : (
            account && (
              <span style={{ color: '#757575' }}>
                {_l('验证码已发送至')}
                <b style={{ color: '#333' }}> {account} </b>
              </span>
            )
          )}
        </div>
      </div>
      {!account ? (
        ''
      ) : (
        <div className="messageBox mTop15">
          <div
            className={cx('warnningDiv warnningGreen')}
            dangerouslySetInnerHTML={{
              __html: _l('验证码发送成功'),
            }}
          ></div>
        </div>
      )}
      <div className="messageBox mTop30">
        <div className={cx('mesDiv', { current: !!verifyCode })}>
          <input
            type="text"
            maxLength="6"
            className="loginInput Left txtLoginCode"
            value={verifyCode}
            ref={code}
            placeholder={verifyCode}
            onBlur={inputBlurFn}
            onFocus={inputFocusFn}
            onChange={e => {
              $('.errorDiv').removeClass('errorDiv');
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
            onClick={e => {
              handleSendVerifyCode(Config.CodeTypeEnum.message);
            }}
          />
          <div
            className="title"
            onClick={e => {
              code.current.focus();
            }}
          >
            {_l('验证码')}
          </div>
          {!!warnningText && <div className={cx('warnningTip Hidden')}>{warnningText}</div>}
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
