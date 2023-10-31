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
    'approve',
    'reportrelation',
    'groups',
    'portal',
    'contactsHidden',
    'transfer',
    'resignlist',
    'sysinfo',
    'billinfo',
    'valueaddservice',
    'sysroles',
    'rolelog',
    'systools',
    'settings',
    'integration_others',
    'weixin',
    'thirdapp',
    'appLog',
    'loginLog',
  ],
  // 应用管理('应用‘，’工作流‘，‘使用分析’)
  APK_ADMIN: ['app', 'workflows', 'analytics', 'computing', 'variables', 'appLog'],
  // 钉钉
  HAS_DING: ['ding'],
  // 微信集成
  HAS_WORKWX: ['workwxapp'],
  // welink集成
  HAS_WELINK: ['welink'],
  // 飞书集成
  HAS_FEISHU: ['feishu'],
};

export const menuList = [
  // 首页
  {
    title: '',
    subMenuList: [
      {
        icon: 'icon-company',
        name: _l('基本信息'),
        key: 'home',
        routes: [
          {
            path: '/admin/home/:projectId',
            component: () => import('./homePage/index.jsx'),
          },
          {
            path: '/admin/upgradeservice/:projectId/:vertionType?',
            component: () => import('./billCenter/upgradeService'),
          },
          {
            path: '/admin/waitingpay/(.*)/(.*)',
            component: () => import('./billCenter/waitingPay'),
          },
          {
            path: '/admin/expansionservice/(.*)',
            component: () => import('./billCenter/expansionService'),
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
        name: _l('成员与部门'),
        key: 'structure',
        routes: [
          {
            path: '/admin/structure/(.*)/(create|uncursor|importusers|isShowSetting)?',
            component: () => import('./structure'),
          },
          {
            path: '/admin/approve/(.*)',
            component: () => import('./structure'),
          },
        ],
      },
      {
        icon: 'icon-user',
        name: _l('组织角色'),
        key: 'roles',
        routes: [
          {
            path: '/admin/roles/:projectId',
            component: () => import('./roleManage'),
          },
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
          },
        ],
      },
      {
        icon: 'icon-external_users_01',
        name: _l('外部门户'),
        key: 'portal',
        menuPath: '/admin/portal/:projectId',
        routes: [
          {
            path: '/admin/portal/:projectId',
            exact: true,
            component: () => import('./portal'),
          },
          {
            path: '/admin/expansionservicePotal/(.*)',
            component: () => import('./billCenter/expansionService'),
          },
        ],
      },
      {
        icon: 'icon-person_off_a',
        name: _l('通讯录隔离'),
        featureId: 6,
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
          {
            path: '/admin/expansionserviceResign/(.*)',
            component: () => import('./billCenter/expansionService'),
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
        icon: 'icon-draft-box',
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
        icon: 'icon-account_balance_wallet',
        name: _l('账务'),
        key: 'billinfo',
        routes: [
          {
            path: '/admin/billinfo/(.*)',
            component: () => import('./billCenter/billInfo'),
          },
          {
            path: '/admin/valueaddservice/(.*)',
            component: () => import('./billCenter/valueAddService'),
          },
        ],
      },
      {
        icon: 'icon-admin_panel_settings',
        name: _l('管理员'),
        key: 'sysroles',
        menuPath: '/admin/sysroles/:projectId',
        routes: [
          {
            path: '/admin/(sysroles|rolelog)/:projectId/:roleId?',
            component: () => import('./roleAuth/index'),
          },
        ],
      },
      {
        icon: 'icon-build',
        name: _l('管理工具'),
        key: 'systools',
        routes: [
          {
            path: '/admin/systools/(.*)',
            component: () => import('./tools'),
          },
        ],
      },
      {
        icon: 'icon-table_rows',
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
        icon: 'icon-workflow',
        name: _l('工作流'),
        key: 'workflows',
        routes: [
          {
            path: '/admin/workflows/:projectId',
            component: () => import('src/pages/workflow/WorkflowList/AdminWorkflowList'),
          },
          {
            path: '/admin/expansionserviceWorkflow/(.*)',
            component: () => import('./billCenter/expansionService'),
          },
        ],
      },
      {
        icon: 'icon-poll',
        name: _l('使用分析'),
        featureId: 17,
        key: 'analytics',
        routes: [
          {
            path: '/admin/analytics/:projectId',
            component: () => import('./useAnalytics'),
          },
        ],
      },
      {
        icon: 'icon-global_variable',
        name: _l('全局变量'),
        key: 'variables',
        isNew: true,
        featureId: VersionProductType.globalVariable,
        routes: [
          {
            path: '/admin/variables/:projectId',
            exact: true,
            component: () => import('./globalVariable'),
          },
        ],
      },
      {
        icon: 'icon-dns1',
        name: _l('专属算力'),
        featureId: 30,
        key: 'computing',
        hasBeta: false,
        routes: [
          {
            path: '/admin/computing/:projectId/:explanId?',
            component: () => import('./exclusiveComp'),
          },
          {
            path: '/admin/expansionserviceComputing/(.*)',
            component: () => import('./billCenter/expansionService'),
          },
        ],
      },
    ],
  },
  // 日志
  {
    title: _l('日志'),
    subMenuList: [
      {
        icon: 'icon-wysiwyg',
        name: _l('应用'),
        featureId: 31,
        key: 'appLog',
        menuPath: '/admin/appLog/:projectId',
        routes: [
          {
            path: '/admin/appLog/:projectId',
            exact: true,
            component: () => import('./logs/AppLog'),
          },
        ],
      },
      {
        icon: 'icon-user_Review',
        name: _l('登录'),
        key: 'loginLog',
        menuPath: '/admin/loginLog/:projectId',
        routes: [
          {
            path: '/admin/loginLog/:projectId',
            exact: true,
            component: () => import('./logs/LoginLog'),
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
        featureId: 19,
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
        featureId: 10,
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
        featureId: 18,
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
        featureId: 12,
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
        icon: 'icon-wechat',
        name: _l('微信公众号'),
        key: 'weixin',
        menuPath: '/admin/weixin/:projectId(.*)',
        routes: [
          {
            path: '/admin/weixin/:projectId',
            component: () => import('./weixin/index'),
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
        key: 'integration_others',
        routes: [
          {
            path: '/admin/integration_others/:projectId',
            component: () => import('./others'),
          },
        ],
      },
    ],
  },
];
