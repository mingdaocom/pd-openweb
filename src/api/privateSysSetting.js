export default {
  /**
  * 系统配置
  * @param {Object} args 请求参数
  * @param {object} args.settings 配置项
&lt;br&gt;OnlyAdminCreateApp:bool，是否只有管理员可以创建应用&lt;br&gt;HideTemplateLibrary:bool，是否隐藏模板库&lt;br&gt;TemplateLibraryTypes:string，开启的模板库类型，1：明道云应用库 2：自建运用库，多个使用英文逗号分隔&lt;br&gt;TemplateLibraryAuditProjectId，string 模板库应用上架允许审核的组织Id&lt;br&gt;ForbidSuites:string，隐藏的协作套件 【1:动态 2:任务 3:日程 4:文件，多个用|分隔】，人事模块强制不显示&lt;br&gt;HideDownloadApp:bool，是否隐藏 APP 下载入口&lt;br&gt;DownloadAppRedirectUrl:string，APP 下载落地页（APP 定制开发的客户需要）&lt;br&gt;HideHelpTip:bool，是否隐藏帮助提示&lt;br&gt;HideRegister:bool，是否隐藏注册入口&lt;br&gt;WorkflowBatchGetDataLimitCount:int，工作流批量数据获取限制条数&lt;br&gt;WorkflowSubProcessDataLimitCount:int，工作流子流程数据源限制条数&lt;br&gt;WorktableBatchOperateDataLimitCount:int，工作表批量数据操作限制条数&lt;br&gt;WorksheetExcelImportDataLimitCount:int，工作表 Excel 数据导入限制条数&lt;br&gt;FileUploadLimitSize:int，文件上传限制大小（单位：M）&lt;br&gt;InstallCaptainUrl:string，安装管理器访问地址&lt;br&gt;ServiceStatusWebhookUrl:string，服务状态通知地址&lt;br&gt;RefreshReportInterval:int，刷新报表时间间隔（单位：秒），默认 300s&lt;br&gt;AllowBindAccountNoVerify:bool，是否允许绑定账号不验证&lt;br&gt;PasswordRegex:string，密码正则表达式&lt;br&gt;PasswordRegexTip:string，密码正则表达式说明文字&lt;br&gt;EnableTwoFactorAuthentication:bool，是否启用双因素认证&lt;br&gt;TwoFactorAuthenticationPriorityType:int，双因素认证优先的账号类型（1：手机号，2：邮箱）&lt;br&gt;FirstLoginResetPassword:bool，首次登录需要重置密码&lt;br&gt;PasswordOverdueDays:int，密码过期时间，0代表不过期&lt;br&gt;EnableDeclareConfirm:bool，是否开启申明确认&lt;br&gt;BrandName:string，品牌名&lt;br&gt;BrandLogo:string，品牌Logo&lt;br&gt;BrandHomeImage:string，品牌背景&lt;br&gt;BrandFavicon:string，品牌 Favicon&lt;br&gt;EnableCreateProject:bool，非平台管理员是否可以创建组织&lt;br&gt;ExportAppWorksheetLimitCount:int，导出的应用工作表总数上限&lt;br&gt;EnableMultipleDevicesUse:bool，是否允许多个设备同步登录&lt;br&gt;WorkWxSelfBuildNoticUrl:string，企业微信申请集成通知地址&lt;br&gt;HideBrandName:bool，是否隐藏品牌名（登录页面）&lt;br&gt;HideBrandLogo:bool，是否隐藏品牌Logo（登录页面）&lt;br&gt;BrandLogoHeight:int，品牌Logo显示高度&lt;br&gt;HideIntegration:bool，是否隐藏集成中心入口&lt;br&gt;HideIntegrationLibrary:bool，是否隐藏集成中心预置API库&lt;br&gt;AppRecycleDays:int，应用回收站保留天数&lt;br&gt;AppItemRecycleDays:int，应用项回收站保留天数&lt;br&gt;WorksheetRowRecycleDays:int，工作表行记录回收站保留天数&lt;br&gt;AppBackupRecycleDays:int，应用备份文件回收站保留天数&lt;br&gt;HideWorkWeixin:bool，隐藏企业微信&lt;br&gt;HideDingding:bool，隐藏钉钉&lt;br&gt;HideFeishu:bool，隐藏飞书&lt;br&gt;HideWelink:bool，隐藏Welink&lt;br&gt;HideWeixin:bool，隐藏微信公众号&lt;br&gt;HideWorksheetControl:string，隐藏的工作表控件（多个使用|分割）&lt;br&gt;EnableMobilePhoneRegister:bool，是否允许手机号注册&lt;br&gt;EnableEmailRegister:bool，是否允许邮箱注册&lt;br&gt;EnableEditAccountInfo:bool，是否允许修改个人账号信息&lt;br&gt;EnableSmsCustomContent:bool，是否支持自定义短信内容的功能
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSysSettings: function (args, options = {}) {

     return mdyAPI('PrivateSysSetting', 'EditSysSettings', args, options);
   },
  /**
  * 获取组织列表
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjects: function (args, options = {}) {

     return mdyAPI('PrivateSysSetting', 'GetProjects', args, options);
   },
  /**
  * 获取组织
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProject: function (args, options = {}) {

     return mdyAPI('PrivateSysSetting', 'GetProject', args, options);
   },
};
