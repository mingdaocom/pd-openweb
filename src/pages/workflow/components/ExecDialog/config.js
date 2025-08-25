export const ACTION_TYPES = {
  0: {
    id: 'default',
    icon: {
      1: 'table',
      5: 'access_alarm',
      6: 'task_custom_today',
      7: 'workflow_webhook',
    },
  },
  3: {
    id: 'edit',
    icon: 'edit',
  },
  4: {
    id: 'approve',
    icon: 'workflow_ea',
  },
  5: {
    id: 'notice',
    icon: 'send',
  },
};

export const ACTION_LIST = {
  3: { id: 'revoke', text: _l('撤回'), icon: 'repeal-o', sort: 3 },
  4: { id: 'pass', text: _l('同意'), icon: 'done', sort: 1 },
  5: { id: 'overrule', text: _l('拒绝'), icon: 'clear', sort: 2 },
  6: { id: 'transferApprove', text: _l('转审'), icon: 'sp_post_exchange_white', sort: 5 },
  7: { id: 'sign', text: _l('加签'), icon: 'person_add', sort: 6 },
  9: { id: 'submit', text: _l('提交'), icon: 'done', sort: 7 },
  10: { id: 'transfer', text: _l('转交'), icon: 'sp_post_exchange_white', sort: 8 },
  13: { id: 'stash', text: _l('暂存'), icon: 'save1', sort: 0 },
  17: { id: 'return', text: _l('退回'), icon: 'repeal-o', sort: 4 },
  18: { id: 'urge', text: _l('催办'), icon: 'start_time', sort: 9 },
  19: { id: 'taskRevoke', text: _l('撤回'), icon: 'repeal-o', sort: 10 },
};

export const OPERATION_LIST = {
  12: { id: 'print', text: _l('打印'), icon: 'print' },
  16: { id: 'addApprove', text: _l('添加审批人'), icon: 'group_add' },
};

export const MOBILE_OPERATION_LIST = {
  6: { id: 'transferApprove', text: _l('转审'), icon: 'swap_horiz' },
  7: { id: 'sign', text: _l('加签'), icon: 'countersign' },
  10: { id: 'transfer', text: _l('转交'), icon: 'sp_post_exchange_white' },
  16: { id: 'addApprove', text: _l('添加审批人'), icon: 'group_add' },
  17: { id: 'return', text: _l('退回'), icon: 'repeal-o' },
  19: { id: 'taskRevoke', text: _l('撤回'), icon: 'repeal-o' },
};

export const ACTION_TO_TEXT = {
  after: {
    headerText: _l('通过并加签'),
    placeholder: _l('填写加签备注'),
  },
  before: {
    headerText: _l('审批前加签'),
    placeholder: _l('填写加签备注'),
  },
  transfer: {
    headerText: _l('转交'),
    placeholder: _l('填写转交备注'),
  },
  transferApprove: {
    headerText: _l('转审'),
    placeholder: _l('填写转审备注'),
  },
  addApprove: {
    headerText: _l('添加审批人'),
    placeholder: _l('填写加人备注'),
  },
  pass: {
    headerText: _l('审批处理：'),
    placeholder: _l('请输入'),
  },
  overrule: {
    headerText: _l('审批处理：'),
    placeholder: _l('请输入'),
  },
  return: {
    headerText: _l('审批处理：'),
    placeholder: _l('请输入'),
  },
  taskRevoke: {
    headerText: _l('撤回'),
    placeholder: _l('请输入'),
  },
  revoke: {
    headerText: _l('撤回'),
    placeholder: _l('请输入'),
  },
};

export const STATUS_ERROR_MESSAGE = {
  20001: _l('动作节点执行失败'),
  30001: _l('当前流程已删除'),
  30002: _l('当前流程已关闭'),
  30003: _l('当前内容已失效'),
  30004: _l('当前节点已删除'),
  30006: _l('当前用户无权限查看'),
  40007: _l('被发起人撤回'),
};

/**
 * 操作类型对应的后台接口名
 */
export const ACTION_TO_METHOD = {
  before: 'signTask',
  after: 'signTask',
  transferApprove: 'forward',
  transfer: 'transfer',
  revoke: 'revoke',
  pass: 'pass',
  overrule: 'overrule',
  return: 'return',
  taskRevoke: 'taskRevoke',
};
