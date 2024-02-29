export default {
  /**
  * 获取工作地点列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 分页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {} args.sortField
  * @param {} args.sortType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkSites: function (args, options = {}) {
     
     return $.api('WorkSite', 'GetWorkSites', args, options);
   },
  /**
  * 添加工作地点
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.workSiteName 工作地点名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkSite: function (args, options = {}) {
     
     return $.api('WorkSite', 'AddWorkSite', args, options);
   },
  /**
  * 修改工作地点名称
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.workSiteId 工作地点Id
  * @param {string} args.workSiteName 工作地点名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorkSiteName: function (args, options = {}) {
     
     return $.api('WorkSite', 'UpdateWorkSiteName', args, options);
   },
  /**
  * 工作地点合并
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.workSiteId 工作地点Id
  * @param {array} args.toMergerIds 合并的工作地点Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mergeWorkSites: function (args, options = {}) {
     
     return $.api('WorkSite', 'MergeWorkSites', args, options);
   },
  /**
  * 删除工作地点
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.workSiteIds 删除的工作地点Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteWorkSites: function (args, options = {}) {
     
     return $.api('WorkSite', 'DeleteWorkSites', args, options);
   },
  /**
  * 获取用户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.workSiteId 工作地点Id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 分页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkSiteUsers: function (args, options = {}) {
     
     return $.api('WorkSite', 'GetWorkSiteUsers', args, options);
   },
  /**
  * 添加用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.workSiteId 工作地点Id
  * @param {array} args.accountIds 账号Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkSiteUser: function (args, options = {}) {
     
     return $.api('WorkSite', 'AddWorkSiteUser', args, options);
   },
  /**
  * 删除用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账号Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteWorkSiteUser: function (args, options = {}) {
     
     return $.api('WorkSite', 'DeleteWorkSiteUser', args, options);
   },
};
