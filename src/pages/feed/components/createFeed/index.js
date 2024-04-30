import postAjax from 'src/api/post';
import Emotion from 'src/components/emotion/emotion';
import './style.css';
import tpl from './s.html';
import React from 'react';
import ReactDom from 'react-dom';
import UploadFiles from 'src/components/UploadFiles';
import VoteUpdater from 'src/components/voteUpdater/voteUpdater';
import 'src/components/mentioninput/mentionsInput';
import 'src/components/selectGroup/selectAllGroup';
import LinkView from 'src/components/linkView/linkView';
import createShare from 'src/components/createShare/createShare';
import doT from 'dot';
import 'src/components/autoTextarea/autoTextarea';
import _ from 'lodash';
import Dialog from 'ming-ui/components/Dialog';

var langUploadFiles = _l('上传附件');
var langShareLink = _l('分享网站') + '...';
var langVoteQuestion = _l('请输入投票问题') + '...';

export default function(options) {
  var MDUpdater = {
    options: {
      postType: {
        post: 0,
        link: 1,
        vote: 7,
        attachment: 9,
      },
      defaultPostType: 0, // 默认是动态
      showType: ['post', 'link', 'vote', 'attachment'],
      showToFeed: false,
      knowledge: true,
      appId: undefined,
      uploadObj: null,
      isUploadComplete: true,
      attachmentData: [],
      kcAttachmentData: [],
      defaultAttachmentData: [], // uploadAttachment的默认普通附件参数
      defaultKcAttachmentData: [], // uploadAttachment的默认知识附件参数
      linkViewData: null, // 链接预览数据
      selectGroupOptions: {
        maxHeight: 270,
        isAll: true,
        isMe: true,
        groupLink: true,
        defaultIsNone: true,
        defaultValue: '',
        defaultValueAllowChange: true, // 默认值是否可以修改
      },
      callback: null,
      createShare: true,
    },
    handleOpen() {
      let $Attachment_updater = $('[targetdiv="#MDUpdater_Attachment_updater"]');
      if (!$Attachment_updater.hasClass('ThemeColor3')) {
        $Attachment_updater.click();
      }
    },
    handleUploadComplete(bool) {
      MDUpdater.options.isUploadComplete = bool;
      let $textarea = $('#MDUpdater_textarea_Updater');
      let value = $textarea.val();

      if (
        bool &&
        (!value || value == _l('知会工作是一种美德') + '...' || value == _l('上传附件')) &&
        (MDUpdater.options.attachmentData.length || MDUpdater.options.kcAttachmentData.length)
      ) {
        $textarea.val(
          MDUpdater.options.attachmentData.length
            ? MDUpdater.options.attachmentData[0].originalFileName
            : MDUpdater.options.kcAttachmentData[0].originalFileName,
        );
        $textarea.focus();
      }
    },
    render() {
      ReactDom.render(
        <UploadFiles
          dropPasteElement="MDUpdater_textarea_Updater"
          onDropPasting={() => this.handleOpen()}
          arrowLeft={4}
          isInitCall={true}
          temporaryData={MDUpdater.options.attachmentData}
          kcAttachmentData={MDUpdater.options.kcAttachmentData}
          onTemporaryDataUpdate={result => {
            MDUpdater.options.attachmentData = result;
          }}
          onKcAttachmentDataUpdate={result => {
            MDUpdater.options.kcAttachmentData = result;
          }}
          onUploadComplete={bool => {
            this.handleUploadComplete(bool);
          }}
        />,
        document.querySelector('#MDUpdater_Attachment_updater'),
      );
    },
    bindUploadEvent: function() {
      let defaultAttachmentData = MDUpdater.options.defaultAttachmentData;
      let defaultKcAttachmentData = MDUpdater.options.defaultKcAttachmentData;

      if (defaultAttachmentData.length) {
        MDUpdater.options.attachmentData = defaultAttachmentData;
      }
      if (defaultKcAttachmentData.length) {
        MDUpdater.options.kcAttachmentData = defaultKcAttachmentData;
      }

      if (MDUpdater.options.defaultPostType === 0 || defaultAttachmentData.length || defaultKcAttachmentData.length) {
        this.render();
      }
    },
    resetUpdater: function(options, clearCallback) {
      if (!options) {
        options = {};
      }
      if (clearCallback) {
        MDUpdater.options.callback = function() {};
      }

      var $mdUpdaterTextareaUpdater = $('#MDUpdater_textarea_Updater');

      if ($mdUpdaterTextareaUpdater) {
        var msg = $mdUpdaterTextareaUpdater.val();
        if (!msg || msg == langUploadFiles || msg == langShareLink || msg == langVoteQuestion) {
          $mdUpdaterTextareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
        }
      }
      if (MDUpdater.options.defaultPostType !== 9) {
        $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.post);
      }
      $("div.MDUpdater a[targetdiv='#MDUpdater_Attachment_updater']")
        .removeClass('ThemeColor3')
        .addClass('Gray_c');
      $("div.MDUpdater a[targetdiv='#MDUpdater_Link_updater']")
        .removeClass('ThemeColor3')
        .addClass('Gray_c');
      $("div.MDUpdater a[targetdiv='#MDUpdater_Vote_updater']")
        .removeClass('ThemeColor3')
        .addClass('Gray_c');
      $('#MDUpdater_Attachment_updater,#MDUpdater_Link_updater,#MDUpdater_Vote_updater').hide();

      // 附件
      MDUpdater.options.attachmentData = new Array();
      MDUpdater.options.kcAttachmentData = new Array();
      // this.render();

      // 链接
      var $mdUpdaterLinkUpdater = $('#MDUpdater_Link_updater');
      $mdUpdaterLinkUpdater.find('.updaterLinkView').empty();
      $mdUpdaterLinkUpdater
        .find('.textLinkUrl')
        .val('http://')
        .addClass('Gray_c');
      MDUpdater.options.linkViewData = null;
      $('#MDUpdater_button_Share')
        .attr('disabled', false)
        .removeClass('Disabled');
      $('#MDUpdater_Link_updater .linkBtn')
        .val(_l('预览'))
        .attr('disabled', false)
        .removeClass('Disabled');

      // 投票
      VoteUpdater.reset($('#MDUpdater_Vote_updater'));

      // 关闭按钮
      $('#mdUpdateCloseContainer').hide();
    },
    // 发布动态
    postUpdater: function(obj) {
      var $mdUpdaterTextareaUpdater = $('#MDUpdater_textarea_Updater');

      $mdUpdaterTextareaUpdater.mentionsInput('val', function(data) {
        var postMsg = data;
        if (
          !$.trim(postMsg) ||
          postMsg == _l('知会工作是一种美德') + '...' ||
          postMsg == langUploadFiles ||
          postMsg == langShareLink ||
          postMsg == langVoteQuestion
        ) {
          alert(_l('内容不能为空'), 3);
          return false;
        } else if (postMsg.length > 6000) {
          alert(_l('发表内容过长，最多允许6000个字符'), 3);
          return false;
        }

        var postType = $('#MDUpdater_hidden_UpdaterType').val();
        var scope = $('#MDUpdater_hidden_GroupID_All').SelectGroup('getScope');

        var isToFeed = $('#isToFeed').prop('checked');

        var rData = { postType: postType, postMsg: postMsg };
        // 不在动态更新显示
        if (!isToFeed) {
          rData.showType = 1;
        }

        // 链接类型
        if (postType == MDUpdater.options.postType.link) {
          // 验证链接是否有效
          var linkUrl = $('#MDUpdater_text_LinkUrl').val();

          if (!linkUrl || linkUrl == 'http://') {
            alert(_l('请输入链接'), 3);
            return false;
          }

          if (MDUpdater.options.linkViewData) {
            var linkViewData = MDUpdater.options.linkViewData;
            rData.linkUrl = linkViewData.url;
            rData.linkTitle = linkViewData.title;
            rData.linkDesc = linkViewData.desc;
            rData.linkThumb = linkViewData.img;
          } else {
            alert(_l('请预览链接'), 3);
            return false;
          }
        } else if (postType == MDUpdater.options.postType.attachment && MDUpdater != 'undefined') {
          if (typeof MDUpdater.options.isUploadComplete != 'undefined' && !MDUpdater.options.isUploadComplete) {
            alert(_l('文件上传中，请稍等'), 3);
            return false;
          }

          if (MDUpdater.options.attachmentData.length == 0 && MDUpdater.options.kcAttachmentData.length == 0) {
            alert(_l('请选择要上传的附件'), 3);
            return false;
          }

          var tempAttachments = MDUpdater.options.attachmentData.filter(function(item) {
            return item.inEdit;
          });
          if (tempAttachments.length > 0) {
            alert(_l('请先保存文件名'), 3);
            return false;
          }

          rData.attachments = JSON.stringify(MDUpdater.options.attachmentData);
          rData.knowledgeAttach = JSON.stringify(MDUpdater.options.kcAttachmentData);
          // 如果发布内容与原文件名称一致，需要用户确认
          if (MDUpdater.options.attachmentData[0] && postMsg == MDUpdater.options.attachmentData[0].originalFileName) {
            if (!confirm(_l('确认要以原始图片名作为发布动态内容？'))) return false;
          }
        } else if (postType == MDUpdater.options.postType.vote) {
          var voteData = VoteUpdater.getData($('#MDUpdater_Vote_updater'));
          if (voteData.invalid) {
            alert(_l('投票项内容不能为空'), 3);
            return;
          }
          // 验证投票是否有选项
          rData.voteOptions = voteData.voteOptions;
          rData.voteOptionFiles = voteData.voteOptionFiles;
          rData.voteLastTime = voteData.voteLastTime;
          rData.voteLastHour = voteData.voteLastHour;
          rData.voteAvailableNumber = voteData.voteAvailableNumber;
          rData.voteAnonymous = voteData.voteAnonymous;
          rData.voteVisble = voteData.voteVisble;
        }
        rData.appId = MDUpdater.options.appId;

        // 判断群组
        if (scope) {
          rData.scope = scope;
        } else if (!isToFeed) {
          rData.scope = {
            radioProjectIds: '',
            shareGroupIds: [],
            shareProjectIds: [MDUpdater.options.selectGroupOptions.projectId],
          };
        } else {
          alert(_l('请选择群组'), 3);
          $('#MDUpdater_hidden_GroupID_All').SelectGroup('slideDown');
          return;
        }

        // 知识门户
        // var knowledgeID = md.global.Project.haveKnowledge ? $("#MDUpdater_txtKnowledge").val() : "";
        $(obj)
          .attr('disabled', 'disabled')
          .addClass('Disabled');

        postAjax
          .addPost(rData)
          .then(function(result) {
            if (!result.success) {
              alert(_l('发布动态失败'), 2);
              return;
            }
            if (MDUpdater.options.createShare) {
              if (window.location.pathname.indexOf('/feed') > -1) {
                alert(_l('发布成功'));
                return false;
              }
              createShare({
                linkURL: md.global.Config.WebUrl + 'feeddetail?itemID=' + result.post.postID,
                content: _l('动态创建成功'),
              });
            }
            if (MDUpdater.options.callback) {
              MDUpdater.options.callback(result.post);
            } else {
              alert(_l('分享成功'));
            }
            $mdUpdaterTextareaUpdater.val('');
            $mdUpdaterTextareaUpdater.mentionsInput('reset').mentionsInput('clearStore');
            MDUpdater.resetUpdater(null, true);

            $('#MDUpdaterhidden_GroupID_All').SelectGroup(MDUpdater.options.selectGroupOptions);
          })
          .finally(function() {
            $(obj)
              .removeAttr('disabled')
              .removeClass('Disabled');
            $('.easyDialogBoxMDUpdater')[0] &&
              $('.easyDialogBoxMDUpdater')
                .parent()
                .remove();
          });
      });
    },
    // 拦截层选群组
    dialogChooseGroup: function(el, hidGroupID, projectId) {
      $(el).dialogSelectGroup({
        projectId: projectId,
        callback: function(groupIDs) {
          var selectGroupOptions = MDUpdater.options.selectGroupOptions;
          selectGroupOptions.defaultValue = groupIDs;

          $(hidGroupID).SelectGroup(selectGroupOptions);
          MDUpdater.postUpdater(el);
        },
      });
    },
    showUpdaterDivForDocCenter: function(options) {
      if (options) {
        $.extend(MDUpdater.options, options);
      }

      Dialog.confirm({
        dialogClasses: 'easyDialogBoxMDUpdater',
        width: 640,
        noFooter: true,
        children: <div dangerouslySetInnerHTML={{ __html: doT.template(tpl)() }}></div>,
      });
      if (MDUpdater.options.postMsg) {
        $('#MDUpdater_textarea_Updater').val(MDUpdater.options.postMsg);
      }
      MDUpdater.bindEvent();
    },
    bindEvent: function() {
      MDUpdater.bindUploadEvent();

      setTimeout('$("#MDUpdater_textarea_Updater")[0].focus();', 10);

      // 分享范围
      $('#MDUpdater_hidden_GroupID_All').SelectGroup(MDUpdater.options.selectGroupOptions);

      // 分享按钮
      $('#MDUpdater_button_Share').val(_l('分享'));

      $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.defaultPostType);

      if (MDUpdater.options.showToFeed) {
        $('#divIsToFeed').show();
      }

      if (!MDUpdater.options.knowledge) {
        $('#MDUpdater_Div_JoinKnowledge').remove();
      }

      var $mdUpdaterTextareaUpdater = $('#MDUpdater_textarea_Updater');

      $mdUpdaterTextareaUpdater
        .focus(function(ev) {
          var msg = $mdUpdaterTextareaUpdater.val();
          if (
            msg == _l('知会工作是一种美德') + '...' ||
            msg == langUploadFiles ||
            msg == langShareLink ||
            msg == langVoteQuestion
          ) {
            $mdUpdaterTextareaUpdater.val('');
          }
          $mdUpdaterTextareaUpdater.removeClass('Gray_a');
        })
        .blur(function() {
          $mdUpdaterTextareaUpdater.mentionsInput('store');
          if (!$.trim($(this).val())) {
            $mdUpdaterTextareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
          }
        })
        .autoTextarea({
          maxHeight: 150,
          minHeight: 72,
        });

      $mdUpdaterTextareaUpdater.mentionsInput({
        submitBtn: 'MDUpdater_button_Share',
        showCategory: true,
        cacheKey: 'updatertext',
        reset: false,
      });
      if (!MDUpdater.options.postMsg) {
        $mdUpdaterTextareaUpdater.mentionsInput('restore', function(success) {
          if (success) {
            $mdUpdaterTextareaUpdater.removeClass('Gray_a');
            $('#myupdaterOP').show();
          } else {
            if (!MDUpdater.options.postMsg) {
              $mdUpdaterTextareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
            }
          }
        });
      }

      if (_.includes(MDUpdater.options.showType, 'post')) {
        // 右上角关闭
        $('.Updater_Textpanel span.update_close').on('click', function() {
          MDUpdater.resetUpdater();
          if ($mdUpdaterTextareaUpdater) {
            if (!$mdUpdaterTextareaUpdater.val().trim()) {
              $mdUpdaterTextareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('Gray_a');
            }
          }
        });
      } else {
        $('.Updater_Textpanel span.update_close').css('display', 'none');
      }

      if (_.includes(MDUpdater.options.showType, 'attachment'))
        $("[targetdiv='#MDUpdater_Attachment_updater']").removeAttr('style');
      if (_.includes(MDUpdater.options.showType, 'link'))
        $("[targetdiv='#MDUpdater_Link_updater']").removeAttr('style');
      if (_.includes(MDUpdater.options.showType, 'vote'))
        $("[targetdiv='#MDUpdater_Vote_updater']").removeAttr('style');
      if (_.includes(MDUpdater.options.showType, 'video'))
        $("[targetdiv='#MDUpdater_Video_updater']").removeAttr('style');

      $('#isToFeed').on('change', function() {
        if ($(this).prop('checked')) {
          $('#divIsToFeedToggle')
            .removeClass('Gray_c')
            .addClass('ThemeColor3');
          $('.Updater_Textpanel')
            .find('.groupSelect')
            .show();
        } else {
          $('#divIsToFeedToggle')
            .removeClass('ThemeColor3')
            .addClass('Gray_c');
          $('.Updater_Textpanel')
            .find('.groupSelect')
            .hide();
        }
      });

      $('div.MDUpdater a[targetDiv]').on('click', function() {
        var targetDivID = $(this).attr('targetDiv');
        if (targetDivID == '#MDUpdater_Attachment_updater') {
          if (
            MDUpdater.options.attachmentData.length == 0 &&
            MDUpdater.options.kcAttachmentData.length == 0 &&
            $('#MDUpdater_Attachment_updater').is(':visible')
          ) {
            MDUpdater.resetUpdater();
            return;
          } else if ($('#MDUpdater_Attachment_updater').is(':visible')) {
            return;
          }
        }

        // 链接
        if (targetDivID == '#MDUpdater_Link_updater') {
          if (
            ($('#MDUpdater_Link_updater')
              .val()
              .trim() == 'http://' ||
              $('#MDUpdater_Link_updater')
                .val()
                .trim() == '') &&
            $('#MDUpdater_Link_updater').is(':visible')
          ) {
            MDUpdater.resetUpdater();
            return;
          } else if ($('#MDUpdater_Link_updater').is(':visible')) {
            return;
          }
        }

        if (
          targetDivID == '#MDUpdater_Vote_updater' &&
          $('div.MDUpdater .voteOptions li')
            .eq(0)
            .find('input')
            .val() == _l('请输入投票项') &&
          $('div.MDUpdater .voteOptions li')
            .eq(1)
            .find('input')
            .val() == _l('请输入投票项') &&
          $('#MDUpdater_Vote_updater').is(':visible')
        ) {
          MDUpdater.resetUpdater();
          return;
        } else if (targetDivID == '#MDUpdater_Vote_updater' && $('#MDUpdater_Vote_updater').is(':visible')) {
          return;
        }

        MDUpdater.resetUpdater();
        // MDUpdater.bindUploadEvent();

        if (targetDivID == '#MDUpdater_Attachment_updater') {
          $('#MDUpdater_Attachment_updater').show(0, function() {
            // MDUpdater.options.uploadObj.getPluploadObj().refresh();
          });
          $(this)
            .removeClass('Gray_c')
            .addClass('ThemeColor3');
          $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.attachment);
          if (
            $('#MDUpdater_textarea_Updater') &&
            ($('#MDUpdater_textarea_Updater')
              .val()
              .trim() == '' ||
              $('#MDUpdater_textarea_Updater')
                .val()
                .trim() ==
                _l('知会工作是一种美德') + '...')
          ) {
            $('#MDUpdater_textarea_Updater')
              .val(langUploadFiles)
              .addClass('Gray_a');
          }
          MDUpdater.render();
        } else if (targetDivID == '#MDUpdater_Link_updater') {
          $('#MDUpdater_Link_updater').show();
          $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.link);
          $(this)
            .removeClass('Gray_c')
            .addClass('ThemeColor3');
          if (
            $('#MDUpdater_textarea_Updater') &&
            ($('#MDUpdater_textarea_Updater')
              .val()
              .trim() == '' ||
              $('#MDUpdater_textarea_Updater')
                .val()
                .trim() ==
                _l('知会工作是一种美德') + '...')
          ) {
            $('#MDUpdater_textarea_Updater')
              .val(langShareLink)
              .addClass('Gray_a');
          }

          $('#MDUpdater_Link_updater .textLinkUrl').on('keydown', function(e) {
            var key = window.event ? e.keyCode : e.which;
            if (key == 13) {
              $('#MDUpdater_Link_updater .linkBtn').click();
            }
          });
        } else if (targetDivID == '#MDUpdater_Vote_updater') {
          $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.vote);

          $(this)
            .removeClass('Gray_c')
            .addClass('ThemeColor3');
          if (
            $('#MDUpdater_textarea_Updater') &&
            ($('#MDUpdater_textarea_Updater')
              .val()
              .trim() == '' ||
              $('#MDUpdater_textarea_Updater')
                .val()
                .trim() ==
                _l('知会工作是一种美德') + '...')
          ) {
            $('#MDUpdater_textarea_Updater')
              .val(langVoteQuestion)
              .addClass('Gray_a');
          }

          var index = $("a[targetDiv='#MDUpdater_Vote_updater']").prevAll(':visible').length;
          $('#MDUpdater_Vote_updater').attr('left', index * 36 + 3);
          VoteUpdater.init($('#MDUpdater_Vote_updater'));
        } else {
          $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.post);
        }
        $(targetDivID).show(0, function() {});
        // 关闭按钮
        if (targetDivID != '#MDUpdater_Video_updater') $('#mdUpdateCloseContainer').show();
      });

      // 上传音视频
      if ($("[targetdiv='#MDUpdater_Video_updater']").length > 0) {
        MDUpdater.showUploadPageForVideoCenter("[targetdiv='#MDUpdater_Video_updater']");
      }

      new Emotion('div.MDUpdater .faceBtn', {
        input: '#MDUpdater_textarea_Updater',
        placement: 'right bottom',
        mdBear: false,
        relatedLeftSpace: 22,
        onSelect: function() {
          var textBox = $('#MDUpdater_textarea_Updater')[0];
          if (
            textBox.value === _l('知会工作是一种美德') + '...' ||
            textBox.value === langUploadFiles ||
            textBox.value === langShareLink ||
            textBox.value === langVoteQuestion
          ) {
            textBox.value = '';
          }
        },
      });

      // 链接预览
      $('#MDUpdater_Link_updater .linkBtn').on('click', function() {
        var linkUrl = $('#MDUpdater_text_LinkUrl')
          .val()
          .trim();
        if (!linkUrl || linkUrl == 'http://') {
          alert(_l('请输入链接'), 3);
          return false;
        }

        var $el = $(this);
        $el
          .val(_l('提取中...'))
          .attr('disabled', true)
          .addClass('Disabled');

        var $btnShare = $('#MDUpdater_button_Share');
        $btnShare.attr('disabled', true).addClass('Disabled');

        LinkView($('#MDUpdater_Link_updater .updaterLinkView'), {
          viewUrl: linkUrl,
          callback: function(data) {
            if (data.errorCode != '1') {
              alert('链接提取失败', 3);
              data = null;
            }
            MDUpdater.options.linkViewData = data;
            $el
              .val(_l('预览'))
              .attr('disabled', false)
              .removeClass('Disabled');
            $btnShare.attr('disabled', false).removeClass('Disabled');
          },
        });
      });

      // 发布
      $('#MDUpdater_button_Share').on('click', function() {
        MDUpdater.postUpdater(this);
      });

      // 默认触发点击哪个
      if (MDUpdater.options.defaultPostType == MDUpdater.options.postType.vote) {
        $("div.MDUpdater a[targetDiv='#MDUpdater_Vote_updater']").click();
      }
      if (MDUpdater.options.defaultAttachmentData.length + MDUpdater.options.defaultKcAttachmentData.length) {
        // $("div.MDUpdater a[targetDiv='#MDUpdater_Attachment_updater']").click();
        $('#MDUpdater_hidden_UpdaterType').val(9);
        $('#MDUpdater_Attachment_updater').show();
        $("div.MDUpdater a[targetdiv='#MDUpdater_Attachment_updater']")
          .addClass('ThemeColor3')
          .removeClass('Gray_c');
      }
    },
    showVideoUpload: function() {
      var dialogHeight = 450;
      var dialogWidth = 660;
      var dialogTop = (window.screen.height - dialogHeight) / 2 - 50;
      var dialogLeft = (window.screen.width - dialogWidth) / 2 - 7;
      var url = '/apps/videos/uploadpage/fileupload';
      var features =
        'top=' +
        dialogTop +
        'px,' +
        'left=' +
        dialogLeft +
        'px,' +
        'width=' +
        dialogWidth +
        'px,' +
        'height=' +
        dialogHeight +
        'px,' +
        'toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no';
      window.open(url, '_blank', features);
    },
    showUploadPageForVideoCenter: function(element) {
      $(element).click(function() {
        MDUpdater.showVideoUpload();
      });
    },
  };
  if (
    $('#dialogSendMessage').is(':visible') ||
    $('.easyDialogBoxMDUpdater').is(':visible') ||
    $('#createCalendar').is(':visible') ||
    $('#createTask').is(':visible')
  ) {
    return;
  }

  MDUpdater.showUpdaterDivForDocCenter(options);
}
