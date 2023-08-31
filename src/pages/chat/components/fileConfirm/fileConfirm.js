import './style.less';
import { formatFileSize, getClassNameByExt } from 'src/util';
import mainTpl from './main.htm';
import { index as DialogLayer} from 'src/components/mdDialog/dialog';
import doT from 'dot';
import moment from 'moment';

var FileConfirm = function(file, callback) {
  var FC = this;
  FC.file = file;
  FC.callback = callback;
  this.init();
};

FileConfirm.prototype = {
  init: function() {
    var FC = this;
    var name;
    var file = FC.file;
    var fullname = file.name;
    if (fullname.lastIndexOf('.') > -1) {
      FC.ext = fullname.slice(fullname.lastIndexOf('.') + 1).toLowerCase();
      name = fullname.slice(0, fullname.lastIndexOf('.'));
    } else {
      name = fullname;
    }
    if (name === '剪切板贴图') {
      name = moment().format('上传于YYYY-MM-DD HH时mm分');
    }
    var html = doT.template(mainTpl)();
    FC.dialogBoxID =
      'fileConfirmDialog_' +
      Math.random()
        .toString(16)
        .slice(2);
    FC.dialog = new DialogLayer({
      dialogBoxID: FC.dialogBoxID,
      className: 'fileConfirmDialog darkHeader',
      width: 540,
      container: {
        header: _l('上传文件'),
        content: html,
        yesText: _l('上传'),
        yesFn: function() {
          if (FC.yesFn()) {
            $(document).off('keyup.fileConfirm.upload');
          } else {
            return false;
          }
        },
        noFn: function() {
          $(document).off('keyup.fileConfirm.upload');
          if (FC.callback && typeof FC.callback.noFn === 'function') {
            FC.callback.noFn(FC.file);
          }
        },
      },
      readyFn: () => {
        FC.dialogEle = {};
        FC.$dialog = $('#' + FC.dialogBoxID);
        FC.dialogEle.$fileIcon = FC.$dialog.find('.fileIcon');
        FC.dialogEle.$fileSize = FC.$dialog.find('.fileSize');
        FC.dialogEle.$thumbnailCon = FC.$dialog.find('.thumbnailCon');
        FC.dialogEle.$thumbnail = FC.$dialog.find('.thumbnail');
        FC.dialogEle.$fileName = FC.$dialog.find('#fileName');
        FC.dialogEle.$fileName.val(name);
        FC.dialogEle.$fileName.focus();
        $(document).on('keyup.fileConfirm.upload', function(e) {
          e.stopPropagation();
          if (e.keyCode === 13) {
            if (FC.yesFn()) {
              $(document).off('keyup.fileConfirm.upload');
              FC.dialog.closeDialog();
              $('.chatMessage-textarea textarea').focus();
            } else {
              return false;
            }
          }
        });
        FC.previewFile();
        FC.first = true;
      },
    });
  },
  yesFn: function() {
    var FC = this;
    if (FC.dialogEle.$fileName.val().trim() === '') {
      alert(_l('名称不能为空'), 3);
      return false;
    }
    if (!FC.validate(FC.dialogEle.$fileName.val())) {
      return false;
    }
    if (FC.callback && typeof FC.callback.yesFn === 'function' && FC.first) {
      FC.file.name = FC.getFullFileName();
      FC.callback.yesFn(FC.file);
      FC.first = false;
      return true;
    }
  },
  previewFile: function() {
    var FC = this;
    if (File.isPicture('.' + FC.ext) && FileReader) {
      FC.loadPicture();
    } else {
      FC.loadDocIcon();
    }
  },
  loadDocIcon: function() {
    var FC = this;
    FC.dialogEle.$fileIcon.show();
    var fileIconClass = getClassNameByExt('.' + FC.ext);
    FC.dialogEle.$fileIcon.addClass(fileIconClass).show();
    FC.dialogEle.$fileSize.text(formatFileSize(FC.file.size).replace(/ /g, ''));
  },
  loadPicture: function() {
    var FC = this;
    FC.dialogEle.$thumbnailCon.show();
    var reader = new FileReader();
    var img = document.createElement('img');
    img.addEventListener(
      'error',
      function() {
        FC.dialogEle.$thumbnail.hide();
        FC.loadDocIcon();
      },
      false,
    );
    reader.addEventListener(
      'load',
      function() {
        img.src = reader.result;
      },
      false,
    );
    if (FC.file) {
      reader.readAsDataURL(FC.file.getNative ? FC.file.getNative() : FC.file);
    }
    FC.dialogEle.$thumbnail.append(img).show();
  },
  getFullFileName: function() {
    var FC = this;
    return FC.dialogEle.$fileName.val() + (FC.ext ? '.' + FC.ext : '');
  },
  validate: function(str) {
    var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g;
    var valid = illegalChars.test(str);
    if (valid) {
      alert(_l('名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return false;
    }
    return true;
  },
};

export default function(file, callback) {
  var fileConfirm = new FileConfirm(file, callback);
  return fileConfirm.dialog;
};
