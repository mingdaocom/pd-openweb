// 应用管理页配置
export const APP_CONFIGS = [
  {
    type: 'options',
    icon: 'dropdown',
    text: _l('选项集%02047'),
  },
  {
    type: 'variables',
    icon: 'global_variable',
    featureId: 33,
    text: _l('全局变量'),
  },
  {
    type: 'publish',
    icon: 'send',
    text: _l('发布'),
  },
  { type: 'lock', icon: 'lock', text: _l('锁定') },
  { type: 'export', icon: 'cloud_download', text: _l('导出'), featureId: 2 },
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
