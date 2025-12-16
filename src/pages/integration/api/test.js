import base, { controllerName } from './base';

const test = {
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
    base.ajaxOptions.url = base.server(options) + 'test/worksheet/getWorksheetInfo';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testworksheet', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {string} args.aggtableId No comments found.
   * @param {string} args.projectId No comments found.
   * @param {string} args.appId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  aggtable: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/aggtable/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testaggtable', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  approle: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/approle/isManager';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testapprole', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  role: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/role/isSuperManager';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testrole', args, $.extend(base, options));
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
    base.ajaxOptions.url = base.server(options) + 'test/worksheet/editWorksheetName';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'testworksheet', JSON.stringify(args), $.extend(base, options));
  },

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
    base.ajaxOptions.url = base.server(options) + 'test/worksheet/getWorksheetFields';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testworksheet', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId No comments found.
   * @param {integer} args.partitionLen No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  synctask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/synctask/getWsPartition';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testsynctask', args, $.extend(base, options));
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
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  role: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'test/role/isAppManager';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'testrole', args, $.extend(base, options));
  },
};

export default test;
