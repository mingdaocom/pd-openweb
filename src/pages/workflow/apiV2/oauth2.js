import base, { controllerName } from './base';
/**
 * oauth2
*/
const oauth2 = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateAccessToken: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/updateAccessToken';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2updateAccessToken', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  refreshToken: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshToken';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshToken', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  refreshClientCredentials: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshClientCredentials';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshClientCredentials', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  refreshAuthorize: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/refreshAuthorize';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2refreshAuthorize', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getRefreshTokenLogs: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getRefreshTokenLogs';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getRefreshTokenLogs', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getRefreshClientCredentialsLogs: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getRefreshClientCredentialsLogs';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getRefreshClientCredentialsLogs', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getMyTokenList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getMyAccessTokenList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getMyAccessTokenList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getAllTokenList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/getAllAccessTokenList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2getAllAccessTokenList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  authorize: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/oauth2/authorize';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'oauth2authorize', args, $.extend({}, base, options));
  },
};
export default oauth2;