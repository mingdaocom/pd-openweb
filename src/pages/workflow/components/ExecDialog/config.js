export const ACTION_TYPES = {
  0: {
    id: 'default',
    icon: {
      1: 'table',
      5: 'hr_surplus',
      6: 'hr_time',
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
    icon: 'workflow_notice',
  },
};

export const ACTION_LIST = {
  3: { id: 'revoke', text: _l('撤回'), sort: 0 },
  4: { id: 'pass', text: _l('通过'), sort: 1 },
  5: { id: 'overrule', text: _l('否决'), sort: 2 },
  6: { id: 'transferApprove', text: _l('转审'), sort: 3 },
  7: { id: 'sign', text: _l('加签'), sort: 4 },
  9: { id: 'submit', text: _l('提交'), sort: 5 },
  10: { id: 'transfer', text: _l('转交'), sort: 6 },
  13: { id: 'stash', text: _l('暂存'), icon: 'save1', sort: -1 },
  18: { id: 'urge', text: _l('催办'), sort: 7 },
};

export const OPERATION_TYPE = {
  addApprove: 16,
};

export const OPERATION_LIST = {
  12: { id: 'print', text: _l('打印'), icon: 'print' },
  16: { id: 'addApprove', text: _l('添加审批人'), icon: 'group_add1' },
};

export const MOBILE_OPERATION_LIST = {
  6: { id: 'transferApprove', text: _l('转审'), icon: 'swap_horiz' },
  7: { id: 'sign', text: _l('加签'), icon: 'countersign' },
  10: { id: 'transfer', text: _l('转交'), icon: 'sp_post_exchange_white' },
  16: { id: 'addApprove', text: _l('添加审批人'), icon: 'group_add1' },
};

export const ACTION_TO_TEXT = {
  after: {
    headerText: _l('将在你通过申请后进行加签'),
    okText: _l('通过申请并加签'),
    placeholder: _l(' 填写加签意见'),
  },
  before: {
    headerText: _l('将在你审批前加签'),
    okText: _l('加签'),
    placeholder: _l('填写加签意见'),
  },
  transfer: {
    headerText: _l('转交给'),
    okText: _l('转交'),
    placeholder: _l('填写转交备注'),
  },
  transferApprove: {
    headerText: _l('转审人员'),
    okText: _l('转审'),
    placeholder: _l('填写转审备注'),
  },
  addApprove: {
    headerText: _l('添加1个审批人'),
    okText: _l('添加'),
    placeholder: _l('填写加人备注'),
  },
  pass: {
    headerText: _l('将通过'),
    okText: _l('通过'),
    placeholder: _l('填写审批意见'),
  },
  overrule: {
    headerText: _l('将否决'),
    okText: _l('否决'),
    placeholder: _l('填写否决意见'),
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
 * 选人层title
 */
export const SELECT_USER_TITLE = {
  transfer: _l('转交给他人填写'),
  transferApprove: _l('转审'),
  addApprove: _l('添加审批人'),
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
};
