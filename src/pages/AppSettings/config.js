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
