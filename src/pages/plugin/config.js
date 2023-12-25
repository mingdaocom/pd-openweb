export const sideNavList = [
  {
    list: [
      {
        type: 'view',
        text: _l('视图'),
        icon: 'view_eye',
      },
    ],
  },
  {
    title: _l('即将上线'),
    list: [
      {
        type: 'customPage',
        text: _l('自定义页面'),
        icon: 'dashboard',
        disabled: true,
      },
      {
        type: 'workflowNode',
        text: _l('工作流节点'),
        icon: 'workflow',
        disabled: true,
      },
      {
        type: 'formControl',
        text: _l('工作表字段控件'),
        icon: 'worksheet',
        disabled: true,
      },
    ],
  },
];

export const typeOptionList = [
  { text: _l('全部类型'), value: 1 },
  { text: _l('视图'), value: 2 },
  { text: _l('工作流节点'), value: 3 },
  { text: _l('自定义页面组件'), value: 4 },
  { text: _l('表单控件'), value: 5 },
];

export const enableOptionList = [
  { text: _l('全部'), value: 2 },
  { text: _l('已启用'), value: 1 },
  { text: _l('未启用'), value: 0 },
];

export const tabList = [
  { text: _l('我开发的'), value: 'myPlugin' },
  { text: _l('组织'), value: 'project' },
];

export const viewDetailTabList = {
  project: [
    { text: _l('发布历史'), value: 'publishHistory' },
    { text: _l('调试环境'), value: 'debugEnv' },
    { text: _l('环境参数'), value: 'paramSetting' },
    { text: _l('使用明细'), value: 'usageDetail' },
  ],
  myPlugin: [
    { text: _l('调试环境'), value: 'debugEnv' },
    { text: _l('提交'), value: 'commit' },
    { text: _l('发布历史'), value: 'publishHistory' },
  ],
};

export const pluginConfigType = {
  create: 'create',
  debugEnv: 'debugEnv',
  commit: 'commit',
  usageDetail: 'usageDetail',
  paramSetting: 'paramSetting',
  publishHistory: 'publishHistory',
};
