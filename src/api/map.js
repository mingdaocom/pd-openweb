module.exports = {
  /**
  * 应用库首页
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getHomePage: function (args, options = {}) {
     
     return $.api('Map', 'GetHomePage', args, options);
   },
  /**
  * 搜索（名称）
  * @param {Object} args 请求参数
  * @param {string} args.keyword 关键字
  * @param {string} args.categoryId 分类id
  * @param {string} args.industryId 行业id
  * @param {} args.mapUser 发布者  1= 个人， 2= 组织，3= 明道官方
  * @param {} args.scoreEnum 排序 1= 安装最多，2= 评分最高，3= 最新
  * @param {integer} args.pageIndex
  * @param {integer} args.size
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchName: function (args, options = {}) {
     
     return $.api('Map', 'SearchName', args, options);
   },
  /**
  * 搜索（用户）
  * @param {Object} args 请求参数
  * @param {string} args.keyword 关键字
  * @param {string} args.region 地区码
  * @param {} args.mapUser 发布者  1= 个人， 2= 组织，3= 明道官方
  * @param {integer} args.pageIndex
  * @param {integer} args.size
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchUser: function (args, options = {}) {
     
     return $.api('Map', 'SearchUser', args, options);
   },
  /**
  * 获取用户所有模板
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserApps: function (args, options = {}) {
     
     return $.api('Map', 'GetUserApps', args, options);
   },
  /**
  * 获取分类信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCategory: function (args, options = {}) {
     
     return $.api('Map', 'GetCategory', args, options);
   },
  /**
  * 获取行业信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIndustry: function (args, options = {}) {
     
     return $.api('Map', 'GetIndustry', args, options);
   },
  /**
  * 获取分类下应用信息
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCategoryDetail: function (args, options = {}) {
     
     return $.api('Map', 'GetCategoryDetail', args, options);
   },
  /**
  * 获取应用库FileUrl Token
  * @param {Object} args 请求参数
  * @param {string} args.libraryId
  * @param {string} args.projectId 安装目标网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLibraryToken: function (args, options = {}) {
     
     return $.api('Map', 'GetLibraryToken', args, options);
   },
  /**
  * 获取专题详情
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSpecialApps: function (args, options = {}) {
     
     return $.api('Map', 'GetSpecialApps', args, options);
   },
  /**
  * 获取应用详情
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDetial: function (args, options = {}) {
     
     return $.api('Map', 'GetDetial', args, options);
   },
  /**
  * 获取已上架应用（分页）
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex
  * @param {integer} args.size
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   gets: function (args, options = {}) {
     
     return $.api('Map', 'Gets', args, options);
   },
  /**
  * 获取应用库小红点
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNew: function (args, options = {}) {
     
     return $.api('Map', 'GetNew', args, options);
   },
};
