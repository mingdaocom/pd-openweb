export default {
  /**
   * 添加缓存数据
   * @param {Object} args 请求参数
   * @param {string} args.key
   * @param {string} args.value
   * @param {string} args.expireTime 过期时间（不需要的时候不用传）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  add: function (args, options = {}) {
    return mdyAPI('WebCache', 'Add', args, options);
  },
  /**
   * 清理缓存数据
   * @param {Object} args 请求参数
   * @param {string} args.key
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  clear: function (args, options = {}) {
    return mdyAPI('WebCache', 'Clear', args, options);
  },
  /**
   * 批量清理缓存数据
   * @param {Object} args 请求参数
   * @param {array} args.keys
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  clears: function (args, options = {}) {
    return mdyAPI('WebCache', 'Clears', args, options);
  },
  /**
   * 获取缓存数据
   * @param {Object} args 请求参数
   * @param {string} args.key
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options = {}) {
    return mdyAPI('WebCache', 'Get', args, options);
  },
  /**
   * 批量获取缓存数据
   * @param {Object} args 请求参数
   * @param {array} args.keys
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  gets: function (args, options = {}) {
    return mdyAPI('WebCache', 'Gets', args, options);
  },
};
