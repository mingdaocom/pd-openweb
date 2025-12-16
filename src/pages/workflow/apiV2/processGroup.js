import base, { controllerName } from './base';
/**
 * processGroup
*/
const processGroup = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  sortGroups: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/sortGroups';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupsortGroups', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  deleteGroup: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/deleteGroup';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupdeleteGroup', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  addGroup: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/addGroup';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupaddGroup', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.relationId] *null
   * @param {Object} options 配置参数
   */
  getGroupList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/getGroupList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processGroupgetGroupList', args, $.extend({}, base, options));
  },
};
export default processGroup;