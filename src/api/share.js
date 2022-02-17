module.exports = {
  /**
  * 获取知识文件分享信息
  * @param {Object} args 请求参数
  * @param {string} args.shareId 分享id
  * @param {string} args.token API Token（app 能打开分享链接会携带）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getShareNode: function (args, options = {}) {
     
     return $.api('Share', 'GetShareNode', args, options);
   },
  /**
  * 获取文件夹分享信息
  * @param {Object} args 请求参数
  * @param {string} args.shareId 分享id
  * @param {string} args.token API Token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getShareFolder: function (args, options = {}) {
     
     return $.api('Share', 'GetShareFolder', args, options);
   },
  /**
  * 获取本地文件分享信息
  * @param {Object} args 请求参数
  * @param {string} args.fileId 文件id
  * @param {string} args.fromType 来源
  * @param {string} args.token API Token（app 能打开分享链接会携带）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getShareLocalAttachment: function (args, options = {}) {
     
     return $.api('Share', 'GetShareLocalAttachment', args, options);
   },
  /**
  * 对外分享跳转地址检测
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   shareCheckLogin: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Share', 'ShareCheckLogin', args, options);
   },
};
