import { VersionProductType } from 'src/util/enum.js';

export const permissionObj = {
  // 组织管理('首页'， ‘成员与部门’，'组织角色', ‘汇报关系’, '群组与外协'，’通讯录隔离‘， ’离职交接‘， ’组织信息‘， ’账务‘，’管理员‘，’工具‘， ’其他‘)
  PROJECT_ADMIN: [
    'home',
    'upgradeservice',
    'waitingpay',
    'expansionservice',
    'structure',
    'roles',
    'reportrelation',
    'groups',
    'portal',
    'resignlist',
    'sysinfo',
    'billinfo',
    'valueaddservice',
    'sysroles',
    'integrationothers',
    'weixin',
    'loginlog',
    'security',
    'orgothers',
    'orglog',
    'platformintegration',
    'thirdapp',
    'account',
    'data',
    'securityOthers',
  ],
  // 有角色（显示管理员菜单）
  SHOW_MANAGER: ['sysroles'],
  // 应用管理('应用‘，’工作流‘，‘使用分析’)
  APK_ADMIN: [
    'app',
    'workflows',
    'analytics',
    'computing',
    'variables',
    'applog',
    'database',
    'settings',
    'aggregationTable',
  ],
};

export const menuList = [
  {
    title: '',
    key: 'home',
    subMenuList: [
      {
        name: _l('首页'),
        icon: 'icon-home1',
        key: 'home',
        routes: [
          {
            path: '/admin/home/:projectId',
            component: () => import('./homePage/index.jsx'),
          },
          {
            path: '/admin/upgradeservice/:projectId/:vertionType?',
            component: () => import('./organization/billCenter/upgradeService'),
          },
          {
            path: '/admin/waitingpay/(.*)/(.*)',
            component: () => import('./organization/billCenter/waitingPay'),
          },
          {
            path: '/admin/expansionservice/(.*)/(user|storage|workflow|storage|dataSync|app)+',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
    ],
  },
  {
    title: _l('用户'),
    key: 'user',
    icon: 'icon-group',
    subMenuList: [
      {
        name: _l('成员与部门'),
        key: 'structure',
        routes: [
          {
            path: '/admin/structure/(.*)/(create|uncursor|importusers)?',
            component: () => import('./user/membersDepartments'),
          },
          {
            path: '/admin/expansionserviceResign/(.*)',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
      {
        name: _l('角色'),
        key: 'roles',
        routes: [
          {
            path: '/admin/roles/:projectId',
            component: () => import('./user/roleManage'),
          },
        ],
      },
      {
        name: _l('汇报关系'),
        key: 'reportrelation',
        routes: [
          {
            path: '/admin/reportrelation/(.*)',
            component: () => import('./user/reportRelation'),
          },
        ],
      },
      {
        name: _l('群组'),
        key: 'groups',
        routes: [
          {
            path: '/admin/groups/(.*)',
            component: () => import('./user/groupDept/index.jsx'),
          },
        ],
      },
      {
        name: _l('外部用户'),
        key: 'portal',
        menuPath: '/admin/portal/:projectId',
        routes: [
          {
            path: '/admin/portal/:projectId',
            exact: true,
            component: () => import('./user/portal'),
          },
          {
            path: '/admin/expansionservice/(.*)/(portaluser|portalupgrade)+',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
    ],
  },
  {
    title: _l('组织'),
    key: 'organization',
    icon: 'icon-business',
    subMenuList: [
      {
        name: _l('基础信息'),
        key: 'sysinfo',
        routes: [
          {
            path: '/admin/sysinfo/(.*)',
            component: () => import('./organization/systemSetting'),
          },
        ],
      },
      {
        name: _l('账务'),
        key: 'billinfo',
        routes: [
          {
            path: '/admin/billinfo/(.*)',
            component: () => import('./organization/billCenter/billInfo'),
          },
          {
            path: '/admin/valueaddservice/(.*)',
            component: () => import('./organization/billCenter/valueAddService'),
          },
        ],
      },
      {
        name: _l('管理员'),
        key: 'sysroles',
        menuPath: '/admin/sysroles/:projectId',
        routes: [
          {
            path: '/admin/(sysroles)/:projectId/:roleId?',
            component: () => import('./organization/roleAuth'),
          },
        ],
      },
      {
        name: _l('其他'),
        key: 'orgothers',
        routes: [
          {
            path: '/admin/orgothers/:projectId',
            component: () => import('./organization/orgothers'),
          },
        ],
      },
    ],
  },
  {
    title: _l('应用'),
    key: 'apps',
    icon: 'icon-now_widgets',
    subMenuList: [
      {
        name: _l('应用管理'),
        key: 'app',
        menuPath: '/admin/app/:projectId',
        routes: [
          {
            path: '/admin/app/:projectId',
            exact: true,
            component: () => import('./app/appManagement'),
          },
        ],
      },
      {
        name: _l('工作流'),
        key: 'workflows',
        routes: [
          {
            path: '/admin/workflows/:projectId',
            component: () => import('src/pages/workflow/WorkflowList/AdminWorkflowList'),
          },
          {
            path: '/admin/expansionserviceWorkflow/(.*)',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
      {
        name: _l('聚合表'),
        key: 'aggregationTable',
        featureId: VersionProductType.aggregation,
        routes: [
          {
            path: '/admin/aggregationtable/:projectId',
            component: () => import('./app/aggregationTable'),
          },
          {
            path: '/admin/exaggregationtable/(.*)',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
      {
        name: _l('全局变量'),
        key: 'variables',
        featureId: VersionProductType.globalVariable,
        routes: [
          {
            path: '/admin/variables/:projectId',
            exact: true,
            component: () => import('./app/globalVariable/index.jsx'),
          },
        ],
      },
      {
        name: _l('专属资源'),
        featureIds: [30, 36],
        key: 'computing',
        hasBeta: false,
        routes: [
          {
            path: '/admin/computing/:projectId/:explanId?',
            component: () => import('./app/exclusiveComp/index.jsx'),
          },
          {
            path: '/admin/database/:projectId/:explanId?',
            component: () => import('./app/exclusiveComp/index.jsx'),
          },
          {
            path: '/admin/expansionserviceComputing/(.*)',
            component: () => import('./organization/billCenter/expansionService'),
          },
        ],
      },
      {
        name: _l('使用分析%15003'),
        featureId: 17,
        key: 'analytics',
        routes: [
          {
            path: '/admin/analytics/:projectId',
            component: () => import('./app/useAnalytics/index.js'),
          },
        ],
      },
      {
        name: _l('通用设置'),
        key: 'settings',
        routes: [
          {
            path: '/admin/settings/:projectId',
            component: () => import('./settings'),
          },
        ],
      },
    ],
  },
  {
    title: _l('安全'),
    key: 'security',
    icon: 'icon-security',
    subMenuList: [
      {
        name: _l('帐号'),
        key: 'account',
        routes: [
          {
            path: '/admin/account/:projectId',
            component: () => import('./security/account'),
          },
        ],
      },
      {
        name: _l('数据'),
        key: 'data',
        routes: [
          {
            path: '/admin/data/:projectId',
            exact: true,
            component: () => import('./security/data'),
          },
        ],
      },
      {
        name: _l('其他'),
        key: 'securityOthers',
        routes: [
          {
            path: '/admin/securityothers/:projectId',
            exact: true,
            component: () => import('./security/securityOthers'),
          },
        ],
      },
    ],
  },
  {
    title: _l('日志'),
    key: 'wysiwyg',
    icon: 'icon-wysiwyg',
    subMenuList: [
      {
        name: _l('应用'),
        featureId: 31,
        key: 'applog',
        menuPath: '/admin/applog/:projectId',
        routes: [
          {
            path: '/admin/applog/:projectId',
            exact: true,
            component: () => import('./logs/AppLog'),
          },
        ],
      },
      {
        name: _l('登录'),
        key: 'loginlog',
        menuPath: '/admin/loginlog/:projectId',
        routes: [
          {
            path: '/admin/loginlog/:projectId',
            exact: true,
            component: () => import('./logs/LoginLog'),
          },
        ],
      },
      {
        name: _l('组织管理'),
        key: 'orglog',
        menuPath: '/admin/orglog/:projectId',
        routes: [
          {
            path: '/admin/orglog/:projectId',
            exact: true,
            component: () => import('./logs/orgLog'),
          },
        ],
      },
    ],
  },
  {
    title: _l('集成'),
    key: 'integration',
    icon: 'icon-device_hub',
    subMenuList: [
      {
        name: _l('第三方平台集成'),
        key: 'platformintegration',
        menuPath: '/admin/platformintegration/:projectId(.*)',
        routes: [
          {
            path: '/admin/platformintegration/:projectId',
            component: () => import('./integration/platformIntegration'),
          },
        ],
      },
      {
        name: _l('微信公众号'),
        key: 'weixin',
        menuPath: '/admin/weixin/:projectId(.*)',
        routes: [
          {
            path: '/admin/weixin/:projectId',
            component: () => import('./integration/weixin'),
          },
        ],
      },
      {
        name: _l('第三方应用'),
        key: 'thirdapp',
        routes: [
          {
            path: '/admin/thirdapp/:projectId',
            component: () => import('./integration/thirdpartyApp'),
          },
        ],
      },
      {
        name: _l('其他'),
        key: 'integrationothers',
        routes: [
          {
            path: '/admin/integrationothers/:projectId',
            component: () => import('./integration/others'),
          },
        ],
      },
    ],
  },
];
