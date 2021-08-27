import base, { controllerName } from './base';
/**
 * processVersion
*/
var processVersion = {
  /**
   * 流程列表数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] 应用ID 或者 网络ID
   * @param {string} [args.relationType] 类型 0 网络，2应用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  count: function(args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/count';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processcount', args, $.extend(base, options));
  },
  /**
   * 网络流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.apkId] 应用ID
   * @param {string} [args.companyId] 网络id
   * @param {string} [args.enabled] 开启状态 0 全部，1：开启，2：关闭
   * @param {string} [args.isAsc] 是否升序
   * @param {string} [args.keyWords] 搜索框
   * @param {string} [args.pageIndex] 页数
   * @param {string} [args.pageSize] 条数
   * @param {string} [args.sortId] 排序字段id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessByCompanyId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getProcessByCompanyId';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processgetProcessByCompanyId', args, $.extend(base, options));
  },
  /**
   * 流程操作权限
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] 应用ID 或者 流程ID
   * @param {string} [args.relationType] 类型 0 网络，2应用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessRole: function(args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getProcessRole';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processgetProcessRole', args, $.extend(base, options));
  },
  /**
   * 获取流程使用数量和执行次数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] 公司ID ,个人传空
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessUseCount: function(args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getProcessUseCount';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processgetProcessUseCount', args, $.extend(base, options));
  },
  /**
   * 流程列表接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processListType] *流程列表类型：1:工作表触发，2:时间触发，3:其他应用修改本应用，4:应用流程，5:网络流程
   * @param {string} [args.relationId] 应用ID 或者 网络ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  list: function(args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/list';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processlist', args, $.extend(base, options));
  },
};
module.exports = processVersion;