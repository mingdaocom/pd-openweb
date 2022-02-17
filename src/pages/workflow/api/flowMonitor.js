import base, { controllerName } from './base';

const flowMonitor = {
  /**
   * 按网络获取流程堆积量
   * @param {Object} args 请求参数
   * @param {string} [args.companyId] 网络ID
   */
  getDifferenceByCompanyId: function (args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getDifferenceByCompanyId';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'v1processgetDifferenceByCompanyId', args, $.extend(base, options));
  },

  /**
   * 按网络获取堆积流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.companyId] 网络ID
   * @param {string} [args.keyword] 流程名称
   * @param {integer} [args.pageIndex] 页码
   * @param {integer} [args.pageSize] 页数
   * @param {Object} [args.sorter] 排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}
   */
  getDifferenceProcessList: function (args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getDifferenceProcessList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1processgetDifferenceProcessList', args, $.extend(base, options));
  },
  /**
   * 按网络获取堆积流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.processId] 流程ID
   * @param {string} [args.hours] 暂停多少小时
   */
  updateWaiting: function (args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/updateWaiting';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1processupdateWaiting', args, $.extend(base, options));
  },
  /**
   * 按网络获取堆积流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.companyId] 流程ID
   * @param {string} [args.startDate] 开始时间 yyyy-MM-dd HH:mm:ss
   * @param {string} [args.endDate] 结束时间 yyyy-MM-dd HH:mm:ss
   */
  getHistoryDifferenceByCompanyId: function (args, options) {
    base.ajaxOptions.url = base.server() + '/v1/process/getHistoryDifferenceByCompanyId';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'v1processgetHistoryDifferenceByCompanyId', args, $.extend(base, options));
  },
};

module.exports = flowMonitor;
