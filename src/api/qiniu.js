export default {
  /**
  * 获取七牛上传 token
  * @param {Object} args 请求参数
  * @param {array} args.files 批量上传文件token 请求对象
  * @param {} args.type Token类型，不同类型有不同限制，包括路径、MIME类型等
0=普通，1= 用户头像，2=群组头像，3=聊天群组头像,4=组织Logo，5=自定义图标,6=第三方应用，
7=文件中心，8=应用相关Excel/CSV，9=富文本，10=签名，20=插件
  * @param {string} args.worksheetId 默认为工作表ID，注：插件使用此ID
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUploadToken: function (args, options = {}) {
     
     return $.api('Qiniu', 'GetUploadToken', args, options);
   },
  /**
  * 获取七牛上传 token
  * @param {Object} args 请求参数
  * @param {array} args.files 批量上传文件token 请求对象
  * @param {} args.type Token类型，不同类型有不同限制，包括路径、MIME类型等
0=普通，1= 用户头像，2=群组头像，3=聊天群组头像,4=组织Logo，5=自定义图标,6=第三方应用，
7=文件中心，8=应用相关Excel/CSV，9=富文本，10=签名，20=插件
  * @param {string} args.worksheetId 默认为工作表ID，注：插件使用此ID
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFileUploadToken: function (args, options = {}) {
     
     return $.api('Qiniu', 'GetFileUploadToken', args, options);
   },
};
