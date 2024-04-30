import base, { controllerName } from './base';

var aggTable = {

  /**
   * 获取聚合表预览任务状态
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPreviewTaskStatus: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/getPreviewTaskStatus';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTablegetPreviewTaskStatus', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 后续看是否需要导出对应projectId和appId所有的配置导出聚合表配置规则-json格式导出.
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  export: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/export';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTableexport', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 发布聚合表同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表id
   * @param {boolean} args.preview 是否预览
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  publishTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/publishTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTablepublishTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 初始化一个空的聚合表配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 所属应用id
   * @param {string} args.owner 所属用户id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  initEmpty: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/initEmpty';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTableinitEmpty', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新节点信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.aggTableId 聚合表id
   * @param {string} args.nodeId 当前节点id
   * @param {string} args.name 节点名称
   * @param {string} args.nodeType 节点类型(See: 聚合表节点类型)
   * @param {string} args.status 节点状态(See: 聚合表节点状态)
   * @param {string} args.description 描述
   * @param {object} args.nodeConfig 节点配置(object)
   * @param {boolean} args.updateFlag 是否作为更新标识：<br>更新节点配置中(产品交互中)：<br>1、更新数据源，过滤条件，归组，添加聚合字段，更改聚合方式时：需要重新预览<br>2、修改名称、顺序、字段显示配置，增删改计算字段：直接更新预览配置并刷新，无需重新预览
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateNode: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/updateNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTableupdateNode', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 发布聚合表同步任务：1、预览：不保存聚合表配置直接发布2、保存正式发布：保存聚合表配置并发布
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表id
   * @param {boolean} args.preview 是否预览
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  publishAggTable: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/publishAggTable';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTablepublishAggTable', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取聚合流配置信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAggTable: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/getAggTable';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTablegetAggTable', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 复制聚合表配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.aggTableId 聚合表配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copy: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'aggTable/copy';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'aggTablecopy', JSON.stringify(args), $.extend(base, options));
  }
};

export default aggTable;