import base, { controllerName } from './base';
/**
 * process
*/
var process = {
  /**
   * 创建流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {增加流程} {companyId:公司ID(string),explain:说明(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}*addProcess
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addProcess: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processadd', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 关闭流程触发历史推送
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.storeId] 推送接收到的id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  closeStorePush: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/closeStorePush';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processcloseStorePush', args, $.extend(base, options));
  },
  /**
   * 复制工作流
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {CopyProcessRequest} {name:流程名称增加的部分(string),processId:流程ID(string),}*copyProcessRequest
   * @param {string} [args.name] *复制出来的流程名称后缀
   * @param {string} [args.processId] *流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  copyProcess: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/copyProcess';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processcopyProcess', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteProcess: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/deleteProcess';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processdeleteProcess', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 工作流历史版本
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.pageIndex] 页码
   * @param {string} [args.pageSize] 条数
   * @param {string} [args.processId] 流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistory: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getHistory';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetHistory', args, $.extend(base, options));
  },
  /**
   * 根据工作表控件获取流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.appId] 工作表id
   * @param {string} [args.companyId] 网络id
   * @param {string} [args.controlId] 控件id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessByControlId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getProcessByControlId';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetProcessByControlId', args, $.extend(base, options));
  },
  /**
   * 根据流程id查询流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.id] *流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessById: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getProcessById';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetProcessById', args, $.extend(base, options));
  },
  /**
   * 根据按钮获取流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.appId] 表id
   * @param {string} [args.triggerId] 按钮id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessByTriggerId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getProcessByTriggerId';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetProcessByTriggerId', args, $.extend(base, options));
  },
  /**
   * 流程全局配置
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] 流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessConfig: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getProcessConfig';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetProcessConfig', args, $.extend(base, options));
  },
  /**
   * 获取版本发布的信息
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessPublish: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getProcessPublish';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetProcessPublish', args, $.extend(base, options));
  },
  /**
   * 流程触发历史
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.storeId] 推送接收到的id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getStore: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getStore';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetStore', args, $.extend(base, options));
  },
  /**
   * 工作流配置 选择部分触发工作流的列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] 流程ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTriggerProcessList: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/getTriggerProcessList';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgetTriggerProcessList', args, $.extend(base, options));
  },
  /**
   * 返回上一个版本
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  goBack: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/goBack';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processgoBack', args, $.extend(base, options));
  },
  /**
   * 发布工作流
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {boolean} [args.isPublish] isPublish
   * @param {string} [args.processId] *流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  publish: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/publish';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'processpublish', args, $.extend(base, options));
  },
  /**
   * 保存流程全局配置
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {保存流程配置} {allowRevoke:允许触发者撤回(boolean),allowUrge:允许触发者催办(boolean),errorInterval:错误通知间隔时间(integer),errorNotifiers:错误消息通知人(array),executeType:运行方式: 1 并行，2：逐条执行(integer),isSaveVariables:是否只保存流程参数(boolean),processId:流程ID(string),processIds:编辑版的流程id(array),processVariables:流程参数(array),revokeNodeIds:通过指定的节点不允许撤回(array),sendTaskPass:触发者不发送通知(boolean),startEventPass:工作流触发者自动通过(boolean),triggerType:触发其他工作流 0 ：允许触发，1：只能触发指定工作流 2：不允许触发(integer),userTaskNullPass:审批人为空自动通过(boolean),userTaskPass:审批人自动通过(boolean),}*saveProcessConfigRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  saveProcessConfig: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/saveProcessConfig';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processsaveProcessConfig', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 触发流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestStartProcess} {appId:表id(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}*startProcess
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  startProcess: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/startProcess';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processstartProcess', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 根据流程id手动触发流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestStartProcessByProcessId} {processId:流程id(string),sourceId:行记录id(string),}*startProcess
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  startProcessById: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/startProcessById';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processstartProcessById', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改流程基本信息
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {更新流程信息} {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),processId:流程id(string),}*updateProcess
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateProcess: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/update';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processupdate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   *  转交流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] *公司ID
   * @param {string} [args.id] *流程id
   * @param {string} [args.owner] *转交人ID
   * @param {更新拥有者信息} {companyId:公司ID(string),owner:被转交人id(string),processId:流程id(string),}*updateOwner
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateOwner: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/updateOwner';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processupdateOwner', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 启用流程或禁用流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {更新流程状态} {companyId:公司ID(string),enabled:是否启用,是：true,禁用：false(boolean),processId:流程id(string),}*updateUseStatus
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateUseStatus: function(args, options) {
    base.ajaxOptions.url = base.server() + '/process/updateUseStatus';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'processupdateUseStatus', JSON.stringify(args), $.extend(base, options));
  },
};
module.exports = process;