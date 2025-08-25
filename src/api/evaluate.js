export default {
  /**
   * 获取当前用户的评价，能否评价
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getByUser: function (args, options = {}) {
    return mdyAPI('Evaluate', 'GetByUser', args, options);
  },
  /**
   * 获取应用库评价
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库模板id
   * @param {integer} args.pageIndex 当前页码 从1开始
   * @param {integer} args.size 每页数量
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  gets: function (args, options = {}) {
    return mdyAPI('Evaluate', 'Gets', args, options);
  },
  /**
   * 获取单个评价
   * @param {Object} args 请求参数
   * @param {string} args.id 评价id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  get: function (args, options = {}) {
    return mdyAPI('Evaluate', 'Get', args, options);
  },
  /**
   * 新增评价
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库模板id
   * @param {string} args.projectId
   * @param {string} args.message 文字评价
   * @param {number} args.score 评分
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  add: function (args, options = {}) {
    return mdyAPI('Evaluate', 'Add', args, options);
  },
  /**
   * 编辑评价
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库模板id
   * @param {string} args.id 评价id
   * @param {string} args.projectId
   * @param {string} args.message 文字评价
   * @param {number} args.score 评分
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  edit: function (args, options = {}) {
    return mdyAPI('Evaluate', 'Edit', args, options);
  },
  /**
   * 新增评价回复
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库模板id
   * @param {string} args.id 评价id
   * @param {string} args.message 回复内容
   * @param {string} args.replyId 回复topicId (可空)
   * @param {string} args.replyAccountId 回复人id (可空)
   * @param {integer} args.type 1= 个人，2= 作者
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addTopic: function (args, options = {}) {
    return mdyAPI('Evaluate', 'AddTopic', args, options);
  },
  /**
   * 删除评价回复
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 应用库模板id
   * @param {string} args.id 评价id
   * @param {string} args.topicId 回复id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteTopic: function (args, options = {}) {
    return mdyAPI('Evaluate', 'DeleteTopic', args, options);
  },
};
