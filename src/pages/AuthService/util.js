
import filterXSS from 'xss';
import _ from 'lodash';
import { getRequest, mdAppResponse } from 'src/util';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import RegExpValidator from 'src/util/expression';

// 特殊手机号验证是否合法
export const specialTelVerify = value => {
  return /\+861[3-9]\d{9}$/.test(value || '');
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
    toMDPage()
  }

  if (window.isMingDaoApp) {
    mdAppResponse({
      sessionId: 'register',
      type: 'native',
      settings: { action: action ? action : 'registerSuccess', account: dialCode + emailOrTel, password },
    });
  }
};

export const toMDPage = () => {
  if (_.get(md, 'global.SysSettings.loginGotoUrl')) {
    location.href = md.global.Config.WebUrl + md.global.SysSettings.loginGotoUrl
    return
  }
  if (_.get(md, 'global.SysSettings.loginGotoAppId')) {
    window.location.replace(`/app/${md.global.SysSettings.loginGotoAppId}`);
    return
  }
  window.location.replace('/dashboard');
};

export const toMDApp = ({ emailOrTel = '', dialCode = '' }) => {
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

export const validation = ({ isForSendCode, keys = [], type, info }) => {
  const {
    emailOrTel = '',
    verifyCode = '',
    password = '',
    fullName = '',
    dialCode,
    hasCheckPrivacy,
    canSendCodeByTel,
  } = info;
  let isRight = true;
  let warnList = [];

  if (keys.includes('emailOrTel') || keys.includes('tel') || keys.includes('email')) {
    if (!!emailOrTel.replace(/\s*/g, '')) {
      //手机号或者邮箱 不为空
      const iti = initIntlTelInput();
      iti.setNumber(emailOrTel);
      //邮箱验证
      const isEmailRule = emailOrTel => {
        const emailReg =
          /^[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*@[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*\.[\u4e00-\u9fa5\w-]+$/i;
        if (!emailReg.test(emailOrTel.trim())) {
          warnList.push({ tipDom: 'inputAccount', warnTxt: _l('邮箱格式错误') });
          isRight = false;
        }
      };
      //手机号验证
      const isTelRule = () => {
        if (!iti.isValidNumber() && !specialTelVerify(iti.getNumber())) {
          warnList.push({ tipDom: 'inputAccount', warnTxt: _l('手机号格式错误') });
          isRight = false;
        }
      };
      if (keys.includes('tel')) {
        isTelRule();
      } else if (keys.includes('email')) {
        isEmailRule(emailOrTel);
      } else {
        if (isTel(emailOrTel)) {
          isTelRule();
        } else {
          //邮箱验证规则
          isEmailRule(emailOrTel);
        }
      }
    } else {
      //手机号或者邮箱 为空
      if (keys.includes('tel')) {
        warnList.push({ tipDom: 'inputAccount', warnTxt: _l('手机号不能为空') });
        isRight = false;
      } else if (keys.includes('email')) {
        warnList.push({ tipDom: 'inputAccount', warnTxt: _l('邮箱不能为空') });
        isRight = false;
      } else {
        warnList.push({ tipDom: 'inputAccount', warnTxt: _l('手机号或邮箱不能为空') });
        isRight = false;
      }
    }
  }

  if (keys.includes('fullName')) {
    if (!_.trim(fullName)) {
      warnList.push({ tipDom: 'inputFullname', warnTxt: _l('用户名不能为空') });
      isRight = false;
    }
  }

  if (
    isForSendCode &&
    ['invite', 'register'].includes(type) &&
    isTel(emailOrTel) &&
    dialCode !== '+86' &&
    keys.includes('code') &&
    !canSendCodeByTel
  ) {
    warnList.push({ tipDom: 'canSendCodeByTel', warnTxt: _l('未勾选同意接收短信') });
    isRight = false;
  }

  if (!isForSendCode) {
    //获取验证码时，不需要校验验证码 以及 密码
    if (
      keys.includes('code') &&
      (!verifyCode || verifyCode.length < 4 || verifyCode.length > 8) //登录地方验证码必须4-8位才合法
    ) {
      warnList.push({
        tipDom: 'inputCode',
        warnTxt: !verifyCode ? _l('请输入验证码') : _l('验证码不合法'),
        isError: true,
      });
      isRight = false;
    }

    if (keys.includes('password') || keys.includes('setPassword')) {
      if (!password) {
        warnList.push({ tipDom: 'inputPassword', warnTxt: _l('密码不能为空') });
        isRight = false;
      } else {
        if (keys.includes('setPassword')) {
          //登录时，不需要验证密码的合法性
          if (!RegExpValidator.isPasswordValid(password)) {
            warnList.push({ tipDom: 'inputPassword', warnTxt: _l('密码格式错误') });
            isRight = false;
          }
        }
      }
    }
    //注册 需要勾选 使用条款 与 隐私条款
    if (!hasCheckPrivacy && keys.includes('privacy')) {
      warnList.push({ tipDom: 'privacyText', warnTxt: _l('请勾选同意后注册'), isError: true });
      isRight = false;
    }
  }
  return { isRight, warnList };
};

export const renderClassName = (warnList, key, value,) => {
  const warn = warnList.find(o => o.tipDom === key);
  return {
    hasValue: !!value || focusDiv === key,
    errorDiv: warn,
    warnDiv: warn && warn.noErr,
    errorDivCu: !!focusDiv && focusDiv === key,
  };
};

export const renderWarn = (warnList, key) => {
  const warn = warnList.find(o => o.tipDom === key);
  if (!warn) return;
  return <div className={cx('warnTips')}>{warn.warnTxt}</div>;
};
