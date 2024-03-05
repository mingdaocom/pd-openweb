export default {
  /**
  * 创建
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.name 插件名称
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {array} args.debugEnvironments 调试环境
  * @param {} args.pluginType
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   create: function (args, options = {}) {
     
     return $.api('Plugin', 'Create', args, options);
   },
  /**
  * 编辑
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {string} args.name 插件名称
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {array} args.debugEnvironments 调试环境
  * @param {array} args.paramSettings 参数设置
  * @param {object} args.switchSettings 功能开关配置
  * @param {object} args.configuration 配置
  * @param {integer} args.stepState 步骤状态（前端自己决定,前提时值必须大于等于0）
  * @param {} args.source
  * @param {integer} args.state 插件状态
组织插件状态 0-未启用 1-启用 2-删除
开发插件 0-正常状态 2-已删除
  * @param {integer} args.templateType 模板类型
  * @param {string} args.viewId 视图id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   edit: function (args, options = {}) {
     
     return $.api('Plugin', 'Edit', args, options);
   },
  /**
  * 获取单个插件详情
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {} args.source
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDetail: function (args, options = {}) {
     
     return $.api('Plugin', 'GetDetail', args, options);
   },
  /**
  * 获取插件列表
  * @param {Object} args 请求参数
  * @param {string} args.creator 创建者，默认为当前登录账号
  * @param {string} args.projectId 组织id
  * @param {string} args.keywords 关键字搜索（插件名称）
  * @param {integer} args.state 是否启用状态
  * @param {} args.pluginType
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {} args.source
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getList: function (args, options = {}) {
     
     return $.api('Plugin', 'GetList', args, options);
   },
  /**
  * 获取所有插件
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.type
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAll: function (args, options = {}) {
     
     return $.api('Plugin', 'GetAll', args, options);
   },
  /**
  * 删除
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {} args.source
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   remove: function (args, options = {}) {
     
     return $.api('Plugin', 'Remove', args, options);
   },
  /**
  * 发布插件的新版本
  * @param {Object} args 请求参数
  * @param {string} args.id 提交历史记录id
  * @param {string} args.versionCode 版本号
  * @param {string} args.description 说明
  * @param {object} args.configuration 配置
  * @param {string} args.pluginId 插件id
  * @param {} args.pluginSource
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   release: function (args, options = {}) {
     
     return $.api('Plugin', 'Release', args, options);
   },
  /**
  * 回滚到某一个版本
  * @param {Object} args 请求参数
  * @param {string} args.releaseId 版本id
  * @param {string} args.pluginId 插件id
  * @param {} args.source
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   rollback: function (args, options = {}) {
     
     return $.api('Plugin', 'Rollback', args, options);
   },
  /**
  * 获取版本历史
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {} args.source
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getReleaseHistory: function (args, options = {}) {
     
     return $.api('Plugin', 'GetReleaseHistory', args, options);
   },
  /**
  * 删除版本
  * @param {Object} args 请求参数
  * @param {string} args.id 版本id
  * @param {string} args.pluginId 插件id
  * @param {} args.source
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRelease: function (args, options = {}) {
     
     return $.api('Plugin', 'RemoveRelease', args, options);
   },
  /**
  * 创建提交历史记录
  * @param {Object} args 请求参数
  * @param {string} args.pluginId 插件id
  * @param {} args.content
  * @param {string} args.message 提交消息
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   commit: function (args, options = {}) {
     
     return $.api('Plugin', 'Commit', args, options);
   },
  /**
  * 删除提交历史记录
  * @param {Object} args 请求参数
  * @param {string} args.id 提交记录id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeCommit: function (args, options = {}) {
     
     return $.api('Plugin', 'RemoveCommit', args, options);
   },
  /**
  * 获取提交历史列表
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 当前页
  * @param {} args.source
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCommitHistory: function (args, options = {}) {
     
     return $.api('Plugin', 'GetCommitHistory', args, options);
   },
  /**
  * 获取插件使用明细
  * @param {Object} args 请求参数
  * @param {string} args.id 插件id
  * @param {integer} args.pageSize 分页大小
  * @param {integer} args.pageIndex 当前页
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUseDetail: function (args, options = {}) {
     
     return $.api('Plugin', 'GetUseDetail', args, options);
   },
};
