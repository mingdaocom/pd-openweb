import base, { controllerName } from './base';

var test = {

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {string} args.wsId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  worksheet: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/worksheet/testWsFields';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testworksheet', args, $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  synctask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/synctask/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testsynctask', args, $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  worksheet: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/worksheet/testWsInfo';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'testworksheet', JSON.stringify(args), $.extend(base, options));
  }
};

export default test;