import './style.less';
import { index as DialogLayer} from 'src/components/mdDialog/dialog';
import doT from '@mdfe/dot';
import tpl from './addLinkFile.html';
import _ from 'lodash';

var addLinkFile = function (options) {
  var DEFAULTS = {
    isEdit: false,
    location: {},
    data: {},
    showTitleTip: true,
    callback: function () {},
  };
  this.options = _.assign({}, DEFAULTS, options);
  this.init();
};

addLinkFile.prototype = {
  init: function () {
    var LF = this;
    var html = doT.template(tpl)({
      isEdit: LF.options.isEdit,
      showTitleTip: LF.options.showTitleTip,
    });
    LF.dialog = new DialogLayer({
      dialogBoxID: 'addLinkFileDialog',
      className: 'addLinkFileDialog darkHeader',
      width: 540,
      container: {
        header: LF.options.isEdit ? _l('编辑链接') : _l('添加链接'),
        content: html,
        yesText: LF.options.isEdit ? _l('保存') : _l('创建'),
        noText: _l('取消'),
        yesFn: function () {
          return LF.save();
        },
      },
      readyFn: function () {
        LF.$dialog = $('#addLinkFileDialog');
        LF.$linkFileName = LF.$dialog.find('#linkFileName');
        LF.$linkFileContent = LF.$dialog.find('#linkFileContent');
        LF.$thumbnailCon = LF.$dialog.find('.thumbnail');
        LF.$linkIcon = LF.$dialog.find('.linkIcon');
        if (LF.options.isEdit) {
          LF.$linkFileName.val(LF.options.data.name);
          LF.$linkFileContent.val(LF.options.data.originLinkUrl);
        }
        LF.$linkFileContent.focus();
        LF.bindEvent();
      },
    });
  },
  bindEvent: function () {
    var LF = this;
    this.$linkFileContent.on('mouseup', function (evt) {
      var target = evt.target;
      if (target.selectionEnd - target.selectionStart === 0) {
        target.select();
      }
    });
  },
  save: function () {
    var LF = this;
    var linkName = LF.$linkFileName.val().trim();
    var linkContent = LF.$linkFileContent.val().trim();
    if (linkName === '') {
      alert(_l('链接名不能为空'), 3);
      return false;
    }
    if (linkContent === '') {
      alert(_l('链接url不能为空'), 3);
      return false;
    }
    if (!LF.validate(linkName)) {
      return false;
    }
    if (!LF.validateUrl(linkContent)) {
      return false;
    }
    if (typeof LF.options.callback === 'function') {
      LF.options.callback({
        linkName,
        linkContent,
      });
    }
  },
  createThumbnail: function (src) {
    var LF = this;
    var $img = $('<img />');
    $img.attr('src', src);
    $img.on('error', function () {
      $img.hide();
      LF.$linkIcon.show();
    });
    return $img;
  },
  validate: function (str) {
    var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g;
    var valid = illegalChars.test(str);
    if (valid) {
      alert(_l('链接名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return false;
    }
    return true;
  },
  validateUrl: function (url) {
    if (!url.match('://') && !url.match(/^mailto:/)) {
      return true;
    } else if (url.match(/^http/)) {
      return true;
    }
    alert(_l('当前只支持 http:// 和 https:// 开头的链接'), 3);
    return false;
  },
};

export default addLinkFile;
