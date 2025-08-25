import _ from 'lodash';

export const QUICK_ENTRY_CONFIG = [
  {
    icon: 'people_5',
    color: '#00CB80',
    title: _l('添加人员'),
    explain: _l('添加人员'),
    action: 'addPerson',
  },
  {
    icon: 'layers',
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
    color: '#1677ff',
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
  //   color: '#1677ff',
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

export const UPLOAD_COUNT = [
  {
    key: 'effectiveApkCount',
    limit: undefined,
    text: _l('应用数'),
    unit: _l('个'),
    link: 'app',
    numUnit: _l('个'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveWorksheetCount',
    limit: 'limitWorksheetCount',
    text: _l('工作表总数'),
    unit: _l('个'),
    numUnit: _l('个'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveWorksheetRowCount',
    limit: 'limitAllWorksheetRowCount',
    text: _l('行记录总数'),
    unit: _l('行'),
    numUnit: _l('行'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveAggregationTableCount',
    limit: 'limitAggregationTableCount',
    text: _l('聚合表数'),
    unit: _l('个'),
    link: 'aggregationtable',
    numUnit: _l('个'),
    featureId: 38,
    PurchaseExpandPack: true,
    click: 'aggregationtable',
    routePath: 'expansionserviceAggregationtable',
    isLocalFilter: false,
  },
  {
    key: 'effectiveDataPipelineJobCount',
    limit: 'limitDataPipelineJobCount',
    text: _l('直接同步任务数'),
    unit: _l('个'),
    link: 'dataSync',
    numUnit: _l('个'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveDataPipelineEtlJobCount',
    limit: 'limitDataPipelineEtlJobCount',
    text: _l('ETL处理任务数'),
    unit: _l('个'),
    link: 'dataSync',
    numUnit: _l('个'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveExternalUserCount',
    limit: 'limitExternalUserCount',
    text: _l('外部门户用户'),
    unit: _l('人'),
    link: 'portal',
    click: 'portalexpand',
    numUnit: _l('人'),
    PurchaseExpandPack: true,
    isLocalFilter: true,
  },
  {
    key: 'useExecCount',
    limit: 'limitExecCount',
    text: _l('工作流执行数'),
    unit: _l('月'),
    link: 'workflows',
    click: 'workflow',
    numUnit: _l('次'),
    PurchaseExpandPack: true,
    autoPurchase: 'autoPurchaseWorkflowExtPack',
    autoPurchaseText: _l('用量不足时自动消耗余额增补，10元/1,000次'),
    isLocalFilter: true,
  },
  {
    key: 'effectiveDataPipelineRowCount',
    limit: 'limitDataPipelineRowCount',
    text: _l('同步任务算力'),
    unit: _l('月'),
    link: 'dataSync',
    click: 'dataSync',
    numUnit: _l('行'),
    PurchaseExpandPack: true,
    autoPurchase: 'autoPurchaseDataPipelineExtPack',
    autoPurchaseText: _l('用量不足时自动消耗余额增补，10元/1万行'),
  },
  {
    key: 'effectiveApkStorageCount',
    limit: 'limitApkStorageCount',
    text: _l('附件上传流量（今年）'),
    unit: _l('年'),
    click: 'storage',
    numUnit: 'GB',
    PurchaseExpandPack: true,
    autoPurchase: 'autoPurchaseApkStorageExtPack',
    autoPurchaseText: _l('用量不足时自动消耗余额增补，20元/1GB'),
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
