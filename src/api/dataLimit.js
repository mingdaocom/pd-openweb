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
  /**
   * 列表额度管理页数据
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getListPage: function (args, options = {}) {
    return mdyAPI('DataLimit', 'GetListPage', args, options);
  },
  /**
   * 模块列表额度管理页数据
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {integer} args.businessType 获取的业务类型 (1:单个附件上传量,2= 行记录量,3 = 附件用量)
   * @param {array} args.entityIds 筛选的实体ids
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 每页数量
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUageLimits: function (args, options = {}) {
    return mdyAPI('DataLimit', 'GetUageLimits', args, options);
  },
  /**
   * 编辑额度管理数据
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {integer} args.size 全局用量限制（没有修改不要传值）
   * @param {integer} args.businessType 获取的业务类型 (1:单个附件上传量,2= 行记录量,3 = 附件用量)
   * @param {array} args.edits 编辑
   * @param {array} args.adds 新增
   * @param {array} args.dels 删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editUageLimit: function (args, options = {}) {
    return mdyAPI('DataLimit', 'EditUageLimit', args, options);
  },
  /**
   * 组织最大行记录数量上限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLimitRowTotal: function (args, options = {}) {
    return mdyAPI('DataLimit', 'GetLimitRowTotal', args, options);
  },
};
