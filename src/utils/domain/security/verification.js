import { get } from 'lodash';

export const VERIFY_TYPE = {
  password: 0,
  mobilePhone: 1,
  email: 2,
  totp: 3,
  bioVerify: 4,
};

const VERIFY_TYPE_ORDER = [
  VERIFY_TYPE.password,
  VERIFY_TYPE.mobilePhone,
  VERIFY_TYPE.email,
  VERIFY_TYPE.totp,
  VERIFY_TYPE.bioVerify,
];

export const isVerifyCodeType = verifyType =>
  [VERIFY_TYPE.mobilePhone, VERIFY_TYPE.email, VERIFY_TYPE.totp].includes(verifyType);

export const getVerifyTypes = ({ mobilePhone, email, totpEnabled, bioVerifyAvailable }) => {
  const availability = {
    [VERIFY_TYPE.password]: true,
    [VERIFY_TYPE.mobilePhone]: !!mobilePhone,
    [VERIFY_TYPE.email]: !!email,
    [VERIFY_TYPE.totp]: !!totpEnabled,
    [VERIFY_TYPE.bioVerify]: !!bioVerifyAvailable,
  };

  return VERIFY_TYPE_ORDER.filter(type => availability[type]);
};

export const getVerifyPasswordErrorMessage = (statusCode, verifyType = VERIFY_TYPE.password) => {
  if (statusCode === 6) {
    return _l('密码不正确');
  }

  if (statusCode === 8) {
    return _l('验证码错误');
  }

  if (statusCode === 10 && isVerifyCodeType(verifyType)) {
    return _l('验证码已失效，请重新获取');
  }

  if ([0, 5].includes(statusCode) && isVerifyCodeType(verifyType)) {
    return _l('当前不支持该验证方式');
  }

  return _l('操作失败');
};

export const getSendVerifyCodeErrorMessage = statusCode => {
  if (statusCode === 8) {
    return _l('图形验证码错误，请重新验证');
  }

  if (statusCode === 10) {
    return _l('验证码发送过于频繁，请稍后再试');
  }

  return _l('验证码发送失败');
};

export const getVerifyValueError = ({ verifyType = VERIFY_TYPE.password, password = '', verifyCode = '' } = {}) => {
  if (verifyType === VERIFY_TYPE.bioVerify) {
    return '';
  }

  if (verifyType === VERIFY_TYPE.password) {
    return password.trim() ? '' : _l('请输入密码');
  }

  if (verifyType === VERIFY_TYPE.totp) {
    return verifyCode.trim().length === 6 ? '' : _l('请输入6位验证码');
  }

  return verifyCode.trim() ? '' : _l('请输入验证码');
};

/** 按显式规则、组织规则或默认强度规则校验密码。 */
export const isPasswordValid = (value, passwordRegex) => {
  const regexSource = passwordRegex || get(md, 'global.SysSettings.passwordRegex');
  const regex = regexSource ? new RegExp(regexSource) : /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/;
  return regex.test(value);
};
