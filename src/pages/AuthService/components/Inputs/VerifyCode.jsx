import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { captcha } from 'ming-ui/functions';
import RegisterController from 'src/api/register';
import { ActionResult, CodeTypeEnum, SupportFindVerifyCodeUrl } from 'src/pages/AuthService/config.js';
import { isTel, toMDApp, validation } from 'src/pages/AuthService/util.js';
import { emitter, encrypt } from 'src/utils/common';

// 'inputCode',//验证码
let sendVerifyCodeTimer = null;
export default function (props) {
  const {
    warnList = [],
    verifyCode,
    onChange = () => {},
    focusDiv,
    maxLength,
    keys,
    type,
    emailOrTel,
    dialCode,
    canSendCodeByTel,
  } = props;

  const [{ verifyCodeLoading, firstSendVerifyCode, verifyCodeText }, setState] = useSetState({
    verifyCodeLoading: false,
    firstSendVerifyCode: false,
    verifyCodeText: '',
  });

  useEffect(() => {
    return () => {
      clearInterval(sendVerifyCodeTimer);
      sendVerifyCodeTimer = null;
      emitter.removeListener('ON_SEND_VERIFYCODE_VOICE', sendByVoice);
    };
  }, []);

  useEffect(() => {
    emitter.addListener('ON_SEND_VERIFYCODE_VOICE', sendByVoice);
  }, [emailOrTel]);

  const sendByVoice = () => handleSendVerifyCode(CodeTypeEnum.voice);

  const warn = _.find(warnList, it => it.tipDom === 'inputCode');
  const CodeRef = useRef();

  const updateWarn = data => onChange({ warnList: data });

  // 获取验证码
  const handleSendVerifyCode = async codeType => {
    let validationData = await validation({
      isForSendCode: true,
      keys,
      type,
      info: { emailOrTel, dialCode, canSendCodeByTel },
    });
    let isV = await validationData.isRight;
    onChange({ warnList: validationData.warnList });
    if (isV) {
      const { type, sendVerifyCode, appId } = props;
      const callback = res => {
        if (res.ret !== 0) {
          setState({ verifyCodeLoading: false });
          return;
        } else {
          setState({ verifyCodeLoading: true });
        }
        const account = (isTel(emailOrTel) ? dialCode : '') + emailOrTel;
        let param = {
          account: encrypt(account),
          verifyCodeType: codeType,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
          lang: getCurrentLangCode(),
        };
        const fetchCallBack = data => {
          if (data.actionResult == ActionResult.success) {
            updateWarn([{ tipDom: 'code', warnTxt: _l('验证码发送成功') }]);
            countDown();
          } else if (data.actionResult == ActionResult.userAccountExists) {
            updateWarn([
              {
                tipDom: 'inputAccount',
                warnTxt: _l('账号已注册'),
                onClick: () => toMDApp(props),
              },
            ]);
          } else if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
            updateWarn([
              {
                tipDom: 'code',
                warnTxt: md.global.SysSettings.hideHelpTip
                  ? _l('验证码发送过于频繁')
                  : _l(
                      '验证码发送过于频繁，%0收不到验证码？%1',
                      '<a href="' + SupportFindVerifyCodeUrl() + '" target="_blank">',
                      '</a>',
                    ),
              },
            ]);
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            if (type === 'findPassword') {
              updateWarn([
                {
                  tipDom: 'inputAccount',
                  warnTxt: _l('账号未注册'),
                },
              ]);
            } else {
              updateWarn([{ tipDom: 'code', warnTxt: _l('账号不正确') }]);
            }
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            updateWarn([{ tipDom: 'code', warnTxt: _l('验证码错误') }]);
          } else {
            updateWarn([{ tipDom: 'inputCode', warnTxt: _l('验证码发送失败'), isError: true }]);
            if (data.actionResult === ActionResult.accoutRegisterClosed && type === 'portalLogin') {
              alert(_l('当前门户不在设置的注册时间范围内，暂不支持注册'), 3);
            }
            if (data.actionResult == ActionResult.balanceIsInsufficient) {
              alert(_l('当前企业账户余额不足，无法发送短信/邮件'), 2);
            }
            // 非第一次
            if (codeType == CodeTypeEnum.message) {
              setState({ firstSendVerifyCode: false });
            }
          }

          if (data.actionResult != ActionResult.success) {
            if (codeType == CodeTypeEnum.message) {
              setState({ verifyCodeLoading: false });
            } else {
              setState({ verifyCodeLoading: false, verifyCodeText: '' });
            }
          }
        };
        const renderErr = error => {
          setState({ verifyCodeLoading: false });
          if (error.errorMessage) {
            updateWarn([{ tipDom: 'inputCode', warnTxt: error.errorMessage, isError: true }]);
          }
        };
        if (type === 'portalLogin') {
          sendVerifyCode({ ...param, appId })
            .then(data => fetchCallBack({ ...data, ...param }))
            .catch(renderErr);
        } else if (type !== 'findPassword') {
          param.isFirstTime = firstSendVerifyCode;
          RegisterController.sendRegisterVerifyCode(param)
            .then(data => fetchCallBack(data))
            .catch(renderErr);
        } else {
          RegisterController.sendFindPasswordVerifyCode(param)
            .then(data => fetchCallBack(data))
            .catch(renderErr);
        }
      };

      new captcha(callback);
    }
  };

  const countDown = () => {
    let seconds = 60;
    let hasWarn = false;
    CodeRef.current.focus();
    sendVerifyCodeTimer = setInterval(() => {
      if (seconds <= 0) {
        setState({
          verifyCodeText: '',
          verifyCodeLoading: false,
          firstSendVerifyCode: false,
        });
        if (!verifyCode) {
          updateWarn([{ tipDom: 'code', warnTxt: 'txt' }]);
        }
        clearInterval(sendVerifyCodeTimer);
        sendVerifyCodeTimer = null;
      } else {
        if (seconds < 22 && !hasWarn) {
          // 8秒后提示收不到验证码的帮助
          updateWarn([
            {
              tipDom: 'code',
              warnTxt: md.global.SysSettings.hideHelpTip
                ? _l('验证码发送成功')
                : _l(
                    '验证码发送成功，%0收不到验证码？%1',
                    '<a href="' + SupportFindVerifyCodeUrl() + '" target="_blank">',
                    '</a>',
                  ),
            },
          ]);
          hasWarn = true;
        }
        setState({
          verifyCodeText: _l('%0秒后重发', seconds),
        });
        seconds--;
      }
    }, 1000);
  };

  return (
    <React.Fragment>
      <div
        className={cx('mesDiv', {
          hasValue: !!verifyCode || focusDiv === 'inputCode',
          errorDiv: warn,
          warnDiv: warn && warn.noErr,
          errorDivCu: !!focusDiv && focusDiv === 'inputCode',
        })}
      >
        <input
          type="text"
          maxLength={maxLength || '4'}
          className="loginInput Left txtLoginCode"
          value={verifyCode}
          ref={CodeRef}
          placeholder={verifyCode}
          onBlur={() => onChange({ focusDiv: '' })}
          onFocus={() => onChange({ focusDiv: 'inputCode' })}
          onChange={e => {
            let data = _.filter(warnList, it => it.tipDom !== 'inputCode');
            onChange({
              verifyCode: e.target.value.replace(/[^\d]/g, ''),
              focusDiv: 'inputCode',
              warnList: data,
            });
          }}
          autoComplete="off"
        />
        <input
          disabled={verifyCodeLoading}
          type="button"
          tabIndex="-1"
          className={cx('btn btnSendVerifyCode Right', {
            btnDisabled: verifyCodeLoading,
            btnEnabled: !verifyCodeLoading,
          })}
          id="btnSendVerifyCode"
          value={verifyCodeText || (verifyCodeLoading ? _l('发送中...') : _l('获取验证码'))}
          onClick={() => handleSendVerifyCode(CodeTypeEnum.message)}
        />
        <input type="text" tabIndex="-1" className="Alpha0 inputHidden" />
        <div className="title" onClick={() => CodeRef.current.focus()}>
          {_l('验证码')}
        </div>
        {warn && <div className={cx('warnTips')}>{warn.warnTxt}</div>}
      </div>
    </React.Fragment>
  );
}
