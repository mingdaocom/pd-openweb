/** 版本功能对应的产品能力类型。 */
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
  recycle: 16, // 回收站
  analysis: 17, // 使用分析
  WelinkIntergration: 18, // Welink整合
  workwxIntergration: 19, // 企业微信整合
  wordPrintTemplate: 20, // Word打印模板
  apiDevDocument: 21, // API开发文档
  apiRequestProxy: 22, // API请求网络代理
  encapsulatingBusinessProcess: 23, // 封装业务流程API响应
  filterGroup: 24, // 筛选条件分组
  globalSearch: 25, // 全局搜索
  dataIntegrationETL: 26, // 数据集成ETL
  userExtensionInformation: 27, // 用户扩展信息
  batchDownloadFiles: 28, // 批量下载文件
  dataEnctypt: 29, // 数据加密
  exclusiveResource: 30, // 专属隔离计算实例资源
  glabalLog: 31, // 全局日志
  globalBehaviorLog: 32, // 全局行为日志
  globalVariable: 33, // 全局变量
  waterMark: 34, // 附件水印
  multiLanguage: 35, // 应用多语言
  dataBase: 36, // 数据库
  assistant: 37, // AI助手
  aggregation: 38, // 聚合表
  WFLP: 39, // 工作流循环
  PAY: 40, // 支付
  dataMirror: 41, // 数据镜像
  flowPlugin: 42, // 工作表插件
  editAttachment: 43, // 附件编辑
  regularBackup: 44, // 定期备份
  invoice: 45, // 电子发票
  editProtect: 46, // 编辑保护
  quota: 47, // 额度管理
  worldMap: 48, // 统计图，世界地图
  workflowAgent: 49, // 工作流智能体
  appAccessPolicy: 50, // 应用访问策略
  attachmentDownPolicy: 51, // 附件下载策略
  customEncrypt: 52, // 自定义加密算法
  entra: 53, // Microsoft Entra
  workflowLog: 54, // 工作流日志
  vectorKnowledgeBase: 55, // 向量知识库
  aIModelAppLicenseManagement: 56, // AI模型应用授权管理
  cloudService: 57, // 云服务(统一云服务—AI 模型服务)
  printCountLimit: 58, // 打印次数限制
  appSandbox: 59, // 应用沙盒
};

/** 版本功能对应的帮助文档地址。 */
export const VersionProductHelpLink = {
  1: 'https://help.mingdao.com/application/backup-restore',
  2: 'https://help.mingdao.com/application/import-export',
  3: 'https://help.mingdao.com/integration/api',
  4: 'https://help.mingdao.com/workflow/node-call-integrated-api',
  5: 'https://help.mingdao.com/worksheet/control-api-query',
  6: 'https://help.mingdao.com/org/security',
  8: 'https://help.mingdao.com/workflow/node-code-block',
  10: 'https://help.mingdao.com/dingtalk/integration-guide',
  11: 'https://help.mingdao.com/portal/introduction',
  12: 'https://help.mingdao.com/feishu/integration-guide',
  13: 'https://help.mingdao.com/workflow/node-print-record',
  14: 'https://help.mingdao.com/workflow/node-interface-push',
  16: 'https://help.mingdao.com/application/recycle',
  17: 'https://help.mingdao.com/application/usage-analysis',
  19: 'https://help.mingdao.com/wecom/integration-note',
  20: 'https://help.mingdao.com/worksheet/word-print-template',
  21: 'https://help.mingdao.com/api/introduction',
  22: 'https://help.mingdao.com/org/security#apiproxy',
  23: 'https://help.mingdao.com/workflow/pbp',
  25: 'https://help.mingdao.com/faq/sse',
  26: 'https://help.mingdao.com/integration/data-integration',
  27: 'https://help.mingdao.com/role/extended-info',
  29: 'https://help.mingdao.com/worksheet/data-encryption',
  30: 'https://help.mingdao.com/application/exclusive-computing-power',
  31: 'https://help.mingdao.com/application/log',
  33: '',
  40: 'https://help.mingdao.com/org/payment',
  58: '',
};
