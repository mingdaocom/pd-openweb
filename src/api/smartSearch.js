module.exports = {
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
};
