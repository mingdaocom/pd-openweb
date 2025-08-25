export const PERMISSION_ENUM = {
  //用户
  MEMBER_MANAGE: 10100,
  ROLE_MENAGE: 10300,
  GROUP_MANAGE: 10500,
  EXTERNAL_USER_MANAGE: 10700,
  DEPUTE_HANDOVER_MANAGE: 10800,

  //账号集成
  THIRD_PLATFORM_INTEGRATION: 10910,
  WX_PUBLIC_ACCOUNT_INTEGRATION: 10920,
  LDAP_LOGIN: 10930,
  SSO_LOGIN: 10940,
  OPEN_INTERFACE: 10950,
  PLATFORM_ACCOUNT_LOGIN: 10960,
  THIRD_APP: 10915,

  //组织
  BASIC_SETTING: 13100,
  FINANCE: 13300,
  DASHBOARD_SETTING: 13500,
  PROJECT_ANNOUNCER: 13700,
  MANAGE_TREND: 13800,
  SECURITY: 13900,

  //应用
  CREATE_APP: 15100,
  APP_RESOURCE_SERVICE: 15300,
  USER_ANALYTICS: 15500,
  GENERAL_SETTING: 15700,

  //商户服务
  MERCHANT_SERVICE: 16000,

  //日志
  APP_LOG: 17100,
  LOGIN_LOG: 17300,
  PROJECT_MANAGE_LOG: 17500,

  //集成和插件
  //API集成
  CREATE_API_CONNECT: 19110,
  MANAGE_API_CONNECTS: 19120,
  //数据集成
  CREATE_SYNC_TASK: 19310,
  MANAGE_SYNC_TASKS: 19320,
  MANAGE_DATA_SOURCES: 19330,
  //插件
  DEVELOP_PLUGIN: 19510,
  MANAGE_PLUGINS: 19520,

  NOT_MEMBER: 'NOT_MEMBER', //不是成员
  SHOW_APPLY: 'SHOW_APPLY', //显示申请角色
  SHOW_MY_CHARACTER: 'SHOW_MY_CHARACTER', //显示我的角色
  SHOW_MANAGER: 'SHOW_MANAGER', // 显示管理员菜单
  CAN_PURCHASE: 'CAN_PURCHASE', //可以购买
};

export const ROUTE_CONFIG = {
  SHOW_MANAGER: ['sysroles'],
  CAN_PURCHASE: [
    'valueaddservice',
    'upgradeservice',
    'waitingpay',
    'expansionservice',
    'expansionserviceWorkflow',
    'expansionserviceAggregationtable',
    'expansionserviceComputing',
  ],
  [PERMISSION_ENUM.MEMBER_MANAGE]: ['home', 'structure', 'roles', 'reportrelation'],
  [PERMISSION_ENUM.ROLE_MENAGE]: ['roles'],
  [PERMISSION_ENUM.GROUP_MANAGE]: ['groups'],
  [PERMISSION_ENUM.EXTERNAL_USER_MANAGE]: ['portal'],
  [PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE]: ['delegation'],
  [PERMISSION_ENUM.THIRD_PLATFORM_INTEGRATION]: ['platformintegration'],
  [PERMISSION_ENUM.WX_PUBLIC_ACCOUNT_INTEGRATION]: ['weixin'],
  [PERMISSION_ENUM.LDAP_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.SSO_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.PLATFORM_ACCOUNT_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.OPEN_INTERFACE]: ['integrationothers'],
  [PERMISSION_ENUM.BASIC_SETTING]: ['sysinfo', 'orgothers'],
  [PERMISSION_ENUM.FINANCE]: ['home', 'billinfo'],
  [PERMISSION_ENUM.SECURITY]: ['security', 'account', 'data', 'securityOthers'],
  [PERMISSION_ENUM.APP_RESOURCE_SERVICE]: [
    'home',
    'app',
    'workflows',
    'tableAggregation',
    'variables',
    'computing',
    'database',
    'aggregationTable',
    'quota',
  ],
  [PERMISSION_ENUM.USER_ANALYTICS]: ['analytics'],
  [PERMISSION_ENUM.GENERAL_SETTING]: ['settings'],
  [PERMISSION_ENUM.MERCHANT_SERVICE]: ['merchant', 'order', 'transaction', 'refund', 'withdrawalsrecord'],
  [PERMISSION_ENUM.APP_LOG]: ['applog'],
  [PERMISSION_ENUM.LOGIN_LOG]: ['loginlog'],
  [PERMISSION_ENUM.PROJECT_MANAGE_LOG]: ['orglog'],
  [PERMISSION_ENUM.THIRD_APP]: ['thirdapp'], //第三方应用--仅私有部署
};
