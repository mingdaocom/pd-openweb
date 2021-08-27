import ajax from './ajax';

/**
 * 添加/编辑职位 设置编制人数
 * @param  {String} [args.name = 职位名]
 * @param  {Long} [args.auth = 编制人数 不是设置编制人数不用传]
 * @param  {String} [args.id = 职位id 编辑时需要传]
 */

function addJob(args) {
  return ajax.post({
    url: '/manage/job/addJob',
    args,
  });
}

/**
 * 获取职位列表
 * @param  {Integer} [args.pageIndex = ]
 * @param  {Integer} [args.pageSize = ]
 * @param  {String} [args.keyword = 关键字搜索]
 */

function getJobList(args) {
  return ajax.get({
    url: '/manage/job/getJobList',
    args,
  });
}

/**
 * 删除职位
 * @param  {String} [args.id = 职位id]
 */

function deleteJob(args) {
  return ajax.post({
    url: '/manage/job/deleteJob',
    args,
  });
}

/**
 * 合并职位
 * @param  {String} [args.id = 合并到的职位id]
 * @param  {String} [args.mergeId = 需要合并的职位id]
 */

function mergeJob(args) {
  return ajax.post({
    url: '/manage/job/mergeJob',
    args,
  });
}

export default {
  addJob,
  getJobList,
  deleteJob,
  mergeJob,
};
