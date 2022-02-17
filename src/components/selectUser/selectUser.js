/**
 * @module selectUser
 * @author beck
 * @desc todo
 */
import './style.css';
import { htmlEncodeReg } from 'src/util';
var userController = require('src/api/user');
var departmentController = require('src/api/department');
var groupController = require('src/api/group');
var structureController = require('src/api/structure');

(function ($) {
  $.fn.selectUser = function (param) {
    return new SelectUser(this, param);
  };

  var SelectUser = function (el, param) {
    var defaults = {
      defaultTabs: [
        {
          id: 'conactUser',
          name: _l('所有人'), // 按姓氏拼音排序
          type: 1,
          page: true, // 是否分页
          actions: {
            getContactUsers: userController.getContactUserList,
          },
        },
        {
          id: 'department',
          name: _l('部门'),
          type: 2,
          page: false,
          actions: {
            getDepartments: departmentController.getContactProjectDepartments,
            getDepartmentUsers: departmentController.getDepartmentUsers,
          },
        },
        {
          id: 'group',
          name: _l('群组'),
          type: 3,
          page: true,
          actions: {
            getGroups: groupController.getContactGroups,
            getGroupUsers: groupController.getGroupEffectUsers,
          },
        },
        {
          id: 'subordinateUser',
          name: _l('我的下属'),
          type: 4,
          page: true,
          actions: {
            getUsers: structureController.getSubordinateUsers,
          },
        },
      ],
      _id: 0, // index for defaultTabs
      defaultTabsFilter: function (defaultTabs) {
        return defaultTabs;
      },
      showTabs: ['conactUser', 'department', 'group', 'subordinateUser'],
      // 格式和defaultTabs一致,id和page可以为空
      // 方法请求的参数(pageIndex:int,pageSize:int,keywords string，filterAccountIds:[]，projectId string)
      // 返回结果listModel {list:[{accountId:'',avatar:'',fullname:'',department:''}],allCount:1}
      extraTabs: [],
      tabTypes: {
        contactUser: 1, // 姓氏排名的联系人
        department: 2, // 部门
        group: 3, // 群组
        user: 4, // 用户列表
      },
      dataRangeTypes: {
        all: 0,
        friend: 1,
        project: 2,
      },
      txtSearchTip: _l('搜索用户'), // 搜索input 默认值
      btnName: _l('确认'), // 按钮文字
      allowSelectNull: false, // 是否允许选择列表为空
      filterAccountIds: [],
      filterProjectId: '',
      filterFriend: false,
      dataRange: 0, // 0 全部  1 好友 2 网络
      keywords: '', // 搜索关键字
      firstLetter: '', // 首字母
      projectId: '', // 网络ID  默认选中某个网络
      unique: false, // 是否只可以选一个
      pageIndex: 1,
      pageSize: 20,
      isMore: true, // 当点击要过滤的用户时
      loadedUserArr: [], // 已加载的用户
      accountIdArr: [], // 已选择的用户AccountId
      promiseObj: null,
      nullTip: '', // 空状态提示
      callback: function (data) {},
    };

    this.options = $.extend(defaults, param);

    var _this = this;
    if (_this.options.defaultTabsFilter) {
      _this.options.defaultTabs = _this.options.defaultTabsFilter(_this.options.defaultTabs);
    }
    // 新添加的tab
    if (this.options.extraTabs && this.options.extraTabs.length) {
      $.map(this.options.extraTabs, function (item) {
        _this.options.defaultTabs.push(item);
      });
    }
    var showTabs = [];
    if (this.options.showTabs && this.options.showTabs.length) {
      showTabs = _.filter(_this.options.defaultTabs, function (item) {
        return _this.options.showTabs.indexOf(item.id) !== -1;
      });
    }
    this.options.defaultTabs = showTabs;

    this.$el = $(el);
    this.changeData = this.getData; // 修改数据列表的方法
    this.init();
  };

  $.extend(SelectUser.prototype, {
    // 初始化
    init: function () {
      var _this = this;
      var options = _this.options;
      var contentHtml = '';
      var contentHtml2 = '';
      for (var i = 0, length = options.defaultTabs.length; i < length; i++) {
        var tabItem = options.defaultTabs[i];
        contentHtml =
          contentHtml +
          `
        <li class='${i == 0 ? 'on ThemeBorderColor3' : 'off'}' data-id='${i}' title='${htmlEncodeReg(
            tabItem.name,
          )}'>
        ${htmlEncodeReg(tabItem.name)}
        </li>
        `;
      }

      for (var i = 0, len = 26; i < len; i++) {
        var index = String.fromCharCode(97 + i);
        contentHtml2 = contentHtml2 + `<li data-index='${index}'>${index}</li>`;
      }

      var html = `
      <div class='dialogSelectUserBox'>
      <div class='userArea'>
      <div class='opTypes'>
      <ul class='opUL'>
      ${contentHtml}
      </ul>
      <div class='searchArea'>
      <div class='searchIcon' title='${options.txtSearchTip}'><i class='icon-search'></i></div>
      <input type='text' placeholder='${options.txtSearchTip}' class='txt txtKeyword' />
      </div>
      <div class='closeIcon icon-delete' title='${_l('清空')}'></div>
      </div>
      <ul class='filterBox flexRow'>
      <li data-index=''><span class='TxtMiddle'>${_l('全部')}</span></li>
      <li data-index=1><span class='icon-star-hollow2'></span></li>
      ${contentHtml2}
      <li data-index=2 style=line-height: 18px;>#</li>
      </ul>
      <div class='list dataList' data-index='1' growing-ignore='true'></div>
      <div class='Clear'></div>
      </div>
      <div class='invitedUserArea list'></div>
      <div class='Clear'></div>
      <div class='cimmitArea'>
      <input type='button' class='invateButton ThemeBGColor3 btnSubmit' value='${options.btnName}' />
      <div class='Clear'></div>
      </div>
      </div>
      `;

      _this.$el.html(html);

      _this.bindEvent();

      _this.getData();
    },

    // 公开出去
    getData: function (settings) {
      var _this = this;
      var options = _this.options;
      if (settings && typeof settings === 'object') {
        $.extend(options, settings);
      }
      options.pageIndex = 1;
      options.isMore = true;
      options.firstLetter = '';
      _this.checkShowOpUL();
      _this.toggleFilterBox();

      _this.doSearch();
    },

    // 事件绑定
    bindEvent: function () {
      var _this = this;
      var options = _this.options;

      // 关键词搜索效果
      var $txtKeyword = this.$el.find('.txtKeyword');
      var $closePic = this.$el.find('.closeIcon');
      var $searchArea = this.$el.find('.searchArea');
      var $filterBox = this.$el.find('.filterBox');

      $txtKeyword.on({
        keyup: function () {
          if ($txtKeyword.val().trim() || options.projectId) {
            $closePic.show();
          } else {
            $closePic.hide();
          }

          options.keywords = $txtKeyword.val().trim();
          options.pageIndex = 1;
          options.isMore = true;
          _this.toggleFilterBox();
          _this.doSearch();
        },
      });

      // 关键词清空
      $closePic.on('click', function () {
        $txtKeyword.val('');
        $closePic.hide();

        options.keywords = '';
        options.pageIndex = 1;
        options.isMore = true;

        _this.checkShowOpUL();
        _this.doSearch();
      });

      // 搜索图标按钮
      $searchArea.find('.searchIcon').on('click', function () {
        if (!options.projectId) {
          return;
        }
        $searchArea.find('.txtKeyword').show().focus();
        $closePic.show();
      });

      /* Tab切换选择效果*/
      var $opLeftTabBg = _this.$el.find('.opTypes');
      $opLeftTabBg.find('li').on('click', function () {
        var $this = $(this);
        $this.siblings('li').addClass('off').removeClass('on ThemeBorderColor3');
        $this.removeClass('off').addClass('on ThemeBorderColor3');
        options._id = $this.data('id');
        options.pageIndex = 1;
        options.isMore = true;
        _this.toggleFilterBox();
        _this.doSearch();
      });

      // 确认按钮
      _this.$el.find('.btnSubmit').on('click', function () {
        if (!options.allowSelectNull && !options.accountIdArr.length) {
          alert(_l('请选择用户'), 3);
          return;
        }

        var data = _.filter(options.loadedUserArr, function (item) {
          return options.accountIdArr.indexOf(item.accountId) > -1;
        });

        // 按选择用户的顺序排序返回
        data = _.sortBy(data, function (item) {
          return options.accountIdArr.indexOf(item.accountId);
        });
        options.callback(data);
        options.accountIdArr = [];
      });

      // first Letter
      $filterBox.on('click', 'li', function () {
        var $this = $(this);
        var index = $this.data('index');
        options.firstLetter = index;
        options.pageIndex = 1;
        options.isMore = true;
        _this.doSearch();

        $this.addClass('ThemeColor3').siblings('.ThemeColor3').removeClass('ThemeColor3');
      });

      // 滚动加载
      var $dataList = _this.$el.find('.dataList');
      $dataList.scroll(function () {
        var tabItem = options.defaultTabs[options._id];
        if (tabItem && tabItem.page) {
          var nScrollHight = $(this)[0].scrollHeight;
          var nScrollTop = $(this)[0].scrollTop;
          var nDivHight = $dataList.height();
          if (nScrollTop > 0 && nScrollTop + nDivHight >= nScrollHight && options.isMore) {
            options.pageIndex += 1;
            _this.doAtion();
          }
        }
      });
    },
    // a-z index state toggle
    toggleFilterBox: function () {
      var isContact = this.options._id === 0;
      var isFriend = this.options.dataRange === this.options.dataRangeTypes.friend && this.options.projectId === '';
      var $filterBox = this.$el.find('.filterBox');
      $filterBox.toggleClass('Hidden', !isContact);
      if (!isContact) {
        this.options.firstLetter = '';
      }
      var _$children = $filterBox.children();
      // toggle `frequent`
      _$children.filter('[data-index=1]').toggle(!isFriend);

      _$children
        .removeClass('ThemeColor3')
        .filter('[data-index=' + this.options.firstLetter + ']')
        .addClass('ThemeColor3');
    },

    bindDataEvent: function () {
      var _this = this;
      var options = _this.options;

      var $tabContainer = _this.$el.find('.dataList');

      // 用户列表
      _this.bindUserItemEvent($tabContainer);

      // 部门 群组
      $tabContainer
        .find('.item')
        .unbind()
        .on({
          mouseover: function () {
            $(this).find('.itemRight').show();
          },
          mouseout: function () {
            $(this).find('.itemRight').hide();
          },
        });

      // 展开部门用户列表
      $tabContainer
        .find('.lblDepartment')
        .unbind()
        .on('click', function () {
          var $this = $(this);
          var departmentId = $this.attr('departmentId');
          var $subDepart = $tabContainer.find('.subDepart' + departmentId);

          if ($this.find('.arrow').hasClass('arrowRight')) {
            $this.find('.arrow').addClass('arrowDown').removeClass('arrowRight');
            if (!$subDepart.html().trim()) {
              _this.loadDepartmentUserList(departmentId, function (departmentUsers) {
                if (departmentUsers && departmentUsers.length > 0) {
                  $subDepart.html(_this.getUsersHtml(departmentUsers)).show();
                  _this.bindUserItemEvent($subDepart);
                } else {
                  $subDepart.hide();
                }
              });
            } else {
              $subDepart.show();
            }
          } else {
            $this.find('.arrow').addClass('arrowRight').removeClass('arrowDown');
            $subDepart.hide();
          }
        });

      // 添加部门中的所有成员
      $tabContainer
        .find('.addAllDepartment')
        .unbind()
        .on('click', function () {
          var $this = $(this);
          var departmentId = $this.attr('departmentId');
          var $subDepart = $tabContainer.find('.subDepart' + departmentId);

          if (!$subDepart.html().trim()) {
            _this.loadDepartmentUserList(departmentId, function (departmentUsers) {
              if (departmentUsers && departmentUsers.length > 0) {
                _this.uniqueLoadedUser(departmentUsers);
                for (var i = 0; i < departmentUsers.length; i++) {
                  _this.addUser(departmentUsers[i].accountId);
                }
              }
            });
          } else {
            $subDepart.find('.searchItem').each(function () {
              _this.addUserByCheckState(true, $(this));
            });
          }

          // 标记选中状态
          if ($subDepart.is(':visible')) {
            $subDepart.find('.searchItem .cb').attr('checked', true);
          }
        });

      // 展开群组用户列表
      $tabContainer
        .find('.lblGroup')
        .unbind()
        .on('click', function () {
          var $this = $(this);
          var groupId = $this.attr('groupId');
          var $subGroup = $tabContainer.find('.subGroup' + groupId);
          if ($this.find('.arrow').hasClass('arrowRight')) {
            $this.find('.arrow').addClass('arrowDown').removeClass('arrowRight');
            if (!$subGroup.html().trim()) {
              _this.loadGroupUserList(groupId, function (groupUsers) {
                if (groupUsers && groupUsers.length > 0) {
                  $subGroup.html(_this.getUsersHtml(groupUsers)).show();
                  _this.bindUserItemEvent($subGroup);
                } else {
                  $subGroup.hide();
                }
              });
            } else {
              $subGroup.show();
            }
          } else {
            $this.find('.arrow').addClass('arrowRight').removeClass('arrowDown');
            $subGroup.hide();
          }
        });

      // 添加群组中是所有成员
      $tabContainer
        .find('.addAllGroup')
        .unbind()
        .on('click', function () {
          var $this = $(this);
          var groupId = $(this).attr('groupId');
          var $subGroup = $tabContainer.find('.subGroup' + groupId);

          if (!$subGroup.html().trim()) {
            _this.loadGroupUserList(groupId, function (groupUsers) {
              if (groupUsers && groupUsers.length) {
                _this.uniqueLoadedUser(groupUsers);
                for (var i = 0; i < groupUsers.length; i++) {
                  _this.addUser(groupUsers[i].accountId);
                }
              }
            });
          } else {
            $subGroup.find('.searchItem').each(function () {
              _this.addUserByCheckState(true, $(this));
            });
          }

          // 标记选中状态
          if ($subGroup.is(':visible')) {
            $subGroup.find('.searchItem .cb').attr('checked', true);
          }
        });
    },

    bindUserItemEvent: function ($container) {
      var _this = this;
      var options = _this.options;

      // 用户列表
      $container
        .find('.searchItem')
        .unbind('click')
        .on({
          click: function (event) {
            // 添加单个用户
            var $this = $(this);
            var $cb = $this.find('.cb');

            if (!$(event.target).hasClass('cb')) {
              $cb.attr('checked', !$cb.attr('checked'));
            }
            // 唯一
            if (options.unique) {
              _this.$el
                .find(".dataList .searchItem[accountId!='" + $this.attr('accountId') + "'] .cb")
                .removeAttr('checked');
            }
            _this.addUserByCheckState($cb.attr('checked'), $this);
          },
        });
    },

    // 根据选中状态添加或删除用户
    addUserByCheckState: function (isChecked, $searchItem) {
      var _this = this;
      var accountId = $searchItem.attr('accountId');
      if (isChecked) {
        if (!_this.addUser(accountId)) {
          // alert("此用户已存在邀请列表中", 3);
        }
      } else {
        _this.removeUser(accountId);
      }
    },

    // 修改提交按钮文案
    editSubmitText: function () {
      var _this = this;
      var options = _this.options;

      var $btnSubmit = _this.$el.find('.btnSubmit');
      if (options.accountIdArr.length) {
        $btnSubmit.val(options.btnName + ' (' + options.accountIdArr.length + ')');
      } else {
        $btnSubmit.val(options.btnName);
      }
    },

    // 检测是否显示群组 部门筛选
    checkShowOpUL: function () {
      var _this = this;
      var options = _this.options;

      var $txtKeyword = _this.$el.find('.searchArea .txtKeyword');
      var $opUL = _this.$el.find('.opUL');
      if (options.projectId === '') {
        // `全部联系人` 和 `好友` 重置 opType
        options._id = 0;
        $opUL
          .children()
          .first()
          .removeClass('off')
          .addClass('on ThemeBorderColor3')
          .siblings('li')
          .addClass('off')
          .removeClass('on ThemeBorderColor3');
      }

      if (!options.projectId || options.keywords) {
        $opUL.hide();
        $txtKeyword.show().focus();
      } else {
        $opUL.show();
        $txtKeyword.hide();
      }
    },

    // 添加用户到邀请记录
    addUser: function (accountId) {
      var _this = this;
      var options = _this.options;

      var user = _.find(options.loadedUserArr, function (item) {
        return item.accountId == accountId;
      });
      if (!user) return false;

      var $invitedUserArea = _this.$el.find('.invitedUserArea');

      // 唯一
      if (options.unique) {
        options.accountIdArr = [];
        $invitedUserArea.empty();
      }

      if (options.accountIdArr.indexOf(accountId) > -1) return false;

      options.accountIdArr.push(accountId);

      $invitedUserArea.append(_this.getSelectUserHtml(user));

      $invitedUserArea.find(".remove[accountId='" + accountId + "']").on('click', function () {
        _this.removeUser($(this).attr('accountId'));
      });

      _this.editSubmitText();

      return true;
    },

    // 移除用户
    removeUser: function (accountId) {
      var _this = this;
      var options = _this.options;

      options.accountIdArr = _.filter(options.accountIdArr, function (id) {
        return id != accountId;
      });

      _this.$el.find(".invitedUserArea .subItem[accountId='" + accountId + "']").remove();
      _this.$el.find(".dataList .searchItem[accountId='" + accountId + "'] .cb").removeAttr('checked');

      _this.editSubmitText();
    },

    // 查询
    doSearch: function () {
      var _this = this;

      var $tabContainer = _this.$el.find('.dataList');
      $tabContainer.html(LoadDiv());
      _this.doAtion();
    },

    doAtion: function () {
      var _this = this;
      var options = _this.options;

      if (options.promiseObj && options.promiseObj.abort && options.promiseObj.state() === 'pending') {
        options.promiseObj.abort();
      }

      var tabItem = options.defaultTabs[options._id || 0];
      if (tabItem) {
        var reqData = {
          keywords: options.keywords,
          filterAccountIds: options.filterAccountIds,
          projectId: options.projectId,
          dataRange: options.dataRange,
          filterFriend: options.filterFriend,
          filterProjectId: options.filterProjectId,
          firstLetter: options.firstLetter,
        };

        if (tabItem.page) {
          reqData.pageIndex = options.pageIndex;
          reqData.pageSize = options.pageSize;
        }

        var doAction = null;
        var callback = null;

        if (tabItem.type == options.tabTypes.contactUser) {
          // 姓氏排名
          if (options.isTask) {
            reqData.isTask = options.isTask;
          }
          doAction = tabItem.actions.getContactUsers;
          callback = _this.loadSurnameUserList.bind(_this);
        } else if (tabItem.type == options.tabTypes.department) {
          // 部门
          doAction = tabItem.actions.getDepartments;
          callback = _this.loadDepartmentList.bind(_this);
        } else if (tabItem.type == options.tabTypes.group) {
          // 群组
          doAction = tabItem.actions.getGroups;
          callback = _this.loadGroupList.bind(_this);
          reqData.inProject = options.inProject;
        } else {
          // 其他 全部属于 user类型
          doAction = tabItem.actions.getUsers;
          callback = _this.loadUserList.bind(_this);
        }

        options.promiseObj = doAction(reqData);

        options.promiseObj.then(function (data) {
          callback(data);
        });
      }
    },

    showHtml: function (html, isAppend) {
      var _this = this;
      var $tabContainer = _this.$el.find('.dataList');
      if (html) {
        if (!isAppend) {
          $tabContainer.html(html);
        } else {
          $tabContainer.append(html);
        }
        _this.bindDataEvent();
      } else {
        if (!isAppend) {
          $tabContainer.html('<div class="TxtCenter mTop10">' + _l('暂无数据') + '</div>');
        }
      }
    },

    // 加载姓氏排名用户列表
    loadSurnameUserList: function (data) {
      var _this = this;
      var options = _this.options;
      var html = '';
      if (data) {
        var mTop10 = '';
        if (options.pageIndex == 1) {
          if (
            (data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length) ||
            (data.users && data.users.list.length)
          ) {
            if (data.oftenUsers && data.oftenUsers.list && data.oftenUsers.list.length) {
              mTop10 = 'mTop10';
              html += "<div class='mBottom10 mLeft10 Gray_9'>" + _l('与我经常协作的联系人') + '</div>';
              html += _this.getUsersHtml(data.oftenUsers.list);
            }
            if (data.users && data.users.list.length) {
              html += "<div class='oftenSplitLine mBottom10 " + mTop10 + "'>" + _l('按拼音A-Z排序') + '</div>';
            }
          } else {
            if (options.dataRange === 0 && options.projectId === '' && !options.keywords) {
              // 全部为空
              html += options.nullTip;
            }
          }
        }

        if (data.users && data.users.list.length) {
          html += _this.getUsersHtml(data.users.list);
        }

        if (!data.users || !data.users.list.length || data.users.list.length < options.pageSize) {
          options.isMore = false;
        }
      }
      _this.showHtml(html, options.pageIndex != 1);
    },

    // 加载部门列表
    loadDepartmentList: function (data) {
      var _this = this;
      var options = _this.options;
      var html = '';
      if (data && data.list.length) {
        html = _this.getDepartmentHtml(data.list);
      }
      _this.showHtml(html, false);
    },

    // 加载部门成员
    loadDepartmentUserList: function (departmentId, callback) {
      var _this = this;
      var options = _this.options;

      var tabItem = options.defaultTabs[options._id];

      var keywords = options.keywords;
      if (!$.trim($('.subDepart' + departmentId).html())) {
        keywords = '';
      }

      if (tabItem.type == options.tabTypes.department) {
        tabItem.actions
          .getDepartmentUsers({
            departmentId: departmentId,
            keywords: keywords,
            filterAccountIds: options.filterAccountIds,
            projectId: options.projectId,
          })
          .then(function (data) {
            if (data) {
              callback(data.list);
            } else {
              callback(false);
            }
          });
      }
    },

    // 加载群组列表
    loadGroupList: function (data) {
      var _this = this;
      var options = _this.options;
      var html = '';
      if (data && data.list.length) {
        html = _this.getGroupHtml(data.list);
      }

      if (!data || !data.list.length || data.list.length < options.pageSize) {
        options.isMore = false;
      }
      _this.showHtml(html, options.pageIndex != 1);
    },

    // 加载群组成员
    loadGroupUserList: function (groupId, callback) {
      var _this = this;
      var options = _this.options;

      var activeTabIndex = options._id;
      var tabItem = options.defaultTabs[activeTabIndex];

      var keywords = options.keywords;
      if (!$.trim($('.subGroup' + groupId).html())) {
        keywords = '';
      }
      if (tabItem.type == options.tabTypes.group) {
        tabItem.actions
          .getGroupUsers({
            groupId: groupId,
            keywords: keywords,
            filterAccountIds: options.filterAccountIds,
            projectId: options.inProject ? options.projectId : undefined,
          })
          .then(function (data) {
            callback(data);
          });
      }
    },

    // 加载用户列表
    loadUserList: function (data) {
      var _this = this;
      var options = _this.options;

      var html = '';
      if (data) {
        html = _this.getUsersHtml(data);
      }

      _this.showHtml(html, options.pageIndex != 1);
    },

    // 过滤重复加载的用户
    uniqueLoadedUser: function (dataArr) {
      var _this = this;
      var options = _this.options;

      options.loadedUserArr = options.loadedUserArr.concat(dataArr);
      options.loadedUserArr = _.uniqBy(options.loadedUserArr, function (item) {
        return item.accountId;
      });
    },

    // 用户列表Html
    getUsersHtml: function (dataArr) {
      var _this = this;
      var options = _this.options;

      if (!Array.isArray(dataArr)) {
        if (dataArr && dataArr.list) {
          dataArr = dataArr.list;
        } else {
          dataArr = [];
        }
      }

      _this.uniqueLoadedUser(dataArr);

      for (var i = 0; i < dataArr.length; i++) {
        var item = dataArr[i];
        var fullName = htmlEncodeReg(item.fullname || '');

        var department = '';
        if (item.department) {
          department = htmlEncodeReg(item.department);
        } else if (item.companyName) {
          department = htmlEncodeReg(item.companyName);
        }

        if (options.keywords && options.keywords != options.txtSearchTip) {
          var reg = new RegExp('(' + options.keywords + ')', 'gi');
          fullName = fullName.replace(reg, "<font class='keywordsYellow'>$1</font>");
          department = department.replace(reg, "<font class='keywordsYellow'>$1</font>");
        }

        // 是否已经选过
        var checked = '';
        if (options.accountIdArr.length && options.accountIdArr.indexOf(item.accountId) > -1) {
          checked = 'checked';
        }

        var html = `
        <div class='searchItem' accountId='${item.accountId}'>
        <div class='cbContainer'><input type='checkbox' class='cb' ${checked} accountId='${item.accountId}' /></div>
        <div class='avatar'><img data-accountid='${item.accountId}' src='${item.avatar}'/></div>
        ${
          options.isTask && item.accountId === md.global.Account.accountId
            ? `<div class='fullname'>${_l('我自己')}</div>`
            : `<div class='fullname'>${fullName}</div><div class='department'>${department}</div>`
        }
        <div class='Clear'></div>
        </div>
        `;
      }
      return html.toString();
    },

    // 部门列表Html
    getDepartmentHtml: function (dataArr) {
      var _this = this;
      var options = _this.options;

      var html = '';
      if (dataArr.length > 0) {
        for (var i = 0; i < dataArr.length; i++) {
          var item = dataArr[i];
          var departmentName = htmlEncodeReg(item.departmentName);
          if (options.keywords && options.keywords != options.txtSearchTip) {
            var reg = new RegExp('(' + options.keywords + ')', 'gi');
            departmentName = departmentName.replace(reg, "<font class='keywordsYellow'>$1</font>");
          }
          var arrowClass = 'arrowRight';
          if (item.users && item.users.length > 0) {
            arrowClass = 'arrowDown';
          }
          html =
            html +
            `
          <div class='item'><div class='itemLeft lblDepartment Hand' departmentId='${item.departmentId}'>
          <i class='arrow ${arrowClass}'></i>${departmentName}(${item.userCount})</div>
          ${
            !options.unique
              ? `<div class='itemRight addAllDepartment ThemeColor3' departmentId='${item.departmentId}'>
            ${_l('全选')}</div>
            `
              : ''
          }
          <div class='Clear'></div>
          </div>
          <div class='subList subDepart ${item.departmentId}'>
          ${item.users && item.users.length > 0 ? _this.getUsersHtml(item.users) : ''}
          </div>
          `;
        }
      }
      return html;
    },

    // 群组列表Html
    getGroupHtml: function (dataArr) {
      var _this = this;
      var options = _this.options;

      var html = '';
      if (dataArr.length > 0) {
        for (var i = 0; i < dataArr.length; i++) {
          var item = dataArr[i];
          var groupName = htmlEncodeReg(item.name);
          if (options.keywords && options.keywords != options.txtSearchTip) {
            var reg = new RegExp('(' + options.keywords + ')', 'gi');
            groupName = groupName.replace(reg, "<font class='keywordsYellow'>$1</font>");
          }
          var arrowClass = 'arrowRight';
          if (item.groupUsers && item.groupUsers.length > 0) {
            arrowClass = 'arrowDown';
          }
          html =
            html +
            `
          <div class='item'><div class='itemLeft lblGroup' style='cursor:pointer' groupId='${item.groupId}'>
          <i class='arrow ${arrowClass}'></i>${groupName}(${item.groupMemberCount})</div>
          ${
            !options.unique
              ? `<div class='itemRight addAllGroup ThemeColor3' groupId='${item.groupId}'>${_l('全选')}</div>`
              : ''
          }
          <div class='Clear'></div>
          </div>
          <div class='subList subGroup ${item.groupId}'>
          ${item.groupUsers && item.groupUsers.length > 0 ? _this.getUsersHtml(item.groupUsers) : ''}
          </div>
          `;
        }
      }
      return html;
    },

    // 已选择用户html
    getSelectUserHtml: function (item) {
      var sb = `
      <div class='subItem' accountId='${item.accountId}'>
      <div class='avatar'>
      <img data-accountid='${item.accountId}' src='${item.avatar}' title='${htmlEncodeReg(item.fullname)}'/>
      </div>
      <div class='remove icon-minus' accountId='${item.accountId}' title='${_l('删除')}'></div>
      </div>
      `;
      return sb;
    },
  });
})(jQuery);
