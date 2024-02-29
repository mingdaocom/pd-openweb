export default {
  /**
  * 添加收藏
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId WorksheetId
  * @param {string} args.viewId ViewId
  * @param {string} args.rowId RowId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addFavorite: function (args, options = {}) {
     
     return $.api('Favorite', 'AddFavorite', args, options);
   },
  /**
  * 获取所有的收藏
  * @param {Object} args 请求参数
  * @param {string} args.projectId ProjectId
  * @param {} args.isRefresh
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllFavorites: function (args, options = {}) {
     
     return $.api('Favorite', 'GetAllFavorites', args, options);
   },
  /**
  * 删除收藏
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId WorksheetId
  * @param {string} args.viewId ViewId
  * @param {string} args.rowId RowId
  * @param {string} args.projectId ProjectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeFavorite: function (args, options = {}) {
     
     return $.api('Favorite', 'RemoveFavorite', args, options);
   },
  /**
  * 判断是否已经添加了收藏
  * @param {Object} args 请求参数
  * @param {string} args.rowId RowId
  * @param {string} args.worksheetId WorksheetId
  * @param {string} args.viewId ViewId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkFavoriteByRowId: function (args, options = {}) {
     
     return $.api('Favorite', 'CheckFavoriteByRowId', args, options);
   },
};
