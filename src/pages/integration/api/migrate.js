import base, { controllerName } from './base';

const migrate = {
  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getReportingTaskStatus: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/getReportingTaskStatus';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'migrategetReportingTaskStatus', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {object} args.jobIds No comments found.,[array of string]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  findFlowIdByJobId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/findFlowIdByJobId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'migratefindFlowIdByJobId', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  startReportingTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/startReportingTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'migratestartReportingTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getReportingTaskList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/getReportingTaskList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'migrategetReportingTaskList', args, $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  migrationUpgrade: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/migrationUpgrade';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'migratemigrationUpgrade', JSON.stringify(args), $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  migrationUpgrade: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/migrationUpgrade/{flowId}';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'migratemigrationUpgrade', JSON.stringify(args), $.extend(base, options));
  },

  /**
   *
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  stopReportingTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'migrate/stopReportingTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'migratestopReportingTask', JSON.stringify(args), $.extend(base, options));
  },
};

export default migrate;
