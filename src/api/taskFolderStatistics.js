export default {
  /**
  * 获取看板数据
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderStageStatistics: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetFolderStageStatistics', args, options);
   },
  /**
  * 获取头部即时数据
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderStatisticsNow: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetFolderStatisticsNow', args, options);
   },
  /**
  * 获取指定时间段日常统计数据（当天数据为即时数据）
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDailyFolderStatistics: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetDailyFolderStatistics', args, options);
   },
  /**
  * 获取指定项目中的饼图控件即时数据
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderControlsPieChart: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetFolderControlsPieChart', args, options);
   },
  /**
  * 获取指定项目中的柱状图控件数据（分日期）
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderControlsBarChart: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetFolderControlsBarChart', args, options);
   },
  /**
  * 获取全部负责人
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskCharges: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetTaskCharges', args, options);
   },
  /**
  * 获取为当前用户下属的项目负责人
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubordinate: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetSubordinate', args, options);
   },
  /**
  * 获取负责人数据
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {array} args.chargeAccountIDs 负责人IDList
  * @param {boolean} args.isAuto true:查询所有负责人,false：查询chargeAccountIDs所指定的负责人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskChargeStatistics: function (args, options = {}) {
     
     return $.api('TaskFolderStatistics', 'GetTaskChargeStatistics', args, options);
   },
};
