export const ROUTE_CONFIG = {
  chat: {
    path: '/chat',
    redirect: '/app',
  },

  chatWindow: {
    path: '/chat_window',
    component: () => import('src/pages/chat/detail'),
  },

  groupValidate: {
    path: '/group/groupValidate',
    component: () => import('src/components/group/groupValidate/GroupValidateComponent'),
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
  taskCustomTemplate: {
    path: '/apps/task/customTemplate/:tempId?',
    component: () => import('src/pages/task/customTemplate'),
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
  recordFile: {
    path: '/land/record/file',
    component: () => import('src/pages/kc/share'),
    title: _l('记录附件'),
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
  viewDetail: {
    path: '/embed/view/:appId/:worksheetId/:viewId',
    component: () => import('src/pages/ViewLand'),
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
    path: '/worksheet/form/edit/:worksheetId',
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
  privateDeployment: {
    path: '/privateDeployment/:routeType?',
    component: () => import('src/pages/NewPrivateDeployment'),
    title: _l('系统配置'),
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
    component: () => import('src/pages/SmartSearch'),
    title: _l('智能搜索'),
  },
  admin: {
    path: '/admin/:routeType/:projectId',
    component: () => import('src/pages/Admin'),
    title: _l('组织管理'),
  },
  dingSyncCourse: {
    path: '/dingSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('获取对接信息'),
  },
  wxappSyncCourse: {
    path: '/wxappSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/workwx/workwxSyncCourse/workwxSyncCourse'),
    title: _l('获取对接信息'),
  },
  welinkSyncCourse: {
    path: '/welinkSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/welink/welinkSyncCourse/welinkSyncCourse'),
    title: _l('获取对接信息'),
  },
  feishuSyncCourse: {
    path: '/feishuSyncCourse/:projectId?',
    component: () => import('src/pages/Admin/feishu/feishuSyncCourse/feishuSyncCourse'),
    title: _l('获取对接信息'),
  },
  dingAppCourse: {
    path: '/dingAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/Admin/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('如何添加到钉钉工作台'),
  },
  weixinAppCourse: {
    path: '/weixinAppCourse/:projectId?/:apkId?',
    component: () => import('src/pages/Admin/ding/dingSyncCourse/dingSyncCourse'),
    title: _l('如何添加到企业微信'),
  },
  print: {
    path: '/print/:printType/:typeId',
    component: () => import('src/components/print'),
  },
  workflowEdit: {
    path: '/workflowedit/:flowId/:type?/:actionId?',
    component: () => import('src/pages/workflow/WorkflowSettings'),
    title: _l('编辑工作流'),
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
  my: {
    path: '/app/my/(group)?/:projectId?/:groupType?/:groupId?',
    component: () => import('src/pages/AppHomepage/AppCenter'),
    title: _l('我的应用'),
  },
  lib: {
    path: '/app/lib/',
    component: () => import('src/pages/AppHomepage/AppCenter'),
    title: _l('应用库'),
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
  integration: {
    path: '/integration/:type?/:listType?',
    component: () => import('src/pages/integration'),
    title: _l('集成中心'),
  },
  integrationConnect: {
    path: '/integrationConnect/:projectId?/:id?',
    component: () => import('src/pages/integration/integrationConnect'),
    title: _l('集成中心'),
  },
  integrationApi: {
    path: '/integrationApi/:projectId?/:apiId?',
    component: () => import('src/pages/integration/integrationApi'),
    title: _l('集成中心'),
  },
  default: {
    path: '/app',
    redirect: '/app/my',
  },
};

const withoutHeaderPathList = [
  'demo',
  'chat',
  'apps/kcupload',
  'apps/kcshare',
  'apps/kc/shareFolder',
  'apps/task/customTemplate',
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
];
const withoutChatPathList = [
  'demo',
  'chat',
  'apps/kcupload',
  'apps/kcshare',
  'apps/kc/shareFolder',
  'apps/task/customTemplate',
  'apps/task/print',
  'apps/kc/shareFolder',
  'worksheet/form/preview',
  'worksheet/worksheetshare',
  'worksheet/public/query',
  'printForm',
  'print',
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
];
export const withoutHeaderUrl = `/(.*)(${withoutHeaderPathList.join('|')})`;
export const withoutChatUrl = `/(.*)(${withoutChatPathList.join('|')})`;
