export default {
  /**
  * 给指定的AccountId发送聊天消息
  * @param {Object} args 请求参数
  * @param {array} args.accountIds 账号id
  * @param {string} args.content 内容
  * @param {string} args.attachments 附件
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendMessageToAccountIds: function (args, options = {}) {
     
     return $.api('Message', 'SendMessageToAccountIds', args, options);
   },
  /**
  * 发送邮件消息
  * @param {Object} args 请求参数
  * @param {array} args.accountIds 账号id
  * @param {string} args.content 内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendEmailMessageToAccountIds: function (args, options = {}) {
     
     return $.api('Message', 'SendEmailMessageToAccountIds', args, options);
   },
  /**
  * 发通告
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.content 内容
  * @param {string} args.attachments 附件
  * @param {array} args.groupIds 群组id
  * @param {array} args.accountIds 账号id
  * @param {boolean} args.allProject 全公司
  * @param {boolean} args.allAdmin 所有管理员
  * @param {boolean} args.allDepartmentChargeUser 所有部门负责人
  * @param {boolean} args.sendEmail 是否发邮件
  * @param {boolean} args.sendMessage 是否发私信
  * @param {boolean} args.sendMobileMessage 是否发短信
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendNotice: function (args, options = {}) {
     
     return $.api('Message', 'SendNotice', args, options);
   },
};
