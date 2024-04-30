export default {
  /**
  * 获取附件下载限制
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAttachmentSetting: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'GetAttachmentSetting', args, options);
   },
  /**
  * 修改附件下载设置状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {integer} args.status 状态（0 = 关闭，1 = 开启）
  * @param {integer} args.limitType 限制类型(0 = 全部，1= 移动端（H5）)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAttachmentSetting: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'EditAttachmentSetting', args, options);
   },
  /**
  * 添加附件下载设置白名单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.whiteList 白名单
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAttachmentWhiteList: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'AddAttachmentWhiteList', args, options);
   },
  /**
  * 移除附件下载设置白名单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.whiteList 白名单
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeAttachmentWhiteList: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'RemoveAttachmentWhiteList', args, options);
   },
  /**
  * 编辑下载设置白名单
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.whiteList 白名单
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAttachmentWhiteList: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'EditAttachmentWhiteList', args, options);
   },
  /**
  * 获取附件上传限制
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLimits: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'GetLimits', args, options);
   },
  /**
  * 编辑附件上传限制
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {integer} args.size 组织限制(单位：byte)
  * @param {array} args.limits 业务实体限制
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLimits: function (args, options = {}) {
     
     return mdyAPI('DataLimit', 'EditLimits', args, options);
   },
};
