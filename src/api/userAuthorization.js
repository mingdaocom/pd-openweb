export default {
  /**
  * 获取用户授权的应用相关信息
返回相关状态
  * @param {Object} args 请求参数
  * @param {string} args.responseType response_type
  * @param {string} args.clientId client_id
  * @param {string} args.redirectUri redirect_uri
  * @param {string} args.scope scope
  * @param {string} args.state state
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getUserAuthorizationInfo: function (args, options = {}) {
    return mdyAPI('UserAuthorization', 'GetUserAuthorizationInfo', args, options);
  },
  /**
  * 新增用户授权返回的相关信息
返回相关状态以及跳转地址
  * @param {Object} args 请求参数
  * @param {string} args.responseType response_type
  * @param {string} args.clientId client_id
  * @param {string} args.redirectUri redirect_uri
  * @param {string} args.scope scope
  * @param {string} args.state state
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  addUserAuthorization: function (args, options = {}) {
    return mdyAPI('UserAuthorization', 'AddUserAuthorization', args, options);
  },
};
