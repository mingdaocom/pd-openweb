const { app: {appInfo} } = window.private

export const ADD_GROUP_ID = '@ADD/GROUP';

export const APP_GROUP_CONFIG = [
  {
    type: 'rename',
    icon: 'edit',
    text: _l('重命名'),
  },
  {
    type: 'addAfter',
    icon: 'add',
    text: _l('在此后添加分组'),
  },
  {
    type: 'del',
    icon: 'delete2',
    text: _l('删除分组'),
    className: 'delApp',
  },
];

export const APP_CONFIG = {
  0: [],
  //  {
  //   type: 'quit',
  //   icon: 'exit',
  //   text: _l('退出应用'),
  //   action: 'quitAppConfirmVisible',
  // }],
  // // 成员
  50: [
    {
      type: 'ding',
      icon: 'feishu',
      text: _l('添加到钉钉'),
      action: 'goDingCourse',
    },
    {
      type: 'weixin',
      icon: 'enterprise_wechat',
      text: _l('添加到企业微信'),
      action: 'goWeixinCourse',
    },
  //  {
  //     type: 'quit',
  //     icon: 'exit',
  //     text: _l('退出应用'),
  //     action: 'quitAppConfirmVisible',
  //   },
    ],
  // ADMIN
  100: [
    {
      type: 'modify',
      icon: 'edit',
      text: _l('修改名称和图标'),
      action: 'modifyAppIconAndNameVisible',
    },
    {
      type: 'editIntro',
      icon: 'info',
      text: _l('编辑应用说明'),
      action: 'editAppIntroVisible',
    },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用'), action: 'copyAppVisible' },
    { type: 'export', icon: 'cloud_download', text: _l('导出应用'), action: 'exportAppVisible' },
    { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集') },
    { type: 'editAppNavStyle', icon: 'mobile_phone', action: 'mobileNavVisible', text: _l('设置移动端导航') },
    {
      type: 'publishSettings',
      icon: 'send',
      text: _l('发布设置'),
      action: 'publishSettings',
    },
    {
      type: 'worksheetapi',
      icon: 'worksheet_API',
      text: _l('API开发文档'),
      action: 'goWorksheetapi',
    },
  ].filter(item => !appInfo[item.type]),
  // OWNER
  200: [
    {
      type: 'modify',
      icon: 'edit',
      text: _l('修改名称和图标'),
      action: 'modifyAppIconAndNameVisible',
    },
    {
      type: 'editIntro',
      icon: 'info',
      text: _l('编辑应用说明'),
      action: 'editAppIntroVisible',
    },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用'), action: 'copyAppVisible' },
    { type: 'export', icon: 'cloud_download', text: _l('导出应用'), action: 'exportAppVisible' },
    { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集') },
    { type: 'editAppNavStyle', icon: 'mobile_phone', action: 'mobileNavVisible', text: _l('设置移动端导航') },
    {
      type: 'publishSettings',
      icon: 'send',
      text: _l('发布设置'),
      action: 'publishSettings',
    },
    {
      type: 'worksheetapi',
      icon: 'worksheet_API',
      text: _l('API开发文档'),
      action: 'goWorksheetapi',
    },
    {
      type: 'del',
      icon: 'delete2',
      text: _l('删除应用'),
      action: 'delAppConfirmVisible',
      className: 'delApp',
    },
  ].filter(item => !appInfo[item.type]),
  300: [
    {
      type: 'modify',
      icon: 'edit',
      text: _l('修改名称和图标'),
      action: 'modifyAppIconAndNameVisible',
    },
    {
      type: 'editIntro',
      icon: 'info',
      text: _l('编辑应用说明'),
      action: 'editAppIntroVisible',
    },
    { type: 'copy', icon: 'content-copy', text: _l('复制应用'), action: 'copyAppVisible' },
    { type: 'export', icon: 'cloud_download', text: _l('导出应用'), action: 'exportAppVisible' },
    { type: 'optionList', icon: 'dropdown', action: 'optionListVisible', text: _l('选项集') },
    { type: 'editAppNavStyle', icon: 'mobile_phone', action: 'mobileNavVisible', text: _l('设置移动端导航') },
    {
      type: 'publishSettings',
      icon: 'send',
      text: _l('发布设置'),
      action: 'publishSettings',
    },
    {
      type: 'worksheetapi',
      icon: 'worksheet_API',
      text: _l('API开发文档'),
      action: 'goWorksheetapi',
    },
  ].filter(item => !appInfo[item.type]),
};

export const DEFAULT_CREATE = '@DEFAULT/CREATE';
export const DEFAULT_GROUP_NAME = _l('未命名分组');

// 高级权限,可以更改应用相关信息
export const ADVANCE_AUTHORITY = 100;
