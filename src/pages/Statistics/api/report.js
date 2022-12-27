import base, { controllerName } from './base';
/**
 * report
*/
var report = {
  /**
   * 导出图表
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*exportReportRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  export: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/export';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportexport', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 导出图表
   * @param {Object} args 请求参数
   * @param {string} [args.pageId] 页面id
   * @param {string} [args.reportId] 图表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  exportReport: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/exportReport';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'reportexportReport', args, $.extend(base, options));
  },
  /**
   * 获取图表的数据（结果toString过的）
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/get';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportget', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/getData';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportgetData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取统计图表的条件id
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportSingleCacheId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/getReportSingleCacheId';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportgetReportSingleCacheId', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据以表的形式查看
   * @param {Object} args 请求参数
   * @param {获取图表数据} {appId:工作表id(string),contrastType:对比周期(integer),dynamicFilter:动态筛选(ref),exportType:导出类型 0 ：原始值导出，1：显示值导出(integer),filterCode:范围 :空 代表全中国(string),filterControls:筛选条件(array),filterRangeId:筛选范围字段ID(string),filters:筛选条件(array),isPersonal:查看原始数据： ture，其他:false(boolean),match:点击的数值条件：{"caid":"user-workflow","ownerid":"user-undefined"}(object),pageId:页面id(string),particleSizeType:粒度 1:日 2:周 3:月  /  行政区域图 1： 全国，2：省，3：市(integer),rangeType:筛选范围: 1:今天，2：昨天，3：明天，4：本周，5：上周，6：下周，8：本月，9：上月，10：下月，11：本季度，12：上季度，13：下季度，15：本年，16：上一年，17：下一年，18：今天之前的...天，19：今天之后的..天,20:自定义(integer),rangeValue:范围的值：7:7天，14：14天，30：30天,90：90天，180：180天，365：365天(string),reload:是否刷新(boolean),reportId:图表ID(string),sorts:自定义排序的数组(array),today:至今天(boolean),version:版本(string),}*reportDataRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTableData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/getTableData';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportgetTableData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表列表
   * @param {Object} args 请求参数
   * @param {string} [args.appId] *工作表ID
   * @param {string} [args.appType] 默认1：工作表
   * @param {string} [args.isOwner] 个人：true,公共：false
   * @param {string} [args.pageIndex] 页数
   * @param {string} [args.pageSize] 条数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  list: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/list';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'reportlist', args, $.extend(base, options));
  },
  /**
   * 获取自定义页面的统计图列表
   * @param {Object} args 请求参数
   * @param {string} [args.appId] appId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  listByPageId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/report/listByPageId';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'reportlistByPageId', args, $.extend(base, options));
  },
};
export default report;
