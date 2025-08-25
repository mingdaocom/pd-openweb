export default {
  /**
   * 根据文件夹id获取
   * @param {Object} args 请求参数
   * @param {} args.rootType
   * @param {string} args.parentId 父节点id
   * @param {string} args.keywords 关键词
   * @param {} args.status
   * @param {} args.sortBy
   * @param {} args.sortType
   * @param {integer} args.skip 页码
   * @param {integer} args.limit 页大小
   * @param {} args.nodeType
   * @param {array} args.filterIDs 过滤的节点id
   * @param {string} args.shareFolderId 文件夹id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getNodesByShareFolderId: function (args, options = {}) {
    return mdyAPI('ShareFolder', 'GetNodesByShareFolderId', args, options);
  },
  /**
   * 递归获取路径的id
   * @param {Object} args 请求参数
   * @param {string} args.parentId 父节点id
   * @param {string} args.shareFolderId 文件夹id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getParentNode: function (args, options = {}) {
    return mdyAPI('ShareFolder', 'GetParentNode', args, options);
  },
};
