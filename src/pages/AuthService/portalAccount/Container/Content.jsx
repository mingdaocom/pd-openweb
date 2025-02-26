import React from 'react';
import cx from 'classnames';
import { LoadDiv, Icon, Checkbox } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import Form from './Form';
import { navigateTo } from 'router/navigateTo';
import moment from 'moment';
import { validation } from 'src/pages/AuthService/util.js';
import { WrapWXCon } from '../style';
import { useSetState } from 'react-use';

export default function (props) {
  const {
    appId = '',
    registerMode = {},
    paramForPcWx,
    isAutoLogin,
    allowUserType,
    termsAndAgreementEnable,
    setAutoLogin,
    registerInfo = {},
    subscribeWXOfficial,
    scan,
    urlWX,
    type,
    loading,
    sending,
    dialCode,
    emailOrTel,
    verifyCode,
    password,
    isRegister,
    txt,
    warnList,
    focusDiv,
    onlyRead,
    updateWarn = () => {},
    onChange = () => {},
    onLogin = () => {},
    doPwdLogin = () => {},
    getScanUrl = () => {},
  } = props;

  const [{ hasCheck }, setState] = useSetState({ hasCheck: false });
  // { key: 'phone', txt: _l('验证码') },
  // { key: 'password', txt: _l('密码') },
  // { key: 'weChat', txt: _l('微信扫码') },
  //确认逻辑
  const sendCode = () => {
    if (sending) return;
    if (!emailOrTel) {
      const way =
        registerMode.email && registerMode.phone
          ? _l('请输入手机/邮箱！')
          : registerMode.phone
          ? _l('请输入手机号！')
          : _l('请输入邮箱！');
      updateWarn([{ tipDom: 'inputAccount', warnTxt: way }]);
      return;
    }
    if (!verifyCode && ((type === 'password' && isRegister) || type === 'phone')) {
      updateWarn([{ tipDom: 'inputCode', warnTxt: _l('请输入验证码！') }]);
      return;
    }
    if (!password && type === 'password') {
      updateWarn([{ tipDom: 'inputPassword', warnTxt: _l('请输入密码！') }]);
      return;
    }
    onChange({ sending: true });
    if (type === 'phone') {
      onLogin();
    } else {
      doPwdLogin();
    }
  };
  const footerNotice = isScanLogin => {
    let isNoRightTime =
      //开启了注册时间验证
      !!_.get(registerInfo, 'enable') &&
      //设置了开始和结束时间 且不在开始和结束时间范围内
      ((!!_.get(registerInfo, 'startTime') &&
        !!_.get(registerInfo, 'endTime') &&
        !moment().isBetween(registerInfo.startTime, registerInfo.endTime)) ||
        //只设置了开始时间 且当前时间早于开始时间
        (!!_.get(registerInfo, 'startTime') &&
          !_.get(registerInfo, 'endTime') &&
          moment().isBefore(_.get(registerInfo, 'startTime'))) ||
        //只设置了结束时间 且当前时间晚于结束时间
        (!_.get(registerInfo, 'startTime') &&
          !!_.get(registerInfo, 'endTime') &&
          moment().isAfter(_.get(registerInfo, 'endTime'))));
    if (allowUserType === 9 || isNoRightTime) {
      return (
        <p className={cx('txt TxtCenter Gray_75 Bold Font14 footerTxt', { mTop24: isScanLogin })}>
          {allowUserType === 9
            ? _l('仅受邀用户可以注册')
            : isNoRightTime
            ? _l('当前门户暂不支持注册，仅允许已有账号登录')
            : ''}
        </p>
      );
    } else {
      return '';
    }
  };
  const footer = (keys, findPassword) => {
    return (
      <React.Fragment>
        {!paramForPcWx && (
          <div className="mTop16 flexRow alignItemsCenter">
            {findPassword && (
              <span
                className="Hand ThemeHoverColor3 Gray Font14"
                style={{ margin: '0 0 0 auto' }}
                onClick={() => {
                  navigateTo(
                    `${window.subPath || ''}/findPwd?appId=${appId}${
                      props.customLink ? '&customLink=' + props.customLink : ''
                    }`,
                  );
                }}
              >
                {_l('忘记密码')}
              </span>
            )}
          </div>
        )}
        <div
          className={cx('loginBtn mTop32 TxtCenter Hand', { sending })}
          onClick={async () => {
            let validationData = await validation({
              isForSendCode: false,
              keys,
              type: 'portalLogin',
              info: props,
            });
            let isV = await validationData.isRight;
            updateWarn(validationData.warnList);
            if (isV) {
              if (termsAndAgreementEnable && !hasCheck) {
                return alert(_l('请先勾选同意《用户协议》和《隐私政策》'), 3);
              }
              sendCode();
            }
          }}
        >
          {paramForPcWx ? _l('绑定并登录/注册') : _l('登录/注册')}
          {sending ? '...' : ''}
        </div>
        {termsAndAgreementEnable && (
          <div className="mTop12 Gray Bold Font14 TxtTop LineHeight22 flexRow">
            <Checkbox checked={hasCheck} onClick={() => setState({ hasCheck: !hasCheck })} className="Hand" name="" />
            <div className="flex alignItemsCenter">
              {_l('同意')}
              <span
                className="ThemeColor3 Hand mRight5 mLeft5"
                onClick={() => {
                  window.open(`${location.origin}${window.subPath || ''}/agreen?appId=${appId}`);
                }}
              >
                《{_l('用户协议')}》
              </span>
              {_l('与')}
              <span
                className="ThemeColor3 Hand mLeft5"
                onClick={() => {
                  window.open(`${location.origin}${window.subPath || ''}/privacy?appId=${appId}`);
                }}
              >
                《{_l('隐私政策')}》
              </span>
            </div>
          </div>
        )}
        {!paramForPcWx && (
          <div className="mTop12 flexRow alignItemsCenter">
            <div className="flexRow alignItemsCenter" onClick={() => setAutoLogin(!isAutoLogin)}>
              <Checkbox checked={isAutoLogin} className="Hand" name="" />
              <span className="Gray Font14 Bold Hand">{_l('7天内免登录')}</span>
            </div>
          </div>
        )}
        {footerNotice()}
      </React.Fragment>
    );
  };
  const way = registerMode.email && registerMode.phone ? 'emailOrTel' : registerMode.phone ? 'tel' : 'email';
  const param = {
    warnList,
    focusDiv,
    dialCode,
    emailOrTel,
    verifyCode,
    password,
    onlyRead,
    type: 'portalLogin',
    onChange: data => onChange({ ...data }),
  };
  switch (type) {
    case 'phone': //验证码
      return (
        <React.Fragment>
          <Form
            {...param}
            keys={[way, 'code']}
            key={'phone_con'}
            appId={appId}
            sendVerifyCode={externalPortalAjax.sendVerifyCode}
          />
          {footer([way, 'code'])}
        </React.Fragment>
      );
    case 'password': //密码
      return (
        <React.Fragment>
          <Form
            {...param}
            key={'password_con'}
            keys={isRegister ? [way, 'code', 'setPassword'] : [way, 'password']}
            appId={appId}
            sendVerifyCode={externalPortalAjax.sendVerifyCode}
          />
          {footer(isRegister ? [way, 'code', 'setPassword'] : [way, 'password'], true)}
        </React.Fragment>
      );
    case 'weChat': //微信扫码
      return (
        <WrapWXCon>
          <div className={cx('erweima ', { 'alignItemsCenter flexRow': !urlWX })}>
            {loading ? (
              <LoadDiv style={{ margin: '100px auto' }} />
            ) : urlWX ? (
              <img src={urlWX} />
            ) : (
              <p className="pAll30 Font18 Gray_bd">
                {txt || _l('授权不足，请管理员到组织管理-微信服务号重新绑定授权')}
              </p>
            )}
            {!scan && (
              <div className="isOverTime">
                <Icon icon={'error1'} className="Font48 " />
                <p className="Font18">{_l('当前二维码已过期')}</p>
                <span
                  className="refresh Hand"
                  onClick={() => {
                    getScanUrl();
                  }}
                >
                  {_l('刷新')}
                </span>
              </div>
            )}
          </div>
          <div className="mTop16 TxtCenter Gray_75 Font14 Bold">
            {subscribeWXOfficial ? _l('扫描关注微信服务号并登录') : _l('微信扫码登录')}
          </div>
          <div
            className="mTop20 flexRow alignItemsCenter Hand justifyContentCenter"
            onClick={() => setAutoLogin(!isAutoLogin)}
          >
            <Checkbox checked={isAutoLogin} className="" name="" />
            <span className="Gray_9e">{_l('7天内免登录')}</span>
          </div>
          {footerNotice(true)}
        </WrapWXCon>
      );
  }
}
