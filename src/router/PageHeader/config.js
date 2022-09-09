export const PAGE_HEADER_ROUTE_CONFIG = {
  my: {
    path: '/app/my/(group)?/:projectId?/:groupType?/:groupId?',
    component: () => import('src/pages/PageHeader/AppCenterHeader'),
  },
  lib: {
    path: '/app/lib',
    component: () => import('src/pages/PageHeader/AppCenterHeader'),
  },
  appPkg: {
    path: '/app/:appId/:groupId?/:worksheetId?/:viewId?',
    component: () => import('src/pages/PageHeader/AppPkgHeader'),
  },
  worksheetRecord: {
    path: '/worksheet/:worksheetId/row/:rowId',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  worksheetWithView: {
    path: '/worksheet/:worksheetId/view/:viewId',
    component: () => import('src/pages/PageHeader/AppPkgHeader'),
  },
  worksheet: {
    path: '/worksheet/:worksheetId?',
    component: () => import('src/pages/PageHeader/AppPkgHeader'),
  },
  feed: {
    path: '/feed',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  feeddetail: {
    path: '/feeddetail',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  user: {
    path: ['user', '/user_:userId?'],
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  group: {
    path: '/group/groupValidate',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  task: {
    path: '/apps/task',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  calendar: {
    path: '/apps/calendar',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  kc: {
    path: '/apps/kc',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  hr: {
    path: '/src/pages/hr',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  hrPage: {
    path: '/hr',
    component: () => import('src/pages/PageHeader/NativeHeader'),
  },
  personal: {
    path: '/personal',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  privateDeployment: {
    path: '/privateDeployment/:routeType?',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  appInstallSetting: {
    path: '/appInstallSetting',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  admin: {
    path: '/admin/:roleType/:projectId',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  dingAppCourse: {
    path: '/dingAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/PageHeader/AppNameHeader'),
  },
  dingSyncCourse: {
    path: '/dingSyncCourse/:projectId?',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  wxappSyncCourse: {
    path: '/wxappSyncCourse/:projectId?',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  welinkSyncCourse: {
    path: '/welinkSyncCourse/:projectId?',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  feishuSyncCourse: {
    path: '/feishuSyncCourse/:projectId?',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  weixinAppCourse: {
    path: '/weixinAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/PageHeader/AppNameHeader'),
  },
  search: {
    path: '/search',
    component: () => import('src/pages/PageHeader/NetManageHeader'),
  },
  integration: {
    path: '/integration',
    component: () => import('src/pages/PageHeader/HubHeader'),
  },
  app: {
    path: '/app/?',
    isExact: true,
    component: () => import('src/pages/PageHeader/AppCenterHeader'),
  },
};
