define(function (require, exports, module) {
  module.exports = {
    /**
    * 根据文件夹id获取
    * @param {Object} args 请求参数
    * @param {} args.rootType 所属类型
    * @param {string} args.parentId 父节点id
    * @param {string} args.keywords 关键词
    * @param {} args.status 节点状态
    * @param {} args.sortBy 排序字段
    * @param {} args.sortType 排序类型
    * @param {integer} args.skip 页码
    * @param {integer} args.limit 页大小
    * @param {} args.nodeType 节点类型
    * @param {array} args.filterIDs 过滤的节点id
    * @param {string} args.shareFolderId 文件夹id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getNodesByShareFolderId: function (args, options) {
      return $.api('ShareFolder', 'GetNodesByShareFolderId', args, options);
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
    getParentNode: function (args, options) {
      return $.api('ShareFolder', 'GetParentNode', args, options);
    },

    /**
    * 知识文件夹分享专用获取节点信息不需要登陆
    * @param {Object} args 请求参数
    * @param {string} args.id 节点id
    * @param {string} args.path 路径
    * @param {} args.actionType 查看类型是分享地址还是从知识中心读取
    * @param {string} args.versionId 版本Id
    * @param {boolean} args.isOldest 获取最老的版本
    * @param {string} args.shareFolderId 文件夹id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getNodeDetail: function (args, options) {
      return $.api('ShareFolder', 'GetNodeDetail', args, options);
    },

    /**
    * 获取节点详情
    * @param {Object} args 请求参数
    * @param {string} args.id 节点id
    * @param {string} args.path 路径
    * @param {} args.actionType 查看类型是分享地址还是从知识中心读取
    * @param {string} args.versionId 版本Id
    * @param {boolean} args.isOldest 获取最老的版本
    * @param {string} args.shareFolderId 文件夹id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getNodeDetailCheck: function (args, options) {
      return $.api('ShareFolder', 'GetNodeDetailCheck', args, options);
    },

  };
});
