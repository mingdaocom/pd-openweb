// define(function (require, exports, module) {
// define(function (require, exports, module) {
import './style.less';
import { formatFileSize, getClassNameByExt, getUrlByBucketName } from 'src/util';
import mainTpl from './tpl/main.html';
import doT from 'dot';
import kcAjax from 'src/api/kc';
import { Dialog, Button } from 'ming-ui';
import React from 'react';
import RegExpValidator from 'src/util/expression';
var UploadNewVersion = function (item, file, callback) {
  var NV = this;
  NV.item = item;
  NV.file = file;
  NV.callback = callback;
  this.init();
};

UploadNewVersion.prototype = {
  init: function () {
    var NV = this;
    NV.dialog();
  },
  dialog: function () {
    var NV = this;
    var fullname = NV.file.name;
    if (fullname.lastIndexOf('.') > -1) {
      NV.ext = fullname.slice(fullname.lastIndexOf('.') + 1).toLowerCase();
      NV.name = fullname.slice(0, fullname.lastIndexOf('.'));
    } else {
      NV.name = fullname;
    }
    var html = doT.template(mainTpl)();
    NV.dialogBoxID = 'uploadNewVersion_' + Math.random().toString(16).slice(2);

    Dialog.confirm({
      dialogClasses: `${NV.dialogBoxID} uploadNewVersion darkHeader`,
      width: 540,
      title: _l('上传新版本'),
      children: <div dangerouslySetInnerHTML={{ __html: html }}></div>,
      footer: (
        <div className="Dialog-footer-btns">
          <Button type="link" onClick={() => $(`.${NV.dialogBoxID}`).parent().remove()}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              let sign = NV.addAsNewVersion();
              if (sign === false) return;
              $(`.${NV.dialogBoxID}`).parent().remove();
            }}
          >
            {_l('确认')}
          </Button>
        </div>
      ),
    });

    setTimeout(() => {
      NV.$dialog = $('.' + NV.dialogBoxID);
      NV.$fileIcon = NV.$dialog.find('.fileIcon');
      NV.$fileSize = NV.$dialog.find('.fileSize');
      NV.$thumbnail = NV.$dialog.find('.thumbnail');
      NV.$process = NV.$dialog.find('.process');
      NV.$processContent = NV.$dialog.find('.processContent');
      NV.$processPercent = NV.$dialog.find('.processPercent');
      NV.$newVersionFileName = NV.$dialog.find('#newVersionFileName');
      NV.$newVersionFileDetail = NV.$dialog.find('#newVersionFileDetail');
      NV.$newVersionFileName.val(NV.name);
    }, 200);
  },
  uploaded: function (qiniuInfo) {
    let server = getUrlByBucketName(qiniuInfo.bucket);
    this.filePath = server + qiniuInfo.key;
    this.hideProcess();
  },
  addAsNewVersion: function () {
    var NV = this;
    var versionDes = NV.$newVersionFileDetail.val().trim();
    var versionName = NV.$newVersionFileName.val().trim();
    if (!NV.filePath) {
      alert(_l('正在上传中，无法执行此操作'), 3);
      return false;
    }
    if (!versionName) {
      alert(_l('请输入新版本文件名'), 3);
      return false;
    }
    if (!NV.validate(versionName) || !NV.validate(versionDes)) {
      return false;
    }
    kcAjax
      .addMultiVersionFile({
        id: NV.item.id,
        name: versionName,
        ext: NV.ext ? '.' + NV.ext : undefined,
        versionDes: versionDes,
        filePath: NV.filePath,
        size: NV.file.size || 0,
      })
      .then(function (data) {
        alert(_l('已上传为新版本'));
        if (NV.callback) {
          NV.callback(data);
        }
      });
  },
  setProcess: function (percent) {
    var NV = this;
    NV.$processContent.css({ width: percent + '%' });
    NV.$processPercent.text(Math.ceil(percent) + '%');
  },
  hideProcess: function () {
    var NV = this;
    NV.$process.hide();
    if (RegExpValidator.fileIsPicture('.' + NV.ext) && FileReader) {
      NV.loadPicture();
    } else {
      NV.loadDocIcon();
    }
  },
  loadDocIcon: function () {
    var NV = this;
    var fileIconClass = getClassNameByExt('.' + NV.ext);
    NV.$fileIcon.addClass(fileIconClass).show();
    NV.$fileSize.text(formatFileSize(NV.file.size).replace(/ /g, ''));
  },
  loadPicture: function () {
    var NV = this;
    var reader = new FileReader();
    var img = document.createElement('img');
    img.addEventListener(
      'error',
      function () {
        NV.$thumbnail.hide();
        NV.loadDocIcon();
      },
      false,
    );
    reader.addEventListener(
      'load',
      function () {
        img.src = reader.result;
      },
      false,
    );
    if (NV.file) {
      reader.readAsDataURL(NV.file.getNative());
    }
    NV.$thumbnail.append(img).show();
  },
  validate: function (str) {
    var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g;
    var valid = illegalChars.test(str);
    if (valid) {
      alert(_l('名称和详情描述里不能包含以下字符：') + '\\ / : * ? " < > |', 3);
      return false;
    }
    return true;
  },
};

export default function (item, file, callback) {
  var uploadNewVersion = new UploadNewVersion(item, file, callback);
  return uploadNewVersion;
}
// });
