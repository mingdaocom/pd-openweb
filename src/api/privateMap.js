export default {
  /**
   * 获取可用的地图列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAvailableMapList: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'GetAvailableMapList', args, options);
  },
  /**
   * 获取地图配置列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMapList: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'GetMapList', args, options);
  },
  /**
   * 添加地图配置
   * @param {Object} args 请求参数
   * @param {} args.type
   * @param {object} args.secretDict 密钥信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addMap: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'AddMap', args, options);
  },
  /**
   * 编辑地图配置
   * @param {Object} args 请求参数
   * @param {string} args.id 配置Id
   * @param {object} args.secretDict 密钥信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editMap: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'EditMap', args, options);
  },
  /**
   * 编辑地图配置状态
   * @param {Object} args 请求参数
   * @param {string} args.id 配置Id
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editMapStatus: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'EditMapStatus', args, options);
  },
  /**
   * 编辑地图配置排序
   * @param {Object} args 请求参数
   * @param {object} args.sortDict 排序对象（key:配置Id value:序号）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editMapSort: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'EditMapSort', args, options);
  },
  /**
   * 删除地图配置
   * @param {Object} args 请求参数
   * @param {string} args.id 配置Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeMap: function (args, options = {}) {
    return mdyAPI('PrivateMap', 'RemoveMap', args, options);
  },
};
