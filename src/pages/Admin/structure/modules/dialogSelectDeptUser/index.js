import './style.less';
import '@mdfe/nanoscroller';
import doT from '@mdfe/dot';
import mainHtml from './tpl/main.html';
import itemHtml from './tpl/item.html';
import { index as mdDialog } from 'src/components/mdDialog/dialog';
import departmentController from 'src/api/department';
import _ from 'lodash';

var DEFAULTS = {
  dialogBoxID: 'selectDepartmentUser_',
  title: _l('设置部门负责人'),
  projectId: '',
  departmentId: '',
  filterAccountIds: [],
  keywords: '',
  pageIndex: 1,
  pageSize: 20,

  selectedUsers: [],
  users: {},
  usersDict: {},
  isUnique: true,
  maxCount: 0,
  callback: function (users) {
    console.log(users);
  },
};

var $loading = $('<li>' + LoadDiv() + '</li>');

var SelectDeptUser = function (options) {
  this.options = Object.assign({}, DEFAULTS, options);
  this.options.dialogBoxID = this.options.dialogBoxID + this.options.departmentId;
  this.init();
};

SelectDeptUser.prototype.init = function () {
  var options = this.options;
  var _this = this;
  this.dialog = mdDialog({
    dialogBoxID: options.dialogBoxID,
    container: {
      header: options.title,
      yesFn: function () {
        var accounts = options.selectedUsers.map(function (accountId) {
          return options.usersDict[accountId];
        });
        options.callback.call(null, accounts);
      },
    },
    status: options.selectedUsers.length ? 'enable' : 'disable',
    readyFn: function () {
      // store in cahce
      _this.$container = $('#' + _this.options.dialogBoxID).find('.selectDepartmentUserContainer');
      _this.$content = _this.$container.find('.selectDepartmentUserContent');
      _this.$input = _this.$container.find('.searchInput');
      _this.$searchClose = _this.$container.find('.searchClose');
      _this.dialog.dialogCenter();
      if (_this.options.readyFn) {
        _this.options.readyFn.call(null, _this.dialog);
      }
      _this.getData();
      _this.bindEvent();
    },
  });
  this.dialog.content(doT.template(mainHtml)());
};

SelectDeptUser.prototype.bindEvent = function () {
  var _this = this;
  var options = this.options;
  this.$content.on('change', '.userCheckbox', function (e) {
    var $this = $(this);
    var accountId = $this.data('accountid');
    var isChecked = $this.prop('checked');

    if (!options.isUnique && options.maxCount && options.maxCount < _this.$checkboxs.filter((index, item) => item.checked).length) {
      alert(_l('最多选择%0人', options.maxCount), 2);
      $this.prop('checked', false);
      return false;
    }

    _this.updateSelectedUsers({
      accountId: accountId,
      isChecked: isChecked,
    });

    if (options.isUnique) {
      _this.$checkboxs.not($this).prop('checked', false);
    }
    e.stopPropagation();
  });

  this.$input.on('keyup', function () {
    var value = $.trim(_this.$input.val());
    var timer;
    _this.$searchClose.toggle(!!value);
    if (value === options.keywords) return;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      options.keywords = value;
      options.pageIndex = 1;
      _this.getData();
    }, 300);
  });

  this.$searchClose.on('click', function () {
    _this.$input.val('');
    _this.$searchClose.toggle(false);
    options.keywords = '';
    options.pageIndex = 1;
    _this.getData();
  });
};


SelectDeptUser.prototype.updateSelectedUsers = function (payload) {
  var options = this.options;
  var isUnique = options.isUnique;
  var isChecked = payload.isChecked;
  var accountId = payload.accountId;
  var users = isUnique ? [] : options.selectedUsers.slice();
  if (isChecked) {
    users.push(accountId);
    options.selectedUsers = _.uniqBy(users);
  } else {
    options.selectedUsers = _.pull(users, accountId);
  }
  if (options.selectedUsers.length) {
    this.dialog.enable();
  } else {
    this.dialog.disable();
  }
};

SelectDeptUser.prototype.getData = function (loadMore) {
  var _this = this;
  var options = this.options;

  if (options.promise && options.promise.state() === 'pending') {
    options.promise.abort && options.promise.abort();
  }
  if (loadMore && options.hasMore) {
    options.pageIndex++;
  }
  options.promise = departmentController.pagedDeptAccountShrotInfos({
    projectId: options.projectId,
    departmentId: options.departmentId,
    keywords: options.keywords,
    filterAccountIds: options.filterAccountIds,
    pageIndex: options.pageIndex,
    pageSize: options.pageSize,
  }).then(function (data) {
    _this.formatData(data);
    _this.renderList(data);
    _this.bindNanoScroller();
    options.hasMore = data.list && (data.list.length >= options.pageSize);
  }).always(function () {
    $loading.detach();
  });
};

SelectDeptUser.prototype.renderList = function (data) {
  var options = this.options;
  var renderData = Object.assign({}, data, {
    selectedUsers: options.selectedUsers,
    isFirst: options.pageIndex === 1,
    keywords: options.keywords,
  });
  var tplFunc = doT.template(itemHtml);
  if (options.pageIndex === 1) {
    this.$content.html(tplFunc(renderData));
  } else {
    this.$nanoContent.append(tplFunc(renderData));
  }
  this.$checkboxs = this.$content.find('.userCheckbox');
  this.dialog.dialogCenter();
};

SelectDeptUser.prototype.formatData = function (data) {
  var list = data.list;
  var dict = this.options.usersDict;
  if (_.isArray(list)) {
    list.map(function (user) {
      dict[user.accountId] = user;
    });
  }
};

SelectDeptUser.prototype.bindNanoScroller = function () {
  var _this = this;
  var options = this.options;
  this.$nano = this.$content.find('.nano');
  this.$nanoContent = this.$content.find('.nano-content');
  this.$nano.nanoScroller('flush');
  if (options.pageIndex === 1) {
    this.$nano.on('scrollend', function () {
      if (options.hasMore) {
        _this.$nanoContent.append($loading);
        _this.getData(true);
      }
    });
  }
};

export default function (opts) {
  return new SelectDeptUser(opts);
};
