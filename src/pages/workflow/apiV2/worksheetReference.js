import base, { controllerName } from './base';
/**
 * worksheetReference
*/
const worksheetReference = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  getWorksheetReferences: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/worksheetReference/GetWorksheetReferences';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'worksheetReferenceGetWorksheetReferences', args, $.extend({}, base, options));
  },
};
export default worksheetReference;