import base, { controllerName } from './base';
/**
 * package
*/
var package1 = {
  /**
   * 创建API管理
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {添加API管理} {companyId:公司ID(string),defaultFlowNode:默认创建的节点(ref),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  add: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packageadd', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 创建API
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {增加流程} {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}*addProcess
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addApi: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/addApi';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packageaddApi', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] API管理id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getApiList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/getApiList';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'packagegetApiList', args, $.extend(base, options));
  },
  /**
   * 获取API管理列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] 网络id
   * @param {获取API管理} {companyId:网络id 为空则查询 公开的(string),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/getList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packagegetList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 安装
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {apis:选择安装的apis(array),companyId:网络id(string),id:上架或者安装的id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  install: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/install';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packageinstall', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 申请上架
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {apis:选择安装的apis(array),companyId:网络id(string),id:上架或者安装的id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  upper: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/upper';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packageupper', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 验证没有安装的接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {apis:选择安装的apis(array),companyId:网络id(string),id:上架或者安装的id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  validate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/package/validate';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'packagevalidate', JSON.stringify(args), $.extend(base, options));
  },
};
module.exports = package1;
