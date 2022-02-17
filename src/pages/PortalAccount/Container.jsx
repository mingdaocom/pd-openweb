import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { LoadDiv, Icon } from 'ming-ui';
import { sendVerifyCode, login } from 'src/api/externalPortal';
import { statusList, accountResultAction } from './util';
import Message from 'src/pages/account/components/message';
import captcha from 'src/components/captcha';
import SvgIcon from 'src/components/SvgIcon';

const Wrap = styled.div`
  .Hide {
    display: none;
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  border-radius: 4px;
  padding: 64px 48px;
  box-sizing: border-box;
  width: 50%;
  max-width: 840px;
  min-width: 360px;
  height: 100%;
  background: #fff;
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .messageConBox {
    max-width: 400px;
    margin: 100px auto;
  }
  .tipConBox {
    margin: 80px auto 0;
    font-weight: 600;
  }
  &.isCenterCon {
    border-radius: 4px;
    width: 440px;
    background: #ffffff;
    height: auto;
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .messageConBox {
      margin: 0 auto;
    }
    &.isTipCon {
      height: 500px;
    }
  }
  &.isM {
    width: 95%;
    min-width: 95%;
    height: auto;
    padding: 48px 24px;
    .messageConBox {
      margin: 0 auto;
    }
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.isTipCon {
      height: 500px;
    }
  }
  .txtIcon {
    text-align: center;
    padding-bottom: 10px;
    .Icon {
      font-size: 74px;
    }
  }
  .txtConsole {
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .pageTitle {
    margin-bottom: 32px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    width: 100%;
    overflow: hidden;
    line-height: 1.5;
  }
  .loginBtn {
    background: #2196f3;
    height: 40px;
    border-radius: 4px;
    line-height: 40px;
    color: #fff;
    font-weight: 500;
    &:hover {
      background: #42a5f5;
    }
    &.sending {
      background: #f5f5f5;
    }
  }
  &.isR {
    margin: 0 0 0 auto;
    overflow: auto;
    .messageBox .mesDiv.errorDiv .warnningTip {
      top: 100%;
      left: 0;
    }
  }
`;
export default function Container(props) {
  const {
    logoImageUrl,
    pageMode = 3,
    pageTitle = '',
    appId = '',
    state,
    setState,
    setAccount,
    projectId,
    status,
    setStatus,
    allowUserType,
    appColor = '#00bcd4',
    appLogoUrl = 'https://fp1.mingdaoyun.cn/customIcon/0_lego.svg',
    isErrUrl,
    setAccountId,
  } = props;
  const [sending, setSending] = useState(false); //点击登录
  const [paramLogin, setParam] = useState({
    account: '',
    verifyCodeType: '',
    ticket: '',
    randStr: '',
    captchaType: md.staticglobal.getCaptchaType(),
  });
  const [dataLogin, setData] = useState({
    dialCode: '',
    warnningData: [],
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
  });

  //确认逻辑
  const sendCode = () => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode } = dataLogin;
    if (!emailOrTel) {
      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '#txtMobilePhone', warnningText: _l('请输入手机号！') }],
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
    setSending(true);
    loginFn();
  };

  const doCaptchaFn = () => {
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      loginFn(
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

  const loginFn = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode } = dataLogin;
    const { ticket, randstr } = resRet;
    login({
      ...paramLogin,
      account: dialCode + emailOrTel,
      verifyCode,
      captchaType: md.staticglobal.getCaptchaType(),
      ticket,
      randStr: randstr,
      appId, //应用ID
      state, // 微信登录成功之后返回的临时状态码 用于反向存储微信相关信息，具备有效期
    }).then(res => {
      const { accountResult, sessionId, accountId, appId, projectId, state } = res;
      setState(res.state);
      accountId && setAccountId(accountId);
      setAccount(dialCode + emailOrTel);
      setSending(false);
      if ([21, 22].includes(accountResult)) {
        //频繁登录或者图形验证码错误需要重新验证
        //需要图形验证
        doCaptchaFn();
      } else {
        if (statusList.includes(accountResult)) {
          // _l('需要收集信息');
          setStatus(accountResult);
        } else {
          accountResultAction(res);
        }
      }
    });
  };

  const getWaring = status => {
    switch (status) {
      case 2:
        return _l('您的账号已被停用');
      case 12:
        return (
          <React.Fragment>
            {/* isErrUrl status===12 // 进到登录根据配置信息判断当前版本购买人数是否超过当前版本购买人数 */}
            {isErrUrl ? _l('链接访问存在异常') : _l('运营方使用额度已满')}
            <p className="Font15 mTop6">{isErrUrl ? _l('请联系运营方') : _l('无法注册新用户')}</p>
          </React.Fragment>
        );
      case 20000:
      case 11:
      case 13:
        return _l('你访问的链接已停止访问!');
      case 10000:
        return _l('你访问的链接错误!');
      case 10:
        return _l('当前应用不存在');
      case 14:
        return _l('当前应用维护中');
    }
  };

  const tipStyle = pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 4 } : {};

  return (
    <Wrap
      className={cx('containLogin', {
        isCenterCon: pageMode !== 6,
        isR: pageMode === 6 && !browserIsMobile(),
        isM: browserIsMobile(),
        isTipCon: statusList.includes(status),
      })}
    >
      <div>
        {logoImageUrl ? (
          <img src={logoImageUrl} height={40} />
        ) : appColor && appLogoUrl ? (
          <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: appColor }}>
            <SvgIcon url={appLogoUrl} fill={'#fff'} size={28} />
          </span>
        ) : (
          ''
        )}
        <p className="Font26 Gray mAll0 mTop20 Bold pageTitle" style={{ WebkitBoxOrient: 'vertical' }}>
          {/* {[10000, 20000].includes(status) ? '' : pageTitle} */}
          {pageTitle}
        </p>
        {status === 3 ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="check_circle" className="" style={{ color: '#4caf50' }} />
            </div>
            <p className="txtConsole">{_l('注册成功')}</p>
            <p className="txtConsole Font15 mTop6">{_l('请耐心等待运营方审核')}</p>
            <p className="txtConsole Font15">{_l('会通过短信告知您审核结果')}</p>
          </div>
        ) : status === 4 ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{_l('审核未通过')}</p>
            {/* <p className="ThemeColor3 TxtCenter Hand mTop10" onClick={() => {}}>
                {_l('重新审核')}
              </p> */}
          </div>
        ) : [2, 10, 11, 12, 13, 14, 10000, 20000].includes(status) ? (
          <div className="tipConBox" style={tipStyle}>
            <div className="txtIcon">
              <Icon type="knowledge-message" className="Red" />
            </div>
            <p className="txtConsole">{getWaring(status)}</p>
          </div>
        ) : (
          <div
            className="messageConBox"
            style={
              pageMode === 6 && !browserIsMobile() ? { marginTop: document.documentElement.clientHeight / 5 - 32 } : {}
            }
          >
            <Message
              type="portalLogin"
              keys={['tel', 'code']}
              openLDAP={false}
              dataList={dataLogin}
              isNetwork={false}
              setDataFn={data => {
                setData({ ...dataLogin, ...data });
              }}
              appId={appId}
              sendVerifyCode={sendVerifyCode}
              nextHtml={isValid => {
                return (
                  <React.Fragment>
                    <div
                      className={cx('loginBtn mTop32 TxtCenter Hand', sending)}
                      onClick={() => {
                        if (isValid()) {
                          sendCode();
                        }
                      }}
                    >
                      {allowUserType === 9 ? _l('登录') : _l('登录/注册')}
                      {sending ? '...' : ''}
                    </div>
                    <p className="txt mTop30 TxtCenter Gray">{allowUserType === 9 && _l('本应用不开放注册')}</p>
                  </React.Fragment>
                );
              }}
            />
          </div>
        )}
      </div>
    </Wrap>
  );
}
