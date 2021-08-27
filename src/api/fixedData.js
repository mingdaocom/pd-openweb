define(function (require, exports, module) {
  module.exports = {
    /**
    * 加载省份信息
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    loadProvince: function (args, options) {
      return $.api('FixedData', 'LoadProvince', args, options);
    },

    /**
    * 加载城市或地区
    * @param {Object} args 请求参数
    * @param {string} args.id 地区id
    * @param {string} args.textSplit 分割字符
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    loadCityCountyById: function (args, options) {
      return $.api('FixedData', 'LoadCityCountyById', args, options);
    },

    /**
    * 加载行业信息
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    loadIndustry: function (args, options) {
      return $.api('FixedData', 'LoadIndustry', args, options);
    },

  };
});
