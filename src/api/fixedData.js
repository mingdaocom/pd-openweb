export default {
  /**
  * 加载省份信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   loadProvince: function (args, options = {}) {
     
     return mdyAPI('FixedData', 'LoadProvince', args, options);
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
   loadCityCountyById: function (args, options = {}) {
     
     return mdyAPI('FixedData', 'LoadCityCountyById', args, options);
   },
  /**
  * 加载城市
  * @param {Object} args 请求参数
  * @param {string} args.parentId 上级ID
  * @param {string} args.keywords 关键词
  * @param {integer} args.layer 层级 0：不限制
  * @param {string} args.textSplit 分割字符
  * @param {boolean} args.isLast 是否最后一级
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCitysByParentID: function (args, options = {}) {
     
     return mdyAPI('FixedData', 'GetCitysByParentID', args, options);
   },
  /**
  * 加载行业信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   loadIndustry: function (args, options = {}) {
     
     return mdyAPI('FixedData', 'LoadIndustry', args, options);
   },
  /**
  * 校验敏感词
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkSensitive: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('FixedData', 'CheckSensitive', args, options);
   },
  /**
  * 加载系统时区列表
注意前端默认会填充1，代表跟随设备的时区
后端如果读取到1 则需要走服务器默认时区逻辑
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   loadTimeZones: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('FixedData', 'LoadTimeZones', args, options);
   },
};
