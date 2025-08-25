import { getRequest } from 'src/utils/common';
import './user.less';

var common = require('./common');
var User = {};
var type = 'acount'; // 账户一览
var projectId = '';

User.init = function () {
  var request = getRequest();
  if (request.type) {
    type = request.type;
  }
  if (request.projectId) {
    projectId = request.projectId;
  }
  $('#accountNav')
    .off()
    .on('click', 'li', function () {
      var $this = $(this);
      $this.addClass('ThemeBGColor8').siblings('li').removeClass('ThemeBGColor8');
      var typeTag = $this.attr('typeTag');
      common.url({ type: typeTag });
      common.init();
      // User.reloadList(typeTag);
    });
  var guideSettings = md.global.Account.guideSettings;
  if (guideSettings.accountEmail || guideSettings.accountMobilePhone) {
    $('.accountTab').find('.warnLight').show();
  }
  User.reloadList(type);
};
User.reloadList = function (typeTag) {
  var event = $('.accountChartLi');
  switch (typeTag) {
    case 'information':
      event = $('.personalInfoLi');
      require(['./personalInfo/personalInfo'], function (account) {
        account.init();
      });
      break;
    case 'management':
      event = $('.accountPasswordLi');
      require(['./accountPassword/accountPassword'], function (account) {
        account.init();
      });
      break;
    case 'system':
      event = $('.systemSettingsLi');
      require(['./systemSettings/systemSettings'], function (account) {
        account.init();
      });
      break;
    case 'enterprise':
      event = $('.enterprisemLi');
      require(['./enterprise/enterprise'], function (account) {
        account.init();
      });
      break;
    case 'reportRelation':
      event = $('.enterprisemLi');
      require(['./myReportRelation/reportRelation'], function (account) {
        account.init(projectId);
      });
      break;
    case 'emblem':
      event = $('.emblemLi');
      require(['./emblem/emblem'], function (account) {
        account.init();
      });
      break;
    default:
      event = $('.accountChartLi');
      require(['./accountChart/accountChart'], function (account) {
        account.init();
      });
      break;
  }
  event.addClass('ThemeBGColor8').siblings('li').removeClass('ThemeBGColor8');
};

module.exports = User;

if (require.main === module) {
  $(function () {
    User.init();
  });
}
