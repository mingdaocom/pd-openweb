export default {
  /**
   * 前台获取场景/行业
   * @param {Object} args 请求参数
   * @param {integer} args.productType 1= 应用，2 = 插件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTags: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'GetTags', args, options);
  },
  /**
   * 获取应用
   * @param {Object} args 请求参数
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 每页数量
   * @param {integer} args.order 排序类型，0 = 默认，1= 安装最多，2= 评分最高，3= 最新
   * @param {string} args.keywords 关键字
   * @param {array} args.tagIds 场景ids
   * @param {array} args.industryIds 行业ids
   * @param {array} args.classificationIds 分类ids
   * @param {string} args.developId 开发者id
   * @param {integer} args.developType 开发者类型 1= 个人，2 = 企业
   * @param {integer} args.licenseType 免费 = 0，付费 = 1 （不传不筛选）
   * @param {integer} args.productType 1= 应用，2 = 插件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  gets: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'Gets', args, options);
  },
  /**
   * 商品应用详情
   * @param {Object} args 请求参数
   * @param {string} args.id 商品id（应用id）
   * @param {string} args.tradeId 授权记录id
   * @param {string} args.buyerId 买家id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProductDetail: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'GetProductDetail', args, options);
  },
  /**
   * 开发者信息
   * @param {Object} args 请求参数
   * @param {string} args.developId 开发者id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDeveloperInfo: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'GetDeveloperInfo', args, options);
  },
  /**
   * 获取私有组织列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPrivateProjects: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'GetPrivateProjects', args, options);
  },
  /**
   * 添加私有组织信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.projectName 组织名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addPrivateProject: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'AddPrivateProject', args, options);
  },
  /**
   * 移除私有组织信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.projectName 组织名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removePrivateProject: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'RemovePrivateProject', args, options);
  },
  /**
   * 获取精简商品，指定套餐信息
   * @param {Object} args 请求参数
   * @param {string} args.id 商品id（应用id）
   * @param {string} args.licenseId 套餐id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSimpleDetail: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'GetSimpleDetail', args, options);
  },
  /**
   * 获取商品评价列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCommentList: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('HomeMarketplace', 'GetCommentList', args, options);
  },
  /**
   * 获取商品评价详情
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCommentCount: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('HomeMarketplace', 'GetCommentCount', args, options);
  },
  /**
   * 创建评价
   * @param {Object} args 请求参数
   * @param {string} args.productId 产品id
   * @param {string} args.content 评论内容
   * @param {integer} args.score
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createComment: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'CreateComment', args, options);
  },
  /**
   * 删除评价
   * @param {Object} args 请求参数
   * @param {string} args.commentId 产品id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteComment: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'DeleteComment', args, options);
  },
  /**
   * 咨询 (返回个人群组信息)
   * @param {Object} args 请求参数
   * @param {string} args.id 商品id（应用id）
   * @param {string} args.tradeId 授权记录id
   * @param {string} args.buyerId 买家id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  consult: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'Consult', args, options);
  },
  /**
   * 开发者发起咨询 (返回个人群组信息)
   * @param {Object} args 请求参数
   * @param {string} args.tradeId 授权记录id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  consultByDeveloper: function (args, options = {}) {
    return mdyAPI('HomeMarketplace', 'ConsultByDeveloper', args, options);
  },
};
