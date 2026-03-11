import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import styled from 'styled-components';
import filterXSS from 'xss';
import { Icon } from 'ming-ui';
import loginAjax from 'src/api/login';
import OtpInput from 'src/pages/AuthService/components/Inputs/OtpInput';
import { LoginResult } from 'src/pages/AuthService/login/config.js';
import { loginSuccessRedirect } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { browserIsMobile } from 'src/utils/common';
import { setPssId } from 'src/utils/pssId';
import { TwofactorType } from './config';

const WrapOtherLogin = styled.div`
  padding-top: 66px;
  min-height: 220px;
`;

const TitleSwitchOther = styled.div`
  color: var(--color-text-secondary);
`;
const MethodItem = styled.div`
  color: var(--color-text-title);
  i {
    color: var(--color-text-tertiary);
  }
  ${props =>
    !props.isMobile &&
    `
    &:hover {
      color: var(--color-primary) !important;
      i {
        color: var(--color-primary) !important;
      }
    }
  `}
`;

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

const Twofactor = forwardRef(function Twofactor(props, ref) {
  const verifyLen = 6;
  const { type, sendFn, state, isFail, enabledTypes = [], mobilePhone, email, hasSend = false } = props;
  const [verifyCode, setVerifyCodeSecond] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [hasError, setHasError] = useState(false); // 验证码是否错误
  const otpInputRef = useRef(null);

  const messageMap = {
    [TwofactorType.totp]: _l('请输入%0 身份验证器应用 %1生成的动态验证码', '<span class="Bold">', '</span>'),
    [TwofactorType.mobilePhone]: _l(
      '已发送短信至 %0, 请输入您收到的动态验证码完成验证',
      `<span class="Bold">${filterXSS(mobilePhone)}</span>`,
    ),
    [TwofactorType.email]: _l(
      '已发送邮件至 %0, 请输入您收到的动态验证码完成验证',
      `<span class="Bold">${filterXSS(email)}</span>`,
    ),
  };

  const methodTextMap = {
    [TwofactorType.mobilePhone]: _l('使用手机 %0 验证', mobilePhone),
    [TwofactorType.email]: _l('使用邮箱 %0 验证', email),
    [TwofactorType.totp]: _l('使用验证器应用验证'),
  };

  const methodIconMap = {
    [TwofactorType.mobilePhone]: 'phone',
    [TwofactorType.email]: 'email',
    [TwofactorType.totp]: 'gpp_good',
  };
  useEffect(() => {
    //填写完整=>进入登录接口
    if (verifyCode.replace(/[^\d]/g, '').trim().length >= verifyLen) {
      onLogin();
    }
    // 当用户开始输入新的验证码时，重置错误状态
    if (hasError && verifyCode.length > 0) {
      setHasError(false);
    }
  }, [verifyCode]);

  // 切换验证方式时，如果不是 TOTP，禁用重新发送按钮
  useEffect(() => {
    const isTotp = type === TwofactorType.totp;
    if (!isTotp) {
      otpInputRef.current?.setSending?.(true);
    }
  }, [type]);

  useEffect(() => {
    // TOTP验证方式不需要倒计时，验证码由验证器应用生成
    if (type === TwofactorType.totp) {
      setSeconds(-1);
      return;
    }
    const timeMap = props.timeMap || {};
    const t = timeMap[type];
    if (!t) {
      setSeconds(-1);
      return;
    }
    const now = new Date();
    const se = parseInt(30 - parseInt((now - t) / 1000));
    const isIn30 = se <= 30 && se > 0;
    if (isFail || !isIn30) {
      setSeconds(-1);
    }
    if (isIn30) {
      setSeconds(se);
    }
  }, [isFail, type, props.timeMap]);
  useInterval(
    () => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    },
    seconds >= 0 ? 1000 : null,
  );

  // 获取验证码的回调函数
  const getSendFnCallbacks = () => {
    const resetError = () => {
      setHasError(false); // 发送验证码时重置错误状态
    };
    return {
      onSuccess: resetError,
      onError: resetError,
      onCancel: () => {
        // 取消图形验证时，重置 OtpInput 的发送状态
        otpInputRef.current?.resetSending();
      },
    };
  };

  // 暴露回调函数和重置方法给父组件
  useImperativeHandle(ref, () => ({
    getSendFnCallbacks,
    resetOtpSending: () => {
      otpInputRef.current?.resetSending?.();
    },
    setOtpSending: value => {
      otpInputRef.current?.setSending?.(value);
    },
  }));

  // 获取验证码
  const handleSendVerifyCode = () => {
    if (seconds > 0) {
      return;
    }
    sendFn();
  };

  const onBack = () => {
    // 返回上一层
    window.localStorage.removeItem('LoginCheckList'); //避免自动登录过来的带LoginCheckList来回跳转
    window.history.back();
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
          if (accountResult === needTwofactorVerifyCode) {
            //代表用户未进入两步验证流程
            navigateTo('/login');
            return;
          }
          if (type === TwofactorType.totp && invalidVerifyCode === accountResult) {
            alert({
              msg: _l('验证码尝试次数过多，请返回重新进行登录再试！'),
              type: 3,
              onClose: () => {
                if (window.isMingDaoApp) {
                  window.md_js.back({ closeAll: true });
                  return;
                } else {
                  onBack();
                }
              },
            });
            return;
          }
          const errorMsgMap = {
            [userFromError]: _l('账号来源类型受限'),
            [verifyCodeError]: _l('验证码错误'),
            [invalidVerifyCode]: _l('验证码失效'),
          };
          let msg = errorMsgMap[accountResult];
          if (!msg) {
            msg = [accountError, accountNotExist].includes(accountResult) ? _l('该账号未注册') : _l('验证失败');
          }
          if (msg) {
            alert(msg, 3);
            // 验证失败后不清空验证码，而是设置错误状态并聚焦到最后
            setHasError(true);
          }
        }
      })
      .catch(error => {
        console.log(error);
        // 发生错误时不清空验证码，而是设置错误状态并聚焦到最后
        setHasError(true);
      });
  };

  return (
    <div className="">
      {!window.isMingDaoApp && (
        <span
          className="mTop30 Font15 InlineBlock Hand backspaceT"
          onClick={() => {
            onBack();
          }}
        >
          <span className="backspace"></span>
          {_l('返回')}
        </span>
      )}
      <div className="titleHeader">
        <div className={cx('title Bold TxtMiddle textPrimary', window.isMingDaoApp ? 'mTop40' : 'mTop20')}>
          {_l('验证您的身份')}
        </div>
        {hasSend && (
          <div
            className="mTop8 Font15 textPrimary LineHeight24"
            dangerouslySetInnerHTML={{
              __html: messageMap[type],
            }}
          />
        )}
      </div>
      <div className="mTop32">
        <OtpInput
          ref={otpInputRef}
          value={verifyCode}
          onChange={setVerifyCodeSecond}
          verifyLen={6}
          timeLeft={seconds > 0 ? seconds : 0}
          onSend={handleSendVerifyCode}
          type={type}
          hasError={hasError}
          hasSend={hasSend}
        />
        <WrapOtherLogin>
          {enabledTypes.length > 1 ? (
            <>
              <TitleSwitchOther className="Font15">{_l('其他验证方式')}</TitleSwitchOther>
              {enabledTypes
                .filter(t => t !== type)
                .map((method, index) => (
                  <MethodItem
                    key={index}
                    isMobile={browserIsMobile()}
                    className={cx('Font15 Hand flexRow alignItemsCenter', index === 0 ? 'mTop30' : 'mTop20')}
                    onClick={() => {
                      if (props.onSwitchType) {
                        props.onSwitchType(method);
                        setVerifyCodeSecond('');
                      }
                    }}
                  >
                    <Icon icon={methodIconMap[method]} className="mRight8 Font18" />
                    <span>{methodTextMap[method]}</span>
                  </MethodItem>
                ))}
            </>
          ) : null}
        </WrapOtherLogin>
      </div>
    </div>
  );
});

export default Twofactor;
