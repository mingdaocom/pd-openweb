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

// 版本功能类型
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
  dataIntegrationETL: 26, // 数据集成ETL
  userExtensionInformation: 27, // 用户扩展信息
  batchDownloadFiles: 28, // 批量下载文件
  dataEnctypt: 29, // 数据加密
  exclusiveResource: 30, // 专属隔离计算实例资源
  glabalLog: 31, // 全局日志
  globalBehaviorLog: 32, // 全局行为日志
  globalVariable: 33, // 全局变量
  waterMark: 34, // 附件水印
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
  editProtect: 46, //编辑保护
  quota: 47, // 额度管理
  worldMap: 48, // 统计图，世界地图
  workflowAgent: 49, // 工作流智能体
};

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
};

export const FAST_GPT_CONFIG = JSON.parse(
  atob(
    'eyJiYXNlVXJsIjoiaHR0cHM6Ly9hcGkuZmFzdGdwdC5pbi9hcGkiLCJhcHBJZCI6IjY2ODY0MDFhZDA5Nzg2YWQ0Y2Y1YWYzYiIsImFwaUtleSI6ImZhc3RncHQtZ2xSVWdHNzdCd0wyZjZEUDhQMzFSenJ2WE9DRkRxTWxTOHNmcWlwZzRKY0t6bTc5ODRGU1JURHVlUVYifQ==',
  ),
);

export const AI_FEATURE_TYPE = {
  CREATE_SHEET: 1, // 创建工作表
  CREATE_RECORD: 2, // 创建记录
  CODEGEN_TABLE_FIELDS: 3, // 生成代码（工作表自定义字段）
  CODEGEN_WORKFLOW_NODE: 4, // 生成代码（工作流代码块节点）
  PROMPT_FOR_AGENT_NODE: 5, // 生成提示词（工作流智能体节点）
  SAMPLE_DATA: 6, // 生成示例数据
  I18N_APP: 7, // 应用多语言翻译
  AGENT_SMART_PICK: 8, // agent 智能选择模型
  GENERATE_APP_SHEET_DESCRIPTION: 9, // 生成应用/工作表描述
  MISC_HELPERS: 10, // 其他辅助功能
};
