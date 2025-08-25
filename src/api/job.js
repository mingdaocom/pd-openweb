export default {
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
    return mdyAPI('Job', 'AddJob', args, options);
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
    return mdyAPI('Job', 'EditJobName', args, options);
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
    return mdyAPI('Job', 'DeleteJobs', args, options);
  },
  /**
   * 导入职位
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.projectId 网络id
   * @param {string} args.fileName 文件名
   * @param {string} args.originalFileName 原上传文件名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  importJobList: function (args, options = {}) {
    return mdyAPI('Job', 'ImportJobList', args, options);
  },
  /**
   * 添加 职位成员
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.jobId 职位id
   * @param {array} args.accountIds 账号Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addJobUser: function (args, options = {}) {
    return mdyAPI('Job', 'AddJobUser', args, options);
  },
  /**
   * 移除 职位成员
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账号Id
   * @param {string} args.jobId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteJobUser: function (args, options = {}) {
    return mdyAPI('Job', 'DeleteJobUser', args, options);
  },
  /**
   * 批量移除 职位成员
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账号Id
   * @param {string} args.jobId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteJobUsers: function (args, options = {}) {
    return mdyAPI('Job', 'DeleteJobUsers', args, options);
  },
  /**
   * 获取职位列表（前后台共用?）
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.keywords 关键词
   * @param {} args.sortField
   * @param {} args.sortType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getJobs: function (args, options = {}) {
    return mdyAPI('Job', 'GetJobs', args, options);
  },
  /**
   * 获取 职位成员列表 （前后台共用?）
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
    return mdyAPI('Job', 'PagedJobAccounts', args, options);
  },
};
