import base, { controllerName } from './base';
/**
 * reportSort
*/
var reportSort = {
  /**
   * 更新图表的排序
   * @param {Object} args 请求参数
   * @param {更新图表顺序} {appId:工作表ID(string),isOwner:个人：true，公共：false(boolean),reportIds:排序好的ID(array),}*updateReportSortRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateReportSort: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportSort/updateReportSort';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'reportSortupdateReportSort', JSON.stringify(args), $.extend(base, options));
  },
};
export default reportSort;