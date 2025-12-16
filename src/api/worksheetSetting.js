export default {
  /**
   * 保存支付基础配置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.appId 应用Id
   * @param {string} args.mchid 商户号
   * @param {object} args.scenes 支付场景
   * @param {string} args.payContentControlId 支付内容控件
   * @param {string} args.payAmountControlId 支付金额控件
   * @param {string} args.mapWorksheetId 关联的工作表
   * @param {object} args.fieldMaps 关联的工作表映射字段
   * @param {integer} args.expireTime 订单过期时长
   * @param {boolean} args.enableOrderVisible 是否启用订单可见
   * @param {string} args.orderVisibleViewId 订单可见视图id
   * @param {} args.worksheetPaymentSetting
   * @param {boolean} args.isRefundAllowed 是否启用退款
   * @param {boolean} args.isAllowedAddOption 允许新增选项
   * @param {boolean} args.isAtOncePayment 是否立刻支付
   * @param {boolean} args.isPaySuccessAddRecord 是否支付成功后才新增记录
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  savPaymentSetting: function (args, options = {}) {
    return mdyAPI('WorksheetSetting', 'SavPaymentSetting', args, options);
  },
  /**
   * 获取支付基础配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPaymentSetting: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('WorksheetSetting', 'GetPaymentSetting', args, options);
  },
  /**
   * 获取列表是否展示订单信息（公开接口）
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowDetailIsShowOrder: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('WorksheetSetting', 'GetRowDetailIsShowOrder', args, options);
  },
  /**
   * 保存工作表开票配置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.taxNo 开票税号
   * @param {object} args.scenes 开票场景
   * @param {string} args.productId 开票商品
   * @param {string} args.remark 说明
   * @param {string} args.mapWorksheetId 关联的工作表
   * @param {object} args.fieldMaps 关联的工作表映射字段
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveInvoiceSetting: function (args, options = {}) {
    return mdyAPI('WorksheetSetting', 'SaveInvoiceSetting', args, options);
  },
  /**
   * 获取工作表开票配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getInvoiceSetting: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('WorksheetSetting', 'GetInvoiceSetting', args, options);
  },
  /**
   * 编辑工作表分享卡片配置
   * @param {Object} args 请求参数
   * @param {string} args.shareCardId 分享卡片唯一id
   * @param {string} args.appItemId 应用项ID (工作表id 或者 自定义页面Id)
   * @param {string} args.title 商户号
   * @param {string} args.desc 支付内容控件
   * @param {string} args.icon 支付金额控件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  shareCardSetting: function (args, options = {}) {
    return mdyAPI('WorksheetSetting', 'ShareCardSetting', args, options);
  },
  /**
   * 获取工作表分享卡片配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getShareCardSetting: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('WorksheetSetting', 'GetShareCardSetting', args, options);
  },
};
