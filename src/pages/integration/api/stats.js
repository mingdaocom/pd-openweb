import base, { controllerName } from './base';

var stats = {

  /**
   * 获取历史统计数据
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {integer} args.dimension No comments found.
   * @param {integer} args.pageNum No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {object} args.sortQuery No comments found.(object)
   * @param {string} args.taskNameOrCreator No comments found.
   * @param {integer} args.startTime No comments found.
   * @param {integer} args.endTime No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  history: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'stats/history';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'statshistory', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取项目当月实时读写统计
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {integer} args.dimension No comments found.
   * @param {integer} args.pageNum No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {object} args.sortQuery No comments found.(object)
   * @param {string} args.taskNameOrCreator No comments found.
   * @param {integer} args.startTime No comments found.
   * @param {integer} args.endTime No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  realtime: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'stats/realtime';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'statsrealtime', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取统计详情
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {integer} args.dimension No comments found.
   * @param {integer} args.pageNum No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {object} args.sortQuery No comments found.(object)
   * @param {string} args.taskNameOrCreator No comments found.
   * @param {integer} args.startTime No comments found.
   * @param {integer} args.endTime No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  details: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'stats/details';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'statsdetails', JSON.stringify(args), $.extend(base, options));
  }
};

export default stats;