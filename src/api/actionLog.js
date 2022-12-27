export default {
  /**
  * 获取登录日志列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 当前页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {} args.logType 用户行为日志类型 1=登录 2=登出
  * @param {string} args.accountId 用户ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getActionLogs: function (args, options = {}) {
     
     return $.api('ActionLog', 'GetActionLogs', args, options);
   },
  /**
  * 获取登录设备列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountDevices: function (args, options = {}) {
     
     return $.api('ActionLog', 'GetAccountDevices', args, options);
   },
};
