/**
 * 工作流状态
 */
export const FLOW_STATUS = {
  1: { status: 'pending', text: _l('进行中') },
  2: { status: 'completed', text: _l('完成') },
  3: { status: 'suspend', text: _l('中止') },
  4: { status: 'fail', text: _l('失败') },
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

  7777: _l('手动中止'),
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
  20003: _l('短信发送需要组织id'),
  20004: _l('短信模板没有通过审核'),
  20005: _l('短信或邮件没有账号'),
  20006: _l('批量创建来源数据太多'),
  20007: _l('短信邮件内容有敏感词'),
  20008: _l('账户余额不足'),
  20009: _l('查找节点关键词为空'),
  20010: _l('删除数据错误'),
  20011: _l('Webhook非法url'),
  20012: _l('Webhook配置错误'),
  20013: _l('Webhook请求异常'),
  20014: _l('行数据重复'),
  20015: _l('筛选条件异常'),
  20016: _l('code配置错误'),
  20017: _l('code执行错误'),
  20018: _l('节点对象为空'),
  20019: _l('延时节点执行错误'),
  20020: _l('catch无数据'),
  20021: _l('子流程未开启或已删除'),
  20022: _l('子流程存在执行失败的流程实例'),
  20023: _l('子流程来源数据为空'),
  20024: _l('json格式不正确'),
  20025: _l('url校验失败'),
  20026: _l('是一个延时反馈'),

  30001: _l('流程已删除'),
  30002: _l('流程已关闭'),
  30003: _l('内容已删除'),
  30004: _l('节点已删除'),

  40001: _l('审批被否决'),
  40002: _l('未通过分支'),
  40003: _l('审批人无效'),
  40004: _l('填写人无效'),
  40005: _l('数据丢失'),
  40006: _l('时间无效'),
  40007: _l('被发起人撤回'),
};

/**
 * 状态对应的颜色值
 */
export const STATUS2COLOR = {
  pending: { color: '#2195f3', bgColor: '#e7f3fd' },
  fail: { color: '#f44336', bgColor: '#fdebe9' },
  suspend: { color: '#ffa340', bgColor: '#fff5eb' },
  completed: { color: '#01ca83', bgColor: '#e5f9f1' },
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
  5: { type: 'notice', text: _l('站内通知') },
  6: { type: 'action', text: _l('动作') },
  7: { type: 'find', text: _l('获取单条数据') },
  8: { type: 'webhook', text: _l('Webhook') },
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
  1: _l('全员通过'),
  2: _l('单人通过'),
  3: _l('单人通过'),
};

/**
 * 历史详情页面 节点图标
 */
export const NODE_ICON = {
  start: {
    icon: {
      1: 'worksheet',
      5: 'hr_surplus',
      6: 'hr_time',
      7: 'workflow_webhook',
      8: 'custom_actions',
      17: 'pbc',
      20: 'hr_structure',
      21: 'workflow',
      23: 'language',
    },
    text: {
      1: _l('工作表事件触发'),
      5: _l('定时触发'),
      6: _l('按日期字段触发'),
      7: _l('Webhook触发'),
      8: _l('按钮触发'),
      17: _l('封装业务流程'),
      20: _l('人员事件触发'),
      21: _l('部门事件触发'),
      23: _l('外部用户事件触发'),
    },
    bgColor: {
      1: '#ffa340',
      5: '#2196f3',
      6: '#2196f3',
      7: '#4C7D9E',
      8: '#4C7D9E',
      17: '#4C7D9E',
      20: '#01ca83',
      21: '#01ca83',
      23: '#01ca83',
    },
  },

  action: {
    icon: {
      1: 'workflow_new',
      2: 'workflow_update',
      20: 'workflow_search',
      3: 'hr_delete',
    },
    text: {
      1: _l('新增记录'),
      2: _l('更新记录'),
      20: _l('获得指定关联记录'),
      3: _l('删除记录'),
    },
    bgColor: '#FFA340',
  },
  find: {
    icon: 'search',
    text: _l('获取单条数据'),
    bgColor: '#FFA340',
  },
  records: {
    icon: 'transport',
    text: _l('获取多条数据'),
    bgColor: '#FFA340',
  },

  approve: {
    icon: 'workflow_ea',
    text: _l('审批'),
    bgColor: '#7e57c2',
  },
  write: {
    icon: 'workflow_write',
    text: _l('填写'),
    bgColor: '#00bcd4',
  },
  notice: {
    icon: 'workflow_notice',
    text: _l('站内通知'),
    bgColor: '#2196f3',
  },
  msg: {
    icon: 'sms',
    text: _l('短信'),
    bgColor: '#2196f3',
  },
  email: {
    icon: 'email',
    text: _l('邮件'),
    bgColor: '#2196f3',
  },
  push: {
    icon: 'notifications_11',
    text: _l('界面推送'),
    bgColor: '#2196f3',
  },

  gateway: {
    icon: 'workflow_branch',
    text: _l('分支'),
    bgColor: '#4c7d9e',
  },
  delay: {
    icon: 'workflow_delayed',
    text: _l('延时'),
    bgColor: '#4c7d9e',
  },
  formula: {
    icon: 'workflow_function',
    text: _l('运算'),
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

  webhook: {
    icon: 'workflow_webhook',
    text: _l('Webhook'),
    bgColor: '#4c7d9e',
  },
  code: {
    icon: 'url',
    text: _l('代码块'),
    bgColor: '#4c7d9e',
  },
};
