import viewPluginApi from 'src/api/plugin';
import workflowPluginApi from 'src/pages/workflow/api/Plugin';

export const sideNavList = [
  {
    key: 'plugin',
    list: [
      {
        type: 'pluginMarket',
        text: _l('插件市场'),
        icon: 'extension_black1',
      },
      {
        type: 'view',
        text: _l('视图'),
        icon: 'view_eye',
      },
      {
        type: 'node',
        text: _l('工作流节点'),
        icon: 'workflow',
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
  view: {
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
  },
  workflow: {
    project: [
      { text: _l('版本历史'), value: 'publishHistory' },
      { text: _l('使用明细'), value: 'usageDetail' },
    ],
    myPlugin: [
      { text: _l('发布历史'), value: 'publishHistory' },
      { text: _l('使用明细'), value: 'usageDetail' },
    ],
  },
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

export const PLUGIN_TYPE = {
  VIEW: 'view',
  WORKFLOW: 'workflow',
};

export const pluginConstants = {
  view: {
    headerTitle: _l('视图插件'),
    headerDescription: _l('制作和管理视图插件，自由扩展工作表视图功能'),
    supportLink: 'https://help.mingdao.com/extensions/developer/view',
    myTabText: _l('我开发的'),
    publishDescription: _l('选择已提交的代码进行发布。发布后，组织内的所有应用均可安装使用该代码插件。'),
    usageColumn2: _l('工作表'),
    usageColumn3: _l('视图'),
  },
  workflow: {
    headerTitle: _l('工作流节点插件'),
    headerDescription: _l('将代码处理步骤封装为工作流节点，可以在组织内使用或跨组织交换'),
    supportLink: 'https://help.mingdao.com/extensions/developer/view',
    myTabText: _l('我创建的'),
    publishDescription: _l(
      '发布后，该插件将在组织内正式生效，所有成员均可使用。已安装的旧版本插件将自动替换为当前版本。',
    ),
    usageColumn2: _l('工作流'),
    usageColumn3: _l('节点名称'),
  },
};

export const pluginApiConfig = {
  view: viewPluginApi,
  workflow: workflowPluginApi,
};

export const API_EXTENDS = { isPlugin: true };
