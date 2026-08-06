/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const litellm = {
  /**
   * 接收 LiteLLM 批量用量回调，并触发 AI 模型统一扣费。
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  litellmCallbackBilling: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/litellm/callback/billing';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'litellmLitellmCallbackBilling', JSON.stringify(args), $.extend(base, options));
  },
};

export default litellm;
