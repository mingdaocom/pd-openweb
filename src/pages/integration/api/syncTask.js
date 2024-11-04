import base, { controllerName } from './base';

var syncTask = {

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  findByFlowId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/findByFlowId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskfindByFlowId', args, $.extend(base, options));
  },

  /**
   * 删除同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/deleteTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskdeleteTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 查询数据源使用详情列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  datasourceUseDetails: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/datasourceUseDetails';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskdatasourceUseDetails', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 批量停止同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {array} args.taskIds 任务id列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  batchStopTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/batchStopTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskbatchStopTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {string} args.name No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  findByName: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/findByName';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskfindByName', args, $.extend(base, options));
  },

  /**
   * 批量启动同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {array} args.taskIds 任务id列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  batchStartTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/batchStartTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskbatchStartTask', JSON.stringify(args), $.extend(base, options));
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
  tasks: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/tasks';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTasktasks', args, $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.jobId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  tasks: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/tasks/paginated';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTasktasks', args, $.extend(base, options));
  },

  /**
   * 启动同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  startTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/startTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskstartTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 停止全部同步任务
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  stopAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/stopAll';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskstopAll', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 创建聚合表同步任务时的前置检查
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createAggTableSyncTaskPreCheck: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/createAggTableSyncTaskPreCheck';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskcreateAggTableSyncTaskPreCheck', args, $.extend(base, options));
  },

  /**
   * 修改同步任务属性
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {string} args.name 任务名称
   * @param {string} args.owner 拥有者
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateSyncTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/updateSyncTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskupdateSyncTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取同步任务汇总状态
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getStatistics: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/getStatistics';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskgetStatistics', args, $.extend(base, options));
  },

  /**
   * 停止同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  stopTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/stopTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTaskstopTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取同步任务列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 所属应用id(应用下聚合表有对应的appId，组织下可查看应用下指定appId，不指定appId为空)
   * @param {string} args.searchBody 搜索内容：任务名称、创建者
   * @param {string} args.status 任务状态(See: 数据同步任务状态)
   * @param {integer} args.taskType 同步任务类型 0-DATA_INTEGRATE 1-AGG_TABLE 2-AGG_PREVIEW :默认DATA_INTEGRATE<br>{@link TaskTypeEnum.DATA_INTEGRATE}<br>{@link TaskTypeEnum.AGG_TABLE}
   * @param {integer} args.type 0-聚合表类型的同步任务列表在应用下(查询数据源中所有工作表名称)，<br>1-聚合表类型同步任务列表在组织下(查询应用名称和用户头像)<br>区分主要是两个地方接口获取的数据有一部分差异，分开减少不想关查询
   * @param {string} args.sourceType 源类型
   * @param {string} args.destType 目的地类型
   * @param {object} args.sort 排序参数(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'syncTasklist', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  test: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/test';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTasktest', args, $.extend(base, options));
  },

  /**
   * 
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  findTaskListByPro: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/findTaskListByPro';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskfindTaskListByPro', args, $.extend(base, options));
  },

  /**
   * 创建仅同步任务时的前置检查
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createOnlySyncTaskPreCheck: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/createOnlySyncTaskPreCheck';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'syncTaskcreateOnlySyncTaskPreCheck', args, $.extend(base, options));
  }
};

export default syncTask;