export default {
  /**
  * 导入用户
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.projectId 网络id
  * @param {string} args.fileName 文件名
  * @param {string} args.originalFileName 原始文件名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   importUserList: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'ImportUserList', args, options);
   },
  /**
  * 导入编辑用户
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.projectId 网络id
  * @param {string} args.fileName 文件名
  * @param {string} args.originalFileName 原始文件名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   importEditUserList: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'ImportEditUserList', args, options);
   },
  /**
  * 邀请单个用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.account 账号
  * @param {string} args.accountId 账号id
  * @param {string} args.fullname 姓名
  * @param {string} args.jobNumber 工号
  * @param {string} args.workSiteId 工作地点id
  * @param {string} args.contactPhone 工作电话
  * @param {string} args.departmentIds 用分号分隔，所选部门Id集（第一个为主部门）
  * @param {string} args.jobIds 用分号分隔，所选职位Id集
  * @param {} args.verifyType
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   inviteUser: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'InviteUser', args, options);
   },
  /**
  * 重新邀请导入未响应的用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accounts 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   reInviteImportUser: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'ReInviteImportUser', args, options);
   },
  /**
  * 取消邀请导入的用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accounts 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelImportUser: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'CancelImportUser', args, options);
   },
  /**
  * 查找整个网络的导入用户，未被使用的列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getImportUserDetails: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'GetImportUserDetails', args, options);
   },
  /**
  * 整个网络的导入用户，未被使用的总数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUnusedInfosByProjectIdCount: function (args, options = {}) {
     
     return mdyAPI('ImportUser', 'GetUnusedInfosByProjectIdCount', args, options);
   },
};
