import base, { controllerName } from './base';

export default {
  /**
   * 获取分块列表
   * @param {Object} args 请求参数
   * @param {array} args.collectionIds 知识源id
   * @param {array} args.types 分块类型
   * @param {string} args.pageIndex 页码
   * @param {string} args.pageSize 每页条数
   * @param {string} args.keywords 关键词
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getChunkList: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/chunks/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chunks', args, $.extend(base, options));
  },

  /**
   * 获取分块详情
   * @param {Object} args 请求参数
   * @param {array} args.types 分块类型
   * @param {string} args.fileId 文件id
   * @param {string} args.rowId 记录id
   * @param {string} args.pageSize 每页条数
   * @param {string} args.pageIndex 页码
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.knowledgeId 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getChunkDetail: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/chunks/detail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chunks', args, $.extend(base, options));
  },
};
