import ajax from './ajax';

/**
 * 添加假期类型
 * @param  {String} [args.name = 假期类型名]
 * @param  {String} [args.explain = 假期说明]
 * @param  {Integer} [args.dayType = 天数计算方式（1: 按工作日 2：按自然日）]
 * @param  {Integer} [args.limitType = 假期额度（1: 无假期额度 2：有假期额度]
 * @param  {Integer} [args.unitType = 请假单位（2：小时 3：天）]
 * @param  {Integer} [args.minUnitType = 最小请假单位（1：1小时的倍数 2：0.5小时的倍数）]
 */
function addVacationType(args) {
  return ajax.post({
    url: '/vacation/type/add',
    args,
  });
}

/**
 * 删除假期类型
 * @param  {String} [args.typeId = 假期类型id]
 */
function deleteVacationType(args) {
  return ajax.post({
    url: '/vacation/type/delete',
    args,
  });
}

/**
 * 获取假期类型列表(返回值system为不可删除项)
 * @param  {Boolean} [args.admin = 是否是配置页的请求]
 */
function getVacationTypeList(args) {
  return ajax.get({
    url: '/vacation/type/get',
    args,
  });
}

/**
 * 假期类型排序
 * @param  {List} [{id}] 假期列表
 */
function sortVacationType(args) {
  return ajax.post({
    url: '/vacation/type/sort',
    args,
  });
}

/**
 * 假期类型排序
 * @param  {String} [args.typeId = 假期类型id]
 * @param  {Boolean} [args.enable = 是否启用]
 */
function enableVacationType(args) {
  return ajax.get({
    url: '/vacation/type/enable',
    args,
  });
}

/**
 * 添加假期限额
 * @param  {List} [args.accounts = [String] 账号id多个]
 * @param  {String} [args.typeId = 假期类型id]
 * @param  {Double} [args.limit = 发放的额度]
 * @param  {String} [args.effectDate = 生效日期]
 * @param  {String} [args.dueDate = 截止日期]
 * @param  {{String}} [args.content = 备注]
 */
function addVacationLimit(args) {
  return ajax.post({
    url: '/vacation/limit/add',
    args,
  });
}

/**
 * 调整假期限额
 * @param  {String} [args.vacationLimitId = 调整的假期限额id]
 * @param  {Double} [args.limit = 发放的额度]
 * @param  {String} [args.effectDate = 生效日期]
 * @param  {String} [args.dueDate = 截止日期]
 * @param  {{String}} [args.content = 备注]
 */
function updateVacationLimit(args) {
  return ajax.post({
    url: '/vacation/limit/update',
    args,
  });
}

/**
 * 获取假期限额列表
 * @param  {String} [args.accountId = 账号id]
 * @param  {String} [args.typeId = 假期类型id]
 */
function getVacationLimitList(args) {
  return ajax.get({
    url: '/vacation/limit/get',
    args,
  });
}

/**
 * 添加加班补偿规则
 * @param  {Integer} [args.unitType = 请假单位（2：小时 3：天）]
 * @param  {Integer} [args.type = 有效期类型 (1:按天 2:日期)]
 * @param  {Double} [args.days = 天数]
 * @param  {String} [args.date = 日期]
 */
function addOverTimeRule(args) {
  return ajax.post({
    url: '/vacation/overTime/rule/add',
    args,
  });
}

/**
 * 获取加班补偿规则
 */
function getOverTimeRule(args) {
  return ajax.get({
    url: '/vacation/overTime/rule/get',
    args,
  });
}

/**
 * 获取批量发放基础结构
 * @param  {List} [args.accounts = [String] 账号id多个]
 * @param  {String} [args.typeId = 假期类型id]
 */
function getVacationLimitAddList(args) {
  return ajax.post({
    url: '/vacation/limit/getList',
    args,
  });
}

/**
 * 获取批量发放基础结构
 * @param  {String} [args.typeId = 假期类型id]
 * @param  {List} [args.items = [{批量发放基础结构}]]
 */
function addVacationLimitList(args) {
  return ajax.post({
    url: '/vacation/limit/addList',
    args,
  });
}

/**
 * 获取假期发放日志
 * @param  {Integer} [args.accountId = 账号]
 */
function getVacationLimitLogList(args) {
  return ajax.get({
    url: '/vacation/limit/log',
    args,
  });
}

/**
 * 获取假期类型天小时转换规则
 */
function getVacationRule(args) {
  return ajax.get({
    url: '/vacation/rule/get',
    args,
  });
}

/**
 * 修改假期类型天小时转换规则
 * @param  {Integer} [args.hours = 小时数]
 */
function updateVacationRule(args) {
  return ajax.post({
    url: '/vacation/rule/update',
    args,
  });
}

/**
 * 重置假期额度
 * @param  {Integer} [args.id = 假期类型]
 */
function resetOverTime(args) {
  return ajax.post({
    url: '/vacation/overTime/reset',
    args,
  });
}

export default {
  addVacationType,
  deleteVacationType,
  getVacationTypeList,
  sortVacationType,
  enableVacationType,
  addVacationLimit,
  updateVacationLimit,
  getVacationLimitList,
  addOverTimeRule,
  getOverTimeRule,
  getVacationLimitAddList,
  addVacationLimitList,
  getVacationLimitLogList,
  getVacationRule,
  updateVacationRule,
  resetOverTime,
};
