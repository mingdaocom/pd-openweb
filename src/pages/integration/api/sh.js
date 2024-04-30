import base, { controllerName } from './base';

var sh = {

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getStorehouseInfo: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/getStorehouseInfo';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'shgetStorehouseInfo', args, $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkDatabaseForData: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/checkDatabaseForData';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'shcheckDatabaseForData', args, $.extend(base, options));
  }
};

export default sh;