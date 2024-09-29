import base, { controllerName } from './base';
/**
 * getPivotData
*/
var getPivotData = {
  /**
   * getPivotData
   * @param {Object} args 请求参数
   * @param {PivotDataConfig} {appKey:null(string),columns:null(array),filters:null(array),options:null(ref),rows:null(array),sign:null(string),values:null(array),viewId:null(string),worksheetId:null(string),}*pivotDataConfig
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getPivotData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/getPivotData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'getPivotData', JSON.stringify(args), $.extend(base, options));
  },
};
export default getPivotData;