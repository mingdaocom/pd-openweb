import ajax from './ajax';

/**
 * 获取高级筛选控件列表
 */

function getFilterFields(args) {
  return ajax.get({
    url: '/employee/dossier/getFilterFields',
    args,
  });
}

/**
 * 获取呈现的控件列表
 */

function getShowFields(args) {
  return ajax.get({
    url: '/employee/dossier/getShowFields',
    args,
  });
}

/**
 * 获取筛选员工列表
 * @param  {Object} [args.showFields = [
 {
     "name": "姓名",
     "id": "59674682d4e6353d306373e7",
     "checked": true,
     "sort": 4
 }]](呈现字段)
 * @param  {Object} [args.filterFields = [
 {
   "id":"596746bed4e6353d30637412",
   "value":2
 }
 ]]](筛选条件)
 */

function getEmployeeList(args) {
  return ajax.post({
    url: '/employee/dossier/getEmployeeList',
    args,
  });
}

/**
 * 【上传文件】导入员工档案
 */
function uploadEmployees(args) {
  return ajax.file({
    url: '/file/upload',
    args,
  });
}

/**
 * 【上传文件】导出导入操作时使用 导入员工档案
 */
function uploadEmployeesFields(args) {
  return ajax.file({
    url: '/file/fields/upload',
    args,
  });
}

/**
 * 获取人事异动控件值
 * @param  {String} [args.employeeId = 员工id]
 */

function getChangeFields(args) {
  return ajax.get({
    url: '/employee/dossier/getChangeFields',
    args,
  });
}

/**
 * 更新人事异动控件值(获取人事异动控件值 获取到的值 都需要)
 * @param  {String} [args.employeeId = 员工id]
 * @param  {Integer} [args.type =  3晋升 4调岗 5其他]
 * @param  {Date} [args.date =  生效日期]
 * @param  {String} [args.content =  备注]
 */

function updateChangeFields(args) {
  return ajax.post({
    url: '/employee/dossier/updateChangeFields',
    args,
  });
}

/**
 * 获取某个员工的全部人事异动
 * @param  {String} [args.employeeId = 员工id]
 */
function getEmployeeChangeList(args) {
  return ajax.get({
    url: '/employee/dossier/getEmployeeChangeList',
    args,
  });
}

/**
 * 获取员工动态按时间分组
 * @param {String} [args.startDate = "yyyy-MM-dd"]
 * @param {String} [args.endDate = "yyyy-MM-dd"]
 * @param  {Integer} [args.type =  0入职记录 1转正记录 2离职记录 3晋升 4调岗 5其他]
 * @param  {String} [args.departmentId = 部门id]
 *  @returns  [
 {
 "date": "2017-08-02", // 日期
 "items": [ //类型组
     {
     "type": 1, 0入职记录 1转正记录 2离职记录 3晋升 4调岗 5其他
     changes": [
          {
          "employeeId": "59a649bd6d12f92c1c5a7867",
          "date": "2017-08-30 13:14:57",
          "type": 0,
          "message": "",//异动描述
          "operateAccount": { //办理人
            "accountId": "0c7efa12-2a84-4fe5-a648-dff6cfff771b",
            "fullName": "\"\"##%=_|??<={??|!'cm",
            "avatar": "",
            "fullname": "\"\"##%=_|??<={??|!'cm"
            },
          "account": { //异动的账号
            "accountId": null,
            "fullName": null,
            "avatar": "",
            "fullname": null
            },
          "department": "",//部门
          "content": ""//备注
          }
        ]
     }
     ]
 }
 ]
 */
function getEmployeeChangeGroupByDate(args) {
  return ajax.get({
    url: '/employee/dossier/getEmployeeChangeGroupByDate',
    args,
  });
}

/**
 * 获取员工还未生效的人事异动
 * @param  {String} [args.employeeId = 员工id]
 */
function getEmployeeUnEffectChangeList(args) {
  return ajax.get({
    url: '/employee/dossier/getEmployeeUnEffectChangeList',
    args,
  });
}

/**
 * 撤销人事异动
 * @param  {String} [args.id = 人事异动id]
 */

function cancelEmployeeChange(args) {
  return ajax.post({
    url: '/employee/dossier/cancelEmployeeChange',
    args,
  });
}

export default {
  getFilterFields,
  getShowFields,
  getEmployeeList,
  uploadEmployees,
  uploadEmployeesFields,
  getChangeFields,
  updateChangeFields,
  getEmployeeChangeList,
  getEmployeeChangeGroupByDate,
  getEmployeeUnEffectChangeList,
  cancelEmployeeChange,
};
