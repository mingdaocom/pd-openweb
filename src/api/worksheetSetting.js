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
};
