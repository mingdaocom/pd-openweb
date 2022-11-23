var Toolbar = {};
import { htmlEncodeReg } from 'src/util';
import showCategoryListTpl from './tpl/showCategoryList.html';
import ClassificationCalendarListAddTpl from './tpl/ClassificationCalendarListAdd.html';
import toolbarTpl from './tpl/toolbar.html';
import updateCategoryListTpl from './tpl/updateCategoryList.html';
import synchronousTpl from './tpl/synchronous.html';
import calendarInviteTpl from './tpl/calendarInvite.html';
import addOtherUserTpl from './tpl/addOtherUser.html';
import ClassificationCalendarHtml from './tpl/ClassificationCalendar.html';
import 'src/components/dialogSelectUser/dialogSelectUser';

Toolbar.settings = {
  oldCategoryList: [],
  pageIndex: 1,
  pageSize: 10,
  dataCount: null,
  isComplete: true,
};

import './toolbar.less';
import Comm from '../comm/comm';
import Calendar from '../calendar/calendar';

Toolbar.Comm = Comm;
Toolbar.Calendar = Calendar;

import '@mdfe/jquery-ui';
import 'src/components/mdBusinessCard/mdBusinessCard';
import _ from 'lodash';
import copy from 'copy-to-clipboard';
import { formatRecur } from '../calendarDetail/common';

// 绑定事件
Toolbar.Event = function() {
  // 未确认日程
  $('#calInvite').on('click', function() {
    $('#calendarLoading').show();
    $('#calendar,#calendarList').hide();

    $(this).addClass('ThemeBGColor8');
    Toolbar.settings.pageIndex = 1;
    $('#invitedCalendars').css('height', $(window).height() - $('#topBarContainer').height() - 90);

    document.title = _l('待确认日程') + ' - ' + _l('日程');
    Toolbar.Method.getInvitedCalendars();
  });

  // 退出未确认模块
  $('#exitInvited').on({
    mouseover: function() {
      $(this)
        .addClass('ThemeBGColor2')
        .removeClass('ThemeBGColor3');
    },
    mouseout: function() {
      $(this)
        .addClass('ThemeBGColor3')
        .removeClass('ThemeBGColor2');
    },
    click: function() {
      $('#calInvite').removeClass('ThemeBGColor8');
      document.title = _l('日程');
      Toolbar.Calendar.rememberClickRefresh();
    },
  });

  // 未确认日程颜色分类show
  $('#invitedCalendars').on('click', '.inviteCalendarType', function(event) {
    var $calendarTypeList = $(this).find('.inviteCalendarTypeList');
    if (!$calendarTypeList.find('li').length) {
      Toolbar.Comm.getUserAllCalCategories(function(categorys) {
        var data = {
          colorClass: Toolbar.Method.inviteColorClass,
          cats: categorys || [],
          catID: '1',
        };
        var listHtml = Toolbar.Comm.doT.template(showCategoryListTpl)(data);
        $calendarTypeList.find('ul').append(listHtml);
        $calendarTypeList.show();
      });
    } else {
      $calendarTypeList.show();
    }
    event.stopPropagation();
  });

  // 未确认日程颜色分类click
  $('#invitedCalendars').on('click', '.inviteCalendarTypeList li', function(event) {
    var catName = $(this)
      .find('span')
      .html();
    var catID = $(this).attr('catID');
    var catClassName = $(this)
      .find('.editColor')
      .attr('class');
    var $calendarType = $(this).parents('.inviteCalendarType');

    $calendarType
      .find('.editColor')
      .eq(0)
      .removeClass()
      .addClass(catClassName);
    $calendarType.attr('catID', catID);
    $(this)
      .parent()
      .find('.selectIcon')
      .prependTo($(this));

    $calendarType.find('.inviteCalendarTypeList').hide();
    event.stopPropagation();
  });

  // 日程同步
  $('#synchronous').on('click', function() {
    Toolbar.Method.getIcsUrl();
  });

  // 添加分类
  $('#addCalendarType').on('click', function() {
    var html = ClassificationCalendarHtml.replace('##classificationCalendarList##', ClassificationCalendarListAddTpl);
    $.DialogLayer({
      dialogBoxID: 'classificationCalendarEdit',
      width: 570,
      drag: false,
      container: {
        header: _l('分类日程编辑'),
        content: Toolbar.Comm.doT.template(html)(Toolbar.settings.oldCategoryList),
        yesFn: function() {
          var $list = $('.classificationCalendarList li');

          if ($list.length > 0) {
            // 存在列表
            var catId;
            var catName;
            var catColor;
            var $li;
            var newCategoryList = [];

            $list.each(function() {
              $li = $(this);
              catId = $li.attr('catid') || '';
              catName = $.trim($li.find('.classificationListName').val());
              // 分类名称不为空
              if (catName !== '') {
                catColor = Toolbar.Method.colorValue(
                  $li
                    .find('.classificationListColumnOperation .colorBlock')
                    .attr('class')
                    .replace(/^colorBlock\s|\scolorBlock$/, ''),
                );
                newCategoryList.push({
                  catName: catName,
                  color: catColor,
                  catID: catId,
                });
              }
            });

            // 新分类列表存在
            if (newCategoryList.length > 0) {
              Toolbar.Method.updateUserCalCategoryInfo(newCategoryList);
            }
          }
        },
      },
      readyFn: function() {
        if (!Toolbar.Comm.settings.categorys.length) {
          var categorysArray = [];
          $('.allowDrop').each(function() {
            if (
              $(this)
                .find('.iconTickStyle')
                .hasClass('icon-calendar-check')
            ) {
              categorysArray.push($(this).attr('catid'));
            }
          });
          safeLocalStorageSetItem('categorys', categorysArray);
          Toolbar.Comm.settings.categorys = categorysArray;
        }

        // 添加更多
        $('.classificationCalendarListAdd').click(function() {
          $('.classificationCalendarList')
            .find('ul')
            .append(Toolbar.Comm.doT.template(ClassificationCalendarListAddTpl));
          $('.classificationListName:last').focus();
        });

        // 点击下拉选择颜色
        $('.classificationCalendarList')
          .on('click', '.classificationListDropdown', function(event) {
            if (!$(event.target).closest('.colorBlockList').length) {
              var $colorBlockMain = $(this).find('.colorBlockMain');
              $('.colorBlockMain')
                .not($colorBlockMain)
                .hide();
              if ($(this).find('.colorBlockMain:visible').length) {
                $colorBlockMain.hide();
              } else {
                $colorBlockMain.show();
              }
            }
            event.stopPropagation();
          })
          .on('click', '.colorBlockList', function() {
            // 改变颜色框
            var $colorBlockMain = $(this).parent();
            var className = $(this)
              .find('span')
              .attr('class');
            $colorBlockMain
              .siblings('.colorBlock')
              .removeClass()
              .addClass('colorBlock ' + className);
            $colorBlockMain.hide();
            event.stopPropagation();
          });

        // 点击删除操作
        $('.classificationCalendarList').on('click', '.classificationListDel', function() {
          var _this = $(this);
          var catId = _this.closest('li').attr('catid');

          if (catId) {
            Toolbar.Method.deleteUserCalCategory(_this, catId);
          } else {
            _this.parent().remove();
          }
        });
      },
    });
  });

  // 列表点击 选中未选中切换
  var $calendarTypeList = $('#calendarTypeList');
  $calendarTypeList.on('click', 'li .iconTickStyle', function() {
    var $this = $(this);
    var className = 'icon-calendar-check';

    if ($this.hasClass('icon-calendar-check')) {
      // 当前状态选中
      className = 'icon-calendar-nocheck';
    }

    $this.removeClass('icon-calendar-check icon-calendar-nocheck').addClass(className);

    Toolbar.Comm.settings.isWorkCalendar = !!$('#workCalendar .icon-calendar-check').length; // 工作日程
    Toolbar.Comm.settings.isTaskCalendar = !!$('#taskCalendar .icon-calendar-check').length; // 任务
    Toolbar.Comm.settings.categorys = [];

    $('.allowDrop').each(function() {
      if ($(this).find('.icon-calendar-check').length) {
        Toolbar.Comm.settings.categorys.push($(this).attr('catid'));
      }
    });

    safeLocalStorageSetItem('isWorkCalendar', Toolbar.Comm.settings.isWorkCalendar);
    safeLocalStorageSetItem('isTaskCalendar', Toolbar.Comm.settings.isTaskCalendar);
    safeLocalStorageSetItem('categorys', Toolbar.Comm.settings.categorys.join(','));

    Toolbar.Calendar.rememberClickRefresh();
  });

  // 更改任务分类
  $calendarTypeList.on('click', '#filterTaskType', function(event) {
    var $this = $(this);
    var oldTaskType = $this.attr('data-tasktype');
    var $filterTaskTypeList = $this.siblings('.filterTaskTypeList');

    if ($filterTaskTypeList.is(':visible')) {
      $filterTaskTypeList.hide();
    } else {
      $filterTaskTypeList.find('.filterTaskTypeListIcon').removeClass('icon-ok');
      $filterTaskTypeList.find('.filterTaskTypeListIcon[data-tasktype=' + oldTaskType + ']').addClass('icon-ok');
      $filterTaskTypeList.show();
    }
    event.stopPropagation();
  });

  // 更改分类点击
  $calendarTypeList.on('click', '.filterTaskTypeList li', function(event) {
    var taskType = $(this)
      .find('.filterTaskTypeListIcon')
      .attr('data-tasktype');
    var taskTypeName = $(this)
      .find('span')
      .html();
    var $filterTaskType = $('#filterTaskType');
    var oldTaskType = $filterTaskType.attr('data-tasktype');

    if (taskType != oldTaskType) {
      $filterTaskType
        .attr('data-tasktype', taskType)
        .find('.filterTaskTypeName')
        .html(taskTypeName);

      Toolbar.Comm.settings.filterTaskType = taskType;
      safeLocalStorageSetItem('filterTaskType', taskType);

      Toolbar.Calendar.rememberClickRefresh();
    }

    $('.filterTaskTypeList').hide();
    event.stopPropagation();
  });

  // 查看其他同事
  // 当无网络时隐藏
  if (!md.global.Account.projects || !md.global.Account.projects.length) {
    $('#others').hide();
  }
  $('#others').on('click', function() {
    var _this = $(this);
    const calendarLastPId = localStorage.getItem('calendarLastPId');
    _this.dialogSelectUser({
      sourceId: '',
      sourceProjectId: '',
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: _.find(md.global.Account.projects, item => item.projectId === calendarLastPId)
          ? calendarLastPId
          : '',
        filterFriend: true,
        filterOthers: true,
        filterAccountIds: [md.global.Account.accountId],
        filterAll: true,
        projectCallback: function(projectId) {
          safeLocalStorageSetItem('calendarLastPId', projectId);
        },
        callback: function(users) {
          var userCount = users.length;
          var user;
          var data = [];
          if (userCount > 0) {
            for (var i = 0; i < userCount; i++) {
              user = users[i];
              if (user.accountId && $.inArray(user.accountId, Toolbar.Comm.settings.otherUsers) < 0) {
                Toolbar.Comm.settings.otherUsers.push(user.accountId);
                safeLocalStorageSetItem(
                  'otherUsers' + md.global.Account.accountId,
                  Toolbar.Comm.settings.otherUsers.join(','),
                );
                data.push({
                  fullName: user.fullname,
                  accountID: user.accountId,
                  avatar: user.avatar,
                });
              }
            }

            if (data.length > 0) {
              Toolbar.Method.addOtherUser(data, true);
              Toolbar.Calendar.rememberClickRefresh();
            }
          }
        },
      },
    });
  });

  // 隐藏自己
  $('#hideOneself .cbComplete').on('click', function() {
    var $this = $(this);
    var className = 'icon-calendar-nocheck';
    if ($this.hasClass('icon-calendar-nocheck')) {
      className = 'icon-calendar-check';
      Toolbar.Comm.settings.otherUsers.splice(
        $.inArray(md.global.Account.accountId, Toolbar.Comm.settings.otherUsers),
        1,
      );
    } else {
      Toolbar.Comm.settings.otherUsers.push(md.global.Account.accountId);
    }

    $this.removeClass('icon-calendar-check icon-calendar-nocheck').addClass(className);
    safeLocalStorageSetItem('otherUsers' + md.global.Account.accountId, Toolbar.Comm.settings.otherUsers.join(','));
    Toolbar.Calendar.rememberClickRefresh();
  });

  // 删除添加的任务成员
  var $tb_OtherUserCalendar = $('#tb_OtherUserCalendar');
  $tb_OtherUserCalendar.on('click', '.addOtherUserDelImg', function() {
    var accountId = $(this)
      .closest('.addOtherUser')
      .attr('data-id');

    Toolbar.Comm.settings.otherUsers.splice($.inArray(accountId, Toolbar.Comm.settings.otherUsers), 1);
    safeLocalStorageSetItem('otherUsers' + md.global.Account.accountId, Toolbar.Comm.settings.otherUsers.join(','));

    $(this)
      .closest('.addOtherUser')
      .remove();

    // 是否还有成员
    if (!$tb_OtherUserCalendar.find('.addOtherUser').length) {
      $tb_OtherUserCalendar.hide();
      $('#hideOneself')
        .hide()
        .find('.cbComplete')
        .removeClass('icon-calendar-check')
        .addClass('icon-calendar-nocheck');

      Toolbar.Comm.settings.otherUsers = [md.global.Account.accountId];
      window.localStorage.removeItem('otherUsers' + md.global.Account.accountId);
    }

    Toolbar.Calendar.rememberClickRefresh();
  });

  // 删除全部成员
  $('#allOtherUserDel').on('click', function(event) {
    history.replaceState('', '', 'home');

    // 清除所有 只留自己
    Toolbar.Comm.settings.otherUsers = [md.global.Account.accountId];
    window.localStorage.removeItem('otherUsers' + md.global.Account.accountId);

    $('#hideOneself')
      .hide()
      .find('.cbComplete')
      .removeClass('icon-calendar-check')
      .addClass('icon-calendar-nocheck');
    $tb_OtherUserCalendar
      .hide()
      .find('.addOtherUser')
      .remove();

    // 刷新页面
    Toolbar.Calendar.rememberClickRefresh();
    event.stopPropagation();
  });

  // 确认参加
  $('#invitedCalendars')
    .on('click', '.enterInvite', function() {
      var $element = $(this).parent();
      var calendarId = $element.data('calendarid');
      var recurTime = $element.data('recurtime');
      var catID =
        $(this)
          .parents('.inviteSinlge')
          .find('.inviteCalendarType')
          .attr('catID') || '1';

      Toolbar.Comm.inviteCalendar.confirm(calendarId, recurTime, catID);
    })
    .on('click', '.refuseInvite', function() {
      var $element = $(this).parent();
      var calendarId = $element.data('calendarid');
      var recurTime = $element.data('recurtime');

      Toolbar.Comm.inviteCalendar.refuse(calendarId, recurTime, '');
    });

  $(document).on('click', function(event) {
    var $target = $(event.target);

    // 任务分类隐藏
    if (
      $('.filterTaskTypeList').is(':visible') &&
      !$target.closest('.filterTaskTypeList').length &&
      !$target.is($('#calendarTypeList'))
    ) {
      $('.filterTaskTypeList').hide();
    }

    // 日程分类隐藏
    if ($('.inviteCalendarTypeList').length && !$(event.target).closest('.inviteCalendarTypeList').length) {
      $('.inviteCalendarTypeList').hide();
    }

    if (!$(event.target).closest('.classificationCalendarList .colorBlockMain').length) {
      $('.classificationCalendarList .colorBlockMain').hide();
    }
  });

  // 绑定toolBar和未确认日程名片层
  $('#calendarMenu,.calendarMain').on('mouseover', '.showBusinessCard', function() {
    var $this = $(this);
    if (!$this.data('hasbusinesscard')) {
      var accountId = $this.parents('.addOtherUser').attr('data-id') || $this.attr('data-id');
      $this.mdBusinessCard({
        id: 'showBusinessCard',
        accountId: accountId || new Date().getTime(),
        noRequestData: !accountId,
        data: {
          avatar: $this.find('.userHead').attr('src'),
          fullname: $(this)
            .find('.TxtTop')
            .html(),
          accountId: md.global.Account.accountId,
          status: 3,
          companyName: '来自微信邀请',
        },
      });
      $(this)
        .data('hasbusinesscard', true)
        .mouseenter();
    }
  });
};

// 绑定方法
Toolbar.Method = {
  // 初始化获取
  init: function() {
    // 往页面上添加右边模块元素
    $('#calendarTypeList').html(Toolbar.Comm.doT.template(toolbarTpl)(Toolbar.Comm.settings));
    $('#sortable').append(LoadDiv());
    // 列表拖拽调整顺序
    Toolbar.Method.updateSort();
    // 查找用户所有分类
    Toolbar.Comm.getUserAllCalCategories(function(categorys) {
      if (categorys) {
        Toolbar.settings.oldCategoryList = categorys; // 旧的日程分类数据
        Toolbar.settings.oldCategoryList.colorClass = Toolbar.Method.colorClass;

        $('#sortable .MdLoader')
          .parent()
          .remove();
        $('#sortable').append(Toolbar.Comm.doT.template(updateCategoryListTpl)(Toolbar.settings.oldCategoryList)); // 自定义分类列表
      } else {
        $('#sortable .MdLoader')
          .parent()
          .remove();
      }
    });
  },

  // 日程同步
  getIcsUrl: function() {
    Toolbar.Comm.ajaxRequest.getIcsUrl().then(function(source) {
      if (source.code == 1) {
        var url = source.data.replace(/^http[\s\S]*:\/\/?/, 'webcal://');
        $.DialogLayer({
          dialogBoxID: 'calendarInteraction',
          width: 644,
          height: 369,
          container: {
            yesText: '',
            noText: '',
            content: Toolbar.Comm.doT.template(synchronousTpl)(url),
          },
          readyFn: function() {
            var $iCalAbout = $('#iCalAbout').find('.synchronousSelect');

            // 点击复制地址
            $('#clipinner')
              .off()
              .on('click', function() {
                copy($('#clipinner').attr('data-clipboard-text'));
                alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
              });

            // 点击切换
            $iCalAbout.click(function() {
              $('#iCalAbout td').removeClass('ThemeBGColor5 Select');
              $(this).addClass('Select ThemeBGColor5');
              var type = $(this).attr('type');
              var $iCalContent_two = $('#iCalContent_two');
              if (type == 1) {
                $iCalContent_two.html(
                  '2.' + _l('"打开Outlook，在工具>账户设置>Internet日历中新建，并粘贴刚才获得的ICAL格式日历地址"'),
                );
              } else if (type == 2) {
                $iCalContent_two.html(
                  '2.' + _l('"打开Mac日历，在文件>新建日历订阅，粘贴刚才获得的Internet格式日历地址"'),
                );
              } else if (type == 3) {
                $iCalContent_two.html(
                  '2.' + _l('"登录Google Calendar，在其他日历>通过网址添加中，粘贴刚才获得的ICAL格式日历地址"'),
                );
              }
            });
            // 经过改变背景颜色
            $iCalAbout.hover(
              function() {
                if (!$(this).hasClass('ThemeBGColor5')) {
                  $(this).addClass('iCalAboutHover');
                }
              },
              function() {
                $(this).removeClass('iCalAboutHover');
              },
            );
          },
        });
      } else {
        Toolbar.Comm.errorMessage(source.msg);
      }
    });
  },

  // 列表拖拽调整顺序
  updateSort: function() {
    // 列表拖拽调整顺序
    $('#sortable').sortable({
      revert: true,
      update: function() {
        var catId;
        var catIDs = []; // 新排序数组
        var oldCategoryList = [];
        $('#sortable .allowDrop').each(function() {
          catId = $(this).attr('catid');
          catIDs.push(catId);
          oldCategoryList = oldCategoryList.concat(
            $.map(Toolbar.settings.oldCategoryList, function(category) {
              if (catId == category.catID) {
                return category;
              }
            }),
          );
        });
        oldCategoryList.colorClass = Toolbar.Method.colorClass;

        Toolbar.Comm.ajaxRequest
          .updateUserCalCategoriesIndex({
            cateIDs: catIDs.join(','),
          })
          .then(function(source) {
            if (source.code == 1) {
              alert(_l('顺序修改成功'));
              Toolbar.settings.oldCategoryList = oldCategoryList;
            } else {
              Toolbar.Comm.errorMessage(source.msg);
            }
          });
      },
      items: '.allowDrop',
    });
  },

  // 删除日程分类
  deleteUserCalCategory: function(_this, catId) {
    $.DialogLayer({
      dialogBoxID: 'DeleteUserCalCategory',
      width: 408,
      container: {
        content: '<div class="Font14 mTop15">' + _l('删除之后该分类下的全部日程归类到工作日程？') + '</div>',
        yesFn: function() {
          Toolbar.Comm.ajaxRequest
            .deleteUserCalCategory({
              catID: catId,
            })
            .then(function(source) {
              if (source.code == 1) {
                _.remove(Toolbar.settings.oldCategoryList, obj => obj.catID == catId);
                if (Toolbar.Comm.settings.categorys.length) {
                  Toolbar.Comm.settings.categorys.splice($.inArray(catId, Toolbar.Comm.settings.categorys), 1);
                  safeLocalStorageSetItem('categorys', Toolbar.Comm.settings.categorys);
                }
                $('.calendarTypeList li[catid=' + catId + ']').remove();
                _this.parent().remove();
                Toolbar.Calendar.rememberClickRefresh();
              } else {
                Toolbar.Comm.errorMessage(source.msg);
              }
            });
        },
      },
    });
  },

  // 修改日程分类
  updateUserCalCategoryInfo: function(newCalCategory) {
    Toolbar.Comm.ajaxRequest
      .updateUserCalCategoryInfo({
        newCalCategory: JSON.stringify(newCalCategory),
      })
      .then(function(source) {
        if (source.code == 1) {
          alert(_l('修改成功'));

          var newCategoryList = source.data;
          var newSize = newCategoryList.length;
          var oldSize = Toolbar.settings.oldCategoryList.length;
          var catID;

          for (var i = 0; i < newSize; i++) {
            catID = newCategoryList[i].catID;
            if (oldSize == 0) {
              Toolbar.Comm.settings.categorys.push(catID);
            } else {
              for (var j = 0; j < oldSize; j++) {
                if (catID == Toolbar.settings.oldCategoryList[j].catID) {
                  break;
                } else if (j == oldSize - 1) {
                  Toolbar.Comm.settings.categorys.push(catID);
                }
              }
            }
          }
          safeLocalStorageSetItem('categorys', Toolbar.Comm.settings.categorys);
          Toolbar.Calendar.rememberClickRefresh();

          newCategoryList.colorClass = Toolbar.Method.colorClass;
          Toolbar.settings.oldCategoryList = newCategoryList;
          var $sortable = $('#sortable');
          $sortable.find('.allowDrop').remove();
          $sortable.append(Toolbar.Comm.doT.template(updateCategoryListTpl)(Toolbar.settings.oldCategoryList)); // 更新分类列表
        } else {
          Toolbar.Comm.errorMessage(source.msg);
        }
      });
  },

  // 未确认日程计数
  calendarRemind: function() {
    Toolbar.Comm.ajaxRequest.getUserInvitedCalendarsCount().then(function(source) {
      if (source.code == 1 && source.data > 0) {
        $('#calendarNumber')
          .html(source.data)
          .show();
      }
    });
  },

  // 获取未确认日程
  getInvitedCalendars: function() {
    Toolbar.Comm.ajaxRequest.invitedCalendars().then(function(source) {
      if (source.code == 1) {
        var data = source.data;
        Toolbar.settings.dataCount = data.count;
        data.statusTypes = [''];
        $('#calendarLoading').hide();

        // 过滤发起人
        if (data.calendars) {
          data.calendars.forEach(function(calendar) {
            calendar.members.forEach(function(member, key) {
              if (member.accountID === calendar.createUser) {
                calendar.members.splice(key, 1);
                return;
              }
            });
          });
        }

        if (Toolbar.settings.dataCount > 0) {
          // 加载模板
          $('#calendarNumber')
            .html(Toolbar.settings.dataCount)
            .show();
          // 重复日程describe
          for (var i = 0; i < data.calendars.length; i++) {
            var calendar = data.calendars[i];
            if (!calendar.isRecur) {
              continue;
            }
            data.calendars[i].repeat = formatRecur(calendar);
          }

          data.TplComm = Toolbar.inviteCalendarMethod;
          // 摘要换行
          data.calendars.forEach(item => {
            item.description = htmlEncodeReg(item.description).replace(/\n/g, '<br>');
          });
          $('#invitedMain')
            .show()
            .find('#invitedCalendars')
            .html(Toolbar.Comm.doT.template(calendarInviteTpl)(data));
        } else {
          $('#invitedMain')
            .show()
            .find('#invitedCalendars')
            .html('<div class="noData">' + _l('暂无待确认日程') + '</div>');
          $('#calendarNumber').hide();
        }
      } else {
        Toolbar.Comm.errorMessage(source.msg);
      }
    });
  },

  colorClass: function(val, type) {
    switch (val) {
      case 0:
        return type == 'list' ? 'iconTickRed' : 'colorBlockRed'; // 红色
      case 1:
        return type == 'list' ? 'iconTickViolet' : 'colorBlockViolet'; // 紫色
      case 2:
        return type == 'list' ? 'iconTickBrown' : 'colorBlockBrown'; // 褐色
      case 3:
        return type == 'list' ? 'iconTickOrange' : 'colorBlockOrange'; // 橙色
      case 4:
        return type == 'list' ? 'iconTickBlue' : 'colorBlockBlue'; // 蓝色
      case 5:
        return type == 'list' ? 'iconTickGreen' : 'colorBlockGreen'; // 绿色
      case 6:
        return type == 'list' ? 'iconTickYellow' : 'colorBlockYellow'; // 黄色
      default:
        break;
    }
  },

  // 不同颜色class 返回不同的值
  colorValue: function(val) {
    switch (val) {
      case 'colorBlockRed':
        return 0; // 红色
      case 'colorBlockViolet':
        return 1; // 紫色
      case 'colorBlockBrown':
        return 2; // 褐色
      case 'colorBlockOrange':
        return 3; // 橙色
      case 'colorBlockBlue':
        return 4; // 蓝色
      case 'colorBlockGreen':
        return 5; // 绿色
      case 'colorBlockYellow':
        return 6; // 黄色
      default:
        break;
    }
  },

  // 未确认日程颜色
  inviteColorClass: function(val) {
    switch (val) {
      case 0:
        return 'calendarColorRed'; // 红色
      case 1:
        return 'calendarColorViolet'; // 紫色
      case 2:
        return 'calendarColorBrown'; // 褐色
      case 3:
        return 'calendarColorOrange'; // 橙色
      case 4:
        return 'calendarColorBlue'; // 蓝色
      case 5:
        return 'calendarColorGreen'; // 绿色
      case 6:
        return 'calendarColorYellow'; // 黄色
      case 99:
        return 'calendarColorGreen'; // 绿色
      case 100:
        return 'calendarColorYellow'; // 黄色
      default:
        return 'calendarColorBlue'; // 蓝色
    }
  },

  // 其他同事
  otherUsers: function() {
    if (
      Toolbar.Comm.settings.otherUsers.length == 1 &&
      Toolbar.Comm.settings.otherUsers[0] == md.global.Account.accountId
    )
      return;

    Toolbar.Comm.ajaxRequest
      .getUserInfo({
        accountIDs: Toolbar.Comm.settings.otherUsers.join(','),
      })
      .then(function(source) {
        if (source.code == 1) {
          Toolbar.Method.addOtherUser(source.data);
        } else {
          Toolbar.Comm.errorMessage(source.msg);
        }
      });
  },

  // 填充他人信息
  addOtherUser: function(data, isPrepend) {
    var html = Toolbar.Comm.doT.template(addOtherUserTpl)(data);
    var $OtherUserCalendar = $('#tb_OtherUserCalendar');
    var $hideOneself = $('#hideOneself');

    if (isPrepend) {
      $OtherUserCalendar.prepend(html);
    } else {
      $OtherUserCalendar.html(html);
    }

    $OtherUserCalendar.show();
    $hideOneself.show();

    if (isPrepend) {
      $('#calendarType').scrollTop($('#calendarType')[0].scrollHeight);
    }

    if ($.inArray(md.global.Account.accountId, Toolbar.Comm.settings.otherUsers) < 0) {
      $hideOneself
        .find('.cbComplete')
        .removeClass('icon-calendar-nocheck')
        .addClass('icon-calendar-check');
    }
  },
};

// 未确认日程模板处理方法
Toolbar.inviteCalendarMethod = {
  // 时间显示格式化
  formatInviteData: function(start, end, isAllDay, type) {
    var starTime = moment(start); // 开始时间
    var endTime = moment(end); // 结束时间

    var startYear = parseInt(starTime.years(), 10);
    var startMon = parseInt(starTime.months(), 10);
    var startDay = parseInt(starTime.date(), 10);

    var endYear = parseInt(endTime.years(), 10);
    var endMon = parseInt(endTime.months(), 10);
    var endDay = parseInt(endTime.date(), 10);

    var calendarTime = '';
    // 是否同一天 0否 1 是
    var flag = 0;
    if (startYear == endYear && startMon == endMon && startDay == endDay) {
      flag = 1;
    }
    // 如果是全天
    if (isAllDay) {
      // 今天 明天
      if (type == 0) {
        if (flag == 1) {
          // 今天 当天
          calendarTime = starTime.format('MM月DD日 (ddd)') + ' (' + _l('全天') + ')';
        } else {
          // 今天  跨天
          start = starTime.format('MM月DD日 (ddd)');
          end = endTime.format('MM月DD日 (ddd)') + ' (' + _l('全天') + ')';
          calendarTime = start + ' - ' + end;
        }
      }
    } else {
      if (type == 0) {
        if (flag == 1) {
          // 今 非全天 当天
          start = starTime.format('MM月DD日 (ddd) HH:mm');
          end = endTime.format('HH:mm');
          calendarTime = start + ' - ' + end;
        } else {
          // 今天 非全天 跨天
          start = starTime.format('MM月DD日 (ddd) HH:mm');
          end = endTime.format('MM月DD日 (ddd) HH:mm');
          calendarTime = start + ' - ' + end;
        }
      }
    }
    return calendarTime;
  },
  // 周 set
  setWeek: function(weekDay) {
    var weeksOld = weekDay.split(',');
    var count = weeksOld.length;
    var setWeek = _l('星期');
    var weeks = [];
    for (var i = 0; i < count; i++) {
      weeks.push(parseInt(weeksOld[i], 10));
      setWeek += Toolbar.inviteCalendarMethod.getWeekUpper(parseInt(weeksOld[i], 10)) + '、';
    }

    setWeek = setWeek.substring(0, setWeek.length - 1);
    if (weeks.length == 5) {
      if (parseInt(weeks[0], 10) == 1 && parseInt(weeks[4], 10) == 5) {
        setWeek = _l('在 工作日');
      }
    }

    return setWeek;
  },

  // 周大写
  getWeekUpper: function(week) {
    var weeks = [0, 1, 2, 3, 4, 5, 6].map(function(item) {
      return moment()
        .day(item)
        .format('dd');
    });
    return weeks[week];
  },
};

Toolbar.Export = {
  init: function() {
    Toolbar.Comm.settings.otherUsers = window.localStorage.getItem('otherUsers' + md.global.Account.accountId)
      ? window.localStorage.getItem('otherUsers' + md.global.Account.accountId).split(',')
      : [md.global.Account.accountId];

    // 处理冲突日程跳转处理
    if (Toolbar.Comm.getQueryString('view') == 'agendaWeek') {
      safeLocalStorageSetItem('lastView', 'agendaWeek');
      Toolbar.Comm.settings.date = Toolbar.Comm.getQueryString('date');
      Toolbar.Comm.settings.otherUsers = [md.global.Account.accountId];
      Toolbar.Comm.settings.otherUsers.push(Toolbar.Comm.getQueryString('userID'));
      safeLocalStorageSetItem('otherUsers' + md.global.Account.accountId, Toolbar.Comm.settings.otherUsers.join(','));
      history.replaceState('', '', 'home');
    }

    // 初始化执行
    Toolbar.Calendar.init();
    Toolbar.Method.init();
    Toolbar.Method.calendarRemind();
    Toolbar.Method.otherUsers();
  },
  bindEvent: Toolbar.Event,
};

export default Toolbar.Export;
