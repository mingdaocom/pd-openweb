export default {
  /**
  * 添加
  * @param {Object} args 请求参数
  * @param {string} args.value
  * @param {string} args.key
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   add: function (args, options = {}) {
     
     return $.api('WebCache', 'Add', args, options);
   },
  /**
  * 单个清理
  * @param {Object} args 请求参数
  * @param {string} args.key
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   clear: function (args, options = {}) {
     
     return $.api('WebCache', 'Clear', args, options);
   },
  /**
  * 批量清理
  * @param {Object} args 请求参数
  * @param {array} args.keys
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   clears: function (args, options = {}) {
     
     return $.api('WebCache', 'Clears', args, options);
   },
  /**
  * 获取单体
  * @param {Object} args 请求参数
  * @param {string} args.key
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   get: function (args, options = {}) {
     
     return $.api('WebCache', 'Get', args, options);
   },
  /**
  * 测试获取模板key
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   gets: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('WebCache', 'Gets', args, options);
   },
  /**
  * 测试发送自定义消息(测试完了，上线前删掉)
  * @param {Object} args 请求参数
  * @param {string} args.downloadUrl
  * @param {string} args.id
  * @param {string} args.msg
  * @param {string} args.title
  * @param {integer} args.status
  * @param {string} args.color
  * @param {string} args.link
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   testSendMessage: function (args, options = {}) {
     
     return $.api('WebCache', 'TestSendMessage', args, options);
   },
};
