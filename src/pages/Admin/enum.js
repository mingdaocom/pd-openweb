import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';

export const CLEAR_CACHE_PROCESS_TYPE = {
  ORG_ROLE: 101,
  DEPARTMENT: 102,
  ALL_DEPARTMENT: 1303,
  ALL_ORG_ROLE: 1305,
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
  [PERMISSION_ENUM.MEMBER]: ['home', 'structure', 'roles'],
  [PERMISSION_ENUM.DEPARTMENT]: ['structure'],
  [PERMISSION_ENUM.REPORT_RELATION]: ['reportrelation'],
  [PERMISSION_ENUM.ROLE_MENAGE]: ['roles'],
  [PERMISSION_ENUM.GROUP_MANAGE]: ['groups'],
  [PERMISSION_ENUM.EXTERNAL_USER_MANAGE]: ['external'],
  [PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE]: ['delegation'],

  [PERMISSION_ENUM.THIRD_PLATFORM_INTEGRATION]: ['platformintegration'],
  [PERMISSION_ENUM.WX_PUBLIC_ACCOUNT_INTEGRATION]: ['systemservice', 'weixin', 'cloudprint'],
  [PERMISSION_ENUM.LDAP_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.SSO_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.PLATFORM_ACCOUNT_LOGIN]: ['integrationothers'],
  [PERMISSION_ENUM.OPEN_INTERFACE]: ['integrationothers'],
  [PERMISSION_ENUM.BASIC_SETTING]: ['sysinfo', 'certinfo', 'cloudservice', 'orgothers'],
  [PERMISSION_ENUM.FINANCE]: ['home', 'billinfo', 'billing'],
  [PERMISSION_ENUM.SECURITY]: ['security', 'addressBook', 'dataAccess', 'function'],
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
  [PERMISSION_ENUM.APP_SANDBOX]: ['appSandbox'],
  [PERMISSION_ENUM.REVIEW_UPGRADE]: ['reviewUpgrade'],
  [PERMISSION_ENUM.MANAGE_MERCHANT]: ['merchant'],
  [PERMISSION_ENUM.WITHDRAW]: ['merchant'],
  [PERMISSION_ENUM.ORDER]: ['transaction', 'refund'],
  [PERMISSION_ENUM.TAX_OPEN]: ['invoice'],
  [PERMISSION_ENUM.INVOICE]: ['invoice'],
  [PERMISSION_ENUM.TAX_SETTING]: ['invoice'],

  [PERMISSION_ENUM.APP_MANAGE_LOG]: ['applog'],
  [PERMISSION_ENUM.RECORD_OPERATE_LOG]: ['applog'],
  [PERMISSION_ENUM.USER_ACTION_LOG]: ['applog'],
  [PERMISSION_ENUM.LOGIN_LOG]: ['loginlog'],
  [PERMISSION_ENUM.PROJECT_MANAGE_LOG]: ['orglog'],
  [PERMISSION_ENUM.THIRD_APP]: ['thirdapp'], //第三方应用
};

export const PRODUCT_TYPE_ENUM = {
  STANDARD_MONTHLY: 1,
  STANDARD_YEARLY: 2,
  PROFESSIONAL_MONTHLY: 3,
  PROFESSIONAL_YEARLY: 4,

  DATASYNC_MONTHLY: 5,
  WORKFLOW_EXECUTION_MONTHLY: 6,
  ATTACHMENT_UPLOAD_YEARLY: 7,
  EXTERNAL_MONTHLY: 8,
  EXTERNAL_YEARLY: 9,
  AGGREGATED_TABLE_MONTHLY: 10,
  RECHARGE: 11,
};
