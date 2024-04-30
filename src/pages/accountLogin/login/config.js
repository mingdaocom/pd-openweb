export const LoginResult = {
  failed: 0,
  accountSuccess: 1, // 帐号验证成功
  accountError: 2, // 账号不存在
  passwordError: 3, // 密码错误
  verifyCodeError: 4, // 验证码输入错误
  accountFrequentLoginError: 5, // 频繁登录错误，需要验证码
  accountNotExist: 7, // 账号不存在
  userFromError: 8, // 账号来源类型受限
  accountDisabled: 9, // 账号被禁用
  needTwofactorVerifyCode: 10, // 开启了两步验证 代表用户未进入两步验证流程
  invalidVerifyCode: 11, //验证码失效；
  isLock: 12, // 登录次数过多被锁定，会增加剩余锁定时间，时间为秒
  firstLoginResetPassword: 13, //首次登录需修改密码
  passwordOverdue: 14, // 密码过期需要重新设置密码
  cancellation: 15, //注销
};

export const TwofactorVerifyCodeActionResult = {
  failed: 0, // 失败
  success: 1, // 成功
  failInvalidVerifyCode: 3, //  图形验证码错误
  userInvalid: 4, // 用户未进入两步验证流程
  sendFrequent: 8, // 发送过于频繁，需要出来图形验证码机制验证
  noEmail: 12, // 邮箱不能为空
  noTel: 17, // 手机号不能为空
};
