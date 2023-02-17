import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import externalPortalAjax from 'src/api/externalPortal';
import { setAutoLoginKey, toApp } from '../util';
import captcha from 'src/components/captcha';
import Message from 'src/pages/account/components/message';
import { encrypt } from 'src/util';

const Wrap = styled.div`
  ul {
    justify-content: space-between;
    & > li span {
      color: #757575;
      padding-bottom: 8px;
      border-bottom: 1px solid #fff;
      &.isCur {
        color: #2196f3;
        border-bottom: 1px solid #2196f3;
      }
    }
  }
`;

const WrapCon = styled.div``;

export default function LoginContainer(props) {
  const { appId = '', registerMode = {} } = props;
  const [{ sending }, setState] = useSetState({
    sending: false, //点击登录
  });

  const [dataLogin, setData] = useState({
    dialCode: '',
    warnningData: [],
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '',
  });

  //确认逻辑
  const sendCode = () => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode, password } = dataLogin;
    if (!emailOrTel) {
      const way =
        registerMode.email && registerMode.phone
          ? _l('请输入手机/邮箱！')
          : registerMode.phone
          ? _l('请输入手机号！')
          : _l('请输入手机！');

      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '#txtMobilePhone', warnningText: way }],
      });
      return;
    }
    if (!verifyCode) {
      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('请输入验证码！') }],
      });
      return;
    }
    if (!password) {
      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '.passwordIcon', warnningText: _l('请输入密码！') }],
      });
      return;
    }
    setState({
      sending: true,
    });
    doFindPwd();
  };

  const doCaptchaFn = () => {
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      doFindPwd(
        Object.assign({}, res, {
          captchaType: md.staticglobal.getCaptchaType(),
        }),
      );
    };
    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
  };

  const findPwdCallback = res => {
    const { accountResult } = res;
    switch (accountResult) {
      case 1:
        alert(_l('密码重置成功！'), '1', 3000, () => {
          toApp(appId);
        });
        setState({
          sending: false,
        });
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
        setData({
          ...dataLogin,
          warnningData: [{ tipDom: '.passwordIcon', warnningText: _l('8-20位，需包含字母和数字') }],
        });
        setState({
          sending: false,
        });
        break;
      case -5:
        // -5代表前后密码一致，不能设置；
        setData({
          ...dataLogin,
          warnningData: [{ tipDom: '.passwordIcon', warnningText: _l('前后密码一致') }],
        });
        setState({
          sending: false,
        });
        break;
      case 20:
        // 20代表系统手机或者邮箱验证码错误；
        setData({
          ...dataLogin,
          warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误!') }],
        });
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
        setData({
          ...dataLogin,
          warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('验证码已经失效，请重新发送') }],
        });
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

  const doFindPwd = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode, password } = dataLogin;
    const { ticket, randstr } = resRet;
    externalPortalAjax.findPwd({
      account: encrypt(dialCode + emailOrTel),
      password: encrypt(password),
      appId,
      verifyCode,
      captchaType: md.staticglobal.getCaptchaType(),
      ticket,
      randStr: randstr,
    }).then(res => {
      setAutoLoginKey({ ...res, appId });
      findPwdCallback(res);
    });
  };

  const renderCon = () => {
    const way = registerMode.email && registerMode.phone ? 'emailOrTel' : registerMode.phone ? 'tel' : 'email';
    return (
      <Message
        type="portalLogin"
        keys={[way, 'code', 'setPassword']}
        openLDAP={false}
        dataList={dataLogin}
        isNetwork={false}
        onChangeData={data => {
          setData({ ...dataLogin, ...data });
        }}
        appId={appId}
        sendVerifyCode={externalPortalAjax.sendVerifyCode}
        nextHtml={isValid => {
          return (
            <React.Fragment>
              <div
                className={cx('loginBtn mTop32 TxtCenter Hand', {
                  sending: sending,
                })}
                onClick={() => {
                  if (isValid()) {
                    sendCode();
                  }
                }}
              >
                {_l('确认')}
                {sending ? '...' : ''}
              </div>
            </React.Fragment>
          );
        }}
      />
    );
  };

  return (
    <Wrap>
      <WrapCon className="mTop10">{renderCon()}</WrapCon>
    </Wrap>
  );
}
