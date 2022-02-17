module.exports = {
  /**
  * 获取职位列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {} args.sortField 排序字段
  * @param {} args.sortType 排序方式
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getJobs: function (args, options = {}) {
     
     return $.api('Job', 'GetJobs', args, options);
   },
  /**
  * 添加职位
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobName 职位名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addJob: function (args, options = {}) {
     
     return $.api('Job', 'AddJob', args, options);
   },
  /**
  * 修改职位名称
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobId 职位id
  * @param {string} args.jobName 职位名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editJobName: function (args, options = {}) {
     
     return $.api('Job', 'EditJobName', args, options);
   },
  /**
  * 合并职位
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobId 合并到的职位Id
  * @param {array} args.toMergerIds 被合并的职位Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mergeJobs: function (args, options = {}) {
     
     return $.api('Job', 'MergeJobs', args, options);
   },
  /**
  * 删除职位
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.jobIds 职位Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteJobs: function (args, options = {}) {
     
     return $.api('Job', 'DeleteJobs', args, options);
   },
  /**
  * 获取 职位成员列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobId 职位id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedJobAccounts: function (args, options = {}) {
     
     return $.api('Job', 'PagedJobAccounts', args, options);
   },
  /**
  * 获取用户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobId 职位id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getJobUsers: function (args, options = {}) {
     
     return $.api('Job', 'GetJobUsers', args, options);
   },
  /**
  * 添加用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.jobId 职位id
  * @param {array} args.accountIds 账号Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addJobUser: function (args, options = {}) {
     
     return $.api('Job', 'AddJobUser', args, options);
   },
  /**
  * 删除用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账号Id
  * @param {string} args.jobId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteJobUser: function (args, options = {}) {
     
     return $.api('Job', 'DeleteJobUser', args, options);
   },
  /**
  * 删除用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账号Id
  * @param {string} args.jobId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteJobUsers: function (args, options = {}) {
     
     return $.api('Job', 'DeleteJobUsers', args, options);
   },
};
