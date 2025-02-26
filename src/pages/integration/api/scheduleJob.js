import base, { controllerName } from './base';

var scheduleJob = {

  /**
   * 获得定时任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 定时任务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/get';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobget', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 触发定时任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 定时任务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  trigger: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/trigger';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobtrigger', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新定时任务的状态
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 任务编号", example = "1024"
   * @param {integer} args.status 状态<br>{@link com.mingdao.whileflow.schedule.enums.ScheduleJobStatusEnum}
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateStatus: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/updateStatus';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobupdateStatus', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新定时任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 任务编号", example = "1024"
   * @param {string} args.name 任务名称
   * @param {string} args.jobKey 任务key -- 唯一<br>datasourceId+dbName+schema+tableName
   * @param {string} args.handlerName "处理器的名字
   * @param {string} args.handlerParam 处理器的参数
   * @param {string} args.cronExpression CRON 表达式,example = "0/10 * * * * ? *"
   * @param {integer} args.interval 固定时间间隔(单位为秒)
   * @param {integer} args.retryCount 重试次数,example = 3
   * @param {integer} args.retryInterval 重试间隔,example = "1000"
   * @param {integer} args.monitorTimeout 监控超时时间,example = "60000"
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  update: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobupdate', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获得定时任务的下 n 次执行时间
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getNextTimes: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/getNextTimes';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobgetNextTimes', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 停止所有运行的任务
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  resumeAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/resumeAll';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobresumeAll', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 停止所有运行的任务
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pauseAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/pauseAll';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobpauseAll', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获得定时任务分页
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.name 任务名称，模糊匹配", example = "测试任务
   * @param {integer} args.status 任务状态，参见 JobStatusEnum 枚举", example = "1"
   * @param {string} args.handlerName 处理器的名字，模糊匹配
   * @param {object} args.sort 排序参数(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  page: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/page';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobpage', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除所有运行的任务--没有实现，放出来有点危险
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/deleteAll';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobdeleteAll', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 创建定时任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 任务编号", example = "1024"
   * @param {string} args.name 任务名称
   * @param {string} args.jobKey 任务key -- 唯一<br>datasourceId+dbName+schema+tableName
   * @param {string} args.handlerName "处理器的名字
   * @param {string} args.handlerParam 处理器的参数
   * @param {string} args.cronExpression CRON 表达式,example = "0/10 * * * * ? *"
   * @param {integer} args.interval 固定时间间隔(单位为秒)
   * @param {integer} args.retryCount 重试次数,example = 3
   * @param {integer} args.retryInterval 重试间隔,example = "1000"
   * @param {integer} args.monitorTimeout 监控超时时间,example = "60000"
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  add: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleJob/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleJobadd', JSON.stringify(args), $.extend(base, options));
  }
};

export default scheduleJob;