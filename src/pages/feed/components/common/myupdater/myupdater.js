import kcAjax from 'src/api/kc';
import postAjax from 'src/api/post';
import 'src/components/autoTextarea/autoTextarea';
import MentionsInput from 'src/components/MentionsInput';
import VoteUpdater from '../../voteUpdater/voteUpdater';

let langUploadFiles = _l('上传附件') + '...';
let langVoteQuestion = _l('请输入投票问题') + '...';

const MyUpdater = {
  options: {
    thumbImgs: '',
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
  SetPosting: function (isPosting) {
    if (typeof this.options.onPostingChange === 'function') {
      this.options.onPostingChange(isPosting);
    }
  },
  formatNumber: function (src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
  },
  ChangeUpdaterType: function (postType) {
    const $textareaUpdater = $('#textarea_Updater');
    const postTypePlaceholder = postType === '9' ? langUploadFiles : langVoteQuestion;
    const currentMessage = $textareaUpdater.val().trim();
    const placeholderMessages = [
      '',
      _l('知会工作是一种美德') + '...',
      langUploadFiles,
      langVoteQuestion,
      _l('分享文件') + '...',
    ];

    $('#hidden_UpdaterType').val(postType);
    if (placeholderMessages.includes(currentMessage)) {
      $textareaUpdater.val(postTypePlaceholder).addClass('textTertiary');
    }

    if (postType === '7') {
      VoteUpdater.init($('#Vote_updater'));
    }
  },
  // 绑定事件
  BindEvent: function () {
    let $textareaUpdater = $('#textarea_Updater');
    let textareaUpdaterEl = $textareaUpdater.get(0);

    const updateTextareaHeight = minHeight => {
      if (typeof $textareaUpdater.autoTextarea === 'function') {
        $textareaUpdater.autoTextarea({
          maxHeight: 220,
          minHeight,
        });
      } else {
        $textareaUpdater.height(minHeight);
      }
    };

    // 支持高度自适应
    updateTextareaHeight(24);
    $textareaUpdater
      .focus(function () {
        let msg = $textareaUpdater.val().trim();

        if (
          msg == _l('知会工作是一种美德') + '...' ||
          msg == langUploadFiles ||
          msg == langVoteQuestion ||
          msg == _l('分享文件') + '...'
        ) {
          $textareaUpdater.val('');
        }

        $textareaUpdater.removeClass('textTertiary');
        MyUpdater.options.updaterInputAreaFocus = true;
        $('#myupdaterOP').slideDown(function () {
          $(this).attr('style', 'display: block');
        });

        updateTextareaHeight(80);
        // $textareaUpdater.stop().animate({height: 80}, function () {
        //     $textareaUpdater.autoTextarea({
        //         maxHeight: 220,
        //         minHeight: 80
        //     });
        // });
      })
      .blur(function () {
        textareaUpdaterEl.store();
        if (!$(this).val().trim()) {
          $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('textTertiary');
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
            $textareaUpdater.removeClass('textTertiary');
            $('#myupdaterOP').show();
          } else {
            $textareaUpdater.val(_l('知会工作是一种美德') + '...').addClass('textTertiary');
          }
        });
      },
    });

    $(document).click(function (event) {
      if ($('#textarea_Updater').length > 0) {
        let text;
        MyUpdater.options.updaterInputAreaFocus = !(
          !$(event.target).closest(
            '.myUpdateItem,.myUpdateType,.mentionsAutocompleteList,.faceDiv,.plupload,.focusUpdaterCon,.hap-popover',
          ).length &&
          /* 非引导点击*/
          !$(event.target).hasClass('guideTry') &&
          /*! $(event.target).hasClass("guidePoshytipQuit") &&*/
          ((text = $('#textarea_Updater').val().trim()) == '' ||
            text == _l('知会工作是一种美德') + '...' ||
            text == langUploadFiles ||
            text == langVoteQuestion ||
            text == _l('分享文件') + '...') &&
          $('#hidden_UpdaterType').val() === '0' &&
          !$('#Storage_updater').is(':visible')
        );
        if (!MyUpdater.options.updaterInputAreaFocus) {
          // $textareaUpdater.stop().animate({height: 24}, function () {
          //     $textareaUpdater.autoTextarea({
          //         maxHeight: 220,
          //         minHeight: 24
          //     });
          // });
          updateTextareaHeight(24);
          $('#myupdaterOP').slideUp();
        }
      }
    });
  },
  // 重置参数
  ResetUpdaterDiv: function () {
    if ($('#textarea_Updater')) {
      let msg = $('#textarea_Updater').val().trim();

      if (msg == '' || msg == langUploadFiles || msg == langVoteQuestion || msg == _l('分享文件') + '...') {
        $('#textarea_Updater').blur();
        $('#textarea_Updater')
          .val(_l('知会工作是一种美德') + '...')
          .addClass('textTertiary');
      }
    }

    $('#hidden_UpdaterType').val('0');

    if (typeof MyUpdater.options.resetActiveTab === 'function') {
      MyUpdater.options.resetActiveTab();
    }

    $('#Storage_updater').hide();

    MyUpdater.options.attachmentData = [];
    MyUpdater.options.kcAttachmentData = [];
    if (typeof MyUpdater.options.clearFilesData === 'function') {
      MyUpdater.options.clearFilesData();
    }

    VoteUpdater.reset($('#Vote_updater'));

    $('#currentUploadSize').html('0M');
    if (MyUpdater.options.uploadObj) {
      MyUpdater.options.uploadObj.clearAttachment();
    }
  },
  PostUpdater: function (result, successCallback) {
    document.querySelector('#textarea_Updater').val(data => {
      let postMsg = data;

      if (
        !postMsg ||
        !postMsg.trim() ||
        postMsg == _l('知会工作是一种美德') + '...' ||
        postMsg == langUploadFiles ||
        postMsg == langVoteQuestion
      ) {
        alert(_l('内容不能为空'), 3);
        return false;
      } else if (postMsg && postMsg.length > 6000) {
        alert(_l('发表内容过长，最多允许6000个字符'), 3);
        return false;
      }

      let postType = $('#hidden_UpdaterType').val();

      // 验证是否有附件
      if (postType == '9' && MyUpdater != 'undefined') {
        if (typeof result.isUploadComplete !== 'undefined' && !result.isUploadComplete) {
          alert(_l('文件上传中，请稍等'), 3);
          return false;
        }
      }

      let rData = { postType: postType, postMsg: postMsg };

      let voteData;

      if (postType == '7') {
        let $voteUpdater = $('#Vote_updater');
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
        if (result.addAttachmentToKc) {
          rData.addToKc = true;
        }
      }

      // 如果发布内容与原文件名称一致，需要用户确认
      if (postType == '9') {
        let originName = result.attachmentData.length
          ? result.attachmentData[0].originalFileName
          : $('#Attachment_updater .kcAttachmentList').children().first().data('name');

        if (postMsg == originName) {
          if (!confirm(_l('确认要以原始附件名作为发布动态内容？'))) {
            return false;
          }
        }
      }

      MyUpdater.SetPosting(true);

      let checkValidPromises = [];

      if (postType == '9' && result.attachmentData.length && result.addAttachmentToKc) {
        let addToKcSize = result.attachmentData
          .map(function (file) {
            return file.fileSize;
          })
          .reduce(function (a, b) {
            return a + b;
          }, 0);
        let flowValidPromise = new Promise((resolve, reject) => {
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
              MyUpdater.SetPosting(false);
              MyUpdater.addPost = false;
            });
        },
        function () {
          MyUpdater.SetPosting(false);
        },
      );
    });
  },
};

export default MyUpdater;
