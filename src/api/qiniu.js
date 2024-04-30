export default {
  /**
  * 获取七牛上传 token
  * @param {Object} args 请求参数
  * @param {array} args.files 批量上传文件token 请求对象
  * @param {} args.type
  * @param {string} args.worksheetId 默认为工作表ID，注：插件使用此ID
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUploadToken: function (args, options = {}) {
     
     return mdyAPI('Qiniu', 'GetUploadToken', args, options);
   },
  /**
  * 获取七牛上传 token
  * @param {Object} args 请求参数
  * @param {array} args.files 批量上传文件token 请求对象
  * @param {} args.type
  * @param {string} args.worksheetId 默认为工作表ID，注：插件使用此ID
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFileUploadToken: function (args, options = {}) {
     
     return mdyAPI('Qiniu', 'GetFileUploadToken', args, options);
   },
};
