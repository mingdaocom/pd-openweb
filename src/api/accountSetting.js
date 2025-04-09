export default {
  /**
  * 获取系统设置
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountSettings: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'GetAccountSettings', args, options);
   },
  /**
  * 更新个人系统设置
  * @param {Object} args 请求参数
  * @param {string} args.settingType 设置项[枚举值]
PrivateMobile=9;PrivateEmail=10;AllowMultipleDevicesUse=16;AddressBookOftenMetioned=22
  * @param {string} args.settingValue 设置值1:true, 0:false
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountSetting: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'EditAccountSetting', args, options);
   },
  /**
  * 自动修改账号语言设置
  * @param {Object} args 请求参数
  * @param {} args.langType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   autoEditAccountLangSetting: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'AutoEditAccountLangSetting', args, options);
   },
  /**
  * 获取用户上次签名
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSign: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'GetSign', args, options);
   },
  /**
  * 修改用户当前签名
  * @param {Object} args 请求参数
  * @param {string} args.url 签名url
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSign: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'EditSign', args, options);
   },
  /**
  * 修改用户加入的组织排序
  * @param {Object} args 请求参数
  * @param {array} args.projectIds 所有的排序组织ID
从开始到最后排序
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editJoinedProjectSort: function (args, options = {}) {
     
     return mdyAPI('AccountSetting', 'EditJoinedProjectSort', args, options);
   },
};
