export default {
  /**
  * 获取联系信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactInfo: function (args, options = {}) {
     
     return mdyAPI('Contact', 'GetContactInfo', args, options);
   },
};
