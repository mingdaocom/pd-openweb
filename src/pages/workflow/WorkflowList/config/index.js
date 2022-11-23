export const FLOW_TYPE = {
  APP: '1',
  TIME: '2',
  OTHER_APP: '3',
  ADMIN_APP: '4',
  ADMIN_NETWORK: '5',
  OTHER: '6',
  CUSTOM_ACTION: '7',
  SUB_PROCESS: '8',
  USER: '9',
  PBC: '10',
  APPROVAL: '11',
};

export const FLOW_TYPE_NULL = {
  1: {
    icon: 'sheet',
    text: _l('当新增记录或已有记录发生修改时运行流程'),
  },
  2: {
    icon: 'date',
    text: _l('按照设置的时间周期，或保存在工作表记录中的时间运行流程'),
  },
  3: {
    icon: 'other',
    text: _l('暂无修改本应用的外部流程'),
  },
  4: {
    icon: 'workflow',
    text: _l('暂无应用流程'),
  },
  5: {
    icon: 'workflow',
    text: _l('暂无组织流程'),
  },
  6: {
    icon: 'sheet',
    text: _l('在服务器接收到第三方推送的消息后运行流程'),
  },
  7: {
    icon: 'other',
    text: _l('当用户点击记录的自定义按钮后运行流程 '),
  },
  8: {
    icon: 'subprocess',
    text: _l('在某个流程流转过程中可以创建一个子流程并执行'),
  },
  9: {
    icon: 'user',
    text: _l('当组织人员入/离职或外部用户注册/登录/删除时运行流程'),
  },
  10: {
    icon: 'pbc',
    text: _l('封装应用中可被复用的数据处理能力，自定义输入/输出'),
  },
  11: {
    icon: 'approval',
    text: _l('对业务数据发起审批流程，实现自动化和人工审批的打通'),
  },
};

export const START_APP_TYPE = {
  1: {
    iconName: 'table',
    iconColor: '#ffa340',
    text: _l('工作表事件'),
  },
  5: {
    iconName: 'hr_surplus',
    iconColor: '#2196f3',
    text: _l('时间'),
  },
  6: {
    iconName: 'hr_time',
    iconColor: '#2196f3',
    text: _l('时间'),
  },
  7: {
    iconName: 'workflow_webhook',
    iconColor: '#4C7D9E',
    text: _l('Webhook'),
  },
  8: {
    iconName: 'custom_actions',
    iconColor: '#4C7D9E',
    text: _l('自定义动作'),
  },
  9: {
    iconName: 'approval',
    iconColor: '#4158DB',
    text: _l('审批流程'),
  },
  subprocess: {
    iconName: 'subprocess',
    iconColor: '#4C7D9E',
    text: _l('子流程'),
  },
  17: {
    iconName: 'pbc',
    iconColor: '#4C7D9E',
    text: _l('封装业务流程'),
  },
  20: {
    iconName: 'hr_structure',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
  21: {
    iconName: 'workflow',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
  23: {
    iconName: 'language',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
};
