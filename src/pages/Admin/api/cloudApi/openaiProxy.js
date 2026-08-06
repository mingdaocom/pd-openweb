/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const openaiProxy = {
  /**
   * 校验当前客户端 API Key 是否可用于 AI 模型服务。
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOpenaiClientKeyValidate: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/openai/client/key/validate';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(
      controllerName,
      'openaiProxyGetOpenaiClientKeyValidate',
      JSON.stringify(args),
      $.extend(base, options),
    );
  },

  /**
   * 获取统一模型列表。
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOpenaiClientModels: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/openai/client/models';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'openaiProxyGetOpenaiClientModels', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 透明代理转发：将请求原样转发至 LiteLLM，替换 Authorization 为虚拟 Key，支持流式（SSE）响应。
   *
   * @param {Object} args 请求参数
   * @param {string} args.path OpenAI 接口路径，如 chat/completions、models、embeddings 等
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOpenaiV1: function (args, options) {
    const { path, ...rest } = args;
    base.ajaxOptions.url =
      base.server(options) + '/openai/v1/' + path.split('/').map(encodeURIComponent).join('/') + '';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'openaiProxyGetOpenaiV1', JSON.stringify(rest), $.extend(base, options));
  },

  /**
   * 透明代理转发：将请求原样转发至 LiteLLM，替换 Authorization 为虚拟 Key，支持流式（SSE）响应。
   *
   * @param {Object} args 请求参数
   * @param {string} args.path OpenAI 接口路径，如 chat/completions、models、embeddings 等
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  openaiV1: function (args, options) {
    const { path, ...rest } = args;
    base.ajaxOptions.url =
      base.server(options) + '/openai/v1/' + path.split('/').map(encodeURIComponent).join('/') + '';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'openaiProxyOpenaiV1', JSON.stringify(rest), $.extend(base, options));
  },
};

export default openaiProxy;
