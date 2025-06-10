import { addSubPathOfRoutes } from 'src/utils/common';

export const PAGE_HEADER_ROUTE_CONFIG = addSubPathOfRoutes(
  {
    worksheetRecord: {
      path: '/worksheet/:worksheetId/row/:rowId',
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
    worksheetWithView: {
      path: '/worksheet/:worksheetId/view/:viewId',
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
    worksheet: {
      path: '/worksheet/:worksheetId?',
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
    appPkg: {
      path: '/(app/)?:appId/:groupId?/:worksheetId?/:viewId?',
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
    app: {
      path: '/(app/)?',
      isExact: true,
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
    mobile: {
      path: '/mobile/app/?',
      component: () => import('src/pages/PageHeader/AppPkgHeader'),
    },
  },
  window.subPath,
);
