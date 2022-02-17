module.exports = {
  /**
  * 用户统计
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {} args.sortField 排序字段
  * @param {} args.sortType 排序类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserReport: function (args, options = {}) {
     
     return $.api('Statistic', 'GetUserReport', args, options);
   },
  /**
  * 动态统计
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {} args.postReportType 统计类型
  * @param {} args.sortField 排序字段
  * @param {} args.sortType 排序类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPostReportByType: function (args, options = {}) {
     
     return $.api('Statistic', 'GetPostReportByType', args, options);
   },
  /**
  * 群组统计
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {} args.sortField 排序字段
  * @param {} args.sortType 排序类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupReport: function (args, options = {}) {
     
     return $.api('Statistic', 'GetGroupReport', args, options);
   },
};
