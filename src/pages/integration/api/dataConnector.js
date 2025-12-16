import base, { controllerName } from './base';

const dataConnector = {
  /**
   * 获取常用连接器类型列表
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCommonTypes: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'dataConnector/getCommonTypes';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'dataConnectorgetCommonTypes', JSON.stringify(args), $.extend(base, options));
  },
};

export default dataConnector;
