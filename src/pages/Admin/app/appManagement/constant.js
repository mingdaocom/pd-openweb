import { VersionProductType } from 'src/utils/enum';

export const optionData = [
  {
    label: _l('导出应用'),
    icon: 'cloud_download',
    action: 'handleExportAll',
    hasBeta: true,
    featureId: VersionProductType.appImportExport,
  },
  {
    label: _l('导入应用'),
    icon: 'unarchive',
    action: 'handleUpdateAll',
    hasBeta: true,
    featureId: VersionProductType.appBackupRestore,
  },
  { label: _l('日志'), icon: 'assignment', action: 'handleLog', hasBeta: false },
  {
    label: _l('应用回收站'),
    icon: 'knowledge-recycle',
    action: 'openAppTrash',
    hasBeta: false,
    featureId: VersionProductType.recycle,
  },
  {
    label: _l('获取文件密码'),
    icon: 'key1',
    action: 'openDecryptUpload',
    hasBeta: false,
  },
];

export const dialogHeader = {
  selectAppVisible: _l('选择要导出的应用'),
  singleAppVisible: _l('导出应用'),
  uploadVisible: _l('导入应用'),
};

export const DataDBInstances = [
  { label: _l('全部数据库'), value: 'all', status: 1 },
  { label: _l('系统默认数据库'), value: '', status: 1 },
];

export const terminals = [
  { label: _l('PC端'), value: 'pcDisplay' },
  { label: _l('Web移动端'), value: 'webMobileDisplay' },
  { label: 'APP', value: 'appDisplay' },
];
