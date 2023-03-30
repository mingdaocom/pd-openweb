export default {
  SupportFindVerifyCodeUrl: 'https://help.mingdao.com/zh/introduction4.html',
  InviteFromType: {
    register: -1, // 主动注册
    friend: 0, // 好友
    group: 1, // 群组
    task: 2, // 任务
    kc: 3, // 知识
    project: 4, // 组织
    calendar: 5, // 日程
    tFolder: 6, // 任务项目
  },
  CodeTypeEnum: {
    message: 0,
    voice: 1,
  },
  ActionTypes: {
    oldAccount: 'old',
    newAccount: 'new',
    createProject: 'create',
  },
  AccountVerifyNextActions: {
    login: 1, // 填写账号信息
    createProject: 2, // 创建网络
    userCardInfo: 3, // 填写网络名片
  },
  ExistAccountNextActions: {
    login: 1, // 登录
    createProject: 2, // 创建网络
    userCardInfo: 3, // 填写网络名片
  },
  ActionResult: {
    accountIsNoExist: -1, // 账号不存在
    failed: 0, // 动作执行失败
    success: 1, // 动作执行成功
    fieldRequired: 2, // 字段缺失
    failInvalidVerifyCode: 3, // 验证码错误
    userInvalid: 4, // 用户登录信息错误
    userInfoNotFound: 5, // 用户信息不存在
    userAccountExists: 6, // 用户帐号已存在
    inviteLinkExpirate: 7, // 邀请链接失效
    sendMobileMessageFrequent: 8, // 短信发送过于频繁
    failPasswordValidate: 9, // 密码格式不正确
    projectUserExists: 10, // 已经是网络成员
    freeProjectForbid: 11, // 免费网络禁止
    emailNotNull: 12, // 邮箱不能为空
    userFromError: 14, // 账号来源类型受限
    accountFrequentLoginError: 15, // 账号被锁定 需要图形验证
    noEfficacyVerifyCode: 16, // 验证码已经失效，请重新发送
    mobileNotNull: 17,
    firstLoginResetPassword: 18, // 首次登录需要重置密码
    passwordOverdue: 19, // 密码过期
    samePassword: 20, // 新旧密码一致
    isLock: 21 ,// 代表频繁用户被锁定20分钟，提示看下登录里面的锁定提示，保持跟登录一致，锁定的分钟写死20分钟即可
    balanceIsInsufficient: 22 // 22代表网络余额不足
  },
};
