export default {
  /**
  * 获取附件上传记录列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.worksheetId 工作表ID
  * @param {string} args.key Key
  * @param {} args.bucket
  * @param {} args.uploadType
  * @param {} args.sourceType
  * @param {} args.status
  * @param {string} args.createAccountId 创建人
  * @param {string} args.modifyAccountId 更新人
  * @param {string} args.startCreateTime 创建时间起始
  * @param {string} args.endCreateTime 创建时间结束
  * @param {string} args.startUpdateTime 更新时间起始
  * @param {string} args.endUpdateTime 更新时间结束
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAttachmentUploadInfos: function (args, options = {}) {
     
     return mdyAPI('AttachmentUploadInfo', 'GetAttachmentUploadInfos', args, options);
   },
  /**
  * 获取附件上传记录总数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织ID
  * @param {string} args.worksheetId 工作表ID
  * @param {string} args.key Key
  * @param {} args.bucket
  * @param {} args.uploadType
  * @param {} args.sourceType
  * @param {} args.status
  * @param {string} args.createAccountId 创建人
  * @param {string} args.modifyAccountId 更新人
  * @param {string} args.startCreateTime 创建时间起始
  * @param {string} args.endCreateTime 创建时间结束
  * @param {string} args.startUpdateTime 更新时间起始
  * @param {string} args.endUpdateTime 更新时间结束
  * @param {} args.pageFilter
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAttachmentUploadInfoCount: function (args, options = {}) {
     
     return mdyAPI('AttachmentUploadInfo', 'GetAttachmentUploadInfoCount', args, options);
   },
};
