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
  7: _l('不支持该功能'),
  8: _l('无权限'),
  9: _l('导入的文件不在允许升级范围内'),
  10: _l('导入文件中，包含多个应用包'),
  20: _l('业务模块类型错误'),
};

export const MAX_FILES = 20;

export const ITEMS = [
  { title: _l('上传文件'), key: 'renderUploadFile' },
  { title: _l('选择应用'), key: 'renderSelectApp' },
  { title: _l('升级范围'), key: 'renderUpgradeScope' },
  { title: _l('开始导入') },
];

export const AdvancedConfig = [
  {
    label: _l('导入时匹配人员部门和组织角色'),
    key: 'matchOffice',
  },
  {
    label: _l('升级时同时备份当前版本'),
    key: 'backupCurrentVersion',
  },
];

export const ERROR_CODE = {
  6: _l('工作表数量超标'),
  13: _l('上传的文件不能来源于同一个应用'),
  20: _l('业务模块类型错误'),
  30: _l('该应用在组织下已存在，请勿重复导入'),
  31: _l('应用不允许在当前组织下导入'),
  32: _l('不允许导入市场购买的应用'),
  33: _l('该应用在组织下已存在，如需使用请从回收站内恢复”'),
};

export const SETTINGS = [
  {
    key: 'upgradeName',
    name: _l('所有名称和说明'),
    coverName: _l('名称和说明'),
    desc: _l('勾选时覆盖更新应用项、视图、工作流、角色的名称和说明'),
  },
  {
    key: 'upgradeHide',
    name: _l('所有显隐配置'),
    desc: _l('勾选时覆盖应用、应用项、视图、工作流、角色的名称和说明'),
    coverdesc: _l('勾选时覆盖更新应用、应用项、视图、工作流、角色的名称和说明'),
  },
  { key: 'upgradeStyle', name: _l('外观和导航'), desc: _l('勾选时覆盖更新主题色、导航色、导航设置、应用项排序') },
  { key: 'upgradeLang', name: _l('应用语言') },
  { key: 'upgradeTimeZone', name: _l('应用时区') },
];

// 更新方式
export const UPDATE_METHOD = [
  { modelType: 0, text: _l('合并更新'), desc: _l('新增目标应用中缺失项，更新已有项，保留多余项。') },
  {
    modelType: 1,
    text: _l('覆盖更新'),
  },
];
