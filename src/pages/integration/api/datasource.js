import base, { controllerName } from './base';

var datasource = {

  /**
   * 获取数据源类型列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.onlyRelatedTask 只查询有关联同步任务的类型列表：作为源或目的地、仅作为源、仅作为目的地
   * @param {boolean} args.onlyCreated 只查询建立了数据源的类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTypes: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getTypes';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetTypes', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取数据源详情
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDatasource: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getDatasource';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetDatasource', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取指定数据库下的数据表名称列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schema schema名称
   * @param {string} args.tableName table名称:模糊搜索
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTables: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getTables';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetTables', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取指定数据库下的schema名称列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSchemas: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getSchemas';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetSchemas', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 测试数据源连接
   *
   * @param {Object} args 请求参数
   * @param {string} args.datasourceId 对已保存的数据源测试连接时需要传数据源id
   * @param {string} args.projectId 组织id，传了数据源id时必传
   * @param {string} args.name 数据源名称
   * @param {array} args.hosts 主机列表，主机名/ip与端口之间使用冒号分隔，可以只有主机名<br>格式示例：["mingdao.com:3306", "192.168.1.165:27017", "mingdao.com"]
   * @param {string} args.user 数据库用户
   * @param {string} args.password 数据库密码
   * @param {string} args.initDb 初始数据库
   * @param {string} args.type 数据源类型
   * @param {string} args.connectOptions 数据库连接串
   * @param {object} args.extraParams 扩展参数，存放各个数据库独有的参数(map data)
   * @param {string} args.cdcParams cdc参数，格式：k1=v1,k2=v2
   * @param {integer} args.enableSsh Connecting Through SSH是否启用(EnableEnum.INACTIVE.getCode();)<br>0-未启用；1-启用<br>启用之后，需要替换数据库连接地址port为隧道分配的本地port，转发到数据库中的port
   * @param {string} args.sshConfigId ssh配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  test: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/test';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcetest', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 按照字段匹配可选的目标类型列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.dataDestType 目的地类型
   * @param {boolean} args.isCreate 是否新建表
   * @param {array} args.sourceFields 源字段列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  fieldsDataTypeMatch: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/fieldsDataTypeMatch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcefieldsDataTypeMatch', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取数据源列表-自定义分页，去掉前端用不上的参数
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.searchBody 搜索内容，支持搜索：数据源名称、地址、创建者
   * @param {string} args.roleType 角色类型 {@link DatasourceRoleType}(See: 数据源的角色类型)
   * @param {string} args.fromType 来源类型 {@link DatasourceFromType}(See: 数据源来源类型)
   * @param {string} args.dsType 数据源类型：MySQL、Oracle、Aliyun MySQL。。。
   * @param {array} args.dsTypes 数据源类型列表，与 dsType 参数二选一。两个参数都同时有值时，以 dsTypes 为准
   * @param {object} args.sort 排序参数(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcelist', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 添加新数据源
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.name 数据源名称
   * @param {array} args.hosts 主机列表，主机名/ip与端口之间使用冒号分隔，可以只有主机名<br>格式示例：["mingdao.com:3306", "192.168.1.165:27017", "mingdao.com"]
   * @param {string} args.user 数据库用户
   * @param {string} args.password 数据库密码
   * @param {string} args.initDb 初始数据库
   * @param {string} args.type 数据源类型
   * @param {string} args.fromType 来源类型(See: 数据源来源类型)
   * @param {string} args.roleType 角色类型(See: 数据源的角色类型)
   * @param {string} args.connectOptions 数据库连接串
   * @param {object} args.extraParams 扩展参数，存放各个数据库独有的参数(map data)
   * @param {string} args.cdcParams cdc参数，格式：k1=v1,k2=v2
   * @param {integer} args.enableSsh Connecting Through SSH是否启用(EnableEnum.INACTIVE.getCode();)<br>启用之后，需要替换数据库连接地址port为隧道分配的本地port，转发到数据库中的port
   * @param {string} args.sshConfigId ssh配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addDatasource: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/addDatasource';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourceaddDatasource', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除数据源
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteDatasource: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/deleteDatasource';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcedeleteDatasource', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新数据源
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id 数据源id
   * @param {string} args.name 数据源名称
   * @param {string} args.user 数据库用户
   * @param {array} args.hosts 主机列表，主机名/ip与端口之间使用冒号分隔，可以只有主机名<br>格式示例：["mingdao.com:3306", "192.168.1.165:27017", "mingdao.com"]
   * @param {string} args.password 数据库密码
   * @param {string} args.initDb 初始数据库
   * @param {string} args.type 数据源类型
   * @param {string} args.fromType 来源类型(See: 数据源来源类型)
   * @param {string} args.roleType 角色类型(See: 数据源的角色类型)
   * @param {string} args.connectOptions 数据库连接串
   * @param {object} args.extraParams 扩展参数，存放各个数据库独有的参数(map data)
   * @param {string} args.cdcParams cdc参数，格式：k1=v1,k2=v2
   * @param {integer} args.enableSsh Connecting Through SSH是否启用(EnableEnum.INACTIVE.getCode();)<br>启用之后，需要替换数据库连接地址port为隧道分配的本地port，转发到数据库中的port
   * @param {string} args.sshConfigId ssh配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateDatasource: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/updateDatasource';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourceupdateDatasource', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 分页获取指定数据库下的数据表名称列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schema schema名称
   * @param {string} args.tableName table名称:模糊搜索
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTablePages: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getTablePages';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetTablePages', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取是否启用ssh server
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sshServerEnable: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/sshServerEnable';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'datasourcesshServerEnable', args, $.extend(base, options));
  },

  /**
   * 获取指定数据源下的数据库名称列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDatabases: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getDatabases';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetDatabases', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 匹配可选的目标类型列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.dataDestType 目的地类型
   * @param {array} args.sourceTypeInfos 源表类型列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  dataTypeMatch: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/dataTypeMatch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcedataTypeMatch', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取需要被加入白名单的服务器IP
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  whitelistIp: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/whitelistIp';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'datasourcewhitelistIp', args, $.extend(base, options));
  },

  /**
   * 获取指定数据表下的字段列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.datasourceId 数据源id
   * @param {string} args.dbName 数据库名称
   * @param {string} args.schema schema名称
   * @param {string} args.tableName 数据表名称
   * @param {string} args.destType 目的地类型(See: 已支持的数据源类型)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTableFields: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getTableFields';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetTableFields', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 查询指定的数据源列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {array} args.datasourceIds 数据源id列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDatasources: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/getDatasources';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcegetDatasources', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 为工作表字段填充jdbc类型id
   *
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.fields 映射字段
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  fillJdbcType: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'datasource/fillJdbcType';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'datasourcefillJdbcType', JSON.stringify(args), $.extend(base, options));
  }
};

export default datasource;