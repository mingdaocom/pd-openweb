import base, { controllerName } from './base';

export default {
  /**
   * 开始向量化
   * @param {Object} args 请求参数
   * @param {string} args.knowledgeId 知识库id
   * @param {boolean} args.knowledgeOrCollectionPresent 是否是知识库或知识源
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  startKnowledgeVector: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeVector/start';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeVector', args, $.extend(base, options));
  },

  /**
   * 取消向量化
   * @param {Object} args 请求参数
   * @param {string} args.knowledgeId 知识库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   **/
  cancelKnowledgeVector: function (args, options = {}) {
    base.ajaxOptions.url = base.server() + '/knowledgeVector/cancel';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'knowledgeVector', args, $.extend(base, options));
  },
};
