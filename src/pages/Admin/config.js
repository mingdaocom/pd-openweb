import 'src/components/modernizr/modernizr';
import { htmlEncodeReg } from 'src/util';

var Config = {
  params: null, // parameters from url， eg: /admin/:routeType/:projectId
  projectId: null, // current projectId
  project: null, // current project info (from `md.global`)
};

Config.AdminController = require('src/api/adminManage');

Config.templates = {
  withTopMenu:
    '<div class="subMenuList"></div>' +
    '<div class="mainContent">' +
    '<div class="h100" style="overflow-y: auto;"></div>' +
    '</div>',

  withSubMenu:
    '<div class="subMenuList"></div>' +
    '<div class="mainContent">' +
    '<div class="h100" style="overflow-y: auto;">' +
    '<div class="card mTop0 mAll20">' +
    '<div class="subMenu"></div>' +
    '<div class="moduleContent"></div>' +
    '</div>' +
    '</div>',
};

Config.getParams = function() {
  const reqArray = location.pathname.split('/');
  const controlIndex = $.inArray('admin', reqArray);
  let arr = [];

  reqArray.forEach(function(item, index) {
    if (index >= controlIndex) {
      arr.push(item);
    }
  });

  Config.params = arr;
  Config.projectId = Config.params[2];
};

Config.getProjectInfo = function() {
  if (!Config.project || (Config.project && Config.project.projectId !== Config.projectId)) {
    Config.project = _.find(md.global.Account.projects, function(item) {
      return item.projectId == Config.projectId;
    });
  }
  return Config.project || {};
};

Config.setPageTitle = function(prefix) {
  document.title = Config.getTitle(prefix);
};

Config.getTitle = function(prefix) {
  const project = Config.getProjectInfo();
  const companyName = htmlEncodeReg((project && project.companyName) || '');
  return [_l('组织管理'), prefix, companyName].join(' - ');
};

// transitionName prefixed
var transEndEventNames = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'oTransitionend',
  transition: 'transitionend',
};

var transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];

Config.EVENTS = {
  transitionEnd: transEndEventName,
};

Config.abortRequest = function(request) {
  if (request && typeof request.state === 'function' && request.state() === 'pending' && request.abort) {
    request.abort();
  }
};

Config.AUTHORITY_DICT = {
  PROJECT_ADMIN: 'PROJECT_ADMIN',
  APK_ADMIN: 'APK_ADMIN',
  HAS_PERMISSIONS: 'HAS_PERMISSIONS',
  HAS_DING: 'HAS_DING',
  HAS_WORKWX: 'HAS_WORKWX',
  HAS_WELINK: 'HAS_WELINK',
  HAS_FEISHU: 'HAS_FEISHU',
  NOT_MEMBER: 'NOT_MEMBER', //不是成员
  OLD_VERSION: 'OLD_VERSION', //版本过期
};

Config.DATE_FILTER = [
  { id: 'today', text: _l('今天') },
  { id: 'currentWeek', text: _l('最近七天') },
  { id: 'currentMonth', text: _l('本月') },
  { id: 'prevMonth', text: _l('上月') },
  { id: 'custom', text: _l('自定义日期') },
];

export default Config;
