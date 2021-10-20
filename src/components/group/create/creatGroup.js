import './createGroup.css';
import 'poshytip';
import { getStringBytes } from 'src/util';

var doT = require('dot');
var utils = require('src/util');

var CreateGroup = {};

var groupController = require('src/api/group');
var userController = require('src/api/user');

var projects = $.extend({}, md.global.Account).projects;
var project = projects && projects.length ? projects[0] : {};

var DEFAULTS = {
  selectedDeptSetting: null,
  defaultAvatar: `${md.global.FileStoreConfig.pictureHost}GroupAvatar/default.png?imageView2/1/w/100/h/100/q/90`,
  settings: {
    projectId: project.projectId || '',
    createGroupInProject: false,
    openApproval: false,
    callback: function () {},
  },
};

var tips = {
  selectDepartment: _l('选择关联部门'),
  btnCreate: _l('创建'),
  btnCreating: _l('创建中...'),
  createErrorTip: _l('创建失败'),
  nameTooLongTip: _l('群组名称过长，最多不超出64个字符'),
  nameNullTip: _l('群组名称不能为空'),
  uploadingTip: _l('上传中...'),
  customAvatarTip: '+ ' + _l('使用自定义头像'),
};

CreateGroup.createInit = function (settings) {
  CreateGroup.options = $.extend(true, {}, DEFAULTS, { settings: settings });
  CreateGroup.options.selectedDeptSetting = null;

  if (CreateGroup.options.settings.projectId) {
    CreateGroup.options.isProject = true;
  } else {
    CreateGroup.options.isProject = false;
  }

  var tpl = doT.template(require('./tpl/main.html'))({
    createGroupInProject: CreateGroup.options.settings.createGroupInProject,
    isProject: CreateGroup.options.isProject,
    openApproval: CreateGroup.options.settings.openApproval,
    defaultAvatar: CreateGroup.options.defaultAvatar,
  });

  CreateGroup.dialog = $.DialogLayer({
    dialogBoxID: 'dialogBoxCreateGroup',
    width: 446,
    container: {
      content: tpl,
      noText: '',
      yesText: '',
    },
    drag: false,
    callback: function () {
      // 关闭头像选择
      CreateGroup.$avatar.poshytip('destroy');
    },
  });

  CreateGroup.$content = $('#dialogBoxCreateGroup').find('.dialogContent');
  CreateGroup.checkIsProjectAdmin();
  CreateGroup.bindHeadAvatar();
  CreateGroup.bindEvent();
  CreateGroup.dialog.dialogCenter();
};

CreateGroup.bindEvent = function () {
  var $dialogBoxCreateGroup = CreateGroup.$content;
  var $groupType = $dialogBoxCreateGroup.find('.groupType');
  var $selectDep = $dialogBoxCreateGroup.find('.selectDep');
  var $type = $groupType.find(':radio');
  var $deptCheckbox = $dialogBoxCreateGroup.find('.deptCheckbox');
  var $projectSelect = $dialogBoxCreateGroup.find('.groupProjectSelect');
  var $hiddenCompanys = $dialogBoxCreateGroup.find('.hiddenCompanys');
  var $approval = $dialogBoxCreateGroup.find('#createGroupApproval');

  require(['md.select'], function () {
    var _projects = [];
    $.each(md.global.Account.projects, function (i, p) {
      _projects.push({
        id: p.projectId,
        name: p.companyName,
      });
    });

    $hiddenCompanys.MDSelect({
      defualtSelectedValue: CreateGroup.options.settings.projectId,
      dataArr: _projects,
      showType: 4,
      maxWidth: 300,
      lineHeight: 24,
      zIndex: 1,
      wordLength: 100,
      onChange: function (value, text) {
        CreateGroup.options.settings.projectId = value;
        CreateGroup.checkIsProjectAdmin();
      },
    });
  });

  // 群组类型
  $type.on('change', function () {
    var settings = CreateGroup.options.settings;
    CreateGroup.options.isProject = $(this).hasClass('official') && $(this).prop('checked');
    if (CreateGroup.options.isProject) {
      settings.projectId = $hiddenCompanys.val();
      $projectSelect.show();
    } else {
      settings.projectId = '';
      $projectSelect.hide();
    }
    CreateGroup.checkIsProjectAdmin();
  });

  // 审批
  $approval.on('change', function () {
    var settings = CreateGroup.options.settings;
    settings.openApproval = $(this).prop('checked');
  });

  // 设置关联部门弹窗
  $deptCheckbox.on('change', function () {
    if ($(this).prop('checked')) {
      $selectDep.show();
    } else {
      CreateGroup.options.selectedDeptSetting = null;
      $selectDep.html(tips.selectDepartment).hide();
    }
  });
  $selectDep.on('click', function () {
    require(['dialogSelectMapGroupDepart'], function () {
      $('body').dialogSelectMapGroupDepart({
        projectId: CreateGroup.options.settings.projectId,
        callback: function (data) {
          CreateGroup.options.selectedDeptSetting = data;
          $selectDep.html(_l('关联部门：【%0】', data.departmentName));
        },
      });
    });
  });

  $dialogBoxCreateGroup.on('click', '.cancelCreate', function () {
    CreateGroup.dialog.closeDialog();
  });

  $dialogBoxCreateGroup.on('click', '.btnCreate', function () {
    if ($(this).prop('disbled')) {
      return false;
    }
    var $txtGroupName = $('#dialogBoxCreateGroup .txtGroupName');
    var groupName = $txtGroupName.val().trim();
    if (groupName) {
      if (getStringBytes(groupName) > 64) {
        return alert(tips.nameTooLongTip, 3);
      }
      CreateGroup.createGroupConfirm();
    } else {
      alert(tips.nameNullTip, 3);
      $txtGroupName.focus();
    }
  });
};

CreateGroup.bindHeadAvatar = function () {
  var $container = CreateGroup.$content.find('.groupTopContent');
  var $avatar = $container.find('.groupAvatar');
  var $groupSelect;
  var srcBasePath;

  CreateGroup.$avatar = $avatar;

  $avatar.data('bind', true);
  $avatar.poshytip({
    additionalClassName: 'z-depth-1-half createGroupAvatarSelect',
    showOn: 'none',
    showTimeout: 0,
    alignTo: 'target',
    alignX: 'center',
    alignY: 'bottom',
    showAniDuration: 0,
    offsetY: 8,
    fixed: true,
    content: function (updateCallback) {
      groupController.getGroupAvatarSelectList().then(function (result) {
        var tpl = require('../settingGroup/tpl/groupHead.html');
        srcBasePath = result.basePath;
        $groupSelect = $(doT.template(tpl)(result));
        updateCallback($groupSelect);
        $avatar.poshytip('show');
        bindGroupHeadPlugin();
      });
      return LoadDiv();
    },
  });

  // 修改头像 event bind
  function bindGroupHeadPlugin() {
    var $upload = $groupSelect.find('.uploadGroupAvatar');
    var $input = $groupSelect.find('.hiddenUploadGroupAvatar');

    $groupSelect.on('click', '.singleHead', function (event) {
      var $this = $(this);
      var avatar = $this.data('name');
      if (avatar) {
        $avatar.attr('src', `${srcBasePath + avatar}?imageView2/1/w/100/h/100/q/90`);
        CreateGroup.options.avatar = avatar;
      }
    });

    $input.on('click', function (event) {
      event.stopPropagation();
    });

    // bind attachmentPlayer
    require(['uploadAttachment'], function () {
      $input.uploadAttachment({
        filterExtensions: 'gif,png,jpg,jpeg,bmp',
        pluploadID: '#uploadGroupAvatar',
        multiSelection: false,
        maxTotalSize: 4,
        folder: 'GroupAvatar',
        fileNamePrefix: 'GroupAvatarImage_',
        onlyFolder: true,
        onlyOne: true,
        styleType: '0',
        tokenType: 2,
        checkProjectLimitFileSizeUrl: '',
        filesAdded: function () {
          $upload.html("<i class='uploadTip'>" + tips.uploadingTip + '</i>');
        },
        createPicProgressBar: '',
        callback: function (attachments) {
          $upload.html(tips.customAvatarTip);

          if (attachments.length > 0) {
            var attachment = attachments[0];
            var avatar = attachment.fileName + attachment.fileExt;
            CreateGroup.options.avatar = avatar;

            $avatar.attr('src', `${srcBasePath + avatar}?imageView2/1/w/100/h/100/q/90`);
          }
        },
      });
    });
  }

  var $triggers = CreateGroup.$content.find('.groupHead,.modifyGroupAvatar');
  $triggers.on('click', function (e) {
    $avatar.poshytip('show');
    e.stopPropagation();
  });

  $(document)
    .off('click.createGroup scroll.createGroup')
    .on('click.createGroup scroll.createGroup', function () {
      $avatar.poshytip('hide');
    });
};

CreateGroup.checkIsProjectAdmin = function () {
  var $dialogBoxCreateGroup = CreateGroup.$content;
  var $officialGroup = $dialogBoxCreateGroup.find('.officialGroup');
  $dialogBoxCreateGroup.find('.selectDep').html(tips.selectDepartment).hide();
  $dialogBoxCreateGroup.find('.deptCheckbox').prop('checked', false);
  CreateGroup.options.selectedDeptSetting = null;

  if (CreateGroup.options.settings.projectId) {
    userController
      .validateUserIsProjectAdmin({
        projectId: CreateGroup.options.settings.projectId,
      })
      .then(function (result) {
        if (result) {
          $officialGroup.show();
        } else {
          $officialGroup.hide();
        }
      });
  } else {
    $officialGroup.hide();
  }

  CreateGroup.disableBtn();
};

CreateGroup.disableBtn = function () {
  var $dialogBoxCreateGroup = CreateGroup.$content;
  var $btnCreate = $dialogBoxCreateGroup.find('.btnCreate');

  var _projectId = CreateGroup.options.settings.projectId;
  require('mdFunction')
    .expireDialogAsync(_projectId)
    .then(
      function () {
        $btnCreate.prop('disabled', false).removeAttr('style');
      },
      function () {
        $btnCreate.prop('disabled', true).css('cursor', 'not-allowed');
      },
    );
};

CreateGroup.createGroupConfirm = function () {
  var $dialogBoxCreateGroup = CreateGroup.$content;
  var about = $dialogBoxCreateGroup.find('.txtGroupAbout').val().trim();
  var groupName = $dialogBoxCreateGroup.find('.txtGroupName').val().trim();
  var $createBtn = $dialogBoxCreateGroup.find('.btnCreate');

  var departmentId = null;
  if (CreateGroup.options.selectedDeptSetting) {
    departmentId = CreateGroup.options.selectedDeptSetting.departmentId;
  }

  $createBtn.prop('disabled', true).val(tips.btnCreating);

  groupController
    .addGroup({
      groupName: groupName,
      groupAbout: about,
      groupAvatar: CreateGroup.options.avatar,
      isApproval: CreateGroup.options.settings.openApproval,
      projectId: CreateGroup.options.settings.projectId || '',
      mapDepartmentId: departmentId || '',
    })
    .then(function (result) {
      if (result) {
        CreateGroup.dialog.closeDialog();
        // chat处理回调
        if (typeof CreateGroup.options.settings.callback === 'function') {
          CreateGroup.options.settings.callback.call(null, result);
        }
      } else {
        alert(tips.createErrorTip, 2);
        $createBtn.prop('disabled', false).val(tips.btnCreate);
      }
    });
};

module.exports = CreateGroup;
