export default {
  /**
  * 获取登录日志列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 当前页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {} args.logType
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
  * @param {} args.type
  * @param {string} args.entityId 实体id(根据访问类型不同， 传不同模块id)
浏览应用，entityId =应用id，浏览自定义页面，entityId = 页面id。其他的浏览行为 =worksheetId
  * @param {} args.params
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLog: function (args, options = {}) {
     
     return $.api('ActionLog', 'AddLog', args, options);
   },
};
