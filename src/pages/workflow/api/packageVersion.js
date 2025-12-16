import base, { controllerName } from './base';

/**
 * packageVersion
 */
const packageVersion = {
  /**
   * 创建API管理
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {添加API管理} {companyId:公司ID(string),defaultFlowNode:默认创建的节点(ref),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  add: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageadd', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 创建API
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {增加流程} {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addApi: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/addApi';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageaddApi', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 授权
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {授权应用} {apkIds:应用ids(array),companyId:网络id(string),id:id(string),type:操作类型 1添加 2移除(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  authorize: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/authorize';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageauthorize', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 申请授权应用
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {授权应用} {apkIds:应用ids(array),companyId:网络id(string),id:id(string),type:操作类型 1添加 2移除(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  authorizeApkIds: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/authorizeApkIds';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageauthorizeApkIds', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 复制
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {accountId:个人身份(string),apiCount:API数量(integer),apis:选择安装的apis(array),company:API服务厂商(string),companyId:企业身份(string),companyName:企业身份名称(string),createDate:上架时间(string),createdBy:个人身份头像名字(ref),docUrl:API文档地址(string),explain:说明(string),id:上架或者安装的id(string),installCount:安装数量(integer),name:连接名称(string),relationCount:引用数量(integer),status:状态 0已删除 1正常 2审核中 3已发布(integer),type:类型 1自定义 2已安装 3公开的(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  copy: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/copy';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagecopy', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API管理数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  count: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/count';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagecount', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除API管理
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  delete: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/delete';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagedelete', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除API
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteApi: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/deleteApi';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagedeleteApi', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 执行api
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {添加连接参数的值} {id:id(string),source:参数值(object),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  executeApi: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/executeApi';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageexecuteApi', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getApiDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getApiDetail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetApiDetail', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getApiList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getApiList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetApiList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API被引用列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getApiRelationList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getApiRelationList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetApiRelationList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取授权申请列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getAuthorizationList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getAuthorizationList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetAuthorizationList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取API管理详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getDetail';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetDetail', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取历史详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.instanceId] *流程实例ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryDetail: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getHistoryDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1packagegetHistoryDetail', args, $.extend(base, options));
  },
  /**
   * 获取历史运行列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {String} [args.createBy] 触发者
   * @param {Date} [args.endDate] 结束时间
   * @param {int} [args.pageIndex] 页数
   * @param {int} [args.pageSize] 每页数量
   * @param {String} [args.processId] *流程ID
   * @param {Date} [args.startDate] 开始时间
   * @param {int} [args.status] 状态
   * @param {String} [args.title] 名称
   * @param {int} [args.type] 类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getHistoryList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getHistoryList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1packagegetHistoryList', args, $.extend(base, options));
  },
  /**
   * 获取API管理列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 安装
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {accountId:个人身份(string),apiCount:API数量(integer),apis:选择安装的apis(array),company:API服务厂商(string),companyId:企业身份(string),companyName:企业身份名称(string),createDate:上架时间(string),createdBy:个人身份头像名字(ref),docUrl:API文档地址(string),explain:说明(string),id:上架或者安装的id(string),installCount:安装数量(integer),name:连接名称(string),relationCount:引用数量(integer),status:状态 0已删除 1正常 2审核中 3已发布(integer),type:类型 1自定义 2已安装 3公开的(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  install: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/install';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageinstall', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * API排序
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {API排序} {apis:api排序好的顺序(array),id:id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  sortApis: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/sortApis';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagesortApis', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改管理
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  update: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 开启关闭授权
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateAuthorization: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateAuthorization';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateAuthorization', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 更新申请授权应用操作的状态
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {修改API管理} {causeMsg:原因(string),id:id(string),status:0已删除 1正常 2审核中 3已发布(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateAuthorizeStatus: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateAuthorizeStatus';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateAuthorizeStatus', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 公开的排序
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {API管理排序} {id:id(string),index:排序(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateIndex: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateIndex';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateIndex', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 公开的修改安装量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {API管理排序} {id:id(string),index:排序(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateInstallCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateInstallCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateInstallCount', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 公开的修改显示类型
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {修改API管理} {causeMsg:原因(string),id:id(string),status:0已删除 1正常 2审核中 3已发布(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateShowType: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateShowType';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateShowType', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 公开的修改状态
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {修改API管理} {causeMsg:原因(string),id:id(string),status:0已删除 1正常 2审核中 3已发布(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateStatus: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/updateStatus';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupdateStatus', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 申请上架
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {accountId:个人身份(string),apiCount:API数量(integer),apis:选择安装的apis(array),company:API服务厂商(string),companyId:企业身份(string),companyName:企业身份名称(string),createDate:上架时间(string),createdBy:个人身份头像名字(ref),docUrl:API文档地址(string),explain:说明(string),id:上架或者安装的id(string),installCount:安装数量(integer),name:连接名称(string),relationCount:引用数量(integer),status:状态 0已删除 1正常 2审核中 3已发布(integer),type:类型 1自定义 2已安装 3公开的(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  upper: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/upper';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageupper', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 验证没有安装的接口
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理详情} {authorization:是否开启授权申请(boolean),id:id(string),introduce:介绍(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  validate: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/validate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagevalidate', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取授权的API列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getInstallApiList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getInstallApiList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetInstallApiList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取授权的API管理列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取API管理} {apkId:操作的应用id 处理授权用(string),authorization:是否开启授权申请(boolean),companyId:网络id(string),enabled:是否启用  默认全部 不传(boolean),hasAuth:是否需要oauth2Code授权(boolean),isOwner:我的连接(boolean),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),relationId:API管理id(string),sorter:排序字段 正序{'lastModifiedDate':'ascend'} 倒序{'lastModifiedDate':'descend'}(object),status:0已删除 1正常 2审核中 3已发布(array),types:类型(1 自定义 2 安装 3 公开)(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getInstallList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/getInstallList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packagegetInstallList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 卸载
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {accountId:个人身份(string),apiCount:API数量(integer),apis:选择安装的apis(array),company:API服务厂商(string),companyId:企业身份(string),companyName:企业身份名称(string),createDate:上架时间(string),createdBy:个人身份头像名字(ref),docUrl:API文档地址(string),explain:说明(string),id:上架或者安装的id(string),installCount:安装数量(integer),name:连接名称(string),relationCount:引用数量(integer),status:状态 0已删除 1正常 2审核中 3已发布(integer),type:类型 1自定义 2已安装 3公开的(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  unInstall: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/package/unInstall';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1packageunInstall', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 安装
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {操作API管理} {accountId:个人身份(string),apiCount:API数量(integer),apis:选择安装的apis(array),company:API服务厂商(string),companyId:企业身份(string),companyName:企业身份名称(string),createDate:上架时间(string),createdBy:个人身份头像名字(ref),docUrl:API文档地址(string),explain:说明(string),id:上架或者安装的id(string),installCount:安装数量(integer),name:连接名称(string),relationCount:引用数量(integer),status:状态 0已删除 1正常 2审核中 3已发布(integer),type:类型 1自定义 2已安装 3公开的(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  install: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/package/install';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v2packageinstall', JSON.stringify(args), $.extend(base, options));
  },
};
export default packageVersion;
