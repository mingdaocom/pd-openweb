import ajax from './ajax';

/**
 * 添加/编辑合同公司
 * @param  {String} [args.name = 合同公司名]
 * @param  {String} [args.id = 合同公司id 编辑时需要传]
 */

function addCompany(args) {
  return ajax.post({
    url: '/manage/company/addCompany',
    args,
  });
}

/**
 * 获取合同公司列表
 * @param  {Integer} [args.pageIndex = ]
 * @param  {Integer} [args.pageSize = ]
 * @param  {String} [args.keyword = 关键字搜索]
 */

function getCompanyList(args) {
  return ajax.get({
    url: '/manage/company/getCompanyList',
    args,
  });
}

/**
 * 删除合同公司
 * @param  {String} [args.id = 职位id]
 */

function deleteCompany(args) {
  return ajax.post({
    url: '/manage/company/deleteCompany',
    args,
  });
}

/**
 * 合并合同公司
 * @param  {String} [args.id = 合并到的合同公司id]
 * @param  {String} [args.mergeId = 需要合并的合同公司id]
 */

function mergeCompany(args) {
  return ajax.post({
    url: '/manage/company/mergeCompany',
    args,
  });
}

export default {
  addCompany,
  getCompanyList,
  deleteCompany,
  mergeCompany,
};
