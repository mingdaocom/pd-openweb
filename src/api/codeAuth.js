export default {
  /**
   * 获取二维码
   * @param {Object} args 请求参数
   * @param {} args.signMode
   * @param {string} args.workId 流程 Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getQrCode: function (args, options = {}) {
    return mdyAPI('CodeAuth', 'GetQrCode', args, options);
  },
  /**
   * 获取扫码结果
   * @param {Object} args 请求参数
   * @param {string} args.state 随机码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getQrCodeResult: function (args, options = {}) {
    return mdyAPI('CodeAuth', 'GetQrCodeResult', args, options);
  },
  /**
   * 获取默认图片
   * @param {Object} args 请求参数
   * @param {string} args.workId 流程Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDefaultPicUrl: function (args, options = {}) {
    return mdyAPI('CodeAuth', 'GetDefaultPicUrl', args, options);
  },
};
