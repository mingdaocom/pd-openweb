// 工作表维度 都是1开  10=显示创建按钮  11=工作表讨论  12=工作表日志  13=导入数据
// 视图都是2开头  20=分享视图  21=导出视图下记录  22=快捷操作  23=二维码打印
// 记录都是3开头  30=分享记录  31=发送填写记录  32=系统打印  33=下载附件  34=查看记录操作日志  35=记录讨论
export const listConfigStr = {
  10: _l('显示创建按钮'),
  // 工作表维度 都是1开头
  11: _l('讨论'),//工作表讨论
  12: _l('日志'),//工作表日志
  13: _l('从Excel导入数据'),
  14: _l('回收站'),
  500: _l('统计'),
  50: _l('公共'),
  51: _l('个人'),
  // 视图都是2开头
  20: _l('分享'),//视图分享
  21: _l('导出'),//视图导出
  22: _l('快捷编辑'), // quickSwitch
  25: _l('批量操作'), // BatchGroup
  24: _l('编辑'), //
  26: _l('复制'), //
  23: _l('系统默认打印'), //
  27: _l('导出'), //
  28: _l('删除'), //
  29: _l('执行自定义动作'), //
  // 记录都是3开头
  30: _l('分享'),//记录分享
  // 31: _l('发送填写记录'),
  32: _l('系统默认打印'),
  33: _l('附件下载'),
  34: _l('日志'),//记录日志
  35: _l('讨论'), // recordDiscussSwitch 记录讨论
  36: _l('复制'), // recordCopySwitch记录复制
  40: _l('系统字段'),
  41: _l('审批流转详情'),
};
export const batch = [24, 26, 23, 27, 28, 29]; //批量操作下的操作
export const statisticsConst = 500; //统计
export const statistics = [50, 51]; //统计下的操作
export const noRangeList = [25, 40, statisticsConst]; //没有范围选择
export const hasRangeList = [...batch, 10, 11, 12, 13, 14, ...statistics, 20, 21, 22, 30, 31, 32, 33, 34, 35, 36, 41]; //有作用范围
export const helfList = [10, 22, 23, 33, 32, 40]; //有帮助提示
export const listPermit = [
  10, 11, 12, 13, 14, 500, 50, 51, 20, 21, 22, 25, 24, 26, 23, 27, 28, 29, 30, 36, 35, 32, 33, 34, 40, 41,
];
export const permitList = {
  createButtonSwitch: 10, // createButtonSwitch 显示创建按钮
  discussSwitch: 11, // discussSwitch 工作表讨论
  logSwitch: 12, // logSwitch 工作表日志
  importSwitch: 13, // importSwitch 导入数据
  sheetTrash: 14, // 工作表回收站
  statisticsSwitch: 50, // 公共统计
  statisticsSelfSwitch: 51, // 个人统计
  viewShareSwitch: 20, // viewShareSwitch 分享视图
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
  // recordWriteSwitch: 31, // recordWriteSwitch 发送填写记录
  recordPrintSwitch: 32, // recordPrintSwitch 系统打印
  recordAttachmentSwitch: 33, // recordAttachmentSwitch 下载附件
  recordLogSwitch: 34, // recordLogSwitch 查看记录操作日志
  recordDiscussSwitch: 35, // recordDiscussSwitch 记录讨论
  recordCopySwitch: 36, // 记录复制
  sysControlSwitch: 40, // 系统字段
  approveDetailsSwitch: 41, // 审批流转详情
};

export const MODULE_TYPE_TO_NAME = {
  submitForm: _l('提交表单'),
  alias: _l('数据名称'),
  display: _l('业务规则'),
  validationBox: _l('验证规则'),
  printTemplate: _l('打印模板'),
  functionalSwitch: _l('功能开关'),
  customBtn: _l('自定义动作'),
  indexSetting: _l('检索加速'),
};

export const SUBMIT_NEXT_ACTION_LIST = [
  {
    value: '1',
    text: _l('关闭弹层'),
  },
  {
    value: '2',
    text: _l('继续创建下一条'),
  },
  {
    value: '3',
    text: _l('打开刚刚创建的记录'),
  },
];
