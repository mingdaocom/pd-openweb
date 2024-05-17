export default {
  /**
  * 链接列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLinkList: function (args, options = {}) {
     
     return mdyAPI('PrivateLink', 'GetLinkList', args, options);
   },
  /**
  * 添加链接
  * @param {Object} args 请求参数
  * @param {array} args.links 链接
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLink: function (args, options = {}) {
     
     return mdyAPI('PrivateLink', 'AddLink', args, options);
   },
};
