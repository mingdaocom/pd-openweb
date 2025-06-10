import base, { controllerName } from './base';
/**
 * instance
*/
var instance = {
  /**
   * 获取待处理列表总数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  count: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/count';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancecount', args, $.extend(base, options));
  },
  /**
   * 审批-转审
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  forward: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/forward';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceforward', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取归档服务地址
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getArchivedList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getArchivedList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetArchivedList', args, $.extend(base, options));
  },
  /**
   * 获取历史详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.instanceId] *流程实例ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getHistoryDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetHistoryDetail', args, $.extend(base, options));
  },
  /**
   * 获取历史运行列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.archivedId] archivedId
   * @param {Date} [args.endDate] 结束时间
   * @param {String} [args.instanceId] 主instanceId(根据主历史查子流程历史使用)
   * @param {int} [args.pageIndex] 页数
   * @param {int} [args.pageSize] 每页数量
   * @param {String} [args.processId] *流程ID
   * @param {Date} [args.startDate] 开始时间
   * @param {int} [args.status] 状态
   * @param {String} [args.title] 名称
   * @param {String} [args.workId] 主workId(根据主历史查子流程历史使用)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getHistoryList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetHistoryList', args, $.extend(base, options));
  },
  /**
   * 获取实例基本信息
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.instanceId] *流程实例ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getInstance';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetInstance', args, $.extend(base, options));
  },
  /**
   * 获取操作窗口详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.id] *流程实例id
   * @param {string} [args.workId] *工作Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getOperationDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getOperationDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetOperationDetail', args, $.extend(base, options));
  },
  /**
   * 获取操作历史
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.instanceId] *流程实例ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getOperationHistoryList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getOperationHistoryList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetOperationHistoryList', args, $.extend(base, options));
  },
  /**
   * 对应各种操作
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {各种操作类型} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),operationType:操作类型 3撤回 4通过申请 5拒绝申请 6转审 7加签 9提交 10转交 16添加审批人 18催办(integer),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  operation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/operation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceoperation', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-否决
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  overrule: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/overrule';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceoverrule', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-通过
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  pass: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/pass';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancepass', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 重新发起
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  restart: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/restart';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancerestart', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 撤回
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  revoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/revoke';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancerevoke', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-加签
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  signTask: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/sign';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancesign', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 填写动作-提交
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  submit: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/submit';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancesubmit', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批人撤回
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  taskRevoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/taskRevoke';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancetaskRevoke', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 填写动作-填写转给其他人
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  transfer: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/transfer';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancetransfer', JSON.stringify(args), $.extend(base, options));
  },
};
export default instance;
