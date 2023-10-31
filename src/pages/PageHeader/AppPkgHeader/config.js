export const ADD_GROUP_ID = '@ADD/GROUP';

export const APP_GROUP_CONFIG = [
  {
    type: 'rename',
    icon: 'edit',
    text: _l('重命名%02011'),
  },
  {
    type: 'addAfter',
    icon: 'add',
    text: _l('在此后添加分组%02010'),
  },
  {
    type: 'del',
    icon: 'delete2',
    text: _l('删除分组%02009'),
    className: 'delApp',
  },
];

export const DEFAULT_CREATE = '@DEFAULT/CREATE';
export const DEFAULT_GROUP_NAME = _l('未命名分组');

// 高级权限,可以更改应用相关信息
export const ADVANCE_AUTHORITY = 100;

// 应用下拉列表配置
export const DROPDOWN_APP_CONFIG = [
  { type: 'modify', icon: 'edit', text: _l('名称和外观%02052'), action: 'modifyAppIconAndNameVisible' },
  {
    type: 'editNavigation',
    icon: 'custom_navigation',
    action: 'navigationConfigVisible',
    text: _l('导航设置%02051'),
  },
  { type: 'editIntro', icon: 'info', text: _l('编辑应用说明%02050'), action: 'editAppIntroVisible' },
  { type: 'appAnalytics', icon: 'poll', text: _l('使用分析%02049'), action: 'appAnalyticsVisible', featureId: 17 },
  { type: 'appLogs', icon: 'wysiwyg', text: _l('日志'), featureId: 31 },
  { type: 'copy', icon: 'content-copy', text: _l('复制'), action: 'copyAppVisible' },
  { type: 'modifyAppLockPassword', icon: 'lock', text: _l('解锁应用%02048'), action: 'modifyAppLockPasswordVisible' },
  { type: 'appManageMenu', icon: 'custom_widgets', text: _l('应用管理'), action: 'toAppManageMenu' },
  {
    type: 'worksheetapi',
    icon: 'worksheet_API',
    text: _l('API开发文档%02043'),
    action: 'goWorksheetapi',
    featureId: 21,
  },
];
