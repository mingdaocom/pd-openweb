const task = [
  {
    key: 'parent',
    name: _l('母任务'),
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'startTime',
    name: `${_l('计划开始')}-${_l('计划结束')}`,
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'actualStartTime',
    name: `${_l('实际开始')}-${_l('实际结束')}`,
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'charger',
    name: _l('主负责人'),
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'member',
    name: _l('任务参与者'),
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'tag',
    name: _l('标签'),
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'desc',
    name: _l('任务描述'),
    show: true,
    independent: false,
    value: '',
  },
  {
    key: 'checklist',
    name: _l('检查清单'),
    show: true,
    independent: true,
    value: '',
  },
  {
    key: 'subTask',
    name: _l('子任务'),
    show: true,
    independent: true,
    value: '',
  },
  {
    key: 'code',
    name: _l('二维码'),
    show: true,
    independent: true,
    value: '',
  },
];

export default {
  task,
};
