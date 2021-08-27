define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取部门列表（平铺）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectDepartments: function (args, options) {
      return $.api('Department', 'GetProjectDepartments', args, options);
    },

    /**
    * 根据部门父Id获取子部门,departmentId为null表示父部门是网络
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectSubDepartmentByDepartmentId: function (args, options) {
      return $.api('Department', 'GetProjectSubDepartmentByDepartmentId', args, options);
    },

    /**
    * 网络管理 - 根据部门父Id获取子部门,departmentId为null表示父部门是网络
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectSubDepartment: function (args, options) {
      return $.api('Department', 'GetProjectSubDepartment', args, options);
    },

    /**
    * 网络管理 - 搜索(人和部门)
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.keywords 关键词
    * @param {boolean} args.withUser 含用户
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getStructureSearchResult: function (args, options) {
      return $.api('Department', 'GetStructureSearchResult', args, options);
    },

    /**
    * 指定departmentId，查询整个树状结构
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectDepartmentFullTreeByDepartmentId: function (args, options) {
      return $.api('Department', 'GetProjectDepartmentFullTreeByDepartmentId', args, options);
    },

    /**
    * 分页获取部门列表
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {} args.sortField 排序字段
    * @param {} args.sortType 排序类型
    * @param {string} args.keywords 关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectDepartmentByPage: function (args, options) {
      return $.api('Department', 'GetProjectDepartmentByPage', args, options);
    },

    /**
    * 按关键词搜索部门，同时搜索部门下的用户，通用邀请层使用
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.keywords 关键词
    * @param {array} args.filterAccountIds 过滤哪些账号id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getContactProjectDepartments: function (args, options) {
      return $.api('Department', 'GetContactProjectDepartments', args, options);
    },

    /**
    * 网络管理 - 按关键词搜索部门，同时搜索部门下的用户，通用邀请层使用
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.keywords 关键词
    * @param {array} args.filterAccountIds 过滤哪些账号id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectContactDepartments: function (args, options) {
      return $.api('Department', 'GetProjectContactDepartments', args, options);
    },

    /**
    * 获取部门详细信息
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDepartmentInfo: function (args, options) {
      return $.api('Department', 'GetDepartmentInfo', args, options);
    },

    /**
    * 创建部门
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentName 部门名称
    * @param {string} args.parentId 父部门Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addDepartment: function (args, options) {
      return $.api('Department', 'AddDepartment', args, options);
    },

    /**
    * 删除部门
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    deleteDepartments: function (args, options) {
      return $.api('Department', 'DeleteDepartments', args, options);
    },

    /**
    * 检测部门名称是否存在
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id，有代表编辑，没有代表创建
    * @param {string} args.departmentName 部门名称
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    checkDepartmentNameExists: function (args, options) {
      return $.api('Department', 'CheckDepartmentNameExists', args, options);
    },

    /**
    * 编辑部门
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门Id
    * @param {string} args.departmentName 部门名称
    * @param {string} args.parentId 父部门Id
    * @param {string} args.chargeAccountId 部门负责人
    * @param {array} args.chargeAccountIds 部门负责人列表
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editDepartment: function (args, options) {
      return $.api('Department', 'EditDepartment', args, options);
    },

    /**
    * 获取部门的总人数以及成员详情
受通讯录规则限制
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {array} args.filterAccountIds 过滤哪些账号id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDepartmentUsers: function (args, options) {
      return $.api('Department', 'GetDepartmentUsers', args, options);
    },

    /**
    * 网络管理 - 获取部门的总人数，以及成员详情
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {array} args.filterAccountIds 过滤哪些账号id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectDepartmentUsers: function (args, options) {
      return $.api('Department', 'GetProjectDepartmentUsers', args, options);
    },

    /**
    * 网络管理 - 获取网络的总人数以及未加入任何部门成员详情
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.keywords 关键词
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getNoDepartmentUsers: function (args, options) {
      return $.api('Department', 'GetNoDepartmentUsers', args, options);
    },

    /**
    * 网络管理 - 部门拖拽
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.moveToParentId 拖入的 上级部门Id
    * @param {string} args.movingDepartmentId 被拖拽的 部门Id
    * @param {array} args.sortedDepartmentIds 排好序的 部门Ids
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    moveDepartment: function (args, options) {
      return $.api('Department', 'MoveDepartment', args, options);
    },

    /**
    * 查询部门并且没有关键字
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchDepartment: function (args, options) {
      return $.api('Department', 'SearchDepartment', args, options);
    },

    /**
    * 网络管理 - 查询部门并且没有关键字
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchProjectDepartment: function (args, options) {
      return $.api('Department', 'SearchProjectDepartment', args, options);
    },

  };
});
