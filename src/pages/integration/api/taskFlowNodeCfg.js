import base, { controllerName } from './base';

var taskFlowNodeCfg = {

  /**
   * 获取分类汇总节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  agg: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/agg';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgagg', args, $.extend(base, options));
  },

  /**
   * 获取目的地节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  dest: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/dest';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgdest', args, $.extend(base, options));
  },

  /**
   * 获取数据合并节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  union: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/union';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgunion', args, $.extend(base, options));
  },

  /**
   * 获取筛选过滤节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  filter: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/filter';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgfilter', args, $.extend(base, options));
  },

  /**
   * 获取表连接节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  join: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/join';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgjoin', args, $.extend(base, options));
  },

  /**
   * 获取源表节点配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.configId 配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  src: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'taskFlowNodeCfg/src';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'taskFlowNodeCfgsrc', args, $.extend(base, options));
  }
};

export default taskFlowNodeCfg;