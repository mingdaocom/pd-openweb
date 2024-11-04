import base, { controllerName } from './base';

var dw = {

  /**
   * 获取数据表字段信息
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFieldsInfo: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/getFieldsInfo';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwgetFieldsInfo', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 预览数据
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  preview: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/preview';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwpreview', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 创建工作表镜像列表数据
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createJob: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/createJob';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwcreateJob', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 清空double 库
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  clearDoubleWrite: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/clearDoubleWrite';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwclearDoubleWrite', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据id查询对应的异常信息
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getErrorLog: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/getErrorLog';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwgetErrorLog', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取工作表镜像列表数据
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorkTableMirrorDataList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/getWorkTableMirrorDataList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwgetWorkTableMirrorDataList', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 检查表是否存在
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkTableExists: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/checkTableExists';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwcheckTableExists', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除工作表镜像任务
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.appNameAndWsName 应用名称和工作表名称
   * @param {object} args.sort 排序参数(object)
   * @param {string} args.id id
   * @param {array} args.ids ids(用于列表页查询异常信息使用)
   * @param {string} args.dataSourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schemaName 数据库 schema 名称
   * @param {string} args.tableName 表名称
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {string} args.appName 应用名称
   * @param {string} args.wsId 工作表名称
   * @param {array} args.doubleWriteTables 双写表配置(工作表名称，工作表id，表名)
   * @param {array} args.tableNames 表名集合
   * @param {string} args.accountId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  delete: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dw/delete';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dwdelete', JSON.stringify(args), $.extend(base, options));
  }
};

export default dw;