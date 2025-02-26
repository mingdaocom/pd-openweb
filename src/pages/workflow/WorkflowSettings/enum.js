export const NODE_TYPE = {
  FIRST: 0,
  BRANCH: 1,
  BRANCH_ITEM: 2,
  WRITE: 3,
  APPROVAL: 4,
  CC: 5,
  ACTION: 6,
  SEARCH: 7,
  WEBHOOK: 8,
  FORMULA: 9,
  MESSAGE: 10,
  EMAIL: 11,
  DELAY: 12,
  GET_MORE_RECORD: 13,
  CODE: 14,
  LINK: 15,
  SUB_PROCESS: 16,
  PUSH: 17,
  FILE: 18,
  TEMPLATE: 19,
  PBC: 20,
  JSON_PARSE: 21,
  AUTHENTICATION: 22,
  PARAMETER: 23,
  API_PACKAGE: 24,
  API: 25,
  APPROVAL_PROCESS: 26,
  NOTICE: 27,
  SNAPSHOT: 28,
  LOOP: 29,
  RETURN: 30,
  AIGC: 31,
  PLUGIN: 32,
  SYSTEM: 100,
  FIND_SINGLE_MESSAGE: 1000,
  FIND_MORE_MESSAGE: 1001,
};

export const TRIGGER_ID = {
  ADD: '1',
  EDIT: '2',
  DELETE: '3',
  ONLY_EDIT: '4',
  STOP: '105',
  DISCUSS: '106',
};

export const ACTION_ID = {
  ADD: '1',
  EDIT: '2',
  DELETE: '3',
  CREATE_FILE: '4',
  CREATE_RECORD: '5',
  REFRESH_SINGLE_DATA: '6',
  RELATION: '20',
  NUMBER_FORMULA: '100',
  DATE_FORMULA: '101',
  JAVASCRIPT: '102',
  PYTHON: '103',
  DATE_DIFF_FORMULA: '104',
  OBJECT_TOTAL: '105',
  FUNCTION_CALCULATION: '106',
  WORKSHEET_TOTAL: '107',
  CUSTOM_ACTION_TOTAL: '108',
  SEND_EMAIL_SINGLE_DISPLAY: '201',
  SEND_EMAIL: '202',
  SEND_TEMPLATE_MESSAGE: '203',
  CONDITION_LOOP: '210',
  COUNT_LOOP: '211',
  FROM_WORKSHEET: '400',
  FROM_RECORD: '401',
  FROM_ADD: '402',
  FROM_ARRAY: '403',
  FROM_CODE_ARRAY: '404',
  FROM_ARTIFICIAL: '405',
  WORKSHEET_FIND: '406',
  BATCH_FIND: '407',
  FROM_PBC_INPUT_ARRAY: '408',
  FROM_API_ARRAY: '409',
  FROM_PBC_OUTPUT_ARRAY: '410',
  BATCH_ACTION: '411',
  BATCH_UPDATE: '412',
  BATCH_DELETE: '413',
  FROM_PLUGIN_ARRAY: '414',
  REFRESH_MULTIPLE_DATA: '415',
  RECORD_LINK_FIND: '420',
  RECORD_UPDATE: '421',
  RECORD_DELETE: '422',
  PBC: '500',
  PBC_INPUT: '501',
  PBC_OUT: '502',
  JSON_PARSE: '510',
  FROM_JSON_PARSE_ARRAY: '511',
  NO_AUTH: '520',
  BASIC_AUTH: '521',
  AUTH_CODE: '522',
  CREDENTIALS: '523',
  REFRESH_CREDENTIALS: '524',
  AIGC_TEXT: '531',
  AIGC_OBJECT: '532',
};

export const APP_TYPE = {
  SHEET: 1,
  TASK: 2,
  LOOP: 5,
  DATE: 6,
  WEBHOOK: 7,
  CUSTOM_ACTION: 8,
  APPROVAL_START: 9,
  APPROVAL: 10,
  FORMULA: 11,
  CODE: 12,
  lINK: 13,
  FILE: 14,
  SUB_PROCESS: 16,
  PBC: 17,
  JSON_PARSE: 18,
  USER: 20,
  DEPARTMENT: 21,
  TEMPLATE: 22,
  EXTERNAL_USER: 23,
  ORGANIZATION_ROLE: 24,
  EVENT_PUSH: 25,
  NO_AUTH: 30,
  BASIC_AUTH: 31,
  OAUTH2: 32,
  CODE_AUTH: 33,
  PARAMETER: 40,
  API_PACKAGE: 41,
  API: 42,
  CALENDAR: 43,
  SNAPSHOT: 44,
  LOOP_PROCESS: 45,
  AIGC: 46,
  PLUGIN: 47,
  SYSTEM: 100,
  VARIABLE: 101,
  PROCESS: 102,
  WORKSHEET_LOG: 103,
  GLOBAL_VARIABLE: 104,
};

export const APP_TYPE_TEXT = {
  7: _l('发送 API 请求'),
  12: _l('代码块'),
  17: _l('业务流程数组'),
  18: _l('JSON 解析'),
  20: _l('人员信息'),
  21: _l('部门信息'),
  23: _l('外部用户'),
  42: _l('API数组'),
  45: _l('循环'),
  46: _l('AIGC'),
  47: _l('插件'),
  405: _l('人工节点'),
};

export const OPERATION_TYPE = {
  REVOKE: 3,
  PASS: 4,
  OVERRULE: 5,
  FORWARD: 6,
  SIGN: 7,
  WORK: 8,
  SUBMIT: 9,
  TRANSFER: 10,
  PRINT: 12,
  UPDATE: 13,
  REPLACE: 14,
  CONTINUE: 15,
  ADD: 16,
  RETURN: 17,
  URGE: 18,
  BEFORE: 101,
  EMAIL: 102,
  GET_OPERATION: 103,
  ADD_OPERATION: 104,
  RELATION_OPERATION: 105,
  PROMPT_SOUND: 106,
};

export const CONTROLS_NAME = {
  1: _l('文本'),
  2: _l('文本'),
  3: _l('手机'),
  4: _l('座机'),
  5: _l('邮箱'),
  6: _l('数值'),
  7: _l('证件'),
  8: _l('金额'),
  9: _l('单选'),
  10: _l('多选'),
  11: _l('单选'),
  14: _l('附件'),
  15: _l('日期'),
  16: _l('日期时间'),
  17: _l('日期段'),
  18: _l('日期时间段'),
  19: _l('地区'),
  20: _l('公式'),
  21: _l('自由连接'),
  22: _l('分段'),
  23: _l('地区'),
  24: _l('地区'),
  25: _l('大写金额'),
  26: _l('人员'),
  27: _l('部门'),
  28: _l('等级'),
  29: _l('关联表'),
  30: _l('他表字段'),
  31: _l('公式'),
  32: _l('文本组合'),
  33: _l('自动编号'),
  34: _l('子表'),
  35: _l('级联选择'),
  36: _l('检查项'),
  37: _l('汇总'),
  38: _l('公式'),
  40: _l('定位'),
  41: _l('富文本'),
  42: _l('签名'),
  43: _l('文本识别'),
  44: _l('角色'),
  45: _l('嵌入'),
  46: _l('时间'),
  47: _l('条码'),
  48: _l('组织角色'),
  49: _l('API查询'),
  50: _l('API查询'),
  51: _l('查询记录'),
  52: _l('标签页'),
  53: _l('函数'),
  54: _l('自定义字段'),
  10000001: _l('人员'),
  10000002: _l('人员'),
  10000003: _l('数组'),
  10000004: _l('Row ID'),
  10000007: _l('普通数组'),
  10000008: _l('对象数组'),
};

export const CONDITION_TYPE = {
  1: {
    custom: _l('等于%03056'),
    default: _l('是其中一个%03079'),
  },
  2: {
    custom: _l('不等于%03057'),
    default: _l('不是任何一个%03077'),
  },
  3: {
    area: _l('下级包含%03076'),
    relation: _l('标题包含%03085'),
    custom: _l('包含其中一个%03082'),
    default: _l('包含%03058'),
  },
  4: {
    area: _l('下级不包含%03081'),
    relation: _l('标题不包含%03086'),
    custom: _l('不包含任何一个%03083'),
    default: _l('不包含%03059'),
  },
  5: _l('开头是%03060'),
  6: _l('结尾是%03062'),
  7: _l('不为空%03065'),
  8: _l('为空%03065'),
  9: _l('等于%03056'),
  10: _l('不等于%03057'),
  11: _l('小于%03067'),
  12: _l('大于%03066'),
  13: _l('小于等于%03069'),
  14: _l('大于等于%03068'),
  15: _l('在范围内%03070'),
  16: _l('不在范围内%03071'),
  17: _l('早于%03072'),
  18: _l('晚于%03073'),
  19: _l('开始等于'),
  20: _l('开始早于'),
  21: _l('开始晚于'),
  22: _l('开始已填写'),
  23: _l('开始未填写'),
  24: _l('结束等于'),
  25: _l('结束早于'),
  26: _l('结束晚于'),
  27: _l('结束已填写'),
  28: _l('结束未填写'),
  29: {
    0: _l('选中'),
    1: _l('开启'),
    2: _l('是'),
  },
  30: {
    0: _l('不选中'),
    1: _l('关闭'),
    2: _l('否'),
  },
  31: _l('不为空%03065'),
  32: _l('为空%03065'),
  33: {
    single: _l('是其中一个%03079'),
    multi: _l('包含其中一个%03082'),
  },
  34: {
    single: _l('不是任何一个%03077'),
    multi: _l('不包含任何一个%03083'),
  },
  35: _l('属于%03080'),
  36: _l('不属于%03078'),
  37: _l('在范围内%03070'),
  38: _l('不在范围内%03071'),
  39: _l('晚于%03073'),
  40: _l('晚于等于%03075'),
  41: _l('早于%03072'),
  42: _l('早于等于%03074'),
  43: _l('同时包含%03084'),
  44: _l('开头不是%03061'),
  45: _l('结尾不是%03063'),
  48: _l('下级包含%03076'),
  49: _l('下级不包含%03081'),
  100: _l('包含其中一个%03082'),
  101: _l('不包含任何一个%03083'),
};

export const USER_TYPE = {
  USER: 1,
  ROLE: 2,
  CONTROL: 6,
  TEXT: 7,
  DEPARTMENT: 8,
  JOB: 9,
  ORGANIZE_ROLE: 10,
};

export const USER_ORGANIZE = {
  11: _l('直属上司'),
  12: _l('主部门负责人'),
  13: _l('主部门上级负责人'),
  14: _l('主部门中的职位'),
  15: _l('组织角色分管负责人'),
};

export const DEPARTMENT_ORGANIZE = {
  12: _l('部门负责人'),
  13: _l('上级部门负责人'),
  14: _l('部门中的职位'),
  15: _l('组织角色分管负责人'),
};

export const EXEC_TIME_TYPE = {
  CURRENT: 0,
  BEFORE: 1,
  AFTER: 2,
};

export const DATE_TYPE = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
  WORK: 5,
  CUSTOM: 6,
  HOUR: 7,
  MINUTE: 8,
};

export const TIME_TYPE = {
  MINUTE: 1,
  HOUR: 2,
  DAY: 3,
};

export const TIME_TYPE_NAME = {
  1: _l('分钟'),
  2: _l('小时'),
  3: _l('天%250125'),
};

export const SUPPORT_HREF = {
  // worksheet
  '0-1': 'https://help.mingdao.com/workflow/trigger-by-worksheet',
  // loop
  '0-5': 'https://help.mingdao.com/workflow/trigger-by-scheduled',
  // date
  '0-6': 'https://help.mingdao.com/workflow/trigger-by-date-field',
  // webhook触发
  '0-7': 'https://help.mingdao.com/workflow/trigger-by-webhook',
  // 循环
  '0-45': 'https://help.mingdao.com/workflow/node-loop',
  // 分支
  1: 'https://help.mingdao.com/workflow/node-branch',
  // 填写节点
  3: 'https://help.mingdao.com/workflow/node-fill-in',
  // 审批节点
  4: 'https://help.mingdao.com/workflow/node-approve',
  // 通知节点
  5: 'https://help.mingdao.com/workflow/node-cc-send-internal-notification',
  // 新增记录
  '6-1-1': 'https://help.mingdao.com/workflow/node-add-record',
  // 新增任务
  '6-1-2': 'https://help.mingdao.com/workflow/node-new-task',
  // 更新记录
  '6-2': 'https://help.mingdao.com/workflow/node-update-record',
  // 更新流程参数
  '6-2-102': 'https://help.mingdao.com/workflow/node-update-parameters',
  // 删除记录
  '6-3': 'https://help.mingdao.com/workflow/node-delete-record',
  // 获取关联记录
  '6-20': 'https://help.mingdao.com/workflow/node-get-single-data',
  // 批量新增
  '6-21': 'https://help.mingdao.com/workflow/node-add-record',
  // 从工作表获取一条指定记录
  '7-406': 'https://help.mingdao.com/workflow/node-get-single-data',
  // 从多条数据节点获取一条指定记录
  '7-407': 'https://help.mingdao.com/workflow/node-get-single-data',
  // 发送API请求
  8: 'https://help.mingdao.com/workflow/node-send-api-request',
  // 公式
  9: 'https://help.mingdao.com/workflow/node-calculation',
  // 短信
  10: 'https://help.mingdao.com/workflow/node-send-sms',
  // 邮件
  11: 'https://help.mingdao.com/workflow/node-send-email',
  // 延时
  12: 'https://help.mingdao.com/workflow/node-delay',
  // 获取多条
  13: 'https://help.mingdao.com/workflow/node-get-multiple-data',
  // 代码块
  14: 'https://help.mingdao.com/workflow/node-code-block',
  // 获取链接
  15: 'https://help.mingdao.com/workflow/node-get-link',
  // 子流程
  16: 'https://help.mingdao.com/workflow/node-subflow',
  // 界面推送
  17: 'https://help.mingdao.com/workflow/node-interface-push',
  // 声音播放
  '17-8': 'https://help.mingdao.com/workflow/node-voice-broadcast',
  // 获取记录打印文件
  18: 'https://help.mingdao.com/workflow/node-print-record',
  // 发送服务号消息
  19: 'https://help.mingdao.com/node-send-wechat-official-account-template-message',
  // 调用封装业务流程
  20: 'https://help.mingdao.com/workflow/node-call-pbp',
  // JSON解析
  21: 'https://help.mingdao.com/workflow/node-json-parsing',
  // 调用已集成 API
  25: 'https://help.mingdao.com/workflow/node-call-integrated-api',
  // 发起审批
  26: 'https://help.mingdao.com/workflow/node-initiate-approval-flow',
  // 通知
  27: 'https://help.mingdao.com/workflow/node-cc-send-internal-notification',
  // 快照
  28: 'https://help.mingdao.com/workflow/node-get-snapshot',
  // 循环
  29: 'https://help.mingdao.com/workflow/node-loop',
  // AIGC 文本
  '31-531': 'https://help.mingdao.com/workflow/node-AI-text-generation',
  // AIGC 对象
  '31-532': 'https://help.mingdao.com/workflow/node-AI-generates-data-objects',
  // 获取单条系统信息
  1000: 'https://help.mingdao.com/workflow/node-get-single-data-from-user',
  // 获取多条系统信息
  1001: 'https://help.mingdao.com/workflow/node-get-multiple-data-from-user',
  // 什么是排队中
  queue: 'https://help.mingdao.com/workflow/in-queue',
};

export const RELATION_TYPE = {
  NETWORK: 0,
  APP: 2,
};

export const CUSTOM_ACTION_TEXT = {
  1: _l('点击按钮后立即执行'),
  2: _l('点击按钮后需要二次确认'),
  3: _l('点击按钮填写指定内容后立即执行'),
};

export const DATE_LIST = [
  {
    text: _l('今天'),
    value: 1,
  },
  {
    text: _l('昨天'),
    value: 2,
  },
  {
    text: _l('明天'),
    value: 3,
  },
  {
    text: _l('本周'),
    value: 4,
  },
  {
    text: _l('上周'),
    value: 5,
  },
  {
    text: _l('下周'),
    value: 6,
  },
  {
    text: _l('本月'),
    value: 8,
  },
  {
    text: _l('上月'),
    value: 9,
  },
  {
    text: _l('下月'),
    value: 10,
  },
  {
    text: _l('本季度'),
    value: 11,
  },
  {
    text: _l('上季度'),
    value: 12,
  },
  {
    text: _l('下季度'),
    value: 13,
  },
  {
    text: _l('今年'),
    value: 15,
  },
  {
    text: _l('去年'),
    value: 16,
  },
  {
    text: _l('明年'),
    value: 17,
  },
  {
    text: _l('指定时间'),
    value: 20,
  },
];

export const PUSH_TYPE = {
  ALERT: 1,
  CREATE: 2,
  DETAIL: 3,
  VIEW: 4,
  PAGE: 5,
  LINK: 6,
  NOTIFICATION: 7,
  AUDIO: 8,
};

export const PUSH_LIST = [
  { text: _l('弹出提示'), value: PUSH_TYPE.ALERT },
  { text: _l('卡片通知'), value: PUSH_TYPE.NOTIFICATION },
  { text: _l('打开记录创建层'), value: PUSH_TYPE.CREATE },
  { text: _l('打开记录详情页'), value: PUSH_TYPE.DETAIL },
  { text: _l('打开工作表视图'), value: PUSH_TYPE.VIEW },
  { text: _l('打开自定义页面'), value: PUSH_TYPE.PAGE },
  { text: _l('打开链接'), value: PUSH_TYPE.LINK },
];

export const FIELD_TYPE_LIST = [
  { text: _l('文本'), value: 2, en: 'string' },
  { text: _l('数值'), value: 6, en: 'number' },
  { text: _l('日期时间'), value: 16, en: 'date' },
  { text: _l('单选'), value: 9, en: 'radio' },
  { text: _l('检查项'), value: 36, en: 'checkbox' },
  { text: _l('数组'), value: 10000003, en: 'array' },
  { text: _l('对象'), value: 10000006, en: 'object' },
  { text: _l('普通数组'), value: 10000007, en: 'array' },
  { text: _l('对象数组'), value: 10000008, en: 'array[object]' },
  { text: _l('人员'), value: 26, en: 'member' },
  { text: _l('部门'), value: 27, en: 'department' },
  { text: _l('组织角色'), value: 48, en: 'orgRole' },
  { text: _l('附件'), value: 14, en: 'attachment' },
  { text: _l('分组标题'), value: 22, en: 'group' },
];

export const METHODS_TYPE = [
  { text: 'GET', value: 1 },
  { text: 'POST', value: 2 },
  { text: 'PUT', value: 3 },
  { text: 'DELETE', value: 4, disabled: true },
  { text: 'DELETE', value: 14 },
  { text: 'HEAD', value: 5 },
  { text: 'PATCH', value: 6 },
];

export const FORMAT_TEXT = {
  1: 'YYYY-MM-DD HH:mm',
  2: 'YYYY-MM-DD HH',
  3: 'YYYY-MM-DD',
  4: 'YYYY-MM',
  5: 'YYYY',
  6: 'YYYY-MM-DD HH:mm',
};

export const DATE_SHOW_TYPES = [
  {
    value: 0,
    text: _l('ISO'),
    format: _l('YYYY-MM-DD'),
  },
  {
    value: 1,
    text: _l('中国'),
    format: _l('YYYY年M月D日'),
  },
  {
    value: 2,
    text: 'US',
    format: _l('M/D/YYYY'),
  },
  {
    value: 3,
    text: 'EU',
    format: _l('D/M/YYYY'),
  },
];

export const GLOBAL_VARIABLE = '6038a1cbf18158039fb40e69';

export const LANGUAGE_BCP47 = [
  { text: _l('简体中文'), value: 'zh-CN' },
  { text: _l('美式英语'), value: 'en-US' },
  { text: _l('英式英语'), value: 'en-GB' },
  { text: _l('澳大利亚英语'), value: 'en-AU' },
  { text: _l('法语'), value: 'fr-FR' },
  { text: _l('加拿大法语'), value: 'fr-CA' },
  { text: _l('德语'), value: 'de-DE' },
  { text: _l('韩语'), value: 'ko-KR' },
  { text: _l('日语'), value: 'ja-JP' },
  { text: _l('俄语'), value: 'ru-RU' },
  { text: _l('西班牙语'), value: 'es-ES' },
  { text: _l('墨西哥西班牙语'), value: 'es-MX' },
  { text: _l('沙特阿拉伯阿拉伯语'), value: 'ar-SA' },
  { text: _l('葡萄牙语'), value: 'pt-PT' },
  { text: _l('荷兰语'), value: 'nl-NL' },
  { text: _l('泰语'), value: 'th-Th' },
  { text: _l('越南语'), value: 'vi-VN' },
  { text: _l('印度尼西亚语'), value: 'id-ID' },
  { text: _l('马来语'), value: 'ms-MY' },
];
