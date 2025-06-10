import base, { controllerName } from './base';
/**
 * oauth2
*/
var oauth2 = {
  /**
   * 添加授权
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2Authorize} {id:packageId(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  authorize: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/authorize';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2authorize', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取某个连接下的所有token列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestAccessTokenList} {apiId:具体apiId(string),id:packageId(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAllTokenList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getAllAccessTokenList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getAllAccessTokenList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取我的某个连接下的token列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestAccessTokenList} {apiId:具体apiId(string),id:packageId(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getMyTokenList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getMyAccessTokenList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getMyAccessTokenList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 客户端凭证刷新日志列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2RefreshAuthorize} {endDate:结束时间 yyyy-MM-dd(string),id:authId或者连接id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),startDate:开始时间 yyyy-MM-dd(string),status:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getRefreshClientCredentialsLogs: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getRefreshClientCredentialsLogs';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getRefreshClientCredentialsLogs', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 刷新token日志列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2RefreshAuthorize} {endDate:结束时间 yyyy-MM-dd(string),id:authId或者连接id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),startDate:开始时间 yyyy-MM-dd(string),status:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getRefreshTokenLogs: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getRefreshTokenLogs';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getRefreshTokenLogs', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 重新授权
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2RefreshAuthorize} {endDate:结束时间 yyyy-MM-dd(string),id:authId或者连接id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),startDate:开始时间 yyyy-MM-dd(string),status:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  refreshAuthorize: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshAuthorize';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshAuthorize', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 客户端凭证重新授权
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2RefreshAuthorize} {endDate:结束时间 yyyy-MM-dd(string),id:authId或者连接id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),startDate:开始时间 yyyy-MM-dd(string),status:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  refreshClientCredentials: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshClientCredentials';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshClientCredentials', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 刷新token
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestOAuth2RefreshAuthorize} {endDate:结束时间 yyyy-MM-dd(string),id:authId或者连接id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),startDate:开始时间 yyyy-MM-dd(string),status:状态(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  refreshToken: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshToken';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshToken', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改token名字和状态
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestAccessToken} {id:authId(string),name:name(string),status:1有效 0失效 -1删除(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateAccessToken: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/updateAccessToken';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2updateAccessToken', JSON.stringify(args), $.extend(base, options));
  },
};
export default oauth2;