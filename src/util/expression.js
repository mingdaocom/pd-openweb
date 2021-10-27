
// 验证一个字符串时候是email
RegExp.isEmail = function (str) {
  var emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i;
  return emailReg.test(str);
};
// 验证一个字符串是否是
RegExp.isUrl = function (str) {
  var patrn = /^http(s)?:\/\/[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+[\/=\?%\-&_~`@[\]:+!]*([^<>])*$/;
  return patrn.exec(str);
};
// 验证一个字符串是否是电话或传真
RegExp.isTel = function (str) {
  var pattern = /^[+]?((\d){3,4}([ ]|[-]))?((\d){3,9})(([ ]|[-])(\d){1,12})?$/;
  return pattern.exec(str);
};
// 验证一个字符串是否是手机号码
RegExp.isMobile = function (str) {
  var patrn = /^(1[3-9]{1})\d{9}$/;
  return patrn.exec(str);
};
// 验证一个字符串是否是传真号
RegExp.isFax = function (str) {
  var patrn = /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
  return patrn.exec(str);
};
// 验证一个字符串是否是数字
RegExp.isNum = function (str) {
  var p = /^\d+$/;
  return p.exec(str);
};
// 验证字符串是否不包含特殊字符 返回bool
RegExp.isUnSymbols = function (str) {
  var p = /^[A-Za-z0-9\u0391-\uFFE5 \.,()，。（）\-]+$/;
  return p.exec(str);
};
// 密码为8-20位，必须包含字母+数字
RegExp.isPasswordRule = function (str, passwordRegex) {
  if (passwordRegex) {
    return new RegExp(passwordRegex).test(str);
  }
  return /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/.test(str);
};

export default RegExp;
