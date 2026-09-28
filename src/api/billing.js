export default {
  /**
   * 查询账务中心信用点余额。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCreditPointBalance: function (args, options = {}) {
    return mdyAPI('Billing', 'GetCreditPointBalance', args, options);
  },
  /**
   * 查询账务中心商品订单。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {array} args.orderStatuses 订单状态筛选；空集合表示全部。
   * @param {} args.productCode
   * @param {string} args.orderNo 订单编号精确筛选。
   * @param {string} args.creatorAccountId 创建人账号 Id 筛选。
   * @param {string} args.createdFrom 创建时间范围起点，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 创建时间范围终点；时分秒全为零时包含当天，否则为排他终点。
   * @param {integer} args.pageIndex 页码。
   * @param {integer} args.pageSize 每页数量。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  listOrders: function (args, options = {}) {
    return mdyAPI('Billing', 'ListOrders', args, options);
  },
  /**
   * 查询账务中心信用点流水。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {} args.transactionType
   * @param {array} args.businessTypes 信用点业务类型筛选；空集合表示全部。
   * @param {string} args.operatorAccountId 操作人账号 Id 筛选。
   * @param {string} args.createdFrom 创建时间范围起点，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 创建时间范围终点；时分秒全为零时包含当天，否则为排他终点。
   * @param {object} args.extensionFilters HAP 扩展字段筛选条件。
   * @param {integer} args.pageIndex 页码。
   * @param {integer} args.pageSize 每页数量。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getListCreditPoints: function (args, options = {}) {
    return mdyAPI('Billing', 'GetListCreditPoints', args, options);
  },
  /**
   * 使用与列表相同的筛选条件查询信用点流水总数。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {} args.transactionType
   * @param {array} args.businessTypes 信用点业务类型筛选；空集合表示全部。
   * @param {string} args.operatorAccountId 操作人账号 Id 筛选。
   * @param {string} args.createdFrom 创建时间范围起点，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 创建时间范围终点；时分秒全为零时包含当天，否则为排他终点。
   * @param {object} args.extensionFilters HAP 扩展字段筛选条件。
   * @param {integer} args.pageIndex 页码。
   * @param {integer} args.pageSize 每页数量。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCreditPointCount: function (args, options = {}) {
    return mdyAPI('Billing', 'GetCreditPointCount', args, options);
  },
  /**
   * 按运行批次 Id 查询账务中心全部原始信用点流水。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {string} args.instanceId 账务流水聚合使用的运行批次 Id。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCreditPointDetailsByInstanceId: function (args, options = {}) {
    return mdyAPI('Billing', 'GetCreditPointDetailsByInstanceId', args, options);
  },
  /**
   * 查询账务中心信用点概览。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {string} args.createdFrom 统计开始时间，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 统计结束时间；时分秒全为零时包含当天，否则为排他终点。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCreditPointOverview: function (args, options = {}) {
    return mdyAPI('Billing', 'GetCreditPointOverview', args, options);
  },
  /**
   * 查询账务中心信用点统计页面的四项固定聚合结果。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {string} args.createdFrom 统计开始时间，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 统计结束时间；时分秒全为零时包含当天，否则为排他终点。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCreditPointStatisticsSummary: function (args, options = {}) {
    return mdyAPI('Billing', 'GetCreditPointStatisticsSummary', args, options);
  },
  /**
   * 查询应用固定分类的信用点消费统计。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {string} args.createdFrom 统计开始时间，必须为带显式时区偏移的 ISO 8601 时间。
   * @param {string} args.createdTo 统计结束时间；时分秒全为零时包含当天，否则为排他终点。
   * @param {array} args.appIds 指定应用 Id；空集合表示查询总消费前 50 个应用。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getApplicationCreditPointStatistics: function (args, options = {}) {
    return mdyAPI('Billing', 'GetApplicationCreditPointStatistics', args, options);
  },
};
