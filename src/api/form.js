export default {
  /**
  * 编辑保存模板及其所属控件
  * @param {Object} args 请求参数
  * @param {} args.sourceType
  * @param {array} args.controls 控件集合
  * @param {string} args.templateId 模板id
  * @param {string} args.sourceId 源id
  * @param {integer} args.version 模板版本号
  * @param {string} args.projectId 网络id
  * @param {array} args.formControls 表单明细控件集合
  * @param {boolean} args.isCreateNew 是否创建新，ps:改参数会在内部进行2次配置
  * @param {string} args.uniqueParam 个模块独有参数json
  * @param {string} args.templateName 模块名字,ps:目前只有sourceType.3使用到
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveTemplateWithControls: function (args, options = {}) {
     
     return $.api('Form', 'SaveTemplateWithControls', args, options);
   },
  /**
  * 新增文本控件
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.name 文本控件名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTextControl: function (args, options = {}) {
     
     return $.api('Form', 'AddTextControl', args, options);
   },
  /**
  * 添加模板控件
  * @param {Object} args 请求参数
  * @param {array} args.controls 控件集合
  * @param {string} args.templateId 模板id
  * @param {string} args.worksheetId 工作表ID
  * @param {integer} args.version 模板版本号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTemplateControls: function (args, options = {}) {
     
     return $.api('Form', 'AddTemplateControls', args, options);
   },
  /**
  * 编辑保存模板及其所属控件
  * @param {Object} args 请求参数
  * @param {} args.sourceType
  * @param {string} args.controls 控件集合
  * @param {string} args.templateId 模板id
  * @param {string} args.sourceId 源id
  * @param {integer} args.version 模板版本号
  * @param {string} args.projectId 网络id
  * @param {string} args.formControls 表单明细控件集合
  * @param {boolean} args.isCreateNew 是否创建新，ps:改参数会在内部进行2次配置
  * @param {string} args.uniqueParam 个模块独有参数json
  * @param {string} args.templateName 模块名字,ps:目前只有sourceType.3使用到
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveTemplateWithControlsGrpc: function (args, options = {}) {
     
     return $.api('Form', 'SaveTemplateWithControlsGrpc', args, options);
   },
  /**
  * 获取控件修改引起的公式值变更
  * @param {Object} args 请求参数
  * @param {string} args.controlId 当前变更值的控件id
  * @param {string} args.value 当前控件的变更值
  * @param {object} args.cidValueDic 所有当前页面的数值类型的控件的cid value
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFormulaControlValue: function (args, options = {}) {
     
     return $.api('Form', 'GetFormulaControlValue', args, options);
   },
  /**
  * 获取源对应的模板（含表单明细）
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplateWithControlsOld: function (args, options = {}) {
     
     return $.api('Form', 'GetTemplateWithControlsOld', args, options);
   },
  /**
  * 获取源对应的模板（含表单明细）
  * @param {Object} args 请求参数
  * @param {string} args.templateId 模板id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTemplateWithControls: function (args, options = {}) {
     
     return $.api('Form', 'GetTemplateWithControls', args, options);
   },
  /**
  * 按照type获取relation的列表
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.sourceType 源类型
  * @param {string} args.sourceId 源id
  * @param {string} args.treeLeft 上一层依据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRelationSources: function (args, options = {}) {
     
     return $.api('Form', 'GetRelationSources', args, options);
   },
  /**
  * 鉴定权限
  * @param {Object} args 请求参数
  * @param {} args.sourceType
  * @param {string} args.sourceId 源id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkEditAuth: function (args, options = {}) {
     
     return $.api('Form', 'CheckEditAuth', args, options);
   },
};
