export default {
  /**
  * 添加收藏
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.viewId 视图Id
  * @param {string} args.rowId 行记录Id
  * @param {string} args.pageId 自定义页面Id
  * @param {string} args.reportId 图表Id
  * @param {string} args.projectId 组织Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFavorite: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'AddFavorite', args, options);
   },
  /**
  * 获取所有的收藏
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {string} args.projectId 组织Id
  * @param {} args.isRefresh
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllFavorites: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'GetAllFavorites', args, options);
   },
  /**
  * 删除收藏
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.viewId 视图Id
  * @param {string} args.rowId 行记录Id
  * @param {string} args.projectId 组织Id
  * @param {string} args.pageId 自定义页面Id
  * @param {string} args.reportId 图表Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFavorite: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'RemoveFavorite', args, options);
   },
  /**
  * 批量删除收藏排除创建人
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.reportId 图表Id
  * @param {string} args.accountId 创建人
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeReportFavoritesExcludeAccountId: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'RemoveReportFavoritesExcludeAccountId', args, options);
   },
  /**
  * 判断是否已经添加了收藏
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {string} args.rowId 行记录Id
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.viewId 视图Id
  * @param {string} args.pageId 自定义页面Id
  * @param {string} args.reportId 图表Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkFavoriteByRowId: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'CheckFavoriteByRowId', args, options);
   },
  /**
  * 更新图表排序
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {array} args.reportIds 排序id集合
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateReportSort: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'UpdateReportSort', args, options);
   },
  /**
  * 更新行记录置顶排序
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {array} args.favoriteIds 排序id集合
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFavoriteTopSort: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'UpdateFavoriteTopSort', args, options);
   },
  /**
  * 置顶行记录/取消置顶
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.favoriteId 记录Id
  * @param {boolean} args.isTop 置顶/取消置顶
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateFavoriteTop: function (args, options = {}) {
     
     return mdyAPI('Favorite', 'UpdateFavoriteTop', args, options);
   },
};
