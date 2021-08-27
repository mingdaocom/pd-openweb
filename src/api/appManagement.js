define(function (require, exports, module) {
  module.exports = {
    /**
    * 添加角色
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.name 名称
    * @param {string} args.description 描述
    * @param {integer} args.permissionWay 角色类型（0:自定义、10:只读、50::成员、100:管理员）
    * @param {string} args.projectId 网络id
    * @param {array} args.sheets 工作表权限集合
    * @param {array} args.userIds 角色成员id集合
    * @param {array} args.pages 自定义页面
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addRole: function (args, options) {
      return $.api('AppManagement', 'AddRole', args, options);
    },

    /**
    * 删除角色(并把人员移动到其他角色)
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {string} args.resultRoleId 目标角色id
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeRole: function (args, options) {
      return $.api('AppManagement', 'RemoveRole', args, options);
    },

    /**
    * 添加角色成员
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {array} args.userIds 用户
    * @param {array} args.departmentIds 部门
    * @param {array} args.jobIds 职位ids
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addRoleMembers: function (args, options) {
      return $.api('AppManagement', 'AddRoleMembers', args, options);
    },

    /**
    * 移除角色成员
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {array} args.userIds 用户
    * @param {array} args.departmentIds 部门
    * @param {array} args.jobIds 职位
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeRoleMembers: function (args, options) {
      return $.api('AppManagement', 'RemoveRoleMembers', args, options);
    },

    /**
    * 退出应用单个角色
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    quitAppForRole: function (args, options) {
      return $.api('AppManagement', 'QuitAppForRole', args, options);
    },

    /**
    * 退出应用下所有角色
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    quitRole: function (args, options) {
      return $.api('AppManagement', 'QuitRole', args, options);
    },

    /**
    * 配置角色权限
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {} args.appRoleModel 角色配置实体
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editAppRole: function (args, options) {
      return $.api('AppManagement', 'EditAppRole', args, options);
    },

    /**
    * 把人员移动到其他角色
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.sourceAppRoleId 来源角色id
    * @param {string} args.resultAppRoleId 目标角色id
    * @param {array} args.userIds 用户id集合
    * @param {array} args.departmentIds 部门id集合
    * @param {array} args.jobIds 职位id集合
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeUserToRole: function (args, options) {
      return $.api('AppManagement', 'RemoveUserToRole', args, options);
    },

    /**
    * 编辑视图分发权限
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.viewId 视图id
    * @param {string} args.worksheetId 工作表id
    * @param {array} args.changeRoles 角色
    * @param {array} args.removeRoleIds 删除的角色id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editViewRoles: function (args, options) {
      return $.api('AppManagement', 'EditViewRoles', args, options);
    },

    /**
    * 编辑应用下成员是否可见角色列表
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {} args.status 1=可见 2=关闭
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    updateMemberStatus: function (args, options) {
      return $.api('AppManagement', 'UpdateMemberStatus', args, options);
    },

    /**
    * 复制角色
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {string} args.roleName 新角色名称
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    copyRole: function (args, options) {
      return $.api('AppManagement', 'CopyRole', args, options);
    },

    /**
    * 角色排序
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {array} args.roleIds 排序后的角色ids
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    sortRoles: function (args, options) {
      return $.api('AppManagement', 'SortRoles', args, options);
    },

    /**
    * 获取成员是否可角色见列表状态
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getMemberStatus: function (args, options) {
      return $.api('AppManagement', 'GetMemberStatus', args, options);
    },

    /**
    * 获取应用下所用角色基本信息（不含具体权限）
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRolesWithUsers: function (args, options) {
      return $.api('AppManagement', 'GetRolesWithUsers', args, options);
    },

    /**
    * 获取应用下某个角色的具体权限信息
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.roleId 角色id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRoleDetail: function (args, options) {
      return $.api('AppManagement', 'GetRoleDetail', args, options);
    },

    /**
    * 获取应用下所有工作表信息生成添加角色模板
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAddRoleTemplate: function (args, options) {
      return $.api('AppManagement', 'GetAddRoleTemplate', args, options);
    },

    /**
    * 获取网络下用户为应用管理员的应用信息
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {} args.type 应用分组下实体类型（0=工作表，1=自定义页面）
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppForManager: function (args, options) {
      return $.api('AppManagement', 'GetAppForManager', args, options);
    },

    /**
    * 网络下用户为管理员的应用集合
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getManagerApps: function (args, options) {
      return $.api('AppManagement', 'GetManagerApps', args, options);
    },

    /**
    * 获取视图已分发角色
    * @param {Object} args 请求参数
    * @param {string} args.worksheetId 工作表id
    * @param {string} args.viewId 视图id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRolesByViewId: function (args, options) {
      return $.api('AppManagement', 'GetRolesByViewId', args, options);
    },

    /**
    * 获取网络下应用
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {integer} args.status 应用状态  0=关闭 1=启用  可空
    * @param {} args.order 排序 0=默认 ，1=表数量降序，2=表数量升序，3=创建时间降序，4=创建时间升序
    * @param {integer} args.pageIndex 页数（从1开始）
    * @param {integer} args.pageSize 每页显示数
    * @param {string} args.keyword 搜索关键字（支持名称和拥有者名称）
    * @param {integer} args.sourceType 来源 默认0=全部，2=过滤分发平台
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppsForProject: function (args, options) {
      return $.api('AppManagement', 'GetAppsForProject', args, options);
    },

    /**
    * 获取应用信息（批量）
    * @param {Object} args 请求参数
    * @param {array} args.appIds 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getApps: function (args, options) {
      return $.api('AppManagement', 'GetApps', args, options);
    },

    /**
    * 根据工作表id批量获取所属应用
    * @param {Object} args 请求参数
    * @param {array} args.sheetIds SheetId
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppForSheetIds: function (args, options) {
      return $.api('AppManagement', 'GetAppForSheetIds', args, options);
    },

    /**
    * 
    * @param {Object} args 请求参数
    * @param {string} args.worksheetId 
    * @param {string} args.viewId 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getToken: function (args, options) {
      return $.api('AppManagement', 'GetToken', args, options);
    },

    /**
    * 更新应用状态
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id（原应用包id）
    * @param {integer} args.status 状态  0=关闭 1=启用 2=删除
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editAppStatus: function (args, options) {
      return $.api('AppManagement', 'EditAppStatus', args, options);
    },

    /**
    * 检测是否是网络后台应用管理员
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    checkIsAppAdmin: function (args, options) {
      return $.api('AppManagement', 'CheckIsAppAdmin', args, options);
    },

    /**
    * 验证用户是否在应用管理员中
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    checkAppAdminForUser: function (args, options) {
      return $.api('AppManagement', 'CheckAppAdminForUser', args, options);
    },

    /**
    * 把自己加入应用管理员(后台)
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addRoleMemberForAppAdmin: function (args, options) {
      return $.api('AppManagement', 'AddRoleMemberForAppAdmin', args, options);
    },

    /**
    * 移动分组下项到另外一个分组（如果是同一应用下应用id相同即可）
    * @param {Object} args 请求参数
    * @param {string} args.sourceAppId 来源应用id
    * @param {string} args.resultAppId 目标应用id
    * @param {string} args.sourceAppSectionId 来源应用分组id
    * @param {string} args.resultAppSectionId 目标应用分组id
    * @param {array} args.workSheetsInfo 基础信息集合
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeWorkSheetAscription: function (args, options) {
      return $.api('AppManagement', 'RemoveWorkSheetAscription', args, options);
    },

    /**
    * 删除应用分组下项(工作表，自定义页面)
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.appSectionId 应用分组id
    * @param {string} args.workSheetId id
    * @param {integer} args.type 类型 0=工作表，1=自定义页面
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeWorkSheetForApp: function (args, options) {
      return $.api('AppManagement', 'RemoveWorkSheetForApp', args, options);
    },

    /**
    * 修改分组下实体名称和图标
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.appSectionId 应用分组id
    * @param {string} args.workSheetId id
    * @param {string} args.workSheetName 名称
    * @param {string} args.icon 图标
    * @param {integer} args.type 类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editWorkSheetInfoForApp: function (args, options) {
      return $.api('AppManagement', 'EditWorkSheetInfoForApp', args, options);
    },

    /**
    * 变更应用拥有者
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.memberId 新的应用拥有者
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    updateAppOwner: function (args, options) {
      return $.api('AppManagement', 'UpdateAppOwner', args, options);
    },

    /**
    * 应用分组下新增项
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.appSectionId SectionId
    * @param {string} args.name 名称
    * @param {string} args.icon Logo
    * @param {integer} args.type 类型 0=工作表 1=自定义页面
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addWorkSheet: function (args, options) {
      return $.api('AppManagement', 'AddWorkSheet', args, options);
    },

    /**
    * 新增工作表（级联数据源及子表）
    * @param {Object} args 请求参数
    * @param {string} args.worksheetId 原始工作表id
    * @param {string} args.name 
    * @param {integer} args.worksheetType 1：普通表 2：子表
    * @param {boolean} args.createLayer 直接创建层级视图
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addSheet: function (args, options) {
      return $.api('AppManagement', 'AddSheet', args, options);
    },

    /**
    * 转换工作表
    * @param {Object} args 请求参数
    * @param {string} args.sourceWorksheetId 来源工作表id
    * @param {string} args.worksheetId 子表id
    * @param {string} args.name 子表名称
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    changeSheet: function (args, options) {
      return $.api('AppManagement', 'ChangeSheet', args, options);
    },

    /**
    * 复制自定义页面
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.appSectionId SectionId
    * @param {string} args.name 名称
    * @param {string} args.id 自定义页面id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    copyCustomPage: function (args, options) {
      return $.api('AppManagement', 'CopyCustomPage', args, options);
    },

    /**
    * 新增应用授权
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addAuthorize: function (args, options) {
      return $.api('AppManagement', 'AddAuthorize', args, options);
    },

    /**
    * 获取应用授权
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAuthorizes: function (args, options) {
      return $.api('AppManagement', 'GetAuthorizes', args, options);
    },

    /**
    * 编辑应用授权类型
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.appKey 
    * @param {} args.displayType 类型  1=删除，2=取消授权，3=全部，4=只读
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    eiitAuthorizeStatus: function (args, options) {
      return $.api('AppManagement', 'EiitAuthorizeStatus', args, options);
    },

    /**
    * 编辑备注
    * @param {Object} args 请求参数
    * @param {string} args.appId 
    * @param {string} args.appKey 
    * @param {string} args.remark 备注
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editAuthorizeRemark: function (args, options) {
      return $.api('AppManagement', 'EditAuthorizeRemark', args, options);
    },

    /**
    * 获取当前应用的的申请信息
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.size 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppApplyInfo: function (args, options) {
      return $.api('AppManagement', 'GetAppApplyInfo', args, options);
    },

    /**
    * 申请加入应用
    * @param {Object} args 请求参数
    * @param {string} args.appId 应用id
    * @param {string} args.remark 申请说明
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addAppApply: function (args, options) {
      return $.api('AppManagement', 'AddAppApply', args, options);
    },

    /**
    * 更新应用申请状态
    * @param {Object} args 请求参数
    * @param {string} args.id 申请信息的id
    * @param {string} args.appId 应用id
    * @param {integer} args.status 状态 2=通过，3=拒绝
    * @param {string} args.roleId 角色id（拒绝时可空）
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editAppApplyStatus: function (args, options) {
      return $.api('AppManagement', 'EditAppApplyStatus', args, options);
    },

    /**
    * 获取icon（包含系统和自定义）
    * @param {Object} args 请求参数
    * @param {array} args.fileNames 自定义图标名称
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getIcon: function (args, options) {
      return $.api('AppManagement', 'GetIcon', args, options);
    },

    /**
    * 添加自定义图标
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {array} args.data icon数据
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addCustomIcon: function (args, options) {
      return $.api('AppManagement', 'AddCustomIcon', args, options);
    },

    /**
    * 删除自定义图标
    * @param {Object} args 请求参数
    * @param {array} args.fileNames 自定义图标名称
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    deleteCustomIcon: function (args, options) {
      return $.api('AppManagement', 'DeleteCustomIcon', args, options);
    },

    /**
    * 获取自定义图标
    * @param {Object} args 请求参数
    * @param {array} args.fileNames 自定义图标名称
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getCustomIconByProject: function (args, options) {
      return $.api('AppManagement', 'GetCustomIconByProject', args, options);
    },

    /**
    * 获取分类和首页信息
    * @param {Object} args 请求参数
    * @param {boolean} args.isCategory 是否只加载分类信息
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppsCategoryInfo: function (args, options) {
      return $.api('AppManagement', 'GetAppsCategoryInfo', args, options);
    },

    /**
    * 获取分类下应用库模板列表
    * @param {Object} args 请求参数
    * @param {string} args.categoryId 分类id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppsLibraryInfo: function (args, options) {
      return $.api('AppManagement', 'GetAppsLibraryInfo', args, options);
    },

    /**
    * 安装应用
    * @param {Object} args 请求参数
    * @param {string} args.libraryId 应用库id
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    installApp: function (args, options) {
      return $.api('AppManagement', 'InstallApp', args, options);
    },

    /**
    * 根据关键字搜索已上架的应用库模板
    * @param {Object} args 请求参数
    * @param {string} args.keyword 关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    searchAppLibrary: function (args, options) {
      return $.api('AppManagement', 'SearchAppLibrary', args, options);
    },

    /**
    * 获取单个应用库模板详情
    * @param {Object} args 请求参数
    * @param {string} args.libraryId 应用库id
    * @param {string} args.projectId 网络ud
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAppLibraryDetail: function (args, options) {
      return $.api('AppManagement', 'GetAppLibraryDetail', args, options);
    },

    /**
    * 获取应用库FileUrl Token
    * @param {Object} args 请求参数
    * @param {string} args.libraryId 
    * @param {string} args.projectId 安装目标网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getLibraryToken: function (args, options) {
      return $.api('AppManagement', 'GetLibraryToken', args, options);
    },

    /**
    * 获取日志
    * @param {Object} args 请求参数
    * @param {string} args.projectId 
    * @param {string} args.keyword 搜索关键字
    * @param {integer} args.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
    * @param {string} args.start 开始时间
    * @param {string} args.end 结束时间
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getLogs: function (args, options) {
      return $.api('AppManagement', 'GetLogs', args, options);
    },

    /**
    * 获取导出记录
    * @param {Object} args 请求参数
    * @param {string} args.projectId 
    * @param {string} args.keyword 搜索关键字
    * @param {integer} args.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
    * @param {string} args.start 开始时间
    * @param {string} args.end 结束时间
    * @param {integer} args.pageIndex 
    * @param {integer} args.pageSize 
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getExports: function (args, options) {
      return $.api('AppManagement', 'GetExports', args, options);
    },

    /**
    * 创建工作流CSM
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addWorkflow: function (args, options) {
      return $.api('AppManagement', 'AddWorkflow', args, options);
    },

  };
});
