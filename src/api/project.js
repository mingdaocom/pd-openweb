export default {
  /**
  * 获取我加入的网络
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyProjects: function (args, options = {}) {
     
     return $.api('Project', 'GetMyProjects', args, options);
   },
  /**
  * 获取网络基本信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectInfo: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectInfo', args, options);
   },
  /**
  * 获取网络授权信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectLicenseInfo: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectLicenseInfo', args, options);
   },
  /**
  * 保存公司信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.companyName 公司名称
  * @param {string} args.companyDisplayName 公司显示名称
  * @param {string} args.companyNameEnglish 公司英文名称
  * @param {integer} args.geographyId 地理位置id
  * @param {integer} args.industryId 行业id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setProjectInfo: function (args, options = {}) {
     
     return $.api('Project', 'SetProjectInfo', args, options);
   },
  /**
  * 二级域名有效性验证
  * @param {Object} args 请求参数
  * @param {string} args.host host地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkSubDomain: function (args, options = {}) {
     
     return $.api('Project', 'CheckSubDomain', args, options);
   },
  /**
  * 获取二级域名页面数据
  * @param {Object} args 请求参数
  * @param {string} args.host Host 地址
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectSubDomainInfo: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectSubDomainInfo', args, options);
   },
  /**
  * 联想企业域名的邮箱
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectDomainEmail: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectDomainEmail', args, options);
   },
  /**
  * 获取网络财务信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectFinance: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectFinance', args, options);
   },
  /**
  * 修改网络财务信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.address 邮寄地址
  * @param {string} args.recipientName 发票接收人
  * @param {string} args.postcode 邮编
  * @param {string} args.contactPhone 电话
  * @param {string} args.mobilePhone 手机
  * @param {string} args.email Email地址
  * @param {string} args.emailRecipientName Email收件人
  * @param {string} args.fax 传真
  * @param {string} args.taxNumber 税务登记号
  * @param {} args.invoiceType 发票类型 1：普票 2：增票
  * @param {string} args.taxBank 开户行
  * @param {string} args.taxBankNumber 账号
  * @param {string} args.taxRegAddress 注册地址
  * @param {string} args.taxRegContactPhone 注册电话
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateProjectFinance: function (args, options = {}) {
     
     return $.api('Project', 'UpdateProjectFinance', args, options);
   },
  /**
  * 获取网络授权辅助信息
  * @param {Object} args 请求参数
  * @param {boolean} args.onlyNormal 是否只需要基本信息
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectLicenseSupportInfo: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectLicenseSupportInfo', args, options);
   },
  /**
  * 获取网络有效成员数量
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEffectiveUsersCount: function (args, options = {}) {
     
     return $.api('Project', 'GetEffectiveUsersCount', args, options);
   },
  /**
  * 获取网络注销记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectLogOff: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectLogOff', args, options);
   },
  /**
  * 申请注销
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.reason 原因
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyCancelProject: function (args, options = {}) {
     
     return $.api('Project', 'ApplyCancelProject', args, options);
   },
  /**
  * 取消申请注销
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeApplyCancelProject: function (args, options = {}) {
     
     return $.api('Project', 'RemoveApplyCancelProject', args, options);
   },
  /**
  * 取消高级模式试用授权
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeProjectTrialLicense: function (args, options = {}) {
     
     return $.api('Project', 'RemoveProjectTrialLicense', args, options);
   },
  /**
  * 获取我邀请加入网络成员的历史记录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 第几页
  * @param {integer} args.pageSize 每页显示记录数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getInvitedUsersJoinProjectLog: function (args, options = {}) {
     
     return $.api('Project', 'GetInvitedUsersJoinProjectLog', args, options);
   },
  /**
  * 检测网络是不是免费网络 true:非免费
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkProjectIsNotFree: function (args, options = {}) {
     
     return $.api('Project', 'CheckProjectIsNotFree', args, options);
   },
  /**
  * 获取网络集成类型
0 代表尚未集成，1代表钉钉自建应用集成，2代表企业微信（第三方），3代表企业微信自建应用，4代表Welink自建应用集成
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectSource: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectSource', args, options);
   },
  /**
  * 获取网络邀请人数赠送规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getInviteGiveRule: function (args, options = {}) {
     
     return $.api('Project', 'GetInviteGiveRule', args, options);
   },
  /**
  * 获取网络内待审批用户数量
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectUnauditedUserCount: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectUnauditedUserCount', args, options);
   },
  /**
  * 获取企业账户首页引导状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectGuidSetting: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectGuidSetting', args, options);
   },
  /**
  * 给用户发送安装手机App或企业客户端通知
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账号Id 数组：[accountId1,accountId2]
  * @param {} args.clientType 通知类型 0：客户端 1：移动端
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pushInstallClientMsg: function (args, options = {}) {
     
     return $.api('Project', 'PushInstallClientMsg', args, options);
   },
  /**
  * 获取部门数量
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectDepartmentCount: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectDepartmentCount', args, options);
   },
  /**
  * 获取工作地点数量
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectWorkSitesCount: function (args, options = {}) {
     
     return $.api('Project', 'GetProjectWorkSitesCount', args, options);
   },
  /**
  * 绑定微信公众号
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   bindingWeiXin: function (args, options = {}) {
     
     return $.api('Project', 'BindingWeiXin', args, options);
   },
  /**
  * 获取绑定的微信公众号信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWeiXinBindingInfo: function (args, options = {}) {
     
     return $.api('Project', 'GetWeiXinBindingInfo', args, options);
   },
  /**
  * 取消绑定微信公众号
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelBindingWeiXin: function (args, options = {}) {
     
     return $.api('Project', 'CancelBindingWeiXin', args, options);
   },
  /**
  * 微信公众号绑定回调
  * @param {Object} args 请求参数
  * @param {string} args.state 微信回调参数
  * @param {string} args.authCode 微信回调参数
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   callBackWeiXinBinding: function (args, options = {}) {
     
     return $.api('Project', 'CallBackWeiXinBinding', args, options);
   },
  /**
  * 私有部署绑定微信公众号
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.appId
  * @param {string} args.appSecret
  * @param {string} args.name 公众号名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTpAuthorizerInfo: function (args, options = {}) {
     
     return $.api('Project', 'AddTpAuthorizerInfo', args, options);
   },
  /**
  * 获取所有专属算力实例
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.resourceIds 资源id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getComputingInstances: function (args, options = {}) {
     
     return $.api('Project', 'GetComputingInstances', args, options);
   },
  /**
  * 获取专属算力实例详情
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.id 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getComputingInstanceDetail: function (args, options = {}) {
     
     return $.api('Project', 'GetComputingInstanceDetail', args, options);
   },
  /**
  * 更新专属算力实例名称
删除专属算力
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.instanceId 专属算力实例id
  * @param {string} args.name 专属算力实例name
  * @param {boolean} args.isDelete 是否删除  true表示删除，默认为false
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateComputingInstance: function (args, options = {}) {
     
     return $.api('Project', 'UpdateComputingInstance', args, options);
   },
  /**
  * 重试创建专属算力实例
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.id id
  * @param {string} args.resourceId 资源id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   retryComputingInstance: function (args, options = {}) {
     
     return $.api('Project', 'RetryComputingInstance', args, options);
   },
};
