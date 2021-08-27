import ajax from './ajax';

/**
 * 获取hr人员列表
 */
function getHrList(args) {
  return ajax.post({
    url: '/fields/getHrList',
    args,
  });
}

/**
 * 获取配置规则列表
 */
function getHrFieldsConfigList(args) {
  return ajax.get({
    url: '/fields/getHrFieldsConfigList',
    args,
  });
}

/**
 * 获取Hr权限需要配置的字段
 */
function getHrFieldsSetting(args) {
  return ajax.get({
    url: '/fields/getHrFieldsSetting',
    args,
  });
}

/**
 * 添加/修改 配置规则详情
 * @param  {String} [args.name = 名字]
 * @param  {Array} [args.accounts = 成员[accountId,accountId]]
 * @param  {Array} [args.fields = 返回结果当中的fields列表
 * [{
 *  controlId:"",
 *  formId:"",
 *  editable:false,
 *  viewable:false
 * }]
 * ]
 * @param  {String} [args.configId = 配置规则id(修改时传)]
 */
function addHrFieldsConfig(args) {
  return ajax.post({
    url: '/fields/addHrFieldsConfig',
    args,
  });
}

/**
 * 获取配置规则详情
 * @param  {String} [args.configId = 配置规则id]
 */
function getHrFieldsConfig(args) {
  return ajax.get({
    url: '/fields/getHrFieldsConfig',
    args,
  });
}

/**
 * 验证哪些成员已在其他规则当中
 * @param  {String} [args.configId = 配置规则id]
 * @param  {Array} [args.accounts = 成员[accountId,accountId]]
 */
function checkHrFields(args) {
  return ajax.post({
    url: '/fields/checkHrFields',
    args,
  });
}

/**
 * 获取配置规则日志
 * @param  {Integer} [args.pageIndex = 页数]
 * @param  {Integer} [args.pageSize = 每页数量]
 */
function getHrFieldsLog(args) {
  return ajax.get({
    url: '/fields/getHrFieldsLog',
    args,
  });
}

/**
 * 添加/删除权限配置成员
 * @param  {String} [args.configId = 配置规则id]
 * @param  {Array} [args.accounts = 成员[accountId,accountId]]
 * @param  {Boolean} [args.add = 是否是新增 默认新增true 删除false]
 */
function updateHrFieldConfigMembers(args) {
  return ajax.post({
    url: '/fields/updateHrFieldConfigMembers',
    args,
  });
}

/**
 * 修改权限配置状态(删除)
 * @param  {String} [args.configId = 配置规则id]
 */
function updateHrFieldConfigStatus(args) {
  return ajax.post({
    url: '/fields/updateHrFieldConfigStatus',
    args,
  });
}

export default {
  getHrList,
  getHrFieldsConfigList,
  getHrFieldsSetting,
  getHrFieldsConfig,
  checkHrFields,
  getHrFieldsLog,
  updateHrFieldConfigMembers,
  updateHrFieldConfigStatus,
  addHrFieldsConfig,
};
