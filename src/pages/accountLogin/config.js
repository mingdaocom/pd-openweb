import React from 'react';

export const SupportFindVerifyCodeUrl = 'https://help.mingdao.com/faq/sms-emali-service-failure';

export const InviteFromType = {
  register: -1, // 主动注册
  friend: 0, // 好友
  group: 1, // 群组
  task: 2, // 任务
  kc: 3, // 知识
  project: 4, // 组织
  calendar: 5, // 日程
  tFolder: 6, // 任务项目
};

export const CodeTypeEnum = {
  message: 0,
  voice: 1,
};

export const ActionTypes = {
  oldAccount: 'old',
  newAccount: 'new',
  createProject: 'create',
};

export const AccountNextActions = {
  login: 1, // 填写账号信息 登录
  createProject: 2, // 创建网络
  userCardInfo: 3, // 填写网络名片
};

export const ActionResult = {
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
  isLock: 21, // 代表频繁用户被锁定20分钟，提示看下登录里面的锁定提示，保持跟登录一致，锁定的分钟写死20分钟即可
  balanceIsInsufficient: 22, // 22代表网络余额不足
  accoutRegisterClosed: 23, // 23关闭注册 非注册时间段
};

export const scaleList = [
  _l('20人以下'),
  _l('21-99人'),
  _l('100-499人'),
  _l('500-999人'),
  _l('1000-9999人'),
  _l('10000人以上'),
];

export const depList = [
  _l('总经办'),
  _l('技术/IT/研发'),
  _l('产品/设计'),
  _l('销售/市场/运营'),
  _l('人事/财务/行政'),
  _l('资源/仓储/采购'),
  _l('其他'),
];

export const rankList = [
  _l('总裁/总经理/CEO'),
  _l('副总裁/副总经理/VP'),
  _l('总监/主管/经理'),
  _l('员工/专员/执行'),
  _l('其他'),
];

export const isInterestedList = [
  {
    text: _l('我是用户'),
    value: 0,
  },
  {
    text: (
      <div
        className="itemText"
        style={{ height: 'auto', 'overflow-x': 'auto', 'text-overflow': 'initial' }}
        dangerouslySetInnerHTML={{
          __html: _l(
            '我是用户，并对HAP %0伙伴政策%1 感兴趣',
            `<a class='Bold pLeft5 pRight5 Hand' target="_blank" href="https://www.mingdao.com/partners" >`,
            `</a>`,
          ),
        }}
      ></div>
    ),
    value: 1,
  },
];
