import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { captcha } from 'ming-ui/functions';
import externalPortalAjax from 'src/api/externalPortal';
import { validation } from 'src/pages/AuthService/util.js';
import { encrypt } from 'src/utils/common';
import { setAutoLoginKey, toApp } from '../util';
import Form from './Form';

const Wrap = styled.div`
  ul {
    justify-content: space-between;
    & > li span {
      color: #757575;
      padding-bottom: 8px;
      border-bottom: 1px solid #fff;
      &.isCur {
        color: #1677ff;
        border-bottom: 1px solid #1677ff;
      }
    }
  }
`;

const WrapCon = styled.div``;

function LoginContainer(props) {
  const { appId = '', registerMode = {} } = props;
  const [{ sending, warnList, focusDiv, dialCode, emailOrTel, verifyCode, password }, setState] = useSetState({
    sending: false, //点击登录
    warnList: [],
    dialCode: '',
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '',
    focusDiv: '',
  });

  const updateWarn = warnList => {
    setState({ focusDiv: '', warnList });
  };
  //确认逻辑
  const sendCode = () => {
    if (sending) {
      return;
    }
    if (!emailOrTel) {
      const way =
        registerMode.email && registerMode.phone
          ? _l('请输入手机/邮箱！')
          : registerMode.phone
            ? _l('请输入手机号！')
            : _l('请输入手机！');
      updateWarn([{ tipDom: 'inputAccount', warnTxt: way }]);
      return;
    }
    if (!verifyCode) {
      updateWarn([{ tipDom: 'inputCode', warnTxt: _l('请输入验证码！') }]);
      return;
    }
    if (!password) {
      updateWarn([{ tipDom: 'inputPassword', warnTxt: _l('请输入密码！') }]);

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
          captchaType: md.global.getCaptchaType(),
        }),
      );
    };
    new captcha(callback);
  };

  const findPwdCallback = res => {
    const { accountResult } = res;
    switch (accountResult) {
      case 1:
        alert({
          msg: _l('密码重置成功！'),
          onClose: () => {
            toApp(appId);
          },
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
        updateWarn([{ tipDom: 'inputPassword', warnTxt: _l('8-20位，需包含字母和数字') }]);

        setState({
          sending: false,
        });
        break;
      case -5:
        // -5代表前后密码一致，不能设置；
        updateWarn([{ tipDom: 'inputPassword', warnTxt: _l('前后密码一致') }]);
        setState({
          sending: false,
        });
        break;
      case 20:
        // 20代表系统手机或者邮箱验证码错误；
        updateWarn([{ tipDom: 'inputCode', warnTxt: _l('验证码错误!') }]);
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
        updateWarn([{ tipDom: 'inputCode', warnTxt: _l('验证码已经失效，请重新发送') }]);
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
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .findPwd({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        appId,
        verifyCode,
        captchaType: md.global.getCaptchaType(),
        ticket,
        randStr: randstr,
      })
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        findPwdCallback(res);
      });
  };

  const renderCon = () => {
    const way = registerMode.email && registerMode.phone ? 'emailOrTel' : registerMode.phone ? 'tel' : 'email';
    const param = { warnList, focusDiv, dialCode, emailOrTel, verifyCode, password };
    return (
      <React.Fragment>
        <Form
          {...param}
          onChange={data => setState({ ...data })}
          type="portalLogin"
          keys={[way, 'code', 'setPassword']}
          appId={appId}
          sendVerifyCode={externalPortalAjax.sendVerifyCode}
        />
        <div
          className={cx('loginBtn mTop32 TxtCenter Hand', {
            sending: sending,
          })}
          onClick={async () => {
            let validationData = await validation({
              isForSendCode: false,
              keys: [way, 'code', 'setPassword'],
              type: 'portalLogin',
              info: { dialCode, emailOrTel, verifyCode, password },
            });
            let isV = await validationData.isRight;
            updateWarn(validationData.warnList);
            if (isV) {
              sendCode();
            }
          }}
        >
          {_l('确认')}
          {sending ? '...' : ''}
        </div>
      </React.Fragment>
    );
  };

  return (
    <Wrap>
      <WrapCon className="mTop10">{renderCon()}</WrapCon>
    </Wrap>
  );
}

export default LoginContainer;
