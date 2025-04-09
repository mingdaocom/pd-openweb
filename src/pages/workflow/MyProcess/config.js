import moment from 'moment';

export const ACTION_TYPES = {
  0: {
    id: 'default',
    text: _l('发起工作流'),
    icon: 'worksheet',
  },
  3: {
    id: 'edit',
    text: _l('填写'),
    icon: 'edit',
  },
  4: {
    id: 'approve',
    text: _l('审批'),
    icon: 'workflow_ea',
  },
  5: {
    id: 'notice',
    text: _l('通知'),
    icon: 'workflow_notice',
  },
  12: {
    id: 'delayed',
    text: _l('延时'),
    icon: 'workflow_delayed',
  },
  16: {
    id: 'subprocess',
    text: _l('子流程'),
    icon: 'subprocess',
  },
  18: {
    id: 'print',
    text: _l('获取记录打印文件'),
    icon: 'print',
  },
  20: {
    id: 'pbc',
    text: _l('封装业务流程'),
    icon: 'pbc',
  },
  26: {
    id: 'delayed',
    text: _l('审批流'),
    icon: 'workflow_delayed',
  }
};

export const TYPE_TO_STYLE = {
  approve: {
    icon: 'workflow_ea',
    bg: '#7E57C2',
    shallowBg: '#7E57C233',
  },
  notice: {
    icon: 'workflow_notice',
    bg: '#FFA340',
    shallowBg: '#ffa34033',
  },
  edit: {
    icon: 'edit',
    bg: '#2196f3',
    shallowBg: '#2196f333',
  },
  workflow: {
    icon: 'workflow',
    bg: '#2196f3',
    shallowBg: '#2196f333',
  },
  default: {
    icon: 'workflow',
    bg: '#757575',
    shallowBg: '#75757533',
  },
  delayed: {
    icon: 'workflow_delayed',
    bg: '#4c7d9e',
    shallowBg: '#4c7d9e33',
  },
  subprocess: {
    icon: 'subprocess',
    bg: '#4c7d9e',
    shallowBg: '#4c7d9e33',
  },
  print: {
    icon: 'print',
    bg: '#4c7d9e',
    shallowBg: '#4c7d9e33',
  },
  pbc: {
    icon: 'pbc',
    bg: '#4c7d9e',
    shallowBg: '#4c7d9e33',
  },
};

export const FLOW_NODE_TYPE_STATUS = {
  3: {
    0: { text: _l('待填写'), color: '#757575' },
    1: { text: _l('我已填写'), color: '#fff', shallowBg: '#0096fe' },
    2: { text: _l('我已转交'), color: '#757575' },
    3: { text: _l('我已转交'), color: '#757575' },
    5: { text: _l('无需填写'), color: '#757575' },
    22: { text: _l('我已填写'), color: '#fff', shallowBg: '#0096fe' },
  },
  4: {
    0: { text: _l('待审批'), color: '#757575' },
    1: { text: _l('我已通过'), color: '#fff ', shallowBg: '#4CAF50' },
    2: { text: _l('我已加签'), color: '#757575' },
    3: { text: _l('我已转审'), color: '#757575' },
    4: { text: _l('流程否决'), color: '#fff', shallowBg: '#F44336' },
    5: { text: _l('无需审批'), color: '#757575' },
    8: { text: _l('我已转审'), color: '#757575' },
    16: { text: _l('我已加签'), color: '#757575' },
    17: { text: _l('我已加签'), color: '#757575' },
    22: { text: _l('流程否决'), color: '#fff', shallowBg: '#F44336' },
  },
  5: {
    0: { text: _l('待查看'), color: '#2196F3', shallowBg: '#2196F326' },
    1: { text: _l('已查看'), color: '#757575' },
  },
};

export const INSTANCELOG_STATUS = {
  1: { text: _l('等待') },
  2: { text: _l('流程通过'), bg: '#4CAF50', shallowBg: '#4CAF5026', icon: 'done' },
  3: { text: _l('流程中止'), bg: '#ffa340', shallowBg: '#ffa34026' },
  4: { text: _l('流程中止'), bg: '#ffa340', shallowBg: '#ffa34026' },
  5: { text: _l('流程否决'), bg: '#F44336', shallowBg: '#F4433626', icon: 'clear' },
  6: { text: _l('流程中止'), bg: '#ffa340', shallowBg: '#ffa34026' },
};

const getYear = () => {
  const minYear = 2018;
  const maxYear = moment().get('year');
  const result = [];
  for (let i = minYear; i <= maxYear; i++) {
    result.push({
      text: i === maxYear ? _l('今年') : _l('%0年', i),
      value: {
        startDate: moment(i.toString())
          .startOf('year')
          .format('YYYY-MM-DD'),
        endDate: moment(i.toString())
          .endOf('year')
          .format('YYYY-MM-DD'),
      },
    });
  }
  return result.reverse();
};

export const getDateScope = () => {
  const endDate = moment().format('YYYY-MM-DD');
  const data = [
    {
      text: _l('1个月内'),
      value: {
        startDate: moment()
          .day(-30)
          .format('YYYY-MM-DD'),
        endDate,
      },
    },
    {
      text: _l('3个月内'),
      value: {
        startDate: moment()
          .day(-90)
          .format('YYYY-MM-DD'),
        endDate,
      },
    },
    {
      text: _l('6个月内'),
      value: {
        startDate: moment()
          .day(-180)
          .format('YYYY-MM-DD'),
        endDate,
      },
    },
  ];
  return data.concat(getYear());
};

export const covertTime = (time) => {
  if (time < 0) time = time * -1;

  const day = Math.floor(time / 24 / 60 / 60 / 1000);
  const hour = Math.floor((time - day * 24 * 60 * 60 * 1000) / 60 / 60 / 1000);
  const min = (time - day * 24 * 60 * 60 * 1000 - hour * 60 * 60 * 1000) / 60 / 1000;

  return `${day ? _l('%0天', day) : ''}${hour ? _l('%0小时', hour) : ''}${
    min ? _l('%0分钟', Math.floor(min) || 1) : ''
  }`;
}

export const TABS = {
  WAITING_APPROVE: 0, // 待审批
  WAITING_FILL: 1, // 待填写
  WAITING_EXAMINE: 2, // 待查看
  MY_SPONSOR: 3, // 我发起
  COMPLETE: 4, // 已完成
};