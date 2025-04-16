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

export const DEFAULT_TEXT = {
  1: [
    { key: '1', value: _l('开启') },
    { key: '0', value: _l('关闭') },
  ],
  2: [
    { key: '1', value: _l('是%04015') },
    { key: '0', value: _l('否') },
  ],
};

/** 关联记录显示类型 */
export const RELATE_RECORD_SHOW_TYPE = {
  CARD: 1,
  LIST: 2, // 老列表，后面选不了了
  DROPDOWN: 3,
  TABLE: 5,
  TAB_TABLE: 6,
};

/** 关联记录显示类型 */
export const RELATION_SEARCH_SHOW_TYPE = {
  CARD: 1,
  LIST: 2,
  TEXT: 3,
  EMBED_LIST: 5,
  TAB_LIST: 6,
};

export const RECORD_INFO_FROM = {
  WORKSHEET: 1,
  WORKSHEET_ROW_LAND: 2,
  CHAT: 3,
  WORKFLOW: 4,
  DRAFT: 21,
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
];

// 控件和后端类型的对应关系
export const WIDGETS_TO_API_TYPE_ENUM = {
  TEXT: 2,
  MOBILE_PHONE: 3,
  TELEPHONE: 4,
  EMAIL: 5,
  NUMBER: 6,
  CRED: 7,
  MONEY: 8,
  FLAT_MENU: 9,
  MULTI_SELECT: 10,
  DROP_DOWN: 11,
  ATTACHMENT: 14,
  DATE: 15,
  DATE_TIME: 16,
  AREA_PROVINCE: 19,
  RELATION: 21,
  SPLIT_LINE: 22,
  AREA_CITY: 23,
  AREA_COUNTY: 24,
  MONEY_CN: 25,
  USER_PICKER: 26,
  DEPARTMENT: 27,
  SCORE: 28,
  RELATE_SHEET: 29,
  SHEET_FIELD: 30,
  FORMULA_NUMBER: 31,
  CONCATENATE: 32,
  AUTO_ID: 33,
  SUB_LIST: 34,
  CASCADER: 35,
  SWITCH: 36,
  SUBTOTAL: 37,
  FORMULA_DATE: 38,
  LOCATION: 40,
  RICH_TEXT: 41,
  SIGNATURE: 42,
  OCR: 43,
  EMBED: 45,
  TIME: 46,
  BAR_CODE: 47,
  ORG_ROLE: 48,
  SEARCH_BTN: 49,
  SEARCH: 50,
  RELATION_SEARCH: 51,
  SECTION: 52,
  FORMULA_FUNC: 53,
  CUSTOM: 54,
  REMARK: 10010,
  // 特殊异化控件：呈现type异化，实际保存type跟老控件一致
  INTERNATIONAL_AREA: 90000,
};

export const permitList = {
  createButtonSwitch: 10, // createButtonSwitch 显示创建按钮
  discussSwitch: 11, // discussSwitch 工作表讨论
  importSwitch: 13, // importSwitch 导入数据
  sheetTrash: 14, // 工作表回收站
  statisticsSwitch: 50, // 公共统计
  statisticsSelfSwitch: 51, // 个人统计
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

export const UNIT_TO_TEXT = {
  1: _l('分%04023'),
  2: _l('时%04022'),
  3: _l('天%04021'),
  4: _l('月%04020'),
  5: _l('年%04019'),
  6: _l('秒%04024'),
};
