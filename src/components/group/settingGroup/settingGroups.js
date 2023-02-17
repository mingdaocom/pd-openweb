import './settingGroups.css';
import '@mdfe/jquery-plupload';
import 'src/components/mdBusinessCard/mdBusinessCard';
import '@mdfe/poshytip';
import { htmlEncodeReg, encrypt } from 'src/util';
import groupController from 'src/api/group';
import invitationController from 'src/api/invitation';
import doT from '@mdfe/dot';
import { index as dialog } from 'src/components/mdDialog/dialog';
var ActionResult = {
  MissParams: -2,
  NotLogin: -1,
  Failed: 0,
  Success: 1,
  OnlyGroupAdmin: 2,
  ApprovalUserNotExist: 3,
};
import mainHtml from './tpl/main.html';
import filterXSS from 'xss';
import groupHeadHtml from './tpl/groupHead.html';
import groupInfoHtml from './tpl/groupInfo.html';
import groupUserHtml from './tpl/groupUser.html';
import groupSettingsHtml from './tpl/groupSettings.html';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { expireDialogAsync, existAccountHint } from 'src/components/common/function';
import DialogSelectMapGroupDepart from 'src/components/dialogSelectMapGroupDepart/dialogSelectMapGroupDepart';
import 'src/components/dialogSelectUser/dialogSelectUser';
import 'src/components/uploadAttachment/uploadAttachment';
import addFriends from 'src/components/addFriends/addFriends';
import 'src/components/select/select';
import moment from 'moment';

var tips = {
  MDGroup: _l('个人群组'),
  stateTip: _l('该群组已关闭或删除'),
  closeTip: _l('群组已经关闭'),
  remove: _l('移出聊天'),
  confirmExitTitle: _l('是否确认退出？'),
  confirmExitTextGroup: _l('退出聊天后，您将不能进入这个聊天'),
  confirmExitTextPostGroup: _l('退出群组后，您将不能进入这个群组'),
  confirmDelTitle: _l('是否确认解散？'),
  confirmDelText: _l('聊天解散后，将永久删除该聊天。不可恢复'),
  confirmDelGroupText: _l('群组解散后，将永久删除该群组。不可恢复'),
  confirmCloseTitle: _l('是否确认关闭群组？'),
  confirmCloseText1: _l('关闭群组后，群组将不能被访问'),
  confirmCloseText2: _l('您可以在通讯录群组列表中找到并重新开启这个群组'),
  convertDialogTitle: _l('转换为长期群组'),
  convertProject: _l('所在组织'),
  convertTip: _l('点选转换后，该长期群组将永久隶属于此组织，不可更改'),
  authTip: _l('组织管理员才有权限设置关联部门'),
  uploadingTip: _l('上传中'),
  customAvatar: '+ ' + _l('使用自定义头像'),
  nameTooLongTip: _l('您输入的群组名字过长，不能超过64个字符'),
  nameNullTip: _l('群组名字不能为空'),
  selectDepartment: _l('请设置关联部门'),
  roleAdmin: _l('管理员'),
  roleMember: _l('成员'),
  onlyAdminTip: _l('您是该群组的唯一管理员，请指定一名管理员再退出群组'),
  removeUserFromGroupTip: _l('从群组中移除成功'),
  removeUserFromChatTip: _l('从聊天中移除成功'),
  inviteSuccess: _l('重新邀请成功'),
  inviteFailed: _l('重新邀请失败'),
};

var SettingGroup = function(el, opts) {
  this.init(opts);
};

// DEFAULT options
SettingGroup.DEFAULT = {
  groupId: '', // groupId
  viewType: 0, // 0 信息 1 成员 2 设置
  groupAction: {
    // groupAction callback type
    DELETE: 'DELETE', //删除 解散群组
    ADD: 'ADD', //创建群组
    RENAME: 'RENAME', //群组重命名
    UPDATE_DESC: 'UPDATE_DESC', // 修改描述
    ADD_MEMBER: 'ADD_MEMBER', //群组加人
    ADD_MEMBERS: 'ADD_MEMBERS', //群组加多人
    REMOVE_MEMBER: 'REMOVE_MEMBER', //群组移除成员
    ADD_ADMIN: 'ADD_ADMIN', //群组设置群组管理员
    REMOVE_ADMIN: 'REMOVE_ADMIN', //群组移除管理员
    EXIT_GROUP: 'EXIT_GROUP', //退出群组
    CLOSE_GROUP: 'CLOSE_GROUP', //关闭群组
    UPDATE_POST: 'UPDATE_POST', //讨论组转群组
    UPDATE_AVATAR: 'UPDATE_AVATAR', //群组头像
    TROUBLE_FREE: 'TROUBLE_FREE', //消息免打扰
    APPROVE: 'APPROVE', //审批加入
    ADD_IN_COMPANY: 'ADD_IN_COMPANY', // 加入公司群组列表
    VERIFY: 'VERIFY', // 关联部门
    FORBID_INVITE: 'FORBID_INVITE', // 邀请成员权限
    FORBID_SPEAK: 'FORBID_SPEAK', // 全群禁言
  },
  success: function(type, data) {
    // $.publish() $.subscribe()
  },
  settingsCallback: null,
  // common config
  resetOffset: true,
  // userList config
  keywords: '', // 成员搜索关键字
  isLoadingUser: false,
  isAppend: false,
  pageIndex: 1,
  pageSize: 10,
  isMoreUsers: true, // 存在更多成员
  // cache data
  isRefresh: {
    info: true,
    member: true,
  },
  isPost: false, // true是群组    false是讨论组
  deptMapData: {
    depID: '',
    depName: '',
    projectId: '',
  },
};

$.extend(SettingGroup.prototype, {
  /*---------- Utils start------------------*/
  getOptions: function(opts) {
    var options = $.extend(true, {}, SettingGroup.DEFAULT, opts);
    options.groupID = options.groupID || options.groupId;
    return options;
  },
  opSuccess: function(type, args, tip) {
    var _this = this;
    var options = _this.options;
    var msg = tip === undefined ? _l('操作成功') : tip;
    if (msg !== null) {
      alert(msg, 1);
    }
    if (type && $.isFunction(options.success)) {
      options.success(options.groupAction[type], args);
    }
  },
  opFailed: function(hint, type) {
    alert(hint || _l('操作失败'), type || 2);
  },
  /*---------- init start------------------*/
  init: function(opts) {
    this.options = this.getOptions(opts);

    var _this = this;
    var options = _this.options;
    if (options.groupID) {
      _this.showDialog();
    } else {
      throw new Error('groupId required');
    }
  },
  cacheData: function(result) {
    var _this = this;
    var options = _this.options;
    options.isRefresh.info = false;
    result.name = filterXSS(result.name, {
      stripIgnoreTag: true,
    });
    options.isPost = result.isPost;
    options.isApproval = result.isApproval;
    options.isAdmin = result.isAdmin;
    options.isForbidInvite = result.isForbidInvite;
    options.projectId = (result.project && result.project.projectId) || '';
    options.isProjectAdmin = result.project && result.project.isProjectAdmin;
    // cache group data
    options.data = result;
    options.data.createTime = moment(result.createTime).format(_l('YYYY年MM月DD日'));

    // 官方群组
    if (result.isVerified) {
      options.deptMapData.depID = result.mapDepartmentId;
      options.deptMapData.depName = result.mapDepartmentName;
    }
  },
  // render
  showDialog: function() {
    var _this = this;
    var options = this.options;
    options.dialogId = 'dialogBoxSettingGroup_' + options.groupID;
    options.resetOffset = true;
    this.dialog = dialog({
      dialogBoxID: options.dialogId,
      className: 'dialogBoxSettingGroup',
      container: {
        header: '',
        yesText: '',
        noText: '',
      },
      width: 446,
      callback: function() {
        // 关闭 头像选择
        _this.$avatar && _this.$avatar.poshytip('destroy');
        _this = null;
      },
    });

    groupController
      .getGroupInfo({
        groupId: options.groupID,
      })
      .then(function(result) {
        if (result && result.status === 1) {
          _this.cacheData(result);
          // render dialog
          _this.dialog.content(doT.template(mainHtml)(options));
          // get DOM
          _this.getContent();
          // bind event
          _this.initEvent();

          if (_this.options.isPost) {
            _this.initGroupTab();
          } else {
            _this.$groupInfo
              .removeClass('Hidden')
              .html(LoadDiv())
              .siblings()
              .addClass('Hidden');
            _this.renderGroupInfo(_this.$groupInfo);
          }
        } else {
          _this.dialog.closeDialog();
          alert(tips.stateTip, 3);
        }
      });
  },
  getContent: function() {
    var _this = this;
    var options = this.options;
    // dialog
    _this.$container = $('#' + options.dialogId);
    // dialog top content
    _this.$avatar = _this.$container.find('.groupAvatar');
    _this.$name = _this.$container.find('.groupNameTotal .groupName');
    _this.$groupIcon = _this.$container.find('.groupNameTotal .groupIcon');
    _this.$tabList = _this.$container.find('.groupTabList');
    // dialog tab content
    _this.$content = _this.$container.find('.groupSettingContent');
    _this.$groupInfo = _this.$content.find('.groupInfo');
    _this.$groupMember = _this.$content.find('.groupMember');
    _this.$groupSettings = _this.$content.find('.groupSettings');
  },
  /* event bind start */
  // bind event
  initEvent: function() {
    var _this = this;
    // bind groupInfo Event
    _this.bindGroupInfoEvent();
    // comm event
    _this.bindCommEvent();
    // bind addmember Event
    _this.quickInviteEvent();
    // bind invite
    _this.inviteFriends();
    // 不是群组 不绑定 userList 和 settings 事件
    if (_this.options.isPost) {
      // bind groupHead Event
      _this.bindHeadEvent();
      // bind memberlist Event
      _this.bindGroupMemberEvent();
      // bind groupSetting Event
      _this.bindGroupSettingEvent();
    }
  },

  bindHeadEvent: function() {
    var _this = this;
    var options = this.options;
    var $triggers;
    // noAuth return
    if (!options.isAdmin) return;

    _this.bindPoshytip($.proxy(_this.bindGroupHeadPlugin, _this));

    $triggers = _this.$container.find('.groupHead');
    $triggers.on('click', function(e) {
      _this.$avatar.poshytip('show');
      e.stopPropagation();
    });

    $(document)
      .off('click.groupSetting scroll.groupSetting')
      .on('click.groupSetting scroll.groupSetting', function() {
        _this.$avatar.poshytip('hide');
      });
  },

  bindGroupInfoEvent: function() {
    var _this = this;
    var options = _this.options;
    var $groupInfo = _this.$groupInfo;

    // post group qrcode
    if (options.isPost) {
      $groupInfo.one('mouseenter', '.qrcode', function() {
        var $this = $(this);
        $this.poshytip({
          showOn: 'hover',
          content: function(updateCallback) {
            invitationController
              .getQRCodeInviteLink({
                sourceId: options.groupID,
                fromType: 1,
                linkFromType: 4,
                width: 100,
                height: 100,
              })
              .then(function(data) {
                options.qrCodeUrl = data.linkUrl;
                var oImg = new Image();
                oImg.src = options.qrCodeUrl;
                oImg.onload = function() {
                  updateCallback('<img class="TxtBottom groupQRCodeImg" src="' + options.qrCodeUrl + '"/>');
                };
              });
            return LoadDiv();
          },
          alignTo: 'target',
          alignX: 'center',
          alignY: 'bottom',
          keepInViewport: false,
        });
        $this.poshytip('show');
      });
    }
    // auth
    if (options.isAdmin) {
      // update group name and description
      $groupInfo.on('blur', '.groupTextBox', function() {
        var $this = $(this);
        var val = $this.val();
        if ($this.data('content') == $this.val()) return;
        if ($this.is('.groupName')) {
          _this.updateGroupName(val).then(
            function() {
              _this.opSuccess(options.groupAction['RENAME'], {
                groupId: options.groupID,
                groupName: val,
              });
              options.data.name = htmlEncodeReg(val);
              options.isRefresh.info = true;
              $this.val(val).data('content', val);
              _this.$name.text(val).attr('title', val);
            },
            function(hint) {
              $this.val($this.data('content'));
              _this.opFailed(hint);
            },
          );
        } else {
          _this.updateGroupDesc(val).then(
            function() {
              $this.val(val).data('content', val);
              options.isRefresh.info = true;
              _this.opSuccess(options.groupAction['UPDATE_DESC'], {
                groupId: options.groupID,
                groupAbout: val,
              });
            },
            function() {
              $this.val($this.data('content'));
              _this.opFailed();
            },
          );
        }
      });
      $groupInfo.on('keydown', '.groupTextBox', function(event) {
        const { keyCode } = event;
        if (keyCode === 13) {
          $(this).blur();
        }
      });
    }
  },

  bindGroupMemberEvent: function() {
    var _this = this;
    var options = _this.options;
    var $groupMember = _this.$groupMember;

    // noAuth return
    if (!options.isAdmin) return;
    // member type change

    $groupMember.on('click', '.settingMemberRole', function(event) {
      var $elem = $(this);
      _this.buildGroupMemberOpList($elem);
      event.stopPropagation();
    });

    $groupMember.on('click', '.groupMemberOp', function(e) {
      e.stopPropagation();
      var accountId = $(this)
        .parent()
        .data('accountid');
      var type = $(this).data('op');
      var types = {
        0: 'admin',
        1: 'member',
        2: 'remove',
        3: 'apply',
        4: 'refuse',
        5: 'reactive',
        6: 'deactive',
      };

      _this.updateGroupMember(accountId, types[type]);

      _this.$opList.addClass('Hidden');
    });

    $(document)
      .off('click.groupSettingUserOp')
      .on('click.groupSettingUserOp', function(event) {
        var $target = $(event.target);
        // click area out of opList
        if ($target.closest('.groupMember .operation').length <= 0) {
          _this.$opList && _this.$opList.addClass('Hidden');
        }
      });
  },

  bindGroupSettingEvent: function() {
    var _this = this;
    var options = _this.options;
    var $groupSettings = _this.$groupSettings;

    $groupSettings.on('click', '.singleSetting label', function() {
      var $checkbox = $(this).prev(),
        type = $checkbox.data('type');
      switch (type) {
        case 'silence':
          // 消息免打扰
          _this.updateGroupNotice($checkbox);
          break;
        case 'approval':
          // 加入群组需要审批
          _this.updateGroupApprove($checkbox);
          break;
        case 'addInList':
          // 群组加入公司群组列表
          _this.updateGroupList($checkbox);
          break;
        case 'associate':
          // 设为官方群组
          _this.updateGroupAssociate($checkbox);
          break;
        case 'chatAuth':
          // 全群禁言
          _this.updateGroupChatAuth($checkbox);
          break;
        case 'inviteAuth':
          // 非管理员邀请权限
          _this.updateGroupInviteAuth($checkbox);
          break;
        default:
          break;
      }
    });
    // no auth return
    if (!options.isAdmin) return;
    // setting associated department
    $groupSettings.on('click', '.officialDepSelect', function() {
      var groupDeptMapData = options.deptMapData;
      if (!options.isProjectAdmin) {
        alert(tips.authTip, 3);
        return false;
      }
      if (options.projectId) {
        DialogSelectMapGroupDepart({
          defaultSelectId: groupDeptMapData.depID,
          projectId: options.projectId,
          callback: function(data) {
            if (!data.departmentName) return;
            _this.updateGroupDepartment(data.departmentId, data.departmentName);
          },
        });
      }
    });
  },

  bindCommEvent: function() {
    var _this = this;
    var options = _this.options;
    var $opeartion;
    // bind bussinessCard
    _this.$container.on('mouseover', 'img[data-accountid]', function() {
      var $this = $(this);
      if ($this.data('bind')) return;
      var accountId = $this.data('accountid');
      var opHtml =
        !options.isPost && accountId !== md.global.Account.accountId && options.isAdmin
          ? '<div class="removeUser TxtCenter Hand" data-accountid="' + accountId + '">' + tips.remove + '</div>'
          : '';
      $(this).mdBusinessCard({
        reset: true,
        secretType: 1,
        accountId: accountId,
        opHtml: opHtml,
        readyFn: function(settings, $dialog) {
          if (!options.isPost) {
            $dialog.on('click', '.removeUser', function() {
              // 移除讨论组成员
              _this.removeUser(accountId, 'remove');
              $dialog.remove();
            });
          }
        },
      });
      $this.data('bind', true);
      $this.trigger('mouseenter');
    });

    // exit, delete, close group buttons
    _this.$container.on('click', '.exitGroup,.deleteGroup,.closeGroup', function() {
      var $this = $(this);
      var type = $this.data('type');
      var groupName = htmlEncodeReg(options.data.name);
      var groupId = options.data.groupId;
      switch (type) {
        case 'exit':
          _this.exitGroup(groupId, groupName);
          break;
        case 'delete':
          _this.deleteGroup(groupId, groupName);
          break;
        case 'close':
          _this.closeGroup(groupId, groupName);
        default:
          break;
      }
    });

    if (!options.isPost) {
      // 讨论组转群
      _this.$groupInfo.on('click', '.convertLink', function() {
        _this.updateGroupToPost();
      });
      // 消息免打扰
      _this.$groupInfo.on('click', '.discussionChatNotice label', function() {
        var $checkbox = $(this).prev();
        _this.updateGroupNotice($checkbox);
      });
    }
  },

  bindUserSearchEvent: function() {
    var _this = this;
    var options = this.options;
    var $groupMember = this.$groupMember;
    var $inputWrapper = $groupMember.find('.searchWrapper');
    var $input = $groupMember.find('.searchInput');
    var $clean = $groupMember.find('.searchCloseIcon');

    $clean.on('click', function() {
      options.keywords = '';
      options.pageIndex = 1;
      options.isMoreUsers = true;
      $input.val('');
      $clean.toggleClass('Hidden', options.keywords === '');
      _this.fetchGroupMember();
    });

    $input.on('focus blur', function(e) {
      var type = e.type;
      $inputWrapper.toggleClass('ThemeBorderColor3', type === 'focus');
    });

    $input.focus().on('keyup', function(event) {
      if (options.keywords !== this.value) {
        options.keywords = $.trim(this.value);
        $clean.toggleClass('Hidden', options.keywords === '');
      }
      if (event.which === 13) {
        options.pageIndex = 1;
        options.isMoreUsers = true;
        _this.fetchGroupMember();
      }
    });

    $groupMember.find('.groupUserList').on('scroll', function(e) {
      e.stopPropagation();

      var scrollHeight = this.scrollHeight,
        scrollTop = this.scrollTop,
        height = this.clientHeight;
      if (scrollHeight <= height + scrollTop + 30 && options.isMoreUsers && !options.isLoadingUser) {
        options.pageIndex++;
        _this.fetchGroupMember();
      }
    });
  },

  // toggle Tab
  toggleGroupTab: function(type) {
    var _this = this;
    var TYPES = (function() {
      var types = {};
      types[(types['info'] = 0)] = 'info';
      types[(types['member'] = 1)] = 'member';
      types[(types['settings'] = 2)] = 'settings';
      return types;
    })();
    var index = typeof type === 'number' ? type : TYPES[type];

    _this.$tabList
      .find('.commItem')
      .eq(index)
      .addClass('activation')
      .siblings()
      .removeClass('activation');

    _this.$content
      .children()
      .eq(index)
      .removeClass('Hidden')
      .siblings()
      .addClass('Hidden');

    if (index == 0) {
      _this.loadGroupInfo();
    } else if (index == 1) {
      _this.loadGroupMember();
    } else {
      _this.loadGroupSettings();
    }
  },

  initGroupTab: function() {
    var _this = this;
    var options = _this.options;

    _this.$tabList.on('click', '.commItem', function() {
      _this.toggleGroupTab($(this).index());
    });

    _this.toggleGroupTab(options.viewType);
  },

  // 添加成员
  quickInviteEvent: function() {
    var _this = this;
    var options = _this.options;

    // add member
    _this.$container.on('click', '.addChatMember,.addGroupMember,.addGroupMemberTitle', function() {
      $(this).dialogSelectUser({
        sourceId: options.groupID,
        fromType: 1,
        SelectUserSettings: {
          callback: function(userArray) {
            _this.addMembers(userArray);
          },
        },
        ChooseInviteSettings: {
          callback: function(data, callbackInviteResult) {
            var accountObj = {};
            $.map(data, function(item) {
              accountObj[encrypt(item.account)] = item.fullname;
            });
            _this.inviteMembers(accountObj, callbackInviteResult);
          },
        },
      });
    });
  },
  // 邀请
  inviteFriends: function() {
    var _this = this;
    var options = _this.options;
    var group = _this.options.data;

    _this.$container.on('click', '.addGroupFriends', function() {
      addFriends({
        projectId: options.groupID,
        fromType: 1,
        fromText: group.name,
      });
    });
  },
  /** init top Head plugin start */
  // 头像选择层 组件绑定
  bindPoshytip: function(callback) {
    var _this = this;
    _this.$avatar.data('bind', true);
    _this.$avatar.poshytip({
      additionalClassName: 'z-depth-1-half groupSettingAvatarSelect',
      showOn: 'none',
      showTimeout: 0,
      alignTo: 'target',
      alignX: 'center',
      alignY: 'bottom',
      showAniDuration: 0,
      offsetY: 8,
      fixed: true,
      content: function(updateCallback) {
        groupController.getGroupAvatarSelectList().then(function(result) {
          _this.$groupSelect = $(doT.template(groupHeadHtml)(result));
          updateCallback(_this.$groupSelect);
          callback();
        });
        return LoadDiv();
      },
    });
  },

  // 修改头像 event bind
  bindGroupHeadPlugin: function() {
    var _this = this;
    var options = this.options;
    var $groupSelect = this.$groupSelect;
    var $upload = $groupSelect.find('.uploadGroupAvatar');
    var $input = $groupSelect.find('.hiddenUploadGroupAvatar');

    $groupSelect.on('click', '.singleHead', function() {
      var $this = $(this);
      var avatar = $this.data('name');
      if (avatar) {
        _this.updateGroupHead(avatar);
      }
    });

    $input.on('click', function(event) {
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
      filesAdded: function() {
        $upload.html("<i class='uploadTip'>" + tips.uploadingTip + '</i>');
      },
      createPicProgressBar: '',
      callback: function(attachments) {
        $upload.html(tips.customAvatar);

        if (attachments.length > 0) {
          var attachment = attachments[0];
          var fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          var avatar = attachment.fileName + attachment.fileExt;
          // modify group Head
          _this.updateGroupHead(avatar);
        }
      },
    });
  },

  buildGroupMemberOpList: function($elem) {
    var _this = this;
    var $ops;
    var type = $elem.data('type');

    _this.$opList = _this.$groupMember.find('.operation');
    $ops = _this.$opList.children().removeClass('Hidden');
    _this.$opList.addClass('Hidden');
    if (type == 'apply') {
      $ops.not('.apply').addClass('Hidden');
    } else if (type == 'admin') {
      $ops.not('.member,.remove').addClass('Hidden');
    } else if (type == 'member') {
      $ops.not('.admin,.remove').addClass('Hidden');
    } else if (type == 'active') {
      $ops.not('.active').addClass('Hidden');
    } else {
      return false;
    }

    // set positon
    var pos = $elem.position();
    _this.$opList
      .css({
        left: pos.left - 110 + $elem.width(),
        top: pos.top + 40,
      })
      .removeClass('Hidden')
      .data('accountid', $elem.closest('.singleUser').data('accountid'));
  },

  /*---------- tab init ------------------*/

  // 群组和讨论组 基本信息
  loadGroupInfo: function() {
    var _this = this;
    var options = _this.options;
    var $groupInfo = _this.$groupInfo;

    $groupInfo
      .removeClass('Hidden')
      .html(LoadDiv())
      .siblings()
      .addClass('Hidden');
    // 是否重新获取 新的数据
    if (options.isRefresh.info || !options.isPost) {
      groupController
        .getGroupInfo({
          groupId: options.groupID,
        })
        .then(function(result) {
          _this.cacheData(result);
          // render dialog
          _this.renderGroupInfo($groupInfo);
        });
    } else {
      _this.renderGroupInfo($groupInfo);
    }
  },

  renderGroupInfo: function($box) {
    var _this = this;
    var group = this.options.data;
    // rebuild group title
    _this.$container.find('.groupNameTotal .groupIcon').toggleClass('Hidden', !group.isVerified);
    _this.$container
      .find('.groupNameTotal .groupName')
      .text(group.name)
      .attr('title', group.name);
    group.isGroup = this.options.isPost;

    var tpl = doT.template(groupInfoHtml)(group);
    $box.html(tpl);

    if (this.options.resetOffset) {
      _this.dialog.dialogCenter();
      this.options.resetOffset = false;
    }
  },
  // 群组成员
  loadGroupMember: function() {
    var _this = this;
    var options = _this.options;
    var $groupMember = _this.$groupMember;

    $groupMember
      .removeClass('Hidden')
      .html(LoadDiv())
      .siblings()
      .addClass('Hidden');
    // 是否重新获取 新的数据
    if (options.isRefresh.member) {
      options.isLoadingUser = false;
      options.isRefresh.member = false;
      options.keywords = '';
      options.pageIndex = 1;
      options.isAppend = false;
      options.isMoreUsers = true;

      _this.fetchGroupMember(true);
    } else {
      _this.renderGroupMember($groupMember);
    }
  },
  // 加载成员
  fetchGroupMember: function(isReload) {
    var _this = this;
    var options = this.options;
    if (options.isLoadingUser || !options.isMoreUsers) return;
    options.isLoadingUser = true;
    if (!isReload && options.pageIndex === 1) {
      _this.$groupMember.find('.groupUserList').html(LoadDiv());
    }
    groupController
      .getGroupUsers({
        groupId: options.groupID,
        keywords: options.keywords,
        pageIndex: options.pageIndex,
        pageSize: options.pageSize,
      })
      .done(function(result) {
        if (result.groupUsers && result.groupUsers.length < options.pageSize) {
          options.isMoreUsers = false;
        }
        // cache group data
        if (options.pageIndex === 1) {
          options.users = result.groupUsers;
          if (isReload) {
            _this.renderGroupMember(_this.$groupMember);
          } else {
            _this.renderGroupMember(_this.$groupMember.find('.groupUserList'), true);
          }
        } else {
          options.users = options.users.concat(result.groupUsers);
          _this.renderGroupMember(_this.$groupMember.find('.groupUserList'), true);
        }
        // render userList
      })
      .always(function() {
        options.isLoadingUser = false;
      });
  },

  renderGroupMember: function($box, isAppend) {
    var _this = this;
    var options = this.options;
    var renderData = $.extend({}, options, {
      buildUser: isAppend,
    });

    $box.html(doT.template(groupUserHtml)(renderData));

    if (!isAppend) {
      this.bindUserSearchEvent();
    }

    if (options.resetOffset) {
      _this.dialog.dialogCenter();
      options.resetOffset = false;
    }
  },

  loadGroupSettings: function() {
    var _this = this;
    var options = _this.options;
    var $groupSettings = _this.$groupSettings;

    $groupSettings
      .removeClass('Hidden')
      .html(LoadDiv())
      .siblings()
      .addClass('Hidden');
    // 是否重新获取 新的数据
    if (options.isRefresh.info) {
      groupController
        .getGroupInfo({
          groupId: options.groupID,
        })
        .then(function(result) {
          _this.cacheData(result);
          _this.renderGroupSettings($groupSettings);
        });
    } else {
      _this.renderGroupSettings($groupSettings);
    }
  },

  renderGroupSettings: function($box) {
    var _this = this;
    var options = this.options;

    var tpl = doT.template(groupSettingsHtml)(options.data);
    $box.html(tpl);

    if (options.resetOffset) {
      _this.dialog.dialogCenter();
      options.resetOffset = false;
    }
  },
  /*---------- update methods start------------------*/
  // update: GroupHead
  updateGroupHead: function(avatar) {
    var _this = this;
    var options = _this.options;

    groupController
      .updateGroupAvatar({
        groupId: options.groupID,
        avatar: avatar,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['UPDATE_AVATAR'], {
            groupID: options.groupID,
            groupAvatar: result.avatar,
          });
          _this.$avatar.attr('src', result.avatar).poshytip('hide');
        } else {
          _this.opFailed();
        }
      });
  },
  // update: GroupName
  updateGroupName: function(groupName) {
    var _this = this;
    var options = _this.options;
    var dfd = $.Deferred();

    if (!$.trim(groupName)) {
      dfd.reject(tips.nameNullTip);
      return dfd.promise();
    } else if (groupName.length > 64) {
      dfd.reject(tips.nameTooLongTip);
      return dfd.promise();
    }

    groupController
      .updateGroupName({
        groupId: options.groupID,
        groupName: groupName,
      })
      .then(function(result) {
        if (result) {
          dfd.resolve();
        } else {
          dfd.reject();
        }
      });

    return dfd.promise();
  },
  // update: GroupAbout
  updateGroupDesc: function(groupDesc) {
    var _this = this;
    var options = _this.options;
    var dfd = $.Deferred();

    groupController
      .updateGroupAbout({
        groupId: options.groupID,
        groupAbout: groupDesc,
      })
      .then(function(result) {
        if (result) {
          dfd.resolve();
        } else {
          dfd.reject();
        }
      });

    return dfd.promise();
  },
  // update: discussion to group
  updateGroupToPost: function() {
    var _this = this;
    var options = this.options;
    var projectId = '';
    var dict = {};
    var content =
      '<p class="mTop15 Gray_6">' +
      tips.convertProject +
      '<input type="hidden" id="selectProject"></p>' +
      '<p class="mTop15 Gray_6">' +
      tips.convertTip +
      '</p>';
    var projects = $.map(md.global.Account.projects, function(p) {
      dict[p.projectId] = p.licenseType;
      return {
        id: p.projectId,
        name: p.companyName,
      };
    });

    projects.push({
      id: '',
      name: tips.MDGroup,
    });

    projectId = projects[0].id;

    var dialogInfo = dialog({
      dialogBoxID: 'convertToPost',
      showClose: false,
      width: 500,
      zIndex: 30,
      container: {
        header: tips.convertDialogTitle,
        content: content,
        yesFn: function() {
          groupController
            .updateGroupToPost({
              groupId: options.groupID,
              projectId: projectId,
            })
            .then(
              function(result) {
                if (result) {
                  // reopen groupSetting dialog
                  _this.dialog.closeDialog();
                  //_this.showDialog();
                  _this.opSuccess(options.groupAction['UPDATE_POST'], {
                    groupId: options.groupID,
                  });
                } else {
                  _this.opFailed();
                }
              },
              function() {
                _this.opFailed();
              },
            );
        },
      },
      status: 'enable',
      readyFn: function() {
        var $dialog = $('#convertToPost');
        $dialog.find('#selectProject').MDSelect({
          dataArr: projects,
          maxWidth: 300,
          onChange: function(id, name) {
            projectId = id;
            expireDialogAsync(projectId).then(
              function() {
                dialogInfo.enable();
              },
              function() {
                dialogInfo.disable();
              },
            );
          },
        });
      },
    });
  },
  // update: notice
  updateGroupNotice: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    groupController
      .updateGroupPushNotice({
        groupId: options.groupID,
        isPushNotice: isChecked,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['TROUBLE_FREE'], {
            groupId: options.groupID,
            isPushNotice: isChecked,
          });
          options.isRefresh.info = true;
        } else {
          // reset checkbox
          $switch.prop('checked', !isChecked);
          _this.opFailed();
        }
      });
  },
  // update: need approve
  updateGroupApprove: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    groupController
      .updateGroupApproval({
        groupId: options.groupID,
        isApproval: !isChecked,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['APPROVE'], {
            groupId: options.groupID,
            isApproval: !isChecked,
          });
          options.isRefresh.info = true;
        } else {
          // reset checkbox
          $switch.prop('checked', isChecked);
          _this.opFailed();
        }
      });
  },
  // update: add in company groupList
  updateGroupList: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    groupController
      .updateGroupHidden({
        groupId: options.groupID,
        isHidden: isChecked,
      })
      .then(function(result) {
        if (result) {
          options.isRefresh.info = true;
          _this.opSuccess(options.groupAction['ADD_IN_COMPANY'], {
            groupId: options.groupID,
            isHidden: !isChecked,
          });
        } else {
          // reset checkbox
          $switch.prop('checked', isChecked);
          _this.opFailed();
        }
      });
  },
  // update: assoiate department
  updateGroupAssociate: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    _this.$groupSettings.find('.officialDepSelect').toggleClass('Hidden', isChecked);
    if (isChecked) {
      // 取消关联 部门
      _this.updateGroupDepartment();
    }
  },
  // update: inviteAuth
  updateGroupInviteAuth: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    groupController
      .updateGroupForbidInvite({
        groupId: options.groupID,
        isForbidInvite: !isChecked,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['FORBID_INVITE'], {
            groupId: options.groupID,
            isForbidInvite: !isChecked,
          });
          options.isRefresh.info = true;
          options.isForbidInvite = !isChecked;
        } else {
          // reset checkbox
          $switch.prop('checked', isChecked);
          _this.opFailed();
        }
      });
  },
  // update: chatAuth
  updateGroupChatAuth: function($switch) {
    var _this = this;
    var options = _this.options;
    var isChecked = $switch.prop('checked');

    groupController
      .updateGroupForbidSpeak({
        groupId: options.groupID,
        isForbidSpeak: !isChecked,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['FORBID_SPEAK'], {
            groupId: options.groupID,
            isForbidSpeak: !isChecked,
          });
          options.isRefresh.info = true;
        } else {
          // reset checkbox
          $switch.prop('checked', isChecked);
          _this.opFailed();
        }
      });
  },

  // update: group department
  updateGroupDepartment: function(deptId, deptName) {
    var _this = this;
    var options = _this.options;
    var isClose = deptId === undefined;

    groupController
      .updateGroupVerified({
        groupId: options.groupID,
        isVerified: !isClose,
        mapDepartmentId: deptId,
      })
      .then(function(result) {
        if (result) {
          var newTitle = isClose ? tips.selectDepartment : _l('关联部门：') + deptName;
          _this.opSuccess(options.groupAction['VERIFY'], {
            groupId: options.groupID,
            deptID: deptId,
            deptName: deptName,
          });
          options.isRefresh.info = true;
          _this.$groupIcon.toggleClass('Hidden', isClose);
          _this.$groupSettings
            .find('.officialDepSelect')
            .html(newTitle)
            .attr('title', newTitle);
        } else {
          _this.opFailed();
        }
      });
  },

  // update: memberType
  updateGroupMember: function(accountId, type) {
    var _this = this;
    switch (type) {
      case 'apply':
        _this.passUser(accountId);
        break;
      case 'admin':
        _this.setAdmin(accountId);
        break;
      case 'member':
        _this.setMember(accountId);
        break;
      case 'refuse':
        _this.removeUser(accountId, 'refuse');
        break;
      case 'remove':
        _this.removeUser(accountId, 'remove');
        break;
      case 'reactive':
        _this.reInviteMembers([accountId]);
        break;
      case 'deactive':
        _this.removeUser(accountId, 'deactive');
        break;
      default:
        break;
    }
  },

  updateUserCallback: function(accountId, type) {
    var _this = this;
    var options = this.options;
    var $user = _this.$groupMember.find('.singleUser').filter('[data-accountid=' + accountId + ']');
    var $op = $user.find('.groupMemberOperation');
    options.isRefresh.info = true;
    options.isRefresh.member = true;
    if (type === 'pass') {
      $op
        .find('.settingMemberRole')
        .data('type', 'member')
        .find('.roleName')
        .text(tips.roleMember);
    } else if (type === 'admin') {
      $op
        .find('.settingMemberRole')
        .data('type', 'admin')
        .find('.roleName')
        .text(tips.roleAdmin);
    } else if (type === 'member') {
      $op
        .find('.settingMemberRole')
        .data('type', 'member')
        .find('.roleName')
        .text(tips.roleMember);
    } else {
      $user.slideUp(function() {
        $user.remove();
      });
    }
  },

  passUser: function(accountId) {
    var _this = this;
    var options = _this.options;
    var accounts = $.grep(options.users, function(user) {
      return user.accountId === accountId;
    });
    var aids = $.isArray(accountId) ? accountId : [accountId];

    groupController
      .passJoinGroup({
        groupId: options.groupID,
        accountIds: aids,
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['ADD_MEMBER'], {
            groupId: options.groupID,
            accounts: accounts,
          });
          // 回调
          _this.updateUserCallback(aids, 'pass');
        } else {
          _this.opFailed();
        }
      });
  },

  setAdmin: function(accountId) {
    var _this = this;
    var options = _this.options;

    groupController
      .addAdmin({
        groupId: options.groupID,
        accountIds: [accountId],
      })
      .then(function(result) {
        if (result) {
          _this.opSuccess(options.groupAction['ADD_ADMIN'], {
            groupId: options.groupID,
            accountId: accountId,
          });
          // 回调
          _this.updateUserCallback(accountId, 'admin');
        } else {
          _this.opFailed();
        }
      });
  },

  setMember: function(accountId) {
    var _this = this;
    var options = _this.options;

    groupController
      .removeAdmin({
        groupId: options.groupID,
        accountId: accountId,
      })
      .then(function(result) {
        if (result == ActionResult.Success) {
          _this.opSuccess(options.groupAction['REMOVE_ADMIN'], {
            groupId: options.groupID,
            accountId: accountId,
          });
          // 回调
          _this.updateUserCallback(accountId, 'member');
        } else if (result == ActionResult.OnlyGroupAdmin) {
          _this.opFailed(tips.onlyAdminTip, 3);
        } else {
          _this.opFailed();
        }
      });
  },

  addMembers: function(userArray) {
    var _this = this;
    var options = _this.options;
    var accountIds = $.map(userArray, function(user) {
      return user.accountId;
    });

    invitationController
      .inviteUser({
        sourceId: options.groupID,
        accountIds: accountIds,
        fromType: 1,
      })
      .then(function(result) {
        var formatedData = existAccountHint(result);
        if (formatedData.accountInfos.length) {
          _this.opSuccess(
            options.groupAction['ADD_MEMBERS'],
            {
              groupId: options.groupID,
              accounts: formatedData.accountInfos,
            },
            null,
          );
          options.isRefresh.member = true;
          if (options.isPost) {
            _this.toggleGroupTab('member');
          } else {
            _this.loadGroupInfo();
          }
        }
      });
  },

  inviteMembers: function(accounts, callbackInviteResult) {
    var _this = this;
    var options = _this.options;

    invitationController
      .inviteUser({
        sourceId: options.groupID,
        accounts: accounts,
        fromType: 1,
      })
      .then(function(result) {
        var formatedData = existAccountHint(result, callbackInviteResult);
        if (formatedData.accountInfos.length) {
          var accounts = $.grep(formatedData.accountInfos, function(account) {
            return account.accountStatus === 1;
          });
          _this.opSuccess(
            options.groupAction['ADD_MEMBERS'],
            {
              groupId: options.groupID,
              accounts: accounts,
            },
            null,
          );
          options.isRefresh.member = true;
          if (options.isPost) {
            _this.toggleGroupTab('member');
          } else {
            _this.loadGroupInfo();
          }
        }
      });
  },

  // reinvite member
  reInviteMembers: function(accountIds) {
    var _this = this;
    var options = _this.options;

    invitationController
      .inviteUser({
        sourceId: options.groupID,
        accountIds: accountIds,
        fromType: 1,
      })
      .then(function(result) {
        if (result.sendMessageResult) {
          alert(tips.inviteSuccess, 1);
        } else {
          alert(tips.inviteFailed, 2);
        }
      });
  },

  // remove, refuse, cancelinvite: member
  removeUser: function(accountId, type) {
    var _this = this;
    var options = _this.options;
    var func = type === 'remove' ? 'removeUser' : type === 'refuse' ? 'refuseUser' : 'cancelInviteUser';
    var tip = options.isPost ? tips.removeUserFromGroupTip : tips.removeUserFromChatTip;

    groupController[func]({
      groupId: options.groupID,
      accountId: accountId,
    }).then(function(result) {
      if (result) {
        _this.opSuccess(
          options.groupAction['REMOVE_MEMBER'],
          {
            groupId: options.groupID,
            accountId: accountId,
          },
          tip,
        );
        // 回调
        if (options.isPost) {
          _this.updateUserCallback(accountId, 'removeUser');
        } else {
          _this.loadGroupInfo();
        }
      } else {
        _this.opFailed();
      }
    });
  },

  // 删除（解散）群组、讨论组
  deleteGroup: function(groupIds) {
    var _this = this;
    var options = _this.options;
    var gids = $.isArray(groupIds) ? groupIds : [groupIds];

    Confirm({
      title: tips.confirmDelTitle,
      description: options.isPost ? tips.confirmDelGroupText : tips.confirmDelText,
      onOk: () => {
        groupController
          .removeGroup({
            groupIds: gids,
          })
          .then(function(result) {
            if (result) {
              _this.dialog.closeDialog();
              _this.opSuccess(options.groupAction['DELETE'], {
                groupId: groupIds,
              });
            } else {
              _this.opFailed();
            }
          });
      },
    });
  },
  // 关闭群组
  closeGroup: function(groupIds, groupName) {
    var _this = this;
    var options = _this.options;
    var gids = $.isArray(groupIds) ? groupIds : [groupIds];

    Confirm({
      title: tips.confirmCloseTitle,
      description: tips.confirmCloseText1 + '<br/>' + tips.confirmCloseText2,
      onOk: () => {
        groupController
          .closeGroup({
            groupIds: gids,
          })
          .then(function(result) {
            if (result) {
              _this.dialog.closeDialog();
              _this.opSuccess(
                options.groupAction['CLOSE_GROUP'],
                {
                  groupId: groupIds,
                },
                groupName + tips.closeTip,
              );
            } else {
              _this.opFailed();
            }
          });
      },
    });
  },
  // 退出群组、讨论组
  exitGroup: function(groupId, groupName) {
    var _this = this;
    var options = _this.options;

    Confirm({
      title: tips.confirmExitTitle,
      description: options.isPost ? tips.confirmExitTextPostGroup : tips.confirmExitTextGroup,
      onOk: () => {
        groupController
          .exitGroup({
            groupId: groupId,
          })
          .then(function(result) {
            if (result == ActionResult.Success) {
              var tip = options.isPost ? _l('%0群组已经退出', groupName) : _l('%0聊天已经退出', groupName);
              _this.dialog.closeDialog();
              _this.opSuccess(
                options.groupAction['EXIT_GROUP'],
                {
                  groupId: groupId,
                },
                tip,
              );
            } else if (result == ActionResult.OnlyGroupAdmin) {
              _this.opFailed(tips.onlyAdminTip, 3);
            } else {
              _this.opFailed();
            }
          });
      },
    });
  },
});

export default function(opts) {
  return new SettingGroup(null, opts);
};
