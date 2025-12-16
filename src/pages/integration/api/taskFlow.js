import base, { controllerName } from './base';

const taskFlow = {
  /**
   * 全量保存任务流
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 任务流id，当更新时才传
   * @param {string} args.projectId 组织id
   * @param {string} args.owner 所属用户id
   * @param {string} args.firstNodeId 初始的节点id
   * @param {object} args.flowNodes 任务流节点(map data)
   * @param {object} args.any object any object.(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/addTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowaddTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取任务流中的节点信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.nodeId 节点id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getNodeInfo: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/getNodeInfo';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowgetNodeInfo', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 保存任务流配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId 任务流id
   * @param {string} args.projectId 组织id
   * @param {array} args.accountIds 拥有者账户id列表
   * @param {boolean} args.insertTrigger 新增记录时触发工作流
   * @param {boolean} args.updateTrigger 更新记录时触发工作流
   * @param {boolean} args.deleteTrigger 删除记录时触发工作流
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveConfig: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/saveConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowsaveConfig', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 升级所有任务流，所有节点field字段生成唯一id和oid
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  upgradeTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/upgradeTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowupgradeTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 全量更新任务流
   *
   * @param {Object} args 请求参数
   * @param {string} args.id 任务流id，当更新时才传
   * @param {string} args.projectId 组织id
   * @param {string} args.owner 所属用户id
   * @param {string} args.firstNodeId 初始的节点id
   * @param {object} args.flowNodes 任务流节点(map data)
   * @param {object} args.any object any object.(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/updateTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowupdateTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除节点
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.nodeId 待删除的节点id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteNode: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/deleteNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowdeleteNode', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除任务流
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/deleteTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowdeleteTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取任务流信息ForTest
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId flowId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaskFlowForTest: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/getTaskFlowForTest';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowgetTaskFlowForTest', args, $.extend(base, options));
  },

  /**
   * 节点数据预览
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.nodeId 节点id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  nodeDataPreview: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/nodeDataPreview';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlownodeDataPreview', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新节点信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.nodeId 当前节点id
   * @param {string} args.name 节点名称
   * @param {string} args.nodeType 节点类型(See: 节点类型)
   * @param {string} args.status 节点状态(See: 节点状态)
   * @param {string} args.description 描述
   * @param {object} args.nodeConfig 节点配置(object)
   * @param {object} args.any object any object.(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateNode: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/updateNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowupdateNode', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 还原升级后的所有任务流，所有节点field字段生成唯一id和oid
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  recoverTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/recoverTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowrecoverTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 发布同步任务
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {object} args.fieldForIdentifyDuplicate 用于工作表识别重复的字段信息(object)
   * @param {object} args.any object any object.(object)
   * @param {string} args.writeMode 工作表写入模式(See: 写入模式)
   * @param {boolean} args.isCleanDestTableData 是否清空目标表数据
   * @param {boolean} args.isCheckPasswordWasVerified 需要清空目标表数据时，是否检查密码是否检验过
   * @param {boolean} args.preview 是否预览
   * @param {integer} args.taskType 同步任务类型<br>{@link TaskTypeEnum.DATA_INTEGRATE}<br>{@link TaskTypeEnum.AGG_TABLE}<br>{@link TaskTypeEnum.AGG_PREVIEW}<br>数据集成同步任务<br>DATA_INTEGRATE(0,"sync"),<br>聚合表同步任务<br>AGG_TABLE(1,"agg"),<br>聚合表预览临时同步任务<br>AGG_PREVIEW(2,"preview");
   * @param {integer} args.parallelism 运行并行度
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  publishTask: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/publishTask';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowpublishTask', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 初始化一个空的任务流
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.owner 所属用户id
   * @param {object} args.sourceNode 源表节点(object)
   * @param {object} args.any object any object.(object)
   * @param {object} args.destNode 目的地节点(object)
   * @param {object} args.workflowConfig 工作流配置(object)
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {object} args.scheduleConfig 定时配置信息(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  initEmpty: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/initEmpty';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowinitEmpty', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 分页获取任务流列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowlist', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 初始化任务流
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.owner 所属用户id
   * @param {object} args.sourceNode 源表节点(object)
   * @param {object} args.any object any object.(object)
   * @param {object} args.destNode 目的地节点(object)
   * @param {object} args.workflowConfig 工作流配置(object)
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {object} args.scheduleConfig 定时配置信息(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  init: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/init';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowinit', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 创建同步任务并发布
   *
   * @param {array} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.owner 所属用户id
   * @param {object} args.sourceNode 源表节点(object)
   * @param {object} args.any object any object.(object)
   * @param {object} args.destNode 目的地节点(object)
   * @param {object} args.workflowConfig 工作流配置(object)
   * @param {boolean} args.comment 是否同步注释信息(新建表)
   * @param {object} args.scheduleConfig 定时配置信息(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createSyncTasks: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/createSyncTasks';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowcreateSyncTasks', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取任务流信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTaskFlow: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/getTaskFlow';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowgetTaskFlow', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 重命名节点
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.nodeId 当前节点id
   * @param {string} args.name 节点名称
   * @param {string} args.description 描述
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  renameNode: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/renameNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowrenameNode', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 拷贝配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.flowId 画布id
   * @param {integer} args.num 拷贝的数量
   * @param {boolean} args.publish 是否发布
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copy: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/copy';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowcopy', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 新增节点
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.flowId 任务流id
   * @param {string} args.upstreamId 上游节点id
   * @param {string} args.name 节点名称
   * @param {string} args.nodeType 节点类型(See: 节点类型)
   * @param {string} args.description 描述
   * @param {boolean} args.isOnTrunk 新增的是否是主干上的节点
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addNode: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlow/addNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'taskFlowaddNode', JSON.stringify(args), $.extend(base, options));
  },
};

export default taskFlow;
