export const permissionObj = {
  // 组织管理('首页'， ‘人员与部门’， ‘汇报关系’, '群组与外协'，’通讯录隔离‘， ’离职交接‘， ’组织信息‘， ’账务‘，’管理员‘，’工具‘， ’其他‘)
  PROJECT_ADMIN: [
    'home',
    'structure', 'approve',
    'reportrelation',
    'groups',
    'contactsHidden',
    'transfer', 'resignlist',
    'sysinfo',
    'rolelist', 'rolelog',
    'announcement',
    'thirdapp',
    'ldap'
  ],
  // 应用管理('应用‘，’工作流‘)
  APK_ADMIN: ['app', 'workflows'],
  // 钉钉
  HAS_DING: ['ding'],
  // 微信集成
  HAS_WORKWX: ['workwxapp'],
  // welink集成
  HAS_WELINK: ['welink'],
  // 飞书集成
  HAS_FEISHU: ['feishu']
}

export const menuList = [
  // 首页
  {
    title: '',
    subMenuList: [
      {
        icon: 'icon-home_page',
        name: _l('首页'),
        key: 'home',
        routes: [
          {
            path: '/admin/home/:projectId',
            component: () => import('./homePage/index.jsx'),
          },
        ],
      },
    ],
  },
  // 人员
  {
    title: _l('人员'),
    subMenuList: [
      {
        icon: 'icon-group',
        name: _l('人员与部门'),
        key: 'structure',
        routes: [
          {
            path: '/admin/structure/(.*)/(create|uncursor|importusers)?',
            component: () => import('./structure'),
          },
          {
            path: '/admin/approve/(.*)',
            component: () => import('./structure'),
          }
        ],
      },
      {
        icon: 'icon-account_tree',
        name: _l('汇报关系'),
        key: 'reportrelation',
        routes: [
          {
            path: '/admin/reportrelation/(.*)',
            component: () => import('./reportRelation'),
          },
        ],
      },
      {
        icon: 'icon-textsms',
        name: _l('群组与外协'),
        key: 'groups',
        routes: [
          {
            path: '/admin/groups/(.*)',
            component: () => import('./groupDept'),
          }
        ],
      },
      {
        icon: 'icon-portrait',
        name: _l('通讯录隔离'),
        key: 'contactsHidden',
        routes: [
          {
            path: '/admin/contactsHidden/:projectId?',
            component: () => import('./contactsHidden'),
          },
        ],
      },
      {
        icon: 'icon-how_to_reg',
        name: _l('离职交接'),
        key: 'transfer',
        menuPath: '/admin/transfer/:projectId',
        routes: [
          {
            path: '/admin/(transfer|resignlist)/:projectId',
            component: () => import('./resignation'),
          },
        ],
      },
    ],
  },
  // 组织
  {
    title: _l('组织'),
    subMenuList: [
      {
        icon: 'icon-business',
        name: _l('组织信息'),
        key: 'sysinfo',
        routes: [
          {
            path: '/admin/sysinfo/(.*)',
            component: () => import('./systemSetting'),
          },
        ],
      },
      {
        icon: 'icon-admin_panel_settings',
        name: _l('权限管理'),
        key: 'rolelist',
        menuPath: '/admin/rolelist/:projectId',
        routes: [
          {
            path: '/admin/(rolelist|rolelog)/:projectId/:roleId?',
            component: () => import('./roleAuth/index'),
          },
        ],
      },
      {
        icon: 'icon-build',
        name: _l('管理工具'),
        key: 'announcement',
        routes: [
          {
            path: '/admin/announcement/(.*)',
            component: () => import('./tools'),
          }
        ],
      }
    ],
  },
  // 应用
  {
    title: _l('应用'),
    subMenuList: [
      {
        icon: 'icon-now_widgets',
        name: _l('应用'),
        key: 'app',
        menuPath: '/admin/app/:projectId',
        routes: [
          {
            path: '/admin/app/:projectId',
            exact: true,
            component: () => import('./appManagement'),
          },
        ],
      },
      {
        icon: 'icon-department',
        name: _l('工作流'),
        key: 'workflows',
        routes: [
          {
            path: '/admin/workflows/:projectId',
            component: () => import('src/pages/workflow/WorkflowList/AdminWorkflowList'),
          },
        ],
      },
    ],
  },
  // 集成
  {
    title: _l('集成'),
    subMenuList: [
      {
        icon: 'icon-wechat_work',
        name: _l('企业微信'),
        key: 'workwxapp',
        routes: [
          {
            path: '/admin/workwxapp/:projectId',
            component: () => import('./workwx/index'),
          },
        ],
      },
      {
        icon: 'icon-dingtalk',
        name: _l('钉钉'),
        key: 'ding',
        routes: [
          {
            path: '/admin/ding/:projectId',
            component: () => import('./ding/index'),
          },
        ],
      },
      {
        icon: 'icon-welink',
        name: _l('Welink'),
        key: 'welink',
        menuPath: '/admin/welink/:projectId',
        routes: [
          {
            path: '/admin/welink/:projectId',
            component: () => import('./welink/index'),
          },
        ],
      },
      {
        icon: 'icon-feishu',
        name: _l('飞书'),
        key: 'feishu',
        menuPath: '/admin/feishu/:projectId',
        routes: [
          {
            path: '/admin/feishu/:projectId',
            component: () => import('./feishu/index'),
          },
        ],
      },
      {
        icon: 'icon-heart_4',
        name: _l('第三方应用'),
        key: 'thirdapp',
        routes: [
          {
            path: '/admin/thirdapp/:projectId',
            component: () => import('./thirdpartyApp'),
          },
        ],
      },
      {
        icon: 'icon-integration_instructions',
        name: _l('其他'),
        key: 'ldap',
        routes: [
          {
            path: '/admin/ldap/:projectId',
            component: () => import('./others'),
          },
        ],
      },
    ],
  },
];
