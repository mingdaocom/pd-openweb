import _ from 'lodash';
const enumObj = obj => {
  _.keys(obj).forEach(key => (obj[obj[key]] = key));
  return obj;
};
export const orderRecordType = enumObj({
  SMS: 1, // 短信发送
  ReCharge: 2, // 充值
  Upgrade: 3, // 开通标准版
  MemberPackage: 4, // 购买用户包
  AppBill: 5, // 应用账单(手动支付)
  AppBillAutoPay: 6, // 应用账单(自动支付)
  AppReturnMoney: 7, // 应用账单(归还扣款)
  DayPackage: 8, // 天数包
  OAPackage: 9, // OA
  UpgradeEnterpriseAndOA: 10, // 升级到标准版+OA
  ApprovePackage: 11, // 购买审批
  EnterpriseAndApprove: 12, // 标准版+审批
  Enterprise: 13, // 专业版
  Ultimate: 14, // 旗舰版
  EMAIL: 15, // 邮件发送
  APK: 16, // 应用拓展包
  WORKFLOW: 17, // 每月工作流拓展包
  WORKFLOWMONTHLY: 18, // 当月工作流扩展包
  APKSTORAGE: 19, //应用上传量
  OCR: 20, //文字识别
  EXTERNALUSER: 21, // 外部用户增补包
  DataPipelinePackage: 22,
  MonthlyDataPipelinePackage: 23,
  APIIntegration: 24,
  ComputingInstance: 25,
  MonthlyComputingInstance: 26,
  FileTransferPDF: 27,
  AggregationTable: 28,
  AIGC: 29,
});

export const orderTypeText = {
  SMS: _l('短信发送'),
  ReCharge: _l('充值'),
  Upgrade: _l('开通标准版'),
  MemberPackage: _l('用户增补包'),
  AppBill: _l('应用账单(手动支付)'), // 应用账单(手动支付)
  AppBillAutoPay: _l('应用账单(自动支付)'), // 应用账单(自动支付)
  AppReturnMoney: _l('应用账单(归还扣款)'), // 应用账单(归还扣款)
  DayPackage: _l('天数包'), // 天数包
  OAPackage: _l('OA'), // OA
  UpgradeEnterpriseAndOA: _l('升级到标准版+OA'), // 升级到标准版+OA
  ApprovePackage: _l('购买审批'), // 购买审批
  EnterpriseAndApprove: _l('标准版+审批'), // 标准版+审批
  Enterprise: _l('专业版'), // 专业版
  Ultimate: _l('旗舰版'), // 旗舰版
  EMAIL: _l('邮件发送'), // 邮件发送
  APK: _l('应用拓展包'), // 应用拓展包
  WORKFLOW: _l('每月工作流扩充包'), // 每月工作流拓展包
  WORKFLOWMONTHLY: _l('当月工作流扩充包'), // 当月工作流扩展包
  APKSTORAGE: _l('应用附件上传量扩充包'), //应用上传量
  OCR: _l('文字识别'), //文字识别
  EXTERNALUSER: _l('外部用户增补包'), // 外部用户增补包
  DataPipelinePackage: _l('每月数据同步算力包'),
  MonthlyDataPipelinePackage: _l('当月数据同步算力包'),
  APIIntegration: _l('API集成'),
  ComputingInstance: _l('专属算力组织到期时长包'),
  MonthlyComputingInstance: _l('专属算力单月包'),
  FileTransferPDF: _l('获取打印记录文件生成PDF文件'),
  AggregationTable: _l('聚合表数量购买'),
  AIGC: 'AIGC',
};

export const enumInvoiceStatus = enumObj({
  empty: 0,
  notApply: 1, // 未申请
  applied: 2, // 已申请
  invoiced: 3, // 已开票
});

export const invoiceTypeText = {
  empty: _l('无需开票'),
  notApply: _l('未申请'),
  applied: _l('已申请'),
  invoiced: _l('已开票'),
};

export const orderRecordStatus = {
  waiting: 1, // 等待支付
  success: 2, // 交易成功
  failure: 3, // 交易失败
  cancel: 4, // 取消订单
  overdue: 5, // 订单已取消
  // troubling: 6, // 质疑中
};

export const orderRecordText = {
  waiting: _l('等待支付'),
  success: _l('交易成功'),
  failure: _l('交易失败'),
  cancel: _l('取消订单'),
  overdue: _l('订单已取消'),
  // troubling: _l('质疑中'),
};

export const orderRecordStatusDropdownData = [{ value: 0, text: _l('全部') }].concat(
  _.keys(orderRecordStatus).map(item => ({ value: orderRecordStatus[item], text: orderRecordText[item] })),
);

export const enumOrderRecordStatus = enumObj(orderRecordStatus);

export const PAID_RECORD_TYPE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 28];
export const RECHARGE_RECORD_TYPE = [1, 15, 20, 24, 27, 29];

export const invoiceConfig = [
  { key: 'taxNumber', text: _l('税务登记号'), require: true },
  { key: 'address', text: _l('邮寄地址'), require: true },
  { key: 'recipientName', text: _l('发票接收人'), half: true, require: true },
  { key: 'postcode', text: _l('邮编'), verify: /^\d+$/, half: true, require: true },
  { key: 'contactPhone', text: _l('电话'), verify: /^\d+\-?\d+$/, half: true, require: true },
  { key: 'mobilePhone', text: _l('手机'), verify: /^\d+$/, half: true, require: true },
  {
    key: 'email',
    text: _l('Email地址'),
    verify: /^(\w+)(\.\w+)*@(\w+)(\.\w+)*.(\w+)$/i,
    half: true,
    require: true,
  },
  { key: 'emailRecipientName', text: _l('Email收件人'), half: true, require: true },
  { key: 'fax', text: _l('传真') },
];

export const applyInvoiceConfig = [
  { key: 'companyName', text: _l('发票抬头') },
  { key: 'price', text: _l('发票金额') },
  { key: 'taxNumber', text: _l('税务登记号') },
  { key: 'address', text: _l('邮寄地址') },
  { key: 'recipientName', text: _l('发票接收人') },
  { key: 'contactPhone', text: _l('联系电话'), verify: /^\d+$/ },
];

export const newInvoiceConfig = [
  { key: 'taxBank', text: _l('开户行'), require: true },
  { key: 'taxBankNumber', text: _l('账号'), require: true },
  { key: 'taxRegAddress', text: _l('注册地址'), require: true },
  { key: 'taxRegContactPhone', text: _l('注册电话'), verify: /^\d+\-?\d+$/, require: true },
];

export const DATE_FILTER = [
  { id: 'today', text: _l('今天') },
  { id: 'currentWeek', text: _l('最近七天') },
  { id: 'currentMonth', text: _l('本月') },
  { id: 'prevMonth', text: _l('上月') },
  { id: 'custom', text: _l('自定义日期') },
];
