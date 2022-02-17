module.exports = {
  /**
  * 修改系统配置
  * @param {Object} args 请求参数
  * @param {object} args.settings 配置项
OnlyAdminCreateApp:bool，是否只有管理员可以创建应用
HideTemplateLibrary:bool，是否隐藏模板库
ForbidSuites:string，隐藏的协作套件 【1:动态 2:任务 3:日程 4:文件，多个用|分隔】，人事模块强制不显示
HideDownloadApp:bool，是否隐藏 APP 下载入口
DownloadAppRedirectUrl:string，APP 下载落地页（APP 定制开发的客户需要）
HideHelpTip:bool, 是否隐藏帮助提示
HideRegister:bool, 是否隐藏注册入口
WorkflowBatchGetDataLimitCount:int，工作流批量数据获取限制条数
WorkflowSubProcessDataLimitCount:int, 工作流子流程数据源限制条数
WorktableBatchOperateDataLimitCount:int，工作表批量数据操作限制条数
WorksheetExcelImportDataLimitCount:int, 工作表 Excel 数据导入限制条数
FileUploadLimitSize:int，文件上传限制大小（单位：M）
InstallCaptainUrl:string，安装管理器访问地址
ServiceStatusWebhookUrl:string 服务状态通知地址
RefreshReportInterval:int 刷新报表时间间隔（单位：秒），默认 300s
AllowBindAccountNoVerify:bool 是否允许绑定账号不验证
PasswordRegex:string 密码正则表达式
PasswordRegexTip:string 密码正则表达式说明文字
EnableTwoFactorAuthentication:bool 是否启用双因素认证
TwoFactorAuthenticationPriorityType:int 双因素认证优先的账号类型（1：手机号，2：邮箱）
FirstLoginResetPassword:bool 首次登录需要重置密码
PasswordOverdueDays:int 密码过期时间，0代表不过期
EnableDeclareConfirm:bool 是否开启申明确认
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSysSettings: function (args, options = {}) {
     
     return $.api('PrivateSysSetting', 'EditSysSettings', args, options);
   },
};
