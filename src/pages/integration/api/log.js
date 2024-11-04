import base, { controllerName } from './base';

var log = {

  /**
   * 根据jobId获取完整的异常日志
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.logId No comments found.
   * @param {string} args.jobId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getErrorDetailByJobId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'log/getErrorDetailByJobId';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'loggetErrorDetailByJobId', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据分页参数获取用户当前任务日志列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.logId No comments found.
   * @param {string} args.jobId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLog: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'log/getLog';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'loggetLog', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据jobId获取对应错误详情
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.logId No comments found.
   * @param {string} args.jobId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getErrorDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'log/getErrorDetail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'loggetErrorDetail', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据jobId集合获取对应的需要展示错误
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.logId No comments found.
   * @param {string} args.jobId No comments found.
   * @param {array} args.jobIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getErrorLog: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'log/getErrorLog';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'loggetErrorLog', JSON.stringify(args), $.extend(base, options));
  }
};

export default log;