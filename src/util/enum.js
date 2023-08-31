export const lang = () => ({
  拥有者: _l('拥有者'),
  创建者: _l('创建者'),
  创建时间: _l('创建时间'),
  最近更新时间: _l('最近修改时间'),
  最近修改时间: _l('最近修改时间'),
  触发者: _l('触发者'),
  触发时间: _l('触发时间'),
  记录ID: _l('记录ID'),
  系统编号: _l('系统编号'),
});

export const LIGHT_COLOR = [
  '#C9E6FC',
  '#C3F2F2',
  '#C2F1D2',
  '#FEF6C6',
  '#FFE5C2',
  '#FDCACA',
  '#FACDE6',
  '#DEC2FA',
  '#CCD2F1',
  '#D3D3D3',
  '#A3D6FF',
  '#A9E9E9',
  '#A3E9BC',
  '#FDF1AA',
  '#FFD8A3',
  '#FCAFAF',
  '#F8B4D9',
  '#CDA3F8',
  '#B3BCEA',
  '#BDBDBD',
  '#E8E8E8',
  '#E5F1FE',
  'TRANSPARENT',
];

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1xzCYtdu8bZEinh6Oh7/p+6xc
ilHgV/ChU3bZXyezLQqf6mzOnLH6GVZMMDafMw3uMtljWyECCqnECy2UhZPa5BFc
qA2xbYH8/WyKTraCRJT3Hn61UrI4Eac4YVxa1CJ8KaTQtIeZBoXHIW0r5XyhBwYe
NkSun+OFN+YBoJvCXwIDAQAB
-----END PUBLIC KEY-----`;

export const APPLICATION_ICON = {
  system: 'chat_system',
  post: 'chat_post',
  task: 'chat_task',
  calendar: 'chat_calendar',
  knowledge: 'chat_knowledge',
  uploadhelper: 'chat_uploadhelper',
  mail: 'chat_mail',
  approval: 'chat_approval',
  check: 'chat_check',
  hr: 'chat_hr',
  dossier: 'chat_dossier',
  score: 'chat_score',
  worksheet: 'chat_worksheet',
  applist: 'chat_worksheet',
  workflow: 'chat_workflow',
};

//  版本功能类型
export const VersionProductType = {
  appBackupRestore: 1, // 应用备份与还原
  appImportExport: 2, // 应用导入导出
  apiIntergration: 3, // API集成
  apiIntergrationNode: 4, // API集成工作流节点
  apiSearch: 5, // API查询字段
  contactsHide: 6, // 通讯录隐藏
  customIcon: 7, // 自定义图标
  codeBlockNode: 8, // 代码块节点
  collaborationSuite: 9, // 协作套件
  dingIntergration: 10, // 钉钉整合
  externalPortal: 11, // 外部门户
  feishuIntergration: 12, // 飞书整合
  getPrintFileNode: 13, // 获取打印文件节点
  interfacePush: 14, // 界面推送
  LDAPIntergration: 15, // LDAP/AD整合
  recycle: 16, //  回收站
  analysis: 17, // 使用分析
  WelinkIntergration: 18, // Welink整合
  workwxIntergration: 19, // 企业微信整合
  wordPrintTemplate: 20, //Word打印模板
  apiDevDocument: 21, //API开发文档
  apiRequestProxy: 22, // API请求网络代理
  encapsulatingBusinessProcess: 23, // 封装业务流程API响应
  filterGroup: 24, // 筛选条件分组
  globalSearch: 25, // 全局搜索
  datantergration: 26, // 数据集成
  userExtensionInformation: 27, // 用户扩展信息
  batchDownloadFiles: 28, // 批量下载文件
  dataEnctypt: 29, // 数据加密
  exclusiveResource: 30, // 专属隔离计算实例资源
  glabalLog: 31, // 全局日志
  globalBehaviorLog: 32, // 全局行为日志
};
