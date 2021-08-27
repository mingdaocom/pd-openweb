import ajax from './ajax';

/**
 * 获取入职员工列表
 * @param  {Integer} [args.entryType = 0 待入职全部 1待入职未加入网络]
 */

function getEntryEmployeeList(args) {
  return ajax.get({
    url: '/employee/relation/getEntryEmployeeList',
    args,
  });
}

/**
 * 获取转正员工列表
 * @param  {Integer} [args.formalType = 0 为all 1 转正已到期 2 转正未到期]
 */
function getFormalEmployeeList(args) {
  return ajax.get({
    url: '/employee/relation/getFormalEmployeeList',
    args,
  });
}

/**
 * 获取离职员工列表
 * @param  {Integer} [args.formalType = 0 为all 1 离职已到期 2 离职未到期]
 */
function getRemoveEmployeeList(args) {
  return ajax.get({
    url: '/employee/relation/getRemoveEmployeeList',
    args,
  });
}

/**
 * 获取已离职员工列表
 * @param  {String} [args.departmentId = 部门id]
 * @param  {Integer} [args.pageIndex =1]
 * @param  {Integer} [args.pageSize =50]
 */
function getRealRemoveEmployeeList(args) {
  return ajax.get({
    url: '/employee/relation/getRealRemoveEmployeeList',
    args,
  });
}

/**
 * 修改员工入职状态(放弃入职)
 * @param  {String} [args.employeeId = 员工id]
 * @param  {String} [args.reason = 放弃入职理由]
 * @param  {String} [args.content = 备注]
 * @param  {Integer} [args.entryStatus = 入职状态] -1 放弃入职(放弃入职原因 备注) 0 待入职 1 办理入职（应该配合修改接口一起） 2 暂不办理入职
 */
function updateEmployeeEntryStatus(args) {
  return ajax.post({
    url: '/employee/relation/updateEmployeeEntryStatus',
    args,
  });
}

/**
 * 获取入职记录
 * @param  {Integer} [args.pageIndex =1]
 * @param  {Integer} [args.pageSize =50]
 */
function getEntryLogList(args) {
  return ajax.get({
    url: '/employee/relation/getEntryLogList',
    args,
  });
}

/**
 * 获取转正员工信息（办理转正层使用）
 * @param  {String} [args.employeeId = 员工id]
 */
function getFormalEmployee(args) {
  return ajax.get({
    url: '/employee/relation/getFormalEmployee',
    args,
  });
}

/**
 * 办理转正
 * @param  {String} [args.employeeId = 员工id]
 * @param  {String} [args.formalDate = 实际转正日期(时间戳)]
 */
function updateEmployeeFormalStatus(args) {
  return ajax.post({
    url: '/employee/relation/updateEmployeeFormalStatus',
    args,
  });
}

/**
 * 获取转正记录
 * @param  {Integer} [args.pageIndex =1]
 * @param  {Integer} [args.pageSize =50]
 */
function getFormalLogList(args) {
  return ajax.get({
    url: '/employee/relation/getFormalLogList',
    args,
  });
}

/**
 * 离职 （办理离职/确认离职信息/放弃离职）
 * @param  {String} [args.employeeId = 员工id]
 * @param  {Integer} [args.removeStatus = 0 放弃离职 1 办理调整离职信息 2 确认离职]
 * @param  {String} [args.removeDate = 办理离职(对应计划离职时间)，确认离职(对应实际离职时间)]
 * @param  {String} [args.reason = 离职原因)]
 */
function updateEmployeeRemoveStatus(args) {
  return ajax.post({
    url: '/employee/relation/updateEmployeeRemoveStatus',
    args,
  });
}

/**
 * 发送邀请函
 * @param  {String} [args.mobilePhone = 手机号(添加时需要)]
 * @param  {String} [args.email = 邮箱(添加时需要)]
 * @param  {String} [args.message = 发送邀请时的内容]
 */
function inviteEmployee(args) {
  return ajax.post({
    url: '/employee/relation/inviteEmployee',
    args,
  });
}

/**
 * 重新邀请
 * @param  {String} [args.employeeId = 员工id]
 */
function inviteAccount(args) {
  return ajax.post({
    url: '/employee/relation/inviteAccount',
    args,
  });
}

/**
 * 重新入职
 * @param  {String} [args.employeeId = 员工id]
 */
function resetStatus(args) {
  return ajax.post({
    url: '/employee/relation/resetStatus',
    args,
  });
}

/**
 * 导入未激活 移除操作
 * @param  {String} [args.employeeId = 员工id]
 */
function deleteInput(args) {
  return ajax.post({
    url: '/employee/relation/deleteInput',
    args,
  });
}

export default {
  getEntryEmployeeList,
  getFormalEmployeeList,
  getRemoveEmployeeList,
  getRealRemoveEmployeeList,
  updateEmployeeEntryStatus,
  getEntryLogList,
  getFormalEmployee,
  updateEmployeeFormalStatus,
  getFormalLogList,
  updateEmployeeRemoveStatus,
  inviteEmployee,
  inviteAccount,
  resetStatus,
  deleteInput,
};
