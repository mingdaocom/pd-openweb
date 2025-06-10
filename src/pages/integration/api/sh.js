import base, { controllerName } from './base';

var sh = {

  /**
   * 获取中间库信息
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getStorehouseInfo: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/getStorehouseInfo';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shgetStorehouseInfo', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除中间库表缓存key
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  delTableCache: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/delTableCache';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shdelTableCache', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除mongodb中intermediate_warehouse数据库下的所有集合接口--慎用！
   *
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  delSh: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/delSh';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shdelSh', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 查询中间库中是否存在数据用户排查同步数据数据不存在依据
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkDatabaseForData: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/checkDatabaseForData';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shcheckDatabaseForData', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 检查表是否存在
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  status: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/status';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shstatus', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取同步标识
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSyncFlag: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/getSyncFlag';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shgetSyncFlag', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除mongodb中intermediate_warehouse数据库下指定worksheetId集合接口
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId No comments found.
   * @param {array} args.workSheetIds No comments found.
   * @param {integer} args.pageNo No comments found.
   * @param {integer} args.pageSize No comments found.
   * @param {string} args.searchField No comments found.
   * @param {string} args.searchValue No comments found.
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  delShByOne: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sh/delShByOne';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'shdelShByOne', JSON.stringify(args), $.extend(base, options));
  }
};

export default sh;