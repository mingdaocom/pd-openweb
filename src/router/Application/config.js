import { addSubPathOfRoutes } from 'src/util';

export default addSubPathOfRoutes(
  {
    // 工作流
    workflow: {
      path: '/app/:appId/workflow',
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
      path: '/app/:appId/logs/:projectId',
      component: () => import('src/pages/Admin/logs/AppLog'),
      sensitive: true,
    },

    // 使用分析
    analytics: {
      path: '/app/:appId/analytics/:projectId',
      component: () => import('src/pages/Admin/useAnalytics/components/AppAnalytics'),
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
