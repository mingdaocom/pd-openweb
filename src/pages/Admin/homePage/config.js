export const QUICK_ENTRY_CONFIG = [
  {
    icon: 'people_5',
    color: '#00CB80',
    title: _l('添加人员'),
    explain: _l('添加人员'),
    action: 'addPerson',
  },
  {
    icon: 'task_summary',
    color: '#00BBD7',
    title: _l('批量导入'),
    explain: _l('批量导入成员'),
    action: 'batchImport',
  },
  {
    icon: 'hr_structure',
    color: '#435A65',
    title: _l('创建部门'),
    explain: _l('创建部门'),
    action: 'createDepartment',
  },
  {
    icon: 'settings',
    color: '#2196f3',
    title: _l('设置组织管理员'),
    explain: _l('拥有后台操作的权限'),
    action: 'settingAdmin',
  },
  {
    icon: 'task_custom_mode_edit',
    color: '#445A65',
    title: _l('完善组织信息'),
    explain: _l('可以上传组织 logo'),
    action: 'completeInfo',
  },
  // {
  //   icon: 'laptop_mac',
  //   color: '#2196f3',
  //   title: _l('客户端安装'),
  //   explain: _l('为成员安装客户端'),
  //   action: 'installDesktop',
  // },
  // {
  //   icon: 'task_custom_phone_android',
  //   color: '#1FCB80',
  //   title: _l('App 安装'),
  //   explain: _l('为成员安装 App'),
  //   action: 'installApp',
  // },
];

export const USER_COUNT = [
  { key: 'effectiveUserCount', text: _l('成员'), link: 'structure' },
  { key: 'notActiveUserCount', text: _l('未激活'), link: 'structure' },
  { key: 'effectiveExternalUserCount', text: _l('外部用户'), link: 'portal' },
  { key: 'departmentCount', text: _l('部门'), link: 'structure' },
];

export const ITEM_COUNT = [
  { key: 'effectiveApkCount', text: _l('应用数'), link: 'app' },
  { key: 'effectiveWorksheetCount', text: _l('工作表总数'), link: 'app' },
  { key: 'effectiveWorksheetRowCount', text: _l('行记录总数'), link: 'app' },
  { key: 'useProcessCount', text: _l('工作流总数'), link: 'workflows' },
  { key: 'effectiveDataPipelineJobCount', text: _l('同步任务总数'), link: '' },
  { key: 'effectiveAggregationTableCount', text: _l('聚合表数'), link: 'aggregationtable', featureId: 38 },
].filter(o => !(_.get(window, 'md.global.SysSettings.hideDataPipeline') && o.key === 'effectiveAggregationTableCount'));;

export const UPLOAD_COUNT = [
  {
    key: 'effectiveApkStorageCount',
    limit: 'limitApkStorageCount',
    text: _l('应用附件上传量'),
    unit: _l('（年）'),
    link: 'app',
    click: 'storage',
    numUnit: 'GB',
  },
  {
    key: 'useExecCount',
    limit: 'limitExecCount',
    text: _l('工作流执行次数'),
    unit: _l('（月）'),
    link: 'workflows',
    click: 'workflow',
    numUnit: _l('次'),
  },
  {
    key: 'effectiveDataPipelineRowCount',
    limit: 'limitDataPipelineRowCount',
    text: _l('数据同步任务已用算力'),
    unit: _l('（月）'),
    link: 'dataSync',
    click: 'dataSync',
    numUnit: _l('行'),
  },
];

function pow1024(num) {
  return Math.pow(1024, num);
}

function roundFun(value, n) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}

export const formatFileSize = size => {
  if (!size) return 0 + ' MB';
  if (size < pow1024(3)) return roundFun(size / pow1024(2), 3) + ' MB';
  if (size < pow1024(4)) return roundFun(size / pow1024(3), 3) + ' GB';
  return roundFun(size / pow1024(4), 3) + ' TB';
};

export const formatValue = num => {
  return _.isNumber(num) ? (num + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,') : '-';
};
