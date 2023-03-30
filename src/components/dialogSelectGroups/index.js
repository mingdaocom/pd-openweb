import './style.css';
import '@mdfe/nanoscroller';
import doT from '@mdfe/dot';
import headerTpl from './tpl/header.html';
import listTpl from './tpl/groupList.html';
import { index as DialogLayer } from 'src/components/mdDialog/dialog';
import GroupAjaxController from 'src/api/group';
import _ from 'lodash';

var mainRenderFunc = doT.template(headerTpl);
var listRenderFunc = doT.template(listTpl);

/**
 * Event Monitor
 * @constructor
 */
function Event() {
  this.o = $({});
  this.event = {};
}

Event.prototype = {
  attach: function () {
    this.o.on.apply(this.o, arguments);
  },
  notify: function () {
    this.o.trigger.apply(this.o, arguments);
  },
  cancel: function () {
    this.o.off.apply(this.o, arguments);
  },
};

var event = new Event();

/**
 * selectCallback callback
 * @callback selectCallback
 * @param {object[]} groups - groups data array
 */

/**
 * @function init
 * @public
 * @param {object} opts - options
 * @param {string} opts.projectId 网络id
 * @param {boolean} opts.allowNull=true 允许不选择
 * @param {string[]} opts.defaultGroups 选中群组的群组id数组
 * @param {selectCallback} opts.selectCallback 回调
 * @returns {GroupDialog}
 */
var GroupDialog = function (opts) {
  var defaults = {
    projectId: '',
    pageSize: 20,

    allowNull: true, // 允许不选择
    nullCallback: $.noop(), // 选择空 回调

    defaultGroups: [], // [groupObject [,groupObject]]
    selectCallback: function (groupArr) {
      // groupArr: [groupObject [,groupObject]]
      console.log(groupArr);
    },
  };

  this.options = $.extend({}, defaults, opts);

  this.init();
};

// call `mdDialog` and init html
GroupDialog.prototype.init = function () {
  console.log('group dialog start init.');
  var _this = this;
  var $dialog;
  $dialog = DialogLayer({
    dialogBoxID: 'dialogSelectGroups',
    container: {
      header: _l('群组选择'),
      content: mainRenderFunc(),
      yesText: _l('确认') + '<span class="memberCount"></span>',
      yesFn: function () {
        var groupArr = _this.model.getSelectedGroups();

        if (!groupArr.length && !_this.options.allowNull) {
          if ($.isFunction(_this.options.nullCallback)) {
            _this.options.nullCallback.call(null);
          } else {
            alert(_l('请选择群组'), 3);
          }
          return false;
        } else {
          _this.options.selectCallback(groupArr);
        }
      },
    },
    width: 500,
    status: false,
    callback: function () {
      // unbind all Event
      event.cancel();
    },
    readyFn: function () {
      console.log('Base view init complete.');
      var $content = $('#dialogSelectGroups');
      var elements = {
        $input: $content.find('.searchInput'),
        $searchBtn: $content.find('.searchIcon'),
        $list: $content.find('.groupListBox'),
        $selectList: $content.find('.selectGroupBox'),
        $memberCount: $content.find('.memberCount'),
      };
      _this.model = new Model(_this.options);
      _this.view = new View(_this.model, elements);
      _this.controller = new Controller(_this.model, _this.view);

      _this.view.initialize();
    },
  });
};

var Model = function (opts) {
  this._groups = [];
  this._groupsDict = {};
  this._selectedGroups = [];
  this.projectId = opts.projectId;
  this.keywords = '';
  this.isSearch = false;
  this.allCount = undefined;
  this.pageIndex = 1;
  this.pageSize = opts.pageSize;

  this.Event = event;

  this.initModel(opts);
};

Model.prototype = {
  initModel: function (opts) {
    var _this = this;
    this.renderGroupDict(opts.defaultGroups);
    $.each(opts.defaultGroups, function (i, group) {
      _this._selectedGroups.unshift(group.groupId);
    });
  },
  updateGroups: function (groupArray) {
    if (this.pageIndex == 1) {
      this._groups = groupArray;
    } else {
      this._groups = this._groups.concat(groupArray);
    }
    this.renderGroupDict(groupArray);
    this.Event.notify('groupsUpdate');
  },
  // groupObj dict
  renderGroupDict: function (groupArray) {
    var _this = this;
    $.each(groupArray, function (index, group) {
      _this._groupsDict[group.groupId] = group;
    });
  },
  getSelectedGroups: function () {
    var _this = this;
    var groupArr = $.map(this._selectedGroups, function (id) {
      return _this._groupsDict[id];
    });
    return groupArr;
  },
  addSelectedGroups: function (data) {
    var groupId = data.groupId;
    if (this._selectedGroups.indexOf(groupId) == -1) {
      this._selectedGroups.push(groupId);
      this.Event.notify('selectedGroupsAdd');
    }
  },
  removeSelectedGroups: function (data) {
    var groupId = data.groupId;
    _.remove(this._selectedGroups, _id => {
      return _id == groupId;
    });
    this.Event.notify('selectedGroupsRemove', data);
  },
};

var View = function (model, elements) {
  this._model = model;
  this._elements = elements;
  this.timer = null;

  this.Event = event;

  var _this = this;

  // bind event
  this.Event.attach('groupsUpdate', $.proxy(this.buildList, this));

  this.Event.attach('selectedGroupsAdd', $.proxy(this.buildSelectList, this));
  this.Event.attach('selectedGroupsRemove', $.proxy(this.buildSelectList, this));

  this._elements.$list.on('scrollend', function () {
    _this.Event.notify('listUpdate');
  });

  this._elements.$list.on('change', ':checkbox', function () {
    var $this = $(this);
    var isChecked = $this.is(':checked');
    var groupId = $this.data('groupid');
    var args = {
      groupId: groupId,
    };
    if (isChecked) {
      _this.Event.notify('selectGroupAdd', args);
    } else {
      _this.Event.notify('selectGroupRemove', args);
    }
  });

  this._elements.$selectList.on('click', '.singleSelectGroup', function () {
    var $this = $(this);
    var groupId = $this.data('groupid');
    var args = {
      groupId: groupId,
    };
    _this.Event.notify('selectGroupRemove', args);
  });

  this._elements.$input.on('keyup', $.proxy(this.searchHandler, this));
  this._elements.$searchBtn.on('click', $.proxy(this.searchHandler, this));
};

View.prototype = {
  initialize: function (callback) {
    this.Event.notify('init');
    this.callback = callback;
  },
  searchHandler: function () {
    var _this = this;
    var keywords = _this._elements.$input.val();
    if (_this.timer) {
      clearTimeout(_this.timer);
    }
    _this.timer = setTimeout(function () {
      _this.Event.notify('startSearch', {
        keywords: keywords,
      });
      clearTimeout(_this.timer);
    }, 50);
  },
  buildList: function (isRefresh, groupArray) {
    var $list = this._elements.$list;
    var listHtml,
      func = 'append';
    if (this._model.pageIndex === 1 || !groupArray) {
      func = 'html';
    }
    if (!groupArray) {
      listHtml = listRenderFunc({
        isSearch: this._model.isSearch,
        groups: this._model._groups,
        type: 'common',
        selectedGroups: this._model._selectedGroups,
      });
    } else {
      listHtml = listRenderFunc({
        isSearch: this._model.isSearch,
        groups: groupArray,
        type: 'common',
        selectedGroups: this._model._selectedGroups,
      });
    }
    $list.find('.groupList')[func](listHtml);
    // lazyload images
    this.lazyLoad();
    // nanoScroller
    if ($list.data('bind')) {
      $list.nanoScroller({ flash: true });
    } else {
      this.bindNanoScroller($list);
    }
  },
  buildSelectList: function () {
    var $selectList = this._elements.$selectList,
      $list = this._elements.$list,
      groupIdArray = this._model._selectedGroups,
      groupArray = this._model.getSelectedGroups(),
      listHtml = listRenderFunc({ groups: groupArray, type: 'selected' });

    // handle checkbox
    $list
      .find(':checkbox')
      .filter(function (i, elem) {
        return elem.dataset && groupIdArray.indexOf(elem.dataset.groupid) == -1;
      })
      .prop('checked', false);
    // handle select list
    $selectList.find('.selectGroupList').html(listHtml);
  },
  bindNanoScroller: function ($list) {
    $list.nanoScroller({ preventPageScrolling: true });
    $list.data('bind', true);
    $.isFunction(this.callback) && this.callback();
  },
  lazyLoad: function () {
    var $list = this._elements.$list;
    var $lazyTargets = $list.find('[data-src]');
    $lazyTargets.each(function (index, img) {
      var newImg = new Image(),
        $img = $(this),
        _src = $img.data('src');
      if ($img.data('loaded')) return;

      newImg.src = _src;

      newImg.onload = function () {
        $img.data('loaded', true).attr('src', _src);
      };
    });
  },
  updateBtnText: function () {
    var selectCount = this._model.getSelectedGroups().length;
    var text;
    if (selectCount) {
      this._elements.$memberCount.show().text('（' + selectCount + '）');
    } else {
      this._elements.$memberCount.hide().text('');
    }
  },
};

var Controller = function (model, view) {
  this._model = model;
  this._view = view;
  this.Event = event;
  var _this = this;

  this.Event.attach('init', function () {
    _this.Event.notify('listUpdate');
    _this.Event.notify('selectedGroupsAdd');
    _this.Event.notify('buildSelectedList');
  });

  this.Event.attach('listUpdate', function () {
    _this.fetchGroups();
  });

  this.Event.attach('buildSelectedList', function () {
    _this._view.updateBtnText();
  });

  this.Event.attach('selectGroupAdd', function (event, args) {
    _this._model.addSelectedGroups(args);
    _this._view.updateBtnText();
  });

  this.Event.attach('selectGroupRemove', function (event, args) {
    _this._model.removeSelectedGroups(args);
    _this._view.updateBtnText();
  });

  this.Event.attach('startSearch', function (event, args) {
    if (args.keywords === _this._model.keywords) {
      return;
    }
    _this._model.keywords = args.keywords;
    _this._model.isSearch = args.keywords !== '';
    _this._model.pageIndex = 1;
    _this._model.allCount = undefined;
    _this.fetchGroups();
  });
};

Controller.prototype = {
  fetchGroups: function () {
    var _this = this,
      allCount = this._model.allCount;
    if (allCount != undefined && allCount > this._model._groups.length) {
      this._model.pageIndex++;
    } else if (allCount != undefined) {
      return false;
    }
    // ajax request
    GroupAjaxController.getGroups({
      keywords: this._model.keywords,
      pageIndex: this._model.pageIndex,
      pageSize: this._model.pageSize,
      projectId: this._model.projectId,
    }).done(function (data) {
      console.log('fetch data from server.');
      _this._model.updateGroups(data.list);
      _this._model.allCount = data.allCount;
    });
  },
};

export default GroupDialog;
