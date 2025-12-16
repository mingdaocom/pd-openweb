import base, { controllerName } from './base';

/**
 * event
 */
const event = {
  /**
   * 订阅
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestWorksheetSubscribe} {appKey:null(string),describe:描述(string),event_type:create：创建记录时触发 update：更新记录时触发 delete：删除记录时触发(string),name:名称(string),sign:null(string),subscription_id:订阅标识 id （用于接受zapier创建 zap 订阅的唯一标识）(string),url:订阅地址，用于接收事件推送消息。格式如下：必须为HTTP/HTTPS支持POST请求的公网可访问的地址，不能携带任何参数(string),worksheet_id:工作表id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  subscribe: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/event/subscribe';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'eventsubscribe', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 取消订阅
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestWorksheetSubscribe} {appKey:null(string),describe:描述(string),event_type:create：创建记录时触发 update：更新记录时触发 delete：删除记录时触发(string),name:名称(string),sign:null(string),subscription_id:订阅标识 id （用于接受zapier创建 zap 订阅的唯一标识）(string),url:订阅地址，用于接收事件推送消息。格式如下：必须为HTTP/HTTPS支持POST请求的公网可访问的地址，不能携带任何参数(string),worksheet_id:工作表id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  unsubscribe: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/event/unsubscribe';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'eventunsubscribe', JSON.stringify(args), $.extend(base, options));
  },
};
export default event;
