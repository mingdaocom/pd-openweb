export default {
  /**
  * 智能搜索（根据单个 SearchType）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.searchType 类型
  * @param {} args.searchRange 数据范围
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.postType 动态类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   search: function (args, options = {}) {
     
     return $.api('SmartSearch', 'Search', args, options);
   },
  /**
  * 智能搜索（根据多个 SearchType）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {array} args.searchTypes 类型
  * @param {} args.searchRange 数据范围
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.postType 动态类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchByTypes: function (args, options = {}) {
     
     return $.api('SmartSearch', 'SearchByTypes', args, options);
   },
  /**
  * 搜索应用范围数据
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.searchType 类型 0 = 全部， 7 = 应用，8 = 记录
  * @param {} args.searchRange 数据范围 1 = 应用，2 = 组织
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.appId 应用id（搜应用范围数据，或切换应用的时候传过来）
  * @param {string} args.projectId 组织id （必传）
  * @param {} args.sort 排序字段 0=默认，1= 记录更新时间降序，2 = 记录更新时间升序，3= 记录创建时间降序，4 = 记录创建时间升序
  * @param {boolean} args.onlyTitle 只搜标题(默认true)
  * @param {boolean} args.bombLayer 是否是弹层页搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchApp: function (args, options = {}) {
     
     return $.api('SmartSearch', 'SearchApp', args, options);
   },
  /**
  * 获取过滤总数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterCount: function (args, options = {}) {
     
     return $.api('SmartSearch', 'GetFilterCount', args, options);
   },
  /**
  * 获取过滤列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilters: function (args, options = {}) {
     
     return $.api('SmartSearch', 'GetFilters', args, options);
   },
  /**
  * 设置过滤项目
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.itemType 过滤的应用项类型,0 = 工作表，1= 自定义页面,2 = 分组,3 = 应用
  * @param {string} args.itemId 过滤的应用项id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setFilter: function (args, options = {}) {
     
     return $.api('SmartSearch', 'SetFilter', args, options);
   },
  /**
  * 删除过滤项目
  * @param {Object} args 请求参数
  * @param {string} args.itemId 过滤的应用项id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFilter: function (args, options = {}) {
     
     return $.api('SmartSearch', 'RemoveFilter', args, options);
   },
};
