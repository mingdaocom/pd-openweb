export default {
  /**
  * 获取用户需要同意的申明
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDeclareByAcountId: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'GetDeclareByAcountId', args, options);
   },
  /**
  * 添加用户申明同意记录
  * @param {Object} args 请求参数
  * @param {string} args.declareId 申明Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addDeclareAgreeLog: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'AddDeclareAgreeLog', args, options);
   },
  /**
  * 条款列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLegalList: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'GetLegalList', args, options);
   },
  /**
  * 根据Id获取详情（含内容）
  * @param {Object} args 请求参数
  * @param {string} args.legalId 条款Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLegalDetailById: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'GetLegalDetailById', args, options);
   },
  /**
  * 根据Key获取详情（含内容）
  * @param {Object} args 请求参数
  * @param {string} args.key 访问路径
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLegalDetailByKey: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'GetLegalDetailByKey', args, options);
   },
  /**
  * 添加条款
  * @param {Object} args 请求参数
  * @param {string} args.name
  * @param {string} args.key 隐私政策
  * @param {} args.type
  * @param {string} args.content 内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLegal: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'AddLegal', args, options);
   },
  /**
  * 修改条款
  * @param {Object} args 请求参数
  * @param {string} args.legalId 条款Id
  * @param {string} args.name
  * @param {string} args.key 隐私政策
  * @param {} args.type
  * @param {string} args.content 内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLegal: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'EditLegal', args, options);
   },
  /**
  * 修改条款状态
  * @param {Object} args 请求参数
  * @param {string} args.legalId 条款Id
  * @param {} args.status
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLegalStatus: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'EditLegalStatus', args, options);
   },
  /**
  * 修改条款排序
  * @param {Object} args 请求参数
  * @param {object} args.sortMap 排序集合（key：资源id, value: 序号）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLegalSortIndex: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'EditLegalSortIndex', args, options);
   },
  /**
  * 删除条款
  * @param {Object} args 请求参数
  * @param {string} args.legalId 条款Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeLegal: function (args, options = {}) {
     
     return mdyAPI('PrivateLegal', 'RemoveLegal', args, options);
   },
};
