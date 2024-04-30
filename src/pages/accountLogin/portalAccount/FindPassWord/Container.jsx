import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/accountLogin/redux/actions.js';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import externalPortalAjax from 'src/api/externalPortal';
import { setAutoLoginKey, toApp } from '../util';
import { captcha } from 'ming-ui/functions';
import MessageCon from 'src/pages/accountLogin/components/message';
import { encrypt } from 'src/util';
import { clickErrInput } from 'src/pages/accountLogin/util.js';

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

function LoginContainer(props) {
  const { appId = '', registerMode = {}, setData, isValid, dataLogin, reset } = props;
  const [{ sending }, setState] = useSetState({
    sending: false, //点击登录
  });
  useEffect(() => {
    setData({
      dialCode: '',
      emailOrTel: '', // 邮箱或手机
      verifyCode: '', // 验证码
      password: '',
      focusDiv: '',
    });
    updateWarn([]);
    () => {
      reset();
    };
  }, []);

  useEffect(() => {
    if ((_.get(props, 'warnningData') || []).length > 0) {
      clickErrInput(_.get(props, 'warnningData'), _.get(props, 'dataLogin.focusDiv'));
    }
  }, [_.get(props, 'warnningData')]);

  const updateWarn = warnningData => {
    props.updateWarn(warnningData);
    setData({ focusDiv: '' });
  };
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
      updateWarn([{ tipDom: '#txtMobilePhone', warnningText: way }]);
      return;
    }
    if (!verifyCode) {
      updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('请输入验证码！') }]);
      return;
    }
    if (!password) {
      updateWarn([{ tipDom: '.passwordIcon', warnningText: _l('请输入密码！') }]);

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
    if (md.global.getCaptchaType() === 1) {
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
        updateWarn([{ tipDom: '.passwordIcon', warnningText: _l('8-20位，需包含字母和数字') }]);

        setState({
          sending: false,
        });
        break;
      case -5:
        // -5代表前后密码一致，不能设置；
        updateWarn([{ tipDom: '.passwordIcon', warnningText: _l('前后密码一致') }]);
        setState({
          sending: false,
        });
        break;
      case 20:
        // 20代表系统手机或者邮箱验证码错误；
        updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码错误!') }]);
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
        updateWarn([{ tipDom: '.txtLoginCode', warnningText: _l('验证码已经失效，请重新发送') }]);
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
    return (
      <React.Fragment>
        <MessageCon
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
            let isV = await isValid(false, [way, 'code', 'setPassword']);
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

export default connect(
  ({ accountInfo, warnningData }) => ({
    dataLogin: accountInfo,
    warnningData,
  }),
  dispatch => bindActionCreators({ ...actions }, dispatch),
)(LoginContainer);
