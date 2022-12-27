export default {
  /**
  * 获取系统设置
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountSettings: function (args, options = {}) {
     
     return $.api('AccountSetting', 'GetAccountSettings', args, options);
   },
  /**
  * 更新系统设置
  * @param {Object} args 请求参数
  * @param {string} args.settingType 设置项 PrivateMobile=9, PrivateEmail=10、AllowMultipleDevicesUse=16、
  * @param {string} args.settingValue 设置值1:true, 0:false
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountSetting: function (args, options = {}) {
     
     return $.api('AccountSetting', 'EditAccountSetting', args, options);
   },
  /**
  * 更新系统设置
  * @param {Object} args 请求参数
  * @param {string} args.items 设置项
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountSettingItems: function (args, options = {}) {
     
     return $.api('AccountSetting', 'EditAccountSettingItems', args, options);
   },
  /**
  * 获取签名
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSign: function (args, options = {}) {
     
     return $.api('AccountSetting', 'GetSign', args, options);
   },
  /**
  * 修改签名
  * @param {Object} args 请求参数
  * @param {integer} args.bucket
  * @param {string} args.key key(文件路径，不带域名)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSign: function (args, options = {}) {
     
     return $.api('AccountSetting', 'EditSign', args, options);
   },
};
