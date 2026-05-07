import base, { controllerName } from './base';

export default {
  /**
   * 创建知识源
   * @param {Object} args 请求参数
   * @param {string} args.knowledgeId 知识库id
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.controlIds 控件id
   * @param {boolean} args.parseEnhanced 是否解析增强
   * @param {boolean} args.discussionEnabled 是否启用讨论
   * @param {boolean} args.attachmentParseEnhanced 是否附件解析增强
   * @param {string} args.filterId 筛选器id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  createKnowledgeCollection: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeCollection';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeCollection', args, $.extend(base, options));
  },

  /**
   * 更新知识源
   * @param {Object} args 请求参数
   * @param {string} args.id 知识源id
   * @param {string} args.knowledgeId 知识库id
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.controlIds 控件id
   * @param {boolean} args.parseEnhanced 是否解析增强
   * @param {boolean} args.attachmentParseEnhanced 是否附件解析增强
   * @param {boolean} args.discussionEnabled 是否启用讨论
   * @param {string} args.filterId 筛选器id
   * @param {boolean} args.initData 是否对已向量化的数据同时生效
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  updateKnowledgeCollection: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeCollection/${args.id}/update`;
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeCollection', args, $.extend(base, options));
  },

  /**
   * 删除知识源
   * @param {Object} args 请求参数
   * @param {string} args.id 知识源id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  deleteKnowledgeCollection: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeCollection/${args.id}/delete`;
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeCollection', {}, $.extend(base, options));
  },
};
