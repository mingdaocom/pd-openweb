import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import 'src/components/autoTextarea/autoTextarea';
import { SOURCE_TYPE } from 'src/components/comment/config';
import Emotion from 'src/components/emotion';
import { useMentionsInput } from 'src/components/MentionsInput';
import UploadFiles from 'src/components/UploadFiles';
import { addComment } from '../../../redux/postActions';

const TEXT_AREA_MIN_HEIGHT_EXPAND = 50;
const TEXT_AREA_MAX_HEIGHT = 180;
const getDefaultScope = () => ({
  shareGroupIds: [],
  shareProjectIds: [],
  radioProjectIds: [],
});
const getReplyPlaceholder = () => _l('我来回复');

/**
 * 动态回复输入框
 */
class PostCommentInput extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    onPublished: PropTypes.func,
    focus: PropTypes.bool,
    isPostDetail: PropTypes.bool,
    openMentionsInput: PropTypes.func,
  };

  state = {
    isEditing: false,
    isReshare: false,
    uploadAttachmentObj: undefined,
    showAttachment: false,
    attachments: [],
    kcAttachments: [],
    isUploadComplete: true,
    isSubmitting: false,
    scope: getDefaultScope(),
  };

  componentDidMount() {
    this.initTextarea();
  }

  componentDidUpdate(prevProps, prevState) {
    const postItem = this.props.postItem;
    const isToComment = !!postItem.commentID;

    if (prevState.isReshare !== this.state.isReshare) {
      this.resetSelectGroup();
    }

    if (prevState.isEditing !== this.state.isEditing) {
      const textarea = this.textarea;

      if (this.state.isEditing) {
        const $textarea = $(textarea);

        if (typeof $textarea.autoTextarea === 'function') {
          $textarea.autoTextarea({
            maxHeight: TEXT_AREA_MAX_HEIGHT,
            minHeight: TEXT_AREA_MIN_HEIGHT_EXPAND,
          });
        }
      } else if (!this.state.hasAttachment) {
        textarea.style.height = '';
      }

      if (!this.state.isEditing && !$(textarea).val()) {
        $(textarea).val(isToComment ? '' : getReplyPlaceholder());
      }
    }

    if (prevProps.postItem.postID !== postItem.postID) {
      this.initTextarea();
    }
  }

  componentWillUnmount() {
    const textarea = this.textarea;
    this.unmounted = true;
    textarea.destroy && textarea.destroy();
    $(textarea).off();
  }

  componentClickAway = e => {
    if ($(e.target).attr('type') !== 'file' && this.state.isUploadComplete) {
      this.setState({ isEditing: false });
    }
  };

  initTextarea() {
    const comp = this;
    const { postItem } = this.props;
    const isToComment = !!postItem.commentID;
    const textarea = this.textarea;

    $(textarea)
      .off()
      .removeAttr('data-mentions-input')
      .removeData('mentionsInput')
      .focus(function commentInputOnFocus() {
        $(this).removeClass('textPlaceholder');
        if (!isToComment && $(this).val() === getReplyPlaceholder()) {
          $(this).val('');
        }

        const newState = { isEditing: true };

        if (comp.state.isUploadComplete) {
          comp.setState(newState);
        }
      })
      .val(isToComment ? '' : getReplyPlaceholder());

    this.props.openMentionsInput({
      input: textarea,
      popupAlignOffset: [0, -10],
      // getPopupContainer: () => textarea.parentNode.parentNode,
      submitBtn: 'buttonComment_' + postItem.postID + '_' + postItem.commentID,
      searchType: 0,
      showCategory: true,
      sourceType: SOURCE_TYPE.POST,
      isAtAll: true,
      projectId: _.get(postItem, 'projectIds[0]'),
    });

    if (comp.props.focus) {
      $(textarea).focus();
    }
  }

  finishSubmitting = () => {
    this.isSubmitting = false;
    if (!this.unmounted) {
      this.setState({ isSubmitting: false });
    }
  };

  handleSubmit = () => {
    if (this.isSubmitting) return;

    const textarea = this.textarea;

    const submit = commentMsg => {
      const { dispatch, postItem } = this.props;

      if (!commentMsg || !commentMsg.trim()) {
        alert(_l('发表内容不能为空'), 3);
        return;
      }

      if (commentMsg.length > 3000) {
        alert(_l('发表内容过长，最多允许3000个字符'), 3);
        return;
      }

      const { attachments, isReshare, isUploadComplete, kcAttachments, scope, uploadAttachmentObj } = this.state;

      if (!isUploadComplete) {
        alert(_l('文件上传中，请稍等'), 3);
        return;
      }

      if (attachments.some(attachment => attachment.inEdit)) {
        alert(_l('请先保存文件名'), 3);
        return;
      }

      this.isSubmitting = true;
      this.setState({ isSubmitting: true });
      dispatch(
        addComment(
          {
            message: commentMsg,
            postID: postItem.postID,
            replyID: postItem.commentID,
            replyAccountId: postItem.user.accountId,
            isReshared: isReshare ? 'True' : undefined,
            attachments: JSON.stringify(attachments),
            knowledgeAttach: JSON.stringify(kcAttachments),
            scope: isReshare ? scope : undefined,
          },
          () => {
            this.isSubmitting = false;
            if (this.unmounted) return;

            textarea.reset();
            uploadAttachmentObj && uploadAttachmentObj.clearAttachment();
            $(textarea).blur();
            this.setState(
              {
                isEditing: false,
                isReshare: false,
                uploadAttachmentObj: false,
                showAttachment: false,
                hasAttachment: false,
                isUploadComplete: true,
                isSubmitting: false,
                attachments: [],
                kcAttachments: [],
                scope: getDefaultScope(),
              },
              () => this.props.onPublished && this.props.onPublished(),
            );
          },
          this.finishSubmitting,
        ),
      );
    };

    if (typeof textarea.val === 'function') {
      textarea.val(submit);
    } else {
      submit(textarea.value);
    }
  };

  handleReshareToggle = () => {
    const { isReshare } = this.state;
    this.setState({
      isReshare: !isReshare,
    });
  };

  resetSelectGroup() {
    this.setState({
      scope: getDefaultScope(),
    });
  }

  handleOpenUploadFiles() {
    const { showAttachment } = this.state;
    this.setState({
      showAttachment: !showAttachment,
    });
  }

  textareaFocus() {
    $(this.textarea).focus();
  }

  handleOpen(result) {
    const postItem = this.props.postItem;
    const dropElementID = 'cm_' + postItem.postID + '_' + postItem.commentID + 'C';
    const $Attachment_updater = $(`#${dropElementID}`).parent();

    if (!$Attachment_updater.hasClass('colorPrimary')) {
      $Attachment_updater.click();
    }

    this.setState({
      attachments: result,
      hasAttachment: !!result.length,
    });
  }

  handleUploadComplete(bool) {
    this.setState({ isUploadComplete: bool });
    const postItem = this.props.postItem;
    const dropElementID = 'text_' + postItem.postID + '_' + postItem.commentID + 'C';
    const $textarea = $(`#${dropElementID}`);
    const value = $textarea.val();

    if (
      bool &&
      (!value || value == getReplyPlaceholder()) &&
      (this.state.attachments.length || this.state.kcAttachments.length)
    ) {
      $textarea.val(
        this.state.attachments.length
          ? this.state.attachments[0].originalFileName
          : this.state.kcAttachments[0].originalFileName,
      );
      $textarea.focus();
    }
  }

  handleChangeGroup = value => {
    this.setState({
      scope:
        !value.isMe &&
        !(value.shareGroupIds || []).length &&
        !(value.shareProjectIds || []).length &&
        !(value.radioProjectIds || []).length
          ? undefined
          : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']),
    });
  };

  render() {
    const postItem = this.props.postItem;
    const isToComment = !!postItem.commentID;
    const dropElementID = 'text_' + postItem.postID + '_' + postItem.commentID + 'C';
    return (
      <ClickAway
        onClickAwayExceptions={['.quickSelectGroup', '.mentionsAutocompleteList', '.hap-popover']}
        onClickAway={this.componentClickAway}
      >
        <div className="postCommentBox">
          <div
            className={cx('replyFrame', { replyFrameFocus: this.state.isEditing })}
            ref={replyFrame => {
              this.replyFrame = replyFrame;
            }}
          >
            <div className="firstRow">
              <div className="commentBoxTextareaContainer">
                <div className="textareaContainer">
                  <textarea
                    ref={textarea => {
                      this.textarea = textarea;
                    }}
                    id={'text_' + postItem.postID + '_' + postItem.commentID + 'C'}
                    className={'commentBoxTextarea ' + (this.state.isEditing ? '' : 'textPlaceholder')}
                    defaultValue={isToComment ? '' : getReplyPlaceholder()}
                  />
                </div>
              </div>
            </div>

            <div className={'secondRow ' + (this.state.isEditing || this.state.hasAttachment ? '' : 'hide')}>
              <div className="clearfix Relative">
                <span
                  onClick={() => {
                    this.handleOpenUploadFiles();
                  }}
                  className={cx('left Hand commentUploadAttachment mRight12', {
                    colorPrimary: this.state.showAttachment,
                  })}
                >
                  <i
                    className="icon-attachment icon-attachment Font18 TxtMiddle"
                    id={'cm_' + postItem.postID + '_' + postItem.commentID + 'C'}
                  />
                </span>
                <div className="left faceArea mRight12">
                  <div>
                    <Emotion input={() => this.textarea} placement="bottomLeft">
                      <button
                        type="button"
                        className="emotionTriggerButton faceBtn icon-smile Font18 textPlaceholder TxtMiddle"
                        aria-label={_l('表情')}
                        title={_l('表情')}
                      />
                    </Emotion>
                    <div className="Clear" />
                  </div>
                </div>
                <Tooltip title={_l('同时转发此条')}>
                  <span>
                    <i
                      className={cx('relayBtn icon-forward2 Font19 colorPrimary', {
                        hoverRelayBtn: !this.state.isReshare,
                      })}
                      onClick={this.handleReshareToggle}
                    />
                  </span>
                </Tooltip>
                <div className="flex"></div>
                <Button
                  id={'buttonComment_' + postItem.postID + '_' + postItem.commentID}
                  className="mRight12"
                  type="primary"
                  size="small"
                  loading={this.state.isSubmitting}
                  onClick={this.handleSubmit}
                >
                  {_l('回复')}
                </Button>
                {this.state.isReshare && (
                  <SelectGroupPopover
                    defaultValue={{ isMe: true }}
                    getPopupContainer={() => document.body}
                    onChange={this.handleChangeGroup}
                  />
                )}
              </div>
              <div className={cx({ hide: !this.state.showAttachment })} style={{ padding: '0 5px' }}>
                <UploadFiles
                  dropPasteElement={dropElementID}
                  onDropPasting={() => {
                    this.textareaFocus();
                    !this.state.isUploadComplete && this.handleOpen([]);
                  }}
                  arrowLeft={4}
                  temporaryData={this.state.attachments}
                  kcAttachmentData={this.state.kcAttachments}
                  onTemporaryDataUpdate={result => {
                    this.handleOpen(result);
                  }}
                  onKcAttachmentDataUpdate={result => {
                    this.setState({ kcAttachments: result, hasAttachment: !!result.length });
                  }}
                  onUploadComplete={bool => {
                    this.handleUploadComplete(bool);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </ClickAway>
    );
  }
}

export default connect()(
  withOpeners(PostCommentInput, {
    openMentionsInput: useMentionsInput,
  }),
);
