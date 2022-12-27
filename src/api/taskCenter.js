export default {
  /**
  * 任务添加附件
adder: suncheng date: 2017年11月29日
  * @param {Object} args 请求参数
  * @param {string} args.taskId 任务Id
  * @param {string} args.atts 本地附件
  * @param {string} args.knowledgeAtts 知识附件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTaskAttachments: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddTaskAttachments', args, options);
   },
  /**
  * 搜索项目 OK
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索内容
  * @param {string} args.otherAccountID 搜索他人,他人accountID,协作
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'SearchFolderList', args, options);
   },
  /**
  * 获取项目计数
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectsFolderNotice: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetProjectsFolderNotice', args, options);
   },
  /**
  * 查询指定网络下文件夹和初层项目列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountID 他人accountID
  * @param {string} args.fileIDs 文件列表,分隔
  * @param {boolean} args.hasFiles 有文件夹
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMainFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetMainFolderList', args, options);
   },
  /**
  * 获取关联项目列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAssociatedFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetAssociatedFolderList', args, options);
   },
  /**
  * 获取指定文件下下的所有项目
  * @param {Object} args 请求参数
  * @param {string} args.fileID 文件夹ID
  * @param {string} args.accountID 他人accountID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMainFolderListInFile: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetMainFolderListInFile', args, options);
   },
  /**
  * 获取指定网络下的隐藏项目
  * @param {Object} args 请求参数
  * @param {string} args.accountID 他人accountID
  * @param {string} args.projectId 网络ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getHiddenFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetHiddenFolderList', args, options);
   },
  /**
  * 获取指定网络ID下已归档的项目
  * @param {Object} args 请求参数
  * @param {string} args.accountID 他人accountID
  * @param {string} args.projectId 网络ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getArchiveFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetArchiveFolderList', args, options);
   },
  /**
  * 获取置顶项目
  * @param {Object} args 请求参数
  * @param {string} args.accountID 用户id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTopFolderList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTopFolderList', args, options);
   },
  /**
  * 获取指定网络下的协作用户数量
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTeamworkCount: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTeamworkCount', args, options);
   },
  /**
  * 获取指定网络下的所有协作用（按照协作次数倒叙）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTeamworkMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTeamworkMember', args, options);
   },
  /**
  * 获取项目下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isFirst 是否直接下属
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubordinate: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetSubordinate', args, options);
   },
  /**
  * 获取指定项目的普通看板视图（默认只有第一页获取，
具体单个阶段请求GetFolderTaskListByStageID）
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {array} args.tagIDs 标签IDs
  * @param {} args.sort 排序规则
  * @param {} args.status 任务状态
  * @param {string} args.completeTime 任务完成时间
  * @param {boolean} args.withoutTag 未关联标签的任务
  * @param {integer} args.pageSize 页面尺寸
  * @param {object} args.controlSelectedDic 控件筛选
  * @param {array} args.chargeIds 负责人筛选
  * @param {} args.filterType 任务查询类别
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskListWithStageView: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskListWithStageView', args, options);
   },
  /**
  * 获取指定项目阶段下的任务列表
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.stageID 阶段ID
  * @param {} args.sort 排序规则
  * @param {} args.status 任务状态
  * @param {string} args.completeTime 任务完成时间
  * @param {boolean} args.withoutTag 未关联任务
  * @param {array} args.tagIDs 标签列表
  * @param {integer} args.pageIndex 请求页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {object} args.controlSelectedDic 控件筛选
  * @param {array} args.chargeIds 负责人筛选
  * @param {} args.filterType 任务查询类别
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderTaskListByStageID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderTaskListByStageID', args, options);
   },
  /**
  * 设置 看板负责人
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {string} args.stageID 阶段id
  * @param {string} args.ownerId 负责人id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setStageOwner: function (args, options = {}) {
     
     return $.api('TaskCenter', 'SetStageOwner', args, options);
   },
  /**
  * 获取项目下所有任务负责人
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderTaskCharges: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderTaskCharges', args, options);
   },
  /**
  * 获取项目配置（之后配置面板的东西在这边加）
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderConfig: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderConfig', args, options);
   },
  /**
  * 查询关联项目用项目列表
  * @param {Object} args 请求参数
  * @param {string} args.excludeTaskIDs 需排除的taskid,英文逗号拼接
  * @param {string} args.projectId 网络ID
  * @param {string} args.keyWords 查找关键字
  * @param {integer} args.pageSize 页面尺寸
  * @param {integer} args.pageIndex 当前页码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderListForUpdateFolderID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderListForUpdateFolderID', args, options);
   },
  /**
  * 查询创建任务用项目列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络ID
  * @param {string} args.keyWords 查找关键字
  * @param {integer} args.pageSize 页面尺寸
  * @param {integer} args.pageIndex 当前页码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderListForCreateTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderListForCreateTask', args, options);
   },
  /**
  * 获取项目描述和是否有编辑权限
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderDescribe: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderDescribe', args, options);
   },
  /**
  * 获取项目描述和是否有编辑权限
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderDetail: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderDetail', args, options);
   },
  /**
  * 获取项目日志 ok
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目
  * @param {integer} args.pageSize 页面尺寸
  * @param {integer} args.pageIndex 当前页码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderLog: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderLog', args, options);
   },
  /**
  * 根据 Ids 获取项目 集合
  * @param {Object} args 请求参数
  * @param {array} args.folderIds 项目Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFoldersByIds: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFoldersByIds', args, options);
   },
  /**
  * 验证该用户是不是项目下的某任务的负责人 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {string} args.accountID 指定用户accountID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validationUserIsCharge: function (args, options = {}) {
     
     return $.api('TaskCenter', 'ValidationUserIsCharge', args, options);
   },
  /**
  * 创建项目 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderName 项目名称
  * @param {string} args.projectId 网络ID
  * @param {} args.visibility 可见性类型
  * @param {string} args.groupID 群组
  * @param {string} args.appID
  * @param {string} args.templateId 模板Id
  * @param {string} args.mdAppId 应用包Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddFolder', args, options);
   },
  /**
  * 移除项目
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {boolean} args.isDeleteTask 删除任务与否
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RemoveFolder', args, options);
   },
  /**
  * 修改项目看板配置
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {} args.stageConfig 看板编辑类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateStageConfig: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateStageConfig', args, options);
   },
  /**
  * 修改项目归档状态
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {boolean} args.archived 归档/退档
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderArchived: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderArchived', args, options);
   },
  /**
  * 修改项目下任务可见性权限
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {} args.folderAuthVisible 项目可见性  0私密  1公开仅群组  2全公司
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderAuthVisible: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderAuthVisible', args, options);
   },
  /**
  * 项目修改可见性 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {} args.visibility 项目可见性  0私密  1公开仅群组  2全公司
  * @param {string} args.groupID 群组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderVisibility: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderVisibility', args, options);
   },
  /**
  * 修改项目负责人
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.chargeAccountID 下任负责人accountID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderCharge: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderCharge', args, options);
   },
  /**
  * 修改项目名称 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.folderName 项目名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderName: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderName', args, options);
   },
  /**
  * 修改项目描述 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.describe 项目描述
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderDes: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderDes', args, options);
   },
  /**
  * 修改项目成员的消息提醒机制
adder: suncheng date: 2017年11月24日
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {boolean} args.unNotice 是否提醒
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderMemberNotice: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderMemberNotice', args, options);
   },
  /**
  * 复制项目
  * @param {Object} args 请求参数
  * @param {string} args.folderID 被复制项目ID
  * @param {string} args.folderName 新项目名称
  * @param {string} args.chargeAccountID 负责人accountID
  * @param {boolean} args.hasDes 是否包含项目描述
  * @param {boolean} args.hasFolderMember 是否包含项目成员
  * @param {boolean} args.hasStage 是否包含看板
  * @param {boolean} args.hasTask 是否包含项目下所有任务
  * @param {boolean} args.hasTaskMember 是否包含任务成员
  * @param {boolean} args.hasTaskDes 是否包含项目描述
  * @param {boolean} args.hasTemplate 是否包含项目模板
  * @param {string} args.appID
  * @param {boolean} args.hasChecklist 是否包含检查清单
  * @param {boolean} args.hasTime 是否包含时间
  * @param {string} args.projectId 指定网络id
  * @param {boolean} args.hasTaskAtts 是否包含任务附件
  * @param {string} args.taskChargeAccountID 任务复制人Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   duplicateFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DuplicateFolder', args, options);
   },
  /**
  * 项目看板查询
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderStage: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderStage', args, options);
   },
  /**
  * 项目看板新增 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.stageName 看板名
  * @param {integer} args.sort 排序
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFolderStage: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddFolderStage', args, options);
   },
  /**
  * 修改项目看板
  * @param {Object} args 请求参数
  * @param {string} args.stageID 看板id
  * @param {string} args.folderID 项目ID
  * @param {string} args.stageName 看板名
  * @param {integer} args.sort 排序
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderStage: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderStage', args, options);
   },
  /**
  * 删除项目看板
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.stageID 看板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteFolderStage: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DeleteFolderStage', args, options);
   },
  /**
  * 获取项目成员列表
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderMembers: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderMembers', args, options);
   },
  /**
  * 获取不在项目公开范围及非项目有效成员的人
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {array} args.accountIds 需要验证的人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAccountNeedAddIntoFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'CheckAccountNeedAddIntoFolder', args, options);
   },
  /**
  * 获取项目成员 和公开范围（项目设置接口用）
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderSettingsForCurrentUser: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderSettingsForCurrentUser', args, options);
   },
  /**
  * 获取项目权限
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderAuth: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderAuth', args, options);
   },
  /**
  * 获取当前用户在项目中的状态
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderMemberType: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderMemberType', args, options);
   },
  /**
  * 获取项目成员的消息提示状态
adder: suncheng date: 2017年11月27日
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderMemberNotice: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderMemberNotice', args, options);
   },
  /**
  * 申请加入项目成为项目成员
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.applyInfo 申请内容描述
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyFolderMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'ApplyFolderMember', args, options);
   },
  /**
  * 拒绝外人成为项目成员
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.accountID 用户id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseFolderMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RefuseFolderMember', args, options);
   },
  /**
  * 项目成员新增 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.memberIDs 新增用户accountID
  * @param {object} args.specialAccounts {&#34;key1&#34;:&#34;value1&#34;,&#34;key2&#34;:&#34;value2&#34;}
  * @param {boolean} args.isAdmin 是否管理员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFolderMembers: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddFolderMembers', args, options);
   },
  /**
  * 项目成员新增 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.memberID 新增用户accountID
  * @param {boolean} args.isAdmin 是否默认为管理员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderMemberStatusAndAuth: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderMemberStatusAndAuth', args, options);
   },
  /**
  * 移除项目成员 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.accountID 移除成员accountID
  * @param {boolean} args.isRemoveTaskMember 是否同步移除项目下任务成员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFolderMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RemoveFolderMember', args, options);
   },
  /**
  * 项目加星 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {boolean} args.isStar 标星
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderMemberStar: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderMemberStar', args, options);
   },
  /**
  * 修改项目关于用户置顶 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {boolean} args.isTop 是否置顶
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderTop: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderTop', args, options);
   },
  /**
  * 修改项目显示状态
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {boolean} args.isHidden 是否隐藏
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderDisplay: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderDisplay', args, options);
   },
  /**
  * 移动项目至指定文件夹(fileID空为移出)
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.fileID 文件夹ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderIntoFile: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderIntoFile', args, options);
   },
  /**
  * 修改项目成员权限 ok
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {string} args.accountID 被修改者accountID
  * @param {boolean} args.isAdmin 是否管理员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderMemberAuth: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderMemberAuth', args, options);
   },
  /**
  * 获取项目文件列表 OK
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目ID
  * @param {integer} args.pageIndex 请求页面
  * @param {integer} args.pageSize 页面尺寸
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderFiles: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderFiles', args, options);
   },
  /**
  * 项目文件夹添加
  * @param {Object} args 请求参数
  * @param {string} args.fileName 项目文件夹名称
  * @param {string} args.folderIDs 项目ID  多个项目ID使用,分隔
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addUserFolderFile: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddUserFolderFile', args, options);
   },
  /**
  * 项目文件修改
  * @param {Object} args 请求参数
  * @param {string} args.fileName 项目文件夹名称
  * @param {string} args.ffileID 项目文件夹ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUserFolderFile: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateUserFolderFile', args, options);
   },
  /**
  * 删除项目文件夹
  * @param {Object} args 请求参数
  * @param {string} args.ffileID 项目文件夹ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteUserFolderFile: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DeleteUserFolderFile', args, options);
   },
  /**
  * 获取经常协作的用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRelatedUsers: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetRelatedUsers', args, options);
   },
  /**
  * 获取标签
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.folderId 项目id
  * @param {} args.fromType 来源类型  （0：任务，1：项目,2：未关联项目）
  * @param {boolean} args.other 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTags: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTags', args, options);
   },
  /**
  * 清除左侧菜单缓存
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   clearLeftMenuCache: function (args, options = {}) {
     
     return $.api('TaskCenter', 'ClearLeftMenuCache', args, options);
   },
  /**
  * 获取默认配置网络
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSettingDefualtProjectId: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetSettingDefualtProjectId', args, options);
   },
  /**
  * 获取配置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSetting: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetSetting', args, options);
   },
  /**
  * 关注用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accountIds 多个用户ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   followUserOfSetting: function (args, options = {}) {
     
     return $.api('TaskCenter', 'FollowUserOfSetting', args, options);
   },
  /**
  * 取消关注用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accountIds 多个用户ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unfollowUserOfSetting: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UnfollowUserOfSetting', args, options);
   },
  /**
  * 修改用户配置展开状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 用户id
  * @param {boolean} args.isHidden 是否隐藏
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUserStatusOfSetting: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateUserStatusOfSetting', args, options);
   },
  /**
  * 下属甘特图
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accountIds 网络id
  * @param {string} args.startTime 开始时间
  * @param {string} args.endTime 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubordinateTaskGantt: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetSubordinateTaskGantt', args, options);
   },
  /**
  * 获取任务甘特图视图
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {string} args.startTime 开始时间
  * @param {string} args.endTime 结束时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderTaskGantt: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderTaskGantt', args, options);
   },
  /**
  * 获取任务静态甘特图
  * @param {Object} args 请求参数
  * @param {string} args.folderID 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskStaticGanttChart: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskStaticGanttChart', args, options);
   },
  /**
  * 修改单个任务的实际开始时间
  * @param {Object} args 请求参数
  * @param {string} args.taskId 项目id
  * @param {string} args.actualStartTime 实际开始时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskActualStartTime: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskActualStartTime', args, options);
   },
  /**
  * 修改多个任务的实际开始时间
  * @param {Object} args 请求参数
  * @param {array} args.taskIds 项目ids集合
  * @param {string} args.actualStartTime 实际开始时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTasksActualStartTime: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTasksActualStartTime', args, options);
   },
  /**
  * 修改完成时间
  * @param {Object} args 请求参数
  * @param {string} args.taskId 项目id
  * @param {string} args.time 时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateCompletedTime: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateCompletedTime', args, options);
   },
  /**
  * 修改任务起止时间
  * @param {Object} args 请求参数
  * @param {string} args.taskId 项目id
  * @param {string} args.startTime 开始时间
  * @param {string} args.deadline 截止时间
  * @param {boolean} args.timeLock 时间锁（null:2个时间都有效，true:仅开始时间有效，false:仅截止时间有效）
  * @param {string} args.chargeAccountId 负责人id,默认空
  * @param {} args.updateType 确认类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskStartTimeAndDeadline: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskStartTimeAndDeadline', args, options);
   },
  /**
  * 获取打印任务详情
  * @param {Object} args 请求参数
  * @param {string} args.taskId 任务id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskDetail4Print: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskDetail4Print', args, options);
   },
  /**
  * 获取item转task的projectid和folderid
  * @param {Object} args 请求参数
  * @param {string} args.itemId itemId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectIdAndFolderIdForItemConvertTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetProjectIdAndFolderIdForItemConvertTask', args, options);
   },
  /**
  * 创建清单 no.1
  * @param {Object} args 请求参数
  * @param {string} args.taskId 项目id
  * @param {string} args.name 清单名
  * @param {string} args.previousCheckListId 前一个清单名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addCheckList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddCheckList', args, options);
   },
  /**
  * 获取任务下清单详情 no.2
  * @param {Object} args 请求参数
  * @param {string} args.taskId 任务id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCheckListsWithItemsInTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetCheckListsWithItemsInTask', args, options);
   },
  /**
  * 修改清单排序 no.3
  * @param {Object} args 请求参数
  * @param {string} args.currentCheckListId 当前清单id
  * @param {string} args.previousCheckListId 前一个清单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateCheckListIndex: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateCheckListIndex', args, options);
   },
  /**
  * 修改清单名
  * @param {Object} args 请求参数
  * @param {string} args.checkListId 清单id
  * @param {string} args.name 清单名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateCheckListName: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateCheckListName', args, options);
   },
  /**
  * 移除清单
  * @param {Object} args 请求参数
  * @param {string} args.checkListId 清单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeCheckList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RemoveCheckList', args, options);
   },
  /**
  * 添加检查项
（完成任务首页缓存）
  * @param {Object} args 请求参数
  * @param {string} args.checkListId 清单id
  * @param {string} args.names 名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addItems: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddItems', args, options);
   },
  /**
  * 修改检查项排序
  * @param {Object} args 请求参数
  * @param {string} args.currentItemId 检查项id
  * @param {string} args.previousItemId 前一个检查项id
  * @param {string} args.targetCheckListId 目标清单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateItemIndex: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateItemIndex', args, options);
   },
  /**
  * 修改检查项名称
（完成任务首页缓存）
  * @param {Object} args 请求参数
  * @param {string} args.itemId 检查项id
  * @param {string} args.name 名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateItemName: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateItemName', args, options);
   },
  /**
  * 修改检查项状态
（完成任务首页缓存）
  * @param {Object} args 请求参数
  * @param {string} args.itemId 检查项id
  * @param {boolean} args.status 状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateItemStatus: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateItemStatus', args, options);
   },
  /**
  * 移除检查项
  * @param {Object} args 请求参数
  * @param {string} args.itemId itemId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeItem: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RemoveItem', args, options);
   },
  /**
  * 获取自定义项目模板阶段配置
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderTemplateStage: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderTemplateStage', args, options);
   },
  /**
  * 保存项目为我的模板
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveAsMyFolderTemplate: function (args, options = {}) {
     
     return $.api('TaskCenter', 'SaveAsMyFolderTemplate', args, options);
   },
  /**
  * 删除我的模板
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeMyFolderTemplateOne: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RemoveMyFolderTemplateOne', args, options);
   },
  /**
  * 获取任务部分模板编辑页
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplateAndStages: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTemplateAndStages', args, options);
   },
  /**
  * 获取所有模板分类
  * @param {Object} args 请求参数
  * @param {string} args.appid 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplateTypes: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTemplateTypes', args, options);
   },
  /**
  * 获取指定模板分类的模板列表
  * @param {Object} args 请求参数
  * @param {string} args.templateTypeId 模板分类id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplatesByTemplateTypeId: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTemplatesByTemplateTypeId', args, options);
   },
  /**
  * 获取所有模板分类
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllSystemTemplates: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetAllSystemTemplates', args, options);
   },
  /**
  * 获取项目下的任务自定义筛选列表
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskOptionsInFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskOptionsInFolder', args, options);
   },
  /**
  * 根据项目id获取模板
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplateIdByFolderId: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTemplateIdByFolderId', args, options);
   },
  /**
  * 编辑任务下单个控件值
  * @param {Object} args 请求参数
  * @param {string} args.taskId 任务id
  * @param {string} args.controlId 控件id
  * @param {string} args.value 修改的值
  * @param {string} args.knowledgeAtt 知识中心附件(只有修改附件类型时使用)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateControlValue: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateControlValue', args, options);
   },
  /**
  * 修改项目的模板作用域
  * @param {Object} args 请求参数
  * @param {string} args.folderId 项目id
  * @param {boolean} args.templateScope 模板作用域， false： 全部使用 true：顶层任务使用 ，逻辑默认值设定为true ，数据库历史原因，可以避免刷数据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFolderTemplateScope: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFolderTemplateScope', args, options);
   },
  /**
  * 修改模板下单个任务配置
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {string} args.taskid 任务id
  * @param {string} args.pid 父id
  * @param {string} args.tnam 任务名
  * @param {string} args.tdesc 任务详情
  * @param {integer} args.stgsrt 看板排序（相当于看板id外键）
  * @param {string} args.cks 集合对象
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFTATaskInfo: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFTATaskInfo', args, options);
   },
  /**
  * 修改模板下项目描述
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {string} args.fdesc 描述
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFTAFolderDesc: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateFTAFolderDesc', args, options);
   },
  /**
  * 获取左侧菜单栏
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.other 查看他人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLeftMenu: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetLeftMenu', args, options);
   },
  /**
  * 获取未完成未开始任务计数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.folderId 项目id
  * @param {} args.fromType 来源类型
  * @param {boolean} args.isStar 是否标星
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTwoTypeTaskCount: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTwoTypeTaskCount', args, options);
   },
  /**
  * 获取我负责的 我托付的 我参与的有新讨论并未屏蔽提醒的任务数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskTabControlCount: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskTabControlCount', args, options);
   },
  /**
  * 获取任务日志
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {integer} args.page 请求页码
  * @param {integer} args.size 页面尺寸
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskLog: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskLog', args, options);
   },
  /**
  * 任务标签联想
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {string} args.keywords 关键字
  * @param {integer} args.pageIndex 请求页码
  * @param {integer} args.pageSize 每页数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTagsByTaskID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTagsByTaskID', args, options);
   },
  /**
  * 获取任务列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络ID
  * @param {} args.structure 所需返回值结构
  * @param {} args.sort 排序
  * @param {} args.filterType 筛选类型
  * @param {} args.status 任务状态
  * @param {} args.classify 自定义分类
  * @param {string} args.filterTaskIDs 需要排除的taskid
  * @param {string} args.filterMeTaskClassifys 需要排除的自定义类别
  * @param {boolean} args.isFirst 是不是第一次获取，前端不好拆就没拆
  * @param {string} args.other 查看他人
  * @param {array} args.tagIDs 标签idlist
  * @param {string} args.folderID 项目ID
  * @param {string} args.keywords 关键字
  * @param {string} args.completeTime 完成时间
  * @param {boolean} args.withoutTag 为关联标签
  * @param {integer} args.page 请求页码
  * @param {integer} args.size 每页数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskList', args, options);
   },
  /**
  * 获取星标任务
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络ID
  * @param {} args.status 所需返回值结构
  * @param {string} args.completeTime 完成时间
  * @param {integer} args.pageIndex 请求页码
  * @param {integer} args.pageSize 每页数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskListWithStar: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskListWithStar', args, options);
   },
  /**
  * 获取指定任务的 子任务列表
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {} args.sort 排序规则
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetSubTask', args, options);
   },
  /**
  * 获取网络下的未关联项目的任务列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.tagIDs 标签ids
  * @param {} args.sort 排序规则
  * @param {} args.status 任务状态
  * @param {string} args.completeTime 完成时间
  * @param {boolean} args.withoutTag 为关联标签
  * @param {string} args.other 被查看者id
  * @param {string} args.keywords 关键字
  * @param {integer} args.pageIndex 请求页码
  * @param {integer} args.pageSize 每页数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskListInProjectWithOutFolder: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskListInProjectWithOutFolder', args, options);
   },
  /**
  * 获取项目下的任务列表
  * @param {Object} args 请求参数
  * @param {integer} args.page 请求页码
  * @param {integer} args.size 每页数量
  * @param {string} args.folderID 项目id
  * @param {array} args.tagIDs 标签ids
  * @param {} args.sort 排序规则
  * @param {} args.status 任务状态
  * @param {string} args.completeTime 完成时间
  * @param {boolean} args.withoutTag 为关联标签
  * @param {object} args.controlSelectedDic 控件筛选
  * @param {array} args.chargeIds 负责人筛选
  * @param {} args.filterType 任务查询类别
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFolderTaskList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetFolderTaskList', args, options);
   },
  /**
  * 获取与我有关的任务列表简单信息
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键字
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 请求页码
  * @param {integer} args.pageSize 每页数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyTaskList: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetMyTaskList', args, options);
   },
  /**
  * 获取任务详情
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {} args.sort 排序规则
  * @param {boolean} args.isDecode 是否结义
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskDetail: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskDetail', args, options);
   },
  /**
  * 获取任务控件
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskControls: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskControls', args, options);
   },
  /**
  * 获取指定任务可以关联的全部任务
  * @param {Object} args 请求参数
  * @param {string} args.taskID 当前任务id
  * @param {string} args.keyword 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskList_RelationParent: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskList_RelationParent', args, options);
   },
  /**
  * 获取与我协作的任务, 个人详情页使用
  * @param {Object} args 请求参数
  * @param {string} args.withAccountID 查看的用户AccountID
  * @param {integer} args.pageNum page Number
  * @param {integer} args.pageSize pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskWithMe: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskWithMe', args, options);
   },
  /**
  * 获取当前人员的任务数量
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTaskNumber: function (args, options = {}) {
     
     return $.api('TaskCenter', 'GetTaskNumber', args, options);
   },
  /**
  * 添加任务（指定项目不存在时创建项目）
  * @param {Object} args 请求参数
  * @param {string} args.taskName 任务名
  * @param {string} args.projectId 网络ID
  * @param {string} args.stageID 看板ID（有folder选中的情况下否则为穿空）
  * @param {string} args.summary 任务描述
  * @param {string} args.folderID 项目ID
  * @param {string} args.folderName 项目名(项目ID存在已项目ID为主，没项目ID则根据项目名新建项目)
  * @param {string} args.chargeAccountID 指定任务负责人ID
  * @param {string} args.members 添加的任务成员
  * @param {string} args.parentID 指定创建的任务所属母任务(与项目互斥，母任务ID优先于folderID,folderName)
  * @param {string} args.postID 动态ID，添加到动态用
  * @param {string} args.worksheetAndRowId 工作表及行记录Id
  * @param {boolean} args.star 是否创建同时加星（个人设置）
  * @param {string} args.attachments 附件，会以讨论形式添加
  * @param {object} args.specialAccounts 特殊用户字典结构
  * @param {string} args.appID 来源应用：如明道云Web，IPhone客户端，Android客户端(GUID)
  * @param {string} args.deadline 截止时间
  * @param {string} args.knowledgeAtt 知识中心附件
  * @param {string} args.itemId 检查项id
  * @param {string} args.startTime 开始时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddTask', args, options);
   },
  /**
  * 复制任务
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {string} args.taskName 任务名称
  * @param {string} args.chargeUser 负责人
  * @param {boolean} args.taskDesc 是否复制-任务描述
  * @param {boolean} args.folderID 是否复制-项目信息
  * @param {boolean} args.members 是否复制-成员
  * @param {boolean} args.tag 是否复制-标签
  * @param {boolean} args.time 是否复制-截止日期
  * @param {boolean} args.subTask 是否复制-子任务
  * @param {boolean} args.subTaskDesc 是否复制-子任务描述
  * @param {boolean} args.checklist 是否复制-检查清单
  * @param {string} args.appID 来源应用：如明道云Web，IPhone客户端，Android客户端(GUID)
  * @param {boolean} args.taskAtts 是否复制-附件
  * @param {boolean} args.hasSubTasksChargeUser 是否子任务负责人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   duplicateTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DuplicateTask', args, options);
   },
  /**
  * 删除任务（单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {boolean} args.isSubTask 是否应用于子任务（是否删除子任务）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DeleteTask', args, options);
   },
  /**
  * 删除任务(批量)
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID 多个逗号,隔开
  * @param {boolean} args.isSubTask 是否应用于子任务（是否删除子任务）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchDeleteTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchDeleteTask', args, options);
   },
  /**
  * 修改任务负责人
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {string} args.charge 负责人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskCharge: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskCharge', args, options);
   },
  /**
  * 修改任务负责人 （多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID 多个逗号,隔开
  * @param {string} args.charge 负责人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskCharge: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskCharge', args, options);
   },
  /**
  * 修改任务名称
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.name 名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskName: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskName', args, options);
   },
  /**
  * 修改任务描述
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.summary 描述
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskSummary: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskSummary', args, options);
   },
  /**
  * 修改任务锁定状态（单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {boolean} args.locked 是否锁定
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskLocked: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskLocked', args, options);
   },
  /**
  * 修改任务锁定状态（多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID  使用逗号,隔开
  * @param {boolean} args.locked 是否锁定
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskLocked: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskLocked', args, options);
   },
  /**
  * 修改任务看板ID （单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.stageID 看板ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskStageID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskStageID', args, options);
   },
  /**
  * 修改任务看板ID  （多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID 使用逗号隔开
  * @param {string} args.stageID 看板ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskStageID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskStageID', args, options);
   },
  /**
  * 修改任务完成状态 （单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {} args.status 状态
  * @param {boolean} args.isSubTask 是否应用子任务
  * @param {integer} args.code 修改规则
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskStatus: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskStatus', args, options);
   },
  /**
  * 修改任务完成状态 （多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID   使用逗号隔开
  * @param {} args.status 状态
  * @param {boolean} args.isSubTask 是否应用子任务
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskStatus: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskStatus', args, options);
   },
  /**
  * 修改任务母任务ID （单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.parentID 母任务ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskParentID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskParentID', args, options);
   },
  /**
  * 修改任务母任务ID（多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID   使用逗号隔开
  * @param {string} args.parentID 母任务ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskParentID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskParentID', args, options);
   },
  /**
  * 修改任务母任务ID （单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskFolderID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskFolderID', args, options);
   },
  /**
  * 修改任务母任务ID（多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID 使用逗号隔开
  * @param {string} args.folderID 项目ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskFolderID: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskFolderID', args, options);
   },
  /**
  * 添加任务成员 多个
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID
  * @param {string} args.accountID 被操纵用户
  * @param {string} args.memberstr 成员id 逗号分隔
  * @param {object} args.specialAccounts 特殊用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchAddTaskMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchAddTaskMember', args, options);
   },
  /**
  * 添加任务成员 单个
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务id
  * @param {string} args.accountID 用户id
  * @param {object} args.specialAccounts 特殊用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTaskMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddTaskMember', args, options);
   },
  /**
  * 申请加入任务
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyJoinTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'ApplyJoinTask', args, options);
   },
  /**
  * 删除任务成员
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.accountID 被操纵用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteTaskMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'DeleteTaskMember', args, options);
   },
  /**
  * 删除任务成员
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID 逗号,隔开
  * @param {string} args.accountID 被操纵用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchDeleteTaskMember: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchDeleteTaskMember', args, options);
   },
  /**
  * 同意申请加入任务
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.accountID 被操纵用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   agreeApplyJoinTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AgreeApplyJoinTask', args, options);
   },
  /**
  * 拒绝加入任务
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.accountID 被操纵用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseJoinTask: function (args, options = {}) {
     
     return $.api('TaskCenter', 'RefuseJoinTask', args, options);
   },
  /**
  * 修改任务成员星标状态（单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {boolean} args.star 星标状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskMemberStar: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskMemberStar', args, options);
   },
  /**
  * 修改任务成员星标状态（多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID   使用逗号,隔开
  * @param {boolean} args.star 星标状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskMemberStar: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskMemberStar', args, options);
   },
  /**
  * 修改任务成员提醒状态（单个）
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {boolean} args.notice 提醒状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskMemberNotice: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskMemberNotice', args, options);
   },
  /**
  * 修改任务成员提醒状态（多个）
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务ID   使用逗号,隔开
  * @param {boolean} args.notice 提醒状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchUpdateTaskMemberNotice: function (args, options = {}) {
     
     return $.api('TaskCenter', 'BatchUpdateTaskMemberNotice', args, options);
   },
  /**
  * 修改任务成员 的分类  单个和多个
  * @param {Object} args 请求参数
  * @param {string} args.taskIDstr 任务
  * @param {} args.classify 分类
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateTaskMemberClassify: function (args, options = {}) {
     
     return $.api('TaskCenter', 'UpdateTaskMemberClassify', args, options);
   },
  /**
  * 添加动态回复到讨论
  * @param {Object} args 请求参数
  * @param {string} args.taskID 任务ID
  * @param {string} args.postID 动态ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTaskTopicFromPost: function (args, options = {}) {
     
     return $.api('TaskCenter', 'AddTaskTopicFromPost', args, options);
   },
};
