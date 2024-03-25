// 验证一个字符串是email
RegExp.isEmail = function(str) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(str);
};

// 验证一个字符串是网址
RegExp.isURL = function(str) {
  const pattern = /^http(s)?:\/\/[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+[\/=\?%\-&_~`@[\]:+!]*([^<>])*$/;
  return pattern.exec(str);
};

// 验证一个字符串是带区号手机号
RegExp.isPhoneNumberWithAreaCode = function(str) {
  const pattern = /^[+]?((\d){3,4}([ ]|[-]))?((\d){3,9})(([ ]|[-])(\d){1,12})?$/;
  return pattern.exec(str);
};

// 验证一个字符串是手机号码
RegExp.isPhoneNumber = function(str) {
  const pattern = /^(1[3-9]{1})\d{9}$/;
  return pattern.exec(str);
};

// 验证密码格式是否符合
RegExp.isPasswordValid = function(str, passwordRegex) {
  const regex = passwordRegex ? new RegExp(passwordRegex) : /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/;
  return regex.test(str);
};

// 判断是视频格式
RegExp.isVideo = fileExt => {
  return /.*?\.(mov|mp4|avi|mkv|3gp|3g2|m4v|rm|rmvb|webm)$/.test((fileExt || '').toLowerCase());
};

// 验证一个字符串是否是链接
RegExp.isUrlRequest = url => {
  if (/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return true;
  if (/^\//.test(url)) return true;
  return false;
};

export default RegExp;
