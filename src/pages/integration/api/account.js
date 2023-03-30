import base, { controllerName } from './base';

var account = {

  /**
   * 获取用户信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.accountId No comments found.
   * @param {array} args.accountIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAccount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'account/getAccount';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'accountgetAccount', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取用户信息（批量）
   *
   * @param {Object} args 请求参数
   * @param {string} args.accountId No comments found.
   * @param {array} args.accountIds No comments found.
   * @param {string} args.projectId No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAccounts: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'account/getAccounts';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'accountgetAccounts', JSON.stringify(args), $.extend(base, options));
  }
};

export default account;