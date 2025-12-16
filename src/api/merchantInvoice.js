export default {
  /**
   * 创建税号信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {string} args.companyName 认证企业名称
   * @param {string} args.taxNo 认证企业税号
   * @param {string} args.email 邮箱
   * @param {string} args.taxId 税号信息标识 不传新增 传值更新
   * @param {} args.merchantTaxInfoConfig
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createTaxInfo: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'CreateTaxInfo', args, options);
  },
  /**
   * 更新税号信息渠道密码
   * @param {Object} args 请求参数
   * @param {string} args.taxNo 认证企业税号
   * @param {string} args.account 渠道账号
   * @param {string} args.password 渠道密码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateTaxInfoChannelPassword: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'UpdateTaxInfoChannelPassword', args, options);
  },
  /**
   * 获取税号信息
   * @param {Object} args 请求参数
   * @param {string} args.taxNo 开票税号
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaxInfo: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetTaxInfo', args, options);
  },
  /**
   * 校验税号是否存在
   * @param {Object} args 请求参数
   * @param {string} args.taxNo 开票税号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkTaxInfo: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'CheckTaxInfo', args, options);
  },
  /**
   * 获取税号可创建数量
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoiceInfoUsage: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetInvoiceInfoUsage', args, options);
  },
  /**
   * 上传商品数据
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taxNo 开票税号
   * @param {string} args.url 文件地址
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  uploadProductExcel: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'UploadProductExcel', args, options);
  },
  /**
   * 获取税号信息列表
   * @param {Object} args 请求参数
   * @param {string} args.taxNo
   * @param {string} args.companyName
   * @param {string} args.projectId
   * @param {string} args.email
   * @param {} args.status
   * @param {string} args.startCreateTime
   * @param {string} args.endCreateTime
   * @param {string} args.operator
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaxInfoList: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetTaxInfoList', args, options);
  },
  /**
   * 下拉框加载税号信息列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaxInfoForDropdownList: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetTaxInfoForDropdownList', args, options);
  },
  /**
   * 获取商品列表
   * @param {Object} args 请求参数
   * @param {string} args.taxNo 开票税号
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoiceProducts: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetInvoiceProducts', args, options);
  },
  /**
   * 获取商品列表(只返回分类简称和分类编码)
   * @param {Object} args 请求参数
   * @param {string} args.taxNo 开票税号
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSimpleInvoiceProducts: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetSimpleInvoiceProducts', args, options);
  },
  /**
   * 创建开票订单
   * @param {Object} args 请求参数
   * @param {} args.invoiceOutputType
   * @param {string} args.invoiceTitle 发票抬头
   * @param {string} args.taxPayerNo 被开票方税号
   * @param {} args.invoiceType
   * @param {string} args.orderId 支付单号
   * @param {string} args.email email 发送邮件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  create: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'Create', args, options);
  },
  /**
   * 确认开票
   * @param {Object} args 请求参数
   * @param {string} args.orderId 开票单号
   * @param {string} args.productId 开票类目
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  confirmInvoice: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'ConfirmInvoice', args, options);
  },
  /**
   * 开票测试
   * @param {Object} args 请求参数
   * @param {string} args.orderId 开票单号
   * @param {string} args.productId 开票类目
   * @param {string} args.email 邮箱
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  testInvoice: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'TestInvoice', args, options);
  },
  /**
   * 取消开票
   * @param {Object} args 请求参数
   * @param {string} args.orderId 支付订单号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  cancelInvoice: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'CancelInvoice', args, options);
  },
  /**
   * 校验退款是否需要取消开票 前端提示
   * @param {Object} args 请求参数
   * @param {string} args.orderId
   * @param {number} args.refundAmount
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  isTipsForRefund: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'IsTipsForRefund', args, options);
  },
  /**
   * 获取开票订单列表
   * @param {Object} args 请求参数
   * @param {string} args.invoiceId
   * @param {string} args.projectId
   * @param {string} args.invoiceNo
   * @param {} args.invoiceOutputType
   * @param {string} args.startCreateTime
   * @param {string} args.taxNo
   * @param {string} args.taxPayerNo
   * @param {} args.status
   * @param {} args.invoiceType
   * @param {number} args.price
   * @param {number} args.taxRate
   * @param {string} args.endCreateTime
   * @param {string} args.startInvoiceTime
   * @param {string} args.endInvoiceTime
   * @param {string} args.invoiceUrl
   * @param {string} args.operator
   * @param {string} args.orderId
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.invoiceTitle
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoiceList: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetInvoiceList', args, options);
  },
  /**
   * 获取开票订单详情
   * @param {Object} args 请求参数
   * @param {string} args.orderId 支付订单号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoice: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetInvoice', args, options);
  },
  /**
   * 获取开票订单汇总
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taxNo 开票税号
   * @param {string} args.invoiceTitle 发票抬头
   * @param {string} args.invoiceId 开票单号
   * @param {} args.status
   * @param {string} args.orderId 支付单号
   * @param {string} args.startCreateTime 创建时间起
   * @param {string} args.endCreateTime 创建时间止
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoiceSummary: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'GetInvoiceSummary', args, options);
  },
  /**
   * 模糊查询企业信息
   * @param {Object} args 请求参数
   * @param {string} args.keyword 关键字
   * @param {string} args.orderId 订单id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  companySearch: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'CompanySearch', args, options);
  },
  /**
   * 主动同步百望开票状态
   * @param {Object} args 请求参数
   * @param {string} args.orderId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  syncInvoice: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'SyncInvoice', args, options);
  },
  /**
   * 导出开票数据
   * @param {Object} args 请求参数
   * @param {string} args.invoiceId
   * @param {string} args.projectId
   * @param {string} args.invoiceNo
   * @param {} args.invoiceOutputType
   * @param {string} args.startCreateTime
   * @param {string} args.taxNo
   * @param {string} args.taxPayerNo
   * @param {} args.status
   * @param {} args.invoiceType
   * @param {number} args.price
   * @param {number} args.taxRate
   * @param {string} args.endCreateTime
   * @param {string} args.startInvoiceTime
   * @param {string} args.endInvoiceTime
   * @param {string} args.invoiceUrl
   * @param {string} args.operator
   * @param {string} args.orderId
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {string} args.startUpdateTime
   * @param {string} args.endUpdateTime
   * @param {string} args.invoiceTitle
   * @param {} args.pageFilter
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportInvoices: function (args, options = {}) {
    return mdyAPI('MerchantInvoice', 'ExportInvoices', args, options);
  },
};
