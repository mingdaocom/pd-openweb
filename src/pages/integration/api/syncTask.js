import base, { controllerName } from './base';

var syncTask = {

  /**
   * 删除同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/deleteTask';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'syncTaskdeleteTask', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskdatasourceUseDetails', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskfindByName', args, $.extend(base, options));
  },

  /**
   * 启动同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  startTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/startTask';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'syncTaskstartTask', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskupdateSyncTask', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskgetStatistics', args, $.extend(base, options));
  },

  /**
   * 停止同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.taskId 任务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  stopTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'syncTask/stopTask';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'syncTaskstopTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取同步任务列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.searchBody 搜索内容：任务名称、创建者
   * @param {string} args.status 任务状态(See: 数据同步任务状态)
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
    return $.api(controllerName, 'syncTasklist', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'syncTasktest', args, $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskfindTaskListByPro', args, $.extend(base, options));
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
    return $.api(controllerName, 'syncTaskcreateOnlySyncTaskPreCheck', args, $.extend(base, options));
  }
};

export default syncTask;