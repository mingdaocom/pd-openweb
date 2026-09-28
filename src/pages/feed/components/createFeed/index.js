import React from 'react';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import postAjax from 'src/api/post';
import 'src/components/autoTextarea/autoTextarea';
import createShare from 'src/components/createShare/createShare';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import VoteUpdater from '../voteUpdater/voteUpdater';
import CreateFeedContent from './CreateFeedContent';

const DEFAULT_PLACEHOLDER = () => _l('知会工作是一种美德') + '...';
const ATTACHMENT_PLACEHOLDER = () => _l('上传附件');
const VOTE_PLACEHOLDER = () => _l('请输入投票问题') + '...';

export default function createFeed(options) {
  const MDUpdater = {
    options: {
      postType: {
        post: 0,
        vote: 7,
        attachment: 9,
      },
      defaultPostType: 0,
      showType: ['post', 'vote', 'attachment'],
      showToFeed: false,
      knowledge: true,
      appId: undefined,
      isUploadComplete: true,
      attachmentData: [],
      kcAttachmentData: [],
      defaultAttachmentData: [],
      defaultKcAttachmentData: [],
      selectGroupOptions: {
        maxHeight: 270,
        isAll: true,
        isMe: true,
        defaultValue: '',
      },
      callback: null,
      createShare: true,
      scope: undefined,
    },
    controller: null,
    isPosting: false,
    voteElement: null,

    getPlaceholder(postType) {
      if (postType === MDUpdater.options.postType.attachment) {
        return ATTACHMENT_PLACEHOLDER();
      }

      if (postType === MDUpdater.options.postType.vote) {
        return VOTE_PLACEHOLDER();
      }

      return DEFAULT_PLACEHOLDER();
    },

    isPlaceholder(value) {
      return [DEFAULT_PLACEHOLDER(), ATTACHMENT_PLACEHOLDER(), VOTE_PLACEHOLDER()].includes(value);
    },

    changeUpdaterType(postType, reset = false) {
      const $textarea = $('#MDUpdater_textarea_Updater');
      const currentValue = $textarea.val();

      $('#MDUpdater_hidden_UpdaterType').val(postType);

      if (!currentValue || MDUpdater.isPlaceholder(currentValue)) {
        $textarea.val(MDUpdater.getPlaceholder(postType)).addClass('textTertiary');
      }

      if (postType === MDUpdater.options.postType.vote && !reset) {
        VoteUpdater.init($('#MDUpdater_Vote_updater'));
      }

      if (reset) {
        MDUpdater.resetUpdater();
      }
    },

    handleUploadComplete(isComplete) {
      MDUpdater.options.isUploadComplete = isComplete;
      const $textarea = $('#MDUpdater_textarea_Updater');
      const value = $textarea.val();

      if (
        isComplete &&
        (!value || MDUpdater.isPlaceholder(value)) &&
        (MDUpdater.options.attachmentData.length || MDUpdater.options.kcAttachmentData.length)
      ) {
        $textarea
          .val(
            MDUpdater.options.attachmentData.length
              ? MDUpdater.options.attachmentData[0].originalFileName
              : MDUpdater.options.kcAttachmentData[0].originalFileName,
          )
          .removeClass('textTertiary')
          .focus();
      }
    },

    handleGroupChange(value = {}) {
      MDUpdater.options.scope =
        !value.isMe &&
        !(value.shareGroupIds || []).length &&
        !(value.shareProjectIds || []).length &&
        !(value.radioProjectIds || []).length
          ? undefined
          : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']);
    },

    resetUpdater(clearCallback) {
      if (clearCallback) {
        MDUpdater.options.callback = () => {};
      }

      const $textarea = $('#MDUpdater_textarea_Updater');
      const message = $textarea.val();

      if (!message || MDUpdater.isPlaceholder(message)) {
        $textarea.val(DEFAULT_PLACEHOLDER()).addClass('textTertiary');
      }

      MDUpdater.options.attachmentData = [];
      MDUpdater.options.kcAttachmentData = [];
      MDUpdater.options.isUploadComplete = true;
      $('#MDUpdater_hidden_UpdaterType').val(MDUpdater.options.postType.post);
      VoteUpdater.reset($('#MDUpdater_Vote_updater'));
      MDUpdater.controller?.resetContent();
    },

    postUpdater() {
      if (MDUpdater.isPosting) {
        return;
      }

      const $textarea = $('#MDUpdater_textarea_Updater');
      const textareaElement = $textarea.get(0);

      const handlePost = data => {
        const postMsg = data || '';

        if (!postMsg.trim() || MDUpdater.isPlaceholder(postMsg)) {
          alert(_l('内容不能为空'), 3);
          return;
        }

        if (postMsg.length > 6000) {
          alert(_l('发表内容过长，最多允许6000个字符'), 3);
          return;
        }

        const postType = Number($('#MDUpdater_hidden_UpdaterType').val());
        const isToFeed = $('#isToFeed').prop('checked');
        const requestData = { postType, postMsg };

        if (!isToFeed) {
          requestData.showType = 1;
        }

        if (postType === MDUpdater.options.postType.attachment) {
          if (!MDUpdater.options.isUploadComplete) {
            alert(_l('文件上传中，请稍等'), 3);
            return;
          }

          if (!MDUpdater.options.attachmentData.length && !MDUpdater.options.kcAttachmentData.length) {
            alert(_l('请选择要上传的附件'), 3);
            return;
          }

          if (MDUpdater.options.attachmentData.some(item => item.inEdit)) {
            alert(_l('请先保存文件名'), 3);
            return;
          }

          requestData.attachments = JSON.stringify(MDUpdater.options.attachmentData);
          requestData.knowledgeAttach = JSON.stringify(MDUpdater.options.kcAttachmentData);

          if (
            MDUpdater.options.attachmentData[0] &&
            postMsg === MDUpdater.options.attachmentData[0].originalFileName &&
            !confirm(_l('确认要以原始图片名作为发布动态内容？'))
          ) {
            return;
          }
        } else if (postType === MDUpdater.options.postType.vote) {
          const voteData = VoteUpdater.getData($('#MDUpdater_Vote_updater'));

          if (voteData.invalid) {
            VoteUpdater.alertInvalidData($('#MDUpdater_Vote_updater'));
            return;
          }

          requestData.voteOptions = voteData.voteOptions;
          requestData.voteOptionFiles = voteData.voteOptionFiles;
          requestData.voteLastTime = voteData.voteLastTime;
          requestData.voteLastHour = voteData.voteLastHour;
          requestData.voteAvailableNumber = voteData.voteAvailableNumber;
          requestData.voteAnonymous = voteData.voteAnonymous;
          requestData.voteVisble = voteData.voteVisble;
        }

        requestData.appId = MDUpdater.options.appId;

        if (MDUpdater.options.scope) {
          requestData.scope = MDUpdater.options.scope;
        } else if (!isToFeed) {
          requestData.scope = {
            radioProjectIds: '',
            shareGroupIds: [],
            shareProjectIds: [MDUpdater.options.selectGroupOptions.projectId],
          };
        } else {
          alert(_l('请选择群组'), 3);
          return;
        }

        MDUpdater.isPosting = true;
        MDUpdater.controller?.setPosting(true);
        let posted = false;

        postAjax
          .addPost(requestData)
          .then(
            result => {
              if (!result.success) {
                alert(_l('发布动态失败'), 2);
                return;
              }

              posted = true;

              const isFeedPage = MDUpdater.options.createShare && window.location.pathname.includes('/feed');

              if (isFeedPage) {
                alert(_l('发布成功'));
              } else {
                if (MDUpdater.options.createShare) {
                  createShare({
                    linkURL: pathCompletion(`/feeddetail?itemID=${result.post.postID}`),
                    content: _l('动态创建成功'),
                  });
                }

                if (MDUpdater.options.callback) {
                  MDUpdater.options.callback(result.post);
                } else {
                  alert(_l('分享成功'));
                }
              }

              $textarea.val('');
              if (_.isFunction(textareaElement.reset)) {
                textareaElement.reset();
                textareaElement.clearStore();
              }

              MDUpdater.resetUpdater(true);
            },
            _requestError => {
              alertIfNotUnauthorized(_requestError, _l('发布动态失败'), 2);
            },
          )
          .finally(() => {
            MDUpdater.isPosting = false;
            MDUpdater.controller?.setPosting(false);

            if (posted) {
              MDUpdater.destroyRoots();
              MDUpdater.modal?.destroy();
            }
          });
      };

      if (_.isFunction(textareaElement.val)) {
        textareaElement.val(handlePost);
      } else {
        handlePost(textareaElement.value);
      }
    },

    showUpdaterDivForDocCenter(nextOptions) {
      if (nextOptions) {
        Object.assign(MDUpdater.options, nextOptions);
      }

      MDUpdater.options.attachmentData = [...MDUpdater.options.defaultAttachmentData];
      MDUpdater.options.kcAttachmentData = [...MDUpdater.options.defaultKcAttachmentData];

      const hasDefaultAttachments =
        MDUpdater.options.defaultAttachmentData.length + MDUpdater.options.defaultKcAttachmentData.length > 0;
      const defaultPostType = hasDefaultAttachments
        ? MDUpdater.options.postType.attachment
        : Number(MDUpdater.options.defaultPostType);
      const isAvailableDefaultTab =
        (defaultPostType === MDUpdater.options.postType.attachment &&
          MDUpdater.options.showType.includes('attachment')) ||
        (defaultPostType === MDUpdater.options.postType.vote && MDUpdater.options.showType.includes('vote'));
      const initialActiveTab = isAvailableDefaultTab ? String(defaultPostType) : '';
      const initialPostType = isAvailableDefaultTab ? defaultPostType : MDUpdater.options.postType.post;
      const { defaultValue, ...selectGroupOptions } = MDUpdater.options.selectGroupOptions;
      const initialShareGroup = defaultValue
        ? { shareGroupIds: [defaultValue], shareProjectIds: [], radioProjectIds: [] }
        : {};

      MDUpdater.handleGroupChange(initialShareGroup);

      MDUpdater.modal = Modal.confirm({
        afterClose: MDUpdater.destroyRoots,
        onCancel: MDUpdater.destroyRoots,
        wrapClassName: 'easyDialogBoxMDUpdater',
        width: 640,
        footer: null,
        styles: {
          header: { padding: 0 },
          body: { padding: 0, overflow: 'visible' },
          container: { padding: 0 },
        },
        content: (
          <CreateFeedContent
            defaultAttachmentData={MDUpdater.options.attachmentData}
            defaultKcAttachmentData={MDUpdater.options.kcAttachmentData}
            initialActiveTab={initialActiveTab}
            initialShareGroup={initialShareGroup}
            knowledge={MDUpdater.options.knowledge}
            postMsg={MDUpdater.options.postMsg}
            selectGroupOptions={selectGroupOptions}
            showToFeed={MDUpdater.options.showToFeed}
            showType={MDUpdater.options.showType}
            onAttachmentDataChange={data => {
              MDUpdater.options.attachmentData = data;
            }}
            onGroupChange={MDUpdater.handleGroupChange}
            onKcAttachmentDataChange={data => {
              MDUpdater.options.kcAttachmentData = data;
            }}
            onEmotionSelect={() => {
              const textareaElement = document.getElementById('MDUpdater_textarea_Updater');

              if (MDUpdater.isPlaceholder(textareaElement.value)) {
                textareaElement.value = '';
              }
            }}
            onMount={controller => MDUpdater.bindEvent(controller, initialPostType)}
            onPost={MDUpdater.postUpdater}
            onTabChange={MDUpdater.changeUpdaterType}
            onUploadComplete={MDUpdater.handleUploadComplete}
          />
        ),
      });
    },

    destroyRoots() {
      if (MDUpdater.voteElement) {
        VoteUpdater.destroy($(MDUpdater.voteElement));
      }

      MDUpdater.voteElement = null;
      MDUpdater.controller = null;
    },

    bindEvent(controller, defaultPostType) {
      MDUpdater.controller = controller;
      MDUpdater.voteElement = document.getElementById('MDUpdater_Vote_updater');
      const $textarea = $('#MDUpdater_textarea_Updater');
      const textareaElement = $textarea.get(0);

      setTimeout(() => textareaElement?.focus(), 10);

      $textarea
        .on('focus.createFeed', () => {
          if (MDUpdater.isPlaceholder($textarea.val())) {
            $textarea.val('');
          }

          $textarea.removeClass('textTertiary');
        })
        .on('blur.createFeed', function () {
          if (_.isFunction(textareaElement.store)) {
            textareaElement.store();
          }

          if (!$(this).val().trim()) {
            $textarea
              .val(MDUpdater.getPlaceholder(Number($('#MDUpdater_hidden_UpdaterType').val())))
              .addClass('textTertiary');
          }
        });

      if (typeof $textarea.autoTextarea === 'function') {
        $textarea.autoTextarea({ maxHeight: 150, minHeight: 72 });
      }

      controller.openMentionsInput({
        input: textareaElement,
        submitBtn: 'MDUpdater_button_Share',
        showCategory: true,
        cacheKey: 'updatertext',
        reset: false,
        initCallback: () => {
          if (!MDUpdater.options.postMsg) {
            textareaElement.restore(success => {
              if (success) {
                $textarea.removeClass('textTertiary');
              } else {
                $textarea.val(MDUpdater.getPlaceholder(defaultPostType)).addClass('textTertiary');
              }
            });
          }
        },
      });

      if (defaultPostType === MDUpdater.options.postType.vote) {
        VoteUpdater.init($('#MDUpdater_Vote_updater'));
      }

      if (!MDUpdater.options.postMsg && !$textarea.val()) {
        $textarea.val(MDUpdater.getPlaceholder(defaultPostType)).addClass('textTertiary');
      }
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
