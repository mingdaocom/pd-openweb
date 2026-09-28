export default {
  /**
   * 获取单个应用沙盒版本。
   * @param {Object} args 请求参数
   * @param {string} args.versionId 版本记录唯一标识。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Get', args, options);
  },
  /**
  * 按单个应用分页获取沙盒版本（应用下入口，操作人须为该应用管理员）。
多应用查询走组织后台 GetByProjectId（支持 appIds 筛选）。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识。
  * @param {array} args.statuses 状态筛选集合；空集合表示查询全部状态。
  * @param {array} args.createAccountIds 提交人（发布人）账号唯一标识集合；空集合表示不限制提交人。
  * @param {} args.order
  * @param {integer} args.pageIndex 页码，从 1 开始。
  * @param {integer} args.pageSize 每页记录数，最大为 200。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getByAppId: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetByAppId', args, options);
  },
  /**
   * 按组织 Id 分页获取应用沙盒版本。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织唯一标识。
   * @param {array} args.statuses 状态筛选集合；空集合表示查询全部状态。
   * @param {array} args.createAccountIds 提交人（发布人）账号唯一标识集合；空集合表示不限制提交人。
   * @param {array} args.appIds 应用唯一标识筛选集合（组织后台按应用过滤版本列表）；空集合表示不限制应用。
   * @param {} args.order
   * @param {integer} args.pageIndex 页码，从 1 开始。
   * @param {integer} args.pageSize 每页记录数，最大为 200。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getByProjectId: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetByProjectId', args, options);
  },
  /**
  * 单个应用发布沙盒新版本（应用下入口，操作人须为该应用管理员）。
组织后台批量操作走 BatchPublish（发布与审核权限）。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识。
  * @param {string} args.versionNo 业务版本号。
  * @param {string} args.description 发布说明。
  * @param {string} args.fileUrl 沙盒应用导出的 MDY 文件地址；为空时发布成功后由服务端自动发起沙盒导出。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  publish: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Publish', args, options);
  },
  /**
  * 查询可批量发布的应用列表（应用沙盒环境批量发布入口）。
只返回当前账号在该组织下担任应用管理员的应用（发布权限即应用管理员，列表本身完成鉴权），
每项附带是否已有待处理（待审核 / 待升级）版本：同一应用只允许一个待处理版本，
isPending 为 true 的应用前端应禁选，服务端发布时同样会拦截。
每项同时附带当前最新版本号（latestVersionNo），供前端提示用户按其递增填写新版本号，
无需再单独调用 GetLatestVersions。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识。
  * @param {string} args.keyword 应用名称关键字；为空不筛选。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getPublishApps: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetPublishApps', args, options);
  },
  /**
  * 批量发布应用沙盒新版本（沙盒环境首页入口；沙盒环境没有组织后台，不校验组织权限项）。
鉴权按应用逐个校验：当前账号非应用管理员的应用直接过滤（静默跳过，不产生逐项失败）。
应用下单个发布走 Publish（应用管理员）。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识。
  * @param {array} args.items 各应用的版本发布项集合，单批最多 20 个。
是否需要管理员审核由服务端按各应用的审核规则配置判定，不再由请求传入。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchPublish: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchPublish', args, options);
  },
  /**
  * 批量查询应用当前的最新版本号（发布弹层提示用户按其递增填写新版本号）。
取的是应用最近提交的版本——版本号不可复用，撤回 / 驳回的版本号同样不能再用，
因此这里不是&#34;最近升级成功的版本&#34;。从未发布过版本的应用不出现在结果中。
鉴权按应用逐个校验，与发布入口同一口径：当前账号非应用管理员的应用直接过滤。
批量发布列表（GetPublishApps）已随列表返回最新版本号，无需再调本接口。
  * @param {Object} args 请求参数
  * @param {array} args.appIds 应用唯一标识集合，单批最多 20 个（逐个校验应用管理员，超出部分截断）。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getLatestVersions: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetLatestVersions', args, options);
  },
  /**
   * 获取应用的沙盒发布审核规则；未配置应用默认管理员审核。
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用唯一标识。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getReviewConfig: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetReviewConfig', args, options);
  },
  /**
   * 设置应用的沙盒发布审核方式（管理员审核 / 免审），每个应用独立配置。
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用唯一标识。
   * @param {integer} args.reviewMode 审核方式：0 = 管理员审核（默认），1 = 免审（发布后可直接操作升级）。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setReviewConfig: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'SetReviewConfig', args, options);
  },
  /**
  * 获取对比信息：当前应用结构与指定文件对比，供发布或升级前预览差异。
指定版本 = 生产选版本升级前对比该版本文件；不指定 = 沙盒发布前对比基线。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识。
  * @param {string} args.versionId 指定版本唯一标识；为空时与发布对比基线对比。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getPublishContrast: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetPublishContrast', args, options);
  },
  /**
  * 获取单个工作表的编辑详情对比（两侧配置 JSON 快照及各自更新时间）。
与 GetPublishContrast 配套使用：先调 GetPublishContrast 拿到整体差异列表，
用户点开其中某张工作表时，用该工作表项的 sourceId 与对比批次 id 调用本接口取两侧数据。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识（应用管理员权限校验）。
  * @param {string} args.worksheetId 工作表唯一标识，取 GetPublishContrast 返回的工作表项 sourceId（对比包内的工作表 id）。
  * @param {string} args.contrastId 对比批次唯一标识，取 GetPublishContrast 返回的 id。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getWorksheetContrastDetail: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetWorksheetContrastDetail', args, options);
  },
  /**
  * 获取单个流程的对比明细（对比包内的流程与当前应用的流程）。
与 GetPublishContrast 配套使用：先调 GetPublishContrast 拿到整体差异列表，
用户点开其中某条工作流时，用该流程项的 sourceId 与对比批次 id 调用本接口取两侧流程数据。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识（应用管理员权限校验）。
  * @param {string} args.processId 流程唯一标识，取 GetPublishContrast 返回的工作流项 sourceId（对比包内的流程 id）。
  * @param {string} args.contrastId 对比批次唯一标识，取 GetPublishContrast 返回的 id。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getProcessCompare: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetProcessCompare', args, options);
  },
  /**
  * 获取单个自定义页面的对比明细（对比包内的页面与当前应用的页面）。
与 GetPublishContrast 配套使用：先调 GetPublishContrast 拿到整体差异列表，
用户点开其中某个自定义页面时，用该页面项的 id 与对比批次 id 调用本接口取两侧数据。
两侧为同结构 json（页面 + 组件布局 + 引用的统计图），服务端不做差异判定，由前端 diff。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识（应用管理员权限校验）。
  * @param {string} args.pageId 自定义页面唯一标识，取 GetPublishContrast 返回的页面项 id。
沙盒两侧页面 Id 一致，源侧与目标侧用同一个值。
  * @param {string} args.contrastId 对比批次唯一标识，取 GetPublishContrast 返回的 id。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getPageCompare: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetPageCompare', args, options);
  },
  /**
  * 分页查询组织下已开启沙盒的应用（组织后台「应用沙盒」列表）。
只返回沙盒状态为「已开启」和「初始化中」的应用，附带各应用的沙盒发布审核规则。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识。
  * @param {string} args.keyword 应用名称关键字；为空不筛选。
  * @param {array} args.createAccountIds 按拥有者（应用创建人）筛选的账号集合；空集合不筛选。
  * @param {array} args.appIds 按应用筛选的应用唯一标识集合；空集合不筛选。
  * @param {} args.order
  * @param {integer} args.pageIndex 页码，从 1 开始。
  * @param {integer} args.pageSize 每页数量，最大 200。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getSandboxApps: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetSandboxApps', args, options);
  },
  /**
  * 批量开启应用沙盒（服务端逐个应用执行：生产导出，导出完成后自动触发沙盒迁移导入）。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识。
  * @param {array} args.appConfigs 本批要开启沙盒的应用及各自的数据同步配置，单批最多 20 个。
直接复用导出应用的配置对象：ExampleType 0 = 仅同步应用结构，1 = 同步全部数据，
2 = 自定义（按 SheetConfig 指定工作表行数）。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchEnable: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchEnable', args, options);
  },
  /**
   * 应用下开启应用沙盒。
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {integer} args.exampleType 导出示例数据类型  0=不导出，1=导出所有，2=自定义
   * @param {array} args.sheetConfig 自定义导出工作表实例数据配置
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  enable: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Enable', args, options);
  },
  /**
  * 批量关闭应用沙盒（待审核 / 待升级版本置为已失效，生产应用沙盒状态重置为未开启）。
沙盒环境应用数据保留，再次开启走全量覆盖升级。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识。
  * @param {array} args.appIds 应用唯一标识集合，单批最多 20 个。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchDisable: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchDisable', args, options);
  },
  /**
  * 应用下关闭应用沙盒（待审核 / 待升级版本置为已失效，生产应用沙盒状态重置为未开启）。
沙盒环境应用数据保留，再次开启走全量覆盖升级。
组织后台批量关闭走 BatchDisable（沙盒权限）。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识（应用管理员权限校验）。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  disable: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Disable', args, options);
  },
  /**
   * 查询沙盒开启任务记录，供前端轮询导出导入进度。
   * @param {Object} args 请求参数
   * @param {string} args.id 沙盒开启记录唯一标识。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getEnableRecord: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetEnableRecord', args, options);
  },
  /**
  * 生产环境按沙盒版本执行覆盖升级；入队后立即返回，
前端通过 Get 轮询版本状态（已升级即成功）。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.versionId 版本记录唯一标识。
  * @param {string} args.remark 审核、驳回、撤回或升级说明。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  upgradeVersion: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'UpgradeVersion', args, options);
  },
  /**
  * 获取应用沙盒概要：生产应用当前运行的沙盒版本、升级完成时间与操作人（版本管理页头部）。
首次开启、关闭后再次开启时无当前版本，返回数据各字段为空，页面展示&#34;—&#34;。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用唯一标识。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getAppSummary: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'GetAppSummary', args, options);
  },
  /**
  * 检查沙盒功能是否可用（应用服务是否已配置沙盒环境地址）。
沙盒必须独立部署，未配置时开启沙盒必然失败，页面在开启入口据此直接提示用户。
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  checkDeploy: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'CheckDeploy', args, options);
  },
  /**
   * 检查组织是否已经产生应用沙盒功能数据（以发布对比基线为判断依据）。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织唯一标识。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkProjectDataExists: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'CheckProjectDataExists', args, options);
  },
  /**
  * 批量查询应用是否开启过应用沙盒
（以发布对比基线为判断依据：开启成功必写基线，关闭沙盒不清除基线）。
  * @param {Object} args 请求参数
  * @param {array} args.appIds 应用唯一标识集合，单批最多 200 个，超出部分截断。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  checkAppDataExists: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'CheckAppDataExists', args, options);
  },
  /**
  * 审核通过单个待审核版本（应用下入口，操作人须为该应用管理员）。
组织后台批量操作走 BatchApprove（发布与审核权限）。
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.versionId 版本记录唯一标识。
  * @param {string} args.remark 审核、驳回、撤回或升级说明。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  approve: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Approve', args, options);
  },
  /**
  * 批量审核通过待审核版本（组织后台入口，须具备发布与审核权限）。
应用下单个操作走 Approve（应用管理员）。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识（发布与审核权限校验所在组织，版本须全部归属该组织）。
  * @param {array} args.versionIds 待审核版本记录唯一标识集合，单批最多 100 个（按组织后台版本列表分页规模设定）。
业务层按版本逐条并行读取做归属核验，上限同时约束该并行读取的扇出规模。
  * @param {string} args.remark 统一审核说明。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchApprove: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchApprove', args, options);
  },
  /**
  * 批量驳回待审核版本（组织后台入口，须具备发布与审核权限）。
非待审核状态的版本自动跳过；应用下单个操作走 Reject（应用管理员）。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识（发布与审核权限校验所在组织，版本须全部归属该组织）。
  * @param {array} args.versionIds 待审核版本记录唯一标识集合，单批最多 100 个（与批量审核一致，按组织后台版本列表分页规模设定）。
  * @param {string} args.remark 统一写入被驳回版本的驳回原因。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchReject: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchReject', args, options);
  },
  /**
  * 批量执行覆盖升级（组织后台入口，须具备发布与审核权限；
服务端逐个版本执行单个升级逻辑并入队，单个失败不影响其他版本）。
接口立即返回入队结果，升级结果按各自版本轮询 Get（状态变为已升级即成功）；
应用下单个操作走 UpgradeVersion（应用管理员）。
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织唯一标识（发布与审核权限校验所在组织，版本须全部归属该组织）。
  * @param {array} args.versionIds 待升级版本记录唯一标识集合，单批最多 20 个（每个版本各自入队一条覆盖升级管线）。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  batchUpgradeVersion: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'BatchUpgradeVersion', args, options);
  },
  /**
   * 驳回单个待审核版本。
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.versionId 版本记录唯一标识。
   * @param {string} args.remark 审核、驳回、撤回或升级说明。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  reject: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Reject', args, options);
  },
  /**
   * 撤回待审核或待升级版本。
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.versionId 版本记录唯一标识。
   * @param {string} args.remark 审核、驳回、撤回或升级说明。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  withdraw: function (args, options = {}) {
    return mdyAPI('AppSandbox', 'Withdraw', args, options);
  },
};
