import base, { controllerName } from './base';
/**
 * processGroup
*/
var processGroup = {
  /**
   * 创建流程分组
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {api分组} {createTime:创建时间(string),id:null(string),index:排序字段(integer),name:分组名称(string),relationId:关联id(string),relationType:关联的类型(integer),}*processGroup
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addGroup: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/addGroup';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupaddGroup', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除分组
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestDeleteGroup} {groupId:分组id(string),}*group
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteGroup: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/deleteGroup';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupdeleteGroup', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取所有的分组
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.relationId] *链接认证的id或网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getGroupList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/getGroupList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processGroupgetGroupList', args, $.extend(base, options));
  },
  /**
   * 分组排序
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestSortGroups} {groupIds:分组ids(array),}*groups
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  sortGroups: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/processGroup/sortGroups';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processGroupsortGroups', JSON.stringify(args), $.extend(base, options));
  },
};
export default processGroup;