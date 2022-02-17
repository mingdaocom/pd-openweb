module.exports = {
  /**
  * 账单列表
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appBillList: function (args, options = {}) {
     
     return $.api('AdminManage', 'AppBillList', args, options);
   },
  /**
  * 用户自助购买包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   expansionInfos: function (args, options = {}) {
     
     return $.api('AdminManage', 'ExpansionInfos', args, options);
   },
  /**
  * 获取余额
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getHidBalance: function (args, options = {}) {
     
     return $.api('AdminManage', 'GetHidBalance', args, options);
   },
  /**
  * 获取企业号
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   corporateIdentity: function (args, options = {}) {
     
     return $.api('AdminManage', 'CorporateIdentity', args, options);
   },
  /**
  * 网络到期天数信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   projectExpireDays: function (args, options = {}) {
     
     return $.api('AdminManage', 'ProjectExpireDays', args, options);
   },
  /**
  * 企业管理通告
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   announcement: function (args, options = {}) {
     
     return $.api('AdminManage', 'Announcement', args, options);
   },
};
