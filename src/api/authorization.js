export default {
  /**
  * 生成令牌
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.type 类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAuthorization: function (args, options = {}) {
     
     return mdyAPI('Authorization', 'AddAuthorization', args, options);
   },
  /**
  * 获取令牌列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.type 类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizationByType: function (args, options = {}) {
     
     return mdyAPI('Authorization', 'GetAuthorizationByType', args, options);
   },
};
