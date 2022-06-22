/**
 * @module  quickSelectUser
 * @author puck
 * @desc 快速成员选择层
 * @example
 * require.async('quickSelectUser',function(){ $('').quickSelectUser(); });
 */
import './css/style.css';
import RegExp from 'src/util/expression';
import { get } from 'lodash';
var userController = require('src/api/user');
var externalPortalCotroller = require('src/api/externalPortal');
var addressBookController = require('src/api/addressBook');
var SelectUser = function (element, options) {
  this.$element = $(element);
  this.$box = null;
  this.init(options);
};

var KEYMAPS = {
  ESC: 27,
  ENTER: 13,
  UP: 38,
  DOWN: 40,
};

SelectUser.DEFAULTS = {
  // dict
  FROMTYPE: (function () {
    var temp = {};
    temp[(temp.Friend = 0)] = 'Friend';
    temp[(temp.Group = 1)] = 'Group';
    temp[(temp.Task = 2)] = 'Task';
    temp[(temp.KC = 3)] = 'KC';
    temp[(temp.Project = 4)] = 'Project';
    temp[(temp.Calendar = 5)] = 'Calendar';
    temp[(temp.TFolder = 6)] = 'TFolder';
    return temp;
  })(),
  LINKFROMTYPE: (function () {
    var temp = {};
    temp[(temp.Weixin = 1)] = 'Weixin';
    temp[(temp.QQ = 2)] = 'QQ';
    temp[(temp.Link = 3)] = 'Link';
    temp[(temp.QRCode = 4)] = 'QRCode';
    return temp;
  })(),

  // public
  includeUndefinedAndMySelf: false,
  includeSystemField: false, // 是否显示系统字段
  isRangeData: false, // 是范围数据
  filterWorksheetId: '',
  filterWorksheetControlId: '',
  prefixAccountIds: [], // 指定置顶的用户
  prefixAccounts: [], // 指定置顶的用户
  showQuickInvite: true, // 快速邀请
  count: 15, // 默认`经常协作同事`数量
  selectCb: function (user) {
    // user { accountid: '', avatar: '', fullname: '', job: ''}
    // console.log(user);
  }, // 点击`callback`
  sourceId: '',
  projectId: '', // 空为`个人网络`,
  fromType: 'Task', // 2 reference to `options.FROMTYPE`
  minHeight: 323,
  maxHeight: 'auto', // 列表最大高
  zIndex: 1001,
  container: $('body'),
  filterAccountIds: [],
  routineTab: _l('常规'),
  externalTab: _l('外部门户'),
  tabType: 1, // 1: 常规 2: 外部门户 3: 常规和外部门户
  tabIndex: 0, //0: 常规 1:外部用户
  appId: '',

  // private
  selectItem: null,
  keywords: '',
  pageIndex: 1,
  pageSize: 25,
  externalUserList: [], // 外部用户成员列表
  loadNextPage: false,

  // dialogSelectUer settings
  showMoreInvite: true, // 是否呈现更多邀请
  SelectUserSettings: {
    selectUserObj: null,
    showTabs: ['conactUser', 'department', 'group', 'subordinateUser'],
    extraTabs: [],
    dataRange: 0, // 0 全部  1 好友 2 网络
    projectId: '', // 默认取哪个分类的用户 为空则表示默认加载全部
    filterProjectId: '', // 过滤哪个网络的用户
    filterAll: false, // 过滤全部
    filterFriend: false, // 是否过滤好友
    filterAccountIds: [], // 过滤指定的用户
    filterOtherProject: false, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
    allowSelectNull: false, // 是否允许选择列表为空
    unique: false, // 是否只可以选一个
    callback: function (data) {},
  },
  ChooseInviteSettings: {
    viewHistory: true, // 是否呈现邀请记录
    callback: function (data, callbackInviteResult) {},
  },
  offset: {
    left: 0,
    top: 10,
  }, // 位置 偏移
  placeHolder: _l('输入姓名、手机或邮箱'),
  prefix: _l('邀请') + '：',
  tip: {
    contact: _l('从通讯录添加'),
    cooperate: _l('最常协作'),
    invite: _l('邀请联系人'),
    sendBtn: _l('确认邀请'),
    qrCodeTitle: _l('微信、QQ扫描二维码'),
    qrCodeTip: _l('快速添加联系人'),
    dialogLabel: _l('手机/邮箱'),
    dialogNameLabel: _l('姓名(选填)'),
    dialogWarnTip: _l('请输入正确的手机或邮箱'),
  },
  loadingContent: LoadDiv(),
};

SelectUser.doT = require('dot');
SelectUser.userTpl = require('./tpl/listItem.html');
SelectUser.QrCodeTpl =
  '<div class="bubbleQrCode" style="display:none;"> <img src="{{= it.qrUrl }}" class="qrCode"> <p class="title">' +
  SelectUser.DEFAULTS.tip.qrCodeTitle +
  '</p> <p class="title">' +
  SelectUser.DEFAULTS.tip.qrCodeTip +
  '</p> <div class="triAngle"></div> </div>';
SelectUser.dialogTpl =
  '<div class="inviteForm">' +
  '<div class="phoneMail"><p>' +
  SelectUser.DEFAULTS.tip.dialogLabel +
  '</p><span class=""></span><p><input type="text" class="input-control  ThemeBorderColor3"/><span class="errortip">' +
  SelectUser.DEFAULTS.tip.dialogWarnTip +
  '</span></p></div>' +
  '<div class="name"><p class="mLeft15">' +
  SelectUser.DEFAULTS.tip.dialogNameLabel +
  '</p><p><input type="text" class="input-control Right ThemeBorderColor3"/></p></div>' +
  '</div>';
SelectUser.invite = require('src/api/invitation');

SelectUser.Utils = {
  buildUserList: function (userArray) {
    return SelectUser.doT.template(SelectUser.userTpl)(userArray);
  },
  toggleLoading: function (container, flag, cb) {
    // 添加或移除 loading
    if (flag) {
      container.html('.selectLoading');
      cb();
    } else {
      if (container.find('.selectLoading').length) {
        container.find('.selectLoading').fadeOut(50, function () {
          cb();
        });
      } else {
        cb();
      }
    }
  },
  bindListContent: function (container, listArray) {
    SelectUser.Utils.toggleLoading(container, false, function () {
      container.html(SelectUser.Utils.buildUserList(listArray));
    });
  },
  isEmailOrPhone: function (keywords) {
    var isEmail = !!RegExp.isEmail(keywords);
    var isPhone = !!RegExp.isMobile(keywords);
    return {
      isEmail: isEmail,
      isPhone: isPhone,
      result: isEmail || isPhone,
    };
  },
};

$.extend(SelectUser.prototype, {
  /**
   * SelectCallback
   * @callback callback
   * @param {object[]} data inviteMembers array
   */

  init: function (options) {
    /**
     * @function init
     * @public
     * @param {object} param - options
     * @param {string} param.projectId
     * @param {string} param.sourceId 来自哪个好友，群组，任务，知识，网络，日程，项目
     * @param {int} param.fromType 0：好友  1：群组  2：任务  3：知识  4：网络 5：日程 6：项目
     * @param {boolean} param.showQuickInvite 是否显示邀请
     * @param {int} param.count 最长协作人数
     * @param {string[]} param.filterAccountIds 过滤的accountIds
     * @param {callback} param.selectCb 回调
     * @param {object} param.SelectUserSettings - {@link module.selectUser}
     * @param {object} param.ChooseInviteSettings - {@link module.chooseInvite}
     */
    this.options = $.extend(true, {}, SelectUser.DEFAULTS, options);
    this._id = +new Date();
    this.render();
  },
  render: function () {
    var _this = this;
    var options = this.options;
    options.hasQRcode = options.sourceId && options.fromType && options.projectId !== undefined;
    options.tabIndex = options.tabType === 1 || options.tabType === 3 ? 0 : 1;
    require(['./tpl/box.html'], function (tpl) {
      _this.$box = $(SelectUser.doT.template(tpl)(options));
      let tabItems = _this.$box.find('.tabBox .tabItem');
      if (tabItems.length > 1) {
        tabItems[0].setAttribute('class', 'tabItem flex active');
      }
      _this.append();
      _this.getCooperaters();
      _this.initEvent();
    });
  },
  getQRCode: function () {
    // 获取邀请的二维码
    var options = this.options;
    return SelectUser.invite.getQRCodeInviteLink.call(null, {
      sourceId: options.sourceId,
      fromType: typeof options.fromType === 'number' ? options.fromType : options.FROMTYPE[options.fromType],
      linkFromType: options.LINKFROMTYPE.QRCode,
      width: 150,
      height: 150,
    });
  },
  append: function () {
    var _this = this;
    var options = this.options;
    // store two list in $box
    _this.$coOperationList = _this.$box.find('.cooperationList');
    _this.$searchResultList = _this.$box.find('.searchResultList');
    _this.$listWrapper = this.$box.find('.listWrapper');
    // store input
    _this.$input = _this.$box.find('.searchInput');
    _this.$invite = _this.$box.find('.inviteBox');

    _this.$tabItem = _this.$box.find('.tabBox .tabItem');
    options.container.append(_this.$box);
    _this.setPosition();
  },
  setPosition: function () {
    var _this = this;
    var options = this.options;
    var elem = this.$element[0];
    var offset = options.rect || elem.getBoundingClientRect();
    var BOXWIDTH = _this.$box.outerWidth();
    var winWidth = $(window).outerWidth();
    var winHeight = $(window).outerHeight();
    var topBounding = offset.bottom + parseInt(options.offset.top, 10);
    var leftBounding = offset.left + offset.width / 2 - BOXWIDTH / 2 + parseInt(options.offset.left, 10);
    var rightBounding = offset.left + offset.width / 2 + BOXWIDTH / 2 + parseInt(options.offset.left, 10);
    var gap = _this.$box.find('.contactSearchBox').outerHeight() + _this.$box.find('.inviteBox').outerHeight();
    var left = leftBounding;
    var top = topBounding;

    // caculate height
    var maxHeight = winHeight - topBounding - gap - 10;
    var isCover = false;
    if (maxHeight < options.minHeight) {
      var _gap = options.minHeight - maxHeight;
      maxHeight = options.minHeight;
      top -= _gap + 12;
      isCover = true;
    } else {
      maxHeight = options.minHeight;
    }
    if (isCover) {
      // cover and place it at left
      if (offset.right + BOXWIDTH + 70 > winWidth && offset.left > BOXWIDTH + 10) {
        left = offset.left - BOXWIDTH - 10;
      } else if (offset.right + BOXWIDTH + 70 < winWidth) {
        left = offset.right + 10;
      }
    } else {
      // bounding offset
      if (rightBounding + 70 > winWidth) {
        // 70 防止二维码跑到外边
        left -= rightBounding + 70 - winWidth + 10;
      } else if (leftBounding < 0) {
        left = 10;
      }
    }
    _this.$box.css({
      left: left,
      top: top,
    });
    _this.$box.find('.listWrapper').css({
      maxHeight: maxHeight,
    });
  },
  getCooperaters: function () {
    var _this = this;
    var options = this.options;
    if (options.tabIndex === 0) {
      _this.$box.find('.contact-icon').removeClass('hiddenContactIcon');
    } else {
      _this.$input && _this.$input[0].setAttribute('placeholder', _l('搜索姓名、手机'));
      _this.$box.find('.contact-icon').addClass('hiddenContactIcon');
    }
    if (options.isRangeData) {
      _this.toggleListContainer(!!options.keywords);

      userController
        .getProjectContactUserListByApp({
          pageIndex: 1,
          pageSize: 100,
          projectId: options.SelectUserSettings.projectId,
          keywords: options.keywords,
          filterAccountIds: options.filterAccountIds,
          filterWorksheetId: options.filterWorksheetId,
          filterWorksheetControlId: options.filterWorksheetControlId,
        })
        .then(function (data) {
          let renderData = {};
          const currentAccount = data.users.list.find(item => item.accountId === md.global.Account.accountId);

          if (currentAccount) {
            renderData.prefixUsers = [Object.assign({}, currentAccount, { fullname: _l('我自己') })];
            _.remove(data.users.list, item => item.accountId === md.global.Account.accountId);
          }

          renderData.users = data.users.list || [];

          SelectUser.Utils.bindListContent(
            !options.keywords ? _this.$coOperationList : _this.$searchResultList,
            renderData,
          );
        });
    } else {
      if (_this.options.tabIndex === 0) {
        userController
          .getOftenMetionedUser({
            count: options.count,
            filterAccountIds: options.filterAccountIds,
            includeUndefinedAndMySelf: options.includeUndefinedAndMySelf,
            includeSystemField: options.includeSystemField,
            prefixAccountIds: options.prefixAccountIds,
            projectId: options.SelectUserSettings.projectId,
          })
          .then(function (data) {
            var renderData = {};
            renderData.users = data || [];
            renderData.includeUndefinedAndMySelf = options.includeUndefinedAndMySelf;
            var filterMe = options.filterAccountIds.indexOf(md.global.Account.accountId) !== -1;
            var filterUndefined = options.filterAccountIds.indexOf('user-undefined') !== -1;
            var hasPrefix =
              (options.includeUndefinedAndMySelf && !(filterMe && filterUndefined)) || options.prefixAccountIds.length;
            var prefixAccountLength = options.prefixAccountIds.length;

            if (options.includeSystemField) {
              renderData.prefixUsers = renderData.users.splice(0, 6);
            } else {
              if (hasPrefix) {
                if (options.includeUndefinedAndMySelf) {
                  if (filterMe && filterUndefined) {
                    renderData.prefixUsers = renderData.users.splice(0, prefixAccountLength);
                  } else if (filterMe || filterUndefined) {
                    renderData.prefixUsers = renderData.users.splice(0, 1 + prefixAccountLength);
                  } else {
                    renderData.prefixUsers = renderData.users.splice(0, 2 + prefixAccountLength);
                  }
                } else {
                  renderData.prefixUsers = renderData.users.splice(0, prefixAccountLength);
                }
              }
            }

            if (options.prefixAccounts && options.prefixAccounts.length) {
              renderData.prefixUsers = options.prefixAccounts.concat(renderData.prefixUsers || []);
            }
            renderData.isCooperation = true;
            renderData.tip = options.tip;
            renderData.tabIndex = options.tabIndex;
            renderData.projectId = options.SelectUserSettings.projectId;
            // fill the list
            SelectUser.Utils.bindListContent(_this.$coOperationList, renderData);
          });
      } else {
        _this.getExternalList();
      }
    }
  },
  initEvent: function () {
    var _this = this;
    var options = this.options;
    var timer = null;
    // bind userItem click
    _this.$coOperationList.add(_this.$searchResultList).on('click', '.userItem', function (e) {
      _this.selectItem($(this));
      e.stopPropagation();
    });

    _this.$coOperationList.add(_this.$searchResultList).on('mouseenter mouseleave', '.userItem', function (e) {
      $(this)
        .siblings()
        .removeClass('hover')
        .end()
        .toggleClass('hover', e.type === 'mouseenter');
    });

    _this.$input.focus().on('keyup input', function (event) {
      var $this = $(this);
      var canInvite = !options.isSearching && !options.hasData && options.showQuickInvite;
      if (event.keyCode === KEYMAPS.ENTER) {
        if (options.selectItem) {
          _this.selectItem(options.selectItem);
        } else if (canInvite) {
          _this.buildInviteDialog();
        }
      } else if (event.keyCode === KEYMAPS.UP || event.keyCode === KEYMAPS.DOWN) {
        _this.handleArrowEvent(event);
      } else if ($.trim($this.val()) !== options.keywords) {
        options.selectItem = null;
        options.keywords = $.trim($this.val());
        _this.syncInviteName();
        // put a delay on search
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          if (options.isRangeData) {
            _this.getCooperaters();
          } else {
            _this.searchRequest();
          }
        }, 200);
      }
    });

    _this.$invite.on('click', $.proxy(_this.buildInviteDialog, _this));

    _this.$box.find('.contact-icon').on('click', function (e) {
      e.stopPropagation();
      require(['dialogSelectUser'], function () {
        options.SelectUserSettings.includeUndefinedAndMySelf = options.includeUndefinedAndMySelf;
        options.SelectUserSettings.includeSystemField = options.includeSystemField;
        options.SelectUserSettings.prefixAccountIds = options.prefixAccountIds;
        $('body').dialogSelectUser({
          sourceId: options.sourceId,
          fromType: typeof options.fromType === 'number' ? options.fromType : options.FROMTYPE[options.fromType],
          showMoreInvite: options.showMoreInvite,
          SelectUserSettings: options.SelectUserSettings,
          ChooseInviteSettings: options.ChooseInviteSettings,
        });
      });
      // close pane
      _this.closePane();
    });

    _this.$box.on('click', '.listTipMore', function (e) {
      e.stopPropagation();

      $(this).siblings('.userItem').removeClass('Hidden');
      $(this).remove();
    });

    _this.$box.on('click', function (e) {
      e.stopPropagation();
    });

    $(document).on('click.quickSelectUser' + this._id, function (event) {
      var $target = $(event.target);
      if (
        $target.closest(_this.$box).length <= 0 &&
        !$target.is(_this.$element) &&
        $target.closest(_this.$element).length <= 0
      ) {
        _this.closePane();
      }
    });

    $(document).on('keyup.quickSelectUser', function (event) {
      if (event.keyCode === 27) {
        _this.closePane();
      }
    });

    $.subscribe('REMOVE_QUICKSELECTUSER', function () {
      _this.closePane();
    });

    _this.$invite.find('.qrcode').one('mouseenter', function () {
      if (options.hasQRcode) {
        _this.getQRCode().done(function (result) {
          options.qrUrl = result.linkUrl;
          var $tpl = $(SelectUser.doT.template(SelectUser.QrCodeTpl)(options)).appendTo(_this.$invite.find('.qrcode'));
          $tpl
            .find('img')
            .one('load', function () {
              // remove `display: none`
              $tpl.removeAttr('style');
            })
            .each(function () {
              if (this.complete) {
                this.load();
              }
            });
        });
      }
    });

    $(_this.$tabItem).on('click', function () {
      let tabItems = _this.$box.find('.tabBox .tabItem');
      if (tabItems.length < 2) {
        return;
      }
      $(this).addClass('active').siblings().removeClass('active');
      _this.options.tabIndex = this.tabIndex;
      _this.options.keywords = '';
      _this.$input.val('');
      _this.toggleListContainer(!!_this.options.keywords);
      _this.getCooperaters();
    });

    $(_this.$listWrapper).on('scroll', function (e) {
      if (this.clientHeight + this.scrollTop >= this.scrollHeight && _this.options.loadNextPage) {
        options.pageIndex = options.pageIndex + 1;
        _this.getExternalList();
      }
    });
  },
  handleArrowEvent: function (e) {
    var options = this.options;
    var hasKeyWords = !!$.trim(options.keywords);
    var $list = hasKeyWords ? this.$searchResultList : this.$coOperationList;
    var $items = $list.find('.userItem');
    var $active;
    var curIndex;
    if (!$items.length) return;
    $active = $items.filter('.hover').removeClass('hover');
    curIndex = $active.index();
    if (e.keyCode === KEYMAPS.UP) {
      curIndex--;
      if (curIndex === -1) {
        curIndex = $items.length - 1;
      }
    } else {
      curIndex++;
      if (curIndex === $items.length) {
        curIndex = 0;
      }
    }
    options.selectItem = $items.eq(curIndex);
    $items.eq(curIndex).addClass('hover');
    $active.removeClass('hover');
    $active = options.selectItem;

    this.triggerScroll($active);
  },
  selectItem: function ($item) {
    var userObj = {};
    var options = this.options;
    userObj = {
      accountId: $item.data('accountid'),
      avatar: $item.find('.userHead').attr('src'),
      fullname: $.trim($item.find('.userName').text()),
      job: $.trim($item.find('.userDepartment').text()) || [],
    };

    if ($.isFunction(options.selectCb)) {
      options.selectCb([userObj]);
    }

    this.closePane();
  },

  // trigger scroll if necessary when item is out of list
  triggerScroll: function ($active) {
    var $listWrapper = this.$box.find('.listWrapper');
    var itemHeight = $active.height();
    var listHeight = $listWrapper.height();
    var scrollTop = $listWrapper.scrollTop();
    var top = !!$active.length ? $active.position().top : 0;
    if (top < 0) {
      scrollTop += top;
      $listWrapper.scrollTop(scrollTop);
    } else if (top + itemHeight > listHeight) {
      scrollTop += top + itemHeight - listHeight;
      $listWrapper.scrollTop(scrollTop);
    }
  },
  getExternalList: function (params) {
    let _this = this;
    let options = _this.options;
    externalPortalCotroller
      .getUsersByApp({
        projectId: options.SelectUserSettings.projectId,
        appId: options.appId || '',
        pageIndex: options.pageIndex,
        pageSize: options.pageSize,
        keywords: options.keywords ? options.keywords : undefined,
        filterAccountIds: options.filterAccountIds,
      })
      .then(function (data) {
        let tempData = data.map(item => ({
          ...item,
          fullname: item.name,
          job: item.mobilePhone,
        }));
        options.loadNextPage = tempData.length === options.pageSize ? true : false;
        options.externalUserList = options.pageIndex > 1 ? options.externalUserList.concat(tempData) : tempData;
        var renderData = {};
        const currentAccount = tempData.find(item => item.accountId === md.global.Account.accountId);
        if (options.includeSystemField || options.includeUndefinedAndMySelf) {
          renderData.prefixUsers = [
            {
              accountId: 'user-self',
              avatar: 'https://p1.mingdaoyun.cn/UserAvatar/user-self.png?imageView2/1/w/100/h/100/q/90',
              department: '',
              departmentInfos: [],
              departments: [],
              fullname: '当前用户',
              jobIds: [],
              jobInfos: [],
              jobs: [],
            },
          ];
          _.remove(tempData, item => item.accountId === md.global.Account.accountId);
        } else if (currentAccount) {
          renderData.prefixUsers = [Object.assign({}, currentAccount, { fullname: _l('我自己') })];
          _.remove(tempData, item => item.accountId === md.global.Account.accountId);
        } else {
          renderData.prefixUsers = [];
        }
        renderData.users = options.externalUserList || [];
        renderData.includeUndefinedAndMySelf = options.includeUndefinedAndMySelf;
        options.hasData = renderData.users.length > 0;
        renderData.isCooperation = true;
        renderData.tabIndex = options.tabIndex;
        options.isSearching = false;
        if (params && params.keywords) {
          SelectUser.Utils.bindListContent(_this.$searchResultList, renderData);
        } else {
          SelectUser.Utils.bindListContent(_this.$coOperationList, renderData);
        }
      });
  },
  searchRequest: function () {
    var _this = this;
    var options = this.options;
    if (options.keywords) {
      _this.toggleListContainer(true);
      if (options.promise) {
        options.promise.abort();
      }
      if (options.tabIndex === 0) {
        options.promise = addressBookController.getUserAddressbookByKeywords({
          keywords: options.keywords,
          filterAccountIds: options.filterAccountIds,
          currentProjectId: options.SelectUserSettings.projectId,
        });
        options.promise.then(function (data) {
          if (data.list) {
            var renderData = {};
            renderData.users = data.list;
            options.isSearching = false;
            options.hasData = renderData.users.length > 0;
            renderData.isCooperation = false;
            renderData.includeUndefinedAndMySelf = options.includeUndefinedAndMySelf;
            renderData.projectId = options.SelectUserSettings.projectId;
            SelectUser.Utils.bindListContent(_this.$searchResultList, renderData);
          } else {
            _this.$searchResultList.empty();
          }
        });
      } else {
        _this.options.pageIndex = 1;
        _this.getExternalList({ keywords: options.keywords });
      }
    } else {
      _this.toggleListContainer(false);
    }
  },

  syncInviteName: function () {
    var options = this.options;
    var text = options.keywords === '' ? options.tip.invite : options.prefix + ' ' + options.keywords;
    this.$invite.find('.inviteName').text(text);
  },

  toggleListContainer: function (isSearch) {
    this.$coOperationList.toggleClass('Hidden', isSearch);
    this.$searchResultList.toggleClass('Hidden', !isSearch);
  },

  buildInviteDialog: function (e) {
    var _this = this;
    var options = this.options;
    var keywords = options.keywords;
    var validateResult = SelectUser.Utils.isEmailOrPhone(keywords);
    var type = '';
    if (validateResult.isEmail) {
      type = 'email';
    } else if (validateResult.isPhone) {
      type = 'phone';
    } else if (keywords !== '') {
      type = 'name';
    }
    if (_this.$dialog) return;
    _this.closePane();
    require(['mdDialog'], function () {
      var id = 'inviteDialog_' + +new Date();
      _this.$dialog = $.DialogLayer({
        dialogBoxID: id,
        showClose: false,
        zIndex: parseInt(options.zIndex, 10) + 1,
        container: {
          yesText: options.tip.sendBtn,
          yesFn: function () {
            var $dialogLayer = _this.$dialogLayer;
            var accounts = {};
            var accountKey = $dialogLayer.$mailInput.val();
            var result = SelectUser.Utils.isEmailOrPhone(accountKey);
            if (result.isPhone && result.result) {
              accountKey = '+86' + $dialogLayer.$mailInput.val();
            }
            accounts[accountKey] = $dialogLayer.$nameInput.val();
            // send invite
            SelectUser.invite.getInviteAccountInfo
              .call(null, {
                accounts: accounts,
              })
              .done(function (data) {
                if (data && $.isFunction(options.ChooseInviteSettings.callback)) {
                  options.ChooseInviteSettings.callback(data);
                }
              });
          },
        },
        status: 'disable',
        readyFn: function () {
          _this.$dialogLayer = $('#' + id);
          var $dialogLayer = _this.$dialogLayer;
          var $mailInput = $dialogLayer.find('.phoneMail input');
          var $nameInput = $dialogLayer.find('.name input');
          $dialogLayer.$mailInput = $dialogLayer.find('.phoneMail input');
          $dialogLayer.$nameInput = $dialogLayer.find('.name input');
          if (type === 'name') {
            $nameInput.val(keywords).prop('disabled', true);
          } else if (type !== '') {
            $mailInput.val(keywords).prop('disabled', true);
            _this.$dialog.enable();
          }

          $mailInput
            .on('blur focus', function () {
              var $this = $(this);
              var relatedTarget = e ? e.relatedTarget : null;
              if ($this.val() && !$(relatedTarget).hasClass('noText')) {
                var validResult = SelectUser.Utils.isEmailOrPhone($this.val());
                var isValid = validResult.result;
                $this.toggleClass('error-input', !isValid);
                if (isValid) {
                  _this.$dialog.enable();
                } else {
                  _this.$dialog.disable();
                }
                return false;
              }
            })
            .on('focus', function () {
              $mailInput.removeClass('error-input');
            });

          $mailInput.add($nameInput).not('[disabled]').first().trigger('focus');
        },
        callback: function () {
          // close dialog callback
          _this.$dialog = null;
        },
      });

      _this.$dialog.content(SelectUser.dialogTpl);
    });
    if (e) {
      e.stopPropagation();
    }
  },

  closePane: function () {
    var _this = this;
    if (typeof this.options.onClose === 'function') {
      this.options.onClose();
    }
    if (_this.$box) {
      _this.$box.remove();
    }
    _this.$element.removeData('md.quickSelectUser');
    $(document).off('click.quickSelectUser' + this._id);
  },
});

(function ($) {
  $.fn.quickSelectUser = function (otps) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('md.quickSelectUser');
      var options = typeof otps === 'object' && otps;
      if (!data) {
        $(this).data('md.quickSelectUser', (data = new SelectUser(this, options)));
      }
    });
  };
})(jQuery);
