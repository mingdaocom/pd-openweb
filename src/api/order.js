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
     
     return $.api('Order', 'GetAuthorizeVersions', args, options);
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
     
     return $.api('Order', 'GetAuthorizeDraftOrder', args, options);
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
     
     return $.api('Order', 'AddAuthorizeOrder', args, options);
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
     
     return $.api('Order', 'GetAuthorizeOrderPrice', args, options);
   },
  /**
  * 获取增补用户拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPersonOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetPersonOrderPrice', args, options);
   },
  /**
  * 添加增补用户拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addPersonOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddPersonOrder', args, options);
   },
  /**
  * 获取增补应用附件上传量拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApkStorageOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetApkStorageOrderPrice', args, options);
   },
  /**
  * 添加增补应用附件上传量拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addApkStorageOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddApkStorageOrder', args, options);
   },
  /**
  * 获取增补应用拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApkOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetApkOrderPrice', args, options);
   },
  /**
  * 添加增补应用拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addApkOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddApkOrder', args, options);
   },
  /**
  * 获取增补工作流拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkflowOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetWorkflowOrderPrice', args, options);
   },
  /**
  * 添加增补工作流拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkflowOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddWorkflowOrder', args, options);
   },
  /**
  * 获取本月工作流拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMonthlyWorkflowOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetMonthlyWorkflowOrderPrice', args, options);
   },
  /**
  * 添加本月增补工作流拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addMonthlyWorkflowOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddMonthlyWorkflowOrder', args, options);
   },
  /**
  * 获取增补外部用户拓展包订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExternalUserOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetExternalUserOrderPrice', args, options);
   },
  /**
  * 获取增补外部用户续费订单总价
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExternalUserExtensionOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetExternalUserExtensionOrderPrice', args, options);
   },
  /**
  * 添加增补外部用户拓展包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.num 数量
  * @param {boolean} args.needSalesAssistance 是否需要明道云顾问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addExternalUserOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddExternalUserOrder', args, options);
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
     
     return $.api('Order', 'AddExternalUserExtensionOrder', args, options);
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
     
     return $.api('Order', 'AddThreePartPayOrderLog', args, options);
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
     
     return $.api('Order', 'BalancePayOrder', args, options);
   },
  /**
  * 获取一天续费包价格
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOneDayOrderPrice: function (args, options = {}) {
     
     return $.api('Order', 'GetOneDayOrderPrice', args, options);
   },
  /**
  * 添加一天续费包订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addOneDayOrder: function (args, options = {}) {
     
     return $.api('Order', 'AddOneDayOrder', args, options);
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
     
     return $.api('Order', 'GetUpgradeVersionOrderPrice', args, options);
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
     
     return $.api('Order', 'AddUpgradeVersionOrder', args, options);
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
     
     return $.api('Order', 'GetUpgradeVersionData', args, options);
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
     
     return $.api('Order', 'AddRechargeOrder', args, options);
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
     
     return $.api('Order', 'GetProjectPayResult', args, options);
   },
  /**
  * 取消升级订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.orderId 订单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelOrder: function (args, options = {}) {
     
     return $.api('Order', 'CancelOrder', args, options);
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
     
     return $.api('Order', 'DownloadBankInfo', args, options);
   },
  /**
  * 获取交易记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页数量
  * @param {} args.status 订单状态
  * @param {array} args.recordTypes 消费记录类型
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTransactionRecordByPage: function (args, options = {}) {
     
     return $.api('Order', 'GetTransactionRecordByPage', args, options);
   },
  /**
  * 根据recordId获取交易记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.recordId 记录id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTransactionRecordByRecordId: function (args, options = {}) {
     
     return $.api('Order', 'GetTransactionRecordByRecordId', args, options);
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
     
     return $.api('Order', 'GetTransactionRecordByOrderId', args, options);
   },
  /**
  * 编辑备注
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.recordId 记录id
  * @param {string} args.remark 备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTransactionRecordRemark: function (args, options = {}) {
     
     return $.api('Order', 'UpdateTransactionRecordRemark', args, options);
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
  * @param {} args.invoiceType 发票类型 1：普票 2：增票
  * @param {string} args.taxBank 开户行
  * @param {string} args.taxBankNumber 账号
  * @param {string} args.taxRegAddress 注册地址
  * @param {string} args.taxRegContactPhone 注册电话
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyInvoice: function (args, options = {}) {
     
     return $.api('Order', 'ApplyInvoice', args, options);
   },
};
