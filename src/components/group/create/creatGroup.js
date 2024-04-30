import './createGroup.css';
import { getStringBytes, upgradeVersionDialog, expireDialogAsync } from 'src/util';
import doT from 'dot';
import mainHtml from './tpl/main.html';
import groupHeadHtml from '../settingGroup/tpl/groupHead.html';
import { dialogSelectDept } from 'ming-ui/functions';
import 'src/components/uploadAttachment/uploadAttachment';
import groupController from 'src/api/group';
import userController from 'src/api/user';
import { Dialog, Dropdown } from 'ming-ui';
import React from 'react';
import ReactDom from 'react-dom';

var CreateGroup = {};
var projects = $.extend({}, md.global.Account).projects;
var project = projects && projects.length ? projects[0] : {};

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
  CreateGroup.options = $.extend(true, {}, DEFAULTS, { settings: settings });
  CreateGroup.options.selectedDeptSetting = null;
  const _projectId = CreateGroup.options.settings.projectId;
  const licenseType = ((md.global.Account.projects || []).find(o => o.projectId === _projectId) || {}).licenseType;
  if (licenseType === 0) {
    upgradeVersionDialog({
      projectId: _projectId,
      explainText: _l('请升级至付费版解锁开启'),
      isFree: true,
    });
    return;
  }

  if (CreateGroup.options.settings.projectId) {
    CreateGroup.options.isProject = true;
  } else {
    CreateGroup.options.isProject = false;
  }

  var tpl = doT.template(mainHtml)({
    createGroupInProject: CreateGroup.options.settings.createGroupInProject,
    isProject: CreateGroup.options.isProject,
    openApproval: CreateGroup.options.settings.openApproval,
    defaultAvatar: CreateGroup.options.defaultAvatar,
  });

  Dialog.confirm({
    dialogClasses: 'dialogBoxCreateGroup',
    width: 446,
    children: <div dangerouslySetInnerHTML={{ __html: tpl }}></div>,
    noFooter: true,
  });

  CreateGroup.$content = $('.dialogBoxCreateGroup');
  CreateGroup.checkIsProjectAdmin();
  CreateGroup.bindHeadAvatar();
  CreateGroup.bindEvent();
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

  var _projects = [];
  $.each(md.global.Account.projects, function (i, p) {
    _projects.push({
      value: p.projectId,
      text: p.companyName,
    });
  });

  ReactDom.render(
    <Dropdown
      className="w100"
      border
      data={_projects}
      isAppendToBody
      onChange={value => {
        CreateGroup.options.settings.projectId = value;
        CreateGroup.checkIsProjectAdmin();
      }}
    />,
    document.getElementById('hiddenCompanysBox'),
  );

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
    dialogSelectDept({
      projectId: CreateGroup.options.settings.projectId,
      unique: true,
      selectFn: data => {
        CreateGroup.options.selectedDeptSetting = data;
        $selectDep.html(_l('关联部门：【%0】', data.departmentName));
      },
    });
  });

  $dialogBoxCreateGroup.on('click', '.cancelCreate', function () {
    $('.dialogBoxCreateGroup').parent().remove();
  });

  $dialogBoxCreateGroup.on('click', '.btnCreate', function () {
    if ($(this).prop('disbled')) {
      return false;
    }
    var $txtGroupName = $('.dialogBoxCreateGroup .txtGroupName');
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
  var $groupHeader = CreateGroup.$content.find('.groupHeader');
  var $avatar = $container.find('.groupAvatar');
  var srcBasePath;

  CreateGroup.$avatar = $avatar;

  groupController.getGroupAvatarSelectList().then(function (result) {
    srcBasePath = result.basePath;

    $groupHeader.append(
      `<div class="z-depth-1-half createGroupAvatarSelect">
        ${doT.template(groupHeadHtml)(result)}
        <i class="icon-close Font20 pointer Gray_9e ThemeHoverColor3" />
      </div>`,
    );
    bindGroupHeadPlugin();
  });

  // 修改头像 event bind
  function bindGroupHeadPlugin() {
    var $groupSelect = $('.createGroupAvatarSelect .settingPictureLayer');
    var $upload = $groupSelect.find('.uploadGroupAvatar');
    var $input = $groupSelect.find('.hiddenUploadGroupAvatar');

    $('.createGroupAvatarSelect').on('click', '.icon-close', function () {
      $('.createGroupAvatarSelect').hide();
    });

    $groupSelect.on('click', '.singleHead', function () {
      var $this = $(this);
      var avatar = $this.data('name');
      if (avatar) {
        $avatar.attr('src', `${srcBasePath + avatar}?imageView2/1/w/100/h/100/q/90`);
        CreateGroup.options.avatar = avatar;
      }

      $('.createGroupAvatarSelect').hide();
    });

    $input.on('click', function (event) {
      event.stopPropagation();
    });

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
          $('.createGroupAvatarSelect').hide();
        }
      },
    });
  }

  var $triggers = CreateGroup.$content.find('.groupHead,.modifyGroupAvatar');
  $triggers.on('click', function (e) {
    $('.createGroupAvatarSelect').show();
    e.stopPropagation();
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

  expireDialogAsync(_projectId)
    .then(() => {
      $btnCreate.prop('disabled', false).removeAttr('style');
    })
    .catch(() => {
      $btnCreate.prop('disabled', true).css('cursor', 'not-allowed');
    });
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
        $('.dialogBoxCreateGroup').parent().remove();
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

export default CreateGroup;
