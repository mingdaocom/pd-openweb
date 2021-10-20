define(function (require, exports, module) {
  module.exports = {
    /**
    * 创建部门（Admin）
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
    * 编辑部门（Admin）
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
    * 删除部门（Admin）
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
    * 检测部门名称是否存在（Admin）
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
    * 网络管理 - 根据部门父Id获取子部门,departmentId为null表示父部门是网络（Admin）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.parentId 上级部门Id（可空，空则 为 顶级部门）
    * @param {integer} args.pageIndex 页码（默认第一页：1）
    * @param {integer} args.pageSize 页大小（默认50）
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    pagedSubDepartments: function (args, options) {
      return $.api('Department', 'PagedSubDepartments', args, options);
    },

    /**
    * 网络管理 - 根据部门父Id获取子部门,departmentId为null表示父部门是网络（Admin）
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
    * 网络管理 - 搜索(人和部门)（Admin）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.keywords 查找关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchDeptAndUsers: function (args, options) {
      return $.api('Department', 'SearchDeptAndUsers', args, options);
    },

    /**
    * （Admin）指定departmentId，查询整个树状结构（Admin）
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
    * （Admin）获取 指定（单个）部门 至顶而下的树状结构（含该部门所有上级 和 所有下级）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getOneDepartmentFullTree: function (args, options) {
      return $.api('Department', 'GetOneDepartmentFullTree', args, options);
    },

    /**
    * 网络管理 - 按关键词搜索部门，同时搜索部门下的用户，通用邀请层使用（Admin）
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
    * （Admin） 获取部门详细信息
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
    * 网络管理 - 查询部门并且没有关键字
    * @param {Object} args 请求参数
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchProjectDepartment2: function (args, options) {
      return $.api('Department', 'SearchProjectDepartment2', args, options);
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

    /**
    * 网络管理 - 分页获取部门成员简要信息
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {array} args.filterAccountIds 过滤哪些账号id
    * @param {integer} args.pageIndex 页码（默认第一页：1）
    * @param {integer} args.pageSize 页大小（默认50）
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    pagedDeptAccountShrotInfos: function (args, options) {
      return $.api('Department', 'PagedDeptAccountShrotInfos', args, options);
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
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
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
    * 获取 部门所有下级（树结构，可取全网络）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDepartmentTrees: function (args, options) {
      return $.api('Department', 'GetDepartmentTrees', args, options);
    },

    /**
    * 获取 部门所有下级（树结构，可取全网络）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    pagedDepartmentTrees: function (args, options) {
      return $.api('Department', 'PagedDepartmentTrees', args, options);
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
    * 网络管理 - 用户下的部门ids
    * @param {Object} args 请求参数
    * @param {string} args.projectId 
    * @param {array} args.accountIds 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDepartmentsByAccountId: function (args, options) {
      return $.api('Department', 'GetDepartmentsByAccountId', args, options);
    },

    /**
    * 网络管理 - 获取网络的 未加入任何部门成员 详情
（?? 暂不能确定，该方法是否只在 网络管理中使用！！）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.keywords 关键词
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getNotInDepartmentUsers: function (args, options) {
      return $.api('Department', 'GetNotInDepartmentUsers', args, options);
    },

    /**
    * 查询部门
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
    * 查询部门（分页）
    * @param {Object} args 请求参数
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
    * @param {string} args.projectId 网络id
    * @param {string} args.departmentId 部门id
    * @param {string} args.keywords 关键词
    * @param {boolean} args.returnCount 是否返回用户数量
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchDepartment2: function (args, options) {
      return $.api('Department', 'SearchDepartment2', args, options);
    },

  };
});
