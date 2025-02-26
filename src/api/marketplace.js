export default {
  /**
  * 运营平台权限校验
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkMarketOperator: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'CheckMarketOperator', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {integer} args.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {string} args.dateDemension &#34;1h&#34;:1小时 &#34;1d&#34;:1天 &#34;1w&#34;:1周 &#34;1M&#34;:1月 &#34;1q&#34;:1季度 &#34;1y&#34;:1年
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   dateHistogram: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'DateHistogram', args, options);
   },
  /**
  * 开发者首页
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDevHomePage: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetDevHomePage', args, options);
   },
  /**
  * 获取场景
  * @param {Object} args 请求参数
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTags', args, options);
   },
  /**
  * 添加标签维度
  * @param {Object} args 请求参数
  * @param {string} args.name 标签名称
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'AddTags', args, options);
   },
  /**
  * 编辑标签维度
  * @param {Object} args 请求参数
  * @param {string} args.name 标签名称
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {string} args.id 标签id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditTags', args, options);
   },
  /**
  * 删除标签维度
  * @param {Object} args 请求参数
  * @param {string} args.name 标签名称
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {string} args.id 标签id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'RemoveTags', args, options);
   },
  /**
  * 标签维度排序
  * @param {Object} args 请求参数
  * @param {array} args.sorts 排序
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editTagsSort: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditTagsSort', args, options);
   },
  /**
  * 标签维度下添加应用
  * @param {Object} args 请求参数
  * @param {string} args.id 标签id
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {array} args.appIds 应用ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTagApps: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'AddTagApps', args, options);
   },
  /**
  * 移除标签维度下应用
  * @param {Object} args 请求参数
  * @param {string} args.id 标签id
  * @param {integer} args.type 类型，0 = 场景，1 = 行业
  * @param {array} args.appIds 应用ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeTagApps: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'RemoveTagApps', args, options);
   },
  /**
  * 获取原始应用信息（待发布）
  * @param {Object} args 请求参数
  * @param {array} args.appIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetAppInfo', args, options);
   },
  /**
  * 发布应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.versionNo
  * @param {string} args.readme 更新说明
  * @param {string} args.name 商品名称
  * @param {string} args.intro 概述
  * @param {string} args.description 描述
  * @param {array} args.tagIds 场景ids
  * @param {array} args.industryIds 行业ids
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 颜色
  * @param {integer} args.licenseType 套餐类型 0 = 免费，1 = 付费
  * @param {array} args.pictures 图片
  * @param {array} args.videos 视频
  * @param {array} args.workflowIds 勾选的工作流信息
  * @param {array} args.noCopyBtnIds 不复制的按钮id
  * @param {array} args.licenses 授权套餐信息
  * @param {boolean} args.onShelves 审核通过后是否直接上架
  * @param {boolean} args.isData 是否携带实例数据
  * @param {integer} args.goodsPushType 商品发布类型, 0 = 产品，1 = 模板
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   productPush: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'ProductPush', args, options);
   },
  /**
  * 编辑应用
  * @param {Object} args 请求参数
  * @param {string} args.id 商品应用id
  * @param {integer} args.editType 更新套餐 = 1，更新版本 = 2
  * @param {boolean} args.onShelves 审核通过后是否直接上架
  * @param {} args.editLicense
  * @param {} args.editVersion
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editProductPush: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditProductPush', args, options);
   },
  /**
  * 编辑自动上架标识
  * @param {Object} args 请求参数
  * @param {string} args.id 商品应用id
  * @param {boolean} args.onShelves 审核通过后是否直接上架
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editOnShelves: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditOnShelves', args, options);
   },
  /**
  * 运营平台操作更新应用状态（上架，拒绝，下架）
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {integer} args.status 12 = 上架，13 = 未通过，14 = 已下架,15 = 审核通过（待上架）
  * @param {string} args.remark 拒绝，下架理由
  * @param {boolean} args.isOperate 是否是运营管理操作
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editStatus: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditStatus', args, options);
   },
  /**
  * 删除应用商品
  * @param {Object} args 请求参数
  * @param {string} args.id 商品id（应用id）
  * @param {string} args.tradeId 授权记录id
  * @param {string} args.buyerId 买家id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteProduct: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'DeleteProduct', args, options);
   },
  /**
  * 获取详情（编辑版本/套餐）
  * @param {Object} args 请求参数
  * @param {string} args.id 商品id（应用id）
  * @param {string} args.tradeId 授权记录id
  * @param {string} args.buyerId 买家id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   get: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'Get', args, options);
   },
  /**
  * 获取应用所属标签信息
  * @param {Object} args 请求参数
  * @param {string} args.id 商品id（应用id）
  * @param {string} args.tradeId 授权记录id
  * @param {string} args.buyerId 买家id
  * @param {integer} args.type 0 = 场景，1 = 行业
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProductTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetProductTags', args, options);
   },
  /**
  * 编辑应用所属标签信息
  * @param {Object} args 请求参数
  * @param {string} args.id 商品id（应用id）
  * @param {string} args.tradeId 授权记录id
  * @param {string} args.buyerId 买家id
  * @param {integer} args.type 0 = 场景，1 = 行业
  * @param {array} args.ids 对应标签类型的id数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editProductTags: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditProductTags', args, options);
   },
  /**
  * 获取列表总数
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getStatusTotal: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetStatusTotal', args, options);
   },
  /**
  * 获取应用
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {integer} args.order 排序类型，0 = 默认（时间降序） 1=安装量降序，2=安装量升序，3=时间降序，4=时间升序，5=评分降序，6=评分升序，7 = 查看量降序，8 = 查看量升序
  * @param {integer} args.status 状态  11 = 审核中，12 = 已上架，13 = 未通过，14 = 已下架,15 = 待上架
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   gets: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'Gets', args, options);
   },
  /**
  * 运营平台获取应用
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {integer} args.order 排序类型，0 = 默认（时间降序） 1=安装量降序，2=安装量升序，3=时间降序，4=时间升序，5=评分降序，6=评分升序，7 = 查看量降序，8 = 查看量升序
  * @param {integer} args.status 状态  11 = 审核中，12 = 已上架，13 = 未通过，14 = 已下架,15 = 待上架
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProductsByOperate: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetProductsByOperate', args, options);
   },
  /**
  * 获取历史版本
  * @param {Object} args 请求参数
  * @param {string} args.id 商品id（应用id）
  * @param {string} args.tradeId 授权记录id
  * @param {string} args.buyerId 买家id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getHistoricalVersion: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetHistoricalVersion', args, options);
   },
  /**
  * 组织下我拥有的应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {boolean} args.noCache 不走缓存
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOwnedApp: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetOwnedApp', args, options);
   },
  /**
  * 开发者信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDeveloperInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetDeveloperInfo', args, options);
   },
  /**
  * 保存开发者信息
  * @param {Object} args 请求参数
  * @param {integer} args.bucket 桶类型
  * @param {string} args.avatar 头像
  * @param {string} args.email 邮箱
  * @param {string} args.introduction 简介
  * @param {string} args.description 描述
  * @param {string} args.cover 封面
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveDeveloperInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'SaveDeveloperInfo', args, options);
   },
  /**
  * 提交提现信息
  * @param {Object} args 请求参数
  * @param {} args.withdrawInfo
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveWithdrawInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'SaveWithdrawInfo', args, options);
   },
  /**
  * 获取开发者审核信息列表
  * @param {Object} args 请求参数
  * @param {string} args.developerId 开发者ID
  * @param {string} args.name 名称
  * @param {integer} args.authType 认证类型 0-未认证 1-个人认证 2-企业认证
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListDeveloperInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetListDeveloperInfo', args, options);
   },
  /**
  * 获取协议列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListAgreement: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetListAgreement', args, options);
   },
  /**
  * 保存协议
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.content 内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveAgreement: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'SaveAgreement', args, options);
   },
  /**
  * 获取最新协议内容
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAgreement: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetAgreement', args, options);
   },
  /**
  * 签署协议
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   signAgreement: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'SignAgreement', args, options);
   },
  /**
  * 导出开发者审核信息列表
  * @param {Object} args 请求参数
  * @param {string} args.developerId 开发者ID
  * @param {string} args.name 名称
  * @param {integer} args.authType 认证类型 0-未认证 1-个人认证 2-企业认证
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportDeveloperInfo: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'ExportDeveloperInfo', args, options);
   },
  /**
  * 开发者授权应用列表
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索词
  * @param {integer} args.status 状态，0 = 全部，1 = 有效，2 = 无效
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTradesByDevelop: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTradesByDevelop', args, options);
   },
  /**
  * 买家授权应用列表
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索词
  * @param {integer} args.status 状态，0 = 全部，1 = 有效，2 = 无效
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTradesByBuyer: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTradesByBuyer', args, options);
   },
  /**
  * 授权应用详情（买家）
  * @param {Object} args 请求参数
  * @param {string} args.id 主键
  * @param {string} args.description 退款备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTradeDetailByBuyer: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTradeDetailByBuyer', args, options);
   },
  /**
  * 授权应用详情（卖家）
  * @param {Object} args 请求参数
  * @param {string} args.id 主键
  * @param {string} args.description 退款备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTradeDetailByDevelop: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTradeDetailByDevelop', args, options);
   },
  /**
  * 订单获取授权记录
  * @param {Object} args 请求参数
  * @param {string} args.orderId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTradeDetailByOrder: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetTradeDetailByOrder', args, options);
   },
  /**
  * 更新授权应用拥有者
  * @param {Object} args 请求参数
  * @param {string} args.id 主键
  * @param {string} args.description 退款备注
  * @param {string} args.newBuyer 新买家（新拥有者）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editTradeBuyer: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'EditTradeBuyer', args, options);
   },
  /**
  * 应用id获取套餐信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLicenseByApp: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetLicenseByApp', args, options);
   },
  /**
  * 购买记录id获取套餐信息
  * @param {Object} args 请求参数
  * @param {string} args.id 主键
  * @param {string} args.description 退款备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLicenseByTradeRecordId: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetLicenseByTradeRecordId', args, options);
   },
  /**
  * 重新安装
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   reinstall: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'Reinstall', args, options);
   },
  /**
  * 获取密钥
  * @param {Object} args 请求参数
  * @param {string} args.id 主键
  * @param {string} args.description 退款备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSecretKey: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'GetSecretKey', args, options);
   },
  /**
  * 更新应用授权
  * @param {Object} args 请求参数
  * @param {string} args.key 密钥
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setSecretKeyForApp: function (args, options = {}) {
     
     return mdyAPI('Marketplace', 'SetSecretKeyForApp', args, options);
   },
};
