import ajax from './ajax';

/**
 * 添加/修改提醒时间
 * @param  {Double} [args.entry = 入职提醒]
 * @param  {Double} [args.formal = 转正提醒]
 * @param  {Double} [args.remove = 离职提醒]
 * @param  {Double} [args.contract = 合同提醒]
 * @param  {Double} [args.birth = 生日提醒]
 * @param  {Double} [args.anniversary = 周年提醒]
 */
function addRemind(args) {
  return ajax.post({
    url: '/manage/message/remind/add',
    args,
  });
}

/**
 * 获取提醒时间
 */
function getRemind(args) {
  return ajax.get({
    url: '/manage/message/remind/get',
    args,
  });
}

export default {
  addRemind,
  getRemind,
};
