// validators

// regexps
// validators

// regexps
const Reg = {
  // 手机号码
  mobilePhoneNumber: /^[+]?[0-9]{5,}$/,
  // 座机号码
  telephoneNumber: /^[+]?((\d){3,4}([ ]|[-]))?((\d){3,9})(([ ]|[-])(\d){1,12})?$/,
  // 邮箱地址
  emailAddress: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i,
  // 身份证号码
  idCardNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  // 护照
  passportNumber: /^[a-zA-Z0-9]{5,17}$/,
  // 港澳通行证
  hkPassportNumber: /.*/,
  // 台湾通行证
  twPassportNumber: /.*/,
};

const Validator = {
  isMobilePhoneNumber: (str) => {
    return Reg.mobilePhoneNumber.test(str);
  },
  isTelehoneNumber: (str) => {
    return Reg.telephoneNumber.test(str);
  },
  isEmailAddress: (str) => {
    return Reg.emailAddress.test(str);
  },
  isIdCardNumber: (str) => {
    return Reg.idCardNumber.test(str);
  },
  isPassportNumber: (str) => {
    return Reg.passportNumber.test(str);
  },
  isHkPassportNumber: (str) => {
    return Reg.hkPassportNumber.test(str);
  },
  isTwPassportNumber: (str) => {
    return Reg.twPassportNumber.test(str);
  },
};

export default Validator;
