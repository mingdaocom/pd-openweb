define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取联系信息
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getContactInfo: function (args, options) {
      return $.api('Contact', 'GetContactInfo', args, options);
    },

    /**
    * 提交用户联系信息
    * @param {Object} args 请求参数
    * @param {} args.leadType 线索类型
    * @param {string} args.userName 用户名
    * @param {string} args.company 公司
    * @param {string} args.job 职位
    * @param {string} args.email 邮箱
    * @param {string} args.mobile 手机号
    * @param {string} args.industry 行业
    * @param {string} args.city 城市
    * @param {string} args.address 地址
    * @param {string} args.companyWeb 公司网站
    * @param {string} args.normol 规模
    * @param {string} args.content 留言
    * @param {string} args.contactMe 联系我
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    submitLinkContent: function (args, options) {
      return $.api('Contact', 'SubmitLinkContent', args, options);
    },

    /**
    * 新增来源流量
    * @param {Object} args 请求参数
    * @param {string} args.regFrom 注册广告来源
    * @param {string} args.referrer 注册来源页面
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addFlow: function (args, options) {
      return $.api('Contact', 'AddFlow', args, options);
    },

    /**
    * 发送用户反馈信息
    * @param {Object} args 请求参数
    * @param {string} args.content 留言
    * @param {string} args.textErrorMessage 错误信息
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    sendFeedBack: function (args, options) {
      return $.api('Contact', 'SendFeedBack', args, options);
    },

  };
});
