export default {
  /**
   * 根据fileID获取附件详情 (动态分享)
   * @param {Object} args 请求参数
   * @param {string} args.fileId 文件id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  shareAttachmentByPost: function (args, options = {}) {
    return mdyAPI('Attachment', 'ShareAttachmentByPost', args, options);
  },
  /**
   * 根据fileID获取附件详情(完整字段)
   * @param {Object} args 请求参数
   * @param {string} args.fileId 文件id
   * @param {integer} args.type 分享 = 3 ，公开查询=11,填写链接=14, 草稿箱传21
   * @param {string} args.shareId 分享id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 工作表行记录id
   * @param {string} args.controlId 控件id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentDetail: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentDetail', args, options);
  },
  /**
  * 获取文档编辑链接地址
  * @param {Object} args 请求参数
  * @param {string} args.fileId 文件id
  * @param {integer} args.type 分享 = 3 ，公开查询=11,填写链接=14, 草稿箱传21
  * @param {string} args.shareId 分享id
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.rowId 工作表行记录id
  * @param {string} args.controlId 控件id
  * @param {string} args.attachmentShareId 附件分享id
  * @param {string} args.parentWorksheetId 主表id
子表的清况
  * @param {string} args.parentRowId 主记录id
子表的清况
  * @param {string} args.foreignControlId 主记录子表控件id
子表的清况
  * @param {} args.editType
  * @param {string} args.fileUrl 打印工作表记录类型时传递此参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getAttachmentEditDetail: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentEditDetail', args, options);
  },
  /**
   * 水印预览
   * @param {Object} args 请求参数
   * @param {object} args.advancedSetting 图片水印配置
   * @param {string} args.picUrl 图片地址
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentViewUrlForWaterMark: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentViewUrlForWaterMark', args, options);
  },
  /**
   * 修改链接附件
   * @param {Object} args 请求参数
   * @param {string} args.fileId 文件id
   * @param {string} args.title 标题
   * @param {string} args.originLinkUrl 原链接
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editLinkAttachment: function (args, options = {}) {
    return mdyAPI('Attachment', 'EditLinkAttachment', args, options);
  },
  /**
   * 附件落地页
   * @param {Object} args 请求参数
   * @param {string} args.fileID 文件id
   * @param {string} args.filePath 文件路径
   * @param {integer} args.hours 过期时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getShareLocalAttachmentUrl: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetShareLocalAttachmentUrl', args, options);
  },
  /**
   * 生成短连接
   * @param {Object} args 请求参数
   * @param {string} args.url 原链接
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getShortUrl: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetShortUrl', args, options);
  },
  /**
   * 附件点击埋点 adder: suncheng date:2018年1月30日
   * @param {Object} args 请求参数
   * @param {string} args.fileId 文件id
   * @param {integer} args.fromType 来源
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addAttachmentClick: function (args, options = {}) {
    return mdyAPI('Attachment', 'AddAttachmentClick', args, options);
  },
  /**
   * 根据fileId 批量获取附件信息
   * @param {Object} args 请求参数
   * @param {array} args.fileIds 多个fileId
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 工作表行id
   * @param {string} args.controlId 控件id
   * @param {integer} args.type 分享 = 3 ，公开查询=11,填写链接=14,
   * @param {string} args.shareId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentToList: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentToList', args, options);
  },
  /**
   * 附件保存到知识中心
   * @param {Object} args 请求参数
   * @param {string} args.fileID 文件id
   * @param {string} args.projectID 网络id
   * @param {string} args.originalFilename 原始文件id
   * @param {boolean} args.allowDown 是否允许下载
   * @param {string} args.parentID 父id
   * @param {string} args.rootID 根id
   * @param {string} args.des 描述
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveToKnowledge: function (args, options = {}) {
    return mdyAPI('Attachment', 'SaveToKnowledge', args, options);
  },
  /**
   * 获取预览链接
   * @param {Object} args 请求参数
   * @param {string} args.fileID 文件id
   * @param {string} args.ext 后缀
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPreviewLink: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetPreviewLink', args, options);
  },
  /**
   * 更新附件文件名、是否允许下载等信息
   * @param {Object} args 请求参数
   * @param {string} args.fileID 文件id
   * @param {string} args.docVersionID 版本id
   * @param {string} args.fileName 文件名
   * @param {boolean} args.allowDownload 是否允许下载
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  update: function (args, options = {}) {
    return mdyAPI('Attachment', 'Update', args, options);
  },
  /**
   * 删除附件，若只传入 docVersionID 则删除所有历史版本，若传入 fileID 则删除单个版本
   * @param {Object} args 请求参数
   * @param {string} args.docVersionID 版本id
   * @param {string} args.fileID 文件id
   * @param {string} args.sourceID 资源id
   * @param {string} args.commentID 回复id
   * @param {string} args.visibleFileName 文件名
   * @param {} args.fromType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteAttachment: function (args, options = {}) {
    return mdyAPI('Attachment', 'DeleteAttachment', args, options);
  },
  /**
   * 上传新版本
   * @param {Object} args 请求参数
   * @param {string} args.sourceID 资源id
   * @param {string} args.commentID 回复id
   * @param {} args.fromType
   * @param {string} args.docVersionID 版本id
   * @param {string} args.filePath 文件路径
   * @param {string} args.fileName 文件名
   * @param {string} args.serverName 服务器名
   * @param {string} args.fileExt 文件后缀
   * @param {string} args.originalFileName 原始文件名
   * @param {integer} args.fileSize 文件大小
   * @param {boolean} args.allowDown 是否允许下载
   * @param {boolean} args.share 是否允许分享
   * @param {} args.scope
   * @param {string} args.appid 应用id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  newVersion: function (args, options = {}) {
    return mdyAPI('Attachment', 'NewVersion', args, options);
  },
  /**
   * 获取预览附件的的评论
   * @param {Object} args 请求参数
   * @param {string} args.postID 动态id
   * @param {string} args.commentID 回复id
   * @param {string} args.fromType 来源类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPreViewMsg: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetPreViewMsg', args, options);
  },
  /**
   * 获取组织附件总量
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentTotal: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentTotal', args, options);
  },
  /**
   * 获取扫码上传附件地址
   * @param {Object} args 请求参数
   * @param {} args.sourceType
   * @param {} args.fileType
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行记录Id
   * @param {string} args.controlId 附件控件Id
   * @param {string} args.viewId 视图Id
   * @param {} args.getType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentScanUrl: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetAttachmentScanUrl', args, options);
  },
  /**
   * 变更链接状态
   * @param {Object} args 请求参数
   * @param {string} args.scanId 识别id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  stopAttachmentScanUrl: function (args, options = {}) {
    return mdyAPI('Attachment', 'StopAttachmentScanUrl', args, options);
  },
  /**
   * 获取扫码上传附件列表
   * @param {Object} args 请求参数
   * @param {string} args.scanId 识别id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getScanAttachments: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetScanAttachments', args, options);
  },
  /**
   * 获取扫码上传详情
   * @param {Object} args 请求参数
   * @param {string} args.scanId 识别id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getScanAttachmentInfo: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetScanAttachmentInfo', args, options);
  },
  /**
   * 推送扫码上传附件信息
   * @param {Object} args 请求参数
   * @param {string} args.scanId 识别id
   * @param {} args.sourceType
   * @param {} args.fileType
   * @param {string} args.accountId 账户id
   * @param {array} args.attachmentScanSimpleDetail 附件信息列表
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行记录Id
   * @param {string} args.controlId 附件控件Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addScanAttachments: function (args, options = {}) {
    return mdyAPI('Attachment', 'AddScanAttachments', args, options);
  },
  /**
   * 获取七牛上传 token
   * @param {Object} args 请求参数
   * @param {array} args.files 批量上传文件token 请求对象
   * @param {} args.type
   * @param {string} args.scanId 识别id
   * @param {} args.sourceType
   * @param {} args.fileType
   * @param {string} args.accountId 账户id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行记录Id
   * @param {string} args.controlId 附件控件Id
   * @param {string} args.extend 扩展字段
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getScanUploadToken: function (args, options = {}) {
    return mdyAPI('Attachment', 'GetScanUploadToken', args, options);
  },
};
