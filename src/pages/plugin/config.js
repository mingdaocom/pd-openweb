import { VersionProductType } from 'src/util/enum';

export const sideNavList = [
  {
    key: 'view',
    list: [
      {
        type: 'view',
        text: _l('视图'),
        icon: 'view_eye',
      },
    ],
  },
  {
    key: 'aiAssistant',
    title: _l('AI 助手'),
    list: [
      {
        type: 'assistant',
        text: _l('助手'),
        icon: 'contact_support',
        featureId: VersionProductType.assistant,
      },
      {
        type: 'knowledgeBase',
        text: _l('知识库'),
        icon: 'import_contacts',
        featureId: VersionProductType.assistant,
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
    { text: _l('版本历史'), value: 'publishHistory' },
    { text: _l('环境参数'), value: 'paramSetting' },
    { text: _l('使用明细'), value: 'usageDetail' },
  ],
  myPlugin: [
    { text: _l('调试环境'), value: 'debugEnv' },
    { text: _l('提交'), value: 'commit' },
    { text: _l('发布历史'), value: 'publishHistory' },
    { text: _l('导出历史'), value: 'exportHistory' },
  ],
};

export const pluginConfigType = {
  create: 'create',
  debugEnv: 'debugEnv',
  commit: 'commit',
  usageDetail: 'usageDetail',
  paramSetting: 'paramSetting',
  publishHistory: 'publishHistory',
  exportHistory: 'exportHistory',
};

export const fileCheckErrorMsg = {
  3: _l('密码不正确，请重新输入'),
  4: _l('重试次数超标'),
  5: _l('文件解析错误'),
  8: _l('未授权的组织，无法导入'),
  11: _l('授权已过期，无法导入'),
  12: _l('未授权的服务器，无法导入'),
};
