export const ROUTE_CONFIG = {
  appHome: {
    path: '/mobile/appHome',
    component: () => import('src/pages/Mobile/AppHome'),
    title: _l('首页'),
  },
  home: {
    path: '/mobile/app/:appId/:groupId?/:worksheetId?/:viewId?/:isNewApp?',
    component: () => import('src/pages/Mobile/App'),
    title: _l('应用'),
  },
  processMatters: {
    path: '/mobile/processMatters',
    component: () => import('src/pages/Mobile/Process/ProcessMatters'),
    title: _l('流程事项'),
  },
  processInform: {
    path: '/mobile/processInform',
    component: () => import('src/pages/Mobile/Process/ProcessInform'),
    title: _l('流程通知'),
  },
  appBox: {
    path: '/mobile/appBox',
    component: () => import('src/pages/Mobile/AppBox'),
    title: _l('应用库'),
  },
  appBoxList: {
    path: '/mobile/appBoxList/:categoryId',
    component: () => import('src/pages/Mobile/AppBoxList'),
    title: _l('应用库'),
  },
  appBoxInfo: {
    path: '/mobile/appBoxInfo/:libraryId',
    component: () => import('src/pages/Mobile/AppBoxInfo'),
    title: _l('应用库'),
  },
  myHome: {
    path: '/mobile/myHome/',
    component: () => import('src/pages/Mobile/MyHome'),
    title: _l('我'),
  },
  enterprise: {
    path: '/mobile/enterprise',
    component: () => import('src/pages/Mobile/Enterprise'),
    title: _l('组织'),
  },
  iframe: {
    path: '/mobile/iframe/:alias',
    component: () => import('src/pages/Mobile/Iframe'),
  },
  members: {
    path: '/mobile/members/:appId',
    component: () => import('src/pages/Mobile/Members'),
    title: _l('成员管理'),
  },
  membersList: {
    path: '/mobile/membersList/:appId/:roleId',
    component: () => import('src/pages/Mobile/Members/List'),
    title: _l('成员列表'),
  },
  changeRole: {
    path: '/mobile/changeRole/:projectId/:appId/:roleId/:accountId?/:departmentId?',
    component: () => import('src/pages/Mobile/Members/ChangeRole'),
    title: _l('更换角色'),
  },
  applysList: {
    path: '/mobile/applyList/:appId',
    component: () => import('src/pages/Mobile/Members/Apply'),
    title: _l('申请管理'),
  },
  recordList: {
    path: '/mobile/recordList/:appId/:groupId/:worksheetId/:viewId?',
    component: () => import('src/pages/Mobile/RecordList'),
    title: _l('记录'),
  },
  customPage: {
    path: '/mobile/customPage/:appId/:groupId/:worksheetId',
    component: () => import('src/pages/Mobile/CustomPage'),
    title: _l('自定义页面'),
  },
  record: {
    path: '/mobile/record/:appId/:worksheetId/:viewId?/:rowId',
    component: () => import('src/pages/Mobile/Record'),
    title: _l('详情'),
  },
  processRecord: {
    path: '/mobile/processRecord/:instanceId/:workId',
    component: () => import('src/pages/Mobile/ProcessRecord'),
    title: _l('流程详情'),
  },
  addRecord: {
    path: '/mobile/addRecord/:appId/:worksheetId/:viewId',
    component: () => import('src/pages/Mobile/Record/add'),
    title: _l('添加记录'),
  },
  discuss: {
    path: '/mobile/discuss/:appId/:worksheetId/:viewId/:rowId?',
    component: () => import('src/pages/Mobile/Discuss'),
    title: _l('讨论'),
  },
  addDiscuss: {
    path: '/mobile/addDiscuss/:appId/:worksheetId/:viewId/:rowId?/:discussionInfo?',
    component: () => import('src/pages/Mobile/AddDiscuss'),
    title: _l('添加讨论'),
  },
  searchRecord: {
    path: '/mobile/searchRecord/:appId/:worksheetId/:viewId',
    component: () => import('src/pages/Mobile/SearchRecord'),
    title: _l('搜索'),
  }
};
