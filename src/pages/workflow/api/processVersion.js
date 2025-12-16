import base, { controllerName } from './base';

/**
 * processVersion
 */
const processVersion = {
  /**
   * 批量设置(暂停 恢复)流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {流程管理后台批量操作} {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  batch: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processbatch', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 按网络获取流程堆积量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDifferenceByCompanyId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceByCompanyId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetDifferenceByCompanyId', args, $.extend(base, options));
  },
  /**
   * 获取流程堆积量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] 编辑版流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDifferenceByProcessId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceByProcessId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetDifferenceByProcessId', args, $.extend(base, options));
  },
  /**
   * 按网络获取堆积流程总数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestProcessDifference} {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}*difference
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDifferenceProcessCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetDifferenceProcessCount', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 按网络获取堆积流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestProcessDifference} {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}*difference
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDifferenceProcessList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetDifferenceProcessList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 按历史id获取堆积流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestProcessDifference} {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}*difference
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDifferenceProcessListByIds: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessListByIds';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(
      controllerName,
      'v1processgetDifferenceProcessListByIds',
      JSON.stringify(args),
      $.extend(base, options),
    );
  },
  /**
   * 按网络获取流程堆积量历史
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestInstanceIncrementManage} {companyId:网络id(string),endDate:结束时间 yyyy-MM-dd HH:mm:ss(string),startDate:开始时间 yyyy-MM-dd HH:mm:ss(string),}*manage
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryDifferenceByCompanyId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getHistoryDifferenceByCompanyId';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(
      controllerName,
      'v1processgetHistoryDifferenceByCompanyId',
      JSON.stringify(args),
      $.extend(base, options),
    );
  },
  /**
   * 按流程id获取有堆积的历史
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] 编辑版流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryDifferenceByProcessId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getHistoryDifferenceByProcessId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetHistoryDifferenceByProcessId', args, $.extend(base, options));
  },
  /**
   * 获取已有通道
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.companyId] *网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getRouterList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getRouterList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetRouterList', args, $.extend(base, options));
  },
  /**
   * 获取预警配置
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.companyId] *网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getWarning: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getWarning';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetWarning', args, $.extend(base, options));
  },
  /**
   * 同步所有应用 所有执行数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestProcessDifference} {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  init: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/init';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processinit', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 丢弃排队
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {流程管理后台批量操作} {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  remove: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/remove';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processremove', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 重置排队计数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {流程管理后台批量操作} {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  reset: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/reset';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processreset', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改选择的通道
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {流程管理后台批量操作} {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateRouterIndex: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateRouterIndex';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateRouterIndex', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 设置暂停流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {流程管理后台批量操作} {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateWaiting: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateWaiting';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateWaiting', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改预警配置
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestInstanceWarning} {accountIds:通知人(array),companyId:网络id(string),enableEmail:邮件(boolean),enableSms:短信(boolean),value:预警值(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateWarning: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateWarning';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateWarning', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 流程列表数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] 应用ID 或者 网络ID
   * @param {string} [args.relationType] 类型 0 网络，2应用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  count: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/count';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processcount', args, $.extend(base, options));
  },
  /**
   * 网络流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.apkId] 应用ID
   * @param {string} [args.companyId] 网络id
   * @param {string} [args.createrIds] 创建者
   * @param {string} [args.enabled] 开启状态 0 全部，1：开启，2：关闭
   * @param {string} [args.isAsc] 是否升序
   * @param {string} [args.keyWords] 搜索框
   * @param {string} [args.pageIndex] 页数
   * @param {string} [args.pageSize] 条数
   * @param {string} [args.processListType] 列表类型
   * @param {string} [args.sortId] 排序字段id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessByCompanyId: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessByCompanyId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessByCompanyId', args, $.extend(base, options));
  },
  /**
   * 流程操作权限
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] 应用ID 或者 流程ID
   * @param {string} [args.relationType] 类型 0 网络，2应用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessRole: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessRole';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessRole', args, $.extend(base, options));
  },
  /**
   * 获取流程使用数量和执行次数
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] 公司ID ,个人传空
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessUseCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessUseCount';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessUseCount', args, $.extend(base, options));
  },
  /**
   * 流程列表接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.keyWords] keyWords
   * @param {integer} [args.pageIndex] pageIndex
   * @param {integer} [args.pageSize] pageSize
   * @param {string} [args.processListType] *流程列表类型：1:工作表触发，2:时间触发，3:其他应用修改本应用，4:应用流程，5:网络流程,100:回收站
   * @param {string} [args.relationId] 应用ID 或者 网络ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/list';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processlist', args, $.extend(base, options));
  },
  /**
   * 应用下所有流程接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.keyWords] keyWords
   * @param {integer} [args.pageIndex] pageIndex
   * @param {integer} [args.pageSize] pageSize
   * @param {string} [args.relationId] 应用ID 或者 网络ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  listAll: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/listAll';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processlistAll', args, $.extend(base, options));
  },
  /**
   * 切底删除流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  removeProcess: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/removeProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processremoveProcess', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 恢复流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  restoreProcess: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/restoreProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processrestoreProcess', JSON.stringify(args), $.extend(base, options));
  },
};
export default processVersion;
