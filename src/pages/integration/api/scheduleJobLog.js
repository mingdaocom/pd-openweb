import base, { controllerName } from './base';

const scheduleJobLog = {
  /**
   * 获得定时任务日志
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJobLog/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'scheduleJobLogget', args, $.extend(base, options));
  },

  /**
   * 获得定时任务日志分页
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {integer} args.jobId "任务编号", example = "10"
   * @param {string} args.handlerName 处理器的名字，模糊匹配
   * @param {string} args.beginTime 开始执行时间
   * @param {string} args.endTime 结束执行时间
   * @param {integer} args.status 任务状态 @link JobLogStatusEnum 枚举
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  page: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJobLog/page';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'scheduleJobLogpage', args, $.extend(base, options));
  },
};

export default scheduleJobLog;
