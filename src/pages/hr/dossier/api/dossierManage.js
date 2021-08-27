import ajax from './ajax';

/**
 * 添加/修改材料附件类型
 * @param  {String} [args.name = 材料附件类型名称]
 * @param  {String} [args.id = 编辑名称时需要]
 */
function addAttachmentType(args) {
  return ajax.post({
    url: '/manage/dossier/attachmentType/add',
    args,
  });
}

/**
 * 获取材料附件类型
 * @param args
 * @returns {
"false": [{ //不是预置的
"id": "59a7b3fe6d12f953f4878929",
"companyId": "c4c197af-2d49-4c6e-9eae-c197e361b743",
"name": "在校证明",
"system": false
}],
"true": [{ //系统预置的
"id": "59a7b3fe6d12f953f4878929",
"companyId": "c4c197af-2d49-4c6e-9eae-c197e361b743",
"name": "在校证明",
"system": true
}]
}
 */
function getAttachmentType(args) {
  return ajax.get({
    url: '/manage/dossier/attachmentType/get',
    args,
  });
}

/**
 * 获取工作地列表
 * @param  {Integer} [args.pageIndex = ]
 * @param  {Integer} [args.pageSize = ]
 * @param  {String} [args.keyword = 关键字搜索]
 */
function getWorkSiteList(args) {
  return ajax.get({
    url: '/manage/workSite/getWorkSiteList',
    args,
  });
}

export default {
  addAttachmentType,
  getAttachmentType,
  getWorkSiteList,
};
