import { getClassNameByExt, htmlEncodeReg } from 'src/util';
import 'src/components/autoTextarea/autoTextarea';
import 'src/components/mentioninput/mentionsInput';
import 'src/components/uploadAttachment/uploadAttachment';
import LinkView from 'src/components/linkView/linkView';
import VoteUpdater from 'src/components/voteUpdater/voteUpdater';
import kcAjax from 'src/api/kc';
import selectNode from 'src/components/kc/folderSelectDialog/folderSelectDialog';
import postAjax from 'src/api/post';
import { Dialog } from 'ming-ui';
import React from 'react';
import RegExpValidator from 'src/util/expression';
var langUploadFiles = _l('上传附件') + '...';
var langShareLink = _l('分享网站') + '...';
var langVoteQuestion = _l('请输入投票问题') + '...';

var MyUpdater = {
  options: {
    thumbImgs: '',
    linkViewData: null, // 链接预览数据
    updaterInputAreaFocus: false,
    attachmentData: [], // 上传的文件，不包括知识中心的文件
    kcAttachmentData: [],
    uploadObj: null,
    projectId: '',
  },

  addPost: false,

  Init: function (settings) {
    $.extend(this.options, settings);

    this.bindUploadEvent();

    this.BindEvent();
  },
  formatNumber: function (src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
  },
  bindUploadEvent: function () {
    MyUpdater.options.uploadObj = $('#hidUpdaterUpload').uploadAttachment({
      pluploadID: '#uploadMoreAttachment',
      dropPasteElement: 'textarea_Updater',
      callback: function (attachments, totalSize, isUploadComplete) {
        if ($('#hidden_UpdaterType').val() != '9') {
          return;
        }
        MyUpdater.options.attachmentData = attachments;
        if (MyUpdater.options.attachmentData.length > 0) {
          var $textareaUpdater = $('#textarea_Updater');
          if (!$textareaUpdater.val().trim() || $textareaUpdater.val() == langUploadFiles) {
            $textareaUpdater.val(MyUpdater.options.attachmentData[0].originalFileName).removeClass('Gray_a').focus();
          }
        } else {
          if (!$('#Attachment_updater').find('.kcAttachmentList').children().length > 0) {
            $('#Div_JoinKnowledge').hide();
          }
        }
        if (totalSize || totalSize == 0) {
          $('#currentUploadSize').html(totalSize + 'M');
          var currentPrograss = this.formatNumber((totalSize / 1024 / 1024 / 1000) * 100, 2);
          // 当前上传总量百分比
          $('#Attachment_updater .currentPrograss').width(
            (totalSize > 0 && currentPrograss < 10 ? 10 : currentPrograss) + '%',
          );
        }
      },
      beforeUpload: function (up, file) {
        if ($('#Attachment_updater').is(':hidden') && $('#hidden_UpdaterType').val() == '0') {
          $('#hidden_UpdaterType').val('9');
          $('[targetDiv=#Attachment_updater]').removeClass('Gray_c').addClass('ThemeColor3');
          $('#Attachment_updater').show();
        }
      },
      filesAdded: function (up, files) {
        if ($('#Attachment_updater').find('.attachmentList').find('.docItem,.picItem').length + files.length > 10) {
          alert(_l('附件数量超过限制，一次上传不得超过10个附件'), 3);
          return false;
        }

        var postType = $('#hidden_UpdaterType').val();
        if (postType !== '2' && postType !== '3' && postType !== '9') {
          // MyUpdater.ResetUpdaterDiv();
          return;
        }
        /*
        $('#Attachment_updater')
          .find('.addAttachmentToKc').show()
          .end()
          .find('#hidUpdaterUpload')
          .nextAll('.updaterAttachmentSplitter')
          .first()
          .show();
          */
      },
      isUploadComplete: function (isUploadComplete) {
        // 所有文件上传进度
        MyUpdater.options.uploadObj.isUploadComplete = isUploadComplete;
      },
    });

    $('#uploadAttachment').on('mousedown', function () {
      MyUpdater.ResetUpdaterDiv();
    });

    $('#addAttachmentToKcToggle').on('change', function (e) {
      if ($(this).prop('checked')) {
        if (!$('#addAttachmentToKcLink').data('type')) {
          $(this).prop('checked', false);
          $('#addAttachmentToKcLink').click();
          e.preventDefault();
        } else {
          $('#addAttachmentToKcLink > .kcNodePath').removeClass('Gray_a').addClass('ThemeColor3').off('click');
        }
      } else {
        $('#addAttachmentToKcLink > .kcNodePath')
          .addClass('Gray_a')
          .removeClass('ThemeColor3')
          .click(function (e) {
            e.preventDefault();
            e.stopPropagation();
          });
      }
    });

    $('#addAttachmentToKcLink').on('click', function () {
      var $this = $(this);
      selectNode({
        isFolderNode: 1,
        reRootName: true,
        dialogTitle: _l('选择路径'),
      })
        .then(function (result) {
          if (!result || !result.node) {
            return Promise.reject();
          }
          $this.data('type', result.type);
          $this.data('node', result.node);
          var path = result.type === 3 ? result.rootName || '' : result.node.name;
          path += '/';
          if (result.type == 3) {
            var position = result.node.position;
            var positionArr = position.split('/');
            var isOmit = false;
            positionArr.forEach(function (part, i) {
              if (i > 1) {
                if (i > positionArr.length - 4) {
                  var partStr = part.length > 10 ? part.substring(0, 10) + '...' : part;
                  path += partStr + '/';
                } else {
                  if (!isOmit) {
                    path += '.../';
                    isOmit = true;
                  }
                }
              }
            });
          }
          $this.html(
            '<span>' + _l('本地文件存入知识中心:') + '</span><span class="mLeft15 kcNodePath">' + path + '</span>',
          ); // TODO: position
          $('#addAttachmentToKcToggle').prop('checked', true);
        })
        .catch(function () {
          // alert("选择路径失败，请重新选择", 2);
        })
        .finally(function () {
          if (!$this.data('type')) {
            $('#addAttachmentToKcToggle').prop('checked', false);
          }
        });
    });

    $('#kcAttachment').on('click', function () {
      selectNode({
        isFolderNode: 2,
      }).then(function (result) {
        if (!result || !result.node || !result.node.length) {
          alert(_l('未选择文件'), 3);
        }
        if ($('#Attachment_updater').find('.kcAttachmentList').children().length + result.node.length > 10) {
          alert(_l('附件数量超过限制，一次上传不得超过10个附件'), 3);
          return false;
        }

        var nodes = [];
        var hasAlreadyAdded = false;
        for (var i = 0; i < result.node.length; i++) {
          if ($('#Attachment_updater .kcAttachmentList [data-node-id=' + result.node[i].id + ']').length) {
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

        var $textareaUpdater = $('#textarea_Updater');
        if (!$textareaUpdater.val().trim() || $textareaUpdater.val() == langUploadFiles) {
          $textareaUpdater.val(result.node[0].name).removeClass('Gray_a').focus();
        }
        var html = '';
        result.node.forEach(function (node) {
          MyUpdater.options.kcAttachmentData.push({
            refId: node.id,
            // filePath: node.filePath,
            originalFileName: node.name,
            fileExt: node.ext ? '.' + node.ext : '',
            fileSize: node.size,
            allowDown: node.isDownloadable,
            viewUrl: RegExpValidator.fileIsPicture('.' + node.ext) ? node.viewUrl : null,
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
          if (RegExpValidator.fileIsPicture('.' + node.ext)) {
            html +=
              "<div class='Left nodeIconContainer nodeImg'><img src='" +
              node.previewUrl +
              "' alt='" +
              htmlEncodeReg(node.ext) +
              "' /></div>";
          } else {
            html +=
              "<div class='Left nodeIconContainer nodeDoc'><span class='nodeIcon " +
              getClassNameByExt(node.ext) +
              "'></span></div>";
          }
          html += "<div class='Left docMessage'>";
          html += "<div class='TxtLeft'>";
          html +=
            "<span class='overflow_ellipsis titleLimitWidth TxtTop Left' title='" +
            htmlEncodeReg(node.name + (node.ext ? '.' + node.ext : '')) +
            "'>" +
            htmlEncodeReg(node.name + (node.ext ? '.' + node.ext : '')) +
            "</span><span class='Right ThemeColor4 Font16 mLeft10 Hand docDelete Bold' title='删除'>×</span><div class='Clear'></div>";
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

        $('#Attachment_updater .kcAttachmentList').append(html);
      });
    });

    $('#Attachment_updater .kcAttachmentList').on('click', '.docDelete', function () {
      $(this)
        .closest('.kcDocItem')
        .fadeOut(300, function () {
          var nodeID = $(this).data('nodeId');
          MyUpdater.options.kcAttachmentData.forEach(function (kcItem, i) {
            if (kcItem.refId == nodeID) {
              MyUpdater.options.kcAttachmentData.splice(i, 1);
            }
          });
          $(this).remove();

          var kcAttachmentLength = $('#Attachment_updater').find('.kcAttachmentList').children().length;
          if (!kcAttachmentLength) {
            // $('#Attachment_updater .kcAttachmentList').nextAll('.updaterAttachmentSplitter').first().hide();
          }
          if (!$('#Attachment_updater .attachmentList ').find('.docItem,.picItem').length > 0) {
            $('#Div_JoinKnowledge').hide();
          }
        });
    });
  },
  // 绑定事件
  BindEvent: function () {
    // 用于动态更新框 Updater切换Type
    $('.myUpdateItem_Content a[targetDiv]')
      .off()
      .on('click', function () {
        var targetDivID = $(this).attr('targetDiv');
        // $('#Div_JoinKnowledge').hide();
        // 附件
        if (targetDivID == '#Attachment_updater') {
          if (MyUpdater.options.attachmentData.length == 0 && $('#Attachment_updater').is(':visible')) {
            MyUpdater.ResetUpdaterDiv();
            return;
          } else if ($('#Attachment_updater').is(':visible')) {
            return;
          }
        }

        // 链接
        if (targetDivID == '#Link_updater') {
          if (
            ($('#text_LinkUrl').val().trim() == 'http://' || $('#text_LinkUrl').val().trim() == '') &&
            $('#Link_updater').is(':visible')
          ) {
            MyUpdater.ResetUpdaterDiv();
            return;
          } else if ($('#Link_updater').is(':visible')) {
            return;
          }
        }

        // 投票
        if (
          targetDivID == '#Vote_updater' &&
          $('.voteOptions li').eq(0).find('input').val() == _l('请输入投票项') &&
          $('.voteOptions li').eq(1).find('input').val() == _l('请输入投票项') &&
          $('#Vote_updater').is(':visible')
        ) {
          MyUpdater.ResetUpdaterDiv();
          return;
        } else if (targetDivID == '#Vote_updater' && $('#Vote_updater').is(':visible')) {
          return;
        }

        MyUpdater.ResetUpdaterDiv();
        MyUpdater.options.clearFilesData();

        if (targetDivID == '#Attachment_updater') {
          $('#hidden_UpdaterType').val('9');
          $(this).removeClass('Gray_c').addClass('ThemeColor3');
          if (
            $('#textarea_Updater') &&
            ($('#textarea_Updater').val().trim() == '' ||
              $('#textarea_Updater').val().trim() == _l('知会工作是一种美德') + '...')
          ) {
            $('#textarea_Updater').val(langUploadFiles).addClass('Gray_a');
          }
        } else if (targetDivID == '#Link_updater') {
          $('#hidden_UpdaterType').val('1');
          $(this).removeClass('Gray_c').addClass('ThemeColor3');
          if (
            $('#textarea_Updater') &&
            ($('#textarea_Updater').val().trim() == '' ||
              $('#textarea_Updater').val().trim() == _l('知会工作是一种美德') + '...')
          ) {
            $('#textarea_Updater').val(langShareLink).addClass('Gray_a');
          }
          $('#Link_updater .visualDocTextBox').show();
          $('#text_LinkUrl').on('keydown', function (e) {
            var key = window.event ? e.keyCode : e.which;
            if (key == 13) {
              $(this).parent().next().find("input[type='button']").click();
              return false;
            }
          });
        } else if (targetDivID == '#Vote_updater') {
          $('#voteLastHour').val(new Date().getHours());
          $('#hidden_UpdaterType').val('7');
          $(this).removeClass('Gray_c').addClass('ThemeColor3');
          $('#Vote_updaterOperator').show();
          if (
            $('#textarea_Updater') &&
            ($('#textarea_Updater').val().trim() == '' ||
              $('#textarea_Updater').val().trim() == _l('知会工作是一种美德') + '...')
          ) {
            $('#textarea_Updater').val(langVoteQuestion).addClass('Gray_a');
          }
          VoteUpdater.init($('#Vote_updater'));
        } else {
          $('#hidden_UpdaterType').val('0');
          $('#hidden_FilePath').val('');
          $('#hidden_FileName').val('');
          $('#hidden_FileExt').val('');
          if ($('#textarea_Updater')) {
            if (!$('#textarea_Updater').val().trim()) {
              $('#textarea_Updater').val(_l('知会工作是一种美德') + '...');
              $('#textarea_Updater').addClass('Gray_a');
            }
          }
        }

        if (!$(targetDivID).is(':visible')) {
          $(targetDivID).show(0, function () {
            // MyUpdater.options.uploadObj.getPluploadObj().refresh();
          });
          // 处理Edge 上传按钮大小没有撑开
          if (targetDivID === '#Attachment_updater' && window.isEdge) {
            $(targetDivID)
              .find('.moxie-shim.moxie-shim-html5')
              .css({
                width: $('#uploadMoreAttachment').width(),
                height: $('#uploadMoreAttachment').height(),
              });
          }
        }
        $('#updateCloseContainer').show();
      });
    // 右上角关闭
    $('#updateCloseContainer span.update_close')
      .off()
      .on('click', function () {
        MyUpdater.ResetUpdaterDiv();
        if (!$('#textarea_Updater').val().trim()) {
          $('#textarea_Updater')
            .val(_l('知会工作是一种美德') + '...')
            .addClass('TextArea Gray_a');
        }
      });

    $('#Link_updater .linkTextBox').on({
      blur: function () {
        if (!$(this).val().trim()) {
          $(this).val('http://').addClass('Gray_c');
        }
      },
      focus: function () {
        $(this).removeClass('Gray_c');
      },
    });
    var $textareaUpdater = $('#textarea_Updater');
    var $myUpdateItemContent = $textareaUpdater.closest('.myUpdateItem_Content');

    // 支持高度自适应
    $textareaUpdater
      .autoTextarea({
        maxHeight: 220,
        minHeight: 24,
      })
      .focus(function () {
        var msg = $textareaUpdater.val().trim();
        if (
          msg == _l('知会工作是一种美德') + '...' ||
          msg == langUploadFiles ||
          msg == langShareLink ||
          msg == langVoteQuestion ||
          msg == _l('分享文件') + '...'
        ) {
          $textareaUpdater.val('');
        }
        $textareaUpdater.removeClass('Gray_a');
        MyUpdater.options.updaterInputAreaFocus = true;
        $('#myupdaterOP').slideDown(function () {
          $(this).attr('style', 'display: block');
        });

        $textareaUpdater.autoTextarea({
          maxHeight: 220,
          minHeight: 80,
        });
        // $textareaUpdater.stop().animate({height: 80}, function () {
        //     $textareaUpdater.autoTextarea({
        //         maxHeight: 220,
        //         minHeight: 80
        //     });
        // });
      })
      .blur(function () {
        $textareaUpdater.mentionsInput('store');
        if (!$.trim($(this).val())) {
          $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
        }
      });

    $textareaUpdater.mentionsInput({
      submitBtn: 'button_Share',
      showCategory: true,
      cacheKey: 'updatertext',
    });
    $textareaUpdater.mentionsInput('restore', function (success) {
      if (success) {
        $textareaUpdater.removeClass('Gray_a');
        $('#myupdaterOP').show();
      } else {
        $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
      }
    });

    $(document).click(function (event) {
      if ($('#textarea_Updater').length > 0) {
        var text;
        MyUpdater.options.updaterInputAreaFocus = !(
          !$(event.target).closest(
            '.myUpdateItem,.myUpdateType,.mentions-autocomplete-list,.faceDiv,.plupload,.focusUpdaterCon',
          ).length &&
          /* 非引导点击*/
          !$(event.target).hasClass('guideTry') &&
          /*! $(event.target).hasClass("guidePoshytipQuit") &&*/
          ((text = $('#textarea_Updater').val().trim()) == '' ||
            text == _l('知会工作是一种美德') + '...' ||
            text == langUploadFiles ||
            text == langShareLink ||
            text == langVoteQuestion ||
            text == _l('分享文件') + '...') &&
          !$('#Attachment_updater').is(':visible') &&
          !$('#Link_updater').is(':visible') &&
          !$('#Vote_updater').is(':visible') &&
          !$('#Storage_updater').is(':visible')
        );
        if (!MyUpdater.options.updaterInputAreaFocus) {
          // $textareaUpdater.stop().animate({height: 24}, function () {
          //     $textareaUpdater.autoTextarea({
          //         maxHeight: 220,
          //         minHeight: 24
          //     });
          // });
          $textareaUpdater.autoTextarea({
            maxHeight: 220,
            minHeight: 24,
          });
          $('#myupdaterOP').slideUp();
        }
      }
    });
  },
  // 重置参数
  ResetUpdaterDiv: function () {
    if ($('#textarea_Updater')) {
      var msg = $('#textarea_Updater').val().trim();
      if (
        msg == '' ||
        msg == langUploadFiles ||
        msg == langShareLink ||
        msg == langVoteQuestion ||
        msg == _l('分享文件') + '...'
      ) {
        $('#textarea_Updater').blur();
        $('#textarea_Updater')
          .val(_l('知会工作是一种美德') + '...')
          .addClass('Gray_a');
      }
    }

    $('#hidden_UpdaterType').val('0');
    $('#uploadAttachment').removeClass('falseHide');
    $("div.myUpdateItem_Content a[targetdiv='#Attachment_updater']").removeClass('ThemeColor3').addClass('Gray_c');
    $('div.myUpdateItem_Content a[targetdiv]').removeClass('ThemeColor3').addClass('Gray_c');
    $('#Attachment_updater,#Link_updater,#Vote_updater,#Storage_updater').hide();

    $('#Attachment_updater')
      .find('.kcAttachmentList')
      .html('')
      // .end()
      // .find('.updaterAttachmentSplitter').hide()
      // .end()
      // .find('.addAttachmentToKc').hide()
      .end()
      .find('#addAttachmentToKcToggle')
      .prop('checked', false)
      .end()
      .find('#addAttachmentToKcLink')
      .data('type', null)
      .data('node', null)
      .html('<span>' + _l('本地文件存入知识中心') + '</span>');

    $('#button_Share').attr('disabled', false).removeClass('Disabled');
    // 链接
    var $mdLinkUpdater = $('#Link_updater');
    $mdLinkUpdater.find('.updaterLinkView').empty();
    $mdLinkUpdater.find('.linkTextBox').val('http://').addClass('Gray_c');
    $mdLinkUpdater.find('.linkBtn').val(_l('预览')).attr('disabled', false).removeClass('Disabled');
    MyUpdater.options.linkViewData = null;

    MyUpdater.options.attachmentData = [];
    MyUpdater.options.kcAttachmentData = [];

    $('#check_Join2').prop('checked', true);
    $('#check_Join3').prop('checked', true);
    // OnlyView 2012-5-29 John Add
    $('#check_OnlyView').prop('checked', false);
    if ($('#Vote_updater .voteOptions input').length > 0) {
      $("#Vote_updater .voteOptions input[type = 'text']").addClass('Gray_c').val(_l('请输入投票项'));
      $('#Vote_updater .UploadSuccess').html('');
      $('#Vote_updater div[pluploadid]').show();
      $('#Vote_updater .voteOptions li:gt(1)').remove();
    }
    if ($('#voteAvailableNumber').length > 0) {
      $('#voteAvailableNumber').get(0).selectedIndex = 0;
    }
    if ($('#voteAnonymous').length > 0) {
      $('#voteAnonymous').removeAttr('checked');
    }
    if ($('#voteVisble').length > 0) {
      $('#voteVisble').attr('checked', 'checked');
    }

    if ($('#Vote_updater .voteOptions li').length > 0) {
      var oplength = $('#Vote_updater .voteOptions li').lenght;
      if (oplength > 0) {
        for (var i = 0; i < oplength; i++) {
          if (i > 1) {
            $('#Vote_updater .voteOptions li').eq(i).remove();
          }
        }
      }
    }
    // 关闭按钮
    $('#updateCloseContainer').hide();
    $('#currentUploadSize').html('0M');
    if (MyUpdater.options.uploadObj) {
      MyUpdater.options.uploadObj.clearAttachment();
    }
  },
  // 预览分享链接
  ViewLink: function (obj) {
    var linkUrl = $('#text_LinkUrl').val().trim();
    if (!linkUrl || linkUrl == 'http://') {
      alert(_l('请输入链接'), 3);
      return false;
    }

    var $el = $(obj);
    $el.val(_l('提取中...')).attr('disabled', true).addClass('Disabled');

    var $btnShare = $('#button_Share');
    $btnShare.attr('disabled', true).addClass('Disabled');

    LinkView($('#Link_updater .updaterLinkView'), {
      viewUrl: linkUrl,
      callback: function (data) {
        if (data.errorCode != '1') {
          alert(_l('链接提取失败'), 2);
          data = null;
        }
        MyUpdater.options.linkViewData = data;
        $el.val(_l('预览')).attr('disabled', false).removeClass('Disabled');
        $btnShare.attr('disabled', false).removeClass('Disabled');
      },
    });
  },
  PostUpdater: function (result, obj, successCallback, isPost, isEnableReward, rewardMark) {
    $('#textarea_Updater').mentionsInput('val', function (data) {
      var postMsg = data;
      if (
        !postMsg ||
        !postMsg.trim() ||
        postMsg == _l('知会工作是一种美德') + '...' ||
        postMsg == langUploadFiles ||
        postMsg == langShareLink ||
        postMsg == langVoteQuestion
      ) {
        alert(_l('内容不能为空'), 3);
        return false;
      } else if (postMsg && postMsg.length > 6000) {
        alert(_l('发表内容过长，最多允许6000个字符'), 3);
        return false;
      }

      var postType = $('#hidden_UpdaterType').val();

      // 验证链接是否有效
      var linkUrl = $('#text_LinkUrl').val();
      if (postType == '1' && !MyUpdater.options.linkViewData) {
        alert(_l('请输入链接'), 3);
        return false;
      }
      // 验证是否有附件
      var filePath = $('#hidden_FilePath').val();
      var fileName = $('#hidden_FileName').val();
      if (postType == '9' && MyUpdater != 'undefined') {
        if (typeof result.isUploadComplete !== 'undefined' && !result.isUploadComplete) {
          alert(_l('文件上传中，请稍等'), 3);
          return false;
        }
      }

      var rData = { postType: postType, postMsg: postMsg };

      var voteData;
      if (postType == '7') {
        var $voteUpdater = $('#Vote_updater');
        voteData = VoteUpdater.getData($voteUpdater);
        // 验证投票是否有选项
        if (voteData.invalid) {
          VoteUpdater.alertInvalidData($voteUpdater);
          return;
        }

        rData.voteOptions = voteData.voteOptions;
        rData.voteOptionFiles = voteData.voteOptionFiles;
        rData.voteLastTime = voteData.voteLastTime;
        rData.voteLastHour = voteData.voteLastHour;
        rData.voteAvailableNumber = voteData.voteAvailableNumber;
        rData.voteAnonymous = voteData.voteAnonymous;
        rData.voteVisble = voteData.voteVisble;
      }

      var knowledgeID = '';
      knowledgeID = $('#txtKnowledge').val();

      if (result.scope) {
        rData.scope = result.scope;
      } else {
        alert(_l('请选择群组'), 3);
        return;
      }

      if (postType == '9') {
        rData.attachments = JSON.stringify(result.attachmentData);
        rData.knowledgeAttach = JSON.stringify(result.kcAttachmentData);
        if ($('#addAttachmentToKcToggle').prop('checked')) {
          var addToKcRootId, addToKcParentId;
          var addToKcType = $('#addAttachmentToKcLink').data('type');
          var addToKcNode = $('#addAttachmentToKcLink').data('node');
          if (addToKcType == 2 /* ROOT*/) {
            addToKcRootId = addToKcParentId = addToKcNode.id;
          } else if (addToKcType == 3 /* NODE*/) {
            addToKcRootId = addToKcNode.rootId;
            addToKcParentId = addToKcNode.id;
          } else {
            /* MY*/
            addToKcRootId = addToKcParentId = null;
          }
          rData.addToKc = true;
          if (addToKcRootId) {
            rData.addToKcRootId = addToKcRootId;
          }
          if (addToKcParentId) {
            rData.addToKcParentId = addToKcParentId;
          }
        }
      } else if (postType == '1') {
        if (MyUpdater.options.linkViewData) {
          var linkViewData = MyUpdater.options.linkViewData;
          rData.linkUrl = linkViewData.url;
          rData.linkTitle = linkViewData.title;
          rData.linkDesc = linkViewData.desc;
          rData.linkThumb = linkViewData.img.replace(/^\/image\.axd\?picture=/, '');
        }
      }

      // 当前动态是不是以问号结尾 “是”则提示加入问答中心
      if (!isPost && postType == 0) {
        var reg = /.*[\?|？|吗](\s*@[^\s]+)*\s*$/;
        if (reg.test(postMsg)) {
          MyUpdater.PostToReward(obj, successCallback);
          return;
        }
      }

      // 如果发布内容与原文件名称一致，需要用户确认
      if (postType == '9') {
        var originName = result.attachmentData.length
          ? result.attachmentData[0].originalFileName
          : $('#Attachment_updater .kcAttachmentList').children().first().data('name');
        if (postMsg == originName) {
          if (!confirm(_l('确认要以原始附件名作为发布动态内容？'))) {
            return false;
          }
        }
      }

      $(obj).attr('disabled', 'disabled').addClass('Disabled');

      var checkValidPromises = [];
      if (postType == '9' && result.attachmentData.length && $('#addAttachmentToKcToggle').prop('checked')) {
        var addToKcSize = result.attachmentData
          .map(function (file) {
            return file.fileSize;
          })
          .reduce(function (a, b) {
            return a + b;
          }, 0);
        var flowValidPromise = new Promise((resolve, reject) => {
          kcAjax
            .getUsage()
            .then(function (result) {
              if (result && result.total - result.used >= addToKcSize) {
                resolve();
              } else {
                alert(_l('已超出知识中心每月流量限制，无法加入知识中心'), 3);
                reject();
              }
            })
            .catch(function () {
              reject();
            });
        });
        checkValidPromises.push(flowValidPromise);
      }

      Promise.all(checkValidPromises).then(
        function () {
          if (MyUpdater.addPost) return;
          MyUpdater.addPost = true;

          postAjax
            .addPost(rData)
            .then(function (result) {
              if (!result.success) {
                alert(_l('发布动态失败'), 2);
                return;
              }
              alert(_l('发布成功'));

              $('#textarea_Updater').val('');
              $('#textarea_Updater').mentionsInput('reset').mentionsInput('clearStore');

              if (typeof MyUpdater !== 'undefined') MyUpdater.ResetUpdaterDiv();

              if (successCallback) {
                successCallback(result);
              }
            })
            .finally(function () {
              $(obj).removeAttr('disabled').removeClass('Disabled');
              MyUpdater.addPost = false;
            });
        },
        function () {
          $(obj).removeAttr('disabled').removeClass('Disabled');
        },
      );
    });
  },
  PostToReward: function (postObj, callback) {
    Dialog.confirm({
      title: _l('提出问题'),
      width: 450,
      okText: _l('是的'),
      cancelText: _l('不用了'),
      children: (
        <div className="pTop20 pBottom20">
          <div className="ThemeColor3 Font16 TxtCenter">{_l('是否将此动态作为问答？')}</div>
        </div>
      ),
    });
  },
};

export default MyUpdater;
