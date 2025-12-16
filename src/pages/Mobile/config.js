import { addSubPathOfRoutes } from 'src/utils/common';

export const ROUTE_CONFIG = addSubPathOfRoutes(
  {
    appHome: {
      path: '/mobile/dashboard',
      component: () =>
        import(
          /* webpackChunkName: "mobile-home" */
          'mobile/AppHome'
        ),
      title: _l('工作台'),
    },
    appGroupList: {
      path: '/mobile/appGroupList',
      component: () => import('src/pages/Mobile/AppHome/AppGroupList'),
      title: _l('应用分组'),
    },
    groupAppList: {
      path: '/mobile/groupAppList/:groupId/:groupType',
      component: () => import('src/pages/Mobile/AppHome/AppList'),
      title: _l('分组应用列表'),
    },
    home: {
      path: '/mobile/app/:appId/:groupId?/:worksheetId?/:viewId?/:isNewApp?',
      component: () =>
        import(
          /* webpackChunkName: "mobile-app" */
          'mobile/App'
        ),
      title: _l('应用'),
    },
    processMatters: {
      path: '/mobile/processMatters/:tab?',
      component: () => import('mobile/Process/ProcessMatters'),
      title: _l('流程待办'),
    },
    processInform: {
      path: '/mobile/processInform/:tab?',
      component: () => import('mobile/Process/ProcessInform'),
      title: _l('流程通知'),
    },
    appBox: {
      path: '/mobile/appBox',
      component: () => import('mobile/AppBox'),
      title: _l('应用库'),
    },
    myHome: {
      path: '/mobile/myHome/',
      component: () => import('mobile/MyHome'),
      title: _l('我'),
    },
    enterprise: {
      path: '/mobile/enterprise',
      component: () => import('mobile/Enterprise'),
      title: _l('组织'),
    },
    iframe: {
      path: '/mobile/iframe/:alias',
      component: () => import('mobile/Iframe'),
    },
    members: {
      path: '/mobile/members/:appId',
      component: () => import('mobile/Members'),
      title: _l('成员管理'),
    },
    membersList: {
      path: '/mobile/membersList/:appId/:roleId',
      component: () => import('mobile/Members/List'),
      title: _l('成员列表'),
    },
    changeRole: {
      path: '/mobile/changeRole/:projectId/:appId/:roleId/:accountId?/:departmentId?/:departmentTreeId?/:projectOrganizeId?/:jobId?',
      component: () => import('mobile/Members/ChangeRole'),
      title: _l('更换角色'),
    },
    applysList: {
      path: '/mobile/applyList/:appId',
      component: () => import('mobile/Members/Apply'),
      title: _l('申请管理'),
    },
    recordList: {
      path: '/mobile/recordList/:appId/:groupId/:worksheetId/:viewId?',
      component: () => import('mobile/RecordList'),
      title: _l('记录'),
    },
    mobileView: {
      path: '/mobile/mobileView/:appId/:groupId/:worksheetId/:viewId?',
      component: () => import('mobile/RecordList/mobile'),
      title: _l('层级视图'),
    },
    customPage: {
      path: '/mobile/customPage/:appId/:groupId/:worksheetId',
      component: () => import('mobile/CustomPage'),
      title: _l('自定义页面'),
    },
    chatbot: {
      path: '/mobile/chatbot/:appId/:groupId/:chatbotId/:conversationId?',
      component: () => import('mobile/Chatbot'),
      title: _l('对话机器人'),
    },
    record: {
      path: '/mobile/record/:appId/:worksheetId/:viewId?/:rowId/:from?',
      component: () => import('mobile/Record'),
      title: _l('详情'),
    },
    processRecord: {
      path: '/mobile/processRecord/:instanceId/:workId',
      component: () => import('mobile/ProcessRecord'),
      title: _l('流程详情'),
    },
    addRecord: {
      path: '/mobile/addRecord/:appId/:worksheetId/:viewId?',
      component: () => import('mobile/Record/addRecord'),
      title: _l('添加记录'),
    },
    discuss: {
      path: '/mobile/discuss/:appId/:worksheetId/:viewId/:rowId?',
      component: () => import('mobile/Discuss'),
      title: _l('讨论'),
    },
    addDiscuss: {
      path: '/mobile/addDiscuss/:appId/:worksheetId/:viewId/:rowId?/:discussionInfo?',
      component: () => import('mobile/AddDiscuss'),
      title: _l('添加讨论'),
    },
    searchRecord: {
      path: '/mobile/searchRecord/:appId/:worksheetId/:viewId',
      component: () => import('mobile/SearchRecord'),
      title: _l('搜索'),
    },
    recordCollection: {
      path: '/mobile/recordfav/:projectId',
      component: () => import('mobile/RecordCollect'),
      title: _l('记录收藏'),
    },
    appCollection: {
      path: '/mobile/appfav/:projectId',
      component: () => import('mobile/AppCollect'),
      title: _l('应用收藏'),
    },
    collectCharts: {
      path: '/mobile/chartsfav/:projectId',
      component: () => import('mobile/ChartsCollect'),
      title: _l('图表收藏'),
    },
    draftList: {
      path: '/mobile/draft/:appId/:worksheetId',
      component: () => import('src/pages/Mobile/MobileDraft/MobileDraftPage.jsx'),
      title: _l('草稿箱'),
    },
  },
  window.subPath,
);

export const PORTAL = [
  'home',
  'recordList',
  'customPage',
  'chatbot',
  'record',
  'addRecord',
  'searchRecord',
  'groupFilterDetail',
  'addDiscuss',
  'discuss',
  'recordCollection',
  'appCollection',
  'collectCharts',
];
