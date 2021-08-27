import base, { controllerName } from './base';

const system = {
  /**
   * 添加审批角色
   * @param {Object} args 请求参数
   * @param {String} [args.accountId=账号id]
   * @param {String} [args.roleName=角色名]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addRole(args, options) {
    base.ajaxOptions.url = base.server() + '/system/role/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'addRole', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除审批角色
   * @param args
   * @param {String} [args.d=角色id]
   * @param options
   * @returns {*}
   */
  deleteRole(args, options) {
    base.ajaxOptions.url = base.server() + '/system/role/delete/' + args.id;
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'deleteRole', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取审批角色列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getRoleList(args, options) {
    base.ajaxOptions.url = base.server() + '/system/role/list';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getRoleList', args, $.extend(base, options));
  },

  /**
   * 获取审批角色列表(通讯录用)
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getRolePublicList(args, options) {
    base.ajaxOptions.url = base.server() + '/system/role/public/list';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getRolePublicList', args, $.extend(base, options));
  },

  /**
   * 修改审批角色
   * @param {Object} args 请求参数
   * @param {String} [args.roleId=审批角色id]
   * @param {String} [args.accountId=账号id]
   * @param {String} [args.roleName=角色名]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateRole(args, options) {
    base.ajaxOptions.url = base.server() + '/system/role/update/' + args.roleId;
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'updateRole', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取公式列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getCodeList(args, options) {
    base.ajaxOptions.url = base.server() + '/system/code/list';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getCodeList', args, $.extend(base, options));
  },

  /**
   * 根据母数据源id获取全部子数据源tree
   * @param {Object} args 请求参数
   * @param {String} [args.parentId=母数据源id]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getParentDataSource: (args, options) => {
    base.ajaxOptions.url = base.server() + '/system/source/parent/get';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getParentDataSource', args, $.extend(base, options));
  },

  /**
   * 获取一级母数据源
   */
  getDataSource: (args, options) => {
    base.ajaxOptions.url = base.server() + '/system/source/get';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getDataSource', args, $.extend(base, options));
  },
  /**
   * 添加数据源
   * @param {Object} args 请求参数
   * @param {String} [args.parentId=母数据源id]
   * @param {String} [args.value=数据源值]
   * @param {Object} [args.before=添加顺序 bool]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addSource(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'addSource', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 添加数据源
   * @param {Object} args 请求参数
   * @param {String} [args.parentId=母数据源id]
   * @param {String} [args.value=数据源值]
   * @param {Object} [args.before=添加顺序 bool]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addParentSource(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/parent/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'addParentSource', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 移除
   * @param {Object} args 请求参数
   * @param {String} [args.parentId=母数据源id]
   * @param {String} [args.value=数据源值]
   * @param {Object} [args.before=添加顺序 bool]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  cancelSource(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/cancel';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'cancelSource', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 修改数据源
   * @param {Object} args 请求参数
   * @param {String} [args.sourceId=修改的数据源id]
   * @param {String} [args.parentId=母数据源id(如果没有修改母数据id传-1)]
   * @param {String} [args.value=数据源值(如果没有修改则不传)]
   * @param {String} [args.children=拖拽后母节点的children值]
   * @param {String} [args.drag=是否拖拽  bool]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateSource(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/update/' + args.sourceId;
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'updateSource', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除数据源
   * @param {Object} args 请求参数
   * @param {String} [args.sourceId=需要删除的数据源id]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteSource(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/delete/' + args.sourceId;
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'deleteSource', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 验证是否是子母关系
   * @param {Object} args 请求参数
   * @param {String} [args.sourceId=子id]
   * @param {String} [args.parentId=母id]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  verifyParent(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/verify/parent';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'verifyParent', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新source dataTree
   * @param {Object} args 请求参数
   * @param {String} [args.parentId=母id]
   * @param {String} [args.treeData=组件获取到的treeData]
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateSourceTree(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/update/tree';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'updateSourceTree', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取数据源操作日志
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDataSourceLog(args, options) {
    base.ajaxOptions.url = base.server() + '/system/source/log';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getDataSourceLog', args, $.extend(base, options));
  },

  /**
   * 获取审批授权
   * @param args
   * @param options
   * @returns {*}
   */
  getPayAuthorize(args, options) {
    base.ajaxOptions.url = base.server() + '/system/authorize/getPayAuthorize';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'getPayAuthorize', args, $.extend(base, options));
  },

  /**
   * 获取非管理员时是否有查询统计表单权限
   * @param args
   * @param options
   * @returns {*}
   */
  haveFormRangeAuth(args, options) {
    base.ajaxOptions.url = base.server() + '/system/authorize/haveFormRangeAuth';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'haveFormRangeAuth', args, $.extend(base, options));
  },
};

module.exports = system;
