export default {
  /**
  * 获取日志列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小（最多一次拉1000条）
  * @param {string} args.serviceName 服务名
  * @param {string} args.keywords 关键词
  * @param {string} args.startTime 开始时间
  * @param {string} args.endTime 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLogs: function (args, options = {}) {
     
     return $.api('PrivateHkLog', 'GetLogs', args, options);
   },
  /**
  * 下载日志
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downloadLogs: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('PrivateHkLog', 'DownloadLogs', args, options);
   },
};
