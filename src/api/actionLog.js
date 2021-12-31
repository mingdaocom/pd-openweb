define(function (require, exports, module) {
  module.exports = {
    /**
     * 获取登陆日志列表
     * @param {Object} args 请求参数
     * @param {string} projectId
     * @param {integer} pageIndex 页码
     * @param {integer} pageSize  页数
     * @param {string} startdate  开始时间
     * @param {string} endDate  结束时间
     * @param {integer} logType  登陆状态 
     * @param {string} accountId  登陆人id
     * @returns
     */
    getActionLogs: function (args, options) {
      return $.api('ActionLog', 'GetActionLogs', args, options);
    },
  };
});
