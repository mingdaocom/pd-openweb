module.exports = {
  /**
  * 获取免审信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   get: function (args, options = {}) {
     
     return $.api('NoVerify', 'Get', args, options);
   },
  /**
  * 获取免审文件预览信息
  * @param {Object} args 请求参数
  * @param {string} args.fileUrl 文件url ，不带token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPreview: function (args, options = {}) {
     
     return $.api('NoVerify', 'GetPreview', args, options);
   },
  /**
  * 更新免审信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.fileUrl 文件url ，不带token
  * @param {string} args.fileName 文件名称
  * @param {array} args.cellConfigs 导入映射配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   update: function (args, options = {}) {
     
     return $.api('NoVerify', 'Update', args, options);
   },
  /**
  * 删除免审信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   delete: function (args, options = {}) {
     
     return $.api('NoVerify', 'Delete', args, options);
   },
};
