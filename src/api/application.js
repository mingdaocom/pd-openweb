module.exports = {
  /**
  * 获取用户安装应用 包括置顶
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountApps: function (args, options = {}) {
     
     return $.api('Application', 'GetAccountApps', args, options);
   },
  /**
  * 应用置顶
  * @param {Object} args 请求参数
  * @param {boolean} args.isTop 是否置顶
  * @param {array} args.apps 应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAccountAppTop: function (args, options = {}) {
     
     return $.api('Application', 'UpdateAccountAppTop', args, options);
   },
  /**
  * 创建应用
  * @param {Object} args 请求参数
  * @param {string} args.appName 名称
  * @param {string} args.about 描述
  * @param {string} args.avatar 图标（上传的路径为 mdpub 下 /Apps/AppsImages/icon/，只需要文件名部分如：a.png）
  * @param {string} args.appUrl 应用地址
  * @param {string} args.callbackUrl 回调地址
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addApplication: function (args, options = {}) {
     
     return $.api('Application', 'AddApplication', args, options);
   },
  /**
  * 修改应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appName 名称
  * @param {string} args.about 描述
  * @param {string} args.avatar 图标（上传的路径为 mdpub 下 /Apps/AppsImages/icon/，只需要文件名部分如：a.png）
  * @param {string} args.appUrl 应用地址
  * @param {string} args.callbackUrl 回调地址
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editApplication: function (args, options = {}) {
     
     return $.api('Application', 'EditApplication', args, options);
   },
  /**
  * 删除应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeApplication: function (args, options = {}) {
     
     return $.api('Application', 'RemoveApplication', args, options);
   },
  /**
  * 获取网络应用列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectApplicationList: function (args, options = {}) {
     
     return $.api('Application', 'GetProjectApplicationList', args, options);
   },
};
