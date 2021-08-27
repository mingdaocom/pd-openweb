define(function (require, exports, module) {
  module.exports = {
    /**
    * 根据邀请账号生成账户信息
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getInviteAccountInfo: function (args, options) {
      return $.api('Invitation', 'GetInviteAccountInfo', args, options);
    },

    /**
    * 邀请用户加入某个模块
    * @param {Object} args 请求参数
    * @param {string} args.sourceId 账号id，群组id，任务id，文件夹id，网络id，日程id，项目id
    * @param {} args.fromType 0:好友，1:群组，2:任务，3:文件夹，4:网络，5:日程，6:项目
    * @param {array} args.accountIds 数组：[accountId1,accountId2]
    * @param {object} args.accounts 字典:{账号1:姓名1,账号2:姓名2}
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    inviteUser: function (args, options) {
      return $.api('Invitation', 'InviteUser', args, options);
    },

    /**
    * 获取通用邀请链接
    * @param {Object} args 请求参数
    * @param {string} args.sourceId 账号id，群组id，任务id，文件夹id，网络id，日程id，项目id
    * @param {integer} args.fromType 0:好友，1:群组，2:任务，3:文件夹，4:网络，5:日程，6:项目
    * @param {integer} args.linkFromType 1:微信，2:QQ，3:链接，4:二维码，5:钉钉
    * @param {integer} args.hours 多少小时后失效
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getInviteLink: function (args, options) {
      return $.api('Invitation', 'GetInviteLink', args, options);
    },

    /**
    * 二维码链接
    * @param {Object} args 请求参数
    * @param {string} args.sourceId 账号id，群组id，任务id，文件夹id，网络id，日程id，项目id
    * @param {integer} args.fromType 0:好友，1:群组，2:任务，3:文件夹，4:网络，5:日程，6:项目
    * @param {integer} args.linkFromType 1:微信，2:QQ，3:链接，4:二维码，5:钉钉
    * @param {integer} args.size 二维码型号
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getQRCodeInviteLink: function (args, options) {
      return $.api('Invitation', 'GetQRCodeInviteLink', args, options);
    },

    /**
    * 获取当前用户所有有效的链接
    * @param {Object} args 请求参数
    * @param {string} args.sourceId 账号id，群组id，任务id，文件夹id，网络id，日程id，项目id
    * @param {boolean} args.isAll false:是否是我创建的，true:所有
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAllValidTokenByAccountId: function (args, options) {
      return $.api('Invitation', 'GetAllValidTokenByAccountId', args, options);
    },

    /**
    * 设置链接失效
    * @param {Object} args 请求参数
    * @param {string} args.token 链接token
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    updateAuthToExpire: function (args, options) {
      return $.api('Invitation', 'UpdateAuthToExpire', args, options);
    },

    /**
    * 更新链接失效时间
    * @param {Object} args 请求参数
    * @param {array} args.tokens 链接token
    * @param {integer} args.hours 多少小时后失效
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    updateAuthDeadtime: function (args, options) {
      return $.api('Invitation', 'UpdateAuthDeadtime', args, options);
    },

  };
});
