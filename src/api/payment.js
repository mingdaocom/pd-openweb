export default {
  /**
  * 获取微信授权链接
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWxAuthUrl: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Payment', 'GetWxAuthUrl', args, options);
   },
  /**
  * 获取预检生成订单信息（尚未生成订单）
返回待支付相关等信息
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.rowId 工作表纪录id
  * @param {} args.paymentModule
  * @param {string} args.productId 产品id
  * @param {string} args.licenseId 套餐id
  * @param {string} args.merchantNo 商户号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPrePayOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPrePayOrder', args, options);
   },
  /**
  * 创建订单
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.rowId 工作表纪录id
  * @param {} args.paymentModule
  * @param {string} args.productId 产品id
  * @param {string} args.licenseId 套餐id
  * @param {string} args.merchantNo 商户号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'CreateOrder', args, options);
   },
  /**
  * 支付宝支付
返回支付链接
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   aliPay: function (args, options = {}) {
     
     return mdyAPI('Payment', 'AliPay', args, options);
   },
  /**
  * 微信支付
返回支付信息以及OpenID
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单ID
  * @param {string} args.code 微信临时授权 Code
  * @param {string} args.openId 微信用户OpenId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   wechatPay: function (args, options = {}) {
     
     return mdyAPI('Payment', 'WechatPay', args, options);
   },
  /**
  * 获取订单信息
校验订单与原始数据一致性
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrder', args, options);
   },
  /**
  * 获取订单信息 商家小票展示
  * @param {Object} args 请求参数
  * @param {string} args.paymentPlatformOrderId 微信或支付宝的交易单号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderForTicket: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderForTicket', args, options);
   },
  /**
  * 获取订单状态
用于订单支付状态轮询
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderStatus: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderStatus', args, options);
   },
  /**
  * 确认支付订单
无需支付：主要针对0元及以下
若支付金额调整为大于0需支付则返回支付失败
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkPayOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'CheckPayOrder', args, options);
   },
  /**
  * 获取记录的订单信息
用于展现再记录右侧支付TAB
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.appId 应用Id
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.rowId 记录Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderForRowDetail: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderForRowDetail', args, options);
   },
  /**
  * 获取商户信息
  * @param {Object} args 请求参数
  * @param {string} args.merchantId 交易商户id
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchant: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchant', args, options);
   },
  /**
  * 获取商户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.merchantNo
  * @param {string} args.shortName
  * @param {} args.status
  * @param {} args.aliPayStatus
  * @param {} args.wechatPayStatus
  * @param {string} args.startCreateTime
  * @param {string} args.endCreateTime
  * @param {string} args.startUpdateTime
  * @param {string} args.endUpdateTime
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchantList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchantList', args, options);
   },
  /**
  * 获取商户可创建数量
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchantUsage: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchantUsage', args, options);
   },
  /**
  * 下拉框加载商户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用编号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchantsForDropdownList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchantsForDropdownList', args, options);
   },
  /**
  * 获取工作表支付配置选中的商户列表
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPaymentSettingSelectedMerchants: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPaymentSettingSelectedMerchants', args, options);
   },
  /**
  * 获取商户状态
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.projectId 组织id
  * @param {string} args.merchantId 商户ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchantStatus: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchantStatus', args, options);
   },
  /**
  * 创建商户
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo
  * @param {string} args.name
  * @param {string} args.projectId
  * @param {string} args.accountId
  * @param {} args.aliPayStatus
  * @param {} args.wechatPayStatus
  * @param {} args.status
  * @param {} args.merchantPaymentChannel
  * @param {} args.merchantPayConfigInfo
  * @param {boolean} args.needVerify
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createMerchant: function (args, options = {}) {
     
     return mdyAPI('Payment', 'CreateMerchant', args, options);
   },
  /**
  * 获取商户余额
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMerchantBanlance: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetMerchantBanlance', args, options);
   },
  /**
  * 删除商户
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.merchantId 商户Id
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteMerchant: function (args, options = {}) {
     
     return mdyAPI('Payment', 'DeleteMerchant', args, options);
   },
  /**
  * 获取订单汇总
  * @param {Object} args 请求参数
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {string} args.projectId 组织ID
  * @param {string} args.merchantNo 商户号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderSummary: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderSummary', args, options);
   },
  /**
  * 获取订单列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.orderId 订单号
  * @param {string} args.merchantOrderId 交易订单号
  * @param {string} args.merchantNo 交易商户号
  * @param {} args.sourceType
  * @param {string} args.sourceId 支付发起来源Id
  * @param {} args.sourceInfo
  * @param {string} args.description 描述信息
  * @param {} args.status
  * @param {} args.payOrderType
  * @param {string} args.startCreateTime 创建时间起始
  * @param {string} args.endCreateTime 创建时间结束
  * @param {string} args.startUpdateTime 更新时间起始
  * @param {string} args.endUpdateTime 更新时间结束
  * @param {string} args.startPaidTime 付款成功时间起始
  * @param {string} args.endPaidTime 付款成功时间结束
  * @param {string} args.startRefundTime 退款时间起始
  * @param {string} args.endRefundTime 退款时间结束
  * @param {} args.merchantPaymentChannel
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderList', args, options);
   },
  /**
  * 获取支付明细列表
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单号
  * @param {string} args.projectId 组织ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPayOrderDetailList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetPayOrderDetailList', args, options);
   },
  /**
  * 导出订单数据
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.orderId 订单号
  * @param {string} args.merchantOrderId 交易订单号
  * @param {string} args.merchantNo 交易商户号
  * @param {} args.sourceType
  * @param {string} args.sourceId 支付发起来源Id
  * @param {} args.sourceInfo
  * @param {string} args.description 描述信息
  * @param {} args.status
  * @param {} args.payOrderType
  * @param {string} args.startCreateTime 创建时间起始
  * @param {string} args.endCreateTime 创建时间结束
  * @param {string} args.startUpdateTime 更新时间起始
  * @param {string} args.endUpdateTime 更新时间结束
  * @param {string} args.startPaidTime 付款成功时间起始
  * @param {string} args.endPaidTime 付款成功时间结束
  * @param {string} args.startRefundTime 退款时间起始
  * @param {string} args.endRefundTime 退款时间结束
  * @param {} args.merchantPaymentChannel
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'ExportOrder', args, options);
   },
  /**
  * 更新支付状态根据商户id
  * @param {Object} args 请求参数
  * @param {string} args.merchantId 商户id
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.projectId 组织id
  * @param {} args.aliPayStatus
  * @param {} args.wechatPayStatus
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editMerchantPayStatus: function (args, options = {}) {
     
     return mdyAPI('Payment', 'EditMerchantPayStatus', args, options);
   },
  /**
  * 申请提现
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo 交易商户号
  * @param {number} args.amount 提现金额
  * @param {string} args.description 提现描述
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyWithDraw: function (args, options = {}) {
     
     return mdyAPI('Payment', 'ApplyWithDraw', args, options);
   },
  /**
  * 获取提现列表
  * @param {Object} args 请求参数
  * @param {string} args.withDrawId 提现订单号
  * @param {string} args.projectId 组织Id
  * @param {string} args.accountId 提现人
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.shortName 商户简称
  * @param {string} args.description 描述信息
  * @param {} args.status
  * @param {string} args.startCreateTime 创建时间起始
  * @param {string} args.endCreateTime 创建时间结束
  * @param {string} args.startUpdateTime 更新时间起始
  * @param {string} args.endUpdateTime 更新时间结束
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWithDrawList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetWithDrawList', args, options);
   },
  /**
  * 申请退款
  * @param {Object} args 请求参数
  * @param {string} args.merchantNo 交易商户号
  * @param {string} args.orderId 订单id
  * @param {string} args.merchantOrderId 交易订单号
  * @param {number} args.amount 提现金额
  * @param {number} args.taxFee 手续费
  * @param {string} args.description 提现描述
  * @param {string} args.projectId 组织id
  * @param {} args.refundSourceType
  * @param {string} args.viewId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyRefund: function (args, options = {}) {
     
     return mdyAPI('Payment', 'ApplyRefund', args, options);
   },
  /**
  * 获取退款列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.refundOrderId 退款单号
  * @param {string} args.orderId 订单号
  * @param {string} args.merchantOrderId 交易订单号
  * @param {string} args.merchantNo 交易商户号
  * @param {} args.sourceType
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
  * @param {} args.merchantPaymentChannel
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRefundOrderList: function (args, options = {}) {
     
     return mdyAPI('Payment', 'GetRefundOrderList', args, options);
   },
  /**
  * 修改退款单状态
  * @param {Object} args 请求参数
  * @param {string} args.refundOrderId 退款单号
  * @param {} args.status
  * @param {string} args.projectId
  * @param {string} args.appId
  * @param {} args.refundSourceType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editRefundOrderStatus: function (args, options = {}) {
     
     return mdyAPI('Payment', 'EditRefundOrderStatus', args, options);
   },
  /**
  * 表内检查记录是否支持付款
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.rowId 行记录Id
  * @param {string} args.appId AppId
  * @param {string} args.projectId
  * @param {string} args.viewId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkPayOrderForRowDetail: function (args, options = {}) {
     
     return mdyAPI('Payment', 'CheckPayOrderForRowDetail', args, options);
   },
  /**
  * 导出退款单数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.refundOrderId 退款单号
  * @param {string} args.orderId 订单号
  * @param {string} args.merchantOrderId 交易订单号
  * @param {string} args.merchantNo 交易商户号
  * @param {} args.sourceType
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
  * @param {} args.merchantPaymentChannel
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportRefundOrder: function (args, options = {}) {
     
     return mdyAPI('Payment', 'ExportRefundOrder', args, options);
   },
};
