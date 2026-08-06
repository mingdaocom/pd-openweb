/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const email = {
  /**
   * 发送邮件，发送成功后按 1 封计费
   *
   * @param {Object} args 请求参数
   * @param {string} args.to 收件人邮箱
   * @param {string} args.subject 邮件主题
   * @param {string} args.htmlBody HTML 正文
   * @param {string} args.from 发件人邮箱（可选，使用系统默认值）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendEmail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/email/v1/send';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'emailSendEmail', JSON.stringify(args), $.extend(base, options));
  },
};

export default email;
