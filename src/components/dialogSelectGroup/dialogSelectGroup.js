import './style.css';
import '@mdfe/nanoscroller';
import doT from '@mdfe/dot';
import headerTpl from './tpl/header.html';
import listTpl from './tpl/listItem.html';
import 'src/components/mdDialog/dialog';
import groupController from 'src/api/group';

var headerTplFunc = doT.template(headerTpl);
var groupItemFunc = doT.template(listTpl);

var DialogSelectGroup = function (opts) {
  var defaults = {
    dialogId: 'selectGroupDialog',
    projectId: '',
    pageIndex: 1,
    pageSize: 10,

    selectedGroups: [], // 默认选中的部门
    selectCb: $.noop(),
  };

  this.options = $.extend({}, defaults, opts);
  this.init();
};

$.extend(DialogSelectGroup.prototype, {
  init: function () {
    var _this = this;
    var options = this.options;
    _this.$dialog = $.DialogLayer({
      dialogBoxID: options.dialogId,
      zIndex: 1000,
      container: {
        header: _l('选择分享范围'),
        width: 510,
        status: 'disable',
        yesText: _l('确认') + '<span class="groupCount"></span>',
        yesFn: function () {
          if ($.isFunction(options.selectCb)) {
            options.selectCb.call(null, options.selectGroups);
          }
        },
      },
      readyFn: () => {
        _this.render();
      },
    });
  },
  render: function () {
    var _this = this;
    var options = this.options;
    options.staticGroups = [
      {
        groupId: 'everyone',
        name: options.projectId ? _l('所有同事') : _l('全部联系人'),
      },
      {
        groupId: md.global.Account.accountId,
        name: _l('我自己'),
      },
    ];

    if (options.projectId) {
      // TODO: auth
      options.staticGroups = options.staticGroups.concat({
        groupId: 'all',
        name: _l('全员广播'),
      });
    }
    _this._$dialog = $('#' + options.dialogId);

    this.fetchData();
    this.promise.done(function (data) {
      options.allCount = data.allCount;
      options.groups = data.list;
      _this.$content = $(headerTplFunc());
      _this.$content.find('.staticContents').append(
        groupItemFunc({
          groups: options.staticGroups,
          selectedGroups: options.selectedGroups,
        })
      );

      _this.$dialog.content(_this.$content);
      // stash DOM
      _this.$groupList = _this.$content.find('.groupList');
      _this.$groupListContent = _this.$content.find('.groupListContent');
      _this.$groupCount = _this._$dialog.find('.groupCount');
      _this.bindNanoScroller();

      _this.renderGroupList(data.list);
      _this.$dialog.dialogCenter();
      _this.bindEvent();
    });
  },

  renderGroupList: function (groups) {
    var func = this.options.pageIndex > 1 ? 'append' : 'html';
    this.$groupListContent[func](
      groupItemFunc({
        groups: groups,
        selectedGroups: this.options.selectedGroups,
      })
    );
    this.$groupList.nanoScroller({
      flash: true,
    });
    // scroll to top on first page
    if (this.options.pageIndex == 1) {
      this.$groupList.nanoScroller({
        scrollTop: 0,
      });
    }
  },

  bindEvent: function () {
    var _this = this;
    var options = this.options;
    var $content = this.$content;

    $content.on('click', '.searchIcon', function () {
      $content.find('.tip, .searchInput').toggleClass('Hidden');
      $content.find('.groupKeywords').trigger('focus');
    });

    $content.on('keyup', '.groupKeywords', function (e) {
      var $this = $(this);
      options.keywords = $.trim($this.val());
      options.pageIndex = 1;
      options.allCount = 0;
      if (options.loading) {
        options.loading = false;
        _this.promise.abort();
      }

      _this.fetchData();
      _this.promise.done(function (data) {
        options.allCount = data.allCount;
        options.groups = data.list;
        _this.renderGroupList(data.list);
      });
    });

    $content.find('.groupList').on('scrollend', function () {
      if (options.loading || options.groups.length >= options.allCount) return false;
      options.pageIndex++;
      _this.fetchData();
      _this.promise.done(function (data) {
        options.groups = options.groups.concat(data.list);
        _this.renderGroupList(data.list);
      });
    });

    $content.on('change', '.singleGroup :checkbox', function () {
      var $this = $(this);
      var groupId = $this.data('groupid');
      var isChecked = $this.is(':checked');
      var index = options.selectedGroups.indexOf(groupId);
      if (isChecked && index <= -1) {
        options.selectedGroups.push(groupId);
      } else if (!isChecked && index > -1) {
        options.selectedGroups.splice(index, 1);
      }
      _this.$groupCount.text('(' + options.selectedGroups.length + ')');
    });
  },

  fetchData: function () {
    var options = this.options;
    // loading state
    if (options.loading) return false;
    options.loading = true;

    this.promise = groupController
      .getGroups({
        keywords: options.keywords,
        pageIndex: options.pageIndex,
        pageSize: options.pageSize,
        projectId: options.projectId,
      })
      .always(function () {
        // loading state set to false
        options.loading = false;
      });
  },

  bindNanoScroller: function () {
    var _this = this;
    var dialog = $('#' + this.options.dialogId);
    _this.$groupList.height(600 - dialog.height()).nanoScroller();
  },
});

export default function (opts) {
  return new DialogSelectGroup(opts);
};
