import './style.css';
var userController = require('src/api/user');
var GeneralSelect = require('src/components/GeneralSelect').default;
import React from 'react';
var ReactDOM = require('react-dom');

var DialogSelectUser = function (el, param) {
  var defaults = {
    selectModes: ['user'], // 选择模式  user：联系人  department：部门  group：群组
    chooseType: 'user', // 默认选中的
    title: _l('添加成员'), // 弹出层标题
    isMobile: false,
    elementId: 'dialogBoxSelectUser',
    sourceId: '', // 来自哪个好友，群组，任务，知识，网络，日程，项目
    fromType: 0, // 0：好友  1：群组  2：任务  3：知识  4：网络 5：日程 6：项目
    showMoreInvite: true, // 是否呈现更多邀请
    chooseTypes: {
      // 默认显示的tab类型
      user: 1,
      invite: 2,
    },
    selectCallback(data) {}, // 点击确定时返回的数据 {users: Array, departments: Array, groups: Array}
    callback: $.noop(), // 关闭时的callback
    dataRangeTypes: {
      // dataRange枚举 ajax param
      all: 0, // 所有联系人
      friend: 1, // 好友
      project: 2, // 网络用户
      other: 3, // 其他协作用户（第三方邀请）
    },
    SelectUserSettings: {
      includeUndefinedAndMySelf: false,
      includeSystemField: false,
      filterSystemAccountId: [],
      selectUserObj: null,
      showTabs: ['conactUser', 'department', 'group', 'subordinateUser'], // 用户列表子tab 联系人 部门 群组 下属
      extraTabs: [],
      projectId: '', // 默认取哪个网络的用户 为空则表示默认加载全部
      filterProjectId: '', // 过滤哪个网络的用户
      filterAll: false, // 过滤全部
      filterFriend: false, // 是否过滤好友
      filterOthers: false, // 是否过滤其他协作关系
      filterAccountIds: [], // 过滤指定的用户
      prefixAccountIds: [], // 指定置顶的用户
      filterOtherProject: false, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
      dataRange: 0, // reference to dataRangeTypes 和 projectId 配合使用
      allowSelectNull: false, // 是否允许选择列表为空
      unique: false, // 是否只可以选一个
      projectCallback: function (projectId) {},
      callback: function (data) {},
    },
    SelectDepartmentSettings: {
      disabledDepartmentIds: [], // 禁选的部门id
      departments: [], // 已经选中的部门数组
    },
    SelectGroupSettings: {
      disabledGroupIds: [], // 禁选的部门id
      groups: [], // 已经选中的部门
    },
    ChooseInviteSettings: {
      viewHistory: true, // 是否呈现邀请记录
      callback: function (data, callbackInviteResult) {
        // params
        // data 被邀请用户的信息
        // callbackInviteResult function param { status: 0 } { status: 1} 回调给邀请层的邀请按钮 disable or enable
      },
    },
  };

  if (param.SelectUserSettings) {
    param.SelectUserSettings = $.extend(defaults.SelectUserSettings, param.SelectUserSettings);
  }

  if (param.ChooseInviteSettings) {
    param.ChooseInviteSettings = $.extend(defaults.ChooseInviteSettings, param.ChooseInviteSettings);
  }

  this.options = $.extend(defaults, param);

  this.$dialogSelectUser = null;
  this.init();
};

$.extend(DialogSelectUser.prototype, {
  init: function () {
    var _this = this;
    var options = _this.options;

    var dropList = _this.initDropList();
    let contentHtml = '';
    if (dropList && dropList.length > 0) {
      contentHtml = `
      <div class="chooseTabs box-sizing Hidden">
      ${
        options.showMoreInvite
          ? `${
              options.defaultShowMoreInvite
                ? `
      <div class='chooseTab  box-sizing' type='1'><span class='dropList'>&nbsp;</span></div>
      <div class='chooseTab ThemeBGColor3 activeChooseTab box-sizing' type='2'>${_l('更多邀请')}</div>
      `
                : `
      <div class='chooseTab ThemeBGColor3 activeChooseTab box-sizing' type='1'><span class='dropList'>&nbsp;</span></div>
      <div class='chooseTab box-sizing' type='2'>${_l('更多邀请')}</div>
      `
            }`
          : "<div class='chooseTab  box-sizing ThemeBGColor3 activeChooseTab fullChooseTab activeTab' type='1'><span class='dropList'>&nbsp;</span></div>"
      }
      <div class='Clear'></div>
      </div>
      `;
    }
    let html = `${contentHtml}<div class="dialogUserContainer contentItem"></div>
    <div class="inviteContainer contentItem"></div>
    `;

    require(['mdDialog'], function () {
      options.dialog = $.DialogLayer({
        fixed: false,
        dialogBoxID: options.elementId,
        className: options.isMobile ? 'mobileSelectUser' : '',
        width: 560,
        container: {
          header: options.title,
          yesText: null,
          noText: null,
        },
        callback: () => {
          ReactDOM.unmountComponentAtNode(_this.$dialogSelectUser.find('.dialogUserContainer')[0]);
          if (options.callback) {
            options.callback();
          }
        },
      });

      _this.$dialogSelectUser = $('#' + options.elementId);

      options.dialog.dialogCenter();
      options.dialog.content('<div class="dialogSelectUser">' + html + '</div>');

      _this.$dialogSelectUser.find('.chooseTabs').show();
      if (dropList && dropList.length > 0) {
        _this.getUserJoinProject(dropList);

        var defaultProjectId = options.SelectUserSettings.projectId;
        if (!defaultProjectId) {
          defaultProjectId = dropList[0].id;
        }
        if (options.defaultShowMoreInvite) {
          _this.getInvite();
        } else {
          _this.getUser(defaultProjectId, true);
        }
        _this.bindEvent();
      } else {
        _this.getInvite();
      }
    });
  },

  bindEvent: function () {
    var _this = this;
    var options = _this.options;

    var $chooseTabs = _this.$dialogSelectUser.find('.chooseTabs');
    $chooseTabs.find('.chooseTab').on('click', function (event) {
      var $this = $(this);
      var type = $this.attr('type');
      var isActive = $this.hasClass('activeChooseTab');
      if (type == options.chooseTypes.invite && !isActive) {
        _this.$dialogSelectUser.find('.contentItem').hide();
        $chooseTabs.find('.chooseTab').removeClass('ThemeBGColor3 activeChooseTab');
        $this.addClass('ThemeBGColor3 activeChooseTab');
        _this.getInvite();
      }

      if (type == options.chooseTypes.user) {
        if (isActive) {
          // trigger dropdown list
          $this.find('.icon-arrow-down-border').trigger('click.dropdown');
          event.stopPropagation();
        } else {
          _this.$dialogSelectUser.find('.contentItem').hide();
          $chooseTabs.find('.chooseTab').removeClass('ThemeBGColor3 activeChooseTab');
          $this.addClass('ThemeBGColor3 activeChooseTab');
          _this.getUser(options.SelectUserSettings.projectId, true);
        }
      }
    });
  },

  initDropList: function () {
    var _this = this;
    var options = _this.options;
    var selectUserSettings = options.SelectUserSettings;
    var list = [];
    if (!selectUserSettings.filterAll) {
      list.push({
        id: options.dataRangeTypes.all,
        name: _l('全部联系人'),
      });
    }
    if (!selectUserSettings.filterFriend) {
      list.push({
        id: options.dataRangeTypes.friend,
        name: _l('好友'),
      });
    }
    if (!selectUserSettings.filterOthers) {
      list.push({
        id: options.dataRangeTypes.other,
        name: _l('其他协作关系'),
        tip: _l(
          'Ta们被您的好友或同事邀请加入进行共同协作，我们将这些与您共同协作但不是您好友或同事的协作伙伴称为“其他协作关系”',
        ),
      });
    }

    if (md.global.Account && md.global.Account.projects) {
      for (var i = 0, length = md.global.Account.projects.length; i < length; i++) {
        var item = md.global.Account.projects[i];
        // 过滤某个
        if (
          selectUserSettings.filterProjectId &&
          selectUserSettings.filterProjectId.toLowerCase() == item.projectId.toLowerCase()
        ) {
          continue;
        }
        // 过滤除某个之外的所有
        if (
          selectUserSettings.filterOtherProject &&
          selectUserSettings.projectId.toLowerCase() != item.projectId.toLowerCase()
        ) {
          continue;
        }

        list.push({
          id: item.projectId,
          name: item.companyName,
        });
      }
    }

    return list;
  },

  getUserJoinProject: function (list) {
    var _this = this;
    var options = _this.options;
    var cutStringCount = 18;
    if (!options.showMoreInvite) cutStringCount = 50;

    var $dropList = _this.$dialogSelectUser.find('.dropList');
    require(['src/components/dropDownList/dropDownList.js'], function () {
      $dropList.dropDown({
        defaultValue: options.SelectUserSettings.projectId,
        list: list,
        offset: {
          left: -168,
          top: 34,
        },
        extraClass: 'Right dropDownTrigger',
        cutStringCount: cutStringCount,
        clickCb: function (id, name) {
          _this.getUser(id);
        },
      });
    });
  },

  getUser: function (projectId, isfirst) {
    var _this = this;
    var options = _this.options;

    var dataRange = null;
    if (
      projectId == options.dataRangeTypes.all ||
      projectId == options.dataRangeTypes.friend ||
      projectId == options.dataRangeTypes.other
    ) {
      dataRange = projectId;
      projectId = '';
    } else {
      dataRange = options.dataRangeTypes.project;
    }

    var settings = options.SelectUserSettings;
    var reload = false;

    if (settings.projectId != projectId || settings.dataRange != dataRange) {
      settings.projectId = projectId;
      settings.dataRange = dataRange;
      reload = true;
    }

    _this.$dialogSelectUser.find('.contentItem').hide(); // 用户 和 邀请
    _this.$dialogSelectUser.find('.chooseTabs .chooseTab').removeClass('ThemeBGColor3 activeChooseTab'); // Tab激活状态
    _this.$dialogSelectUser
      .find(".chooseTabs .chooseTab[type='" + options.chooseTypes.user + "']")
      .addClass('ThemeBGColor3 activeChooseTab');
    var $userContainer = _this.$dialogSelectUser.find('.dialogUserContainer');
    $userContainer.show();
    options.dialog.dialogCenter();

    if (isfirst || reload) {
      options.dialog.dialogCenter();
      const commonSettings = {
        selectModes: options.selectModes,
        projectId: settings.projectId,
        dataRange: settings.dataRange || 0,
        callback: function (data) {
          options.selectCallback(data);
          options.dialog.closeDialog();
        },
      };
      const userSettings = {
        includeUndefinedAndMySelf: settings.includeUndefinedAndMySelf,
        includeSystemField: settings.includeSystemField,
        filterSystemAccountId: settings.filterSystemAccountId,
        unique: settings.unique,
        allowSelectNull: settings.allowSelectNull,
        filterProjectId: settings.filterProjectId,
        filterFriend: settings.filterFriend,
        filterAccountIds: settings.filterAccountIds,
        prefixAccountIds: settings.prefixAccountIds,
        defaultTabsFilter: settings.defaultTabsFilter,
        showTabs: settings.showTabs,
        extraTabs: settings.extraTabs,
        callback: function (users, departments, group) {
          settings.projectCallback(settings.projectId);
          settings.callback(users, departments, group);
          options.dialog.closeDialog();
        },
      };
      const departmentSettings = options.SelectDepartmentSettings;
      const groupSettings = options.SelectGroupSettings;
      const project = _.find(md.global.Account.projects, { projectId: options.SelectUserSettings.projectId });
      if (!project) {
        commonSettings.projectId = '';
        // commonSettings.dataRange = 0;
      }
      ReactDOM.render(
        <GeneralSelect
          chooseType={options.chooseType}
          commonSettings={commonSettings}
          userSettings={userSettings}
          departmentSettings={departmentSettings}
          groupSettings={groupSettings}
        />,
        $userContainer[0],
      );
    }
  },

  getInvite: function () {
    var _this = this;
    var options = _this.options;
    require(['chooseInvite'], function () {
      _this.$dialogSelectUser.find('.contentItem').hide();
      var $inviteContainer = _this.$dialogSelectUser.find('.inviteContainer');
      $inviteContainer.show();
      options.dialog.dialogCenter();
      $inviteContainer.chooseInvite({
        sourceId: options.sourceId,
        fromType: options.fromType,
        zIndex: options.zIndex + 1,
        viewHistory: options.ChooseInviteSettings.viewHistory,
        callback: options.ChooseInviteSettings.callback,
      });
    });
  },
});

$.fn.dialogSelectUser = function (param) {
  return new DialogSelectUser(this, param);
};
