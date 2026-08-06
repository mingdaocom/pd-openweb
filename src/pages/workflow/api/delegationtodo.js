import base, { controllerName } from './base';

/**
 * delegationtodo
 */
const delegationtodo = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  getTodoList: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/todo/getTodoList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationtodogetTodoList', JSON.stringify(args), $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getCount: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/todo/getCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationtodogetCount', JSON.stringify(args), $.extend({}, base, options));
  },
};
export default delegationtodo;
