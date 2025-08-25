/**
 * [Common 账务中心公用模块]
 * @type {Object}
 */
var Common = {};
/**
 * [respEnum ajax 响应枚举]
 * @type {Object}
 */
Common.respEnum = {
  success: 1000, //成功
  fail: 1001, //失败（不指定失败原因）
  isNotAdmin: 1002, //不是管理员
  isNotUser: 1003, //不存在用户
  reqOpIsNull: 1004, //请求关键字为空
  primaryKeyIsNull: 1005, //必要关键字为空
  servNotSupport: 1006, //请求操作当前服务不支持
  orderRecordTypeIsNull: 1007, //订单类型为空
};
/**
 * [orderRecordType 消费记录类型]
 * @type {Object}
 */
Common.orderRecordType = {
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
  WORKFLOW: 17, // 工作流拓展包
};
/**
 * chargeTypes
 * @type {int[]}
 */
Common.CHARGETPYES = [Common.orderRecordType.ReCharge, Common.orderRecordType.AppReturnMoney];
/**
 * paymentTypes
 * @type {int[]}
 */
Common.PAYMENTTYPES = [
  Common.orderRecordType.SMS,
  Common.orderRecordType.Upgrade,
  Common.orderRecordType.MemberPackage,
  Common.orderRecordType.AppBill,
  Common.orderRecordType.AppBillAutoPay,
  Common.orderRecordType.DayPackage,
  Common.orderRecordType.OAPackage,
  Common.orderRecordType.UpgradeEnterpriseAndOA,
  Common.orderRecordType.ApprovePackage,
  Common.orderRecordType.EnterpriseAndApprove,
  Common.orderRecordType.Enterprise,
  Common.orderRecordType.Ultimate,
  Common.orderRecordType.EMAIL,
  Common.orderRecordType.APK,
  Common.orderRecordType.WORKFLOW,
];

Common.getOrderRecordTypeStr = function (input) {
  var result = '';

  switch (parseInt(input)) {
    case Common.orderRecordType.SMS:
      result = _l('短信发送');
      break;
    case Common.orderRecordType.ReCharge:
      result = _l('充值');
      break;
    case Common.orderRecordType.Upgrade:
      result = _l('开通标准版');
      break;
    case Common.orderRecordType.MemberPackage:
      result = _l('购买用户包');
      break;
    case Common.orderRecordType.AppBill:
      result = _l('应用账单(手动支付)');
      break;
    case Common.orderRecordType.AppBillAutoPay:
      result = _l('应用账单(自动支付)');
      break;
    case Common.orderRecordType.AppReturnMoney:
      result = _l('应用账单(归还扣款)');
      break;
    case Common.orderRecordType.DayPackage:
      result = _l('一天包');
      break;
    case Common.orderRecordType.OAPackage:
      result = _l('开通OA');
      break;
    case Common.orderRecordType.UpgradeEnterpriseAndOA:
      result = _l('开通标准版+OA');
      break;
    case Common.orderRecordType.ApprovePackage:
      result = _l('开通审批');
      break;
    case Common.orderRecordType.EnterpriseAndApprove:
      result = _l('开通标准版+审批');
      break;
    case Common.orderRecordType.Enterprise:
      result = _l('开通专业版');
      break;
    case Common.orderRecordType.Ultimate:
      result = _l('开通旗舰版');
      break;
    case Common.orderRecordType.EMAIL:
      result = _l('邮件发送');
      break;
    case Common.orderRecordType.APK:
      result = _l('购买应用拓展包');
      break;
    case Common.orderRecordType.WORKFLOW:
      result = _l('购买工作流拓展包');
      break;
    default:
      break;
  }

  return result;
};

Common.invoiceStatus = {
  notApply: 1, //未申请
  applied: 2, //已申请
  invoiced: 3, //已开票
};

Common.getInvoiceStatusStr = function (input) {
  var result = '';

  switch (parseInt(input)) {
    case Common.invoiceStatus.notApply:
      result = _l('未申请');
      break;
    case Common.invoiceStatus.applied:
      result = _l('已申请');
      break;
    case Common.invoiceStatus.invoiced:
      result = _l('已开票');
      break;
    default:
      break;
  }

  return result;
};
/**
 * [orderRecordStatus 订单状态]
 * @type {Object}
 */
Common.orderRecordStatus = {
  wating: 1, //等待支付
  success: 2, //交易成功
  failure: 3, //交易失败
  cancel: 4, //取消订单
  overdue: 5, //订单已取消
  troubling: 6, //质疑中
};
Common.getStatusStr = function (input) {
  var result = '';

  switch (parseInt(input)) {
    case Common.orderRecordStatus.wating:
      result = _l('等待支付');
      break;
    case Common.orderRecordStatus.success:
      result = _l('交易成功');
      break;
    case Common.orderRecordStatus.failure:
      result = _l('交易失败');
      break;
    case Common.orderRecordStatus.cancel:
      result = _l('取消订单');
      break;
    case Common.orderRecordStatus.overdue:
      result = _l('订单已取消');
      break;
    case Common.orderRecordStatus.troubling:
      result = _l('质疑中');
      break;
    default:
      break;
  }

  return result;
};

export default Common;
