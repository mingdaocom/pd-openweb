import ajax from './ajax';

/**
 * 保存(导出批量发放假期导入的格式)是需要的一连串参数
 * @param  {List} [args.accounts = [String] 账号id多个]
 * @param  {String} [args.typeId = 假期类型id]
 */
function receive(args) {
  return ajax.post({
    url: '/vacation/excel/receive',
    args,
    config: {
      async: false,
    },
  });
}

/**
 * 保存(导出加班记录)获取加班记录列表的一连串参数
 * @param  {String} [args.startDate = 2017-09-01]
 * @param  {String} [args.endDate = 2017-09-30]
 * @param  {Array} [args.accounts = 员工账号[accountId]]
 * @param  {Integer} [args.reqStatus = 加班状态 1完成 0未完成]
 * @param  {Integer} [args.type = 补偿方式 1调休 2加班费]
 * @param  {Integer} [args.status = 0撤销 1待确认 2有效 4无效 4删除]
 */
function receiveOverTime(args) {
  return ajax.post({
    url: '/vacation/excel/receive/overTime',
    args,
    config: {
      async: false,
    },
  });
}

/**
 * 导出批量发放假期导入的格式
 * @param  {String} [args.receiveId = 上个接口返回的值]
 */
function excel(args) {
  return ajax.open('/vacation/excel/excel?receiveId=' + args.receiveId);
}

/**
 * 导出批量发放假期导入的格式
 * @param  {String} [args.receiveId = 上个接口返回的值]
 */
function excelAll(args) {
  return ajax.open('/vacation/excel/excelAll?receiveId=' + args.receiveId);
}

/**
 * 导出加班记录的格式
 * @param  {String} [args.receiveId = 上个接口返回的值]
 */
function excelOverTime(args) {
  return ajax.open('/vacation/excel/excelOverTime?receiveId=' + args.receiveId);
}

/**
 * 【上传文件】导出导入操作时使用 导入员工档案
 *  @param  {String} [args.typeId = 假期类型id]
 */
function uploadVacationFile(args) {
  return ajax.file({
    url: '/file/vacation/upload/' + args.typeId,
    args: args.data,
  });
}

export default {
  receive,
  excel,
  excelAll,
  uploadVacationFile,
  receiveOverTime,
  excelOverTime,
};
