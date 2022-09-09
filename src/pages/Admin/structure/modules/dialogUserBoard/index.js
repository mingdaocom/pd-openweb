var doT = require('dot');
var mdDialog = require('mdDialog').index;
var userController = require('src/api/user');
var importUserController = require('src/api/importUser');
var Confirm = require('confirm');
import ValidatePassword from '../validatePasswordDialog';
import { getPssId } from 'src/util/pssId';
import './style.less';

const exportUsers = (projectId, accountIds = []) => {
  var url = `${md.global.Config.AjaxApiUrl}download/exportProjectUserList`;
  let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
  ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
  : '';

  fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `md_pss_id ${getPssId()}`,
    },
    body: JSON.stringify({
      userStatus: '1',
      projectId,
      accountIds: accountIds.join(','),
    }),
  })
    .then(response => response.blob())
    .then(blob => {
      let date = moment(new Date()).format('YYYYMMDDHHmmss');
      const fileName = `${projectName}_${_l('人员')}_${date}` + '.xlsx';
      const link = document.createElement('a');

      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    });
};

var DEFAULTS = {
  types: {
    export: 'export',
    inActive: 'inActive',
    adjust: 'adjust',
  },
  type: 'export',
  projectId: '',
  accountIds: [],
  selected: [],

  pageIndex: 1,
  pageSize: 10,
};

var UserBoard = function (opts) {
  this.options = $.extend({}, DEFAULTS, opts);
  var type = this.options.type;
  if (type === this.options.types.export) {
    this.exportDialog();
  } else if (type === this.options.types.inActive) {
    this.inviteDialog();
  } else {
    this.adjustDialog();
  }
};

UserBoard.prototype.exportDialog = function () {
  var options = this.options;
  var _this = this;
  if (options.accountIds && options.accountIds.length) {
    options.selected = options.accountIds.slice();
    this.dialog = mdDialog({
      width: 700,
      className: 'exportDialog_' + options.projectId,
      dialogBoxID: 'exportDialog_' + options.projectId,
      container: {
        header: _l('批量导出'),
        yesText: _l('确认导出'),
        noText: _l('重新选择'),
        yesFn: function () {
          if (!options.selected.length) {
            alert(_l('请选择要导出的用户'), 2);
            return false;
          }
          const closeValidateDialog = ValidatePassword({
            header: _l('请输入登录密码，以验证管理员身份'),
            callback: () => {
              exportUsers(options.projectId, options.selected);
              closeValidateDialog.closeDialog();
            },
          });
        },
        noFn: function () {
          options.noFn.call(null);
        },
      },
    });
    _this.renderExportList().done(function () {
      _this.$container = $('.' + 'exportDialog_' + options.projectId);
      _this.bindExportEvent();
    });
  } else {
    this.dialog = mdDialog({
      container: {
        header: _l('批量导出'),
        content: _l('确认要导出所有成员？'),
        yesText: _l('确认导出'),
        yesFn: function () {
          const closeValidateDialog = ValidatePassword({
            header: _l('请输入登录密码，以验证管理员身份'),
            callback: () => {
              exportUsers(options.projectId, options.selected);
              closeValidateDialog.closeDialog();
            },
          });
        },
      },
    });
  }
};

UserBoard.prototype.getUserInfo = function () {
  var options = this.options;
  var accountIds = options.accountIds;
  var projectId = options.projectId;
  var dfd = $.Deferred();
  userController
    .getUserListByAccountId({
      accountIds: accountIds,
      projectId: projectId,
    })
    .then(function (data) {
      dfd.resolve(data);
    });
  return dfd.promise();
};

UserBoard.prototype.renderExportList = function () {
  var _this = this;
  var options = this.options;
  var dfd = $.Deferred();
  this.getUserInfo().then(function (data) {
    if (data && data.list) {
      var renderData = $.extend({}, data, {
        selected: options.selected,
        accountIds: options.accountIds,
        type: options.type,
      });
      var tpl = doT.template(require('./tpl/userTable.html'))(renderData);
      _this.dialog.content(tpl);
      _this.dialog.dialogCenter();
    }
    dfd.resolve(data.list || []);
  });
  return dfd.promise();
};

UserBoard.prototype.bindExportEvent = function () {
  var options = this.options;
  var $container = this.$container;
  var $checkboxs = $container.find('.Icon_UnChecked');
  var $count = $container.find('.count');
  $container.on('click', '.Icon_UnChecked', function () {
    var $this = $(this);
    $this.toggleClass('Icon_Checked');
    var isChecked = $this.hasClass('Icon_Checked');
    if ($this.hasClass('checkAll')) {
      options.selected = isChecked ? _.union(options.selected, options.accountIds) : [];
      $checkboxs.toggleClass('Icon_Checked', isChecked);
    } else {
      var accountId = $this.data('accountid');
      options.selected = isChecked ? _.union(options.selected, [accountId]) : _.without(options.selected, accountId);
    }
    $checkboxs.filter('.checkAll').toggleClass('Icon_Checked', options.selected.length === options.accountIds.length);
    $count.text(options.selected.length);
  });

  $container.on('mouseover', 'img[data-accountid]', function () {
    var $this = $(this);
    require(['mdBusinessCard'], function () {
      if ($this.data('bind')) return;
      $this.mdBusinessCard();
      $this.data('bind', true).trigger('mouseenter');
    });
  });
};

UserBoard.prototype.inviteDialog = function () {
  var options = this.options;
  var _this = this;
  this.dialog = mdDialog({
    width: 700,
    className: 'inviteDialog_' + options.projectId,
    container: {
      header: _l('未激活成员'),
      yesText: '',
      noText: '',
    },
    callback: function () {
      options.callback.call(null);
    },
  });

  _this.$container = $('.' + 'inviteDialog_' + options.projectId);
  _this.getUserList();
  _this.bindInviteEvent();
};

UserBoard.prototype.getUserList = function (reset) {
  var options = this.options;
  var _this = this;
  if (reset) options.pageIndex = 1;
  options.promise = importUserController
    .getImportUserDetails({
      projectId: options.projectId,
      pageIndex: options.pageIndex,
      pageSize: options.pageSize,
    })
    .then(function (data) {
      _this.renderInviteList(data);
    });
};

UserBoard.prototype.renderInviteList = function (data) {
  var options = this.options;
  var _this = this;
  if (data && data.list) {
    var renderData = $.extend({}, data, {
      type: options.type,
    });
    var tpl = doT.template(require('./tpl/userTable.html'))(renderData);
    this.dialog.content(tpl);
    this.dialog.dialogCenter();
    if (data.allCount > options.pageIndex) {
      require(['pager'], function () {
        _this.$container.find('.pager').Pager({
          pageIndex: options.pageIndex,
          pageSize: options.pageSize,
          count: data.allCount,
          changePage: function (pageIndex) {
            options.pageIndex = pageIndex;
            _this.getUserList();
          },
        });
      });
    }
  }
};

UserBoard.prototype.bindInviteEvent = function () {
  var _this = this;
  var options = this.options;
  var projectId = options.projectId;
  var $container = this.$container;

  $container.on('click', '.reInvite', function () {
    var $this = $(this);
    var account = $this.data('account');
    if (!account) return;
    importUserController
      .reInviteImportUser({
        accounts: [account],
        projectId: projectId,
      })
      .done(function (result) {
        if (result) {
          alert(_l('重新邀请成功'), 1);
        } else {
          alert(_l('重新邀请失败'), 2);
        }
      });
  });

  $container.on('mouseenter', '[tip]', function () {
    var $this = $(this);
    if ($this.data('bind')) return;
    require(['tooltip'], function () {
      $this
        .mdTooltip({
          text: _l('取消邀请<br/>并移除'),
          width: 80,
          arrowLeft: 15,
          offsetLeft: -28,
        })
        .data('bind', true)
        .trigger('mouseenter');
    });
  });

  $container.on('click', '.cancelInvite', function () {
    var $this = $(this);
    var account = $this.data('account');
    if (!account) return;

    new Confirm(
      {
        title: '',
        content: _l('确认取消邀请该用户吗'),
      },
      function () {
        importUserController
          .cancelImportUser({
            accounts: [account],
            projectId: projectId,
          })
          .done(function (result) {
            if (result) {
              $this.parents('.userItem').remove();
              if (!$container.find('.userItem').length) {
                options.pageIndex = options.pageIndex > 1 ? options.pageIndex - 1 : 1;
                _this.getUserList();
              }
            } else {
              alert(_l('取消失败'), 2);
            }
          });
      },
    );
  });
};

UserBoard.prototype.adjustDialog = function () {
  var options = this.options;
  var _this = this;
  options.selected = options.accountIds.slice();
  this.dialog = mdDialog({
    width: 700,
    dialogBoxID: 'adjustDialog_' + options.projectId,
    className: 'adjustDialog_' + options.projectId,
    container: {
      header: _l('调整部门'),
      yesText: _l('确认调整'),
      noText: _l('重新选择'),
      yesFn: function () {
        if (!options.selected.length) {
          alert(_l('请选择要调整的用户'), 2);
          return false;
        }
        _this.adjustConfirm();
        return false;
      },
      noFn: function () {
        options.noFn.call(null);
      },
    },
  });
  _this.renderExportList().done(function (userList) {
    if (userList.length) {
      options.chargeUserCount = _.filter(userList, user => user.isDepartmentChargeUser).length;
    }
    _this.$container = $('.' + 'adjustDialog_' + options.projectId);
    _this.bindExportEvent();
    _this.$btn = _this.$container.find('.adjustBtn');
    _this.$btn.on('click', function (e) {
      var $this = $(this);
      require(['dialogSelectDept'], function (SelectDept) {
        SelectDept({
          projectId: options.projectId,
          unique: false,
          selectedDepartment: [],
          showCreateBtn: false,
          selectFn: function (data) {
            $this.text(data.map(it => it.departmentName).join(',')).data(
              'departmentid',
              data.map(it => it.departmentId),
            );
          },
        });
      });
    });
  });
};

UserBoard.prototype.adjustConfirm = function () {
  var options = this.options;
  var _this = this;
  var html = options.chargeUserCount
    ? '<div>' +
      _l('您选择的成员中有%0个成员是部门负责人', options.chargeUserCount) +
      '</div><div>' +
      _l('成员调整到新部门后，负责人的角色将失效') +
      '</div>'
    : '';
  var departmentId = _this.$btn.data('departmentid') || '';
  var tip =
    '<div><div class="pBottom15">' + _l('您确认要将选择的成员统一调整到新的部门吗') + '</div>' + html + '</div>';
  if (departmentId === '') {
    tip = '<div><div class="pBottom15">' + _l('您确认要将选择的成员统一调整到组织节点吗') + '</div>' + html + '</div>';
  }
  mdDialog({
    container: {
      header: _l('调整部门'),
      yesText: _l('确认调整'),
      content: tip,
      yesFn: function () {
        userController
          .updateUsersDepartment({
            projectId: options.projectId,
            departmentIds: departmentId,
            accountIds: options.selected,
          })
          .done(function (result) {
            if (!result) {
              alert(_l('操作失败'), 2);
            } else {
              _this.dialog.closeDialog();
              alert(_l('部门设置成功'));
              options.yesFn.call(null);
            }
          });
      },
    },
  });
};

module.exports = function (opts) {
  return new UserBoard(opts);
};
