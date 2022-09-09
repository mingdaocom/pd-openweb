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
  * @param {integer} args.type 免审类型 0 = excel ,1= 工作表查询
  * @param {integer} args.status 状态 0 = 开启，1=关闭
  * @param {string} args.fileUrl 文件url ，不带token
  * @param {string} args.fileName 文件名称
  * @param {array} args.cellConfigs 导入映射配置
  * @param {} args.query 工作表查询保存对象
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
  /**
  * 测试免审配置
  * @param {Object} args 请求参数
  * @param {string} args.state 验证码或者微信登录成功之后返回的临时状态码
用于反向存储账户相关信息，具备有效期
  * @param {array} args.receiveControls 用户填写信息
  * @param {boolean} args.autoLogin 是否自动登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   verify: function (args, options = {}) {
     
     return $.api('NoVerify', 'Verify', args, options);
   },
};
