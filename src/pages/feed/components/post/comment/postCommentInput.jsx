import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAway = createDecoratedComponent(withClickAway);
import { addComment } from '../../../redux/postActions';
import { connect } from 'react-redux';
import { SOURCE_TYPE } from 'src/components/comment/config';
import UploadFiles from 'src/components/UploadFiles';
import 'src/components/selectGroup/selectAllGroup';
import 'src/components/mentioninput/mentionsInput';
import 'src/components/autoTextarea/autoTextarea';
import 'src/components/uploadAttachment/uploadAttachment';
import Emotion from 'src/components/emotion/emotion';
import _, { bind } from 'lodash';

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
  };

  componentDidMount() {
    this.initTextarea();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isReshare !== this.state.isReshare) {
      this.resetSelectGroup(nextState.isReshare);
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
    $(textarea).off();
    $(button).off();
  }

  @autobind
  componentClickAway(e) {
    if ($(e.target).attr('type') !== 'file' && this.state.isUploadComplete) {
      this.setState({ isEditing: false });
    }
  }

  initTextarea() {
    const comp = this;
    const { postItem, dispatch } = this.props;
    const isToComment = !!postItem.commentID;

    const hidUpdaterUploadID = 'hidUpload_' + postItem.postID + '_' + postItem.commentID + 'C';
    const uploadID = 'cm_' + postItem.postID + '_' + postItem.commentID + 'C';

    const textarea = this.textarea;
    const button = this.button;
    const selectGroup = this.selectGroup;

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
            $(textarea).mentionsInput('val', data => {
              const commentMsg = data;

              if (!commentMsg || !$.trim(commentMsg)) {
                alert(_l('发表内容不能为空'), 3);
                return false;
              } else if (commentMsg.length > 3000) {
                alert(_l('发表内容过长，最多允许3000个字符'), 3);
                return false;
              }

              const isReshare = comp.state.isReshare;

              const scope = $(selectGroup).SelectGroup('getScope');

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
                    $(textarea).mentionsInput('reset');
                    if (commentUpload) {
                      commentUpload.clearAttachment();
                    }
                    comp.resetSelectGroup();
                    _.remove(comp.state.attachments);
                    _.remove(comp.state.kcAttachments);
                    // 卸载上传组件
                    // comp.state.uploadAttachmentObj.unmount();
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
        if (!comp.state.uploadAttachmentObj) {
        }

        if (comp.state.isUploadComplete) {
          comp.setState(newState);
        }
      })
      .mentionsInput({
        submitBtn: 'buttonComment_' + postItem.postID + '_' + postItem.commentID,
        searchType: 0,
        showCategory: true,
        sourceType: SOURCE_TYPE.POST,
        isAtAll: true,
        projectId: _.get(postItem, 'projectIds[0]'),
      })
      .val(isToComment ? '' : LET_ME_REPLY);

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

  handleReshareToggle = evt => {
    const { isReshare } = this.state;
    this.setState({
      isReshare: !isReshare,
    });
  };

  resetSelectGroup(isReshare) {
    const selectGroup = this.selectGroup;
    if (!isReshare) {
      $(selectGroup).next('.viewTo').remove();
      return;
    }
    const selectGroupOptions = { defaultValue: { group: [], project: [] }, groupLink: true };
    $(selectGroup).SelectGroup(selectGroupOptions);
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

  render() {
    const postItem = this.props.postItem;
    const isToComment = !!postItem.commentID;
    const dropElementID = 'text_' + postItem.postID + '_' + postItem.commentID + 'C';
    return (
      <ClickAway onClickAway={this.componentClickAway}>
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
                <span data-tip={_l('同时转发此条')}>
                  <i
                    className={cx('relayBtn icon-forward2 Font19 ThemeColor3', {
                      hoverRelayBtn: !this.state.isReshare,
                    })}
                    onClick={this.handleReshareToggle}
                  />
                </span>
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
                <input
                  id={'hidden_GroupID_' + postItem.postID + '_' + postItem.commentID + 'C'}
                  type="hidden"
                  defaultValue="everyone"
                  ref={selectGroup => {
                    this.selectGroup = selectGroup;
                  }}
                />
              </div>
              <input type="hidden" id={'hidUpload_' + postItem.postID + '_' + postItem.commentID + 'C'} />
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

export default connect(state => ({}))(PostCommentInput);
