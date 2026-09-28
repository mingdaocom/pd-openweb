// 事件
export const ADD_EVENT_ENUM = {
  CHANGE: '1',
  SHOW: '2',
  HIDE: '3',
  FOCUS: '4',
  BLUR: '5',
  CLICK: '6',
};

// 有字段值样式设置的控件
export const HAVE_VALUE_STYLE_WIDGET = [2, 3, 4, 5, 6, 7, 8, 15, 16, 19, 23, 24, 25, 31, 32, 33, 37, 38, 46, 53];

/** 关联记录显示类型 */
export const RELATE_RECORD_SHOW_TYPE = {
  CARD: 1,
  LIST: 2, // 老列表，后面选不了了
  DROPDOWN: 3,
  TABLE: 5,
  TAB_TABLE: 6,
};

/** 关联查询显示类型 */
export const RELATION_SEARCH_SHOW_TYPE = {
  CARD: 1,
  LIST: 2,
  TEXT: 3,
  EMBED_LIST: 5,
  TAB_LIST: 6,
};

export const worksheetSwitch = [10, 11, 13, 14, 500, 50, 51]; //工作表相关
export const viewSwitch = [20, 38, 21, 22, 25, 24, 26, 23, 27, 28, 29]; //视图相关
export const recordSwitch = [30, 52, 36, 39, 37, 35, 32, 33, 34]; //记录相关
export const approveSwitch = [40, 41]; //审批相关
export const allSwitchKeys = [
  ...worksheetSwitch.filter(o => o !== 500),
  ...viewSwitch,
  ...recordSwitch,
  ...approveSwitch,
  // 角色操作权限，仅用于兼容、归一化工作表接口返回的 switches，不在功能开关界面展示
  1001,
  1002,
];

export const permitList = {
  createButtonSwitch: 10, // createButtonSwitch 显示创建按钮
  discussSwitch: 11, // discussSwitch 工作表讨论
  importSwitch: 13, // importSwitch 导入数据
  sheetTrash: 14, // 工作表回收站
  statisticsSwitch: 50, // 公共统计
  statisticsSelfSwitch: 51, // 个人统计
  filterSwitch: 1001, // 筛选操作权限
  statsSwitch: 1002, // 统计操作权限
  viewShareSwitch: 20, // viewShareSwitch 分享视图
  internalAccessLink: 38, // 内部访问链接
  viewExportSwitch: 21, // viewExportSwitch	导出视图下记录
  quickSwitch: 22, // quickSwitch	 快捷操作
  batchGroup: 25, //BatchGroup 批量操作
  batchEdit: 24, //	 批量编辑
  copy: 26, //复制
  QrCodeSwitch: 23, // 	 系统默认打印
  export: 27, // 	 导出
  delete: 28, // 	 删除
  execute: 29, // 	 执行自定义动作
  recordShareSwitch: 30, // recordShareSwitch 分享记录
  embeddedLink: 52, //嵌入链接
  // recordWriteSwitch: 31, // recordWriteSwitch 发送填写记录
  recordPrintSwitch: 32, // recordPrintSwitch 系统打印
  recordAttachmentSwitch: 33, // recordAttachmentSwitch 下载附件
  recordLogSwitch: 34, // recordLogSwitch 查看记录操作日志
  recordDiscussSwitch: 35, // recordDiscussSwitch 记录讨论
  recordCopySwitch: 36, // 记录复制
  recordDelete: 39, //记录 删除
  recordRecreateSwitch: 37, // 记录重新创建
  sysControlSwitch: 40, // 系统字段
  approveDetailsSwitch: 41, // 审批流转详情
};
