import base, { controllerName } from './base';

var monitor = {

  /**
   * 获取任务运行时间
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRunTime: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getRunTime';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetRunTime', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取任务总数
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTasksTotal: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getTasksTotal';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetTasksTotal', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTestCount2: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getTestCount2';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetTestCount2', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取任务历史区间数据
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getHistoricalData: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getHistoricalData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetHistoricalData', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取组织下同步的算力和组织下总算力
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getArithmetic: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getArithmetic';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetArithmetic', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取今日任务总量
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getToDayTotal: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getToDayTotal';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetToDayTotal', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取组织下任务数/总任务数
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.jobId No comments found.
   * @param {integer} args.dataType No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaskCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getTaskCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetTaskCount', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTestCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'monitor/getTestCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'monitorgetTestCount', JSON.stringify(args), $.extend(base, options));
  }
};

export default monitor;