export default {
  /**
   * iOS推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.bundleId 包名
   * @param {} args.certKV
   * @param {} args.secretKV
   * @param {string} args.password 密码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setIosPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetIosPushSetting', args, options);
  },
  /**
   * 小米推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.packageName 包名
   * @param {string} args.channelId 频道Id
   * @param {string} args.appSecret 密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setMiPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetMiPushSetting', args, options);
  },
  /**
   * 华为推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.appSecret 应用密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setHuaweiPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetHuaweiPushSetting', args, options);
  },
  /**
   * Vivo推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.appKey 应用Key
   * @param {string} args.appSecret 应用密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setVivoPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetVivoPushSetting', args, options);
  },
  /**
   * Oppo推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.appKey 应用Key
   * @param {string} args.masterSecret 密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setOppoPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetOppoPushSetting', args, options);
  },
  /**
   * 极光推送渠道配置
   * @param {Object} args 请求参数
   * @param {string} args.appKey 应用Key
   * @param {string} args.masterSecret 密钥
   * @param {string} args.packageName 包名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setJPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetJPushSetting', args, options);
  },
  /**
   * 开启/关闭渠道
   * @param {Object} args 请求参数
   * @param {} args.pushMode
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setPushSettingEnable: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'SetPushSettingEnable', args, options);
  },
  /**
   * 删除渠道
   * @param {Object} args 请求参数
   * @param {} args.pushMode
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deletePushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'DeletePushSetting', args, options);
  },
  /**
   * 获取渠道配置列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPushSetting: function (args, options = {}) {
    return mdyAPI('PrivatePush', 'GetPushSetting', args, options);
  },
};
