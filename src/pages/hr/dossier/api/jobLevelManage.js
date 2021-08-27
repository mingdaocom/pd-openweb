import ajax from './ajax';

/**
 * 添加/编辑职级
 * @param  {String} [args.name = 职级名]
 * @param  {String} [args.id = 职级id 编辑时需要传]
 */

function addJobLevel(args) {
  return ajax.post({
    url: '/manage/jobLevel/addJobLevel',
    args,
  });
}

/**
 * 获取职级列表
 * @param  {Integer} [args.pageIndex = ]
 * @param  {Integer} [args.pageSize = ]
 * @param  {String} [args.keyword = 关键字搜索]
 */

function getJobLevelList(args) {
  return ajax.get({
    url: '/manage/jobLevel/getJobLevelList',
    args,
  });
}

/**
 * 删除职级
 * @param  {String} [args.id = 职级id]
 */

function deleteJobLevel(args) {
  return ajax.post({
    url: '/manage/jobLevel/deleteJobLevel',
    args,
  });
}

/**
 * 合并职级
 * @param  {String} [args.id = 合并到的职级id]
 * @param  {String} [args.mergeId = 需要合并的职级id]
 */

function mergeJobLevel(args) {
  return ajax.post({
    url: '/manage/jobLevel/mergeJobLevel',
    args,
  });
}

export default {
  addJobLevel,
  getJobLevelList,
  deleteJobLevel,
  mergeJobLevel,
};
