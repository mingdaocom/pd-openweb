import ajax from './ajax';

/**
 * 获取请假记录的统计
 * @param  {String} [args.startDate = 2017-09-01]
 * @param  {String} [args.endDate = 2017-09-30]
 */
function getVacationReqCount(args) {
  return ajax.get({
    url: '/vacation/statistics/getVacationReqCount',
    args,
  });
}

/**
 * 获取加班记录的统计
 * @param  {String} [args.startDate = 2017-09-01]
 * @param  {String} [args.endDate = 2017-09-30]
 */
function getOverTimeReqCount(args) {
  return ajax.get({
    url: '/vacation/statistics/getOverTimeReqCount',
    args,
  });
}

/**
 * 获取请假记录
 * @param  {String} [args.startDate = 2017-09-01]
 * @param  {String} [args.endDate = 2017-09-30]
 * @param  {String} [args.typeId = 请假类型id]
 * @param  {String} [args.departmentId = 部门id]
 * @param  {Integer} [args.status = 1请假记录 0销假记录]
 */
function getVacationReqList(args) {
  return ajax.post({
    url: '/vacation/statistics/getVacationReqList',
    args,
  });
}

/**
 * 获取加班记录
 * @param  {String} [args.startDate = 2017-09-01]
 * @param  {String} [args.endDate = 2017-09-30]
 * @param  {Array} [args.accounts = 员工账号[accountId]]
 * @param  {Integer} [args.reqStatus = 加班状态 1完成 0未完成]
 * @param  {Integer} [args.type = 补偿方式 1调休 2加班费]
 * @param  {Integer} [args.status = 0撤销 1待确认 2有效 4无效 4删除]
 */
function getOverTimeReqList(args) {
  return ajax.post({
    url: '/vacation/statistics/getOverTimeReqList',
    args,
  });
}

/**
 * 获取假期余额
 */
function getVacationLimitCount(args) {
  return ajax.get({
    url: '/vacation/statistics/getVacationLimitCount',
    args,
  });
}

export default {
  getVacationReqCount,
  getOverTimeReqCount,
  getVacationReqList,
  getOverTimeReqList,
  getVacationLimitCount,
};
