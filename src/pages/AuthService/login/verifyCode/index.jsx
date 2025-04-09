import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, Support, Tooltip } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import loginController from 'src/api/login';
import { browserIsMobile, encrypt, getRequest } from 'src/util';
import { removePssId } from 'src/util/pssId';
import { CodeTypeEnum } from '../../config.js';
import { isTel } from '../../util.js';
import { Wrap } from '../style.jsx';
import { loginCallback } from '../util.js';

const WrapCon = styled.div`
  .otp-input-container {
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }

  .otp-input {
    height: 60px;
    text-align: center;
    font-size: 28px;
    margin: 5px;
    box-sizing: border-box;
    outline: none;
    flex: 1;
    border-left: none;
    border-top: none;
    border-right: none;
    border-bottom: 2px solid #ccc;
    max-width: 10%;
    font-weight: 700;
    padding: 0;
    background: transparent;
    text-align: center;
    border-radius: 0;
    &:focus {
      background: transparent !important;
    }
  }
`;

export default function (props) {
  const { onChange = () => {}, verifyLen = 6, isNetwork, emailOrTel, dialCode } = props;

  const [{ loading, timeLeft, isfrequentLogin, loginLoading }, setState] = useSetState({
    loading: false,
    timeLeft: 60,
    isfrequentLogin: false,
    loginLoading: false,
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setState({ timeLeft: timeLeft - 1 });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const [otp, setOtp] = useState('');
  const inputRefs = useRef([]); // 用于存储每个输入框的引用

  useEffect(() => {
    //填写完整=>进入登录接口
    if (otp.replace(/[^\d]/g, '').trim().length >= verifyLen) {
      onLogin();
    }
  }, [otp]);

  useEffect(() => {
    // 初始化inputRefs数组
    inputRefs.current = Array.from({ length: verifyLen }, () => null);
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1) {
      if (!value) {
        value = ' ';
      }
      const newOtp = otp.slice(0, index) + value + otp.slice(index + 1);
      if (newOtp.length <= verifyLen) {
        setOtp(newOtp);
      }
    } else if (otp.length > index && otp[index] === value) {
      // 允许清空当前输入框，但不减少otp的长度（用于粘贴时的回退处理）
      setOtp(otp.slice(0, index) + '' + otp.slice(index + 1));
    } else if (value.length > 0) {
      const newOtp = otp.slice(0, index) + value + otp.slice(index + value.length);
      setOtp(newOtp.slice(0, verifyLen));
    }
    if (value.length > 0 && index < verifyLen - 1) {
      inputRefs.current[index + 1] && inputRefs.current[index + 1].focus();
    }
  };
  const handlePaste = (e, index) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('Text').replace(/[^\d]/g, '');

    // 只处理6位或更少的粘贴内容
    if (pastedText.length <= verifyLen - otp.length) {
      const newOtp = otp.slice(0, index) + pastedText + otp.slice(index + pastedText.length);
      // 截取前6个字符作为新的otp值
      setOtp(newOtp.slice(0, verifyLen));

      // 如果粘贴后还有多余的输入框，则清空它们
      for (let i = index + pastedText.length; i < verifyLen; i++) {
        inputRefs.current[i] && inputRefs.current[i].focus(); // 尝试聚焦下一个输入框（可能为空）
        handleChange(i, '');
      }
    } else {
      setOtp((otp.slice(0, index) + pastedText + otp.slice(index + 1)).slice(0, verifyLen));
    }
  };
  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      // 处理删除键删除操作（通常不需要特殊处理，除非有特定需求）
      const i = !(otp[index] || '').trim() ? index - 1 : index;
      setOtp(otp.slice(0, index) + (otp[index + 1] ? ' ' : '') + otp.slice(index + 1));
      inputRefs.current[i] && inputRefs.current[i].focus();
    }
  };
  const renderInputs = () => {
    return Array.from({ length: verifyLen }, (_, index) => (
      <input
        className="flex otp-input"
        key={index}
        type="text"
        value={otp[index] || ''}
        onChange={e => handleChange(index, e.target.value.replace(/[^\d]/g, ''))}
        onKeyDown={e => handleKeyDown(e, index)}
        onPaste={e => handlePaste(e, index)}
        ref={el => (inputRefs.current[index] = el)}
        autoFocus={index === 0 ? true : undefined} // 第一个输入框自动聚焦
        autoComplete="off"
        onClick={() => !otp && inputRefs.current[otp.length] && inputRefs.current[otp.length].focus()}
      />
    ));
  };

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
        switch (res.actionResult) {
          case 1: // 1、发送成功
            setState({ timeLeft: 60 });
            break;
          case 8: // 8：发送验证码过于频繁
            alert(_l('发送验证码过于频繁'), 3);
            break;
          case 3: // 3：前端图形验证码校验失败
            onSend(codeType, true);
            break;
          case 5: // 5：用户不存在
            alert(_l('账号不正确'), 3);
            break;
          case 21: // 21之前登录锁定了，不能进行发送，通常通过忘记密码重置
            alert(_l('当前账户已锁定，验证码发送失败'), 3);
            break;
          default: // 0：失败
            alert(_l('验证码发送失败'), 3);
            break;
        }
      });
  };

  //图形验证
  const onSend = (codeType, isfrequentLogin) => {
    if (timeLeft > 0 && !isfrequentLogin) {
      return;
    }
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      sendForVerifyCodeLogin(res, codeType);
    };
    new captcha(callback);
  };

  const onLogin = () => {
    const request = getRequest();
    if (loginLoading) return;
    setState({ loginLoading: true });

    const loginFetch = res => {
      const { emailOrTel, isCheck, dialCode, projectId, modeType, isNetwork } = props;
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
        setState({ loginLoading: false });
        if (data.accountResult !== 1) {
          setOtp('');
          inputRefs.current[0] && inputRefs.current[0].focus();
        }
        const msgStyle = browserIsMobile() ? { 'margin-top': '180px' } : {};
        // 3：验证码错误，这个复用之前密码错误的状态码
        if (data.accountResult === 3) {
          alert(_l('登录失败'), 3, undefined, undefined, undefined, msgStyle);
          return;
        }
        // 0：如果没有点击发送过验证码，直接返回失败
        if (data.accountResult === 0) {
          alert(_l('登录失败'), 3, undefined, undefined, undefined, msgStyle);
          return;
        }
        // 11：验证码过期或者失效，需要重新发送 用户再次点击发送验证码
        if ([11].includes(data.accountResult)) {
          setState({ isfrequentLogin: true });
          alert(_l('验证码过期或者失效'), 3, undefined, undefined, undefined, msgStyle);
          return;
        }
        //5频繁登录错误，需要验证码
        if ([5].includes(data.accountResult)) {
          setState({ isfrequentLogin: true });
          alert(_l('验证码错误'), 3, undefined, undefined, undefined, msgStyle);
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
          className="Font22 Hand back Gray_75 ThemeHoverColor3"
          onClick={() => {
            onChange({ step: '' });
          }}
        >
          <Tooltip text={<span>{_l('返回上一步')}</span>} popupPlacement="bottom" tooltipClass="deleteHoverTips">
            <Icon icon="backspace mRight8" />
          </Tooltip>
        </div>
        <div className="title WordBreak hTitle" style={{ WebkitBoxOrient: 'vertical' }}>
          {!isTel(emailOrTel) ? _l('验证您的邮箱') : _l('验证您的手机')}
        </div>
      </div>
      {loading ? (
        <LoadDiv className="" style={{ margin: '50px auto' }} />
      ) : (
        <WrapCon>
          <div className="txt Font14">
            {isTel(emailOrTel)
              ? _l('已发送短信到%0，请输入验证码完成登录。', dialCode + emailOrTel)
              : _l('已发送邮件到%0，请输入验证码完成登录。', dialCode + emailOrTel)}
            {isTel(emailOrTel)
              ? _l('如果未收到短信，可尝试重新发送或')
              : _l('如果未收到邮件，请检查您的垃圾邮件文件夹或')}
            <Support
              className="ThemeColor3 Hand mLeft3"
              type={3}
              href={'https://help.mingdao.com/faq/sms-emali-service-failure'}
              text={_l('查看帮助')}
            />
          </div>
          <div className="otp-input-container flexRow mTop8">{renderInputs()}</div>
          <div
            className={cx('Gray_75 mTop10 InlineBlock Bold', { 'ThemeColor3 Hand': timeLeft <= 0 })}
            onClick={() => onSend()}
          >
            {_l('重新发送验证码')}
          </div>
          {timeLeft > 0 && <span className="mLeft10">{timeLeft}s</span>}
        </WrapCon>
      )}
    </Wrap>
  );
}
