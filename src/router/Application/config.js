import { addSubPathOfRoutes } from 'src/util';

export const ROUTE_CONFIG = addSubPathOfRoutes(
  {
    // 工作流
    workflow: {
      path: '/app/:appId/workflow/:worksheetId?',
      component: () => import('pages/workflow/WorkflowList/AppWorkflowList'),
      sensitive: true,
    },

    // 权限
    role: {
      path: '/app/:appId/role/:editType?/:listType?',
      component: () => import('pages/Role'),
      sensitive: true,
    },

    //外部门户个人详情
    portaluser: {
      path: '/app/:appId/portaluser/:id?',
      component: () => import('pages/Role/PortalCon/portalUser'),
      sensitive: true,
      title: _l('用户审核'),
    },

    // 日志
    appLogs: {
      path: '/app/:appId/logs/:projectId/:worksheetId?',
      component: () => import('src/pages/Admin/logs/AppLog'),
      sensitive: true,
    },

    // 使用分析
    analytics: {
      path: '/app/:appId/analytics/:projectId',
      component: () => import('src/pages/Admin/app/useAnalytics/components/AppAnalytics'),
      sensitive: true,
    },

    appAggregationSettings: {
      path: '/app/:appId/settings/aggregation/:aggTableId',
      component: () => import('src/pages/AppSettings/components/Aggregation/aggEdit'),
    },

    // 应用管理配置页
    appSettings: {
      path: '/app/:appId/settings/:navTab?',
      component: () => import('src/pages/AppSettings'),
      sensitive: true,
    },

    // 应用管理
    appPkg: {
      path: '/app/:appId/:groupId?/:worksheetId?/:viewId?',
      component: () => import('src/pages/worksheet/WorkSheet'),
      sensitive: true,
    },
  },
  window.subPath,
);

export const PORTAL_ROUTE_CONFIG = addSubPathOfRoutes(
  {
    // 工作流
    workflow: {
      path: '/(app/)?:appId/workflow',
      component: () => import('pages/workflow/WorkflowList/AppWorkflowList'),
      sensitive: true,
    },

    // 权限
    role: {
      path: '/(app/)?:appId/role/:editType?/:listType?',
      component: () => import('pages/Role'),
      sensitive: true,
    },

    // 应用管理
    appPkg: {
      path: '/(app/)?:appId/:groupId?/:worksheetId?/:viewId?',
      component: () => import('src/pages/worksheet/WorkSheet'),
      sensitive: true,
    },
  },
  window.subPath,
);
