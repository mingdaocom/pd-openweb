import ajax from './ajax';

/**
 * 获取首页的一些统计数
 * @param args
 * @returns {"entry": 1025, // 即将入职（待入职）
              "trial": 1026, // 即将转正 (试用期员工)
              "remove": 1, // 即将离职（待离职）
              "on": 0} // 在职员工
 */
function count(args) {
  return ajax.get({
    url: '/home/count',
    args,
  });
}

/**
 * 获取首页日历数据
 * @param {String} [args.startDate = "yyyy-MM-dd"]
 * @param {String} [args.endDate = "yyyy-MM-dd"]
 * @returns  [
         {
         "date": "2017-08-02", // 日期
         "items": [ // 事件组
             {
             "type": 1, 事件类型（1入职 2转正 3离职 4合同到期）
             "employees": [ 事件相关人员列表
                 {
                 "employeeId": "599ea0b56d12f923203a96ef", //员工id
                 "type": 1,
                 "fullName": null //员工姓名
                 },
                 {
                 "employeeId": "599ea0b56d12f923203a96f1",
                 "type": 1,
                 "fullName": null
                 }
                 ]
             }
             ]
         }
      ]
 */
function date(args) {
  return ajax.get({
    url: '/home/date',
    args,
  });
}

export default {
  count,
  date,
};
