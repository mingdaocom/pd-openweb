import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { captcha } from 'ming-ui/functions';
import loginController from 'src/api/login';
import { maskValue } from 'src/pages/Admin/security/account/utils';
import { browserIsMobile, getRequest } from 'src/utils/common';
import { encrypt } from 'src/utils/common';
import { removePssId } from 'src/utils/pssId';
import OtpInput from '../../components/Inputs/OtpInput';
import { CodeTypeEnum } from '../../config.js';
import { TwofactorType } from '../../twofactor/config';
import { isTel } from '../../util.js';
import { Wrap } from '../style.jsx';
import { loginCallback } from '../util.js';

export default function (props) {
  const { onChange = () => {}, verifyLen = 6, isNetwork, emailOrTel, dialCode } = props;

  const [{ loading, timeLeft, isfrequentLogin, loginLoading, otp, hasError, hasSend }, setState] = useSetState({
    loading: false,
    timeLeft: 60,
    isfrequentLogin: false,
    loginLoading: false,
    otp: '',
    hasError: false, // 验证码是否错误
    hasSend: false, // 验证码发送接口是否成功（用于控制是否显示提示文案）
  });
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setState({ timeLeft: timeLeft - 1 });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    //填写完整=>进入登录接口
    if (otp.replace(/[^\d]/g, '').trim().length >= verifyLen) {
      onLogin();
    }
    // 当用户开始输入新的验证码时，重置错误状态
    if (hasError && otp.length > 0) {
      setState({ hasError: false });
    }
  }, [otp]);

  //发送验证码
  const sendForVerifyCodeLogin = (data, codeType = CodeTypeEnum.message) => {
    const { emailOrTel, dialCode } = props;
    let { ticket, randstr } = data;
    loginController
      .sendLoginVerifyCode({
        ticket,
        randStr: randstr,
        captchaType: md.global.getCaptchaType(),
        account: encrypt(dialCode + emailOrTel),
        lang: getCurrentLangCode(),
        verifyCodeType: codeType,
      })
      .then(res => {
        const { actionResult } = res;
        const errorMessages = {
          8: _l('发送验证码过于频繁'),
          5: _l('账号不正确'),
          21: _l('当前账户已锁定，验证码发送失败'),
        };

        if (actionResult === 1) {
          // 1、发送成功
          setState({ timeLeft: 60, hasError: false, hasSend: true }); // 发送成功时重置错误状态并标记为已发送
        } else if (actionResult === 3) {
          // 3：前端图形验证码校验失败
          setState({ hasSend: false }); // 发送失败，不显示文案
          otpInputRef.current?.resetSending(); // 重置发送状态，允许重新发送
          onSend(codeType, true);
        } else {
          // 其他错误情况
          setState({ hasSend: false }); // 发送失败，不显示文案
          otpInputRef.current?.resetSending(); // 重置发送状态，允许重新发送
          alert(errorMessages[actionResult] || _l('验证码发送失败'), 3);
        }
      })
      .catch(error => {
        setState({ hasSend: false }); // 接口调用失败，不显示文案
        otpInputRef.current?.resetSending(); // 重置发送状态，允许重新发送
        alert(_l('验证码发送失败'), 3);
        console.log(error);
      });
  };

  //图形验证
  const onSend = (codeType, isfrequentLogin) => {
    if (timeLeft > 0 && !isfrequentLogin) {
      return;
    }
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        // 图形验证失败，重置发送状态，允许重新发送
        otpInputRef.current?.resetSending();
        return;
      }
      sendForVerifyCodeLogin(res, codeType);
    };
    const onCancel = () => {
      // 取消图形验证时，重置 OtpInput 的发送状态
      otpInputRef.current?.resetSending();
    };
    new captcha(callback, onCancel);
  };

  const onLogin = () => {
    const request = getRequest();
    if (loginLoading) return;
    setState({ loginLoading: true });

    const loginFetch = res => {
      const { emailOrTel, isCheck, dialCode } = props;
      let account = emailOrTel;
      let params = {
        verifyCode: otp,
        isCookie: isCheck,
      };
      if (res) {
        params.ticket = res.ticket;
        params.randStr = res.randstr;
        params.captchaType = md.global.getCaptchaType();
      }
      removePssId();
      let cb = data => {
        setState({ loginLoading: false, hasError: data.accountResult !== 1 });
        const msgStyle = browserIsMobile() ? { 'margin-top': '180px' } : {};
        // 3：验证码错误，这个复用之前密码错误的状态码
        if (data.accountResult === 3) {
          alert({
            msg: _l('验证码错误'),
            type: 3,
            style: msgStyle,
          });
          return;
        }
        // 0：如果没有点击发送过验证码，直接返回失败
        if (data.accountResult === 0) {
          alert({
            msg: _l('登录失败'),
            type: 3,
            style: msgStyle,
          });
          return;
        }
        // 11：验证码过期或者失效，需要重新发送 用户再次点击发送验证码
        if ([11].includes(data.accountResult)) {
          setState({ isfrequentLogin: true });
          alert({
            msg: _l('验证码过期或者失效'),
            type: 3,
            style: msgStyle,
          });
          return;
        }
        //5频繁登录错误，需要验证码
        if ([5].includes(data.accountResult)) {
          setState({ isfrequentLogin: true });
          alert({
            msg: _l('验证码错误'),
            type: 3,
            style: msgStyle,
          });
          return;
        }
        loginCallback({
          data: { ...props, ...data },
          onChange: data => onChange(data),
        });
      };
      params.account = encrypt(dialCode + account.trim());
      params.state = request.state;
      params.unionId = request.unionId;
      params.tpType = request.tpType;
      params.regFrom = request.s;
      if (request.appkey) {
        params.appKey = request.appkey;
      }
      loginController.mDAccountLogin(params).then(data => {
        data.account = account;
        data.loginType = 0;
        cb(data);
      });
    };
    if (isfrequentLogin) {
      new captcha(loginFetch);
    } else {
      loginFetch();
    }
  };
  return (
    <Wrap>
      <div className={`titleHeader flexRow alignItemsCenter Bold ${isNetwork ? 'mTop32' : 'mTop40'}`}>
        <div
          className="Hand back textSecondary ThemeHoverColor3"
          onClick={() => {
            onChange({ step: '' });
          }}
        >
          <Tooltip title={_l('返回上一步')} placement="bottom">
            <>
              <Icon icon="backspace mRight8 Font18" />
              <span className="Font15">{_l('返回')}</span>
            </>
          </Tooltip>
        </div>
      </div>
      <div className="WordBreak Font26 mTop20 Bold textPrimary">{_l('验证您的身份')}</div>
      {loading ? (
        <LoadDiv className="" style={{ margin: '50px auto' }} />
      ) : (
        <div>
          {hasSend && (
            <div className="txt Font15 mTop16 textPrimary LineHeight24">
              {isTel(emailOrTel)
                ? _l(
                    '已发送短信至%0，请输入您收到的动态验证码完成验证',
                    maskValue(dialCode + emailOrTel, 'mobilePhone'),
                  )
                : _l('已发送邮件至%0，请输入您收到的动态验证码完成验证', maskValue(emailOrTel))}
            </div>
          )}
          <OtpInput
            ref={otpInputRef}
            value={otp}
            onChange={value => setState({ otp: value })}
            verifyLen={verifyLen}
            timeLeft={timeLeft}
            onSend={() => onSend()}
            type={isTel(emailOrTel) ? TwofactorType.mobilePhone : TwofactorType.email}
            hasError={hasError}
            hasSend={hasSend}
          />
        </div>
      )}
    </Wrap>
  );
}
