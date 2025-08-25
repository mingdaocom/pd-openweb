export default {
  /**
   * 获取资源列表
   * @param {Object} args 请求参数
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSources: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'GetSources', args, options);
  },
  /**
   * 添加资源
   * @param {Object} args 请求参数
   * @param {string} args.name 名称
   * @param {string} args.color 图标颜色
   * @param {string} args.icon 图标
   * @param {} args.linkParams
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addSource: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'AddSource', args, options);
  },
  /**
   * 修改资源
   * @param {Object} args 请求参数
   * @param {string} args.id 资源id
   * @param {string} args.name 名称
   * @param {string} args.color 图标颜色
   * @param {string} args.icon 图标
   * @param {} args.linkParams
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSource: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'EditSource', args, options);
  },
  /**
   * 修改资源状态
   * @param {Object} args 请求参数
   * @param {string} args.id 资源id
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSourceStatus: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'EditSourceStatus', args, options);
  },
  /**
   * 修改资源排序，全量提交
   * @param {Object} args 请求参数
   * @param {object} args.sortMap 排序集合（key：资源id, value: 序号，从1开始）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSourceSort: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'EditSourceSort', args, options);
  },
  /**
   * 删除资源
   * @param {Object} args 请求参数
   * @param {string} args.id 资源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeSource: function (args, options = {}) {
    return mdyAPI('PrivateSource', 'RemoveSource', args, options);
  },
};
