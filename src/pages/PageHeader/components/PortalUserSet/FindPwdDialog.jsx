import React, { useState, useRef } from 'react';
import { useSetState } from 'react-use';
import { captcha } from 'ming-ui/functions';
import styled from 'styled-components';
import { Button, Dialog } from 'ming-ui';
import { browserIsMobile, encrypt } from 'src/util';
import cx from 'classnames';
import { ActionResult, CodeTypeEnum } from 'src/pages/accountLogin/config';
import externalPortalAjax from 'src/api/externalPortal';
import { setAutoLoginKey } from 'src/pages/accountLogin/portalAccount/util';
import RegExpValidator from 'src/util/expression';

const AccountWrap = styled.div`
  margin-top: 20px;
  margin-bottom: -2px;
  margin-left: -2px;
  margin-right: -2px;
  .isMobile {
    display: block !important;
    .title {
      width: 100%;
      display: block;
    }
    .telBox,
    .telInput {
      flex: initial;
      width: 100%;
      display: block;
    }
    .txtLoginCode {
    }
  }
  .mesDiv {
    display: flex;
    width: 100%;
    .title {
      width: 100px;
      min-width: 100px;
      font-weight: 600;
      line-height: 36px;
    }
    .txtLoginCode,
    .telBox,
    .telPwd,
    .telInput {
      flex: 1;
      height: 36px;
      background: #fff;
      border: 1px solid #e0e0e0;
      opacity: 1;
      border-radius: 3px;
      padding: 0 12px;
      line-height: 36px;
      width: 100%;
      &.telBox {
        background: #f8f8f8;
      }
      &.hid {
        width: 0;
        height: 0;
        opacity: 0;
        display: none;
      }
    }
    .code {
      flex: 1;
      display: flex;
    }
    .btnSendVerifyCode {
      width: 130px;
      height: 36px;
      background: #2196f3;
      opacity: 1;
      border-radius: 3px;
      border: 0;
      color: #fff;
      &.btnEnabled {
        background-color: #2196f3;
        cursor: pointer;
        -webkit-transition: background-color 0.5s;
        transition: background-color 0.5s;
      }

      &.btnEnabled:hover {
        background-color: #1565c0;
        -webkit-transition: background-color 0.5s;
        transition: background-color 0.5s;
      }
      &.btnDisabled {
        background-color: #ccc;
        cursor: default;
      }
    }
  }
`;
const AccountDialogWrap = styled.div``;
let sendVerifyCodeTimer = null;
export default function TelDialog(props) {
  const { setShow, show, classNames, appId, account, onOk } = props;
  const [code, setCode] = useState('');
  const [{ verifyCodeText, verifyCodeLoading, sending, psd }, setState] = useSetState({
    verifyCodeText: '',
    verifyCodeLoading: false, // 已发送并在30内true
    sending: false,
    psd: '',
  });
  const { md = {} } = window;
  const { global = {} } = md;
  const { SysSettings = {} } = global;
  const { passwordRegex, passwordRegexTip } = SysSettings;
  const codeDiv = useRef();
  const isPasswordRule = str => {
    return RegExpValidator.isPasswordValid(str, passwordRegex);
  };
  const findPwdCallback = res => {
    const { accountResult } = res;
    switch (accountResult) {
      case 1:
        alert(_l('密码重置成功！'), '1', 3000, () => {
          onOk();
        });
        setState({
          sending: false,
        });
        setShow(false);
        break;
      case -1:
        //-1代表用户不存在，不能设置密码；
        alert(_l('该用户不存在，不能设置密码'), 3);
        setState({
          sending: false,
        });
        break;
      case -3:
        // -3代表密码错误校验失败；
        alert(passwordRegexTip || _l('请输入8-20位，需包含字母和数字'), 3);
        setState({
          sending: false,
        });
        break;
      case -5:
        // -5代表前后密码一致，不能设置；
        alert(_l('前后密码一致!'), 3);
        setState({
          sending: false,
        });
        break;
      case 20:
        // 20代表系统手机或者邮箱验证码错误；
        alert(_l('验证码错误!'), 3);
        setState({
          sending: false,
        });
        break;
      case 21:
      case 22:
        //21代表图形验证码错误；22代表需要输入图形验证码；
        doCaptchaFn();
        break;
      case 24:
        // 24代表频繁修改，被锁定state里面会返回锁定时间；
        let t = res.state ? Math.ceil(res.state / 60) : 20;
        alert(_l('密码修改次数过多被锁定，请 %0 分钟后再试，或 重置密码', t), 3);
        setState({
          sending: false,
        });
        break;
      case 23:
        ///23代表系统手机或者邮箱验证码过期失效；
        alert(_l('验证码已经失效，请重新发送!'), 3);
        setState({
          sending: false,
        });
        break;
      default:
        //0代表修改密码失败异常；其余不会有值了
        alert(_l('修改密码失败,请稍后再试!'), 3);
        setState({
          sending: false,
        });
        break;
    }
  };
  const countDown = () => {
    let seconds = 30;
    $(codeDiv).focus();
    sendVerifyCodeTimer = setInterval(() => {
      if (seconds <= 0) {
        setState({
          verifyCodeText: '',
          verifyCodeLoading: false,
        });
        clearInterval(sendVerifyCodeTimer);
        sendVerifyCodeTimer = null;
      } else {
        setState({
          verifyCodeText: _l('%0秒后重发', seconds),
        });
        seconds--;
      }
    }, 1000);
  };
  const handleSendVerifyCode = () => {
    let callback = res => {
      if (res.ret !== 0) {
        setState({
          verifyCodeLoading: false,
        });
        return;
      } else {
        setState({
          verifyCodeLoading: true,
        });
      }
      let param = {
        appId: props.appId,
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.global.getCaptchaType(),
        account: props.account,
        codeType: 4, //更新密码
      };
      let thenFn = data => {
        if (data.actionResult === 1) {
          countDown();
        } else {
          setState({
            verifyCodeLoading: false,
          });
          if (data.actionResult == ActionResult.sendMobileMessageFrequent) {
            alert(_l('验证码发送过于频繁，请稍后再试'), 3);
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            alert(_l('账号不正确'), 3);
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            alert(_l('验证码错误'), 3);
          } else if (data.actionResult == ActionResult.balanceIsInsufficient) {
            alert(_l('当前企业账号余额不足，无法发送短信'), 2);
          } else if (data.actionResult == ActionResult.userAccountExists) {
            alert(_l('发送失败，新手机号与现有手机号一致'), 2);
          } else {
            alert(_l('验证码发送失败'), 3);
          }
          return;
        }
      }; //http://web.dev.mingdao.net/portal/wxscanauth?state=0af0120d50d207807308f07b0360800400fe08a009051068
      externalPortalAjax.sendAccountVerifyCode(param).then(data => {
        thenFn(data);
      });
    };

    if (md.global.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
  };

  const changePwd = (resRet = {}) => {
    if (!code) {
      return alert(_l('请输入验证码！'), 3);
    }
    if (!psd) {
      return alert(_l('请输入新密码！'), 3);
    }
    if (!isPasswordRule(psd)) {
      return alert(passwordRegexTip || _l('请输入8-20位，需包含字母和数字'), 3);
    }
    if (sending) {
      return;
    }
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .findPwd({
        account: encrypt(account),
        password: encrypt(psd),
        appId,
        verifyCode: code,
        captchaType: md.global.getCaptchaType(),
        ticket,
        randStr: randstr,
      })
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        findPwdCallback(res);
      });
  };

  const doCaptchaFn = () => {
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      changePwd(
        Object.assign({}, res, {
          captchaType: md.global.getCaptchaType(),
        }),
      );
    };
    if (md.global.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
  };

  return (
    <Dialog
      title={<span className="Bold">{_l('设置密码')}</span>}
      className={cx('userInfoDialog', classNames)}
      headerClass="userInfoDialogTitle"
      bodyClass="telDialogCon"
      width={560}
      footer={
        <div className="footer">
          <Button
            type={'link'}
            onClick={() => {
              setShow(false);
            }}
          >
            {_l('取消')}
          </Button>
          <Button
            type={'primary'}
            onClick={() => {
              changePwd();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      }
      onCancel={() => {
        setShow(false);
      }}
      visible={show}
    >
      <AccountDialogWrap>
        <AccountWrap>
          <div className={cx('mesDiv', { isMobile: browserIsMobile() })}>
            <span className="title">{_l('账号')}</span>
            <span className={cx('telBox')}>{props.account}</span>
          </div>
          <div
            className={cx('mesDiv ', {
              isMobile: browserIsMobile(),
              mTop16: !browserIsMobile(),
              mTop6: browserIsMobile(),
            })}
          >
            <span className="title">{_l('验证码')}</span>
            <div className="code">
              <input
                type="text"
                maxLength={'4'}
                className="loginInput txtLoginCode"
                value={code}
                ref={codeDiv}
                onChange={e => {
                  setCode(e.target.value.replace(/[^\d]/g, ''));
                }}
              />
              <input
                disabled={verifyCodeLoading}
                type="button"
                className={cx('btn btnSendVerifyCode mLeft16', {
                  btnDisabled: verifyCodeLoading,
                  btnEnabled: !verifyCodeLoading,
                })}
                id="btnSendVerifyCode"
                value={verifyCodeText || (verifyCodeLoading ? _l('发送中...') : _l('获取验证码'))}
                onClick={e => {
                  handleSendVerifyCode(CodeTypeEnum.message);
                }}
              />
            </div>
          </div>
          <div
            className={cx('mesDiv', {
              isMobile: browserIsMobile(),
              mTop16: !browserIsMobile(),
              mTop6: browserIsMobile(),
            })}
          >
            <span className="title">{_l('新密码')}</span>
            <input
              type="password"
              className={cx('telPwd')}
              value={psd}
              onChange={e => {
                setState({
                  psd: e.target.value.trim(),
                });
              }}
            />
          </div>
        </AccountWrap>
      </AccountDialogWrap>
    </Dialog>
  );
}
