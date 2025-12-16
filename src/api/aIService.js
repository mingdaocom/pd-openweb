export default {
  /**
   * 获取 AI 服务开关状态
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAIServiceStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'GetAIServiceStatus', args, options);
  },
  /**
   * 编辑 AI 服务开关状态
   * @param {Object} args 请求参数
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAIServiceStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditAIServiceStatus', args, options);
  },
  /**
   * 新增 AI 开发商
   * @param {Object} args 请求参数
   * @param {} args.developer
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addDeveloper: function (args, options = {}) {
    return mdyAPI('AIService', 'AddDeveloper', args, options);
  },
  /**
   * 编辑 AI 开发商
   * @param {Object} args 请求参数
   * @param {} args.developer
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editDeveloper: function (args, options = {}) {
    return mdyAPI('AIService', 'EditDeveloper', args, options);
  },
  /**
   * 修改 AI 开发商状态
   * @param {Object} args 请求参数
   * @param {string} args.developerId 开发商 ID（必填）
   * @param {boolean} args.isVisible 是否可见（true=显示，false=隐藏）
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editDeveloperStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditDeveloperStatus', args, options);
  },
  /**
   * 获取内置模型列表
   * @param {Object} args 请求参数
   * @param {} args.developerType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getBuiltInModel: function (args, options = {}) {
    return mdyAPI('AIService', 'GetBuiltInModel', args, options);
  },
  /**
   * 新增 AI 供应商
   * @param {Object} args 请求参数
   * @param {} args.provider
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addServiceProvider: function (args, options = {}) {
    return mdyAPI('AIService', 'AddServiceProvider', args, options);
  },
  /**
   * 获取 AI 供应商详情
   * @param {Object} args 请求参数
   * @param {string} args.id 供应商 ID（必填）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getServiceProviderDetail: function (args, options = {}) {
    return mdyAPI('AIService', 'GetServiceProviderDetail', args, options);
  },
  /**
   * 获取 AI 供应商列表
   * @param {Object} args 请求参数
   * @param {} args.type
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getServiceProviderList: function (args, options = {}) {
    return mdyAPI('AIService', 'GetServiceProviderList', args, options);
  },
  /**
   * 编辑 AI 供应商
   * @param {Object} args 请求参数
   * @param {} args.provider
   * @param {boolean} args.setKey 是否修改密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editServiceProvider: function (args, options = {}) {
    return mdyAPI('AIService', 'EditServiceProvider', args, options);
  },
  /**
   * 修改 AI 供应商状态
   * @param {Object} args 请求参数
   * @param {string} args.id 供应商 ID（必填）
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editServiceProviderStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditServiceProviderStatus', args, options);
  },
  /**
   * 新增模型
   * @param {Object} args 请求参数
   * @param {} args.model
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addModel: function (args, options = {}) {
    return mdyAPI('AIService', 'AddModel', args, options);
  },
  /**
   * 编辑模型
   * @param {Object} args 请求参数
   * @param {string} args.id 模型 ID（必填）
   * @param {} args.model
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editModel: function (args, options = {}) {
    return mdyAPI('AIService', 'EditModel', args, options);
  },
  /**
   * 修改模型状态
   * @param {Object} args 请求参数
   * @param {string} args.id 模型 ID（必填）
   * @param {boolean} args.isVisible 是否可见（true=显示，false=隐藏）
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editModelStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditModelStatus', args, options);
  },
  /**
   * 获取模型下可用供应商
   * @param {Object} args 请求参数
   * @param {string} args.modelId 模型 ID（必填）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAvailableModelProvider: function (args, options = {}) {
    return mdyAPI('AIService', 'GetAvailableModelProvider', args, options);
  },
  /**
   * 获取模型详情
   * @param {Object} args 请求参数
   * @param {string} args.id 模型 ID（二选一）
   * @param {string} args.name 模型 名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getModelDetail: function (args, options = {}) {
    return mdyAPI('AIService', 'GetModelDetail', args, options);
  },
  /**
   * 根据开发商获取模型列表
   * @param {Object} args 请求参数
   * @param {} args.developerType
   * @param {boolean} args.showAll 是否显示所有模型（默认 false，只显示启用且可见的模型）
   * @param {boolean} args.onlyAvailable 是否只显示可用模型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDeveloperWithModes: function (args, options = {}) {
    return mdyAPI('AIService', 'GetDeveloperWithModes', args, options);
  },
  /**
   * 获取可用的开发商和模型列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAllowDeveloperWithModes: function (args, options = {}) {
    return mdyAPI('AIService', 'GetAllowDeveloperWithModes', args, options);
  },
  /**
   * 编辑功能模型绑定
   * @param {Object} args 请求参数
   * @param {array} args.bindings 绑定配置列表（必填）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editFeatureBinding: function (args, options = {}) {
    return mdyAPI('AIService', 'EditFeatureBinding', args, options);
  },
  /**
   * 获取功能模型绑定信息
   * @param {Object} args 请求参数
   * @param {} args.feature
   * @param {boolean} args.useFallback 是否允许使用 fallback 模型（默认 false）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFeatureBinding: function (args, options = {}) {
    return mdyAPI('AIService', 'GetFeatureBinding', args, options);
  },
  /**
   * 自动绑定功能模型
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  autoBindFeatures: function (args, options = {}) {
    return mdyAPI('AIService', 'AutoBindFeatures', args, options);
  },
  /**
   * 获取工作流 AIGC 开关
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorkFlowAIGCStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'GetWorkFlowAIGCStatus', args, options);
  },
  /**
   * 编辑工作流 AIGC 开关
   * @param {Object} args 请求参数
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editWorkFlowAIGCStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditWorkFlowAIGCStatus', args, options);
  },
  /**
   * 获取模型能力增强配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getModelExtDetail: function (args, options = {}) {
    return mdyAPI('AIService', 'GetModelExtDetail', args, options);
  },
  /**
   * 编辑模型能力增强配置（Web 搜索 / 语音转文字，二选一）
   * @param {Object} args 请求参数
   * @param {} args.webSearchConfig
   * @param {} args.speechToTextConfig
   * @param {boolean} args.setKey 是否修改密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editModelExtDetail: function (args, options = {}) {
    return mdyAPI('AIService', 'EditModelExtDetail', args, options);
  },
  /**
   * 修改模型能力增强配置状态
   * @param {Object} args 请求参数
   * @param {} args.type
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editModelExtDetailStatus: function (args, options = {}) {
    return mdyAPI('AIService', 'EditModelExtDetailStatus', args, options);
  },
  /**
   * 编辑 AI 模型价格策略
   * @param {Object} args 请求参数
   * @param {array} args.modelRate 模型价格配置列表（必填）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAIModelPricingPolicy: function (args, options = {}) {
    return mdyAPI('AIService', 'EditAIModelPricingPolicy', args, options);
  },
  /**
   * 获取 AI 模型价格策略
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAIPricingPolicyDetail: function (args, options = {}) {
    return mdyAPI('AIService', 'GetAIPricingPolicyDetail', args, options);
  },
  /**
   * 获取基础价格信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getBasePricingPolicy: function (args, options = {}) {
    return mdyAPI('AIService', 'GetBasePricingPolicy', args, options);
  },
  /**
   * 编辑基础价格
   * @param {Object} args 请求参数
   * @param {array} args.featureRate 模型价格配置列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editBasicFeaturePricingPolicy: function (args, options = {}) {
    return mdyAPI('AIService', 'EditBasicFeaturePricingPolicy', args, options);
  },
  /**
   * 更新排序
   * @param {Object} args 请求参数
   * @param {} args.target
   * @param {array} args.ids 最终 ID 顺序（必填）
   * @param {string} args.developerId 当排序对象为 Model 时必填：所属开发商 ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateSort: function (args, options = {}) {
    return mdyAPI('AIService', 'UpdateSort', args, options);
  },
  /**
   * 测试AI 连接
   * @param {Object} args 请求参数
   * @param {string} args.providerId 厂商Id
   * @param {string} args.providerModel 厂商模型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  testConnection: function (args, options = {}) {
    return mdyAPI('AIService', 'TestConnection', args, options);
  },
  /**
   * 判断重名
   * @param {Object} args 请求参数
   * @param {string} args.name 名称
   * @param {} args.nameCheckType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  hasDuplicateName: function (args, options = {}) {
    return mdyAPI('AIService', 'HasDuplicateName', args, options);
  },
  /**
   * 发送上报AI错误消息
   * @param {Object} args 请求参数
   * @param {} args.feature
   * @param {string} args.errMsg 错误信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendAIServiceErrorMsg: function (args, options = {}) {
    return mdyAPI('AIService', 'SendAIServiceErrorMsg', args, options);
  },
};
