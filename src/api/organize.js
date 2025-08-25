export default {
  /**
   * 添加 角色分组
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.orgRoleGroupId 角色分组Id
   * @param {string} args.orgRoleGroupName 角色名称
   * @param {integer} args.sortIndex 排序
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  upsertOrgRoleGroup: function (args, options = {}) {
    return mdyAPI('Organize', 'UpsertOrgRoleGroup', args, options);
  },
  /**
   * 组织角色分组 排序
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.orgRoleGroupId 角色分组Id
   * @param {string} args.previousOrgRoleGroupId 上一个排序id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setSortOrgRoleGroup: function (args, options = {}) {
    return mdyAPI('Organize', 'SetSortOrgRoleGroup', args, options);
  },
  /**
   * 删除 角色分组
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.orgRoleGroupId 角色分组Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeOrgRoleGroup: function (args, options = {}) {
    return mdyAPI('Organize', 'RemoveOrgRoleGroup', args, options);
  },
  /**
   * 导入组织角色
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.projectId 网络id
   * @param {string} args.fileName 文件名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  importOrgRoleList: function (args, options = {}) {
    return mdyAPI('Organize', 'ImportOrgRoleList', args, options);
  },
  /**
   * 添加 组织角色
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeName 角色名称
   * @param {string} args.remark 备注
   * @param {string} args.orgRoleGroupId 角色分组id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addOrganize: function (args, options = {}) {
    return mdyAPI('Organize', 'AddOrganize', args, options);
  },
  /**
   * 修改 组织角色 名称
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeId 角色id
   * @param {string} args.organizeName 角色名称
   * @param {string} args.remark 角色名称
   * @param {string} args.orgRoleGroupId 角色分组id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editOrganizeName: function (args, options = {}) {
    return mdyAPI('Organize', 'EditOrganizeName', args, options);
  },
  /**
   * 组织角色 排序
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeId 角色Id
   * @param {string} args.previousOrgRoleId 上一个排序id
   * @param {string} args.moveOrgRoleGroupId 移动的角色Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setSortOrgRole: function (args, options = {}) {
    return mdyAPI('Organize', 'SetSortOrgRole', args, options);
  },
  /**
   * 删除 组织角色
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.organizeIds 角色Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteOrganizes: function (args, options = {}) {
    return mdyAPI('Organize', 'DeleteOrganizes', args, options);
  },
  /**
   * 组织角色成员 设置分管部门
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.orgRoleId 角色Id
   * @param {string} args.accountId 用户id
   * @param {array} args.departmentIds 部门集合
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setOrgRoleChargeDepartment: function (args, options = {}) {
    return mdyAPI('Organize', 'SetOrgRoleChargeDepartment', args, options);
  },
  /**
   * 获取 组织角色成员 列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeId 职位id
   * @param {string} args.keywords 关键词
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pagedOrganizeAccounts: function (args, options = {}) {
    return mdyAPI('Organize', 'PagedOrganizeAccounts', args, options);
  },
  /**
   * 添加 组织角色 成员
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeId 职位id
   * @param {array} args.accountIds 账号Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addOrganizeUsers: function (args, options = {}) {
    return mdyAPI('Organize', 'AddOrganizeUsers', args, options);
  },
  /**
   * 移除 组织角色 成员
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.organizeId
   * @param {array} args.accountIds 账号Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteOrganizeUsers: function (args, options = {}) {
    return mdyAPI('Organize', 'DeleteOrganizeUsers', args, options);
  },
  /**
   * 获取角色分组列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOrgRoleGroupsByProjectId: function (args, options = {}) {
    return mdyAPI('Organize', 'GetOrgRoleGroupsByProjectId', args, options);
  },
  /**
   * 获取角色列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.keywords 关键词
   * @param {string} args.orgRoleGroupId 角色分组ID
   * @param {array} args.appointedOrganizeIds 指定的组织角色列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOrganizes: function (args, options = {}) {
    return mdyAPI('Organize', 'GetOrganizes', args, options);
  },
  /**
   * 根据账号id 获取角色列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 用户ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOrganizesByAccountId: function (args, options = {}) {
    return mdyAPI('Organize', 'GetOrganizesByAccountId', args, options);
  },
};
