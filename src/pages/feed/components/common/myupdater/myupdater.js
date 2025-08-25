﻿import React from 'react';
import { Dialog } from 'ming-ui';
import kcAjax from 'src/api/kc';
import postAjax from 'src/api/post';
import 'src/components/autoTextarea/autoTextarea';
import MentionsInput from 'src/components/MentionsInput';
import LinkView from '../../linkView/linkView';
import VoteUpdater from '../../voteUpdater/voteUpdater';

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

    this.BindEvent();
  },
  formatNumber: function (src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
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
    var textareaUpdaterEl = $textareaUpdater.get(0);

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
        textareaUpdaterEl.store();
        if (!$.trim($(this).val())) {
          $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
        }
      });

    MentionsInput({
      input: textareaUpdaterEl,
      getPopupContainer: () => textareaUpdaterEl.parentNode,
      popupAlignOffset: [0, -10],
      submitBtn: 'button_Share',
      showCategory: true,
      cacheKey: 'updatertext',
      initCallback: () => {
        textareaUpdaterEl.restore(success => {
          if (success) {
            $textareaUpdater.removeClass('Gray_a');
            $('#myupdaterOP').show();
          } else {
            $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
          }
        });
      },
    });

    $(document).click(function (event) {
      if ($('#textarea_Updater').length > 0) {
        var text;
        MyUpdater.options.updaterInputAreaFocus = !(
          !$(event.target).closest(
            '.myUpdateItem,.myUpdateType,.mentionsAutocompleteList,.faceDiv,.plupload,.focusUpdaterCon',
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
  PostUpdater: function (result, obj, successCallback, isPost) {
    document.querySelector('#textarea_Updater').val(data => {
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
      if (postType == '1' && !MyUpdater.options.linkViewData) {
        alert(_l('请输入链接'), 3);
        return false;
      }
      // 验证是否有附件
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

      if (result) {
        if (result.scope) {
          rData.scope = result.scope;
        } else {
          alert(_l('请选择群组'), 3);
          return;
        }
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
        var reg = /.*[?？吗](\s*@[^\s]+)*\s*$/;
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
              $('#textarea_Updater').get(0).reset();
              $('#textarea_Updater').get(0).clearStore();

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
      onOk: function () {
        var isEnableReward = false;
        var rewardMark = 0;
        $('#hidden_UpdaterType').val('4');
        MyUpdater.PostUpdater(false, postObj, callback, 'isReward', isEnableReward, rewardMark);
      },
      onCancel: function () {
        MyUpdater.PostUpdater(false, postObj, callback, 'isPost');
      },
      children: (
        <div className="pTop20 pBottom20">
          <div className="ThemeColor3 Font16 TxtCenter">{_l('是否将此动态作为问答？')}</div>
        </div>
      ),
    });
  },
};

export default MyUpdater;
