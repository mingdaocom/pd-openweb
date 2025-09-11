export default {
  /**
   * 创建订单
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.licenseId 套餐id
   * @param {string} args.productId 产品id
   * @param {} args.productType
   * @param {integer} args.personCount 订阅人数
   * @param {} args.environmentType
   * @param {} args.buyTypeEnum
   * @param {string} args.purchaseRecordId 购买记录id
   * @param {boolean} args.isTrial 先试用后购买
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createOrder: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'CreateOrder', args, options);
  },
  /**
   * 获取订单汇总
   * @param {Object} args 请求参数
   * @param {string} args.startConfirmTime 开始时间
   * @param {string} args.endConfirmTime 结束时间
   * @param {string} args.productId 商品Id
   * @param {string} args.orderId 订单Id
   * @param {} args.productType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPayOrderSummary: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetPayOrderSummary', args, options);
  },
  /**
   * 获取平台汇总
   * @param {Object} args 请求参数
   * @param {string} args.startPaidTime 开始支付时间
   * @param {string} args.endPaidTime 结束支付时间
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.orderId 订单Id
   * @param {} args.productType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPlatformTaxSummary: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetPlatformTaxSummary', args, options);
  },
  /**
   * 获取订单列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.orderId
   * @param {string} args.merchantOrderId
   * @param {string} args.description
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.startPaidTime
   * @param {string} args.endPaidTime
   * @param {string} args.startRefundTime
   * @param {string} args.endRefundTime
   * @param {string} args.startConfirmTime
   * @param {string} args.endConfirmTime
   * @param {} args.getOrderSource
   * @param {} args.buyType
   * @param {string} args.productId
   * @param {} args.productType
   * @param {} args.paidType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPayOrderList: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetPayOrderList', args, options);
  },
  /**
   * 获取应用市场订单确认页信息
   * @param {Object} args 请求参数
   * @param {string} args.orderId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOrderConfirmInfo: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetOrderConfirmInfo', args, options);
  },
  /**
   * 根据购买记录检查是否已存在待支付的订单
   * @param {Object} args 请求参数
   * @param {string} args.purchaseRecordId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkUnpayOrderByPurchaseRecordId: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'CheckUnpayOrderByPurchaseRecordId', args, options);
  },
  /**
   * 导出买家中心交易流水
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.orderId
   * @param {string} args.merchantOrderId
   * @param {string} args.description
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.startPaidTime
   * @param {string} args.endPaidTime
   * @param {string} args.startRefundTime
   * @param {string} args.endRefundTime
   * @param {string} args.startConfirmTime
   * @param {string} args.endConfirmTime
   * @param {} args.getOrderSource
   * @param {} args.buyType
   * @param {string} args.productId
   * @param {} args.productType
   * @param {} args.paidType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportBuyerCenterOrder: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ExportBuyerCenterOrder', args, options);
  },
  /**
   * 导出开发者交易流水
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.orderId
   * @param {string} args.merchantOrderId
   * @param {string} args.description
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.startPaidTime
   * @param {string} args.endPaidTime
   * @param {string} args.startRefundTime
   * @param {string} args.endRefundTime
   * @param {string} args.startConfirmTime
   * @param {string} args.endConfirmTime
   * @param {} args.getOrderSource
   * @param {} args.buyType
   * @param {string} args.productId
   * @param {} args.productType
   * @param {} args.paidType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportDeveloperCenterOrder: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ExportDeveloperCenterOrder', args, options);
  },
  /**
   * 导出运营中心交易流水
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.orderId
   * @param {string} args.merchantOrderId
   * @param {string} args.description
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.startPaidTime
   * @param {string} args.endPaidTime
   * @param {string} args.startRefundTime
   * @param {string} args.endRefundTime
   * @param {string} args.startConfirmTime
   * @param {string} args.endConfirmTime
   * @param {} args.getOrderSource
   * @param {} args.buyType
   * @param {string} args.productId
   * @param {} args.productType
   * @param {} args.paidType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportOperationsCenterOrder: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ExportOperationsCenterOrder', args, options);
  },
  /**
   * 确认或取消订单
   * @param {Object} args 请求参数
   * @param {string} args.orderId
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPayOrderStatus: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'EditPayOrderStatus', args, options);
  },
  /**
   * 获取提现列表
   * @param {Object} args 请求参数
   * @param {string} args.withdrawId
   * @param {string} args.accountId
   * @param {string} args.description
   * @param {} args.status
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {} args.withdrawType
   * @param {} args.getOrderSource
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWithDrawList: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetWithDrawList', args, options);
  },
  /**
   * 获取开发者提现汇总
   * @param {Object} args 请求参数
   * @param {} args.getOrderSource
   * @param {} args.withdrawType
   * @param {string} args.withdrawId 提现订单号
   * @param {} args.status
   * @param {string} args.startCreateTime 创建时间起始
   * @param {string} args.endCreateTime 创建时间结束
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWithdrawSummary: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetWithdrawSummary', args, options);
  },
  /**
   * 申请提现
   * @param {Object} args 请求参数
   * @param {number} args.amount 提现金额
   * @param {number} args.taxAmount 提现金额手续费
   * @param {string} args.description 提现描述
   * @param {} args.withdrawType
   * @param {string} args.payeeAcctName 收款人姓名
   * @param {string} args.payeeAcctNo 账户人账户号
   * @param {string} args.bankCode 银行总行联行号
   * @param {string} args.bankName 银行名称
   * @param {string} args.invoice 发票地址
   * @param {string} args.sellerName 销售方名称
   * @param {string} args.buyerName 购买方名称
   * @param {number} args.totalInvoiceAmount 发票总金额
   * @param {string} args.invoiceTime 开票时间
   * @param {string} args.identificationNumber 纳税人识别号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  applyWithDraw: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ApplyWithDraw', args, options);
  },
  /**
   * 确认打款
   * @param {Object} args 请求参数
   * @param {array} args.withdrawIds 提现订单号
   * @param {} args.withdrawType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  confirmWithdraw: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ConfirmWithdraw', args, options);
  },
  /**
   * 取消提现
   * @param {Object} args 请求参数
   * @param {string} args.withdrawId 提现订单号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  cancelWithdraw: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'CancelWithdraw', args, options);
  },
  /**
   * 手动更新提现状态
   * @param {Object} args 请求参数
   * @param {string} args.withdrawId 提现订单号
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWithdrawStatus: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'UpdateWithdrawStatus', args, options);
  },
  /**
   * 同步民生银行提现单状态
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  synchronizeBankStatus: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'SynchronizeBankStatus', args, options);
  },
  /**
   * 导出提现流水
   * @param {Object} args 请求参数
   * @param {string} args.withdrawId
   * @param {string} args.accountId
   * @param {string} args.description
   * @param {} args.status
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {} args.withdrawType
   * @param {} args.getOrderSource
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportWithdraws: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ExportWithdraws', args, options);
  },
  /**
   * 获取应用市场系统配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMarketplaceConfig: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetMarketplaceConfig', args, options);
  },
  /**
   * 发票识别
   * @param {Object} args 请求参数
   * @param {string} args.url 图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性。
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  vatInvoiceOCR: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'VatInvoiceOCR', args, options);
  },
  /**
   * 营业执照识别
   * @param {Object} args 请求参数
   * @param {string} args.url 图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性。
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  bizLicenseOCR: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'BizLicenseOCR', args, options);
  },
  /**
   * 身份证识别
   * @param {Object} args 请求参数
   * @param {string} args.url 图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性。
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  iDCardOCR: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'IDCardOCR', args, options);
  },
  /**
   * 智能结构化识别
   * @param {Object} args 请求参数
   * @param {string} args.url 图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性。
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  smartStructuralOCR: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'SmartStructuralOCR', args, options);
  },
  /**
   * 授权应用退款
   * @param {Object} args 请求参数
   * @param {string} args.id 主键
   * @param {string} args.description 退款备注
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  tradeRefund: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'TradeRefund', args, options);
  },
  /**
   * 获取退款列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {string} args.refundOrderId 退款单号
   * @param {string} args.orderId 订单号
   * @param {string} args.merchantOrderId 交易订单号
   * @param {string} args.merchantNo 交易商户号
   * @param {} args.getOrderSource
   * @param {} args.sourceInfo
   * @param {string} args.description 描述信息
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.accountId 退款账户
   * @param {string} args.startCreateTime 创建时间起始
   * @param {string} args.endCreateTime 创建时间结束
   * @param {string} args.startRefundTime 退款时间起始
   * @param {string} args.endRefundTime 退款时间结束
   * @param {string} args.operatorAccountId 操作用户
   * @param {} args.productType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRefundList: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetRefundList', args, options);
  },
  /**
   * 导出退款流水
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {string} args.refundOrderId 退款单号
   * @param {string} args.orderId 订单号
   * @param {string} args.merchantOrderId 交易订单号
   * @param {string} args.merchantNo 交易商户号
   * @param {} args.getOrderSource
   * @param {} args.sourceInfo
   * @param {string} args.description 描述信息
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.accountId 退款账户
   * @param {string} args.startCreateTime 创建时间起始
   * @param {string} args.endCreateTime 创建时间结束
   * @param {string} args.startRefundTime 退款时间起始
   * @param {string} args.endRefundTime 退款时间结束
   * @param {string} args.operatorAccountId 操作用户
   * @param {} args.productType
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportRefundOrders: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ExportRefundOrders', args, options);
  },
  /**
   * 单笔退款
   * @param {Object} args 请求参数
   * @param {string} args.orderId 订单id
   * @param {string} args.description
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  applyRefund: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'ApplyRefund', args, options);
  },
  /**
   * 获取退款汇总
   * @param {Object} args 请求参数
   * @param {string} args.refundOrderId 退款单号
   * @param {string} args.orderId 订单号
   * @param {} args.status
   * @param {} args.payOrderType
   * @param {string} args.startCreateTime 创建时间起始
   * @param {string} args.endCreateTime 创建时间结束
   * @param {string} args.startRefundTime 退款时间起始
   * @param {string} args.endRefundTime 退款时间结束
   * @param {} args.getOrderSource
   * @param {} args.productType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRefundSummary: function (args, options = {}) {
    return mdyAPI('MarketplacePayment', 'GetRefundSummary', args, options);
  },
};
