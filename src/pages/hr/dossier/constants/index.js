/** 员工关系管理tab */
/** 员工关系管理tab */
export const RELATION_MANAGE_TAB = {
  /** 入职 */
  INDUCTION: 1,
  /** 转正 */
  PROMOTION: 2,
  /** 离职 */
  DIMISSION: 3,
};

/** 入职管理分类 */
export const ACCOUNT_SORT = {
  /** 待入职 */
  INDUCTION_INVITINHG: 1,
  /** 已入职未加入网络 */
  INDUCTION_INVITED: 2,
  /** 转正所有 */
  PROMOTION_ALL: 3,
  /** 转正已到期 */
  PROMOTION_EXPIRED: 4,
  /** 转正未到期 */
  PROMOTION_WILL_EXPIRE: 5,
  /** 离职所有 */
  DIMISSION_ALL: 6,
  /** 离职已到期 */
  DIMISSION_EXPIRED: 7,
  /** 离职未到期 */
  DIMISSION_WILL_EXPIRE: 8,
};

export const ENTRY_TYPE = {
  /** 待入职 */
  [ACCOUNT_SORT.INDUCTION_INVITINHG]: 0,
  /** 已入职未加入网络 */
  [ACCOUNT_SORT.INDUCTION_INVITED]: 1,
  /** 转正所有 */
  [ACCOUNT_SORT.PROMOTION_ALL]: 0,
  /** 转正已到期 */
  [ACCOUNT_SORT.PROMOTION_EXPIRED]: 1,
  /** 转正未到期 */
  [ACCOUNT_SORT.PROMOTION_WILL_EXPIRE]: 2,
  /** 离职所有 */
  [ACCOUNT_SORT.DIMISSION_ALL]: 0,
  /** 离职已到期 */
  [ACCOUNT_SORT.DIMISSION_EXPIRED]: 1,
  /** 离职未到期 */
  [ACCOUNT_SORT.DIMISSION_WILL_EXPIRE]: 2,
};

export const ENTRY_NAME = {
  /** 待入职 */
  [ACCOUNT_SORT.INDUCTION_INVITINHG]: 'entryType',
  /** 已入职未加入网络 */
  [ACCOUNT_SORT.INDUCTION_INVITED]: 'entryType',
  /** 转正所有 */
  [ACCOUNT_SORT.PROMOTION_ALL]: 'formalType',
  /** 转正已到期 */
  [ACCOUNT_SORT.PROMOTION_EXPIRED]: 'formalType',
  /** 转正未到期 */
  [ACCOUNT_SORT.PROMOTION_WILL_EXPIRE]: 'formalType',
  /** 离职所有 */
  [ACCOUNT_SORT.DIMISSION_ALL]: 'formalType',
  /** 离职已到期 */
  [ACCOUNT_SORT.DIMISSION_EXPIRED]: 'formalType',
  /** 离职未到期 */
  [ACCOUNT_SORT.DIMISSION_WILL_EXPIRE]: 'formalType',
};

export const PAGE_SIZE = 30;

/** 人物卡片操作枚举 */
export const CARD_HANDLE_SORT = {
  /** 放弃入职 */
  ABANDON_INDUCTION: 1,
  /** 编辑入职信息 */
  EDIT_INDUCTION_INFO: 2,
  /** 放弃入职并移除 */
  DIMISION_AND_MOVE_FROM_PROJECT: 3,
  /** 办理离职 */
  DO_DIMISSION: 4,
  /** 查看资料 */
  CHECK_INFO: 5,
  /** 调整离职信息 */
  EDIT_DIMISSION_INFO: 6,
  /** 放弃离职 */
  ABANDON_DIMISSION: 7,
  /** 查看入职资料 */
  CHECK_INDUCTION_INFO: 8,
};

/** 档案筛选栏的状态 */
export const RECODER_NAV_STATE = {
  /** 默认 */
  DEFAULT: 1,
  /** 高级筛选 */
  SENIOR_FILTER: 2,
  /** 显示设置 */
  SHOW_SETTING: 3,
  /** 批量修改 */
  EDIT: 4,
  /** 批量导出 */
  EXPORT: 5,
};

export const ACCOUNT_FIELD = {
  /** 姓名 */
  NAME: '59674682d4e6353d306373e7',
  /** 英文名 */
  ENGLISH_NAME: '59674682d4e6353d306373e8',
  /** 性别 */
  SEX: '59674682d4e6353d306373e9',
  /** 生日 */
  BIRTH: '59674682d4e6353d306373ea',
  /** 星座 */
  SIGN: '59674682d4e6353d306373eb',
  /** 年龄 */
  AGE: '59674682d4e6353d306373ec',
  /** 国籍 */
  NATIONALITY: '59674682d4e6353d306373ed',
  /** 证件类型 */
  CRED_TYPE: '59674682d4e6353d306373ee',
  /** 证件号码 */
  CRED_NUMBER: '59674682d4e6353d306373ef',
  /** 证件有效期 */
  CRED_PERIOD: '59674682d4e6353d306373f0',
  /** 婚姻状况 */
  MARITAL_STATUS: '59674682d4e6353d306373f1',
  /** 生育状况 */
  REPRODUCTIVE_STATUS: '59674682d4e6353d306373f2',
  /** 民族 */
  ETHNIC: '59674682d4e6353d306373f3',
  /** 政治面貌 */
  POLITICAL_STATE: '59674682d4e6353d306373f4',
  /** 籍贯 */
  NATIVE_PLACE: '59674682d4e6353d306373f5',
  /** 户籍城市 */
  HOUSEHOLD_REGISTRATION_CITY: '59674682d4e6353d306373f6',
  /** 户口性质 */
  HOUSEHOLD_REGISTRATION_NATURE: '59674682d4e6353d306373f7',
  /** 户籍地址 */
  HOUSEHOLD_REGISTRATION_ADDRESS: '59674682d4e6353d306373f8',
  /** 参加工作时间 */
  WORK_TIME: '59674682d4e6353d306373f9',
  /** 服装尺寸 */
  CLOTHING_SIZE: '59674682d4e6353d306373fa',
  /** 公司名称 */
  COMPANY_NAME: '596746a3d4e6353d30637403',
  /** 最高学历 */
  HIGHEST_EDUCATION: '59674695d4e6353d306373fc',
  /** 毕业院校 */
  GRADUATE_INSTITUTIONS: '59674695d4e6353d306373fd',
  /** 毕业时间 */
  GRADUATE_TIME: '59674695d4e6353d306373fe',
  /** 专业 */
  SPECIALTY: '59674695d4e6353d306373ff',
  /** 学位 */
  DEGREE: '59674695d4e6353d30637400',
  /** 工号 */
  JOB_NUMBER: '596746b0d4e6353d30637409',
  /** 部门 */
  APPARTMENT: '596746b0d4e6353d3063740a',
  /** 职位 */
  POSITION: '596746b0d4e6353d3063740b',
  /** 职级 */
  RANK: '596746b0d4e6353d3063740c',
  /** 工作地点 */
  WORK_SPACE: '596746b0d4e6353d3063740d',
  /** 合同公司 */
  CONTRACT_COMPANY: '596746b0d4e6353d3063740e',
  /** 直属上司 */
  IMMEDIATE_SUPERIOR: '596746b0d4e6353d30637410',
  /** 工作性质 */
  JOB_NATURE: '596746bed4e6353d30637412',
  /** 员工状态 */
  ACCOUNT_STATE: '596746bed4e6353d30637413',
  /** 入职日期 */
  INDUCTION_DATE: '596746bed4e6353d30637414',
  /** 实际入职日期 */
  REAL_INDUCTION_DATE: '596746bed4e6353d30637415',
  /** 试用期 */
  PROBATIONARY_PERIO: '596746bed4e6353d30637416',
  /** 转正日期 */
  PROMOTION_DATE: '596746bed4e6353d30637417',
  /** 计划转正日期 */
  PLANED_PROMOTION_DATE: '596746bed4e6353d30637418',
  /** 实际转正日期 */
  REAL_PROMOTION_DATE: '596746bed4e6353d30637419',
  /** 离职日期 */
  DIMISSION_DATE: '596746bed4e6353d3063741a',
  /** 计划离职日期 */
  PLANED_DIMISSION_DATE: '596746bed4e6353d3063741b',
  /** 实际离职日期 */
  REAL_DIMISSION_DATE: '596746bed4e6353d3063741c',
  /** 离职原因 */
  DIMISSION_REASON: '596746bed4e6353d3063741d',
  /** 手机号 */
  PHONE_NUMBER: '596746d0d4e6353d3063741f',
  /** 个人邮箱 */
  PERSONAL_EMAIL: '596746d0d4e6353d30637420',
  /** 微信号 */
  WECHAT_NUMBER: '596746d0d4e6353d30637421',
  /** 现居住地址 */
  NOW_ADDRESS: '596746d0d4e6353d30637422',
  /** 工作电话 */
  WORK_PHONE: '596746ddd4e6353d30637424',
  /** 企业邮箱 */
  ENTERPRISE_EMAIL: '596746ddd4e6353d30637425',
  /** 联系人姓名 */
  CONTACTS_NAME: '59674715d4e6353d3063742f',
  /** 关系 */
  RELATION: '59674715d4e6353d30637430',
  /** 联系人电话 */
  CONTACTS_PHONE_NUMBER: '59674715d4e6353d30637431',
  /** 联系地址 */
  CONTACTS_ADDRESS: '59674715d4e6353d30637432',
  /** 司龄(根据入职日期计算) */
  WORK_AGE: '596746b0d4e6353d3063740f',
};

/** 个人信息type */
export const EMPLOYEE_TOP_TYPE = {
  /** 已离职 */
  LEAVE: 0,
  /** 未转正 */
  UN_PROMOTION: 1,
  /** 已转正 */
  PROMOTION: 2,
  /** 待离职 */
  WAIT_LEAVE: 3,
};

/** 个人信息的控件id */
export const FORM_VIEW_ID = {
  /** 材料附件 */
  MATERIAL_ATTACHMENT: 1001,
  /** 人事异动 */
  DOSSIER_CHANGE: 1002,
};

/** 异动类型 */
export const CHANGE_TYPE = {
  /** 入职 */
  INDUCTION: 0,
  /** 转正 */
  PROMOTION: 1,
  /** 离职 */
  DIMISSION: 2,
  /** 晋升 */
  PROMOTE: 3,
  /** 调岗 */
  TRANSFER: 4,
  /** 其他 */
  OTHER: 5,
  /** 重新入职 */
  REINDUCTION: 6,
  /** 转职全职员工 */
  TOFULL: 7,
};

/** 入职信息表头部类型 */
export const ENTRY_TOP_TYPE = {
  PROJECT_INPUT: 1, // 已加入网络，已填写入职登记表
  PROJECT_NOT_INPUT: 2, // 已加入网络，未填写入职登记表
  NO_PROJECT_INPUT: 3, // 未加入网络，已填写入职登记表
  NO_PROJECT_NO_INPUT: 4, // 未加入网络，未填写入职登记表
  NO_PROJECT_INDUCTION: 5, // 未加入网络，已入职
};

export const ENTRY_TOP_INDUCTION_TYPE = {
  INDUCTION: 1, // 已入职
  NO_INDUCTION: 2, // 未入职
};

export const ENTRY_TOP_INVITE_TYP = {
  PHONE: 1,
  EMAIL: 2,
};
