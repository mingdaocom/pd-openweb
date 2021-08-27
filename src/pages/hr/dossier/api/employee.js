import ajax from './ajax';

/**
 * 获取添加入职字段
 * @param  {Boolean} [args.simple = 字段少还是多]
 * @param  {String} [args.employeeId = 不为空为编辑]
 */

function getEmployeeFields(args) {
  return ajax.get({
    url: '/employee/getEmployeeFields',
    args,
  });
}

/**
 * 获取公司能在线修改的字段
 */

function getCompanyUpdateFields(args) {
  return ajax.get({
    url: '/employee/getCompanyUpdateFields',
    args,
  });
}

/**
 * 添加/编辑入职字段
 * @param  {String} [args.mobilePhone = 手机号(添加时需要)]
 * @param  {String} [args.email = 邮箱(添加时需要)]
 * @param  {String} [args.employeeId = 员工id(编辑时需要)]
 * @param  {Boolean} [args.entry = 是否办理入职]
 * @param  {Object} [args.data = {controls,formControls}]
 */
function addEmployeeFields(args) {
  return ajax.post({
    url: '/employee/addEmployeeFields',
    args,
  });
}

/**
 * 导入 或者批量修改 员工
 * @param  {Object} [args.data = [{controls,employeeId}]]
 */
function addEmployeeList(args) {
  return ajax.post({
    url: '/employee/addEmployeeList',
    args,
  });
}

/**
 * 获取个人信息(或者入职信息)
 * @param  {String} [args.employeeId = 不为空为编辑]
 * @param  {Boolean} [args.entry = 获取入职信息传true]
 */
function getEmployee(args) {
  return ajax.get({
    url: '/employee/getEmployee',
    args,
  });
}

/**
 * 获取邀请时需要填写的信息
 * @param  {String} [args.id = 邀请id 59c370c26d12f9322c7b9535]
 */
function getEmployeeInvite(args) {
  return ajax.get({
    url: '/employee/getEmployeeInvite',
    args,
  });
}

/**
 * 获取个人信息页头部
 * @param  {String} [args.employeeId = 不为空为编辑]
 * @returns {type 0 已离职 1 未转正 2 已转正 }
 */
function getEmployeeTop(args) {
  return ajax.get({
    url: '/employee/getEmployeeTop',
    args,
  });
}
/**
 * 获取入职信息页头部
 * @param  {String} [args.employeeId = 不为空为编辑]
 * @returns {type 1 已加入网络, 已填写入职登记表 2 已加入网络, 未填写入职登记表 3 未加入网络, 已填写入职登记表
 * 4 未加入网络, 未填写入职登记表 5 已办理入职, 未加入网络}
 */
function getEmployeeEntryTop(args) {
  return ajax.get({
    url: '/employee/getEmployeeEntryTop',
    args,
  });
}

/**
 * 添加材料附件
 * @param  {String} [args.employeeId = 员工id]
 * @param  {String} [args.typeId = 材料附件类型id]
 * @param  {Object} [args.attachments = 本地附件结构]
 * @param  {Object} [args.knowledgeAtt = 知识中心附件结构]
 * @param  {Integer} [args.enumDefault = 身份证 正反面（1 正面 2方面）]
 *
 */
function addEmployeeAttachment(args) {
  return ajax.post({
    url: '/employee/attachment/add',
    args,
  });
}

/**
 * 获取材料附件
 * @param  {String} [args.employeeId = 员工id]
 * @param  {String} [args.typeId = 材料附件类型id]
 * @param  {Integer} [args.enumDefault = 身份证 正反面（1 正面 2方面）]
 *
 */
function getEmployeeAttachment(args) {
  return ajax.get({
    url: '/employee/attachment/get',
    args,
  });
}

/**
 * 获取导入未激活用户
 *
 */
function getEmployeeInputList(args) {
  return ajax.get({
    url: '/employee/getEmployeeInputList',
    args,
  });
}

/**
 * 获取个人信息页日志
 * @param  {String} [args.employeeId = 员工id]
 *
 */
function getEmployeeLogList(args) {
  return ajax.get({
    url: '/employee/getEmployeeLogList',
    args,
  });
}

export default {
  getEmployeeFields,
  getCompanyUpdateFields,
  addEmployeeFields,
  addEmployeeList,
  getEmployee,
  getEmployeeTop,
  getEmployeeEntryTop,
  addEmployeeAttachment,
  getEmployeeAttachment,
  getEmployeeInvite,
  getEmployeeInputList,
  getEmployeeLogList,
};
