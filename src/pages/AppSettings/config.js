// 应用管理页配置
export const APP_CONFIGS = [
  {
    type: 'options',
    icon: 'dropdown',
    text: _l('选项集%02047'),
  },
  {
    type: 'aggregation',
    icon: 'aggregate_table',
    text: _l('聚合表'),
    featureId: 38,
  },
  {
    type: 'variables',
    icon: 'global_variable',
    featureId: 33,
    text: _l('全局变量'),
  },
  {
    type: 'language',
    icon: 'language',
    featureId: 35,
    text: _l('多语言'),
  },
  {
    type: 'relationship',
    icon: 'circle_three',
    text: _l('关系图'),
  },
  {
    type: 'publish',
    icon: 'send',
    text: _l('发布'),
  },
  { type: 'lock', icon: 'lock', text: _l('锁定') },
  { type: 'export', icon: 'cloud_download', text: _l('导出'), featureId: 2 },
  { type: 'upgrade', icon: 'unarchive', text: _l('导入升级'), featureId: 1 },
  {
    type: 'backup',
    icon: 'cloud_sync',
    text: _l('备份与还原'),
    featureId: 1,
  },
  { type: 'recyclebin', icon: 'knowledge-recycle', text: _l('回收站'), featureId: 16 },
  {
    type: 'del',
    icon: 'delete2',
    text: _l('删除应用%02037'),
    className: 'delApp',
  },
];

export const UPGARADE_TYPE_LIST = [
  { type: 'worksheets', name: _l('工作表'), icon: 'worksheet' },
  { type: 'pages', name: _l('自定义页面'), icon: 'dashboard' },
  { type: 'roles', name: _l('角色'), icon: 'group' },
  { type: 'workflows', name: _l('工作流'), icon: 'workflow' },
];
export const UPGRADE_DETAIL_TYPE_LIST = [
  { type: 'addFields', name: _l('新增字段') },
  { type: 'updateFields', name: _l('更新字段') },
  { type: 'addView', name: _l('新增视图') },
  { type: 'updateView', name: _l('更新视图') },
];

export const UPGRADE_ERRORMSG = {
  2: _l('导入失败'),
  3: _l('密码错误'),
  4: _l('重试次数超标'),
  5: _l('文件解析错误'),
  8: _l('无权限'),
  9: _l('导入的文件不在允许升级范围内'),
  10: _l('导入文件中，包含多个应用包'),
};
