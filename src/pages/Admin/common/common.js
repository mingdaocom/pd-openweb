import { navigateTo } from 'router/navigateTo';
import { upgradeVersionDialog } from 'src/util';
var AdminCommon = {};
var Config = require('../config');
var RoleController = require('src/api/role');
import 'md.select';
import './common.less';

var JqueryWrapper = require('ming-ui/utils/JQueryWrapper').default;
var MultipleDropdown = require('ming-ui/components/MultipleDropdown').default;
JqueryWrapper(MultipleDropdown, {
  name: 'reactMultipleDropdown',
});

const { AUTHORITY_DICT, WELINK_WHITELIST } = Config;

AdminCommon.init = function() {
  Config.getParams();
  Config.project = {};

  md.global.Account.projects.forEach(item => {
    if (item.projectId === Config.projectId) {
      Config.project = item;
    }
  });
  // 是否在这个网络
  if (Config.project.projectId) {
    return AdminCommon.getProjectPermissionsByUser().then((...authority) => {
      return _.flatten(_.filter(authority, item => item));
    });
  } else {
    return new Promise((resolve, reject) => {
      reject([AUTHORITY_DICT.NOT_MEMBER]);
    });
  }
};

AdminCommon.getProjectPermissionsByUser = function() {
  return RoleController.getProjectPermissionsByUser({
    projectId: Config.projectId,
  }).then(data => {
    let res = [];
    // 管理员权限（能操作 | 只能申请）
    if (data.isProjectAdmin || data.isProjectAppManager || data.isSuperAdmin) {
      res.push(AUTHORITY_DICT.HAS_PERMISSIONS);
    }
    // 组织管理员(无工作流、应用)
    if (data.isProjectAdmin) {
      res.push(AUTHORITY_DICT.PROJECT_ADMIN);
      // 各种集成权限
      if (data.projectIntergrationType === 0) {
        res.push(AUTHORITY_DICT.HAS_DING, AUTHORITY_DICT.HAS_WORKWX, AUTHORITY_DICT.HAS_WELINK, AUTHORITY_DICT.HAS_FEISHU);
      }
      if (data.projectIntergrationType === 1) {
        res.push(AUTHORITY_DICT.HAS_DING);
      }
      if (data.projectIntergrationType === 3) {
        res.push(AUTHORITY_DICT.HAS_WORKWX);
      }
      if (data.projectIntergrationType === 4) {
        res.push(AUTHORITY_DICT.HAS_WELINK);
      }
      if (data.projectIntergrationType === 6) {
        res.push(AUTHORITY_DICT.HAS_FEISHU);
      }
    }
    // 应用管理员(只包含应用、工作流)
    if (data.isProjectAppManager) {
      res.push(AUTHORITY_DICT.APK_ADMIN);
    }

    //免费网路白名单（钉钉、welink、微信）
    if (Config.project.licenseType === 0) {
      const freeList = [AUTHORITY_DICT.HAS_DING, AUTHORITY_DICT.HAS_WORKWX, AUTHORITY_DICT.HAS_WELINK, AUTHORITY_DICT.HAS_FEISHU];
      res = _.difference(res, freeList);
    }
    return res;
  });
};

AdminCommon.initProjectSelect = function() {
  var currentCompanyName;
  var dataArr = [];
  var $adminProjects = $('#adminProjects');
  if ($adminProjects.data('bind')) {
    return;
  }
  $adminProjects.data('bind', true);
  if (md.global.Account.projects) {
    dataArr = $.map(md.global.Account.projects, function(item) {
      if (item.projectId === Config.projectId) {
        currentCompanyName = item.companyName;
      }
      return {
        id: item.projectId,
        name: item.companyName,
      };
    });
  }
  $adminProjects.MDSelect({
    dataArr: dataArr,
    defualtSelectedValue: Config.projectId,
    zIndex: 1,
    wordLength: 100,
    maxWidth: 230,
    fontSize: 14,
    onChange: function(value, text) {
      if (value === Config.projectId) {
        return;
      }
      require(['mdFunction'], function(Function) {
        Function.expireDialogAsync(value).then(
          function() {
            const params = Config.params.concat();
            params[2] = value;
            navigateTo('/' + params.join('/'));
          },
          function() {
            $adminProjects.MDSelect('setValue', Config.projectId, currentCompanyName);
          },
        );
      });
    },
  });
};

AdminCommon.autoCompleteUser = function(elememtId, projectId, selectCallback, toAccountId = '') {
  require(['src/api/user', 'jqueryUI'], function(userController) {
    $(elememtId).autocomplete({
      source: function(request, response) {
        userController
          .getAutoUsersByKeywords({
            keywords: request.term,
            projectId: projectId,
            toAccountId,
          })
          .then(function(data) {
            response(
              $.map(data, function(item) {
                var desc = $.trim((item.department || '') + ' ' + (item.job || ''));
                return {
                  label: item.fullname + (!desc ? '' : '(' + desc + ')'),
                  value: item.accountId,
                };
              }),
            );
          });
      },
      select: function(event, ui) {
        if (selectCallback) {
          selectCallback(ui.item);
          return false;
        }
      },
      focus: function(event, ui) {
        return false;
      },
    });
  });
};

AdminCommon.freeUpdateDialog = () => {
  upgradeVersionDialog({
    projectId: Config.project.projectId,
    explainText: _l('请升级至付费版解锁开启'),
    isFree: true,
  });
};

module.exports = AdminCommon;
