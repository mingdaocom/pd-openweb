export const DATABASE_TYPE = {
  MYSQL: 'MYSQL',
  SQL_SERVER: 'SQL_SERVER',
  POSTGRESQL: 'POSTGRESQL',
  MARIADB: 'MARIADB',
  MONGO_DB: 'MONGODB',
  ORACLE: 'ORACLE',
  APPLICATION_WORKSHEET: 'MING_DAO_YUN',
  ALIYUN_MYSQL: 'ALIYUN_MYSQL',
  ALIYUN_SQLSERVER: 'ALIYUN_SQLSERVER',
  ALIYUN_POSTGRES: 'ALIYUN_POSTGRES',
  ALIYUN_MARIADB: 'ALIYUN_MARIADB',
  ALIYUN_MONGODB: 'ALIYUN_MONGODB',
  TENCENT_MYSQL: 'TENCENT_MYSQL',
  TENCENT_SQLSERVER: 'TENCENT_SQLSERVER',
  TENCENT_POSTGRES: 'TENCENT_POSTGRES',
  TENCENT_MARIADB: 'TENCENT_MARIADB',
  TENCENT_MONGODB: 'TENCENT_MONGODB',
  KAFKA: 'KAFKA',
  DB2: 'DB2',
};

export const SOURCE_FROM_TYPE = {
  ALL: 'ALL',
  COMMON: 'COMMON',
  LOCAL: 'LOCAL',
  CLOUD: 'CLOUD',
  MESSAGE_QUEUE: 'MQ',
};

export const ROLE_TYPE = {
  ALL: 'ALL',
  SOURCE: 'SOURCE',
  DEST: 'DEST',
};

export const DETAIL_TYPE = {
  SETTING: 'SETTING',
  USE_DETAIL: 'USE_DETAIL',
};

export const CREATE_TYPE = {
  NEW: 'NEW',
  SELECT_EXIST: 'SELECT_EXIST',
};

export const TASK_STATUS_TYPE = {
  ALL: 'ALL',
  UN_PUBLIC: 'UN_PUBLIC',
  RUNNING: 'RUNNING',
  STOP: 'STOP',
  ERROR: 'ERROR',
};

export const SOURCE_FROM_TYPE_TAB_LIST = [
  { key: SOURCE_FROM_TYPE.COMMON, text: _l('常用') },
  { key: SOURCE_FROM_TYPE.LOCAL, text: _l('本地数据库') },
  { key: SOURCE_FROM_TYPE.CLOUD, text: _l('云端数据库') },
  // { key: SOURCE_FROM_TYPE.MESSAGE_QUEUE, text: _l('消息队列') },
];

export const ROLE_TYPE_TAB_LIST = [
  { key: ROLE_TYPE.ALL, text: _l('全部') },
  { key: ROLE_TYPE.SOURCE, text: _l('源') },
  { key: ROLE_TYPE.DEST, text: _l('目的地') },
];

export const FROM_TYPE_TAB_LIST = [
  { key: SOURCE_FROM_TYPE.ALL, text: _l('全部') },
  { key: SOURCE_FROM_TYPE.LOCAL, text: _l('本地数据库') },
  { key: SOURCE_FROM_TYPE.CLOUD, text: _l('云端数据库') },
  // { key: SOURCE_FROM_TYPE.MESSAGE_QUEUE, text: _l('消息队列') },
];

export const CREATE_TYPE_RADIO_LIST = [
  { value: CREATE_TYPE.NEW, text: _l('新建') },
  { value: CREATE_TYPE.SELECT_EXIST, text: _l('选择已有') },
];

export const TASK_STATUS_TAB_LIST = [
  { key: TASK_STATUS_TYPE.ALL, text: _l('全部') },
  { key: TASK_STATUS_TYPE.RUNNING, text: _l('运行中') },
  { key: TASK_STATUS_TYPE.STOP, text: _l('已停止') },
  { key: TASK_STATUS_TYPE.ERROR, text: _l('同步错误') },
];

export const SOURCE_DETAIL_TAB_LIST = [
  { key: DETAIL_TYPE.SETTING, text: _l('数据源设置') },
  { key: DETAIL_TYPE.USE_DETAIL, text: _l('使用详情') },
];

export const TEST_STATUS = {
  DEFAULT: {
    className: 'default',
    text: _l('测试连接'),
  },
  TESTING: {
    className: 'testing',
    text: _l('测试中...'),
  },
  SUCCESS: {
    className: 'testSuccess',
    text: _l('测试通过'),
  },
  FAILED: {
    className: 'testFailed',
    text: _l('测试未通过'),
  },
};

export const CREATE_CONNECTOR_STEP_LIST = [
  { key: '0', text: _l('配置数据源') },
  { key: '1', text: _l('配置目的地') },
  { key: '2', text: _l('创建同步任务') },
];

export const SYNC_TYPE = {
  NO_SELECT: 'NO_SELECT',
  ONLY_SYNC: 'ONLY_SYNC',
  SYNC_WITH_DEAL: 'SYNC_WITH_DEAL',
};

//表到库 表作为源不支持的类型
export const INVALID_MD_TYPE = [14, 21, 22, 25, 29, 30, 31, 32, 34, 35, 37, 38, 42, 43, 45, 47, 49, 10010];

//表到表 表作为源不支持的类型
export const INVALID_MD_TYPE_SHEET = [21, 22, 25, 29, 30, 31, 32, 34, 35, 37, 38, 42, 43, 45, 47, 49, 10010];

export const SYSTEM_FIELD_IDS = [
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];

export const sourceNamePattern = /[\r\n\s-]/g;
export const namePattern = /[`~!@#$%^&*()\-+=<>?:"{}|,./;'\[\]·！￥…（）—《》？：“”【】、；‘，。\s\\]/g;

export const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const isValidName = name => {
  return /^[^`~!@#$%^&*()\-+=<>?:"{}|,./;'\[\]·！￥…（）—《》？：“”【】、；‘，。\s\\]+$/.test(name);
};

export const TRIGGER_WORKFLOW_CHECKBOX_OPTIONS = [
  { key: 'insertTrigger', text: _l('新增记录时触发') },
  { key: 'updateTrigger', text: _l('更新记录时触发') },
  { key: 'deleteTrigger', text: _l('删除记录时触发') },
];
