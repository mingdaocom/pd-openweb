import ajax from './ajax';

/**
 * 保存导出是需要的一连串参数(参数跟档案页面的getEmployeeList一致)
 */
function receive(args) {
  return ajax.post({
    url: '/employee/export/receive',
    args,
    config: {
      async: false,
    },
  });
}

/**
 * 根据 receive 接口返回的 receiveId导出
 */
function excel(args) {
  return ajax.open('/employee/export/excel?receiveId=' + args.receiveId);
}

/**
 * 导出导入操作使用 根据 receive 接口返回的 receiveId导出
 */
function fieldsExcel(args) {
  return ajax.open('/employee/export/fieldsExcel?receiveId=' + args.receiveId);
}

export default {
  receive,
  excel,
  fieldsExcel,
};
