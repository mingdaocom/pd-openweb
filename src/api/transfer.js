define(function (require, exports, module) {
  module.exports = {
    /**
    * 按网络获取交接记录
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {string} args.keywords 关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getTransferRecordByProject: function (args, options) {
      return $.api('Transfer', 'GetTransferRecordByProject', args, options);
    },

    /**
    * 按类型获取交接记录
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {} args.transferRecordType 交接记录类型
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {string} args.originAccountId 账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getTransferRecordByType: function (args, options) {
      return $.api('Transfer', 'GetTransferRecordByType', args, options);
    },

    /**
    * 执行交接
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.oldAccountId 原账户Id
    * @param {string} args.toAccountId 目标账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    transferAll: function (args, options) {
      return $.api('Transfer', 'TransferAll', args, options);
    },

    /**
    * 一键交接
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.oldAccountId 原账户Id
    * @param {string} args.toAccountId 目标账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    transferAllOneClick: function (args, options) {
      return $.api('Transfer', 'TransferAllOneClick', args, options);
    },

    /**
    * 单个交接
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.sourceId 交接记录Id
    * @param {} args.transferRecordType 交接记录类型
    * @param {string} args.oldAccountId 原账户Id
    * @param {string} args.toAccountId 目标账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    transferOne: function (args, options) {
      return $.api('Transfer', 'TransferOne', args, options);
    },

    /**
    * 多个交接
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {array} args.sourceIds 交接记录Ids
    * @param {} args.transferRecordType 交接记录类型
    * @param {string} args.oldAccountId 原账户Id
    * @param {string} args.toAccountId 目标账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    transferMany: function (args, options) {
      return $.api('Transfer', 'TransferMany', args, options);
    },

    /**
    * 按照类型进行交接
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {} args.transferRecordType 交接记录类型
    * @param {string} args.oldAccountId 原账户Id
    * @param {string} args.toAccountId 目标账户Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    transferByType: function (args, options) {
      return $.api('Transfer', 'TransferByType', args, options);
    },

    /**
    * 获取用户外部协作详情
    * @param {Object} args 请求参数
    * @param {string} args.accountId 账户Id
    * @param {string} args.projectId 网络Id
    * @param {integer} args.type 类型
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRelationDetailByAid: function (args, options) {
      return $.api('Transfer', 'GetRelationDetailByAid', args, options);
    },

    /**
    * 外部用户协作统计
    * @param {Object} args 请求参数
    * @param {string} args.keyWords 关键词
    * @param {string} args.projectId 网络Id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRelationStatistics: function (args, options) {
      return $.api('Transfer', 'GetRelationStatistics', args, options);
    },

    /**
    * 退出网络协作群组
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {array} args.accountIds 账户Ids
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    exitAllRelation: function (args, options) {
      return $.api('Transfer', 'ExitAllRelation', args, options);
    },

    /**
    * 按类型获取交接记录
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {} args.oaTransferType 离职交接类型（ 0:全部，1：表单，2：流程 ，3：角色）
    * @param {} args.completedType OA类型完成状态（ -1：全部，0：未完成，1：完成）
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {string} args.originAccountId OriginAccountId
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getOATransferRecordByType: function (args, options) {
      return $.api('Transfer', 'GetOATransferRecordByType', args, options);
    },

    /**
    * 交接部分，按照sourceId
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.accountId 被交接人
    * @param {string} args.listTranser [{&#34;sourceType&#34;:1, &#34;sourceId&#34;:&#34;587750be6d12f91fa4ff2e2a&#34;,&#34;completeType&#34;:0}] //批量单个的id
    * @param {string} args.transferAccountId 交接给人
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    oATransferToAccountId: function (args, options) {
      return $.api('Transfer', 'OATransferToAccountId', args, options);
    },

    /**
    * 交接全部
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络Id
    * @param {string} args.accountId 被交接人
    * @param {integer} args.sourceType SourceType
    * @param {integer} args.completeType CompleteType
    * @param {string} args.transferAccountId 接交给人
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    oATransferAllToAccountId: function (args, options) {
      return $.api('Transfer', 'OATransferAllToAccountId', args, options);
    },

  };
});
