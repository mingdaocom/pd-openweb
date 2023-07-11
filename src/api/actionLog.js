export default {
  /**
  * 获取登录日志列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 当前页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {} args.logType 用户行为日志类型 1=登录 2=登出
  * @param {array} args.accountIds 用户ID
  * @param {array} args.columnNames 列名称
  * @param {boolean} args.confirmExport 是否确认导出(超量的情况下传)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getActionLogs: function (args, options = {}) {
     
     return $.api('ActionLog', 'GetActionLogs', args, options);
   },
  /**
  * 获取登录设备列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountDevices: function (args, options = {}) {
     
     return $.api('ActionLog', 'GetAccountDevices', args, options);
   },
  /**
  * 添加行为日志
  * @param {Object} args 请求参数
  * @param {} args.type 1= 应用，2 = 工作表,3= 自定义页面，4 = 工作表记录,5 = 打印了记录，6 = 使用了word模板打印 ，7=使用模板打印了记录，8 = 打印了二维码，9 = 打印了条形码,10=批量使用word打印
  * @param {string} args.entityId 实体id(根据访问类型不同， 传不同模块id)
浏览应用，entityId =应用id，浏览自定义页面，entityId = 页面id。其他的浏览行为 =worksheetId
  * @param {} args.params 额外参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLog: function (args, options = {}) {
     
     return $.api('ActionLog', 'AddLog', args, options);
   },
};
