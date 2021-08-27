export const NODE_TYPE = {
  FIRST: 0,
  BRANCH: 1,
  BRANCH_ITEM: 2,
  WRITE: 3,
  APPROVAL: 4,
  NOTICE: 5,
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
  SYSTEM: 100,
  FIND_SINGLE_MESSAGE: 1000,
  FIND_MORE_MESSAGE: 1001,
};

export const TRIGGER_ID_TYPE = {
  ADD: '1',
  EDIT: '2',
  DELETE: '3',
  ONLY_EDIT: '4',
  RELATION: '20',
  NUMBER_FORMULA: '100',
  DATE_FORMULA: '101',
  JAVASCRIPT: '102',
  PYTHON: '103',
  DATE_DIFF_FORMULA: '104',
  TOTAL_STATISTICS: '105',
  FROM_WORKSHEET: '400',
  FROM_RECORD: '401',
  FROM_ADD: '402',
  FROM_ARRAY: '403',
  FROM_CODE: '404',
  FROM_ARTIFICIAL: '405',
  WORKSHEET_FIND: '406',
  BATCH_FIND: '407',
};

export const APP_TYPE = {
  SHEET: 1,
  TASK: 2,
  LOOP: 5,
  DATE: 6,
  WEBHOOK: 7,
  CUSTOM_ACTION: 8,
  FORMULA: 11,
  CODE: 12,
  lINK: 13,
  FILE: 14,
  USER: 20,
  DEPARTMENT: 21,
  SYSTEM: 100,
  VARIABLE: 101,
  PROCESS: 102,
};

export const CONTROLS_NAME = {
  1: _l('文本框'),
  2: _l('文本框'),
  3: _l('手机'),
  4: _l('座机'),
  5: _l('邮箱'),
  6: _l('数值'),
  7: _l('证件'),
  8: _l('金额'),
  9: _l('单选项'),
  10: _l('多选项'),
  11: _l('下拉框'),
  14: _l('附件'),
  15: _l('日期'),
  16: _l('日期时间'),
  17: _l('日期段'),
  18: _l('日期时间段'),
  19: _l('地区'),
  20: _l('公式'),
  21: _l('自由连接'),
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
  36: _l('检查框'),
  37: _l('汇总'),
  38: _l('公式'),
  40: _l('定位'),
  41: _l('富文本'),
  42: _l('签名'),
  43: _l('文字识别'),
  10000001: _l('节点设置人员'),
  10000002: _l('节点设置人员'),
  10000003: _l('数组'),
  10000004: _l('Row ID'),
};

export const CONDITION_TYPE = {
  1: _l('是'),
  2: _l('不是'),
  3: _l('包含'),
  4: _l('不包含'),
  5: _l('开始为'),
  6: _l('结尾为'),
  7: _l('不为空'),
  8: _l('为空'),
  9: _l('等于'),
  10: _l('不等于'),
  11: _l('小于'),
  12: _l('大于'),
  13: _l('小于等于'),
  14: _l('大于等于'),
  15: _l('在范围内'),
  16: _l('不在范围内'),
  17: _l('早于'),
  18: _l('晚于'),
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
  29: _l('选中'),
  30: _l('未选中'),
  31: _l('不为空'),
  32: _l('为空'),
  33: _l('是'),
  34: _l('不是'),
  35: _l('属于'),
  36: _l('不属于'),
};

export const GRADE_STAR_TYPE = {
  1: _l('1星'),
  2: _l('2星'),
  3: _l('3星'),
  4: _l('4星'),
  5: _l('5星'),
};

export const GRADE_LEVEL_TYPE = {
  1: _l('1级'),
  2: _l('2级'),
  3: _l('3级'),
  4: _l('4级'),
  5: _l('5级'),
  6: _l('6级'),
  7: _l('7级'),
  8: _l('8级'),
  9: _l('9级'),
  10: _l('10级'),
};

export const USER_TYPE = {
  USER: 1,
  ROLE: 2,
  CONTROL: 6,
  TEXT: 7,
  DEPARTMENT: 8,
  JOB: 9,
};

export const USER_ORGANIZE = {
  11: _l('直属上司'),
  12: _l('主部门负责人'),
  13: _l('主部门上级负责人'),
};

export const DEPARTMENT_ORGANIZE = {
  12: _l('部门负责人'),
  13: _l('上级部门负责人'),
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
  3: _l('天'),
};

export const NODE_SUPPORT_HREF = {
  // worksheet
  '0-1': 'https://help.mingdao.com/flow7.html',
  // loop
  '0-5': 'https://help.mingdao.com/flow8.html',
  // date
  '0-6': 'https://help.mingdao.com/flow9.html',
  // webhook触发
  '0-7': 'https://help.mingdao.com/flow10.html',
  // 分支
  1: 'https://help.mingdao.com/flow25.html',
  // 填写节点
  3: 'https://help.mingdao.com/flow20.html',
  // 审批节点
  4: 'https://help.mingdao.com/flow19.html',
  // 通知节点
  5: 'https://help.mingdao.com/flow21.html',
  // 新增记录
  '6-1-1': 'https://help.mingdao.com/flow11.html',
  // 新增任务
  '6-1-2': 'https://help.mingdao.com/flow31.html',
  // 更新记录
  '6-2': 'https://help.mingdao.com/flow12.html',
  // 更新流程参数
  '6-2-102': 'https://help.mingdao.com/flow13.html',
  // 删除记录
  '6-3': 'https://help.mingdao.com/flow18.html',
  // 获取关联记录
  '6-20': 'https://help.mingdao.com/flow14.html',
  // 批量新增
  '6-21': 'https://help.mingdao.com/flow11.html',
  // search
  7: 'https://help.mingdao.com/flow13.html',
  // Webhook
  8: 'https://help.mingdao.com/flow33.html',
  // 公式
  9: 'https://help.mingdao.com/flow27.html',
  // 短信
  10: 'https://help.mingdao.com/flow22.html',
  // 邮件
  11: 'https://help.mingdao.com/flow24.html',
  // 延时
  12: 'https://help.mingdao.com/flow26.html',
  // 获取多条
  13: 'https://help.mingdao.com/flow15.html',
  // 代码块
  14: 'https://help.mingdao.com/flow34.html',
  // 界面推送
  17: 'https://help.mingdao.com/flow32.html',
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
};

export const PUSH_LIST = [
  { text: _l('弹出提示'), value: PUSH_TYPE.ALERT },
  { text: _l('记录创建层'), value: PUSH_TYPE.CREATE },
  { text: _l('打开记录详情页'), value: PUSH_TYPE.DETAIL },
  { text: _l('打开工作表视图'), value: PUSH_TYPE.VIEW },
  { text: _l('打开自定义页面'), value: PUSH_TYPE.PAGE },
  { text: _l('打开链接'), value: PUSH_TYPE.LINK },
];
