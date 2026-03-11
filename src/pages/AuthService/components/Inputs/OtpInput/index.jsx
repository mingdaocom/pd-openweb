import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import cx from 'classnames';
import { clamp, times } from 'lodash';
import { SupportFindVerifyCodeUrl } from 'src/pages/AuthService/config.js';
import { TwofactorType } from 'src/pages/AuthService/twofactor/config';
import { WrapCon } from './styled';

// 发送状态管理 hook
function useOtpSending(timeLeft, hasSend, onSend) {
  const [internalSending, setInternalSending] = React.useState(false);
  const isSendingRef = useRef(false);
  const prevTimeLeftRef = useRef(timeLeft);

  // 发送成功后重置状态（但只有在倒计时结束时才真正启用按钮）
  useEffect(() => {
    // 当 timeLeft 从 0 变为 >0 时（发送成功，开始倒计时），重置发送状态
    // 但此时 timeLeft > 0，所以 canSend 还是 false，按钮仍然禁用
    // 注意：timeLeft > 0 本身就表示发送成功，hasSend 只是额外的确认
    if (prevTimeLeftRef.current === 0 && timeLeft > 0) {
      setInternalSending(false);
      isSendingRef.current = false;
    }
    // 当倒计时结束时（timeLeft 从 >0 变为 0），重置发送状态，此时按钮可点击
    if (prevTimeLeftRef.current > 0 && timeLeft === 0) {
      setInternalSending(false);
      isSendingRef.current = false;
    }
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const canSend = timeLeft <= 0 && !internalSending && !isSendingRef.current;

  const handleResend = useCallback(() => {
    if (!canSend || isSendingRef.current) return;
    isSendingRef.current = true;
    setInternalSending(true);
    onSend();
  }, [canSend, onSend]);

  const setSending = useCallback(value => {
    isSendingRef.current = value;
    setInternalSending(value);
  }, []);

  const resetSending = useCallback(() => {
    isSendingRef.current = false;
    setInternalSending(false);
  }, []);

  return { canSend, handleResend, setSending, resetSending };
}

// 处理粘贴文本
const processPasteText = (pastedText, value, verifyLen, startIndex, onChange, focusInput) => {
  const digits = pastedText.replace(/[^\d]/g, '');
  if (!digits) return;
  const newValue = (value.slice(0, startIndex) + digits).slice(0, verifyLen);
  onChange(newValue);
  const targetIndex = clamp(newValue.length, 0, verifyLen - 1);
  const shouldSelect = targetIndex < verifyLen - 1;
  focusInput(targetIndex, 0, shouldSelect);
};

const OtpInput = forwardRef(function OtpInput(props, ref) {
  const {
    value = '',
    onChange = () => {},
    verifyLen = 6,
    timeLeft = 0,
    onSend = () => {},
    type,
    hasError = false,
    hasSend = false,
  } = props;

  const isTotp = type === TwofactorType.totp;
  const inputRefs = useRef([]);
  const stateRef = useRef({
    value,
    type,
    hasError,
    hasSend,
    timeLeft,
    isKeyboardNavigation: false,
    isAutoFill: false,
  });

  const { canSend, handleResend, setSending, resetSending } = useOtpSending(timeLeft, hasSend, onSend);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    resetSending, // 重置发送状态，允许重新发送
    setSending, // 设置发送状态，禁用按钮
  }));

  useEffect(() => {
    inputRefs.current = times(verifyLen, () => null);
  }, [verifyLen]);

  // 聚焦到指定索引的输入框
  const focusInput = useCallback(
    (index, delay = 0, shouldSelect = true) => {
      setTimeout(() => {
        const input = inputRefs.current[index];
        if (input) {
          input.focus();
          if (value[index] && shouldSelect) {
            input.select();
          }
        }
      }, delay);
    },
    [value],
  );

  // 处理验证码错误时的聚焦逻辑
  useEffect(() => {
    if (!stateRef.current.hasError && hasError) {
      focusInput(verifyLen - 1, 100, false);
    }
    stateRef.current.hasError = hasError;
  }, [hasError, verifyLen, focusInput]);

  // 处理验证码发送成功后的聚焦逻辑
  useEffect(() => {
    if (!stateRef.current.hasSend && hasSend) {
      const firstEmptyIndex = clamp(value.length, 0, verifyLen - 1);
      focusInput(firstEmptyIndex, 500, false);
    }
    if (stateRef.current.timeLeft === 0 && timeLeft > 0 && hasSend) {
      const firstEmptyIndex = clamp(value.length, 0, verifyLen - 1);
      focusInput(firstEmptyIndex, 500, false);
    }
    stateRef.current.hasSend = hasSend;
    stateRef.current.timeLeft = timeLeft;
  }, [hasSend, timeLeft, value, verifyLen, focusInput]);

  // 处理验证码变化时的聚焦逻辑
  useEffect(() => {
    if (stateRef.current.value !== value) {
      if (value.length >= verifyLen) {
        if (stateRef.current.isAutoFill) {
          stateRef.current.isAutoFill = false;
        }
        return;
      }
      const firstEmptyIndex = clamp(value.length, 0, verifyLen - 1);
      const shouldSelect = !(
        stateRef.current.isAutoFill &&
        value.length === verifyLen &&
        firstEmptyIndex === verifyLen - 1
      );
      focusInput(firstEmptyIndex, 0, shouldSelect);
      if (stateRef.current.isAutoFill) {
        stateRef.current.isAutoFill = false;
      }
    }
    stateRef.current.value = value;
  }, [value, verifyLen, focusInput]);

  // type 切换后，聚焦到第一个输入框
  useEffect(() => {
    if (stateRef.current.type !== type) {
      stateRef.current.type = type;
      focusInput(0, 100);
      // 切换验证方式时，只要不是 TOTP，立即禁用按钮（由父组件通过 ref 调用 setSending 来控制）
    }
  }, [type, focusInput]);

  // 检测浏览器自动填充
  useEffect(() => {
    const timer = setTimeout(() => {
      const actualValue = inputRefs.current.map(input => input?.value?.replace(/[^\d]/g, '') || '').join('');
      if (actualValue.length > value.length && actualValue.length <= verifyLen) {
        stateRef.current.isAutoFill = actualValue.length === verifyLen;
        onChange(actualValue.slice(0, verifyLen));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [value, verifyLen, onChange]);

  const handleFocus = useCallback(
    clickedIndex => {
      if (stateRef.current.isKeyboardNavigation) {
        stateRef.current.isKeyboardNavigation = false;
        focusInput(clickedIndex);
        return;
      }
      const targetIndex = clamp(value.length, 0, verifyLen - 1);
      focusInput(targetIndex !== clickedIndex ? targetIndex : clickedIndex);
    },
    [value, verifyLen, focusInput],
  );

  const handleChange = useCallback(
    (index, inputValue) => {
      const digits = inputValue.replace(/[^\d]/g, '');
      if (!digits) {
        if (!inputValue) {
          onChange(value.slice(0, index) + value.slice(index + 1));
          focusInput(index);
        }
        return;
      }
      if (digits.length > 1) {
        processPasteText(digits, value, verifyLen, index, onChange, focusInput);
      } else {
        const newValue = (value.slice(0, index) + digits[0] + value.slice(index + 1)).slice(0, verifyLen);
        onChange(newValue);
        focusInput(clamp(index + 1, 0, verifyLen - 1));
      }
    },
    [value, verifyLen, onChange, focusInput],
  );

  const handlePaste = useCallback(
    (e, index) => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData('Text') || '';
      processPasteText(pastedText, value, verifyLen, index, onChange, focusInput);
    },
    [value, verifyLen, onChange, focusInput],
  );

  const handleContainerPaste = useCallback(
    e => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData('Text') || '';
      processPasteText(pastedText, value, verifyLen, 0, onChange, focusInput);
    },
    [value, verifyLen, onChange, focusInput],
  );

  const handleKeyDown = useCallback(
    (e, index) => {
      const { key } = e;
      if (key === 'Backspace') {
        e.preventDefault();
        stateRef.current.isKeyboardNavigation = true;
        if (value[index]) {
          onChange(value.slice(0, index) + value.slice(index + 1));
          focusInput(index);
        } else if (index > 0) {
          onChange(value.slice(0, index - 1) + value.slice(index));
          focusInput(index - 1);
        }
      } else if (key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        stateRef.current.isKeyboardNavigation = true;
        focusInput(index - 1);
      } else if (key === 'ArrowRight' && index < verifyLen - 1) {
        e.preventDefault();
        stateRef.current.isKeyboardNavigation = true;
        focusInput(index + 1);
      }
    },
    [value, verifyLen, onChange, focusInput],
  );

  return (
    <WrapCon>
      <div className="otp-input-container flexRow mTop8" onPaste={handleContainerPaste}>
        {times(verifyLen, index => (
          <input
            key={index}
            className="flex otp-input"
            type="text"
            value={value[index] || ''}
            onChange={e => handleChange(index, e.target.value)}
            onInput={e => handleChange(index, e.target.value)}
            onFocus={() => handleFocus(index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onPaste={e => handlePaste(e, index)}
            ref={el => (inputRefs.current[index] = el)}
            autoFocus={index === 0}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            inputMode="numeric"
            pattern="[0-9]*"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
          />
        ))}
      </div>
      <div className="otp-actions">
        {isTotp ? null : (
          <>
            <div className={cx('InlineBlock', canSend ? 'ThemeColor3 Hand' : 'textSecondary')} onClick={handleResend}>
              {timeLeft <= 0 && !canSend ? _l('发送中，请稍候…') : _l('重新发送验证码')}
              {timeLeft > 0 && <span className="mLeft10">{timeLeft}s</span>}
            </div>
            {canSend &&
              !md.global.SysSettings.hideHelpTip &&
              (type === TwofactorType.mobilePhone || type === TwofactorType.email) && (
                <a href={SupportFindVerifyCodeUrl()} target="_blank" className="textSecondary Hand">
                  {type === TwofactorType.mobilePhone ? _l('收不到短信？') : _l('收不到邮件？')}
                </a>
              )}
          </>
        )}
      </div>
    </WrapCon>
  );
});

export default OtpInput;
