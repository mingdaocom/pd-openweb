export default {
  /**
   * 获取 多个用户的 生效状态信息（用户 未设置 状态 不返回）
   * @param {Object} args 请求参数
   * @param {array} args.accountIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAccountsPersonalStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'GetAccountsPersonalStatus', args, options);
  },
  /**
   * 获取账户一览信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPersonalStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'GetPersonalStatus', args, options);
  },
  /**
   * 设置 个人状态为 当前状态/预约
   * @param {Object} args 请求参数
   * @param {string} args.statusId Id
   * @param {string} args.icon 图标
   * @param {string} args.remark 备注
   * @param {string} args.beginTime 起始时间【可空】
   * @param {string} args.endTime 结束时间【可空】
   * @param {} args.durationOption
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setPersonalStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'SetPersonalStatus', args, options);
  },
  /**
   * 取消设置 当前状态
   * @param {Object} args 请求参数
   * @param {string} args.statusId Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  cancelPersonalStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'CancelPersonalStatus', args, options);
  },
  /**
   * 删除 个人状态
   * @param {Object} args 请求参数
   * @param {string} args.statusId Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deletePersonalStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'DeletePersonalStatus', args, options);
  },
  /**
   * 添加或更新的 个人 单个状态
   * @param {Object} args 请求参数
   * @param {string} args.statusId Id【可空】
   * @param {string} args.icon 图标
   * @param {string} args.remark 备注
   * @param {string} args.beginTime 预约 起始时间【可空】
   * @param {string} args.endTime 预约 结束时间【可空】
   * @param {} args.durationOption
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addOrUpdateStatus: function (args, options = {}) {
    return mdyAPI('PersonalStyle', 'AddOrUpdateStatus', args, options);
  },
};
