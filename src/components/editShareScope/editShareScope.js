var DialogLayer = require('mdDialog').index;
var doT = require('dot');
var postAjax = require('src/api/post');
var SelectGroup = require('selectGroup');
import './style.less';

var EditShareScope = function (options, callback) {
  var DEFAULTS = {};
  // value
  this.options = _.assign({}, DEFAULTS, options);
  this.callback = callback;
  this.type = this.options.isMy ? 'my' : 'manager';
  // template
  this.tpl = {};
  this.tpl.main = doT.template(require('./tpl/main.html'));
  this.tpl.result = doT.template(require('./tpl/result.html'));
  this.init();
};

EditShareScope.prototype = {
  init: function () {
    var ES = this;
    ES.dialog = new DialogLayer({
      width: 460,
      container: {
        header: _l('选择分享范围'),
        yesText: '',
        noText: '',
        content: ES.tpl.main(),
      },
    });
    // element
    ES.$content = $('.editShareScope');
    ES.$searchInput = ES.$content.find('.search input');
    ES.$searchResult = ES.$content.find('.searchResult');
    ES.$selectedNum = ES.$content.find('.btns .save .selectedNum');
    ES.$saveBtn = ES.$content.find('.btns .save');
    ES.$cancelBtn = ES.$content.find('.btns .cancel');
    ES.render();
  },
  render: function () {
    var ES = this;
    var options;
    ES.$shareScpe = ES.$content.find('.shareScope');
    options = {
      projectId: ES.type === 'manager' ? ES.options.projectIds[0] : undefined,
      noCreateGroup: true,
      filterDisabledGroup: true,
      showCompanyName: true,
      isRadio: false,
      filterByProjects: true,
      renderWhenBegin: true,
      defaultValue: {
        group: ES.options.scope.shareGroups.map(function (group) {
          return group.groupId;
        }),
        project: ES.options.scope.shareProjects.map(function (project) {
          return project.projectId;
        }),
      },
      reSize: function () {
        ES.dialog.dialogCenter();
      },
      changeCallback: function (scope) {
        var num = scope.groups.length + scope.shareProjectIds.length;
        ES.$selectedNum.html(num > 0 ? '(' + num + ')' : '');
      },
    };
    ES.scopeObj = new SelectGroup(ES.$shareScpe[0], options);
    ES.scopeObj.defaultSlide();
    ES.dialog.dialogCenter();
    ES.bindEvent();
  },
  bindEvent: function () {
    var ES = this;
    this.$saveBtn.on('click', function () {
      var scope = ES.$shareScpe.SelectGroup('getScope');
      // console.log(ES.options.postID, ES.$shareScpe.SelectGroup('getScope'));
      if (!scope) {
        alert(_l('请选择分享范围'), 3);
      } else {
        postAjax
          .editPostShareScope({
            postId: ES.options.postID,
            scope: scope,
          })
          .then(function (data) {
            alert(_l('操作成功'));
            if (ES.callback) {
              ES.callback(data.scope);
            }
          })
          .fail(function () {
            alert(_l('操作失败'), 2);
          })
          .always(function () {
            ES.dialog.closeDialog();
          });
      }
    });
    this.$cancelBtn.on('click', function () {
      ES.dialog.closeDialog();
    });
  },
};
module.exports = function (options, callback) {
  return new EditShareScope(options, callback);
};
