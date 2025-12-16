export const GLOBAL_SEARCH_TYPE = [
  {
    label: _l('全部'),
    key: 'all',
    prefix: '',
  },
  {
    label: _l('应用'),
    key: 'app',
    prefix: '',
  },
  {
    label: _l('记录'),
    key: 'record',
    prefix: '',
  },
  {
    label: _l('动态'),
    key: 'post',
    prefix: 'post',
  },
  {
    label: _l('任务'),
    key: 'task',
    prefix: 'task',
  },
  {
    label: _l('文件'),
    key: 'kcnode',
    prefix: 'kcnode',
  },
  {
    label: _l('联系人'),
    key: 'user',
    prefix: '',
  },
  {
    label: _l('群组'),
    key: 'group',
    prefix: '',
  },
];

export const USER_LIST_NAME = [
  {
    label: _l('联系人'),
    key: 'fullname',
    idKey: 'accountId',
    searchType: 'user',
  },
  {
    label: _l('聊天/群组'),
    key: 'name',
    idKey: 'groupId',
    searchType: 'group',
  },
];

export const GLOBAL_SEARCH_LIST_SETTING = {
  all: {
    label: _l('全部'),
    key: 'all',
    prefix: '',
  },
  app: {
    label: _l('应用'),
    key: 'app',
    prefix: '',
    listKey: 'applicationId',
  },
  record: {
    label: _l('记录'),
    key: 'record',
    prefix: '',
    listKey: 'recordId',
  },
  post: {
    label: _l('动态'),
    key: 'post',
    prefix: 'post',
    listKey: 'postID',
  },
  task: {
    label: _l('任务'),
    key: 'task',
    prefix: 'task',
    titleKey: 'taskContent',
    descKeys: ['taskUserName', 'taskSummart'],
    listKey: 'taskID',
  },
  kcnode: {
    label: _l('文件'),
    key: 'kcnode',
    prefix: 'kcnode',
    titleKey: 'fileName',
    descKeys: ['position'],
    listKey: 'nodeId',
  },
};

export const NEED_ALL_ORG_TAB = ['user', 'group', 'kcnode', 'task'];

export const SEARCH_APP_SEARCH_TYPE = {
  app: 7,
  record: 8,
  all: 0,
};

export const SEARCH_APP_ITEM_TYPE = [_l('工作表'), _l('自定义页面'), _l('分组'), _l('应用'), _l('对话机器人')];

export const GLOBAL_SEARCH_FEATURE_ID = 25;
