import './selectAllGroup.less';
import '@mdfe/nanoscroller';
import 'src/components/mdBusinessCard/mdBusinessCard';
import { upgradeVersionDialog, htmlEncodeReg } from 'src/util';
import groupController from 'src/api/group';
import doT from 'dot';
import selectGroupTpl from './selectAllGroup.html';
import singleTplHtml from './singleTpl.html';
import normalGroupHtml from './normalGroup.html';
import createGroup from 'src/components/group/create/creatGroup';
import _ from 'lodash';

var tpl = doT.template(selectGroupTpl);
function SelectGroup(el, setting) {
  var DEFAULTS = {
    defaultValueAllowChange: true, // 是否允许更改默认选中项
    maxHeight: 370, // 最大高度
    defaultValue: {
      project: [], // 选中所有同事的projectId
      group: [], // 选中的groupId
    }, // 默认选中
    position: 'bottom', // 菜单出现的位置 ‘bottom', 'top'
    defaultIsNone: false, // 默认不选择任何群组
    isAll: true, // 上是否显示所有同事
    isMe: true, // 显示我自己
    isRadio: true, // 是否全员广播
    isAllAttendees: false, // 是否显示为已出席人员
    everyoneOnly: false, // 选择所有同事是否与选择群组互斥
    isShowIcon: true, // 显示icon
    reloadAfterCreateGroup: false,
    createGroupInProject: false,
    noCreateGroup: false, // 不显示创建群组
    filterDisabledGroup: false, // 过滤掉到期网络或群组
    renderWhenBegin: false, // 渲染单独部门时 立即渲染 不需要点击后才渲染
    showCompanyName: false,
    onLoad: function () {},
    reSize: function () {}, // 大小变化回调
    changeCallback: function () {}, // 选择回调
  };
  // console.info('selectAllGroup-settings', setting);
  this.projectItemPos = []; // 网络组据顶部的位置
  this.setting = setting;
  this.options = _.assign(
    {},
    {
      pluginId: Math.random().toString(),
      menuWidth: 230,
    },
    DEFAULTS,
    setting,
  );
  this.value = {
    shareProjectIds: [],
    groups: [],
    radioProjectIds: [],
    map: {},
  };
  // 设置默认值
  if (
    setting &&
    typeof setting.defaultValue === 'object' &&
    setting.defaultValue.project &&
    setting.defaultValue.group &&
    setting.defaultValue.project.length === 0 &&
    setting.defaultValue.group.length === 0 &&
    this.options.isMe
  ) {
    this.value.personal = true;
  }
  if (typeof this.options.defaultValue === 'string') {
    this.value.groups = _.compact(this.options.defaultValue.split(','));
  } else {
    this.value.shareProjectIds = this.options.defaultValue.project ? this.options.defaultValue.project : [];
    this.value.groups = this.options.defaultValue.group ? this.options.defaultValue.group : [];
  }
  this.value.map = {};
  if (this.value.personal) {
    this.value.map = { li_personal: true };
  } else {
    this.value.groups.forEach(id => {
      this.value.map['li_normal_' + id] = true;
    });
    this.value.shareProjectIds.forEach(id => {
      this.value.map['li_allproject_' + id] = true;
    });
    this.value.radioProjectIds.forEach(id => {
      this.value.map['li_radio_' + id] = true;
    });
  }
  this.init(el);
}
SelectGroup.prototype = {
  init: function (el) {
    var SG = this;
    var projects = _.get(md, ['global', 'Account', 'projects']) || [];
    if (SG.options.filterDisabledGroup) {
      projects = projects.filter(function (project) {
        return project.licenseType !== 0;
      });
    }
    this.$el = $(el);
    this.$viewTo = this.$el.next('div.viewTo');
    if (this.$viewTo.length) {
      this.$viewTo.remove();
    }
    this.clearData();
    // 单独渲染某个网络或个人
    if (typeof this.options.projectId === 'string') {
      this.renderType = 'single';
      this.singleRender();
      return;
    }
    let data = _.assign({}, this.options, {
      projects: projects,
      projectsList: _.get(md, ['global', 'Account', 'projects']),
      hideMostUsed: (SG.options || {}).projectId === '',
      noCreateGroup: SG.options.noCreateGroup,
    });
    this.$viewTo = $(tpl(data));
    this.$el.after(this.$viewTo);
    if (SG.options.reSize) {
      SG.options.reSize();
    }
    this.setDataFromValue();
    this.setSelectedNum();
    this.bindEvent();
    if ($.isFunction(SG.options.onLoad)) {
      SG.options.onLoad();
    }
  },
  singleRender: function () {
    var SG = this;
    var singleTpl = doT.template(singleTplHtml);
    SG.options.isRadio = false;
    SG.$viewTo = $(
      singleTpl(
        _.assign({}, SG.options, {
          projectId: SG.options.projectId,
          companyName:
            SG.options.showCompanyName && SG.options.projectId !== ''
              ? md.global.Account.projects.filter(function (project) {
                  return project.projectId === SG.options.projectId;
                })[0].companyName
              : '',
          showCompanyName: SG.options.showCompanyName,
        }),
      ),
    );
    SG.$el.after(SG.$viewTo);
    if (SG.options.renderWhenBegin) {
      SG.fetchSingleWhenRenderProject();
    }
    SG.setDataFromValue();
    SG.setSelectedNum();
    SG.bindEvent();
  },
  bindEvent: function () {
    var SG = this;
    var $viewTo = this.$viewTo;
    $viewTo
      .find('.SelectAllGroup-selectGroup')
      .on('click', function () {
        var $groupList = $viewTo.find('.SelectAllGroup-groupListDiv');
        var leftHegiht =
          SG.options.position === 'top' ? $viewTo.offset().top : window.innerHeight - $viewTo.offset().top;
        if (leftHegiht < SG.options.maxHeight) {
          SG.options.maxHeight = leftHegiht - 50 < 150 ? 150 : leftHegiht - 50;
        }
        $viewTo.find('.groupListCon').css('maxHeight', SG.options.maxHeight);
        if ($groupList.is(':visible')) {
          $groupList.slideUp('fast');
        } else {
          SG.showAndBindClickaway($groupList);
        }
      })
      .end()
      .find('.SelectAllGroup-groupListDiv')
      .on('click', '.addNewGroup,.noGroup .createGroup2', function () {
        if (SG.options.noCreateGroup) {
          return;
        }
        createGroup.createInit({
          projectId: SG.options.projectId,
          createGroupInProject: SG.options.createGroupInProject,
          callback: function (data) {
            if (SG.options.reloadAfterCreateGroup) {
              if (window.location.pathname.indexOf('/feed') > -1) {
                window.location.href = `/feed?groupId=${data.groupId}`;
              } else {
                window.location.reload();
              }
            } else {
              var selected = SG.$el.SelectGroup('getScope');
              var selectGroupObj = {
                defaultValue: {
                  project: [],
                  group: [],
                },
              };
              if (selected) {
                selectGroupObj.defaultValue.project = selected.shareProjectIds;
                selectGroupObj.defaultValue.group = selected.shareGroupIds;
              }
              selectGroupObj.defaultValue.group.push(data.groupId);
              SG.$el.SelectGroup(_.assign({}, SG.setting, selectGroupObj));
            }
          },
        });
      })
      .find('.groupListCon')
      .on('scroll', function () {
        SG.changeFixedProjectItem();
      })
      .on('wheel', function (evt) {
        if ($(this).hasClass('nano')) {
          return;
        }
        SG.disableScrollParent(evt);
      })
      .find('.mostUsed')
      .on('change', '.groupList .groupItem input', function (event) {
        // 最常使用点击关联对应的
        var $groupItem = $(this).parents('.groupItem');
        var selectedGroup = $groupItem.data('groupid');
        var checked = event.currentTarget.checked;
        if ($groupItem.hasClass('everybody')) {
          SG.$viewTo
            .find('.projectItem')
            .filter(function (i, projectItem) {
              return $(projectItem).data('projectid') === selectedGroup;
            })
            .find('.everybody input')
            .prop('checked', checked);
          return;
        }
        SG.$viewTo
          .find('.projectItem:not(.mostUsed) .groupList .groupItem')
          .filter(function (i, group) {
            return $(group).data('groupid') === selectedGroup;
          })
          .find('input')
          .prop('checked', checked);
      })
      .end()
      .find('.projectItem')
      .on('click', '.projectTitle:not(.disabled)', function (e) {
        var $this = $(this);
        var $projectItem = $this.closest('.projectItem');
        if ($projectItem.hasClass('mostUsed')) {
          return;
        }
        $projectItem.find('.groupList').slideToggle(function () {
          if ($projectItem.find('.groupList .groupItem').length === 0) {
            var projectId = $projectItem.data('projectid');
            if (!projectId) {
              if ($projectItem.hasClass('mostUsed')) {
                projectId = 'mostUsed';
              }
              if ($projectItem.hasClass('personItem')) {
                projectId = 'personItem';
              }
            }
            SG.fetchGroup(projectId).then(function () {
              if ($projectItem.is(':visible')) {
                SG.getProjectItemPos();
                SG.changeFixedProjectItem();
              }
            });
          }
        });
        $(this).toggleClass('open');
        if (!SG.$viewTo.find('.projectItem .projectTitle.open').length) {
          SG.$viewTo.find('.projectTitle').removeClass('fixed').css('top', '0px');
        }
        e.stopPropagation();
      })
      .on('change', '.groupList .groupItem input', function (event) {
        SG.clearData();
        var $this = $(this);
        var checked = event.currentTarget.checked;
        var $groupItem = $this.closest('.groupItem');
        var isMostUsed = !!$groupItem.parents('.projectItem.mostUsed').length;
        var idStr = $groupItem.data('idStr');
        var type = $groupItem.data('type');

        SG.value.map.li_personal = false;
        $groupItem
          .siblings('.radio')
          .toArray()
          .forEach(ele => {
            SG.value.map[$(ele).data('idStr')] = false;
          });
        if ($groupItem.hasClass('radio') || $groupItem.hasClass('allproject')) {
          SG.$viewTo.find('.groupItem').removeClass('gray');
        } else {
          $groupItem.parent().children().removeClass('gray');
        }
        // 设置值
        SG.value.map[idStr] = checked;

        if (type === 'personal') {
          Object.keys(SG.value.map).forEach(key => {
            SG.value.map[key] = key === 'li_personal' ? checked : false;
          });
        } else if (type === 'radio') {
          $groupItem
            .siblings()
            .toArray()
            .forEach(ele => {
              SG.value.map[$(ele).data('idStr')] = false;
            });
          Object.keys(SG.value.map).forEach(key => {
            if (new RegExp(/^li_radio_(\w{8}-(\w{4}-){3}\w{12})$/).test(key) && key !== idStr) {
              SG.value.map[key] = false;
            }
            if (new RegExp(/^li_allproject_(\w{8}-(\w{4}-){3}\w{12})$/).test(key)) {
              SG.value.map[key] = false;
            }
          });
          $groupItem.siblings().addClass('gray');
        } else if (type === 'allproject') {
          if (SG.options.everyoneOnly && !isMostUsed) {
            $groupItem
              .siblings()
              .toArray()
              .forEach(ele => {
                SG.value.map[$(ele).data('idStr')] = false;
              });
          }
          Object.keys(SG.value.map).forEach(key => {
            if (new RegExp(/^li_radio_(\w{8}-(\w{4}-){3}\w{12})$/).test(key) && key !== idStr) {
              SG.value.map[key] = false;
            }
          });
        } else {
          if (SG.options.everyoneOnly && !isMostUsed) {
            $groupItem
              .siblings('.allproject')
              .toArray()
              .forEach(ele => {
                SG.value.map[$(ele).data('idStr')] = false;
              });
          }
        }

        Object.keys(SG.value.map).forEach(key => {
          SG.$viewTo
            .find('.' + key)
            .find('input')
            .prop('checked', SG.value.map[key]);
          if (!SG.value.map[key]) {
            delete SG.value.map[key];
          }
        });
        // console.log(SG.value.map);
        SG.setSGValue();
        // 设置已选择数组值
        SG.setDataFromValue();
        SG.setSelectedNum();
      });
    SG.$viewTo.on('click', '.projectItem:not(.mostUsed) .groupItem.disabled', function () {
      var projectId = $(this).closest('.projectItem').data('projectid');
      upgradeVersionDialog({
        projectId,
        explainText: _l('请升级至付费版解锁开启'),
        isFree: true,
      });
    });
  },
  setSGValue: function () {
    var SG = this;
    var allprojectRegExp = new RegExp(/^li_allproject_(\w{8}-(\w{4}-){3}\w{12})$/);
    var normalRegExp = new RegExp(/^li_normal_(\w{8}-(\w{4}-){3}\w{12})$/);
    var radioRegExp = new RegExp(/^li_radio_(\w{8}-(\w{4}-){3}\w{12})$/);
    var shareProjectIds = [];
    var radioProjectIds = [];
    var shareGroupIds = [];
    Object.keys(SG.value.map).forEach(key => {
      if (allprojectRegExp.test(key)) {
        shareProjectIds.push(key.match(allprojectRegExp)[1]);
      } else if (radioRegExp.test(key)) {
        radioProjectIds.push(key.match(radioRegExp)[1]);
      } else if (normalRegExp.test(key)) {
        shareGroupIds.push(key.match(normalRegExp)[1]);
      }
    });
    if (SG.value.map.li_personal) {
      this.value.personal = true;
    } else {
      this.value.personal = false;
    }
    this.value.groups = shareGroupIds;
    this.value.shareProjectIds = shareProjectIds;
    this.value.radioProjectIds = radioProjectIds;
  },
  fetchGroup: function (projectId) {
    var SG = this;
    if (projectId === 'personItem') {
      return SG.fetchSingle('', SG.$viewTo.find('.projectItem.personItem'));
    } else {
      var $projectItem = SG.$viewTo.find('#projectItem_' + projectId);
      return SG.fetchSingle(projectId, $projectItem);
    }
  },
  getGroupType(group) {
    if (!group.extra) {
      return 'normal';
    } else if (group.extra.isMe) {
      return 'personal';
    } else if (group.extra.isRadio) {
      return 'radio';
    } else if (group.extra.isProject) {
      return 'allproject';
    }
    return 'normal';
  },
  formatGroups(groups) {
    var SG = this;
    return groups.map(g => ({
      value: g.value,
      id: g.id,
      type: SG.getGroupType(g),
      disabled: g.extra && g.extra.licenseType === 0,
      id_str: 'li_' + SG.getGroupType(g) + (SG.getGroupType(g) === 'personal' ? '' : '_' + g.id),
    }));
  },
  fetchSingle: function (id, $target) {
    var SG = this;
    var groupTpl = doT.template(normalGroupHtml);
    var licenseType = $target.data('licensetype');
    return groupController
      .selectGroup({
        projectId: id,
        withRadio: SG.options.isRadio,
      })
      .then(function (data) {
        if (id === '' && SG.options.filterDisabledGroup) {
          data = data.filter(function (project) {
            return !(project.extra && project.extra.licenseType === 0);
          });
        }
        var groups = SG.formatGroups(data);
        if (SG.options.isAll && id) {
          groups = [
            {
              value: SG.options.isAllAttendees ? _l('所有出席人员') : _l('所有同事'),
              id: id,
              type: 'allproject',
              id_str: 'li_allproject_' + id,
            },
            ...groups,
          ];
        }
        if (!id && SG.options.isMe) {
          groups = [
            {
              value: _l('我自己'),
              id: md.global.Account.accountId,
              type: 'personal',
              id_str: 'li_personal',
            },
            ...groups,
          ];
        }
        $target.find('.groupList').html(
          groupTpl({
            list: groups,
            projectId: id,
            everyoneOnly: SG.options.everyoneOnly,
          }),
        );
        $target.find('.groupList').append($target.find('.groupItem.disabled'));
        SG.defaultSelectInit();
        if (id === '') {
          SG.bindBusinessCard($target);
        }
        return data;
      });
  },
  setSelectedNumHtml(text, preText) {
    preText = preText || '';
    var SG = this;
    var html =
      preText +
      ('<i class="icon-eye"></i><span class="ThemeColor3 ellipsis InlineBlock" style="max-width: 100px">' +
        text +
        '</span><i class="icon-arrow-down-border font8"></i>');
    SG.$viewTo.find('.SelectAllGroup-selectedGroup').html(html);
  },
  // 设置组件已选择数
  setSelectedNum: function () {
    var SG = this;
    var selectedNum = SG.value.shareProjectIds.length + SG.value.groups.length;
    if (SG.value.radioProjectIds && SG.value.radioProjectIds.length > 0) {
      var radioProjectIds = SG.value.radioProjectIds;
      var companyNames = radioProjectIds.map(p => SG.getCompanyNameOfProject(p) || '');
      var selectedStr =
        _l('发消息通知 ') +
        '<span class="ThemeColor3">' +
        '<span class="InlineBlock ellipsis" style="max-width: 200px">' +
        companyNames.join(',') +
        '</span>' +
        '</span>' +
        _l(' 全员，并置顶动态');
      SG.setSelectedNumHtml(selectedNum ? _l('已选择 %0 项', selectedNum) : _l('全员广播'), selectedStr);
      return;
    }
    if (SG.value.personal) {
      SG.setSelectedNumHtml(_l('我自己'));
      return;
    }
    if (selectedNum === 1) {
      if (SG.value.shareProjectIds.length > 0) {
        SG.setSelectedNumHtml(_l('所有同事'));
      } else {
        var $groupItem = SG.$viewTo.find('.groupItem').filter(function (i, group) {
          return $(group).data('groupid') === SG.value.groups[0];
        });
        if ($groupItem.length) {
          SG.setSelectedNumHtml(htmlEncodeReg($groupItem.eq(0).text()));
        } else {
          groupController
            .getGroupInfo({
              groupId: SG.value.groups[0],
            })
            .then(function (data) {
              if (data) {
                SG.setSelectedNumHtml(htmlEncodeReg(data.name));
              }
            });
        }
      }
    } else {
      if (selectedNum !== 0) {
        SG.setSelectedNumHtml(_l('已选择 %0 项', selectedNum));
      } else {
        SG.setSelectedNumHtml(_l('选择分享范围'));
      }
    }
  },
  getProjectItemPos: function () {
    var projectItemHeights = this.$viewTo.find('.projectItem').map(function (i, ele) {
      return $(ele).height();
    });
    var toTops = projectItemHeights.toArray().map(function (ele, i) {
      return _.sum(projectItemHeights.slice(0, i));
    });
    this.projectItemPos = toTops;
    this.emitNanoScroll();
  },
  changeFixedProjectItem: function () {
    var scrollTop;
    var SG = this;
    var $projectTitles = SG.$viewTo.find('.SelectAllGroup-groupListDiv .projectTitle');
    var $groupListCon = SG.$viewTo.find('.SelectAllGroup-groupListDiv .groupListCon');
    if ($groupListCon.hasClass('nano')) {
      scrollTop = $groupListCon.find('.nano-content').scrollTop();
    } else {
      scrollTop = $groupListCon.scrollTop();
    }
    // 根据scrollTop值和projectItem据上面的距离计算当前维度网络的index
    function getActiveIndex(num, array) {
      var result;
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i + 1] && _.inRange(num, array[i], array[i + 1])) {
          result = array.indexOf(array[i]);
        }
      }
      if (typeof result === 'undefined' && num > array[array.length - 1]) {
        result = array.length - 1;
      }
      return result;
    }
    var activeIndex = getActiveIndex(scrollTop, SG.projectItemPos);
    if (SG.$viewTo.find('.projectItem .projectTitle.open').length) {
      $projectTitles
        .removeClass('fixed')
        .css('top', '0px')
        .eq(activeIndex)
        .addClass('fixed')
        .css('top', scrollTop + 'px');
    }
  },
  emitNanoScroll: function () {
    var SG = this;
    var $groupListCon = SG.$viewTo.find('.SelectAllGroup-groupListDiv .groupListCon');
    if (SG.$viewTo.find('.SelectAllGroup-groupListDiv .groupListCon').height() >= SG.options.maxHeight) {
      if (!$groupListCon.hasClass('nano')) {
        $groupListCon
          .addClass('nano')
          .height(SG.options.maxHeight)
          .children('ul')
          .wrap($('<div class="nano-content">'));
        $groupListCon
          .find('.nano-content')
          .on('scroll', function () {
            SG.changeFixedProjectItem();
          })
          .on('wheel', SG.disableScrollParent);
      }
      SG.$viewTo.find('.nano').nanoScroller();
    } else {
      if ($groupListCon.hasClass('nano')) {
        $groupListCon.removeClass('nano').height('auto').nanoScroller({ destroy: true });
      }
    }
  },
  disableScrollParent: function (evt) {
    var clientHeight = evt.currentTarget.clientHeight;
    var scrollTop = evt.currentTarget.scrollTop;
    var scrollHeight = evt.currentTarget.scrollHeight;
    var isTop = evt.originalEvent.deltaY < 0 && scrollTop === 0;
    var isBottom = evt.originalEvent.deltaY > 0 && clientHeight + scrollTop >= scrollHeight;
    if (isTop || isBottom) {
      evt.preventDefault();
    }
  },
  // 默认展开收起逻辑
  defaultSlide: function () {
    var SG = this;
    var $mostUsed = SG.$viewTo.find('.projectItem.mostUsed');
    $.when(
      !md.global.Account.projects.length
        ? groupController.selectGroup({
            projectId: '',
          })
        : true,
      groupController.selectGroupMostFrequent(),
    )
      .done(function (personal, mostUsed) {
        var $groupList = SG.$viewTo.find('.SelectAllGroup-groupListDiv');
        if (_.isArray(personal) && !personal.length && !md.global.Account.projects.length) {
          $groupList.addClass('isNew');
        }
        if (!mostUsed.length) {
          $groupList.addClass('noMostUsed');
        } else {
          var groupTpl = doT.template(normalGroupHtml);
          var groups = SG.formatGroups(
            mostUsed
              .filter(function (project) {
                return !(project.extra && project.extra.licenseType === 0);
              })
              .slice(0, 8),
          );
          $mostUsed.find('.groupList').html(
            groupTpl({
              list: groups,
              mostUsed: true,

              licenseType: 1,
              isAll: SG.options.isAll,
              isMe: SG.options.isMe,
              isAllAttendees: SG.options.isAllAttendees,
              everyoneOnly: SG.options.everyoneOnly,
            }),
          );
          $mostUsed.find('.groupItem.personal .groupName').text(_l('我自己'));
          $mostUsed.find('.groupList').append($mostUsed.find('.groupItem.personal'));
          $mostUsed.find('.groupList').append($mostUsed.find('.groupItem.disabled'));
          SG.defaultSelectInit();
          SG.bindBusinessCard($mostUsed);
        }
        $groupList.removeClass('isLoading');
        $mostUsed.find('.groupList').show();
        if (SG.options.reSize) {
          SG.options.reSize();
        }
        SG.getProjectItemPos();
        SG.changeFixedProjectItem();
        var $projectItems = SG.$viewTo.find('.projectItem');
        if ($projectItems.length === 2) {
          $projectItems.eq(1).find('.projectTitle').click();
        }
        if ($projectItems.length === 3) {
          if ($projectItems.eq(2).find('.projectTitle').hasClass('disabled')) {
            $projectItems.eq(1).find('.projectTitle').click();
          } else {
            $projectItems.eq(2).find('.projectTitle').click();
          }
        }
        if (SG.options.projectId === '') {
          SG.$viewTo.find('.projectItem.personItem .projectTitle').click();
        }
        SG.loaded = true;
      })
      .fail(function () {
        alert(_l('获取群组失败'), 3);
      });
  },
  defaultSelectInit: function ($target) {
    var SG = this;
    var checkedDisabled = !SG.options.defaultValueAllowChange;
    Object.keys(SG.value.map).forEach(key => {
      SG.$viewTo
        .find('.' + key)
        .find('input')
        .prop('checked', SG.value.map[key])
        .attr('disabled', checkedDisabled);
    });
    if (SG.options.reSize) {
      SG.options.reSize();
    }
  },
  getCompanyNameOfProject(projectId) {
    var project = md.global.Account.projects.filter(p => p.projectId === projectId)[0];
    return project && project.companyName;
  },
  showAndBindClickaway: function ($div) {
    var SG = this;
    var speed = 'fast';
    if (!$div.is(':visible')) {
      $div.slideDown(speed, function () {
        if (SG.renderType !== 'single') {
          if (!SG.loaded) {
            SG.defaultSlide();
          } else {
            SG.getProjectItemPos();
            SG.changeFixedProjectItem();
          }
        } else {
          SG.fetchSingleWhenRenderProject();
        }
      });
      var hideDiv = function (evt) {
        if (!$(evt.target).closest($div).length) {
          $div.slideUp(speed);
          $(document).off('click.selectGroup');
        }
      };
      setTimeout(function () {
        $(document).on('click.selectGroup', hideDiv);
      }, 100);
    }
  },
  fetchSingleWhenRenderProject() {
    var SG = this;
    SG.fetchSingle(SG.options.projectId, SG.$viewTo.find('.projectItem')).then(function (data) {
      var groupIds = data.map(function (group) {
        return group.id;
      });
      SG.defaultSelectInit();
      if (SG.options.filterByProjects) {
        SG.value.groups = SG.value.groups.filter(function (groupId) {
          return _.includes(groupIds, groupId);
        });
      }
      SG.setSelectedNum();
      SG.setDataFromValue();
      SG.emitNanoScroll();
    });
  },
  clearData: function () {
    var SG = this;
    SG.$el.data('shareProjectIds', '');
    SG.$el.data('radioProjectIds', '');
    SG.$el.data('selected', 0);
    SG.$el.val('');
  },
  clearValue: function () {
    var SG = this;
    SG.value = {
      shareProjectIds: [],
      groups: [],
      radioProjectIds: [],
    };
  },
  setDataFromValue: function () {
    var SG = this;
    var shareProjectIds = SG.value.shareProjectIds;
    var radioProjectIds = SG.value.radioProjectIds;
    var shareGroupIds = SG.value.groups;
    var personal = SG.value.personal;
    SG.$el.val(shareGroupIds.join(',')); // 已选中群组
    SG.$el.data('shareGroupIds', shareGroupIds.join(',')); // 已选中群组
    SG.$el.data('shareProjectIds', shareProjectIds.join(',')); // 分享所有同事的网络
    SG.$el.data('radioProjectIds', radioProjectIds.join(',')); // 全员广播
    SG.$el.data(
      'selected',
      !shareGroupIds.length && !shareProjectIds.length && !radioProjectIds.length && !personal ? 0 : 1,
    ); // 是否已选择群组
    if (SG.options.changeCallback) {
      SG.options.changeCallback(SG.value);
    }
  },
  bindBusinessCard: function ($target) {
    $target.find('.groupItem:not(.personal,.everybody) .groupInfo').mdBusinessCard({
      type: 'group',
      offset: {
        y: -5,
      },
    });
  },
};

export default SelectGroup;

function $SelectGroup(setting) {
  return $(this).each(function (i, ele) {
    var init = new SelectGroup(ele, setting);
  });
}

var methods = {
  getScope: function () {
    var $this = $(this);
    if (!$this.next('.viewTo').length) {
      return null;
    }
    var shareGroupIds = _.compact(($this.data('shareGroupIds') || '').split(','));
    var shareProjectIds = _.compact(($this.data('shareProjectIds') || '').split(','));
    // TODO 后端还没改这样会报错
    var radioProjectIds = _.compact($this.data('radioProjectIds' || '').split(','));
    // var radioProjectIds = _.compact($this.data('radioProjectIds').split(','))[0] || '';
    var selected = $this.data('selected');
    if (!selected) {
      return null;
    }
    return {
      shareGroupIds: shareGroupIds,
      shareProjectIds: shareProjectIds,
      radioProjectIds: radioProjectIds,
    };
  },
  slideDown: function () {
    var $this = $(this);
    var $con = $this.next('.viewTo').find('.SelectAllGroup-selectGroup');
    if ($con.length) {
      $con.click();
    } else {
      console.error(_l('没找到该组件'));
    }
  },
};
$.fn.SelectGroup = function () {
  var settings = arguments;
  var method = settings[0];
  if (methods[method]) {
    method = methods[method];
    settings = Array.prototype.slice.call(settings, 1);
  } else if (typeof method === 'object' || !method) {
    method = $SelectGroup;
  } else {
    $.error('Method' + method + 'does not exist on selectAllGroup');
    return this;
  }
  return method.apply(this, settings);
};
