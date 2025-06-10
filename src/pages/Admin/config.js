import _ from 'lodash';
import AdminController from 'src/api/adminManage';
import { htmlEncodeReg } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';

var Config = {
  params: null, // parameters from url， eg: /admin/:routeType/:projectId
  projectId: null, // current projectId
  project: null, // current project info (from `md.global`)
};

Config.AdminController = AdminController;

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

Config.getParams = function () {
  const reqArray = location.pathname.split('/');
  const controlIndex = $.inArray('admin', reqArray);
  let arr = [];

  reqArray.forEach(function (item, index) {
    if (index >= controlIndex) {
      arr.push(item);
    }
  });

  Config.params = arr;
  Config.projectId = Config.params[2];
};

Config.setPageTitle = function (prefix) {
  document.title = Config.getTitle(prefix);
};

Config.getTitle = function (prefix) {
  const project = getCurrentProject(Config.projectId, true);
  const companyName = htmlEncodeReg((project && project.companyName) || '');
  return [_l('组织管理'), prefix, companyName].join(' - ');
};

Config.EVENTS = {
  transitionEnd: 'transitionend',
};

Config.abortRequest = function (request) {
  if (request && request.abort) {
    request.abort();
  }
};

Config.DATE_FILTER = [
  { id: 'today', text: _l('今天') },
  { id: 'currentWeek', text: _l('最近七天') },
  { id: 'currentMonth', text: _l('本月') },
  { id: 'prevMonth', text: _l('上月') },
  { id: 'custom', text: _l('自定义日期') },
];

export default Config;
