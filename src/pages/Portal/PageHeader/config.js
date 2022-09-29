import { addSubPathOfRoutes } from 'src/util';

export const PAGE_HEADER_ROUTE_CONFIG = addSubPathOfRoutes(
  {
    worksheetRecord: {
      path: '/worksheet/:worksheetId/row/:rowId',
      component: () => import('src/pages/PageHeader/PortalAppHeader'),
    },
    worksheet: {
      path: '/worksheet/:worksheetId?',
      component: () => import('src/pages/PageHeader/PortalAppHeader'),
    },
    appPkg: {
      path: '/(app/)?:appId/:groupId?/:worksheetId?/:viewId?',
      component: () => import('src/pages/PageHeader/PortalAppHeader'),
    },
    app: {
      path: '/(app/)?',
      isExact: true,
      component: () => import('src/pages/PageHeader/PortalAppHeader'),
    },
    mobile: {
      path: '/mobile/app/?',
      component: () => import('src/pages/PageHeader/PortalAppHeader'),
    },
  },
  window.subPath,
);
