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
};

export const FLOW_TYPE_NULL = {
  '1': {
    icon: 'sheet',
    text: _l('当新增记录或已有记录发生修改时运行流程'),
  },
  '2': {
    icon: 'date',
    text: _l('按照设置的时间周期，或保存在工作表记录中的时间运行流程'),
  },
  '3': {
    icon: 'other',
    text: _l('没有外部流程修改本应用数据'),
  },
  '4': {
    icon: 'workflow',
    text: _l('暂无应用流程'),
  },
  '5': {
    icon: 'workflow',
    text: _l('暂无组织流程'),
  },
  '6': {
    icon: 'sheet',
    text: _l('Webhook触发器触发时运行流程'),
  },
  '7': {
    icon: 'other',
    text: _l('没有自定义动作'),
  },
  '8': {
    icon: 'subprocess',
    text: _l('没有子流程'),
  },
  '9': {
    icon: 'user',
    text: _l('人员或部门事件触发时运行流程'),
  },
};

export const START_APP_TYPE = {
  1: {
    iconName: 'worksheet',
    iconColor: '#ffa340',
  },
  5: {
    iconName: 'hr_surplus',
    iconColor: '#2196f3',
  },
  6: {
    iconName: 'hr_time',
    iconColor: '#2196f3',
  },
  7: {
    iconName: 'workflow_webhook',
    iconColor: '#4C7D9E',
  },
  8: {
    iconName: 'custom_actions',
    iconColor: '#4C7D9E',
  },
  subprocess: {
    iconName: 'subprocess',
    iconColor: '#4C7D9E',
  },
  20: {
    iconName: 'account_circle',
    iconColor: '#01ca83',
  },
  21: {
    iconName: 'workflow',
    iconColor: '#01ca83',
  },
};
