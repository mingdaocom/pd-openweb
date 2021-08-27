import postEnum from '../constants/postEnum';

export default {
  fromType: postEnum.FROM_TYPE.feed, // fType
  listType: postEnum.LIST_TYPE.project, // lType
  projectId: null,
  groupId: null, // gID
  accountId: null, // aId
  startDate: null,
  endDate: null,
  postType: postEnum.POST_TYPE.all,
  tagId: null,
  catId: null,
  keywords: null, // 搜索参数
  // searchAllKeywords: null, // 左侧搜索框的值，在所有动态中搜索，放到组件状态中
};
