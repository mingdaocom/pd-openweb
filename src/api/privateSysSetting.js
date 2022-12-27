module.exports = {
  /**
  * 系统配置
  * @param {Object} args 请求参数
  * @param {object} args.settings 配置项
&lt;br&gt;OnlyAdminCreateApp:bool，是否只有管理员可以创建应用&lt;br&gt;HideTemplateLibrary:bool，是否隐藏模板库&lt;br&gt;ForbidSuites:string，隐藏的协作套件 【1:动态 2:任务 3:日程 4:文件，多个用|分隔】，人事模块强制不显示&lt;br&gt;HideDownloadApp:bool，是否隐藏 APP 下载入口&lt;br&gt;DownloadAppRedirectUrl:string，APP 下载落地页（APP 定制开发的客户需要）&lt;br&gt;HideHelpTip:bool, 是否隐藏帮助提示&lt;br&gt;HideRegister:bool, 是否隐藏注册入口&lt;br&gt;WorkflowBatchGetDataLimitCount:int，工作流批量数据获取限制条数&lt;br&gt;WorkflowSubProcessDataLimitCount:int, 工作流子流程数据源限制条数&lt;br&gt;WorktableBatchOperateDataLimitCount:int，工作表批量数据操作限制条数&lt;br&gt;WorksheetExcelImportDataLimitCount:int, 工作表 Excel 数据导入限制条数&lt;br&gt;FileUploadLimitSize:int，文件上传限制大小（单位：M）&lt;br&gt;InstallCaptainUrl:string，安装管理器访问地址&lt;br&gt;ServiceStatusWebhookUrl:string 服务状态通知地址&lt;br&gt;RefreshReportInterval:int 刷新报表时间间隔（单位：秒），默认 300s&lt;br&gt;AllowBindAccountNoVerify:bool 是否允许绑定账号不验证&lt;br&gt;PasswordRegex:string 密码正则表达式&lt;br&gt;PasswordRegexTip:string 密码正则表达式说明文字&lt;br&gt;EnableTwoFactorAuthentication:bool 是否启用双因素认证&lt;br&gt;TwoFactorAuthenticationPriorityType:int 双因素认证优先的账号类型（1：手机号，2：邮箱）&lt;br&gt;FirstLoginResetPassword:bool 首次登录需要重置密码&lt;br&gt;PasswordOverdueDays:int 密码过期时间，0代表不过期&lt;br&gt;EnableDeclareConfirm:bool 是否开启申明确认&lt;br&gt;BrandName:string 品牌名&lt;br&gt;BrandLogo:string 品牌Logo&lt;br&gt;BrandHomeImage:string 品牌背景&lt;br&gt;BrandFavicon:string 品牌 Favicon
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSysSettings: function (args, options = {}) {
     
     return $.api('PrivateSysSetting', 'EditSysSettings', args, options);
   },
  /**
  * 获取组织列表
  * @param {Object} options 配置参数
  * @param {string} options.keywords 关键词
  * @param {integer} options.pageSize 数量
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjects: function (args, options = {}) {
     
     return $.api('PrivateSysSetting', 'GetProjects', args, options);
   },
  /**
  * 获取组织
  * @param {Object} options 配置参数
  * @param {string} options.projectId 组织id
  * @param {string} options.companyName 公司名
  * @param {string} options.projectCode 门牌号
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProject: function (args, options = {}) {
     
     return $.api('PrivateSysSetting', 'GetProject', args, options);
   },
};
