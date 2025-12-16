import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { SelectGroupTrigger } from 'ming-ui/functions/quickSelectGroup';
import 'src/components/autoTextarea/autoTextarea';
import { SOURCE_TYPE } from 'src/components/comment/config';
import Emotion from 'src/components/emotion/emotion';
import MentionsInput from 'src/components/MentionsInput';
import UploadFiles from 'src/components/UploadFiles';
import { addComment } from '../../../redux/postActions';

const ClickAway = createDecoratedComponent(withClickAway);

const LET_ME_REPLY = _l('我来回复');
const TEXT_AREA_MIN_HEIGHT_COLLAPSE = 22;
const TEXT_AREA_MIN_HEIGHT_EXPAND = 50;
const TEXT_AREA_MAX_HEIGHT = 180;

/**
 * 动态回复输入框
 */
class PostCommentInput extends React.Component {
  static propTypes = {
    postItem: PropTypes.object,
    onPublished: PropTypes.func,
    focus: PropTypes.bool,
    isPostDetail: PropTypes.bool,
  };

  state = {
    isEditing: false,
    isReshare: false,
    uploadAttachmentObj: undefined,
    showAttachment: false,
    attachments: [],
    kcAttachments: [],
    isUploadComplete: true,
    scope: {
      shareGroupIds: [],
      shareProjectIds: [],
      radioProjectIds: [],
    },
  };

  componentDidMount() {
    this.initTextarea();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isReshare !== this.state.isReshare) {
      this.resetSelectGroup();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const postItem = this.props.postItem;
    const isToComment = !!postItem.commentID;
    if (prevState.isEditing !== this.state.isEditing) {
      const textarea = this.textarea;
      if (this.state.isEditing) {
        $(textarea).autoTextarea({
          maxHeight: TEXT_AREA_MAX_HEIGHT,
          minHeight: this.state.isEditing ? TEXT_AREA_MIN_HEIGHT_EXPAND : TEXT_AREA_MIN_HEIGHT_COLLAPSE,
        });
      } else if (!this.state.hasAttachment) {
        textarea.style.height = '';
      }
      if (!this.state.isEditing && !$(textarea).val()) {
        $(textarea).val(isToComment ? '' : LET_ME_REPLY);
      }
    }
    if (prevProps.postItem.postID !== postItem.postID) {
      this.initTextarea();
    }
  }

  componentWillUnmount() {
    const textarea = this.textarea;
    const button = this.button;
    textarea.destroy && textarea.destroy();
    $(textarea).off();
    $(button).off();
  }

  componentClickAway = e => {
    if ($(e.target).attr('type') !== 'file' && this.state.isUploadComplete) {
      this.setState({ isEditing: false });
    }
  };

  initTextarea() {
    const comp = this;
    const { postItem, dispatch } = this.props;
    const isToComment = !!postItem.commentID;
    const uploadID = 'cm_' + postItem.postID + '_' + postItem.commentID + 'C';
    const textarea = this.textarea;
    const button = this.button;

    $(textarea)
      .off()
      .removeAttr('data-mentions-input')
      .removeData('mentionsInput')
      .focus(function commentInputOnFocus() {
        $(this).removeClass('Gray_c');
        if (!isToComment && $(this).val() === LET_ME_REPLY) {
          $(this).val('');
        }

        if (!comp.bound) {
          $(button).click(() => {
            textarea.val(data => {
              const commentMsg = data;

              if (!commentMsg || !(commentMsg || '').trim()) {
                alert(_l('发表内容不能为空'), 3);
                return false;
              } else if (commentMsg.length > 3000) {
                alert(_l('发表内容过长，最多允许3000个字符'), 3);
                return false;
              }

              const isReshare = comp.state.isReshare;
              const scope = isReshare ? comp.state.scope : undefined;

              // 附件
              const attachments = comp.state.attachments;
              const kcAttachments = comp.state.kcAttachments;
              const commentUpload = comp.state.uploadAttachmentObj;
              const isUploadComplete = comp.state.isUploadComplete;
              if (!isUploadComplete) {
                alert(_l('文件上传中，请稍等'), 3);
                return false;
              }

              if (attachments.length > 0) {
                const editingAttachments = _.filter(attachments, att => att.inEdit);
                if (editingAttachments.length > 0) {
                  alert(_l('请先保存文件名'), 3);
                  return false;
                }
              }

              $(button).addClass('Disabled').prop('disabled', true);
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
                    scope: scope,
                  },
                  () => {
                    textarea.reset();
                    if (commentUpload) {
                      commentUpload.clearAttachment();
                    }
                    comp.resetSelectGroup();
                    _.remove(comp.state.attachments);
                    _.remove(comp.state.kcAttachments);
                    // 卸载上传组件
                    $('#' + uploadID).removeClass('ThemeColor3');
                    comp.setState({
                      isReshare: false,
                      uploadAttachmentObj: false,
                      isUploadComplete: true,
                      attachments: [],
                      kcAttachments: [],
                    });
                    $(textarea).blur();
                    $(button).removeClass('Disabled').prop('disabled', false);
                    if (comp.props.onPublished) {
                      comp.props.onPublished();
                    }
                    comp.setState({
                      isEditing: false,
                      hasAttachment: false,
                    });
                    $(button).removeClass('Disabled').prop('disabled', false);
                  },
                  () => {
                    $(button).removeClass('Disabled').prop('disabled', false);
                  },
                ),
              );
            });
          });
          comp.bound = true;
        }

        const newState = { isEditing: true };

        if (comp.state.isUploadComplete) {
          comp.setState(newState);
        }
      })
      .val(isToComment ? '' : LET_ME_REPLY);

    MentionsInput({
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

    new Emotion(this.faceBtn, {
      input: '#text_' + this.props.postItem.postID + '_' + this.props.postItem.commentID + 'C',
      placement: 'left bottom',
      relatedLeftSpace: -17,
      relatedTopSpace: 5,
      mdBear: false,
    });
  }

  handleReshareToggle = () => {
    const { isReshare } = this.state;
    this.setState({
      isReshare: !isReshare,
    });
  };

  resetSelectGroup() {
    this.setState({
      scope: {
        shareGroupIds: [],
        shareProjectIds: [],
        radioProjectIds: [],
      },
    });
  }

  handleMouseover = () => {
    $(this.faceBtn).removeClass('icon-smile').addClass('icon-smilingFace ThemeColor3');
  };

  handleMouseout = () => {
    $(this.faceBtn).addClass('icon-smile').removeClass('icon-smilingFace ThemeColor3');
  };

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
    if (!$Attachment_updater.hasClass('ThemeColor3')) {
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
      (!value || value == _l('我来回复')) &&
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
        onClickAwayExceptions={['.quickSelectGroup', '.mentionsAutocompleteList']}
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
                    className={'commentBoxTextarea ' + (this.state.isEditing ? '' : 'Gray_c')}
                    defaultValue={isToComment ? '' : LET_ME_REPLY}
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
                    ThemeColor3: this.state.showAttachment,
                  })}
                >
                  <i
                    className="icon-attachment icon-attachment Font18 TxtMiddle"
                    id={'cm_' + postItem.postID + '_' + postItem.commentID + 'C'}
                  />
                </span>
                <div className="left faceArea mRight12">
                  <div>
                    <a
                      className="faceBtn icon-smile Font18 Gray_c TxtMiddle"
                      ref={faceBtn => {
                        this.faceBtn = faceBtn;
                      }}
                      onMouseOver={this.handleMouseover}
                      onMouseOut={this.handleMouseout}
                    />
                    <div className="Clear" />
                  </div>
                </div>
                <Tooltip title={_l('同时转发此条')}>
                  <span>
                    <i
                      className={cx('relayBtn icon-forward2 Font19 ThemeColor3', {
                        hoverRelayBtn: !this.state.isReshare,
                      })}
                      onClick={this.handleReshareToggle}
                    />
                  </span>
                </Tooltip>
                <div className="flex"></div>
                <input
                  id={'buttonComment_' + postItem.postID + '_' + postItem.commentID}
                  className="mRight12 btnBootstrap btnBootstrap-primary btnBootstrap-small"
                  type="button"
                  ref={button => {
                    this.button = button;
                  }}
                  defaultValue={_l('回复')}
                />
                {this.state.isReshare && (
                  <SelectGroupTrigger
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

export default connect()(PostCommentInput);
