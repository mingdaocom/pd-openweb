export default {
  /**
  * 添加
  * @param {Object} args 请求参数
  * @param {string} args.key
  * @param {string} args.value
  * @param {string} args.expireTime 过期时间（不需要的时候不用传）
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
  * 获取批量
  * @param {Object} args 请求参数
  * @param {array} args.keys
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   gets: function (args, options = {}) {
     
     return $.api('WebCache', 'Gets', args, options);
   },
};
