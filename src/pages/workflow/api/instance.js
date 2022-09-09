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
    return $.api(controllerName, 'instancecount', args, $.extend(base, options));
  },
  /**
   * 审批-转审
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  forward: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/forward';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instanceforward', JSON.stringify(args), $.extend(base, options));
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
    return $.api(controllerName, 'instancegetHistoryDetail', args, $.extend(base, options));
  },
  /**
   * 获取历史运行列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
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
    return $.api(controllerName, 'instancegetHistoryList', args, $.extend(base, options));
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
    return $.api(controllerName, 'instancegetInstance', args, $.extend(base, options));
  },
  /**
   * 对应各种操作
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {各种操作类型} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),operationType:操作类型 3撤回 4通过申请 5拒绝申请 6转审 7加签 9提交 10转交 16添加审批人 18催办(integer),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  operation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/operation';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instanceoperation', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-否决
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  overrule: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/overrule';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instanceoverrule', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-通过
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  pass: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/pass';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instancepass', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 撤回
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  revoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/revoke';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instancerevoke', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 审批-加签
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  signTask: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/sign';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instancesign', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 填写动作-提交
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  submit: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/submit';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instancesubmit', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 填写动作-填写转给其他人
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {审批动作} {backNodeId:退回节点ID(string),before:加签前后(boolean),data:编辑的控件数据 web端使用(ref),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),opinion:意见(string),signature:签名(ref),workId:workId(string),}*requestWork
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  transfer: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/transfer';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'instancetransfer', JSON.stringify(args), $.extend(base, options));
  },
};
module.exports = instance;