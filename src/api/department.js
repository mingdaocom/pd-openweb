export default {
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
   addDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'AddDepartment', args, options);
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
   editDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'EditDepartment', args, options);
   },
  /**
  * 新增或移除单个部门负责人（Admin）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门Id
  * @param {string} args.chargeAccountId 部门负责人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDepartmentSingleChargeUser: function (args, options = {}) {
     
     return mdyAPI('Department', 'EditDepartmentSingleChargeUser', args, options);
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
   deleteDepartments: function (args, options = {}) {
     
     return mdyAPI('Department', 'DeleteDepartments', args, options);
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
   pagedSubDepartments: function (args, options = {}) {
     
     return mdyAPI('Department', 'PagedSubDepartments', args, options);
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
   getProjectSubDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectSubDepartment', args, options);
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
   searchDeptAndUsers: function (args, options = {}) {
     
     return mdyAPI('Department', 'SearchDeptAndUsers', args, options);
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
   getProjectDepartmentFullTreeByDepartmentId: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectDepartmentFullTreeByDepartmentId', args, options);
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
   getOneDepartmentFullTree: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetOneDepartmentFullTree', args, options);
   },
  /**
  * 网络管理 - 按关键词搜索部门（仅搜部门），通用邀请层使用（Admin）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键词
  * @param {array} args.filterAccountIds 过滤哪些账号id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小（默认200）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectContactDepartments: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectContactDepartments', args, options);
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
   getDepartmentInfo: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetDepartmentInfo', args, options);
   },
  /**
  * 网络管理 - 查询部门并且没有关键字
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {string} args.keywords 关键词
  * @param {boolean} args.returnCount 是否返回用户数量
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchProjectDepartment2: function (args, options = {}) {
     
     return mdyAPI('Department', 'SearchProjectDepartment2', args, options);
   },
  /**
  * 网络管理 - 查询部门并且没有关键字【弃用】
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {string} args.keywords 关键词
  * @param {boolean} args.returnCount 是否返回用户数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchProjectDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'SearchProjectDepartment', args, options);
   },
  /**
  * 导入部门
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
   importDepartmentList: function (args, options = {}) {
     
     return mdyAPI('Department', 'ImportDepartmentList', args, options);
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
   pagedDeptAccountShrotInfos: function (args, options = {}) {
     
     return mdyAPI('Department', 'PagedDeptAccountShrotInfos', args, options);
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
   getProjectDepartmentUsers: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectDepartmentUsers', args, options);
   },
  /**
  * 获取 置顶的前 50 名成员（n名）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTopDisplayMembers: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetTopDisplayMembers', args, options);
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
   getNoDepartmentUsers: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetNoDepartmentUsers', args, options);
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
   moveDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'MoveDepartment', args, options);
   },
  /**
  * 设置 部门成员 置顶（显示顺序）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门Id
  * @param {string} args.memberId 置顶 成员Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setTopDisplayOrder: function (args, options = {}) {
     
     return mdyAPI('Department', 'SetTopDisplayOrder', args, options);
   },
  /**
  * 取消 部门成员 置顶（显示顺序）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门Id
  * @param {string} args.memberId 置顶 成员Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelTopDisplayOrder: function (args, options = {}) {
     
     return mdyAPI('Department', 'CancelTopDisplayOrder', args, options);
   },
  /**
  * 设置 部门成员 置顶（显示顺序）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门Id
  * @param {array} args.orderedMemberIds 排好序的 置顶 成员Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetTopDisplayOrders: function (args, options = {}) {
     
     return mdyAPI('Department', 'ResetTopDisplayOrders', args, options);
   },
  /**
  * 根据部门Id 获取完整的部门路径
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDepartmentFullNameById: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Department', 'GetDepartmentFullNameById', args, options);
   },
  /**
  * 根据部门Ids 获取完整的部门路径
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.departmentIds 部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDepartmentFullNameByIds: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetDepartmentFullNameByIds', args, options);
   },
  /**
  * 根据部门父Id获取子部门,departmentId为null表示父部门是网络
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {boolean} args.returnCount 是否返回用户数量
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectSubDepartmentByDepartmentId: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectSubDepartmentByDepartmentId', args, options);
   },
  /**
  * 获取 成员及下级部门
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {boolean} args.onlyMyJoin
  * @param {array} args.filterAccountIds
  * @param {string} args.departmentId 可空（空时 仅返回 用户可见的  最顶级部门）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMembersAndSubs: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetMembersAndSubs', args, options);
   },
  /**
  * 分页获取部门列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.sortField
  * @param {} args.sortType
  * @param {string} args.keywords 关键词
  * @param {boolean} args.onlyMyJoin 是否仅看自己的部门
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectDepartmentByPage: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetProjectDepartmentByPage', args, options);
   },
  /**
  * 获取 部门所有下级（树结构，可取全网络）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.parentId
  * @param {string} args.keyword 关键字搜索
  * @param {boolean} args.onlyMyJoin 仅看我加入的部门
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedDepartmentTrees: function (args, options = {}) {
     
     return mdyAPI('Department', 'PagedDepartmentTrees', args, options);
   },
  /**
  * 获取 部门所有下级（树结构，可取全网络）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.parentId
  * @param {string} args.keyword 关键字搜索
  * @param {boolean} args.onlyMyJoin 仅看我加入的部门
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedProjectDepartmentTrees: function (args, options = {}) {
     
     return mdyAPI('Department', 'PagedProjectDepartmentTrees', args, options);
   },
  /**
  * 按关键词搜索部门（仅搜部门），通用邀请层使用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键词
  * @param {array} args.filterAccountIds 过滤哪些账号id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小（默认200）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactProjectDepartments: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetContactProjectDepartments', args, options);
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
   getDepartmentUsers: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetDepartmentUsers', args, options);
   },
  /**
  * 网络管理 - 用户下的部门ids
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {boolean} args.includePath
  * @param {array} args.accountIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDepartmentsByAccountId: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetDepartmentsByAccountId', args, options);
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
   getNotInDepartmentUsers: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetNotInDepartmentUsers', args, options);
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
   searchDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'SearchDepartment', args, options);
   },
  /**
  * 指定 部门查询
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.rangeTypeId 指定查询的 取值范围（仅指定部门==10，指定部门和所有下级部门==20，仅 指定部门的 所有下级部门=30）
  * @param {array} args.appointedDepartmentIds 指定 部门ids（支持 当前用户的部门：user-departments）
  * @param {array} args.appointedUserIds 指定 用户Ids（支持 当前用户：user-self）
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appointedDepartment: function (args, options = {}) {
     
     return mdyAPI('Department', 'AppointedDepartment', args, options);
   },
  /**
  * 通过组织code加入组织验证Token 获取部门架构
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {string} args.keywords 关键词
  * @param {boolean} args.returnCount 是否返回用户数量
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {string} args.token 接口返回的校验Token(必填)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDepartmentByJoinProject: function (args, options = {}) {
     
     return mdyAPI('Department', 'GetDepartmentByJoinProject', args, options);
   },
  /**
  * 查询部门（分页）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.departmentId 部门id
  * @param {string} args.keywords 关键词
  * @param {boolean} args.returnCount 是否返回用户数量
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchDepartment2: function (args, options = {}) {
     
     return mdyAPI('Department', 'SearchDepartment2', args, options);
   },
  /**
  * 保留 有成员的部门Ids
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {array} args.departmentIds 是否 部门Ids 有成员（仅当前部门成员）
  * @param {array} args.departmentIdsInTree 是否 部门Ids 有成员（包含 所有下级成员）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   keepHasMemberIds: function (args, options = {}) {
     
     return mdyAPI('Department', 'KeepHasMemberIds', args, options);
   },
};
