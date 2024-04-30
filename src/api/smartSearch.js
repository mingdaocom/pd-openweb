export default {
  /**
  * 智能搜索（根据单个 SearchType）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.searchType
  * @param {} args.searchRange
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.postType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   search: function (args, options = {}) {
     
     return mdyAPI('SmartSearch', 'Search', args, options);
   },
  /**
  * 智能搜索（根据多个 SearchType）
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {array} args.searchTypes 类型
  * @param {} args.searchRange
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.postType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchByTypes: function (args, options = {}) {
     
     return mdyAPI('SmartSearch', 'SearchByTypes', args, options);
   },
  /**
  * 搜索应用范围数据
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.searchType
  * @param {} args.searchRange
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.appId 应用id（搜应用范围数据，或切换应用的时候传过来）
  * @param {string} args.projectId 组织id （必传）
  * @param {} args.sort
  * @param {boolean} args.onlyTitle 只搜标题(默认true)
  * @param {boolean} args.bombLayer 是否是弹层页搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   searchApp: function (args, options = {}) {
     
     return mdyAPI('SmartSearch', 'SearchApp', args, options);
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
     
     return mdyAPI('SmartSearch', 'GetFilterCount', args, options);
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
     
     return mdyAPI('SmartSearch', 'GetFilters', args, options);
   },
  /**
  * 设置过滤项目
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.itemType
  * @param {string} args.itemId 过滤的应用项id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setFilter: function (args, options = {}) {
     
     return mdyAPI('SmartSearch', 'SetFilter', args, options);
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
     
     return mdyAPI('SmartSearch', 'RemoveFilter', args, options);
   },
};
