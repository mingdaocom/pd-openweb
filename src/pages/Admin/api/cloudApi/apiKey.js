/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */
import base, { controllerName } from './base';

const apiKey = {
  /**
   * 创建 API Key。
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 租户 ID
   * @param {array} args.permission 权限范围（枚举值的 int 数组，如 [1,2] 表示仅短信+邮件） 空数组或不传表示全部权限
   * @param {string} args.description 描述
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysCreate: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/create';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysCreate', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除 API Key（逻辑删除）。
   *
   * @param {Object} args 请求参数
   * @param {string} args.apiKeyId API Key ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysDelete: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/delete';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysDelete', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 修改 API Key 描述。
   *
   * @param {Object} args 请求参数
   * @param {string} args.apiKeyId API Key ID。
   * @param {string} args.description API Key 描述。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysDescriptionUpdate: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/description/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysDescriptionUpdate', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 查询 API Key 的 IP 白名单。
   *
   * @param {Object} args 请求参数
   * @param {string} args.apiKeyId API Key ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysIpWhitelistGet: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/ip-whitelist/get';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysIpWhitelistGet', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 保存 API Key 的 IP 白名单（全量覆盖，传空数组表示清空）。
   *
   * @param {Object} args 请求参数
   * @param {string} args.apiKeyId API Key ID
   * @param {array} args.ipWhitelist IP 白名单，支持单个 IP（1.2.3.4）和 CIDR 段（10.0.0.0/8） 传空数组表示清空白名单（允许所有 IP） 上限 100 条
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysIpWhitelistSave: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/ip-whitelist/save';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysIpWhitelistSave', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 分页查询指定 Project 下的所有 API Key。
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 租户 ID
   * @param {string} args.description 描述模糊查询关键字，不传表示不过滤
   * @param {integer} args.page 页码，从 1 开始
   * @param {integer} args.pageSize 每页条数，最大 100
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysList', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 修改 API Key 启用/禁用状态。
   *
   * @param {Object} args 请求参数
   * @param {string} args.apiKeyId API Key ID
   * @param {Object} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  keysStatusUpdate: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/keys/status/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apiKeyKeysStatusUpdate', JSON.stringify(args), $.extend(base, options));
  },
};

export default apiKey;
