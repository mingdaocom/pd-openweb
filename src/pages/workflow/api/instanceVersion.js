import base, { controllerName } from './base';
/**
 * instanceVersion
*/
var instanceVersion = {
  /**
   * 批量操作
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestBatch} {apkId:应用id(string),batchOperationType:批量操作类型 可操作动作 3撤回 4通过 5拒绝 6转审 7加签 9提交 10转交 12打印(integer),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),id:单个实例id(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),selects:批量选择(array),startDate:开始时间 yyyy-MM-dd(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),workId:单个运行id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  batch: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/batch';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1instancebatch', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 中止执行
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.instanceId] *instanceId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  endInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/endInstance';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1instanceendInstance', args, $.extend(base, options));
  },
  /**
   * 获取流程实例详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.id] *流程实例id
   * @param {string} [args.workId] *工作Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  get: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/get';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1instanceget', args, $.extend(base, options));
  },
  /**
   * 获取待处理数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTodoCount: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoCount';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1instancegetTodoCount', args, $.extend(base, options));
  },
  /**
   * 获取待处理列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestTodo} {apkId:应用id(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startDate:开始时间 yyyy-MM-dd(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTodoList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1instancegetTodoList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 待处理筛选器
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestTodo} {apkId:应用id(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startDate:开始时间 yyyy-MM-dd(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTodoListFilter: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoListFilter';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1instancegetTodoListFilter', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取流程实例对应实体
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.id] *流程实例id
   * @param {string} [args.workId] *工作Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getWorkItem: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getWorkItem';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1instancegetWorkItem', args, $.extend(base, options));
  },
  /**
   * 执行历史重试
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.instanceId] *instanceId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  resetInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/resetInstance';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1instanceresetInstance', args, $.extend(base, options));
  },
};
module.exports = instanceVersion;