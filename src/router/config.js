export const ROUTE_CONFIG = {
  chatWindow: {
    path: '/chat_window',
    component: () => import('src/pages/chat/detail'),
  },

  groupValidate: {
    path: '/group/groupValidate',
    component: () => import('src/pages/Group/index'),
    title: _l('群组资料'),
  },

  // 动态
  feed: {
    path: '/feed',
    component: () => import('src/pages/feed'),
    title: _l('动态'),
  },
  feedDetail: {
    path: '/feeddetail',
    component: () => import('src/pages/feed/detail'),
    title: _l('动态详情'),
  },

  // 任务
  taskDetail: {
    path: '/apps/task/task_:id',
    component: () => import('src/pages/task/detail'),
    title: _l('任务详情'),
  },
  task: {
    path: '/apps/(task|taskcenter)',
    component: () => import('src/pages/task'),
    title: _l('任务'),
  },

  // 日程
  calendar: {
    path: '/apps/calendar/home',
    component: () => import('src/pages/calendar'),
    title: _l('日程'),
  },
  calendarDetail: {
    path: '/apps/calendar/detail_:id',
    component: () => import('src/pages/calendar/detail'),
    title: _l('日程详情'),
  },

  // 知识
  kc: {
    path: '/apps/kc/:path*',
    component: () => import('src/pages/kc'),
    title: _l('知识'),
  },
  kcUpload: {
    path: '/apps/kcupload',
    component: () => import('src/pages/kc/upload'),
    title: _l('文件上传'),
  },
  kcShare: {
    path: '/apps/kcshare',
    component: () => import('src/pages/kc/share'),
    title: _l('知识'),
  },

  // 工作表
  newRecord: {
    path: '/app/:appId/newrecord/:worksheetId/:viewId/',
    component: () => import('src/pages/NewRecord'),
  },

  // 工作表
  worksheetDetail: {
    path: '/app/:appId/:worksheetId/:viewId/row/:rowId',
    component: () => import('src/pages/worksheet/pages/WorksheetRowLand'),
  },
  // 工作表
  worksheetDetailNoView: {
    path: '/app/:appId/:worksheetId/row/:rowId',
    component: () => import('src/pages/worksheet/pages/WorksheetRowLand'),
  },
  worksheetDetailOld: {
    path: '/worksheet/:worksheetId/row/:rowId',
    component: () => import('src/pages/worksheet/pages/WorksheetRowLand'),
  },
  workflowRecordLand: {
    path: '/app/:appId/workflowdetail/record/:id/:workId',
    component: () => import('src/pages/worksheet/pages/WorkflowRecordLand'),
  },
  worksheetCustomFiled: {
    path: '/worksheet/field/edit',
    component: () => import('src/pages/widgetConfig'),
  },
  publicWorksheetPreview: {
    path: '/worksheet/form/preview/:worksheetId',
    component: () => import('src/pages/PublicWorksheetPreview'),
  },
  publicWorksheetConfig: {
    path: '/worksheet/form/edit/:worksheetId/:type?',
    component: () => import('src/pages/publicWorksheetConfig'),
  },
  formSet: {
    path: '/worksheet/formSet/edit/:worksheetId/:type?',
    component: () => import('src/pages/FormSet'),
  },
  printForm: {
    path: '/printForm/:appId/:printType/:type/:from/:key?',
    component: () => import('src/pages/Print'),
  },
  printPivotTable: {
    path: '/printPivotTable/:reportId/:themeColor?',
    component: () => import('src/pages/Statistics/PrintPivotTable'),
  },
  uploadTemplateSheet: {
    path: '/worksheet/uploadTemplateSheet/:worksheetId?',
    component: () => import('src/pages/UploadTemplateSheet'),
  },
  worksheet: {
    path: '/worksheet/:worksheetId',
    component: () => import('./Application'),
  },

  personal: {
    path: '/personal',
    component: () => import('src/pages/Personal'),
    title: _l('个人账户'),
  },
  appInstallSetting: {
    path: '/appInstallSetting',
    component: () => import('src/pages/appInstallSetting'),
    title: _l('App下载与设置'),
  },
  user: {
    path: ['/user', '/user_:id'],
    component: () => import('src/pages/UserProfile'),
    title: _l('个人资料'),
  },
  search: {
    path: '/search',
    component: () => import('src/pages/globalSearch'),
    title: _l('超级搜索'),
  },
  admin: {
    path: '/admin/:routeType/:projectId',
    component: () => import('src/pages/Admin'),
    title: _l('组织管理'),
  },
  dingSyncCourse: {
    path: '/dingSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('获取对接信息'),
  },
  wxappSyncCourse: {
    path: '/wxappSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/workwx/workwxSyncCourse/workwxSyncCourse'),
    title: _l('获取对接信息'),
  },
  welinkSyncCourse: {
    path: '/welinkSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/welink/welinkSyncCourse/welinkSyncCourse'),
    title: _l('获取对接信息'),
  },
  feishuSyncCourse: {
    path: '/feishuSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/feishu/feishuSyncCourse/feishuSyncCourse'),
    title: _l('获取对接信息'),
  },
  dingAppCourse: {
    path: '/dingAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('如何添加到钉钉工作台'),
  },
  weixinAppCourse: {
    path: '/weixinAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/Admin/integration/platformIntegration/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('如何添加到企业微信'),
  },
  print: {
    path: '/print/:printType/:typeId',
    component: () => import('src/components/print'),
  },
  workflowEdit: {
    path: '/workflowedit/:flowId/:type?/:operator?/:operatorId?',
    component: () => import('src/pages/workflow/WorkflowSettings'),
  },
  workflowPlugin: {
    path: '/workflowplugin/:flowId/:type?/:operator?/:operatorId?',
    component: () => import('src/pages/workflow/WorkflowSettings'),
  },
  checkSheet: {
    path: '/workflow/checksheet/:processId/:currentNodeId/:selectNodeId',
    component: () => import('src/pages/workflow/WorkflowSettings/WebHookCheatSheet'),
    title: _l('字段对照表'),
  },
  myProcess: {
    path: '/myprocess/:type?/:secondType?',
    component: () => import('src/pages/workflow/MyProcess'),
    title: _l('流程待办'),
  },
  gunterExport: {
    path: '/app/:appId/:worksheetId/:viewId/gunterExport',
    component: () => import('src/pages/worksheet/views/GunterView/components/GunterExport'),
    title: _l('正在导出，请稍候...'),
  },
  home: {
    path: ['/dashboard', '/app/my/(group|owned)?/:projectId?/:groupType?/:groupId?', '/favorite', '/app/lib/'],
    component: () => import('src/pages/AppHomepage/AppCenter'),
  },
  aggregationInfo: {
    path: '/aggregation/:id?',
    component: () => import('src/pages/AppSettings/components/Aggregation/components/PreviewData'),
    title: _l('聚合表'),
  },
  app: {
    path: '/app/:appId',
    component: () => import('./Application'),
    title: _l('应用'),
  },
  view: {
    path: '/demo',
    component: () => import('src/pages/Demos'),
    title: _l('应用'),
  },
  integrationTask: {
    path: '/integration/taskCon/:id/:type?',
    component: () => import('src/pages/integration/dataIntegration/TaskCon'),
    title: _l('集成'),
  },
  integrationSource: {
    path: '/integration/sourceDetail/:sourceId/:type?',
    component: () => import('src/pages/integration/dataIntegration/source/components/AddOrEditSource'),
    title: _l('集成'),
  },
  integration: {
    path: '/integration/:type?/:listType?',
    component: () => import('src/pages/integration'),
    title: _l('集成'),
  },
  integrationConnect: {
    path: '/integrationConnect/:id?/:tab?',
    component: () => import('src/pages/integration/apiIntegration/ConnectWrap'),
    title: _l('集成'),
  },
  integrationApi: {
    path: '/integrationApi/:apiId?',
    component: () => import('src/pages/integration/integrationApi'),
    title: _l('集成'),
  },
  dataMirrorPreview: {
    path: '/dataMirrorPreview/:id?',
    component: () => import('src/pages/integration/dataIntegration/dataMirror/Preview'),
    title: _l('工作表数据镜像'),
  },
  stats: {
    path: '/stats/:id?',
    component: () => import('src/pages/integration/dataIntegration/stats'),
    title: _l('统计'),
  },
  plugin: {
    path: '/plugin/:type?',
    component: () => import('src/pages/plugin'),
    title: _l('插件'),
  },
  // 微信支付
  wechatPay: {
    path: '/wechatPay/:projectId/:orderId',
    component: () => import('src/components/pay/wechatPay'),
    title: _l('微信支付'),
  },
  certification: {
    path: '/certification/:certSource/:projectId?',
    component: () => import('src/pages/certification'),
    title: _l('认证'),
  },
  certificationDetail: {
    path: '/certificationDetail/:certSource/:projectId?',
    component: () => import('src/pages/certification/CertificationDetail'),
    title: _l('我的认证'),
  },
  default: {
    path: '/app',
    redirect: '/dashboard',
  },
};

const withoutHeaderPathList = [
  'demo',
  'apps/kcupload',
  'apps/kcshare',
  'apps/kc/shareFolder',
  'apps/task/print',
  'apps/kc/shareFolder',
  'worksheet/worksheetshare',
  'worksheet/public/query',
  'printForm',
  'print',
  'workflow',
  'workflowEdit',
  'workflow/checksheet',
  'worksheet/field/edit',
  'worksheet/form/edit',
  'worksheet/form/preview',
  'worksheet/formSet',
  'mobile',
  'worksheet/uploadTemplateSheet',
  'gunterExport',
  'integrationConnect',
  'role',
  'portaluser',
  'aggregation',
  'dataMirrorPreview',
];
const withoutChatPathList = [
  'demo',
  'apps/kcupload',
  'apps/kcshare',
  'apps/kc/shareFolder',
  'apps/task/print',
  'apps/kc/shareFolder',
  'worksheet/form/preview',
  'worksheet/worksheetshare',
  'worksheet/public/query',
  'printForm',
  'print',
  'printPivotTable',
  'workflow/checksheet',
  'dingSyncCourse',
  'wxappSyncCourse',
  'welinkSyncCourse',
  'feishuSyncCourse',
  'dingAppCourse',
  'weixinAppCourse',
  'mobile',
  'worksheet/uploadTemplateSheet',
  'gunterExport',
  'land',
  'integrationConnect',
  'integrationApi',
  'portaluser',
  'wechatPay',
  'orderpay',
  'aggregation',
  'dataMirrorPreview',
  'certification',
  'certificationDetail',
  'app/lib',
];
export const withoutHeaderUrl = `/(.*)(${withoutHeaderPathList.join('|')})`;
export const withoutChatUrl = `/(.*)(${withoutChatPathList.join('|')})`;
