export default {
  /**
   * 获取短信签名审核通知人列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSmsSignAuditNoticeUsers: function (args, options = {}) {
    return mdyAPI('SmsSignature', 'GetSmsSignAuditNoticeUsers', args, options);
  },
  /**
   * 获取短信签名审核列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.signName 签名
   * @param {} args.signSource
   * @param {} args.auditStatus
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 每页数量
   * @param {boolean} args.isAsc 排序方式
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getListSmsSignature: function (args, options = {}) {
    return mdyAPI('SmsSignature', 'GetListSmsSignature', args, options);
  },
  /**
   * 获取短信签名详情
   * @param {Object} args 请求参数
   * @param {string} args.id 短信前面Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSmsSignature: function (args, options = {}) {
    return mdyAPI('SmsSignature', 'GetSmsSignature', args, options);
  },
  /**
   * 审核资料
   * @param {Object} args 请求参数
   * @param {string} args.id 短信前面Id
   * @param {} args.auditStatus
   * @param {string} args.auditRemark 审核意见
   * @param {boolean} args.isSmsNotify 是否短信通知申请人
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  auditSmsSignature: function (args, options = {}) {
    return mdyAPI('SmsSignature', 'AuditSmsSignature', args, options);
  },
};
