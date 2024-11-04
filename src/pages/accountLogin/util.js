import React from 'react';
import cx from 'classnames';
import filterXSS from 'xss';
import _ from 'lodash';
import { getRequest, mdAppResponse } from 'src/util';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';

// 特殊手机号验证是否合法
export const specialTelVerify = value => {
  return /\+861[3-9]\d{9}$/.test(value || '');
};

//className list=> current,errorDiv,errorDivCu
export const setWarnningData = (warnningData, list, focusDiv, currentData) => {
  return {
    current: !!currentData || _.includes(list, focusDiv),
    errorDiv: _.find(warnningData, it => _.includes(list, it.tipDom)),
    warnDiv:
      _.find(warnningData, it => _.includes(list, it.tipDom)) &&
      _.find(warnningData, it => _.includes(list, it.tipDom)).noErr,
    errorDivCu: !!focusDiv && _.includes(list, focusDiv),
  };
};

//render warnningTip
export const warnningTipFn = (warnningData, list, focusDiv) => {
  let data = _.find(warnningData, it => _.includes(list, it.tipDom));
  if (data) {
    return (
      <div
        className={cx('warnningTip', {
          // Hidden: _.includes(list, focusDiv) && !data.noErr,
          noIcon: !!data.noErr,
        })}
        dangerouslySetInnerHTML={{ __html: data.warnningText }}
        onClick={data.onClick}
      ></div>
    );
  }
};

export const clickErrInput = (warnningData = [], focusDiv, setData) => {
  if (!focusDiv) {
    setTimeout(() => {
      setData ? setData({ focusDiv: warnningData[0].tipDom }) : $(warnningData[0].tipDom).focus();
    }, 500);
  }
};

// 当前页面是否有验证码层
export const hasCaptcha = () => {
  return (
    document.getElementById('tcaptcha_iframe') ||
    (document.getElementsByClassName('captchaInput') && document.getElementsByClassName('captchaInput').length > 0)
  );
};

export const getDataByFilterXSS = summary => {
  let domain = summary.split('/'); //以“/”进行分割
  if (domain[2]) {
    domain = domain[2];
  } else {
    domain = ''; //如果url不正确就取空
  }
  if (summary.indexOf('javascript:') >= 0 || (domain.indexOf('mingdao') < 0 && domain !== location.host)) {
    return '/dashboard';
  }
  return filterXSS(summary);
};

//  注册流程后登录成功跳转
export const registerSuc = (registerData, action) => {
  const { emailOrTel, dialCode, password } = registerData;
  let request = getRequest();
  let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');
  if (returnUrl.indexOf('type=privatekey') > -1) {
    location.href = returnUrl;
  } else {
    location.href = '/dashboard';
  }

  if (window.isMingDaoApp) {
    mdAppResponse({
      sessionId: 'register',
      type: 'native',
      settings: { action: action ? action : 'registerSuccess', account: dialCode + emailOrTel, password },
    });
  }
};

export const toMDApp = (dataList = {}) => {
  const { emailOrTel = '', dialCode = '' } = dataList;

  if (window.isMingDaoApp) {
    mdAppResponse({
      sessionId: 'register',
      type: 'native',
      settings: { action: 'registerSuccess', account: dialCode + emailOrTel },
    });
  }
};

export const initIntlTelInput = () => {
  if (window.initIntlTelInput) {
    return window.initIntlTelInput;
  }
  const $con = document.createElement('div');
  const $input = document.createElement('input');
  $con.style.display = 'none';
  $con.appendChild($input);
  document.body.appendChild($con);
  window.initIntlTelInput = intlTelInput($input, {
    initialCountry: getDefaultCountry(),
    preferredCountries: _.get(md, 'global.Config.DefaultConfig.preferredCountries') || [getDefaultCountry()],
    utilsScript: utils,
  });
  return window.initIntlTelInput;
};

export const isTel = emailOrTel => {
  return (
    !!emailOrTel &&
    emailOrTel.indexOf('@') < 0 &&
    !isNaN(emailOrTel.replace(/\s*/g, '')) &&
    getEmailOrTel(emailOrTel).length >= 1
  );
};

export const getEmailOrTel = (str = '') => {
  const iti = initIntlTelInput();
  let emailOrTel = str.indexOf(' ') >= 0 ? str.replace(/\s*/g, '') : str; //去除空格
  if (str.indexOf('@') >= 0) {
    return emailOrTel;
  }
  return emailOrTel.replace(`+${iti.getSelectedCountryData().dialCode}`, '');
};

export const getDialCode = (isMobile = true) => {
  const iti = initIntlTelInput();
  return isMobile ? `+${iti.getSelectedCountryData().dialCode}` : '';
};

export const getDefaultCountry = () => {
  return (
    window.localStorage.getItem('DefaultCountry') || _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn'
  );
};

export const getAccountTypes = isLogin => {
  const { enableMobilePhoneRegister, enableEmailRegister, hideRegister } = _.get(md, 'global.SysSettings');
  //登录 ｜ 关闭了注册
  if (isLogin || hideRegister) {
    return 'emailOrTel';
  }
  return enableMobilePhoneRegister && enableEmailRegister ? 'emailOrTel' : enableEmailRegister ? 'email' : 'tel';
};
//下载的地址，登录后关闭
export const checkReturnUrl = url => {
  const returnUrl = decodeURIComponent(url).toLowerCase();
  ['file/downchatfile', 'file/downdocument', 'download/appfile'].map(o => {
    if (returnUrl.indexOf(o) >= 0) {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  });
};
