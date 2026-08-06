/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const sms = {
  /**
   * 发送短信，按实际成功发送条数计费
   *
   * @param {Object} args 请求参数
   * @param {array} args.phones 手机号列表
   * @param {string} args.content 短信内容
   * @param {string} args.templateId 短信模板 ID（可选）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendSms: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/sms/v1/send';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'smsSendSms', JSON.stringify(args), $.extend(base, options));
  },
};

export default sms;
