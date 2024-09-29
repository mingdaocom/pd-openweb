/**
 * 工作流状态
 */
export const FLOW_STATUS = {
  1: { status: 'pending', text: _l('进行中') },
  2: { status: 'completed', text: _l('完成') },
  3: { status: 'suspend', text: _l('中止') },
  4: { status: 'fail', text: _l('失败') },
  6: { status: 'revoke', text: _l('撤回') },
};
export const NODE_STATUS = {
  1: { status: 'pending', text: _l('等待') },
  2: { status: 'completed', text: _l('通过') },
  3: { status: 'suspend', text: _l('中止') },
  4: { status: 'fail', text: _l('失败') },
  5: { status: 'overrule', text: _l('否决') },
  6: { status: 'filter', text: _l('过滤') },
};

/**
 * 工作流错误原因
 */
export const FLOW_FAIL_REASON = {
  1111: _l('工作表找不到应用'),
  1112: _l('工作表字段权限错误'),
  1113: _l('参数错误'),
  1114: _l('接口已过期'),
  1115: _l('获取字段权限错误'),

  2000: _l('本行已有流程在执行'),
  2001: _l('执行次数超过'),

  7777: _l('管理员中止'),
  8888: _l('服务连接超时'),
  9999: _l('程序异常'),

  10000: _l('未设置有效节点'),
  10001: _l('发起节点未配置'),
  10002: _l('发起节点未配置'),
  10003: _l('发起节点中使用的工作表被删除'),
  10004: _l('当前节点指向的节点对象被删除'),
  10005: _l('动作节点（新增行记录）中的工作表被删除'),
  10006: _l('填写/审批/通知节点中人员未填写或人员不存，或已离职（不在流程所在的组织下）'),
  10007: _l('填写/审批/通知节点中人员未填写，或已离职（不在流程所在的组织下）'),
  10008: _l('填写/审批/通知节点中角色中没有人员（不在流程所在的组织下）'),
  10009: _l('节点所在分支为空'),

  20001: _l('动作节点执行失败'),
  20002: _l('查找节点无数据'),
  20003: _l('短信发送需要组织门牌号'),
  20004: _l('短信模板没有通过审核'),
  20005: _l('短信或邮件没有账号'),
  20006: _l('批数据源数量超过节点处理上限'),
  20007: _l('短信邮件内容有敏感词'),
  20008: _l('账户余额不足'),
  20009: _l('查找节点关键词为空'),
  20010: _l('删除数据错误'),
  20011: _l('url校验失败'),
  20012: _l('配置错误'),
  20013: _l('请求异常'),
  20014: _l('新增记录时行数据重复'),
  20015: _l('筛选条件异常'),
  20016: _l('code配置错误'),
  20017: _l('code执行错误'),
  20018: _l('节点对象为空'),
  20019: _l('延时节点执行错误'),
  20020: _l('catch无数据'),
  20021: _l('流程未开启或已删除'),
  20022: _l('流程存在执行失败的流程实例'),
  20023: _l('流程来源数据为空'),
  20024: _l('json格式不正确'),
  20025: _l('url校验失败'),
  20026: _l('是一个延时反馈'),
  20027: _l('动作节点字段配置为空'),
  20028: _l('打印附件生成失败'),
  20029: _l('打印附件拉取失败'),
  20030: _l('打印附件新增失败'),
  20031: _l('打印附件转换格式失败'),
  20032: _l('最多获取条数配置异常'),
  20033: _l('未激活不允许编辑'),
  20034: _l('重复邀请'),

  21000: _l('筛选条件控件找不到'),
  21001: _l('筛选条件值为空'),
  21002: _l('筛选条件使用老的控件类型'),
  21003: _l('不支持的动作节点'),
  21004: _l('他表字段配置异常'),
  21005: _l('筛选条件不支持'),

  22000: _l('新增记录失败'),
  22001: _l('更新记录失败'),
  22002: _l('获取指定关联记录失败'),
  22003: _l('删除记录失败'),
  22004: _l('从工作表获取多条记录失败'),
  22005: _l('从一条记录获得多条关联记录失败'),
  22006: _l('从新增节点获取多条记录失败'),

  22100: _l('邮件发送失败'),
  22101: _l('短信发送失败发送失败'),
  22102: _l('邮件附件过大'),
  22103: _l('日程标题或组织者为空'),
  22104: _l('无有效时间'),

  30001: _l('流程已删除'),
  30002: _l('流程已关闭'),
  30003: _l('内容已删除'),
  30004: _l('节点已删除'),
  30005: _l('流程实例已删除'),
  30006: _l('当前用户无权限查看'),

  40001: _l('审批被否决'),
  40002: _l('未通过分支'),
  40003: _l('审批人无效'),
  40004: _l('填写人无效'),
  40005: _l('数据丢失'),
  40006: _l('时间无效'),
  40007: _l('被发起人撤回'),
  40008: _l('审批流程异常'),
  40009: _l('审批流程触发者无效'),
};

/**
 * 状态对应的颜色值
 */
export const STATUS2COLOR = {
  pending: { color: '#2195f3', bgColor: '#e7f3fd' },
  fail: { color: '#f44336', bgColor: '#fdebe9' },
  suspend: { color: '#ffa340', bgColor: '#fff5eb' },
  completed: { color: '#01ca83', bgColor: '#e5f9f1' },
  revoke: { color: '#ffa340', bgColor: '#fff5eb' },
};

/**
 * 节点类型
 */
export const NODE_TYPE = {
  0: { type: 'start', text: _l('发起节点') },
  1: { type: 'gateway', text: _l('网关') },
  2: { type: 'branch', text: _l('分支') },
  3: { type: 'write', text: _l('填写') },
  4: { type: 'approve', text: _l('审批') },
  5: { type: 'cc', text: _l('抄送') },
  6: { type: 'action', text: _l('动作') },
  7: { type: 'find', text: _l('获取单条数据') },
  8: { type: 'webhook', text: _l('发送 API 请求') },
  9: { type: 'formula', text: _l('公式') },
  10: { type: 'msg', text: _l('短信') },
  11: { type: 'email', text: _l('邮件') },
  12: { type: 'delay', text: _l('延时') },
  13: { type: 'records', text: _l('获取多条记录') },
  14: { type: 'code', text: _l('代码块') },
  15: { type: 'link', text: _l('获取链接') },
  16: { type: 'subprocess', text: _l('子流程') },
  17: { type: 'push', text: _l('界面推送') },
  18: { type: 'file', text: _l('获取记录打印文件') },
  19: { type: 'template', text: _l('服务号消息') },
  20: { type: 'pbc', text: _l('封装业务流程(PBP)') },
  21: { type: 'jsonParse', text: _l('JSON 解析') },
  22: { type: 'auth', text: _l('API 连接与认证') },
  23: { type: 'parameter', text: _l('连接参数') },
  24: { type: 'apiPackage', text: _l('API 连接与认证') },
  25: { type: 'api', text: _l('调用已集成 API') },
  26: { type: 'approveProcess', text: _l('审批流程') },
  27: { type: 'notice', text: _l('站内通知') },
  28: { type: 'snapshot', text: _l('获取页面快照') },
  29: { type: 'loop', text: _l('循环') },
  30: { type: 'return', text: _l('中止') },
  31: { type: 'aigc', text: _l('AIGC') },
  32: { type: 'plugin', text: _l('插件') },
  1000: { type: 'singleInfo', text: _l('获取单条人员/部门信息') },
  1001: { type: 'moreInfo', text: _l('获取多条人员/部门信息') },
};

/**
 * 动作类型
 */
export const ACTION_TYPE = {
  1: { type: 'submit', text: _l('提交') },
  2: { type: 'transfer', text: _l('转交') },
  3: { type: 'check', text: _l('查看') },
  4: { type: 'pass', text: _l('通过') },
  5: { type: 'overrule', text: _l('否决') },
  8: { type: 'transferApprove', text: _l('转审') },
  16: { type: 'signBeforeApprove', text: _l('审批前加签') },
  18: { type: 'modify', text: _l('修改申请内容') },
  22: { type: 'noNeed', text: _l('无需审批') },
};

/**
 * 会签类型
 */
export const COUNTER_TYPE = {
  1: _l('需所有审批人通过'),
  2: _l('只需一名审批人通过'),
  4: _l('按比例投票通过'),
};

/**
 * 历史详情页面 节点图标
 */
export const NODE_ICON = {
  start: {
    icon: {
      1: 'table',
      5: 'hr_surplus',
      6: 'hr_time',
      7: 'workflow_webhook',
      8: 'custom_actions',
      9: 'approval',
      17: 'pbc',
      20: 'hr_structure',
      21: 'workflow',
      23: 'language',
      25: 'sending',
      45: 'arrow_loop',
      106: 'replyto',
    },
    text: {
      1: _l('工作表事件触发'),
      5: _l('定时触发'),
      6: _l('按日期字段触发'),
      7: _l('Webhook触发'),
      8: _l('按钮触发'),
      9: _l('审批流程触发'),
      17: _l('封装业务流程'),
      20: _l('人员事件触发'),
      21: _l('部门事件触发'),
      23: _l('外部用户事件触发'),
      25: _l('事件推送'),
      45: _l('循环'),
      106: _l('讨论通知触发'),
    },
    bgColor: {
      1: '#ffa340',
      5: '#2196f3',
      6: '#2196f3',
      7: '#4C7D9E',
      8: '#4C7D9E',
      9: '#4158DB',
      17: '#4C7D9E',
      20: '#01ca83',
      21: '#01ca83',
      23: '#01ca83',
      25: '#4C7D9E',
      45: '#4C7D9E',
      106: '#2196f3',
    },
  },
  gateway: {
    icon: 'workflow_branch',
    text: _l('分支'),
    bgColor: '#2196f3',
  },
  write: {
    icon: 'workflow_write',
    text: _l('填写'),
    bgColor: '#00bcd4',
  },
  approve: {
    icon: 'workflow_ea',
    text: _l('审批'),
    bgColor: '#7e57c2',
  },
  cc: {
    icon: 'workflow_notice',
    text: _l('抄送'),
    bgColor: '#2196f3',
  },
  action: {
    icon: {
      1: 'workflow_new',
      2: 'workflow_update',
      3: 'hr_delete',
      20: 'workflow_search',
    },
    text: {
      1: _l('新增记录'),
      2: _l('更新记录'),
      3: _l('删除记录'),
      20: _l('获得指定关联记录'),
    },
    bgColor: '#FFA340',
  },
  find: {
    icon: 'search',
    text: _l('获取单条数据'),
    bgColor: '#FFA340',
  },
  webhook: {
    icon: 'workflow_webhook',
    text: _l('发送 API 请求'),
    bgColor: '#4c7d9e',
  },
  formula: {
    icon: 'workflow_function',
    text: _l('运算'),
    bgColor: '#01CA83',
  },
  msg: {
    icon: 'workflow_sms',
    text: _l('短信'),
    bgColor: '#2196f3',
  },
  email: {
    icon: 'email',
    text: _l('邮件'),
    bgColor: '#2196f3',
  },
  delay: {
    icon: 'workflow_delayed',
    text: _l('延时'),
    bgColor: '#4c7d9e',
  },
  records: {
    icon: 'transport',
    text: _l('获取多条数据'),
    bgColor: '#FFA340',
  },
  code: {
    icon: 'url',
    text: _l('代码块'),
    bgColor: '#4c7d9e',
  },
  link: {
    icon: 'link2',
    text: _l('获得链接'),
    bgColor: '#4c7d9e',
  },
  subprocess: {
    icon: 'subprocess',
    text: _l('子流程'),
    bgColor: '#4c7d9e',
  },
  push: {
    icon: 'interface_push',
    text: _l('界面推送'),
    bgColor: '#2196f3',
  },
  file: {
    icon: 'print',
    text: _l('获取记录打印文件'),
    bgColor: '#4c7d9e',
  },
  template: {
    icon: 'wechat',
    text: _l('发送服务号消息'),
    bgColor: '#2196f3',
  },
  pbc: {
    icon: 'pbc',
    text: _l('封装业务流程(PBP)'),
    bgColor: '#4c7d9e',
  },
  jsonParse: {
    icon: 'task_custom_polymer',
    text: _l('JSON 解析'),
    bgColor: '#4c7d9e',
  },
  auth: {
    icon: 'key1',
    text: _l('API 连接与认证'),
    bgColor: '#4c7d9e',
  },
  parameter: {
    icon: 'input',
    text: _l('连接参数'),
    bgColor: '#4c7d9e',
  },
  apiPackage: {
    icon: 'connect',
    text: _l('API 连接与认证'),
    bgColor: '#4c7d9e',
  },
  api: {
    icon: 'api',
    text: _l('调用已集成 API'),
    bgColor: '#4c7d9e',
  },
  approveProcess: {
    icon: 'approval',
    text: _l('审批流程'),
    bgColor: '#4158DB',
  },
  notice: {
    icon: 'hr_message_reminder',
    text: _l('站内通知'),
    bgColor: '#2196f3',
  },
  snapshot: {
    icon: 'camera_alt',
    text: _l('获取页面快照'),
    bgColor: '#4c7d9e',
  },
  loop: {
    icon: 'arrow_loop',
    text: _l('循环'),
    bgColor: '#4c7d9e',
  },
  return: {
    icon: 'rounded_square',
    text: _l('中止流程'),
    bgColor: '#F15B75',
  },
  aigc: {
    icon: {
      531: 'text_ai',
      532: 'text_ai',
    },
    text: {
      531: _l('AI 生成文本'),
      532: _l('AI 生成数据对象'),
    },
    bgColor: '#F15B75',
  },
  plugin: {
    icon: 'workflow',
    text: _l('插件'),
    bgColor: '#2196f3',
  },
  singleInfo: {
    icon: 'person_search',
    text: _l('获取单条人员/部门信息'),
    bgColor: '#2196f3',
  },
  moreInfo: {
    icon: 'group-members',
    text: _l('获取多条人员/部门信息'),
    bgColor: '#2196f3',
  },
};
