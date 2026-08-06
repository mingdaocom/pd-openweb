/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const health = {
  /**
   * 校验 API Key 可用性，返回权限范围与可用服务列表
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  healthCheck: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/health';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'healthHealthCheck', JSON.stringify(args), $.extend(base, options));
  },
};

export default health;
