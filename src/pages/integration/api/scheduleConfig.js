import base, { controllerName } from './base';

const scheduleConfig = {
  /**
   * 根据定时配置id删除--同时删除对应的定时任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.scheduleConfigId 定时设置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  delete: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/delete';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfigdelete', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新定时设置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id 定时设置id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名(hana无dbName，前端给空字符串)
   * @param {string} args.schema 数据库schema
   * @param {string} args.tableName 数据库表名
   * @param {integer} args.readInterval 读取时间间隔
   * @param {integer} args.readIntervalType 读取时间间隔类型(每小时0、每天1)
   * @param {string} args.readTime 读取时间间隔-时间(每天才会有设置如12:00)
   * @param {integer} args.readType 读取方式: 0-读取全部;1-读取新增修改<br> {@link ReadTypeEnum.ALL}<br> {@link ReadTypeEnum.INCREMENT}
   * @param {object} args.config 节点配置内容(map data)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  update: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfigupdate', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据数据源id、数据库名以及表名获取对应的定时配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名
   * @param {string} args.schema 数据库schema
   * @param {string} args.tableName 数据库表名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  find: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/find';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfigfind', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据数据源id、数据库名、表名以及依据字段(增量字段)获取最近的值
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名
   * @param {string} args.schema 数据库schema
   * @param {string} args.tableName 数据库表名
   * @param {string} args.fieldName 数据库表依据字段名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLastValue: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/getLastValue';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfiggetLastValue', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 添加定时配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名(hana无dbName，前端给空字符串)
   * @param {string} args.schema 数据库schema
   * @param {string} args.tableName 数据库表名
   * @param {integer} args.readInterval 读取时间间隔
   * @param {integer} args.readIntervalType 读取时间间隔类型(每小时0、每天1)
   * @param {string} args.readTime 读取时间间隔-时间(每天才会有设置如12:00)
   * @param {integer} args.readType 读取方式: 0-读取全部;1-读取新增修改<br> {@link ReadTypeEnum.ALL}<br> {@link ReadTypeEnum.INCREMENT}
   * @param {object} args.config 节点配置内容(新增/修改读取方式的配置：依据字段、首次读取开始值)(map data)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  add: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfigadd', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据定时配置id获取详细信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.scheduleConfigId 定时设置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/get';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfigget', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 根据数据源id获取对应的定时配置列表(分页)
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.searchBody 搜索内容：数据库名称、schema、数据库表名
   * @param {object} args.sort 排序参数(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'scheduleConfig/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'scheduleConfiglist', JSON.stringify(args), $.extend(base, options));
  },
};

export default scheduleConfig;
