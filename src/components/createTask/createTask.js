import UploadFiles from 'src/components/UploadFiles';
import React from 'react';
import ReactDom from 'react-dom';
import createShare from 'src/components/createShare/createShare';
import Store from 'redux/configureStore';
import { addTask } from 'src/pages/task/redux/actions';
import { formatTaskTime } from 'src/pages/task/utils/utils';
import './css/createTask.css';
import ajaxRequest from 'src/api/taskCenter';
import calendarAjaxRequest from 'src/api/calendar';
import filterXss from 'xss';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import { htmlEncodeReg, expireDialogAsync } from 'src/util';
import doT from 'dot';
import taskHtml from './tpl/createTask.html';
import 'src/components/autoTextarea/autoTextarea';
import '@mdfe/jquery-plupload';
import moment from 'moment';
import { DateTimeRange } from 'ming-ui/components/NewDateTimePicker';
import UserCard from 'src/components/UserCard';
import { Dialog, Dropdown } from 'ming-ui';

var CreateTask = function(opts) {
  var _this = this;
  // 默认参数
  var defaults = {
    frameid: 'createTask',
    TaskName: '',
    Description: '',
    FolderID: '',
    ProjectID: null,
    folderName: '',
    PostID: '',
    CalenderID: '',
    recurTime: '',
    worksheetAndRowId: '',
    DialogName: _l('创建新任务'),
    Deadlines: '',
    StageID: '',
    StageName: '',
    createShare: null, // 给chat用，是否弹出层
    isFromPost: false, // 是否从动态添加
    taskTreeView: false,
    ChargeArray: [
      {
        accountId: md.global.Account.accountId,
        fullname: md.global.Account.fullname,
        avatar: md.global.Account.avatar,
      },
    ], // 示例：[{accountId:'9b0480ad-cdb3-4833-9d64-cdbef48f2785',fullname:'lio.wang'，avatar："头像"}] 任务负责人
    MemberArray: [], // 示例：[{accountId:'9b0480ad-cdb3-4833-9d64-cdbef48f2785',fullname:'lio.wang'，avatar}]//任务成员
    createTaskAttachments: {
      attachmentData: [],
      kcAttachmentData: [],
    },
    callback: null, // 创建完任务后回调函数
    shareCallback: null,
    relationCallback: null,
    itemId: '', // 检查项id
  };

  _this.settings = $.extend(defaults, opts);

  // 参数处理
  var settings = _this.settings;

  // 任务中心打开
  if (location.href.indexOf('task') >= 0 || location.href.indexOf('application') >= 0) {
    const $tasks = $('#tasks');
    if ($tasks.attr('data-fid')) {
      settings.ProjectID = $tasks.attr('data-pid');
      settings.FolderID = $tasks.attr('data-fid');
      settings.folderName =
        $('.folderList li[data-id=' + settings.FolderID + '] .folderName:first').text() ||
        $('.taskToolbar .folderName').text();
    }
  }

  CreateTask.settings = settings;
  _this.init();
};

$.extend(CreateTask.prototype, {
  // 初始化
  init: function() {
    var _this = this;
    var settings = _this.settings;
    var isExsit = false;

    if (settings.ProjectID === null) {
      var lastProjectId = window.localStorage.getItem('lastProjectId');
      if (lastProjectId !== null) {
        settings.ProjectID = lastProjectId;
      } else if ((md.global.Account.projects || []).length) {
        settings.ProjectID = md.global.Account.projects[0].projectId;
      } else {
        settings.ProjectID = '';
      }
    }

    // 监测网络是否过期
    $.map(md.global.Account.projects, function(project, i) {
      if (settings.ProjectID === project.projectId) {
        isExsit = true;
        if (project.licenseType === 0) {
          settings.ProjectID = '';
          return;
        }
      }
    });

    if (!md.global.Account.projects.length || !isExsit) {
      settings.ProjectID = '';
    }

    settings.companyName = _l('个人');
    $.map(md.global.Account.projects, function(project, i) {
      if (project.projectId === settings.ProjectID) {
        settings.companyName = project.companyName;
        return;
      }
    });
    // 创建弹出层
    Dialog.confirm({
      dialogClasses: `${settings.frameid} createTaskConfirm`,
      title: _l('创建任务'),
      width: 570,
      children: <div dangerouslySetInnerHTML={{ __html: doT.template(taskHtml)(settings) }}></div>,
      noFooter: true,
    });

    this.eventInit();
    var txt = $('#txtTaskName').val();
    $('#txtTaskName')
      .val('')
      .focus()
      .val(txt);
  },

  // 事件初始化
  eventInit: function() {
    var _this = this;
    var settings = _this.settings;

    // 用户头衔层
    _this.updateUserCard();

    // 所属网络事件初始化
    _this.networkInit();

    // 关联项目事件初始化
    _this.taskFolderInit();

    // 更改任务负责人事件初始化
    _this.updateChargeInit();

    // 成员模块方法初始化
    _this.membersInit();

    // 初始化附件
    _this.initAttachmentEvent();

    // 存在项目且不是未关联
    if (settings.FolderID && settings.FolderID !== '1') {
      CreateTask.Motheds.getFolderStage();
    }

    // tabs click
    $('#taskTabs span').on('click', function(event) {
      var $this = $(this);
      var type = $this.attr('data-type');

      event.stopPropagation();

      switch (type) {
        case 'member':
          $('#taskMembersBox').removeClass('Hidden');
          $this.remove();
          break;
        case 'date':
          $('#createTaskDate').removeClass('Hidden');
          $('#createTask_container').scrollTop(0);
          $this.remove();
          break;
        case 'desc':
          $('#createTaskDesc').removeClass('Hidden');
          $this.remove();
          break;
        default:
          break;
      }
    });

    // 到期日期初始化
    _this.deadlineInit();

    // 回车创建
    $('#txtTaskName').on('keypress', function(event) {
      if (event.keyCode === 13) {
        $('#' + settings.frameid)
          .find('#taskSubmitBtn')
          .click();
      }
    });

    // 创建
    $('#taskSubmitBtn').on({
      mouseover: function() {
        // 禁用
        if ($(this).attr('disabled')) {
          return false;
        }

        $(this).toggleClass('ThemeBGColor2 ThemeBGColor3');
      },
      mouseout: function() {
        // 禁用
        if ($(this).attr('disabled')) {
          return false;
        }

        $(this).toggleClass('ThemeBGColor2 ThemeBGColor3');
      },
      click: function() {
        if ($(this).attr('disabled')) {
          return false;
        }
        $(this).attr('disabled', 'disabled');
        CreateTask.Motheds.send();
      },
    });

    $(document).on('click', function(event) {
      var $target = $(event.target);

      // 隐藏所属网络
      if (!$target.closest('#createTaskNetworkList').length && !$target.closest('#createTaskNetwork').length) {
        $('#createTaskNetworkList').addClass('Hidden');
      }

      // 隐藏项目列表
      if (!$target.closest('#txtTaskFolder').length && !$('#txtTaskFolder').is(':focus')) {
        $('.linkageFolder').addClass('Hidden');
      }
    });
  },

  //更新userHead
  updateUserCard: function(user) {
    var settings = this.settings;
    $('#' + settings.frameid)
      .find('#taskUserBox,.imgMemberBox')
      .each((i, ele) => {
        var $this = $(ele);
        var accountId = $this.attr('data-id').replace(/@|\+/gi, '');
        if ($this.data('bind')) {
          return;
        }
        var type = $this.attr('id') === 'taskUserBox' ? 1 : 2;
        var avatar = user && user.accountId === accountId ? user.avatar : $this.find('.imgWidth').attr('src');
        var ext = {};
        if (type === 2) ext['data-id'] = accountId;
        ReactDom.render(
          <UserCard sourceId={accountId} disabled={accountId === 'user-undefined'}>
            <span>
              {type === 2 && (
                <span className="removeTaskMember circle">
                  <i className="icon-delete Icon"></i>
                </span>
              )}
              <img src={avatar} className={`imgWidth ${type === 2 ? 'createTaskMember circle' : ''}`} {...ext} />
            </span>
          </UserCard>,
          ele,
        );
        $this.data('bind', true);
      });
  },

  // 所属网络事件初始化
  networkInit: function() {
    // 所属网络
    var settings = this.settings;
    var $createTaskNetwork = $('#createTaskNetwork');
    var $createTaskNetworkList = $('#createTaskNetworkList');
    $createTaskNetwork.on('click', function() {
      $createTaskNetworkList.toggleClass('Hidden');
    });

    // 更改网络
    $createTaskNetworkList.on('click', 'li', function() {
      var $this = $(this);
      var projectId = $this.attr('data-id');
      if (projectId !== settings.ProjectID) {
        // 监测网络是否过期
        expireDialogAsync(projectId)
          .then(function() {
            $createTaskNetwork.find('.createTaskNetworkName').text($this.text());
            settings.ProjectID = projectId;
          })
          .fail(function() {
            $createTaskNetwork.find('.createTaskNetworkName').html(_l('个人'));
            settings.ProjectID = '';
          });
        settings.FolderID = '';
        var $taskUserBox = $('#taskUserBox');
        $taskUserBox
          .attr('data-id', md.global.Account.accountId)
          .find('.imgWidth')
          .attr('src', md.global.Account.avatar);
        $('.createTaskAddMemberBox .imgMemberBox').remove(md.global.Account.avatar);
        $('.createTaskFolderName')
          .html('...')
          .removeClass('Hidden');
        $('#txtTaskFolder')
          .val('')
          .addClass('Hidden');
        $('#createTaskStage').addClass('Hidden');
        $('#folderStage').val('');
      }
      $createTaskNetworkList.addClass('Hidden');
    });
  },

  // 关联项目事件初始化
  taskFolderInit: function() {
    var _this = this;
    var settings = _this.settings;

    // 关联项目切换
    var $txtTaskFolder = $('#txtTaskFolder');

    $('.createTaskFolder .createTaskFolderName').on({
      mouseover: function() {
        $(this).toggleClass('Hidden');
        $txtTaskFolder.toggleClass('Hidden');
      },
    });
    $txtTaskFolder.on({
      mouseout: function() {
        // 失去焦点并且离开
        if (!$(this).hasClass('isFocus')) {
          $(this).toggleClass('Hidden');
          $('.createTaskFolder .createTaskFolderName').toggleClass('Hidden');
        }
      },
      focus: function() {
        $(this).addClass('isFocus');
        if ($.trim($(this).val()) && $('.linkageFolder li').length > 0) {
          $('.linkageFolder .nullFolder').removeClass('Hidden');
          $('.linkageFolder').removeClass('Hidden');
        } else {
          $(this).keyup();
        }
      },
      keydown: function(event) {
        if (event.keyCode !== 38 && event.keyCode !== 40) {
          // 隐藏阶段
          $('#createTaskStage').addClass('Hidden');
        }
        // 回车
        if (event.keyCode === 13) {
          $('.linkageFolder li.hover').trigger('click');
          event.stopPropagation();
        }
        // 上下键
        if (event.keyCode === 38 || event.keyCode === 40) {
          var $linkageFolder = $('.linkageFolder');
          // 没有 或者只有一个
          if ($linkageFolder.find('li.item').length <= 0) {
            return;
          } else if ($linkageFolder.find('li.item').length === 1) {
            $linkageFolder.find('li').addClass('hover');
            return;
          }

          var index = $linkageFolder.find('li.item.hover').index();
          if (event.keyCode === 38) {
            if (index === 0) {
              $linkageFolder
                .find('li:last')
                .addClass('hover')
                .siblings()
                .removeClass('hover');
            } else {
              index--;
              $linkageFolder
                .find('li')
                .eq(index)
                .addClass('hover')
                .siblings()
                .removeClass('hover');
            }
          } else if (event.keyCode === 40) {
            var count = $linkageFolder.find('li.item').length - 1;
            if (index >= count) {
              $linkageFolder
                .find('li:first')
                .addClass('hover')
                .siblings()
                .removeClass('hover');
            } else {
              index++;
              $linkageFolder
                .find('li')
                .eq(index)
                .addClass('hover')
                .siblings()
                .removeClass('hover');
            }
          }
        }
      },
      keyup: function(event) {
        // 上下键
        if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13) {
          return;
        }

        settings.FolderID = '';
        settings.pageIndex = 1;
        CreateTask.Motheds.searchTaskFolder();
      },
      blur: function() {
        $(this)
          .removeClass('isFocus')
          .mouseout();
        var folderName = $.trim($(this).val());
        if (!folderName) {
          $('#folderStage').val('');
          $('#createTaskStage').addClass('Hidden');
        }
        $('.createTaskFolder .createTaskFolderName').text(folderName || '...');
      },
    });

    $('.linkageFolder ul').on('scroll', function() {
      if (!settings.isMore) {
        return;
      }
      var nDivHight = $(this).height();
      var nScrollHight = $(this)[0].scrollHeight;
      var nScrollTop = $(this)[0].scrollTop;

      if (nScrollTop + nDivHight + 30 >= nScrollHight) {
        settings.pageIndex++;
        CreateTask.Motheds.searchTaskFolder();
      }
    });

    $('.linkageFolder').on(
      {
        mouseover: function() {
          $(this).addClass('hover');
        },
        mouseout: function() {
          $(this).removeClass('hover');
        },
        click: function() {
          var folderName = $.trim(
            $(this)
              .find('.folderListName')
              .text(),
          );
          settings.FolderID = $(this).data('folderid');
          $('#txtTaskFolder').val(folderName);
          $('.createTaskFolder .createTaskFolderName, .createTaskFolder .nullFolder .folderListName').text(folderName);
          $('.linkageFolder').addClass('Hidden');
          if (settings.FolderID) {
            CreateTask.Motheds.getFolderStage();
          } else {
            $('#folderStage').val('');
          }
        },
      },
      'li.item,.nullFolder',
    );
  },

  // 更改任务负责人事件初始化
  updateChargeInit: function() {
    var settings = this.settings;
    var _that = this;
    $('#taskUpdateCharge').on({
      click: function() {
        var _this = $(this);
        var $taskUserBox = $('#taskUserBox');
        var oldUid = $taskUserBox.attr('data-id');

        var updateChargeFun = function(users) {
          var uid = users[0].accountId;
          // 相同
          if (oldUid === uid) {
            return;
          }
          var userImg = users[0].avatar;
          var oldImg = $('#taskUserBox img').attr('src');

          // 更改负责人
          $taskUserBox
            .attr('data-id', uid)
            .data('bind', false)
            .off()
            .find('img')
            .attr('src', userImg);

          // 如果是成员移除
          $('.createTaskAddMemberBox .createTaskMember').each(function() {
            var $this = $(this);
            if ($this.attr('data-id') === uid) {
              $this.parents('.imgMemberBox').remove();
            }
          });

          if (oldUid !== 'user-undefined') {
            var member = '';
            member += '<span class="imgMemberBox" data-id="' + oldUid + '">';
            member += '<span class="removeTaskMember circle"><i class="icon-delete Icon"></i></span>';
            member += '<img class="createTaskMember circle imgWidth" data-id="' + oldUid + '" src="' + oldImg + '" />';
            member += '</span>';

            // 原负责人改为成员
            $('.createTaskAddMember').before(member);
          }

          _that.updateUserCard(users[0]);
        };

        quickSelectUser(_this[0], {
          sourceId: settings.FolderID,
          projectId: settings.ProjectID,

          showMoreInvite: false,
          isTask: true,
          filterAccountIds: [oldUid],
          offset: {
            top: 16,
            left: 0,
          },
          zIndex: 10001,
          includeUndefinedAndMySelf: true,
          SelectUserSettings: {
            filterAccountIds: [oldUid],
            unique: true,
            projectId: CreateTask.Motheds.checkIsProject(settings.ProjectID) ? settings.ProjectID : '',
            callback: function(users) {
              updateChargeFun(users);
            },
          },
          selectCb: function(users) {
            updateChargeFun(users);
          },
        });
      },
    });
  },

  // 成员模块方法初始化
  membersInit: function() {
    var settings = this.settings;
    var memberList = '';
    var newMember = [];
    var memberArr = settings.MemberArray;
    var has;
    var i;
    var _that = this;
    var newMemberCheckFun = function(index, item) {
      if (item.accountId === memberArr[i].accountId) {
        has = true;
        return false;
      }
    };
    for (i = 0; i < memberArr.length; i++) {
      has = false;
      if (newMember.length > 0) {
        $.each(newMember, newMemberCheckFun);
        if (!has) {
          newMember.push(memberArr[i]);
        }
      } else {
        newMember.push(memberArr[i]);
      }
    }

    if (newMember.length) {
      for (i = 0; i < newMember.length; i++) {
        if (newMember[i].accountId && $('#taskUserBox').attr('data-id') != newMember[i].accountId) {
          memberList += '<span class="imgMemberBox" data-id="' + newMember[i].accountId + '">';
          memberList += '<span class="removeTaskMember circle"><i class="icon-delete Icon"></i></span>';
          memberList +=
            '<img class="createTaskMember circle imgWidth" data-id="' +
            newMember[i].accountId +
            '" src="' +
            newMember[i].avatar +
            '" />';
          memberList += '</span>';
        }
      }
    }

    $('.createTaskAddMember').before(memberList);

    if (memberList) {
      $('#taskMembersBox').removeClass('Hidden');
      $('#taskTabs span[data-type=member]').remove();
    }

    // hover移除成员
    $('#taskMembersBox').on('click', '.imgMemberBox .removeTaskMember', function() {
      var accountId = $(this)
        .parents('.imgMemberBox')
        .attr('data-id');
      $(this)
        .parents('.imgMemberBox')
        .remove();
    });

    // 添加任务成员
    $('#taskMembersBox .createTaskAddMember').on({
      click: function() {
        var _this = $(this);
        var existsIds = [];
        // 页面上已经存在的成员
        $('.createTaskAddMemberBox .createTaskMember').each(function() {
          existsIds.push($(this).attr('data-id'));
        });

        // 负责人
        existsIds.push($('#taskUserBox').attr('data-id'));

        var updateMemberFun = function(users) {
          memberList = '';
          var isExistes;
          var accountId = '';
          var existsIdsCheckFun = function(index, id) {
            if (id.split('MD_SpecialAccounts')[0] === accountId.split('MD_SpecialAccounts')[0]) {
              if (!users[i].accountId) {
                $('.createTaskAddMemberBox .imgMemberBox[data-id=' + id + ']')
                  .attr('data-id', accountId)
                  .find('.createTaskMember')
                  .attr({ 'data-id': accountId, src: users[i].avatar });
              }
              isExistes = true;
              return false;
            }
          };

          for (i = 0; i < users.length; i++) {
            isExistes = false;
            accountId = users[i].accountId || users[i].account + 'MD_SpecialAccounts' + users[i].fullname;
            $.each(existsIds, existsIdsCheckFun);

            if (!isExistes) {
              memberList += '<span class="imgMemberBox" data-id="' + accountId + '">';
              memberList += '<span class="removeTaskMember circle "><i class="icon-delete Icon"></i></span>';
              memberList +=
                '<img class="createTaskMember circle imgWidth" data-id="' +
                accountId +
                '" src="' +
                users[i].avatar +
                '" />';
              memberList += '</span>';
            }
          }

          $('.createTaskAddMember').before(memberList);
          _that.updateUserCard(users[0]);
        };

        quickSelectUser(_this[0], {
          sourceId: '',
          projectId: settings.ProjectID,
          zIndex: 20000,
          filterAccountIds: existsIds,
          offset: {
            top: 27,
            left: 0,
          },
          SelectUserSettings: {
            filterAccountIds: existsIds,
            projectId: CreateTask.Motheds.checkIsProject(settings.ProjectID) ? settings.ProjectID : '',
            callback: function(users) {
              updateMemberFun(users);
            },
          },
          selectCb: function(users) {
            updateMemberFun(users);
          },
        });
      },
    });
  },

  // 到期日期初始化
  deadlineInit: function() {
    const $txtLastDate = $('#txtLastDate');

    // 甘特图视图默认今天
    if ($('#taskGantt').length) {
      $('#taskTabs span[data-type=date]').click();
      $txtLastDate.data('start', moment().format('YYYY-MM-DD 09:00')).data('end', moment().format('YYYY-MM-DD 18:00'));
      $txtLastDate.html(
        formatTaskTime(false, moment().format('YYYY-MM-DD 09:00'), moment().format('YYYY-MM-DD 18:00'), '', '', true),
      );
    }

    const bindDate = () => {
      let { start: defaultStart, end: defaultEnd } = $txtLastDate.data();

      if ($('#taskGantt').length) {
        defaultStart = defaultStart || moment().format('YYYY-MM-DD 09:00');
        defaultEnd = defaultEnd || moment().format('YYYY-MM-DD 18:00');
      }

      ReactDom.render(
        <DateTimeRange
          selectedValue={[defaultStart, defaultEnd]}
          mode="task"
          timePicker
          separator={_l('至')}
          timeMode="hour"
          placeholder={_l('未指定起止时间')}
          onOk={selectedValue => {
            let [start, end] = selectedValue;

            if (start && end && start >= end) {
              alert(_l('结束时间不能早于或等于开始时间'), 2);
              return false;
            }

            start = start ? start.format('YYYY-MM-DD HH:00') : '';
            end = end ? end.format('YYYY-MM-DD HH:00') : '';
            $txtLastDate.data('start', start);
            $txtLastDate.data('end', end);

            $('#txtLastDateText').html(
              !start && !end ? _l('未指定起止时间') : formatTaskTime(false, start, end, '', '', true),
            );
          }}
          onClear={() => {
            delete $txtLastDate.data().start;
            delete $txtLastDate.data().end;

            ReactDom.unmountComponentAtNode($txtLastDate[0]);
            bindDate();
          }}
        >
          <div id="txtLastDateText">{_l('未指定起止时间')}</div>
        </DateTimeRange>,
        $txtLastDate[0],
      );
    };

    bindDate();
  },

  // 初始化附件事件
  initAttachmentEvent: function() {
    var settings = this.settings;
    settings.isComplete = true;

    // 描述
    $('#txtDescriptionbox').autoTextarea({
      minHeight: 24,
      maxHeight: 72,
    });

    // 附件
    ReactDom.render(
      <UploadFiles
        canAddLink
        onUploadComplete={res => {
          settings.isComplete = res;
        }}
        temporaryData={settings.createTaskAttachments.attachmentData}
        kcAttachmentData={settings.createTaskAttachments.kcAttachmentData}
        onTemporaryDataUpdate={res => {
          settings.createTaskAttachments.attachmentData = res;
        }}
        onKcAttachmentDataUpdate={res => {
          settings.createTaskAttachments.kcAttachmentData = res;
        }}
      />,
      document.getElementById('Attachment_updater_createTask'),
    );
  },
});

CreateTask.Motheds = {
  // 获取项目列表
  searchTaskFolder: function() {
    var keyWords = $.trim($('#txtTaskFolder').val());
    ajaxRequest
      .getFolderListForCreateTask({
        projectId: CreateTask.settings.ProjectID,
        keyWords: keyWords,
        pageSize: 20,
        pageIndex: CreateTask.settings.pageIndex,
      })
      .then(function(source) {
        if (source.status) {
          var folderList = '';
          CreateTask.settings.isMore = source.data && source.data.length === 20;
          if (source.data) {
            $.each(source.data, function(index, item) {
              folderList +=
                '<li class="item overflow_ellipsis ThemeBGColor3" data-folderid="' +
                item.folderID +
                '">' +
                '<img class="chargeUser circle" src="' +
                item.charge.avatar +
                '">' +
                '<span class="folderListName">' +
                htmlEncodeReg(item.folderName) +
                '</span>' +
                '<span class="ThemeColor8 ' +
                (item.visibility === 0 ? 'icon-folder-private' : 'icon-folder-public') +
                '"></span>' +
                '<span class="folderMemberCount">' +
                (item.taskNum || '') +
                '</span>' +
                '</li>';
            });
          }

          if (CreateTask.settings.pageIndex === 1) {
            $('.linkageFolder ul').html(folderList);
          } else {
            $('.linkageFolder ul').append(folderList);
          }

          var listSize = $('.linkageFolder ul li').length;
          if (!listSize && !keyWords) {
            $('.linkageFolder').addClass('Hidden');
          } else {
            $('.linkageFolder').removeClass('Hidden');
            $('.linkageFolder .nullFolder')
              .toggleClass('Hidden', !keyWords && !CreateTask.settings.folderId)
              .toggleClass('clearBorder', !listSize)
              .find('.folderListName')
              .html(htmlEncodeReg(keyWords));
          }
        } else {
          return $.Deferred().reject();
        }
      })
      .fail(function() {
        alert(_l('操作失败，请稍后再试'), 2);
      });
  },

  // 获取阶段
  getFolderStage: function() {
    var settings = CreateTask.settings;

    ajaxRequest
      .getFolderStage({
        projectID: settings.ProjectID,
        folderID: settings.FolderID,
      })
      .then(function(source) {
        if (source.status) {
          var array = [];
          var folderStages = source.data;

          $.each(folderStages, function() {
            array.push({
              text: this.name,
              value: this.id,
            });
          });

          if (folderStages.length > 1 || folderStages[0].name !== _l('进行中')) {
            $('#createTaskStage').removeClass('Hidden');
          }

          $('#folderStage').val(array[0].value);

          ReactDom.render(
            <Dropdown
              className="w100"
              data={array}
              defaultValue={$('#folderStage').val()}
              border
              isAppendToBody
              onChange={value => {
                $('#folderStage').val(value);
              }}
            />,
            document.getElementById('folderStageBox'),
          );
        } else {
          return $.Deferred().reject();
        }
      })
      .fail(function() {
        alert(_l('操作失败，请稍后再试'), 2);
      });
  },

  // 创建
  send: function() {
    var settings = CreateTask.settings;
    var $submitBtn = $('#taskSubmitBtn');

    // 附件是否上传完成
    if (!settings.isComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var taskName = $.trim($('#txtTaskName').val());

    // 名称是否为空
    if (taskName === '') {
      alert(_l('请输入任务名称'), 3);
      $('#txtTaskName').focus();
      $submitBtn.removeAttr('disabled');
      return false;
    }

    var startTime = $('#txtLastDate').data('start');
    var deadline = $('#txtLastDate').data('end');
    var description = filterXss(
      $('#txtDescriptionbox')
        .val()
        .replace(/\n/g, '<br/>'),
    );
    var folderID = settings.FolderID === 1 ? '' : settings.FolderID;
    var folderName = $.trim($('#txtTaskFolder').val());
    var toUserID = $('#taskUserBox').attr('data-id');
    var stageId = $.trim($('#folderStage').val());
    var members = [];
    var specialAccounts = {};

    // 成员
    $('.createTaskAddMemberBox .createTaskMember').each(function() {
      var accountId = $(this).attr('data-id');
      if (accountId.indexOf('MD_SpecialAccounts') >= 0) {
        accountId = accountId.split('MD_SpecialAccounts');
        specialAccounts[accountId[0]] = accountId[1];
      } else {
        members.push(accountId);
      }
    });

    // 日程转任务
    if (settings.CalenderID) {
      calendarAjaxRequest
        .convertCalendarToTask({
          calendarId: settings.CalenderID,
          recurTime: settings.recurTime,
          projectId: settings.ProjectID,
          folderId: folderID,
          folderName: folderName,
          stageId,
          chargeAccountId: toUserID,
          specialAccounts: specialAccounts,
          members: members.join(','),
          taskName,
          summary: description,
          startTime,
          deadline,
          attachments: JSON.stringify(settings.createTaskAttachments.attachmentData),
          knowledgeAtt: JSON.stringify(settings.createTaskAttachments.kcAttachmentData),
        })
        .then(source => {
          if (source.code === 1) {
            createShare({
              linkURL: md.global.Config.WebUrl + 'apps/task/task_' + source.data.taskId,
              content: _l('已转为任务'),
            });
          }
          $('.createTaskConfirm')
            .parent()
            .remove();
        });

      return;
    }

    ajaxRequest
      .addTask({
        taskName: taskName,
        stageID: stageId,
        summary: description,
        folderName: folderName,
        folderID: folderID == 1 ? '' : folderID,
        chargeAccountID: toUserID,
        specialAccounts: specialAccounts,
        members: members.join(','),
        startTime: startTime,
        deadline: deadline,
        postID: settings.PostID,
        worksheetAndRowId: settings.worksheetAndRowId,
        projectId: settings.ProjectID,
        attachments: JSON.stringify(settings.createTaskAttachments.attachmentData),
        knowledgeAtt: JSON.stringify(settings.createTaskAttachments.kcAttachmentData),
        itemId: settings.itemId,
      })
      .then(function(source) {
        if (source.status) {
          safeLocalStorageSetItem('lastProjectId', settings.ProjectID);

          source.data.taskName = source.data.name;
          source.data.star = false;
          source.data.stageID = stageId;
          source.data.projectId = settings.ProjectID;
          source.data.projectID = settings.ProjectID;
          source.data.actualStartTime = '';
          source.data.completeTime = '';
          source.data.isNotice = false;

          if (stageId) {
            source.data.stageName = $('#folderStage')
              .next()
              .find('.spanShow .txtBox')
              .text();
          } else {
            source.data.stageName = _l('未完成');
          }

          if (settings.relationCallback && $.isFunction(settings.relationCallback)) {
            settings.relationCallback(source.data);
            $('.createTaskConfirm')
              .parent()
              .remove();
            return false;
          }

          // 转化任务成功
          if (settings.itemId) {
            createShare({
              linkURL: md.global.Config.WebUrl + 'apps/task/task_' + source.data.taskID,
              content: _l('已转为任务'),
            });

            if (settings.callback && $.isFunction(settings.callback)) {
              settings.callback();
            }
          }

          if (location.href.indexOf('task') >= 0) {
            Store.dispatch(addTask(source.data));
            $('.createTaskConfirm')
              .parent()
              .remove();
            return false;
          }

          if (settings.callback && $.isFunction(settings.callback)) {
            settings.callback(source);
            if (settings.createShare === true) {
              if (source.data.limitedCount) {
                alert(_l('有%0位外部用户邀请失败，外部用户短信邀请用量达到上限', source.data.limitedCount));
              }

              createShare({
                linkURL: md.global.Config.WebUrl + 'apps/task/task_' + source.data.taskID,
                content: '任务创建成功',
              });
            }
          } else if (settings.shareCallback && $.isFunction(settings.shareCallback)) {
            settings.shareCallback(source);
          } else if (!settings.itemId) {
            if (source.data.limitedCount) {
              alert(_l('有%0位外部用户邀请失败，外部用户短信邀请用量达到上限', source.data.limitedCount));
            }
            createShare({
              linkURL: md.global.Config.WebUrl + 'apps/task/task_' + source.data.taskID,
              content: _l('任务创建成功'),
            });
          }
          $('.createTaskConfirm')
            .parent()
            .remove();
        }
      })
      .fail(function() {
        $submitBtn.removeAttr('disabled');
        alert(_l('操作失败，请稍后再试'), 2);
      });
  },

  // 验证当前用户是否在该网络
  checkIsProject: function(projectId) {
    var isExist = false;
    $.map(md.global.Account.projects, function(project) {
      if (projectId === project.projectId) {
        isExist = true;
      }
    });

    return isExist;
  },
};

// 导出
export default function(opts) {
  return new CreateTask(opts);
}

// 加载时 执行 绑定 jquery
(function($) {
  // 是否绑定过
  if (!$.CreateTask) {
    // 全局函数
    $.CreateTask = function(opts) {
      return new CreateTask(opts);
    };
  }
})(jQuery);
