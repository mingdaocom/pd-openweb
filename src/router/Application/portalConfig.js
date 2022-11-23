import { addSubPathOfRoutes } from 'src/util';

export default addSubPathOfRoutes(
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
