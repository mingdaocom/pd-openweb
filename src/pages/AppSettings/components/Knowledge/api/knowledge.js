import base, { controllerName } from './base';

export default {
  /**
   * 创建知识库
   * @param {Object} args 请求参数
   * @param {string} args.name 名称
   * @param {string} args.description 描述
   * @param {string} args.apkId 应用id
   * @param {array} args.collections 知识源列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  createKnowledgeBase: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeBase';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 获取知识库列表
   * @param {Object} args 请求参数
   * @param {string} args.apkId 应用id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getKnowledgeBase: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeBase';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 获取知识库详情
   * @param {Object} args 请求参数
   * @param {string} args.id 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getKnowledgeBaseDetail: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeBase/${args.id}`;
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'knowledgeBase', {}, $.extend(base, options));
  },

  /**
   * 更新知识库
   * @param {Object} args 请求参数
   * @param {string} args.id 知识库id
   * @param {string} args.name 名称
   * @param {string} args.description 描述
   */
  updateKnowledgeBase: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeBase/${args.id}/update`;
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 删除知识库
   * @param {Object} args 请求参数
   * @param {string} args.id 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  deleteKnowledgeBase: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeBase/${args.id}/delete`;
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeBase', {}, $.extend(base, options));
  },

  /**
   * 获取知识库分块统计
   * @param {Object} args 请求参数
   * @param {string} args.id 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getKnowledgeBaseChunksStatistics: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeBase/chunks/statistics';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 知识库检索
   * @param {Object} args 请求参数
   * @param {string} args.query 关键词
   * @param {array} args.knowledgeIds 知识库id
   * @param {array} args.worksheetIds 工作表id
   * @param {array} args.searchTypes 检索类型
   * @param {array} args.searchMode 检索模式
   * @param {string} args.topK 召回数量
   * @param {string} args.minRelevance 最低相关度
   * @param {string} args.rrfK RRF融合参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getKnowledgeBaseSearch: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeBase/search';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 获取知识库使用情况
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  getKnowledgeBaseUsage: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeBase/usage';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },

  /**
   * 重置知识库数据
   * @param {Object} args 请求参数
   * @param {string} args.id 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  resetData: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + `/knowledgeBase/${args.id}/resetData`;
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeBase', args, $.extend(base, options));
  },
};
