export default {
  /**
  * 获取主授权所有版本,最大订单人数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizeVersions: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetAuthorizeVersions', args, options);
   },
  /**
  * 获取网络主授权草案订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizeDraftOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetAuthorizeDraftOrder', args, options);
   },
  /**
  * 添加主授权订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.userNum 用户数量
  * @param {integer} args.years 年数
  * @param {string} args.versionId 付费版标识
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {boolean} args.unLimited 是否是无限包
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAuthorizeOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddAuthorizeOrder', args, options);
   },
  /**
  * 获取主授权订单总价
  * @param {Object} args 请求参数
  * @param {integer} args.userNum 用户数量
  * @param {integer} args.years 购买年数
  * @param {string} args.versionId 付费版标识
  * @param {boolean} args.unLimited 是否是无限包
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizeOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetAuthorizeOrderPrice', args, options);
   },
  /**
  * 获取专属算力实例规格列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectComputingInstances: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetProjectComputingInstances', args, options);
   },
  /**
  * 获取增补用户拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPersonOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetPersonOrderPrice', args, options);
   },
  /**
  * 添加增补用户拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addPersonOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddPersonOrder', args, options);
   },
  /**
  * 获取增补应用附件上传量拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApkStorageOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetApkStorageOrderPrice', args, options);
   },
  /**
  * 添加增补应用附件上传量拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addApkStorageOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddApkStorageOrder', args, options);
   },
  /**
  * 获取增补工作流拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkflowOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetWorkflowOrderPrice', args, options);
   },
  /**
  * 添加增补工作流拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkflowOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddWorkflowOrder', args, options);
   },
  /**
  * 获取本月工作流拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMonthlyWorkflowOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetMonthlyWorkflowOrderPrice', args, options);
   },
  /**
  * 添加本月增补工作流拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addMonthlyWorkflowOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddMonthlyWorkflowOrder', args, options);
   },
  /**
  * 获取增补外部用户拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExternalUserOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetExternalUserOrderPrice', args, options);
   },
  /**
  * 获取增补外部用户续费订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExternalUserExtensionOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetExternalUserExtensionOrderPrice', args, options);
   },
  /**
  * 添加增补外部用户拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addExternalUserOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddExternalUserOrder', args, options);
   },
  /**
  * 外部用户续费订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addExternalUserExtensionOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddExternalUserExtensionOrder', args, options);
   },
  /**
  * 获取增补数据集成运行行数拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDataPipelineOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetDataPipelineOrderPrice', args, options);
   },
  /**
  * 添加增补数据集成运行行数拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addDataPipelineOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddDataPipelineOrder', args, options);
   },
  /**
  * 获取本月增补数据集成运行行数拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMonthlyDataPipelineOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetMonthlyDataPipelineOrderPrice', args, options);
   },
  /**
  * 添加本月增补数据集成运行行数拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addMonthlyDataPipelineOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddMonthlyDataPipelineOrder', args, options);
   },
  /**
  * 获取专属算力实例订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getComputingInstanceOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetComputingInstanceOrderPrice', args, options);
   },
  /**
  * 获取专属算力实例续费订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getComputingInstanceExtensionOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetComputingInstanceExtensionOrderPrice', args, options);
   },
  /**
  * 添加专属算力实例订单（永久有效，非平台版）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addPermanentComputingInstanceOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddPermanentComputingInstanceOrder', args, options);
   },
  /**
  * 添加专属算力实例订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addComputingInstanceOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddComputingInstanceOrder', args, options);
   },
  /**
  * 添加专属算力实例续费订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.id 实例id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addComputingInstanceExtensionOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddComputingInstanceExtensionOrder', args, options);
   },
  /**
  * 获取本月专属算力实例订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMonthlyComputingInstanceOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetMonthlyComputingInstanceOrderPrice', args, options);
   },
  /**
  * 添加专属算力实例订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addMonthlyComputingInstanceOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddMonthlyComputingInstanceOrder', args, options);
   },
  /**
  * 获取聚合表拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.orderId 续费订单ID
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAggregationTableOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetAggregationTableOrderPrice', args, options);
   },
  /**
  * 添加增补聚合表拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.productId 产品规格ID
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAggregationTableOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddAggregationTableOrder', args, options);
   },
  /**
  * 其他方式付款（记录用户操作日志）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addThreePartPayOrderLog: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddThreePartPayOrderLog', args, options);
   },
  /**
  * 余额支付
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   balancePayOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'BalancePayOrder', args, options);
   },
  /**
  * 获取升级版本订单价格
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.versionId 付费版标识
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUpgradeVersionOrderPrice: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetUpgradeVersionOrderPrice', args, options);
   },
  /**
  * 添加升级版本订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.versionId 付费版标识
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addUpgradeVersionOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddUpgradeVersionOrder', args, options);
   },
  /**
  * 获取版本升级信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUpgradeVersionData: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetUpgradeVersionData', args, options);
   },
  /**
  * 添加充值订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.amount 具体金额
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRechargeOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'AddRechargeOrder', args, options);
   },
  /**
  * 获取订单详情
  * @param {Object} args 请求参数
  * @param {string} args.orderId 订单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectPayResult: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetProjectPayResult', args, options);
   },
  /**
  * 取消升级订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {string} args.productId 产品规格ID
  * @param {string} args.id 实例id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelOrder: function (args, options = {}) {
     
     return mdyAPI('Order', 'CancelOrder', args, options);
   },
  /**
  * 下载银行信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {boolean} args.sendEmail 是否发送邮件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downloadBankInfo: function (args, options = {}) {
     
     return mdyAPI('Order', 'DownloadBankInfo', args, options);
   },
  /**
  * 获取交易记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页数量
  * @param {} args.status
  * @param {array} args.recordTypes 消费记录类型
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTransactionRecordByPage: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetTransactionRecordByPage', args, options);
   },
  /**
  * 根据orderId获取交易记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTransactionRecordByOrderId: function (args, options = {}) {
     
     return mdyAPI('Order', 'GetTransactionRecordByOrderId', args, options);
   },
  /**
  * 申请发票
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {string} args.companyName 公司名
  * @param {number} args.price 价格
  * @param {string} args.address 邮寄地址
  * @param {string} args.userName 兼容 发票接收人
  * @param {string} args.recipientName 发票接收人
  * @param {string} args.contactPhone 电话
  * @param {string} args.taxNumber 税务登记号
  * @param {} args.invoiceType
  * @param {string} args.taxBank 开户行
  * @param {string} args.taxBankNumber 账号
  * @param {string} args.taxRegAddress 注册地址
  * @param {string} args.taxRegContactPhone 注册电话
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyInvoice: function (args, options = {}) {
     
     return mdyAPI('Order', 'ApplyInvoice', args, options);
   },
};
