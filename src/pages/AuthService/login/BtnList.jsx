import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { getRequest } from 'src/utils/common';
import googleIcon from './img/google.svg';
import microsoftIcon from './img/microsoft.png';
import { getWorkWeiXinCorpInfoByApp } from './util';

const integrationInto = {
  1: { iconClassName: 'dingIcon', text: _l('钉钉登录') },
  3: { iconClassName: 'workWeixinIcon', text: _l('企业微信登录') },
  6: { iconClassName: 'feishuIcon', text: _l('飞书登录') },
  lark: { iconClassName: 'feishuIcon', text: _l('Lark登录') },
};
export default function (props) {
  const {
    openLDAP,
    isOpenSystemLogin,
    isNetwork,
    modeType,
    hideOther,
    isOpenSso,
    intergrationScanEnabled,
    ldapIcon,
    ssoName,
    ldapName,
    customNameIcon,
    projectIntergrationType,
    projectId,
    verifyType,
    ssoIcon,
    isMobile,
    ssoAppUrl,
    ssoWebUrl,
    isLark,
    onChange = () => {},
    googleSsoSet,
  } = props;
  const isCanWeixin = !isNetwork && !isMobile;
  const isCanQQ = !isNetwork;
  const canChangeSysOrLDAP = openLDAP && isOpenSystemLogin && isNetwork;
  const isWeiXin = window.isWeiXin && !window.isWxWork && !md.global.Config.IsLocal;
  //ldap || 平台
  const renderSysOrLDAPBtn = () => {
    const hasIcon = modeType === 1 && ldapIcon;
    return (
      <a
        onClick={() => {
          onChange({
            modeType: modeType === 1 ? 2 : 1,
            verifyType: 'password',
            password: '',
            isCheck: false,
            warnList: [],
          });
        }}
        className="WordBreak overflow_ellipsis pLeft10 pRight10 flexRow alignItemsCenter"
      >
        {!hasIcon ? (
          <Icon icon={modeType === 1 ? 'lock' : 'account_circle'} className="mRight5 Gray_75 Font20" />
        ) : (
          <span className="btnIcon mRight5 Gray_75" style={{ backgroundImage: `url(${ldapIcon})` }}></span>
        )}
        <span className="txt">{modeType === 1 ? ldapName || _l('LDAP登录') : _l('平台账号登录')}</span>
      </a>
    );
  };
  // sso
  const renderSsoBtn = () => {
    return (
      <a href={isMobile ? ssoAppUrl : ssoWebUrl} className="flexRow alignItemsCenter">
        {ssoIcon ? (
          <span className="btnIcon mRight5 Gray_75" style={{ backgroundImage: `url(${ssoIcon})` }}></span>
        ) : (
          <Icon icon={'tab_move'} className="mRight5 Gray_75 Font20" />
        )}
        <span className="txt">{ssoName || _l('SSO登录')}</span>
      </a>
    );
  };
  //第三方集成登录
  const renderIntegrationBtn = () => {
    let style = {};
    if (customNameIcon.iconUrl) {
      style = { backgroundImage: `url(${customNameIcon.iconUrl})` };
    }
    return (
      <a
        onClick={() => {
          if (_.includes([1, 6], projectIntergrationType)) {
            location.href =
              projectIntergrationType === 1
                ? `${
                    md.global.Config.IsLocal ? md.global.Config.WebUrl : location.origin + '/'
                  }auth/dingding?p=${projectId}`
                : `${
                    md.global.Config.IsLocal ? md.global.Config.WebUrl : location.origin + '/'
                  }auth/feishu?p=${projectId}`;
          } else {
            const request = getRequest();
            getWorkWeiXinCorpInfoByApp(projectId, request.ReturnUrl);
          }
        }}
      >
        <i className={`${integrationInto[projectIntergrationType].iconClassName} mRight8`} style={style} />
        <span className="txt">
          {customNameIcon.name ||
            integrationInto[projectIntergrationType === 6 && isLark ? 'lark' : projectIntergrationType].text}
        </span>
      </a>
    );
  };

  return (
    <React.Fragment>
      {/* 手机号邮箱时 可切换验证方式 */}
      {modeType === 1 &&
        isOpenSystemLogin &&
        (!md.global.Config.IsLocal ||
          (md.global.Config.IsLocal && md.global.SysSettings.enableVerificationCodeLogin)) && (
          <div
            className="Hand ThemeColor3 ThemeHoverColor3 mTop25 TxtCenter Bold"
            onClick={() => {
              if (window.isMingDaoApp && verifyType === 'verifyCode') {
                window.md_js.back({});
                return;
              }
              onChange({ verifyType: verifyType === 'password' ? 'verifyCode' : 'password', password: '' });
            }}
          >
            {verifyType === 'verifyCode' ? _l('使用账号密码登录') : _l('使用验证码登录')}
          </div>
        )}
      {!hideOther && (
        <div className="tpLogin">
          {/* 开启了ldap或系统登录,并且存在其他登录方式 */}
          {(openLDAP || isOpenSystemLogin) &&
            modeType &&
            (canChangeSysOrLDAP || intergrationScanEnabled || isOpenSso || isCanWeixin || isCanQQ) && (
              <div className="title Font14">{_l('或通过以下方式')}</div>
            )}
          {canChangeSysOrLDAP && renderSysOrLDAPBtn(modeType === 1 && ldapIcon)}
          {isOpenSso && renderSsoBtn()}
          {intergrationScanEnabled && renderIntegrationBtn()}
          {isCanWeixin &&
            (isWeiXin ? (
              <a href="weixin://dl/business/?appid=wx83ed6195301ec2d8&path=pages/login/index">
                <i className="weixinIcon mRight8" /> {_l('小程序登录')}
              </a>
            ) : (
              <a href="//tp.mingdao.com/weixin/authRequest">
                <i className="weixinIcon mRight8" /> {_l('微信登录')}
              </a>
            ))}
          {isCanQQ && (
            <a href="//tp.mingdao.com/qq/authRequest">
              <i className="personalQQIcon mRight8" /> {_l('QQ登录')}
            </a>
          )}
          {!_.isEmpty(googleSsoSet) &&
            googleSsoSet.map(o => {
              return (
                <a href={isMobile ? o.h5IndexUrl : o.webIndexUrl} className="w100 flexRow alignItemsCenter">
                  {o.tpType === 13 ? (
                    <React.Fragment>
                      <img src={googleIcon} width="20px" className="mRight8" />
                      {_l('Google登录')}
                    </React.Fragment>
                  ) : o.tpType === 14 ? (
                    <React.Fragment>
                      <img src={microsoftIcon} width="20px" className="mRight8" />
                      {_l('Microsoft登录')}
                    </React.Fragment>
                  ) : o.tpType === 2 ? (
                    <React.Fragment>
                      <i className="personalQQIcon mRight8" /> {_l('QQ登录')}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <i className="weixinIcon mRight8" /> {_l('微信登录')}
                    </React.Fragment>
                  )}
                </a>
              );
            })}
        </div>
      )}
    </React.Fragment>
  );
}
