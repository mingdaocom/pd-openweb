/*
依赖：字符图标、dialog、plupload、global.js
*/
import doT from '@mdfe/dot';
var kcCtrl = require('src/api/kc');
import './css/uploadAttachment.css';
import headerTpl from './tpl/header.htm';
import saveToKcHtml from './tpl/addToKc.htm';
import selectNode from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import '@mdfe/jquery-plupload';
import { index as dialog } from 'src/components/mdDialog/dialog';
import { formatFileSize, getClassNameByExt, htmlEncodeReg, getToken } from 'src/util';
var MAX_IMG_VIEW_SIZE = 20971520;

export default (function ($) {
  function UploadAttachment(el, param) {
    var _this = this;
    var defaults = {
      currentFile: '',
      pluploadID: '',
      newPluploadID: '',
      maxTotalSize: md.global.SysSettings.fileUploadLimitSize, // 单位M
      uploadUrl: md.global.FileStoreConfig.uploadHost,
      uploadFrom: 1, // 1 Post，2 Task ,3 Calender
      dropPasteElement: '',
      multiSelection: true, // 是否支持多选
      fileDataName: 'file',
      attachmentData: [], // 如果默认初始值不为空，格式要求([{fileID:"",fileSize:"",serverName:"",filePath:"",fileName:"",fileExt:"",originalFileName:""}])
      kcAttachmentData: [],
      defaultAttachmentData: [],
      defaultKcAttachmentData: [],
      styleType: '1', // 0不使用默认的样式 1动态 2回复
      tokenType: 0, // 0 =普通，1= 用户头像，2=群组头像，3 = 聊天群组头像 4 = 网络头像
      folder: '', // 文件所在文件夹
      fileNamePrefix: '', // 文件名前缀
      onlyFolder: false, // 只要文件夹这一级 文件ID为GUID
      onlyOne: false, // 只允许上传一个文件
      bucketType: null, // 1 webchat  2 BUG反馈  3主站文档
      showDownload: true, // 是否允许设置可下载
      showArrow: true,
      arrowLeft: 9,
      hidePrograss: false,
      kcFilesAdded: function () {},
      filesAdded: function () {},
      beforeUpload: function () {},
      fileUploaded: function () {},
      uploadProgress: function () {},
      error: function () {},
      isUploadComplete: function (isUploadComplete) {},
      callback: function (attachments, totalSize) {},
    };
    var options = $.extend(defaults, param);

    // 初始化
    _this.init = function () {
      var headerHtml;
      var pluploadID;
      var styleTypeClass = '';
      var containerClass = options.showKcAttachmentEntry ? 'uploadAttaachmentsContainer' : 'attachmentList';
      if (options.styleType == '2') {
        styleTypeClass = 'commentAttachment';
      }
      if (options.showKcAttachmentEntry) {
        pluploadID = 'uploadAttaachmentsBtn_' + _this.getRandStr(15) + '_' + _this.getHashCode(new Date());
        headerHtml = doT.template(headerTpl)({
          pluploadID: pluploadID,
          showArrow: options.showArrow,
          arrowLeft: options.arrowLeft,
          hidePrograss: options.hidePrograss,
        });
      }
      if ($(el).next('div.' + containerClass).length == 0) {
        var attachmentsConId = 'UAC' + Math.random().toString().slice(2);

        options.attachmentsConId = attachmentsConId;
        var html = `
        <div class="attachmentList ${styleTypeClass}">
        ${options.styleType == '2' ? "<div class='commentArrowTop'></div>" : ''}
        <div class="uploadDocList">
        <div class="Clear clearFloat"></div>
        </div>
        <div class="uploadPicList">
        <div class="Clear clearFloat"></div>
        </div>
        <div class="kcFileList">
        <div class="Clear clearFloat"></div>
        </div>
        </div>
        `;
        var kcAttachmentsList =
          '<hr class="updaterAttachmentSplitter ThemeBorderColor5 Hidden" /><div class="kcAttachmentList mLeft10"></div>';
        var container = options.showKcAttachmentEntry
          ? '<div class="uploadAttaachmentsContainer ' +
            (options.controlBtn ? 'Hidden' : '') +
            '" id="' +
            attachmentsConId +
            '">' +
            headerHtml +
            html +
            saveToKcHtml +
            kcAttachmentsList +
            '</div>'
          : html;
        $(el).after(container);
      }
      if (options.showKcAttachmentEntry) {
        _this.bindCallKcDailog();
        _this.bindKcAttachmentsEvent();
        $(options.controlBtn).on('click.controlBtn', function () {
          var $con = $('#' + attachmentsConId);
          if ($con.is(':hidden')) {
            $con.show(0, function () {
              if (options.pluploadObj) {
                options.pluploadObj.refresh();
              }
            });
          } else {
            $con.hide();
            _this.clear();
            if (options.callback) {
              options.callback.call(
                this,
                {
                  attachmentData: options.attachmentData,
                  kcAttachmentData: options.kcAttachmentData,
                },
                _this.getAttachmentTotalSize(),
              );
            }
          }
          if (options.toggleFn) {
            options.toggleFn();
          }
        });
        // callback
        if (options.initedCallback) {
          options.initedCallback();
        }
      }
      _this.bindPlupload(options.showKcAttachmentEntry ? '#' + pluploadID : options.pluploadID);
      // 兼容任务中心同时绑定多少上传按钮 注：beck说： IE10 以下  元素必须显示
      if (options.siblingPluploadID) {
        _this.bindPlupload(options.siblingPluploadID);
      }
      if (options.attachmentData.length > 0) {
        _this.initAttactments(options.attachmentData);
      }
      if (options.defaultAttachmentData.length > 0) {
        options.attachmentData = options.defaultAttachmentData;
        _this.initAttactments(options.attachmentData);
      }
      if (options.defaultKcAttachmentData.length > 0) {
        var $kcAttachmentList = $(el).next('.uploadAttaachmentsContainer').find('.kcAttachmentList');
        var renderedHtml = _this.renderKcAttachments(options.defaultKcAttachmentData);
        $kcAttachmentList.append(renderedHtml);
        if (options.callback) {
          options.callback.call(
            this,
            {
              attachmentData: options.attachmentData,
              kcAttachmentData: options.kcAttachmentData,
            },
            _this.getAttachmentTotalSize(),
          );
        }
        if (options.initAttactmentsComplete) {
          options.initAttactmentsComplete();
        }
      }
    };

    _this.withKcInit = function () {
      console.log('withKcInit');
    };

    _this.findAttachmentList = function () {
      var $el = $(el);
      if (options.showKcAttachmentEntry) {
        return $el.next('.uploadAttaachmentsContainer').find('div.attachmentList');
      }
      return $el.next('div.attachmentList');
    };

    _this.findContainer = function () {
      var $el = $(el);
      if (options.showKcAttachmentEntry) {
        return $el.next('.uploadAttaachmentsContainer');
      }
      return $el.next('div.attachmentList');
    };

    _this.bindCallKcDailog = function () {
      _this
        .findContainer()
        .find('#kcAttachment')
        .on('click', function () {
          var $attachmentList = _this.findAttachmentList();
          var $kcAttachmentList = $(el).next('.uploadAttaachmentsContainer').find('.kcAttachmentList');
          selectNode({
            isFolderNode: 2,
          }).then(function (result) {
            if (!result || !result.node || !result.node.length) {
              alert(_l('未选择文件'), 3);
            }
            if (options.kcAttachmentData.length + result.node.length > 10) {
              alert(_l('附件数量超过限制，一次上传不得超过10个附件'), 3);
              return false;
            }

            var nodes = [];
            var hasAlreadyAdded = false;
            for (var i = 0; i < result.node.length; i++) {
              if ($kcAttachmentList.find('[data-node-id=' + result.node[i].id + ']').length) {
                hasAlreadyAdded = true;
              } else {
                nodes.push(result.node[i]);
              }
            }
            if (hasAlreadyAdded) {
              alert(_l('已引用该文件'), 3);
            }
            if (!nodes.length) {
              return;
            } else {
              result.node = nodes;
            }
            var html = _this.renderKcAttachments(result.node);
            $kcAttachmentList.append(html);
            if (options.kcFilesAdded) {
              options.kcFilesAdded();
            }
            if (options.attachmentData.length) {
              $(el).next().find('.updaterAttachmentSplitter').show();
            }
            if (options.callback) {
              options.callback.call(
                this,
                options.showKcAttachmentEntry
                  ? {
                      attachmentData: options.attachmentData,
                      kcAttachmentData: options.kcAttachmentData,
                    }
                  : options.attachmentData,
                _this.getAttachmentTotalSize(),
              );
            }
          });
        });
    };
    _this.bindKcAttachmentsEvent = function () {
      $(el)
        .next('.uploadAttaachmentsContainer')
        .find('.kcAttachmentList')
        .on('click', '.docDelete', function () {
          $(this)
            .closest('.kcDocItem')
            .fadeOut(300, function () {
              var nodeID = $(this).data('nodeId');
              // delete  Data
              var data = options.kcAttachmentData;
              _.remove(data, function (node) {
                return node.refId === nodeID;
              });
              options.kcAttachmentData = data;
              if (options.callback) {
                options.callback.call(
                  this,
                  options.showKcAttachmentEntry
                    ? {
                        attachmentData: options.attachmentData,
                        kcAttachmentData: options.kcAttachmentData,
                      }
                    : options.attachmentData,
                  _this.getAttachmentTotalSize(),
                );
              }
              $(this).remove();
              if (!data.length) {
                $(el).next().find('.updaterAttachmentSplitter').hide();
              }
            });
        });
    };
    _this.renderKcAttachments = function (data) {
      var html = '';
      data.forEach(function (node) {
        /* pushData */
        options.kcAttachmentData.push({
          refId: node.id,
          originalFileName: node.name,
          fileExt: node.ext ? '.' + node.ext : '',
          fileSize: node.size,
          allowDown: node.isDownloadable,
          viewUrl: File.isPicture('.' + node.ext) ? node.viewUrl : null,
          type: node.type === 1 ? 1 : undefined,
        });
        html +=
          "<div class='docItem kcDocItem' data-name='" +
          htmlEncodeReg(node.name) +
          "' data-node-id='" +
          node.id +
          "' id='docItem_" +
          node.id +
          "'>";
        html += "<div class='progress'>";
        if (File.isPicture('.' + node.ext)) {
          html +=
            "<div class='Left nodeIconContainer nodeImg'><img src='" +
            node.previewUrl +
            "' alt='" +
            htmlEncodeReg(node.ext) +
            "' /></div>";
        } else {
          html +=
            "<div class='Left nodeIconContainer nodeDoc'><span class='nodeIcon " +
            getClassNameByExt('.' + node.ext) +
            "'></span></div>";
        }
        html += "<div class='Left docMessage'>";
        html += "<div class='TxtLeft'>";
        html +=
          "<span class='overflow_ellipsis titleLimitWidth TxtTop Left' title='" +
          htmlEncodeReg(node.name + (node.ext ? '.' + node.ext : '')) +
          "'>" +
          htmlEncodeReg(node.name + (node.ext ? '.' + node.ext : '')) +
          "</span><span class='Right ThemeColor4 Font16 mLeft10 Hand docDelete Bold' title='" +
          _l('删除') +
          "'>×</span><div class='Clear'></div>";
        html += '</div>';
        html += "<div class='TxtLeft shareUrl ThemeColor3 overflow_ellipsis'>";
        html += "<a href='" + node.shareUrl + "' target='_blank'>" + node.shareUrl + '</a>';
        html += "<div class='Clear'></div>";
        html += '</div>';
        html += '</div>';
        html += "<div class='Clear'></div>";
        html += '</div>';
        html += '</div>';
      });
      return html;
    };
    // 重置附件集合
    _this.clear = function () {
      options.attachmentData = [];
      _this.findAttachmentList().hide();
      $(el)
        .next()
        .find('.currentUploadSize')
        .html(0 + 'M');
      $(el).next().find('.uploadDocList .docItem').remove();
      $(el).next().find('.uploadPicList .picItem').remove();
      if (options.showKcAttachmentEntry) {
        options.kcAttachmentData = [];
        $(el).next().find('.updaterAttachmentSplitter').hide();
        $(el).next('.uploadAttaachmentsContainer').find('.kcAttachmentList').children().remove();
      }

      // 如果当前队列中有文件 先移除
      if (options.currentFile) {
        options.currentFile.stop();
        options.currentFile.splice(0, options.currentFile.files.length);
      }

      if (options.isUploadComplete) {
        options.isUploadComplete.call(this, _this.isUploadComplete());
      }
    };

    // 绑定上传
    _this.bindPlupload = function (id) {
      var $plupload = $(id).plupload({
        url: options.uploadUrl,
        drop_element: options.dropPasteElement,
        paste_element: options.dropPasteElement,
        multi_selection: options.multiSelection,
        file_data_name: options.fileDataName,
        filters: options.filterExtensions
          ? [{ title: options.filterTitle, extensions: options.filterExtensions }]
          : undefined,
        max_file_size: options.maxTotalSize + 'm',
        method: {
          StateChanged: function (up) {
            return false;
          },
          FilesAdded: function (up, files) {
            var error = false;
            var count = 0;
            var fileSize = 0;
            var i;
            for (i = 0; i < files.length; i++) {
              if (File.isValid('.' + File.GetExt(files[i].name))) count++;
              fileSize += files[i].size;
            }
            if (count !== files.length) {
              alert(_l('含有不支持格式的文件'), 3);
              error = true;
            }

            var totalFileCount = options.attachmentData.length + files.length;
            var nodeFileCount = $(el).next().find('.kcFileList .kcDocItem').length;

            if (options.currentFile) {
              // 正在上传 或者 排队中
              var uploadingFiles = options.currentFile.files
                .slice(0, options.currentFile.files.length - files.length)
                .filter(function (item) {
                  return item.status == 1 || item.status == 2;
                });

              if (uploadingFiles) {
                totalFileCount = totalFileCount + uploadingFiles.length;
              }
            }
            // 判断是否超过10个文件
            if (totalFileCount + nodeFileCount > 10) {
              alert(_l('附件数量超过限制，一次上传不得超过10个附件'), 3);
              error = true;
            }
            // 判断已上传的总大小是否超出限制
            var currentTotalSize = _this.getAttachmentTotalSize();
            var totalSize = parseFloat(currentTotalSize) + parseFloat(fileSize / 1024 / 1024);
            if (totalSize > options.maxTotalSize) {
              alert(_l('附件总大小超过 %0，请您分批次上传', formatFileSize(options.maxTotalSize * 1024 * 1024)), 3);
              error = true;
            }

            // 文件选择之后
            if (!error && options.filesAdded) {
              if (options.filesAdded(up, files) === false) {
                error = true;
              }
            }
            // 粘贴文件显示附件组件
            var $con = $('#' + options.attachmentsConId);
            if (!!$con.length && $con.is(':hidden')) {
              $con.show(0, function () {
                if (options.pluploadObj) {
                  options.pluploadObj.refresh();
                }
              });
              if (options.toggleFn) {
                options.toggleFn();
              }
            }

            if (error) {
              up.stop();
              // up.splice(0, files.length);
              up.splice(up.files.length - files.length, up.files.length);
              return false;
            }

            // 判断个人上传流量是否达到上限
            _this
              .checkAccountUploadLimit(
                files.reduce(function (total, file) {
                  return total + file.size || 0;
                }, 0),
              )
              .then(function (available) {
                if (available) {
                  if (options.newPluploadID) {
                    options.dropPasteElement = '';
                    _this.bindPlupload(options.newPluploadID);
                  }
                  // 只允许上传一个文件
                  if (options.onlyOne) {
                    options.attachmentData = [];
                  }

                  if (!_this.findAttachmentList().is(':visible')) {
                    _this.findAttachmentList().show();
                  }

                  const tokenFiles = [];
                  if (options.styleType != '0') {
                    var i;
                    for (i = 0; i < files.length; i++) {
                      var file = files[i];
                      // 上传图片
                      if (File.isPicture('.' + File.GetExt(file.name))) {
                        if (options.onlyOne && _this.findAttachmentList().find('.uploadPicList .picItem').length > 0) {
                          _this
                            .findAttachmentList()
                            .find('.uploadPicList .picItem')
                            .replaceWith(_this.createPicProgressBar(file));
                        } else {
                          _this
                            .findAttachmentList()
                            .find('.uploadPicList .clearFloat')
                            .before(_this.createPicProgressBar(file));
                        }
                      } else {
                        _this
                          .findAttachmentList()
                          .find('.uploadDocList .clearFloat')
                          .before(_this.createDocProgressBar(file));
                      }
                      let fileExt = `.${File.GetExt(file.name)}`;
                      let isPic = File.isPicture(fileExt);
                      tokenFiles.push({
                        bucket: options.bucketType ? options.bucketType : isPic ? 4 : 3,
                        ext: fileExt,
                      });
                      _this.cancelUploadEvent(file.id);
                    }
                  } else {
                    for (i = 0; i < files.length; i++) {
                      var file = files[i];
                      let fileExt = `.${File.GetExt(files[i].name)}`;
                      let isPic = File.isPicture(fileExt);
                      tokenFiles.push({
                        bucket: options.bucketType ? options.bucketType : isPic ? 4 : 3,
                        ext: fileExt,
                      });
                    }
                  }

                  getToken(tokenFiles, options.tokenType).then(res => {
                    files.forEach((item, i) => {
                      item.token = res[i].uptoken;
                      item.key = res[i].key;
                      item.serverName = res[i].serverName;
                      item.fileName = res[i].fileName;
                      item.url = res[i].url;
                    });

                    up.start();
                  });

                  options.currentFile = up;

                  if (options.isUploadComplete) {
                    options.isUploadComplete.call(this, false);
                  }
                } else {
                  up.stop();
                  up.splice(0, files.length);

                  var html =
                    '<div id="uploadStorageOverDialog">' +
                    '<div class="mTop20 mLeft30">' +
                    '<div class="uploadStorageOverLogo Left"></div>' +
                    '<div class="uploadStorageOverTxt Left">' +
                    _l('您已经没有足够的流量来上传该附件！') +
                    '</div>' +
                    '<div class="Clear"></div>' +
                    '</div>' +
                    '<div class="mTop20 mBottom20 TxtCenter">' +
                    '<a href="/personal?type=enterprise" class="uploadStorageOverBtn btnBootstrap btnBootstrap-primary btnBootstrap-small">' +
                    _l('升级至付费版') +
                    '</a>' +
                    '</div>' +
                    '</div>';

                  dialog({
                    container: {
                      content: html,
                      width: 450,
                      yesText: false,
                      noText: false,
                    },
                  });
                }
              });
            return false;
          },
          BeforeUpload: function (uploader, file) {
            // 上传文件到七牛
            var fileExt = '.' + File.GetExt(file.name);
            // token
            uploader.settings.multipart_params = {
              token: file.token,
            };

            uploader.settings.multipart_params.key = file.key;
            uploader.settings.multipart_params['x:serverName'] = file.serverName;
            uploader.settings.multipart_params['x:filePath'] = file.key.replace(file.fileName, '');
            uploader.settings.multipart_params['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');
            uploader.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
              file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
            );
            uploader.settings.multipart_params['x:fileExt'] = fileExt;

            // 隐藏排队中 显示进度条
            var $itemContainer = null;
            if (File.isPicture(fileExt)) {
              $itemContainer = $('#picItem_' + file.id);
            } else {
              $itemContainer = $('#docItem_' + file.id);
            }
            $('#complete_' + file.id).show();
            $itemContainer.find('.progressBefore').hide();

            return options.beforeUpload(uploader, file);
          },
          FileUploaded: function (up, file, response) {
            if (response.response == '1') {
              _this.uploadFailed(file);
            } else {
              var obj = _this.formatResponseData(file, decodeURIComponent(response.response));
              _this.uploadSuccess(obj);
            }
            options.fileUploaded(up, file, response);
          },
          UploadProgress: function (up, file) {
            if (options.styleType != '0') {
              // 不是有默认的样式
              var progress = parseInt((file.loaded / (file.size || 0)) * 100, 10);
              $('#complete_' + file.id).text(progress + '%');
              $('#file_' + file.id)
                .find('.progressbar')
                .css('width', progress + '%');
            }
            options.uploadProgress(up, file);
          },
          Error: function (up, error) {
            if (error.code === window.plupload.FILE_SIZE_ERROR) {
              alert(_l('单个文件大小超过 %0，无法支持上传', formatFileSize(options.maxTotalSize * 1024 * 1024)), 2);
            } else {
              alert(_l('上传失败，请稍后再试。'), 2);
            }
            if (error.file) {
              _this.uploadFailed(error.file);
            }
            options.error(up, error);
          },
        },
      });
      if (!options.pluploadObj) {
        options.pluploadObj = $plupload.data('plupload');
      }
    };

    // 判断个人上传流量是否达到上限
    _this.checkAccountUploadLimit = function (size) {
      return kcCtrl.getUsage().then(function (usage) {
        return usage.used + size < usage.total;
      });
    };

    // 取消图片、文档上传
    _this.cancelUploadEvent = function (id) {
      $('#cancelUpload_' + id).on('click', function () {
        var fileID = $(this).attr('fileID');
        var type = $(this).attr('type');
        var containerID = '';
        if (type === 'doc') {
          containerID = '#docItem_' + fileID;
        } else if (type === 'pic') {
          containerID = '#picItem_' + fileID;
        }
        _this.removeFile(containerID, fileID);
      });
    };
    // 对默认存在的附件呈现
    _this.initAttactments = function (attachmentArr) {
      // 初始化附件列表
      if (attachmentArr && attachmentArr.length > 0) {
        for (var i = 0; i < attachmentArr.length; i++) {
          var attachment = attachmentArr[i];
          var file = {};
          file.id = attachment.fileID;
          file.name = attachment.originalFileName + attachment.fileExt;
          if (File.isPicture(attachment.fileExt)) {
            _this.findAttachmentList().find('.uploadPicList .clearFloat').before(_this.createPicProgressBar(file));
          } else {
            _this.findAttachmentList().find('.uploadDocList .clearFloat').before(_this.createDocProgressBar(file));
          }
          _this.findAttachmentList().addClass('show').show();
          _this.uploadSuccess(attachment);
        }
      }
      if (options.initAttactmentsComplete) {
        options.initAttactmentsComplete();
      }
    };
    // 文件上传成功后
    _this.uploadSuccess = function (obj) {
      if (options.styleType != '0') {
        // 不使用默认的样式
        var fileID = obj.fileID;
        var originalFileName = obj.originalFileName;
        var fileExt = obj.fileExt;
        var fileSize = obj.fileSize;

        if (File.isPicture(obj.fileExt)) {
          if (!obj.isDelete) {
            var fullImgPath = '';
            if (obj.fileSize > MAX_IMG_VIEW_SIZE) {
              fullImgPath = '/images/noimage.png';
            } else {
              fullImgPath = `${obj.url}&imageView2/1/w/119/h/83`;
            }

            var picViewHtml = `
            <div id="pic_${fileID}" class="picContainer">
            <div>
            <img class="uploadThumbPic" alt="${originalFileName}${fileExt}" src="${fullImgPath}" />
            <img src='' class='nullImage' />
            </div>
            <a class="ThemeColor4 picDelete" fileID="${fileID}" title="${_l('删除')}" href="javascript:;">×</a>
            </div>
            `;
            $('#picItem_' + fileID).html(picViewHtml);

            // 删除图片
            $('#picItem_' + fileID + ' .picDelete').on('click', function () {
              fileID = $(this).attr('fileID');
              _this.removeFile('#picItem_' + fileID, fileID);
            });
          } else {
            $('#picItem_' + fileID)
              .removeClass('ThemeBorderColor4')
              .css({ border: '1px solid #eee' })
              .html("<div class='TxtCenter Gray_c' style='line-height:90px;'>" + _l('原图片已删除') + '</div>');
          }
        } else {
          if (!obj.isDelete) {
            $('#docItem_' + fileID)
              .find('.uploadDocTag')
              .addClass('uploadSuc');

            // 重命名 下载  删除操作
            var opHtml = `
            <div class='InlineBlock'>
            <span class='icon-edit ThemeColor4 Font16 Hand docEdit' title='${_l('编辑')}' fileID='${fileID}'></span>
            ${
              options.showDownload
                ? `${
                    obj.allowDown
                      ? `<span class='icon-kc-download ThemeColor4 Font16 mLeft10 Hand docDownload' title='${_l(
                          '允许下载',
                        )}'
                fileID='${fileID}'></span>`
                      : `<span class='icon-kc-disable-download Gray_c Font16 mLeft10 Hand docDownload' title='${_l(
                          '只允许在线浏览',
                        )}'
                fileID='${fileID}'></span>
                `
                  }`
                : ''
            }
            <span  class='ThemeColor4 Font16 mLeft10 Hand docDelete Bold' title='${_l(
              '删除',
            )}' fileID='${fileID}'>×</span>
            </div>
            `;
            $('#uploadCompleteOp_' + fileID).html(opHtml);

            // 重命名区域
            var newFileNameHtml = `
            <span class='Hidden eidtFileNameContainer' id='newFileName_${fileID}'>
            <input value='originalFileName' id='txtNewFileName_${fileID}' class='editFileNameBox Left' />
            <span class='Left' id='fileExt_${fileID}'>${fileExt}</span>
            <a id='newFileNameCancel_${fileID}' fileID='${fileID}' class='Gray_c mLeft5 Right' href='javascript:;'>
            ${_l('取消')}</a>
            <a id='newFileNameSave_${fileID}' fileID='${fileID}' class='ThemeColor4 mLeft5 Right' href='javascript:;'>
            ${_l('保存')}</a>
            <div class='Clear'></div>
            </span>
            `;
            $('#uploadCompleteOp_' + fileID).before(newFileNameHtml);

            $('#docUploadStatus_' + fileID).html(_this.formatFileSize(fileSize));

            // 重命名
            $('#docItem_' + fileID + ' .docEdit').on('click', function (event) {
              fileID = $(this).attr('fileID');
              $('#newFileName_' + fileID).show();
              $('#oldFileName_' + fileID).hide();
              $('#uploadCompleteOp_' + fileID).hide();
              $('#newFileNameCancel_' + fileID).attr(
                'oldName',
                $('#txtNewFileName_' + fileID)
                  .val()
                  .trim(),
              );

              var index = _.findIndex(options.attachmentData, function (item) {
                return item.fileID == fileID;
              });
              // 处于编辑状态
              options.attachmentData[index].inEdit = true;

              event.stopPropagation();
            });

            // 保存文件名
            $('#newFileNameSave_' + fileID).on('click', function () {
              fileID = $(this).attr('fileID');
              var newFileName =
                $('#txtNewFileName_' + fileID)
                  .val()
                  .trim() + $('#fileExt_' + fileID).html();
              var index = _.findIndex(options.attachmentData, function (item) {
                return item.fileID == fileID;
              });
              var fileName = $('#txtNewFileName_' + fileID)
                .val()
                .trim();
              $('#newFileName_' + fileID).hide();
              $('#oldFileName_' + fileID)
                .show()
                .html(htmlEncodeReg(newFileName))
                .attr('title', htmlEncodeReg(newFileName));
              $('#uploadCompleteOp_' + fileID).show();
              $('#newFileNameCancel_' + fileID).removeClass('Visibility');
              // 编辑成功 处于非编辑状态
              options.attachmentData[index].inEdit = false;
              // 新文件名
              options.attachmentData[index].originalFileName = fileName;
            });

            // 取消修改文件名
            $('#newFileNameCancel_' + fileID).on('click', function () {
              fileID = $(this).attr('fileID');
              var oldFileName = $(this).attr('oldName');
              var lblOldFileName = oldFileName + $('#fileExt_' + fileID).html();
              $('#newFileName_' + fileID).hide();
              $('#txtNewFileName_' + fileID).val(oldFileName);
              $('#oldFileName_' + fileID)
                .show()
                .html(lblOldFileName)
                .attr('title', lblOldFileName);
              $('#uploadCompleteOp_' + fileID).show();

              var index = _.findIndex(options.attachmentData, function (item) {
                return item.fileID == fileID;
              });
              // 处于非编辑状态
              options.attachmentData[index].inEdit = false;
            });

            // 是否允许下载
            $('#docItem_' + fileID + ' .docDownload').on('click', function (event) {
              fileID = $(this).attr('fileID');
              var oldIcon = $(this);
              var clone = $(this).clone(true);
              var allowDown = true;
              if (oldIcon.hasClass('icon-kc-download')) {
                clone
                  .removeClass('icon-kc-download')
                  .removeClass('ThemeColor4')
                  .addClass('Gray_c')
                  .addClass('icon-kc-disable-download')
                  .attr('title', _l('只允许在线浏览'));
                allowDown = false;
              } else {
                clone
                  .removeClass('icon-kc-disable-download')
                  .removeClass('Gray_c')
                  .addClass('ThemeColor4')
                  .addClass('icon-kc-download')
                  .attr('title', _l('允许下载'));
                allowDown = true;
              }
              oldIcon.after(clone);
              oldIcon.remove();

              var index = _.findIndex(options.attachmentData, function (item) {
                return item.fileID == fileID;
              });
              options.attachmentData[index].allowDown = allowDown;
              if (options.callback) {
                options.callback.call(
                  this,
                  options.showKcAttachmentEntry
                    ? {
                        attachmentData: options.attachmentData,
                        kcAttachmentData: options.kcAttachmentData,
                      }
                    : options.attachmentData,
                );
              }

              event.stopPropagation();
            });

            // 删除文档
            $('#docItem_' + fileID + ' .docDelete').on('click', function () {
              fileID = $(this).attr('fileID');
              _this.removeFile('#docItem_' + fileID, fileID);
            });
          } else {
            $('#docUploadStatus_' + fileID).html(
              _this.formatFileSize(fileSize) + "<span class='Gray_c mLeft10'>" + _l('文件已删除') + '</span>',
            );
          }
        }
      }
      var $el = _this.findAttachmentList();
      if (
        $el.find('.uploadDocList .docItem, .uploadPicList .picItem').length > 0 &&
        $el.find('.kcFileList .kcDocItem').length > 0
      ) {
        $el.find('.updaterAttachmentSplitter').show();
      } else {
        $el.find('.updaterAttachmentSplitter').hide();
      }
      if (options.callback) {
        options.callback.call(
          this,
          options.showKcAttachmentEntry
            ? {
                attachmentData: options.attachmentData,
                kcAttachmentData: options.kcAttachmentData,
              }
            : options.attachmentData,
          _this.getAttachmentTotalSize(),
        );
      }
      if (options.isUploadComplete) {
        options.isUploadComplete.call(this, _this.isUploadComplete());
      }
    };
    // 文件上传失败
    _this.uploadFailed = function (file) {
      if (File.isPicture('.' + File.GetExt(file.name))) {
        var picViewHtml = `
        <div id="pic_${file.id}" class="TxtCenter">
        <div class="Red" style="line-height:90px;">${_l('图片上传失败')}</div>
        <a class="ThemeColor4 picDelete" fileID="${file.id}" title="${_l('删除')}" href="javascript:;">×</a>
        </div>
        `;
        $('#picItem_' + file.id).html(picViewHtml);

        // 删除图片
        $('#picItem_' + file.id + ' .picDelete').on('click', function () {
          var fileID = $(this).attr('fileID');
          _this.removeFile('#picItem_' + fileID, fileID);
        });
      } else {
        $('#docItem_' + file.id)
          .find('.uploadDocTag')
          .addClass('uploadFail');
        $('#docUploadStatus_' + file.id).html("<span class='Red'>" + _l('文档上传失败') + '</span>');
        $('#uploadCompleteOp_' + file.id)
          .removeClass('Right')
          .addClass('Left');
        // 删除操作
        var opHtml = `
        <div class='InlineBlock'>
        <span class='ThemeColor4 Font16 mLeft10 Hand docDelete Bold' title='${_l('删除')}' fileID='${file.id}'>×</span>
        </div>
        `;
        $('#uploadCompleteOp_' + file.id).html(opHtml);

        // 删除文档
        $('#docItem_' + file.id + ' .docDelete').on('click', function () {
          var fileID = $(this).attr('fileID');
          _this.removeFile('#docItem_' + fileID, fileID);
        });
      }
    };
    // 移除文件
    _this.removeFile = function (containerID, fileID) {
      _.remove(options.attachmentData, obj => obj.fileID === fileID);

      if (options.currentFile) {
        var tempFile = { id: fileID };
        // 获取当前文档
        var currentFile = options.currentFile.getFile(fileID);
        // 如果文件正在上传，先停止当前文件上传
        if (currentFile && currentFile.status == 2) {
          options.currentFile.stop();
        }
        // 从上传的文件列表中移除
        options.currentFile.removeFile(tempFile);
      }
      var $el = _this.findContainer();
      $(containerID).fadeOut('1000', function () {
        $(containerID).remove();
        if (
          options.attachmentData.length == 0 &&
          $el.find('.uploadDocList .docItem').length == 0 &&
          $el.find('.uploadPicList .picItem').length == 0 &&
          $el.find('.kcFileList .kcDocItem').length == 0
        ) {
          _this.clear();
        }
        if (
          $el.find('.uploadDocList .docItem, .uploadPicList .picItem').length > 0 &&
          $el.find('.kcAttachmentList .kcDocItem').length > 0
        ) {
          $el.find('.updaterAttachmentSplitter').show();
        } else {
          $el.find('.updaterAttachmentSplitter').hide();
        }
      });

      if (options.callback) {
        options.callback.call(
          this,
          options.showKcAttachmentEntry
            ? {
                attachmentData: options.attachmentData,
                kcAttachmentData: options.kcAttachmentData,
              }
            : options.attachmentData,
          _this.getAttachmentTotalSize(),
        );
      }
      if (options.isUploadComplete) {
        options.isUploadComplete.call(this, _this.isUploadComplete());
      }
    };
    // 文档上传进度
    _this.createDocProgressBar = function (file) {
      var sb = `
      <div class='docItem'  id='docItem_${file.id}'>
      <div class='progress'>
      <div class='Left'>
      <span class='fileIcon ${htmlEncodeReg(getClassNameByExt(file.name))}'></span>
      <span class='uploadDocTag'></span></div>
      <div class='Left docMessage'>
      <div class='TxtLeft'>
      <span class='overflow_ellipsis titleLimitWidth TxtTop Left'
      id='oldFileName_${file.id}'
      title='${htmlEncodeReg(file.name)}'>
      ${htmlEncodeReg(file.name)}
      </span><span id='uploadCompleteOp_${file.id}' class='Right'></span>
      <div class='Clear'></div>
      </div>
      <div class='TxtLeft' id='docUploadStatus_${file.id}'>
      <div class='progressPanel mTop7 Left' id='file_${file.id}'>
      <div class='progressbar'></div>
      </div>
      <div class='speedProgress mLeft5'>
      <span class='Hidden' id='complete_${file.id}'>0%</span>
      <span class='progressBefore'>${_l('排队中')}</span>
      <a href='javascript:;' class='mLeft10 ThemeColor4'
      id='cancelUpload_${file.id}' type='doc' fileID='${file.id}'>
      ${_l('取消')}</a></div>
      <div class='Clear'></div>
      </div>
      </div>
      <div class='Clear'></div>
      </div>
      </div>
      `;
      return sb;
    };
    // 图片上传进度
    _this.createPicProgressBar = function (file) {
      var sb = `
      <div id='picItem_${file.id}' class='picItem ThemeBorderColor4'>
      <div class='progressImg'>
      <div>
      <div class='progressPanel mTop7 mBottom10 Left' id='file_${file.id}'>
      <div class='progressbar'></div>
      </div>
      <div class='imgQueuing Right'><span class='Hidden' id='complete_${file.id}'>0%</span>
      <span class='progressBefore'>${_l('排队中')}</span></div>
      <div class='Clear'></div>
      </div>
      <div>
      <a class='imgCancel' href='javascript:;' id='cancelUpload_${file.id}' type='pic' fileID='${
        file.id
      }' class='ThemeColor4'>
      ${_l('取消')}</a>
      </div>
      </div>
      `;
      return sb;
    };
    // 文件大小格式化
    _this.formatFileSize = function (size) {
      var byteSize = Math.round((size / 1024) * 100) / 100;
      var suffix = 'KB';
      if (byteSize > 1024) {
        byteSize = Math.round((byteSize / 1024) * 100) / 100;
        suffix = 'MB';
      }
      return byteSize + suffix;
    };
    _this.formatNumber = function (src, pos) {
      return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
    };
    // 获取附件总大小
    _this.getAttachmentTotalSize = function () {
      var totalSize = 0;
      for (var i = 0; i < options.attachmentData.length; i++) {
        var attachmentItem = options.attachmentData[i];
        totalSize += parseInt(attachmentItem.fileSize, 10);
      }
      totalSize = _this.formatNumber(totalSize / 1024 / 1024, 2);
      if (options.showKcAttachmentEntry && (totalSize || totalSize == 0)) {
        var $con = _this.findContainer();
        $con.find('.currentUploadSize').html(totalSize + 'M');
        var currentPrograss = _this.formatNumber((totalSize / 1024 / 1024 / 1000) * 100, 2);
        // 当前上传总量百分比
        $con
          .find('#Attachment_updater .currentPrograss')
          .width((totalSize > 0 && currentPrograss < 10 ? 10 : currentPrograss) + '%');
      }
      return totalSize;
    };
    // 获取当前所有文件上传的状态 是否有正在上传和排队中的文件
    _this.isUploadComplete = function () {
      if (options.currentFile) {
        return !options.currentFile.files.some(function (item) {
          return item.status == 1 || item.status == 2;
        });
      }
      return true;
    };
    // 对上传成功后返回的数据格式化
    _this.formatResponseData = function (file, response) {
      var item = {};
      item.fileID = file.id;
      item.fileSize = file.size || 0;
      var fileResultArray = response.split('|');
      if (fileResultArray.length == 5) {
        var serverName = fileResultArray[0];
        var filePath = fileResultArray[1];
        var fileName = fileResultArray[2];
        var fileExt = fileResultArray[3];
        var originalFileName = fileResultArray[4];

        item.serverName = serverName;
        item.filePath = filePath;
        item.fileName = fileName;
        item.fileExt = fileExt;
        item.originalFileName = originalFileName;

        if (!File.isPicture(fileExt)) {
          item.allowDown = true;
          item.docVersionID = '';
          item.oldOriginalFileName = originalFileName; // 临时存储文件名 编辑的时候比较
        }
      } else {
        var data = JSON.parse(response);
        item.serverName = data.serverName;
        item.filePath = data.filePath;
        item.fileName = data.fileName;
        item.fileExt = data.fileExt;
        item.originalFileName = data.originalFileName;
        item.key = data.key;
        if (!File.isPicture(item.fileExt)) {
          item.allowDown = true;
          item.docVersionID = '';
          item.oldOriginalFileName = item.originalFileName; // 临时存储文件名 编辑的时候比较
        }
      }
      item.url = file.url;
      options.attachmentData.push(item);
      return item;
    };

    _this.getHashCode = function (str) {
      str = str + '';
      var h = 0;
      var off = 0;
      var len = str.length;

      for (var i = 0; i < len; i++) {
        h = 31 * h + str.charCodeAt(off++);
        if (h > 0x7fffffff || h < 0x80000000) {
          h = h & 0xffffffff;
        }
      }
      return h;
    };
    _this.getRandStr = function (length) {
      var randStrArr = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
      ];

      var randArr = [];
      for (var i = 0; i < length; i++) {
        randArr.push(randStrArr[Math.floor(Math.random() * randStrArr.length)]);
      }

      return randArr.join('');
    };

    _this.enter = function () {
      // 切换toggle 待删
      // if (options.showKcAttachmentEntry) {
      //   var $con = $(el).next('.uploadAttaachmentsContainer');
      //   var $toggleBtn = $(options.pluploadID);
      //   $toggleBtn.off().on('click', function () {
      //     if (!$con.length) {
      //       _this.init();
      //       $con = $(el).next('.uploadAttaachmentsContainer');
      //     }
      //     $con.toggleClass('hide');
      //     _this.clear();
      //   });
      // } else {
      _this.init();
      // }
    };
    _this.enter();

    var extend = {
      clearAttachment: function () {
        _this.clear();
      },
      unmount: function () {
        _this.findContainer().remove();
        options.pluploadObj.destroy();
        $(options.controlBtn).off('click.controlBtn');
      },
      getPluploadObj: function () {
        return options.pluploadObj;
      },
    };

    return extend;
  }

  $.fn.uploadAttachment = function (param) {
    return new UploadAttachment(this, param);
  };
})(jQuery);
