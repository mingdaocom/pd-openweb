var _ = require('lodash');
var qs = require('querystring');
var doT = require('dot');
var previewAttachments = require('previewAttachments');
var FROM_TYPE = require('attachmentsPreview.enum').FROM_TYPE;
var attachmentTpl = doT.template(require('./tpl/attachment.htm'));
var picAttachmentTpl = doT.template(require('./tpl/picAttachment.htm'));
var MAX_IMG_VIEW_SIZE = 20971520;
import { cutStringWithHtml, formatFileSize, addToken, getClassNameByExt, htmlEncodeReg } from 'src/util';

import './css/attachmentPlayer.less';

var NODE_TYPE = {
  QINIU: 0,
  COMMON: 1,
  KC: 2,
};
var AttachmentPlayer = {
  preview: function (_this) {
    var $this = $(_this);
    var $list = $this.parents('.attachmentsList');
    var settings = $list.data('settings');
    if (!settings) return;
    if ($this.data('isdelete')) return;
    settings.bindData = false;
    var attachments = settings.attachments;
    var sourceID = settings.sourceID;
    var commentID = settings.commentID;
    var strType = settings.type;
    var reCreateThumb = function (newAttachments) {
      var $newList;
      settings.attachments = newAttachments;
      $newList = AttachmentPlayer.getThumbElement(
        Object.assign(settings, {
          bindData: true,
          forceBindData: true,
        }),
      );
      $list.replaceWith($newList);
      $list = $newList;
    };
    var extra = {
      scope: settings.scope,
      downloadParams: settings.downloadParams,
      element: $this,
      // 从页面删除或改成次新版本
      deleteCallback: function deleteCallback(docVersionID, fileID, removeFromKC, newAttachments) {
        reCreateThumb(newAttachments);
      },
      // 页面上改名
      renameCallback: function renameCallback(newAttachment, newAttachments) {
        reCreateThumb(newAttachments);
      },
      // 页面上改成最新版本
      newVersionCallback: function newVersionCallback(attachment, share, newAttachments) {
        reCreateThumb(newAttachments);
      },
    };
    var fromType;
    fromType = typeof strType === 'number' ? strType : FROM_TYPE[strType.toUpperCase()];

    // 动态中文件详情传值
    var postDetails = '';
    if (fromType == FROM_TYPE.POST || fromType == FROM_TYPE.COMMENT) {
      if (commentID) {
        postDetails = $this
          .closest('#CommentItem_' + settings.sourceID + '_' + settings.commentID)
          .find('.commentContentItem')
          .html();
      } else {
        // 兼容动态置顶后直接获取详情
        postDetails = $this
          .closest('.attachmentsList')
          .parent()
          .siblings()
          .filter('.updaterContent')
          .find('#lblUpdaterMessage_' + settings.sourceID)
          .html();
      }
      // 兼容 “提到我的” 有附件直接获取详情
      if (!postDetails) {
        postDetails = $this.closest('.attachmentsList').next().find('.textprevmsg').html();
      }

      if (postDetails) {
        if (postDetails.replace(cutStringWithHtml(postDetails, 200, 5), '').length > 0) {
          postDetails = cutStringWithHtml(postDetails, 200, 5) + '...';
        } else {
          postDetails = cutStringWithHtml(postDetails, 200, 5);
        }
      }
    }
    // 从页面获取附件的详情添加到扩展参数
    extra.postDetails = postDetails;
    var index;
    settings.attachments.sort((a, b) => parseInt(a.attachmentType) > parseInt(b.attachmentType));
    settings.attachments.forEach(function (attachment, i) {
      if (attachment.docVersionID === $this.data('docversionid')) {
        index = i;
        return;
      }
    });
    attachments = attachments.filter(attachment => !(attachment.refId && attachment.attachmentType === 5));
    previewAttachments(
      {
        callFrom: 'player',
        index: index,
        attachments: attachments,
        sourceID: sourceID,
        fromType: fromType,
        commentID: commentID,
        docversionid: $this.data('docversionid'),
        showThumbnail: true,
        showAttInfo: typeof settings.showAttInfo === 'undefined' ? true : settings.showAttInfo,
        hideFunctions: settings.hideFunctions || [],
      },
      extra,
    );
  },
  GetThumbHtml: function (param) {
    var settings = _.assign(
      {
        bindData: true, // 是否把 attachments 对象加到 attachmentsList 的 data-attachments 属性中
        attachments: [],
        type: 'post', // post|comment|task|folder|calendar
        sourceID: '', // postid|taskid|folderid|calendarid
        commentID: '', // postcommentid|topicid
        scope: undefined, // 分享到的群组范围
        lineCount: 2, // 每行显示个数
        downloadParams: undefined, // 下载页面额外参数，用于知识门户
        showAttInfo: true, // 预览层显示详情侧栏
      },
      param,
    );
    var attachClass;
    var contentStr = '';
    if (settings.type === 'comment') {
      attachClass = 'uploadedCommentAttachmentList';
    }
    if (settings.attachments.length > 0) {
      var docAttachments = _.filter(settings.attachments, function (attachment) {
        return attachment.attachmentType != '1';
      });
      var picAttachments = _.filter(settings.attachments, function (attachment) {
        return attachment.attachmentType == '1';
      });

      contentStr += AttachmentPlayer.wrapList(
        picAttachments
          .map(function (attachment) {
            var isDelete = !attachment.shareUrl && !!attachment.refId;
            if (settings.bindData && !isDelete && typeof $ === 'function' && document) {
              $(document).off('click', '#picAttachment_' + attachment.fileID);
              $(document).on('click', '#picAttachment_' + attachment.fileID, function () {
                AttachmentPlayer.preview(this);
              });
            }
            var downloadParams = qs.stringify(settings.downloadParams);
            var downDocumentUrl =
              md.global.Config.AjaxApiUrl +
              'file/downDocument?fileID=' +
              attachment.fileID +
              (downloadParams ? '&' + downloadParams : '');
            return attachment.refId && !attachment.shareUrl
              ? attachmentTpl(
                  _.assign({}, attachment, {
                    sizeStr: formatFileSize(attachment.filesize),
                    iconClassName: getClassNameByExt(attachment.ext),
                    downloadParams,
                    downDocumentUrl: addToken(downDocumentUrl),
                  }),
                )
              : picAttachmentTpl(
                  _.assign({}, attachment, {
                    MAX_IMG_VIEW_SIZE: MAX_IMG_VIEW_SIZE,
                  }),
                );
          })
          .join(''),
        'picList',
      );

      contentStr += AttachmentPlayer.wrapList(
        docAttachments
          .map(function (attachment) {
            var isDelete = !attachment.shareUrl && !!attachment.refId;
            if (settings.bindData && !isDelete && typeof $ === 'function' && document) {
              $(document).off('click', '#commonAttachment_' + attachment.fileID);
              $(document).on('click', '#commonAttachment_' + attachment.fileID, function () {
                if (attachment.refId && attachment.attachmentType === 5) {
                  window.open(attachment.shareUrl);
                  return;
                }
                AttachmentPlayer.preview(this);
              });
            }

            var isKcFolder = attachment.refId && attachment.attachmentType === 5;
            var iconClassName = isKcFolder ? 'fileIcon-folder' : getClassNameByExt(attachment.ext);
            var downloadParams = qs.stringify(settings.downloadParams);
            var downDocumentUrl =
              md.global.Config.AjaxApiUrl +
              'file/downDocument?fileID=' +
              attachment.fileID +
              (downloadParams ? '&' + downloadParams : '');
            return attachmentTpl(
              _.assign({}, attachment, {
                sizeStr: formatFileSize(attachment.filesize),
                iconClassName: iconClassName,
                downloadParams,
                isKcFolder: isKcFolder,
                downDocumentUrl: addToken(downDocumentUrl),
              }),
            );
          })
          .join(''),
        'docList',
      );
    }
    $(document)
      .off('click.commonAttachment.hideList')
      .on('click.commonAttachment.hideList', function (e) {
        if ($(e.target).closest('.operateList').length === 0) {
          $('.attachmentsList .commonAttachment .operateList').addClass('hide');
        }
        e.stopPropagation();
      });
    if (settings.bindData) {
      AttachmentPlayer.bindListEvent($(document));
      $(document)
        .off('click.commonAttachment.toggleList')
        .on('click.commonAttachment.toggleList', '.commonAttachment .btnMore', function (e) {
          $('.attachmentsList .commonAttachment .operateList').addClass('hide');
          $(this).parent().find('.operateList').removeClass('hide');
          e.stopPropagation();
        });
      $(document)
        .off('click.attachmentStopPropagation')
        .on('click.attachmentStopPropagation', '.attachmentsList .commonAttachment .download', function (e) {
          e.stopPropagation();
        });
    }
    return AttachmentPlayer.wrapAttachmentsList(contentStr, settings, attachClass);
  },
  /** 根据参数生成显示附件，返回 jQuery 对象并绑定预览弹层*/
  getThumbElement: function (param) {
    var settings = $.extend(
      {
        attachments: [],
        type: 'post', // 'post'|'comment'|'task' or 1|2|3
        sourceID: '', // postid|taskid
        commentID: '', // postcommentid|taskreplyid
        scope: undefined, // 动态专用，分享到的群组ID
        lineCount: 2, // 每行显示个数
        extra: {}, // 预览层的额外参数
        forceBindData: false,
      },
      param,
    );
    if (!settings.forceBindData) {
      settings.bindData = false;
    }
    var attachmentPlayer = this;
    var $obj = $(attachmentPlayer.GetThumbHtml(settings));
    if (settings.attachments && settings.attachments.length > 0) {
      var extra = $.extend({}, settings.extra, {
        scope: settings.scope,
        downloadParams: settings.downloadParams,
        /**  */
        deleteCallback: function (docVersionID, fileID, removeFromKC, attachments) {
          settings.attachments = attachments;
          $obj.html('').append($(attachmentPlayer.GetThumbHtml(settings)).children());
          if (typeof settings.extra.deleteCallback === 'function') {
            settings.extra.deleteCallback(docVersionID, fileID, removeFromKC, attachments);
          }
        },
        /** 页面上改名 */
        renameCallback: function (newAttachment, attachments) {
          settings.attachments = attachments;
          $obj.html('').append($(attachmentPlayer.GetThumbHtml(settings)).children());
          if (typeof settings.extra.renameCallback === 'function') {
            settings.extra.renameCallback(newAttachment, attachments);
          }
        },
        /** 页面上改成最新版本 */
        newVersionCallback: function (attachment, share, attachments) {
          settings.attachments = attachments;
          $obj.html('').append($(attachmentPlayer.GetThumbHtml(settings)).children());
          if (typeof settings.extra.newVersionCallback === 'function') {
            settings.extra.newVersionCallback(attachment, share, attachments);
          }
        },
      });
      AttachmentPlayer.bindListEvent($obj);
      $obj
        .off('click.commonAttachment.toggleList')
        .on('click.commonAttachment.toggleList', '.commonAttachment .btnMore', function (e) {
          $('.attachmentsList .commonAttachment .operateList').addClass('hide');
          $(this).parent().find('.operateList').removeClass('hide');
          e.stopPropagation();
        });
      $obj.on('click', '.commonAttachment .download', function (e) {
        e.stopPropagation();
      });
      $obj.on('click', '.commonAttachment, .picAttachment', function (e) {
        e.preventDefault();
        var $this = $(this);
        if ($this.is('.docViewBtn')) $this = $this.parents('.docItem');
        else if ($this.is('.kcDocViewBtn')) $this = $this.parents('.kcDocItem');
        if ($this.data('isdelete')) return;
        extra.element = $this;
        var fromType = typeof settings.type === 'number' ? settings.type : FROM_TYPE[settings.type.toUpperCase()];
        var sourceID = settings.sourceID;
        var commentID = settings.commentID;
        // 动态中文件详情传值
        var postDetails = settings.detail || '';
        if (!postDetails && (fromType == FROM_TYPE.POST || fromType == FROM_TYPE.COMMENT)) {
          if (commentID) {
            postDetails = $this
              .closest('#CommentItem_' + settings.sourceID + '_' + settings.commentID)
              .find('.commentContentItem')
              .html();
          } else {
            // postDetails = $this.closest('#UpdaterItem_' + settings.sourceID).find('#lblUpdaterMessage_' + settings.sourceID).html();
            // 兼容动态置顶后直接获取详情
            postDetails = $this
              .closest('.attachmentsList')
              .parent()
              .siblings()
              .filter('.updaterContent')
              .find('#lblUpdaterMessage_' + settings.sourceID)
              .html();
          }
          // 兼容 “提到我的” 有附件直接获取详情
          if (!postDetails) {
            postDetails = $this.closest('.attachmentsList').next().find('.textprevmsg').html();
          }
        }
        if (postDetails) {
          var tempStr = postDetails.replace(cutStringWithHtml(postDetails, 200, 5), '');
          if (tempStr.length > 0) {
            postDetails = cutStringWithHtml(postDetails, 200, 5) + '...';
          } else {
            postDetails = cutStringWithHtml(postDetails, 200, 5);
          }
        }
        // 从页面获取附件的详情添加到扩展参数
        extra.postDetails = postDetails;
        var index;
        var docversionid = $this.data('docversionid');
        settings.attachments.sort((a, b) => parseInt(a.attachmentType) > parseInt(b.attachmentType));
        settings.attachments.forEach(function (attachment, i) {
          if (attachment.docVersionID === docversionid) {
            index = i;
            return;
          }
        });
        var currentAttachment = settings.attachments[index];
        if (currentAttachment.refId && currentAttachment.attachmentType === 5) {
          window.open(currentAttachment.shareUrl);
          return;
        }
        var attachments = settings.attachments;
        attachments = attachments.filter(attachment => !(attachment.refId && attachment.attachmentType === 5));
        var options = {
          callFrom: 'player',
          index: index,
          attachments: attachments,
          sourceID: sourceID,
          commentID: commentID,
          fromType: fromType,
          docversionid: $this.data('docversionid'),
          showThumbnail: true,
          showAttInfo: typeof settings.showAttInfo === 'undefined' ? true : settings.showAttInfo,
          hideFunctions: settings.hideFunctions || [],
        };
        previewAttachments(options, extra);
      });
    }
    return $obj;
  },
  bindListEvent: function ($target) {
    $target
      .off('click.attachmentOperateEvent')
      .on('click.attachmentOperateEvent', '.commonAttachment .operateList li', function (e) {
        var $li = $(this);
        var type = parseInt($li.data('type'), 10);
        var $commonAttachment = $li.closest('.commonAttachment');
        var noPermission;
        var fileId = $commonAttachment.data('fileid');
        var refId = $commonAttachment.data('refid');
        var allowDown = $commonAttachment.data('allowdown');
        var accountId = $commonAttachment.data('upaccountid');
        var isKcFolder = !!$commonAttachment.data('iskcfolder');
        var downloadUrl = $commonAttachment.data('downloadurl');
        var downloadParams = $commonAttachment.data('downloadparams');
        if (!$commonAttachment.length) {
          return;
        }
        switch (type) {
          case 0:
            var ATTACHMENT_TYPE = {
              qiniu: 0,
              common: 1,
              kc: 2,
            };
            var attachmentType = refId ? 2 : 1;
            if (!refId) {
              noPermission = !allowDown && accountId !== md.global.Account.accountId;
            }
            if (noPermission) {
              alert(_l('您权限不足，无法分享，请联系管理员或文件上传者'), 3);
              e.stopPropagation();
              return;
            }
            import('src/components/shareAttachment/shareAttachment').then(function (share) {
              window.shareDialogObject = share.default({
                attachmentType: attachmentType,
                id: attachmentType === 1 ? fileId : refId,
                name: $commonAttachment.data('originalfilename'),
                ext: $commonAttachment.data('ext'),
                size: $commonAttachment.data('filesize'),
                isKcFolder: isKcFolder,
              });
            });
            break;
          case 1:
            if (refId) {
              noPermission = !allowDown && accountId !== md.global.Account.accountId;
            } else {
              noPermission = !allowDown && accountId !== md.global.Account.accountId;
            }
            if (noPermission) {
              alert(_l('您权限不足，无法下载或保存，请联系管理员或文件上传者'), 3);
              e.stopPropagation();
              return;
            }
            if (refId) {
              AttachmentPlayer.saveToKc(NODE_TYPE.KC, refId, allowDown, isKcFolder);
            } else {
              AttachmentPlayer.saveToKc(NODE_TYPE.COMMON, fileId, allowDown);
            }
            break;
          case 2:
            window.open(addToken(downloadUrl + (downloadParams ? '&' + downloadParams : '')));
            break;
        }
        $('.attachmentsList .commonAttachment .operateList').addClass('hide');
        e.stopPropagation();
      });
  },
  saveToKc: function (nodeType, id, allowDown, isKcFolder) {
    require(['src/components/saveToKnowledge/saveToKnowledge'], saveToKnowledge => {
      var sourceData = {};
      sourceData[nodeType === NODE_TYPE.COMMON ? 'fileID' : 'nodeId'] = id;
      if (nodeType === NODE_TYPE.COMMON) {
        sourceData.allowDown = !!allowDown;
      }
      require(['src/components/kc/folderSelectDialog/folderSelectDialog'], folderDg => {
        folderDg({
          dialogTitle: _l('保存到'),
          isFolderNode: 1,
          selectedItems: null,
          zIndex: 9999,
        })
          .then(result => {
            saveToKnowledge(nodeType, sourceData)
              .save(result)
              .then(function (message) {
                // alert(message || '保存成功');
              })
              .fail(function (message) {
                alert(message || _l('保存失败'), 3);
              });
          })
          .fail(() => {
            // alert('保存失败，未能成功调出知识文件选择层');
          });
      });
    });
  },
  wrapAttachmentsList: function (contentStr, settings, className) {
    return (
      '<div class="attachmentsList ' +
      className +
      '" ' +
      (settings.bindData
        ? ' data-settings="' + htmlEncodeReg(JSON.stringify(settings)).replace("'", "\\'") + '"'
        : ' ') +
      '>' +
      contentStr +
      '</div>'
    );
  },
  wrapList: function (contentStr, className) {
    return '<div class="' + (className || '') + '">' + contentStr + '<div class="Clear"></div></div>';
  },
};
module.exports = AttachmentPlayer;
