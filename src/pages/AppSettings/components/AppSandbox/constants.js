export const REVIEW_MODE = {
  ADMIN: 0,
  EXEMPT: 1,
};

export const REVIEW_RULE_CONFIG = {
  [REVIEW_MODE.EXEMPT]: {
    value: REVIEW_MODE.EXEMPT,
    get label() {
      return _l('免审');
    },
    get description() {
      return _l('发布后不需要审核，再操作升级，适用于需快速迭代更新场景');
    },
  },
  [REVIEW_MODE.ADMIN]: {
    value: REVIEW_MODE.ADMIN,
    get label() {
      return _l('管理员审核');
    },
    get description() {
      return _l('发布后需管理员审核通过后，再操作升级');
    },
  },
};

export const ENVIRONMENT_CONFIG = {
  SANDBOX: {
    icon: 'code',
    get description() {
      return _l('沙盒环境开发中，所有变更必须通过发布更新至生产');
    },
  },
  PRODUCTION: {
    icon: 'lock',
    get description() {
      return _l('当前处于生产环境，请前往沙盒环境进行开发');
    },
  },
};

export const OVERVIEW_DIALOG_TYPE = {
  REVIEW_RULE: 'reviewRule',
  CLOSE: 'close',
};

export const VERSION_TABLE_COLUMNS =
  'minmax(70px, 0.8fr) minmax(90px, 0.9fr) minmax(140px, 2.2fr) minmax(110px, 1fr) minmax(170px, 1.2fr) 110px';

export const VERSION_LIST_PAGE_SIZE = 20;
