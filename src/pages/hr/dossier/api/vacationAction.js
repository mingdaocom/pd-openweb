import ajax from './ajax';

/**
 * 获取根据考勤计算的请假和加班时长
 * @param  {Integer} [args.type = 请假还是加班  1请假 4加班]
 * @param  {String} [args.accountId = 账号id]
 * @param  {String} [args.typeId = 请假时需要传 请假类型id]
 * @param  {Array} [args.dates = 时间段[1513148910112,1513753710112,"AM","PM"]]
 * @param  {String} [args.reason = 事由]
 */
function getEffectiveTime(args) {
  return ajax.post({
    url: '/vacation/action/getEffectiveTime',
    args,
  });
}

/**
 * 根据账号获取该账号的请假类型及余额
 * @param  {String} [args.accountId = 账号id]
 */
function getVacationTypesByAccountId(args) {
  return ajax.post({
    url: '/vacation/action/getVacationTypesByAccountId',
    args,
  });
}

/**
 * 添加请假或加班记录
 * @param  {Integer} [args.type = 请假还是加班  1请假 4加班]
 * @param  {String} [args.accountId = 账号id]
 * @param  {String} [args.typeId = 请假时需要传 请假类型id]
 * @param  {Array} [args.dates = 时间段[1513148910112,1513753710112,"AM","PM"]]
 * @param  {String} [args.reason = 事由]
 * 添加加班记录时需要下面参数
 * @param  {Double} [args.editHours = 确认时候的加班时长]
 * @param  {Integer} [args.ruleType = 补偿方式（1：调休假 2：加班费） 如果选了调休假的补偿方式需要拉下 加班补偿规则接口]
 * @param  {Double} [args.offset = 补偿的值 调休假就是小时数或者天数  加班费就是具体金额]
 * @param  {Boolean} [args.go = 是否立即执行补偿 默认true立即执行]
 */
function add(args) {
  return ajax.post({
    url: '/vacation/action/add',
    args,
  });
}

/**
 * 销假
 * @param  {String} [args.id = 请假记录列表id]
 */
function cancelVacationReq(args) {
  return ajax.post({
    url: '/vacation/action/cancelVacationReq',
    args,
  });
}

/**
 * 获取已有加班确认补偿数据
 * @param  {String} [args.overTimeId = 加班记录id]
 */
function getConfirmOverTime(args) {
  return ajax.get({
    url: '/vacation/action/getConfirmOverTime',
    args,
  });
}

/**
 * 确认加班记录
 * @param  {String} [args.overTimeId = 加班记录id]
 * @param  {Double} [args.editHours = 确认时候的加班时长]
 * @param  {Integer} [args.ruleType = 补偿方式（1：调休假 2：加班费） 如果选了调休假的补偿方式需要拉下 加班补偿规则接口]
 * @param  {Double} [args.offset = 补偿的值 调休假就是小时数或者天数  加班费就是具体金额]
 */
function confirmOverTime(args) {
  return ajax.post({
    url: '/vacation/action/confirmOverTime',
    args,
  });
}

/**
 * 修改加班记录状态
 * @param  {String} [args.overTimeId = 加班记录id]
 * @param  {Integer} [args.status =  0撤销 1待确认 2有效 3无效 4删除(设置有效2调确认加班记录接口)]
 */
function updateOverTimeStatus(args) {
  return ajax.post({
    url: '/vacation/action/updateOverTimeStatus',
    args,
  });
}

export default {
  getEffectiveTime,
  getVacationTypesByAccountId,
  add,
  cancelVacationReq,
  getConfirmOverTime,
  confirmOverTime,
  updateOverTimeStatus,
};
