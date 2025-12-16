import base, { controllerName } from './base';

/**
 * Plugin
 */
const Plugin = {
  /**
   * 创建流程插件
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {CreatePluginRequest} {appId:appId(string),icon:插件图标(string),iconColor:插件图标颜色(string),name:插件名称(string),pluginType:插件类型(integer),projectId:网络id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  create: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/Create';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginCreate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 编辑
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {EditPluginRequest} {icon:插件图标(string),iconColor:插件图标颜色(string),id:插件id(string),name:插件名称(string),source:插件来源(integer),state:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  edit: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/Edit';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginEdit', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取所有插件
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {GetAllRequest} {appId:应用id(string),keyWords:关键字搜索（插件名称）(string),pageIndex:当前页(integer),pageSize:页条数(integer),projectId:网络id(string),state:是否启用状态(integer),type:插件类型(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/GetAll';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginGetAll', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取单个插件详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {GetDetailRequest} {appId:应用id(string),id:插件id(string),projectId:网络id(string),source:插件来源(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/GetDetail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginGetDetail', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取插件列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {GetListRequest} {creator:创建者(string),keyWords:关键字搜索（插件名称）(string),pageIndex:当前页(integer),pageSize:页大小(integer),pluginType:插件类型(integer),projectId:网络id(string),state:是否启用状态(integer),type:类型，组织或者个人(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/GetList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginGetList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取版本历史
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {GetReleaseHistoryRequest} {id:插件id(string),pageIndex:当前页(integer),pageSize:页大小(integer),source:插件来源(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReleaseHistory: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/GetReleaseHistory';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginGetReleaseHistory', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取插件使用明细
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {GetUseDetailRequest} {appId:应用id(string),id:插件id(string),keywords:关键字搜索（插件名称）(string),pageIndex:当前页(integer),pageSize:页大小(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getUseDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/GetUseDetail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginGetUseDetail', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 发布插件的新版本
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {ReleaseRequest} {configuration:配置(object),description:说明(string),id:提交历史记录id(string),pluginId:插件id(string),pluginSource:插件来源(integer),versionCode:版本号(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  release: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/Release';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginRelease', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RemovePluginRequest} {id:插件id(string),source:插件来源(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  remove: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/Remove';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginRemove', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 回滚到某一个版本
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RollbackRequest} {pluginId:插件id(string),releaseId:版本id(string),source:插件来源(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  rollback: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/Plugin/Rollback';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'PluginRollback', JSON.stringify(args), $.extend(base, options));
  },
};
export default Plugin;
