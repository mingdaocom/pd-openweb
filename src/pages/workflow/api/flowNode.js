import base, { controllerName } from './base';
/**
 * flowNode
*/
var flowNode = {
  /**
   * 增加节点
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {增加节点} {actionId:默认执行的动作ID 1:新增  2： 修改(string),appType:应用类型(integer),approvalId:已有审批流id(string),gatewayType:分支类型(integer),isMove:移到分支一侧： true，不移动： false(boolean),moveType:移到分支一侧 0:不移动 1：左侧 2：右侧 3撤回分支(integer),name:节点名称(string),nodeIds:复制的节点ids(array),processId:流程ID(string),prveId:前一个节点ID(string),resultFlow:是审批结果分支类型(默认false)(boolean),typeId:流程节点类型ID(integer),}*addFlowNode
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  add: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodeadd', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * code测试
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {CodeTestRequest} {actionId:动作类型id(string),code:代码(string),inputDatas:输入参数(array),nodeId:节点ID(string),processId:流程Id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  codeTest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/codeTest';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodecodeTest', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 创建短信模版
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {SaveSMSTemplateRequest} {companyId:网络ID(string),companySignature:企业签名(string),messageContent:短信内容(string),nodeId:节点ID(string),processId:网络ID(string),templateId:节点ID(string),}*saveSMSTemplateRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  createSMSTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/createSMSTemplate';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodecreateSMSTemplate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除节点
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {删除节点} {nodeId:流程节点ID(string),processId:流程ID(string),}*deleteFlowNode
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  delete: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/delete';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodedelete', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 批量删除短信模板
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {删除短信模板} {messageTemplateIds:模板id(array),}*deleteSMSTemplateRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteSMSTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/deleteSMSTemplate';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodedeleteSMSTemplate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取流程详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.instanceId] instanceId
   * @param {string} [args.processId] processId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  get: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/get';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodeget', args, $.extend(base, options));
  },
  /**
   * 获取所有的短信模版
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.companyId] *流程ID
   * @param {boolean} [args.isAsc] isAsc
   * @param {string} [args.pageIndex] *流程ID
   * @param {string} [args.pageSize] *流程ID
   * @param {string} [args.sortId] sortId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAllSMSTemplateList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getAllSMSTemplateList';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetAllSMSTemplateList', args, $.extend(base, options));
  },
  /**
   * 获取控件列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.appId] *应用对应id
   * @param {string} [args.appType] *应用类型
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] *选中节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAppTemplateControls: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getAppTemplateControls';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetAppTemplateControls', args, $.extend(base, options));
  },
  /**
   * 获取退回的节点名称
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.callBackType] *退回的后执行的类型 0：重新执行  1：执行到退回的节点
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] *选中节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getCallBackNodeNames: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getCallBackNodeNames';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetCallBackNodeNames', args, $.extend(base, options));
  },
  /**
   * 筛选节点赋值的下拉列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.conditionId] 判断条件的id,关联字段 需要传
   * @param {string} [args.dataSource] 关联他表的appID
   * @param {integer} [args.enumDefault] enumDefault
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] 新增节点 数据源
   * @param {string} [args.sourceAppId] 来源表ID
   * @param {string} [args.type] *控件类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getFlowAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getFlowAppDtos';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetFlowAppDtos', args, $.extend(base, options));
  },
  /**
   * 动作节点选择字段的下拉列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.dataSource] 关联他表的appID
   * @param {integer} [args.enumDefault] enumDefault
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] 新增节点 数据源
   * @param {string} [args.sourceAppId] 来源表ID
   * @param {string} [args.type] *控件类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getFlowNodeAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getFlowNodeAppDtos';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetFlowNodeAppDtos', args, $.extend(base, options));
  },
  /**
   * 获取节点详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.actionId] actionId
   * @param {string} [args.appId] 子流程传子流程id
   * @param {string} [args.fields] fields
   * @param {string} [args.fileds] 组织人员
   * @param {string} [args.flowNodeType] *节点类型
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] 选择的节点对象
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getNodeDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getNodeDetail';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetNodeDetail', args, $.extend(base, options));
  },
  /**
   * 填写节点获取字段列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] *选中节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getNodeFormProperty: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getNodeFormProperty';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetNodeFormProperty', args, $.extend(base, options));
  },
  /**
   * 获取开始节点的配置
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.appId] *工作表Id
   * @param {string} [args.appType] appType
   * @param {string} [args.controlId] 选中的控件ID
   * @param {string} [args.processId] 流程ID
   * @param {string} [args.selectNodeId] 选中的节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getStartEventDeploy: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getStartEventDeploy';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetStartEventDeploy', args, $.extend(base, options));
  },
  /**
   * 子流程节点获取子流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] *选中节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getSubProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getSubProcessList';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetSubProcessList', args, $.extend(base, options));
  },
  /**
   * 人员选择控件
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.schedule] 限时处理选择人员 支持当前节点审批人和填写人
   * @param {string} [args.type] 控件类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getUserAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getUserAppDtos';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetUserAppDtos', args, $.extend(base, options));
  },
  /**
   * 节点说明
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {更新节点说明} {alias:节点别名(string),desc:说明(string),nodeId:节点ID(string),processId:流程ID(string),}*updateFlowNodeDescRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  nodeDesc: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/nodeDesc';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodenodeDesc', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 保存节点的配置信息
   * @param {Object} args 请求参数
   * @param {SaveStartNode} {appId:引用对象ID(string),appType:应用类型(integer),assignFieldId:指定字段(string),assignFieldIds:指定字段(array),config:配置(ref),controls:webhook触发开始的字段配置(array),endTime:结束时间(string),executeEndTime:执行结束时间(string),executeTime:执行时间(string),executeTimeType:执行时间的类型 0:按以上日期 1：之前 2：之后(integer),flowNodeType:节点ID(integer),frequency:重复频率 1:天 2:周 3:月 4:年(integer),interval:重复间隔 间隔单位frequency(integer),isUpdate:是否修改(boolean),name:节点名称(string),nodeId:节点ID(string),number:设置的时间(integer),operateCondition:触发条件(array),params:key-value的参数(array),processConfig:审批配置(ref),processId:流程ID(string),repeatType:循环类型 1:每天 2:工作日 3:每周 4:每月 5:每年 6:自定义(integer),returnJson:返回值自定义的json(string),returnMap:null(object),returns:自定义的返回值 key-value(array),selectNodeId:选中的节点ID(string),time:时间(string),triggerId:触发方式(string),unit:单位：1 : 分，2 ：小时 3:天(integer),weekDays:周几 0:周天 1:周1...（需按顺序[0, 1, 2, 3, 4, 5, 6]）(array),}*开始
   * @param {SaveSMSNode} {accounts:通知发送的人员(array),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),smsContent:短信内容(string),templateId:短信模版ID (string),}*短信
   * @param {SaveEmailNode} {accounts:通知发送的人员(array),actionId:默认执行的动作   1： 新增 2：更新,20:获取关联他表 201:发送邮件(string),appType:选择其他对象时，应用类型 0:默认第3方,1:工作表,2:任务,3:邮件(integer),ccAccounts:通知抄送人(array),fields:配置的字段信息(array),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),}*邮件
   * @param {SaveTimerNode} {actionId:默认执行的动作  300： 延时到指定日期   301：延时一段时间(string),executeTimeType:执行时间的类型 0:按以上日期 1：之前 2：之后(integer),fieldControlId:日期字段控件ID(string),fieldNodeId:输入日期字段节点ID(string),fieldValue:输入日期的值(string),flowNodeType:节点ID(integer),hour:小时(integer),hourFieldValue:动态小时的值(ref),minute:分钟(integer),minuteFieldValue:动态分钟的值(ref),name:节点名称(string),nodeId:节点ID(string),number:设置的时间(integer),numberFieldValue:动态天的值(ref),processId:流程ID(string),selectNodeId:选中的节点ID(string),time:时间(string),unit:单位：1 : 分，2 ：小时 3:天(integer),}*延时
   * @param {SaveMultipleNode} {actionId:获取方式  400: 从工作表获取多条记录 , 401: 从一条记录获得多条关联记录, 402 :从新增节点获取多条记录，403:从数组获取多条数据(string),appId:选择其他对象时，选中的对象ID(string),execute:是否立即执行(boolean),fields:配置的字段信息(array),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),numberFieldValue:最多获取条数(ref),operateCondition:筛选条件(array),processId:流程ID(string),relation:是否需要汇报关系(boolean),selectNodeId:选中的节点ID(string),sorts:查排序规则(array),}*批量
   * @param {SaveCodeNode} {actionId:动作id 102:Javascript，103:Python(string),code:代码块(string),flowNodeType:节点ID(integer),inputDatas:input输入 map(array),name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),}*代码块
   * @param {SaveLinkNode} {flowNodeType:节点ID(integer),formProperties:表单字段属性  3填写(array),linkName:提交按钮名称(string),linkType:链接类型 1:分享链接 2:填写链接(integer),name:节点名称(string),nodeId:节点ID(string),password:密码(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),time:失效时间配置(ref),}*获取记录链接
   * @param {SaveSubProcessNode} {executeType:执行方式: 1 并行，2：逐条执行(integer),fields:配置的字段信息(array),flowNodeType:节点ID(integer),name:节点名称(string),nextExecute:子流程执行完成后，执行下一个节点(boolean),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),subProcessId:执行子流程id(string),}*子流程
   * @param {SavePushNode} {appId:工作表id(string),content:提示内容  或者 链接url(string),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),openMode:打开方式：1:当前页面 2:新页面,3:弹层 4:模态窗口(integer),processId:流程ID(string),pushType:推送内容类型 1:弹出提示,2:创建记录,3:打开记录详情,4:打开视图,5:打开自定义页面,6:打开链接(integer),selectNodeId:选中的节点ID(string),viewId:视图id(string),}*推送
   * @param {SavePrintNode} {appId:打印模板id(string),fileName:文件名(string),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),}*获取记录打印文件
   * @param {SaveTemplateMessageNode} {accounts:通知发送的人员(array),appId:模板id(string),fields:配置的字段信息(array),flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),selectNodeId:选中的节点ID(string),templateNode:跳转url  和小程序地址(ref),}*微信模板消息
   * @param {SaveFilterNode} {flowNodeType:节点ID(integer),name:节点名称(string),nodeId:节点ID(string),operateCondition:触发条件(array),processId:流程ID(string),selectNodeId:选中的节点ID(string),}*分支
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  saveNode: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/saveNode';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodesaveNode', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 更新节点名称
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {更新流程名称} {name:节点名称(string),nodeId:节点ID(string),processId:流程ID(string),}*updateFlowNodeNameRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateFlowNodeName: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/updateFlowNodeName';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodeupdateFlowNodeName', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * webhook请求测试接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {WebHooksRequest} {body:body(string),contentType:contentType  1: key-value 2:json(integer),formControls:formControls(array),headers:请求头(array),method:请求方法 1:get  2:post(integer),nodeId:节点ID(string),params:params(array),processId:流程Id(string),settings:setting(ref),url:url(string),}*webHooksRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  webHookTestRequest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/webHookTestRequest';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'flowNodewebHookTestRequest', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取webhook字段对照表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.nodeId] *节点ID
   * @param {string} [args.processId] *流程ID
   * @param {string} [args.selectNodeId] *选中的节点ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getWebHookData: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getWebHookData';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'flowNodegetWebHookData', args, $.extend(base, options));
  },
};
export default flowNode;