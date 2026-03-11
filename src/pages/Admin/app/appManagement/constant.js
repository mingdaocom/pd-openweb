import { VersionProductType } from 'src/utils/enum';

export const tabData = [
  { key: 'list', label: _l('应用') },
  { key: 'export', label: _l('导出记录') },
  { key: 'upgrade', label: _l('升级记录') },
];

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

export const importAppMode = [
  {
    label: _l('普通模式'),
    value: 0,
    description: _l('选择生成新应用，或指定同源应用进行升级'),
  },
  {
    label: _l('迁移模式'),
    value: 1,
    description: _l('根据 ID 自动匹配应用(全平台唯一)，不存在则生成新应用，存在则全量覆盖更新'),
  },
];

export const DataDBInstances = [
  { label: _l('全部数据库'), value: 'all', status: 1 },
  { label: _l('系统默认数据库'), value: '', status: 1 },
];

export const terminals = [
  { label: _l('PC端'), value: 'pcDisplay' },
  { label: _l('Web移动端'), value: 'webMobileDisplay' },
  { label: 'APP', value: 'appDisplay' },
];
