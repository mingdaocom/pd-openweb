﻿import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Button from 'ming-ui/components/Button';
import Icon from 'ming-ui/components/Icon';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { SelectGroupTrigger } from 'ming-ui/functions/quickSelectGroup';
import discussionAjax from 'src/api/discussion';
import postAjax from 'src/api/post';
import 'src/components/autoTextarea/autoTextarea';
import Emotion from 'src/components/emotion/emotion';
import MentionsInput from 'src/components/MentionsInput';
import UploadFiles from 'src/components/UploadFiles';
import { generateRandomPassword } from 'src/utils/common';
import { AT_ALL_TEXT } from './config';
import { SOURCE_TYPE } from './config';
import './css/commenter.less';

const ClickAwayable = createDecoratedComponent(withClickAway);

class Commenter extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    activePlaceholder: PropTypes.string,
    textareaMaxHeight: PropTypes.number,
    textareaMinHeight: PropTypes.number,
    textareaExpandHeight: PropTypes.number,

    storageId: PropTypes.string, // 缓存未发成功的讨论文本

    autoFocus: PropTypes.bool, // 是否focus
    autoShrink: PropTypes.bool, // 失去焦点后是否收起
    shrinkAfterSubmit: PropTypes.bool, // 发送完后收起

    disableMentions: PropTypes.bool, // 是否禁用@功能
    mentionsOptions: PropTypes.shape({
      placement: PropTypes.string,
      relatedLeftSpace: PropTypes.number,
      relatedTopSpace: PropTypes.number,
      isAtAll: PropTypes.bool,
    }), // @功能的参数

    canAddLink: PropTypes.bool, // 是否支持添加链接文件
    disableShareToPost: PropTypes.bool, // 禁用分享到动态
    sendPost: PropTypes.bool, // 开启分享到动态功能
    selectGroupOptions: PropTypes.shape({
      position: PropTypes.string,
      projectId: PropTypes.string,
    }), // 群组参数

    // params
    sourceId: PropTypes.string.isRequired,
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)),
    replyId: PropTypes.string,
    appId: PropTypes.string,
    remark: PropTypes.string,
    accountId: PropTypes.string,
    fromAppId: PropTypes.string,

    submitButtonText: PropTypes.string, // 按钮文本
    onSubmit: PropTypes.func.isRequired, // 提交回调方法
    onSubmitCallback: PropTypes.func,

    onFocusStateChange: PropTypes.func, // textarea 获取失去焦点时的回调
  };

  static defaultProps = {
    placeholder: _l('发送讨论（按Ctrl+Enter快速发布）'),
    canAddLink: true,
    textareaMaxHeight: 180,
    textareaMinHeight: 50,
    textareaExpandHeight: 50,
    autoShrink: true,
    shrinkAfterSubmit: false,
    sendPost: true,
    autoFocus: false,
    groups: undefined,
    onSubmitCallback: () => {},
  };

  constructor(props) {
    super(props);
    this.textareaId = 'Commenter_' + generateRandomPassword(16);
    this.state = {
      isEditing: false,
      isReshare: false,
      showAttachment: false,
      disabled: false,
      attachmentData: [],
      kcAttachmentData: [],
      isUploadComplete: true,
    };
  }

  componentDidMount() {
    const { textarea, faceBtn } = this;
    const { textareaMaxHeight, textareaMinHeight, projectId } = this.props;
    const comp = this;

    // 文本框
    const $textarea = $(textarea);
    $textarea
      .autoTextarea({
        maxHeight: textareaMaxHeight,
        minHeight: textareaMinHeight,
      })
      .height(textareaMinHeight);
    // 缓存未发送成功的讨论
    if (this.props.storageId) {
      $textarea.on('keyup', function () {
        const text = $.trim($(this).val());
        if (!text) {
          window.localStorage.removeItem('commenter-' + comp.props.storageId);
        } else {
          safeLocalStorageSetItem('commenter-' + comp.props.storageId, text);
        }
      });
    }

    // @
    if (!this.props.disableMentions) {
      const { sourceType } = this.props;
      sessionStorage.setItem('atData', JSON.stringify(this.props.atData || []));
      MentionsInput(
        Object.assign(
          {
            input: textarea,
            // getPopupContainer: () => textarea.parentNode,
            popupAlignOffset: [0, -5],
            submitBtn: this.textareaId + '-submit',
            reset: false,
            searchType: sourceType === SOURCE_TYPE.POST ? 0 : 1,
            showCategory: sourceType === SOURCE_TYPE.POST,
            isAtAll: true,
            sourceType,
            forReacordDiscussion: this.props.forReacordDiscussion,
            projectId,
          },
          this.props.mentionsOptions,
        ),
      );
    }

    // 表情
    new Emotion(faceBtn, {
      input: this.textarea,
      placement: 'left bottom',
      relatedLeftSpace: -38 + (this.props.relatedLeftSpace || 0),
      relatedTopSpace: 5,
      offset: this.props.offset,
      popupContainer: this.props.popupContainer,
    });

    // 获得焦点
    if (this.props.autoFocus) {
      // 处理withClickAway 第一次就触发引起的第一次焦点无法focus的bug
      setTimeout(() => {
        $textarea.focus();
      }, 50);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.storageId && nextProps.storageId !== this.props.storageId) {
      this.textarea.value = window.localStorage.getItem('commenter-' + nextProps.storageId) || '';
    }
    if (!nextProps.disableMentions && nextProps.forReacordDiscussion) {
      sessionStorage.setItem('atData', JSON.stringify(nextProps.atData || []));
    }
    if (
      !_.isEqual(_.pick(this.props, ['entityType', 'isHide']), _.pick(nextProps, ['entityType', 'isHide'])) &&
      nextProps.autoFocus
    ) {
      setTimeout(() => {
        $(this.textarea).focus();
      }, 50);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const $textarea = $(this.textarea);
    const { isEditing, attachmentData, kcAttachmentData } = this.state;
    const { textareaMaxHeight, textareaMinHeight, textareaExpandHeight } = this.props;
    const hasAttachment = attachmentData.length || kcAttachmentData.length;
    if (isEditing !== prevState.isEditing) {
      const height = isEditing || hasAttachment ? textareaExpandHeight : textareaMinHeight;
      if (isEditing) {
        $textarea.autoTextarea({
          maxHeight: textareaMaxHeight,
          minHeight: height,
        });
      } else {
        setTimeout(function () {
          $textarea.height(height);
        }, 0);
      }
    }
  }

  componentWillUnmount() {
    this.textarea.destroy && this.textarea.destroy();
  }

  /**
   * 附件上传成功
   * @param  {boolean} res
   */
  onUploadComplete(res) {
    this.setState({ isUploadComplete: res });

    if (res && !$(this.textarea).val() && (this.state.attachmentData.length || this.state.kcAttachmentData.length)) {
      $(this.textarea).val(
        this.state.attachmentData.length
          ? this.state.attachmentData[0].originalFileName
          : this.state.kcAttachmentData[0].originalFileName,
      );
    }
  }

  onClickAway() {
    if (this.state.isUploadComplete) {
      if (this.props.onFocusStateChange) {
        this.props.onFocusStateChange.call(null, false);
      }
      if (this.props.autoShrink) {
        this.setState({ isEditing: false });
        this.textarea.blur();
      }
    }
  }

  handleSubmit() {
    const { groups } = this.state;

    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return false;
    }
    if (this.state.isReshare && !groups) {
      alert(_l('请选择分享范围'), 3);
      return false;
    }

    const textarea = this.textarea;
    const $textarea = $(textarea);
    const getMessagePromise = this.props.disableMentions
      ? Promise.resolve($textarea.val())
      : new Promise(resolve => {
          textarea.val(data => resolve(data));
        });
    getMessagePromise.then(data => {
      let message = $.trim(data);

      if (!message || message.length > 3000) {
        if (message) {
          alert(_l('发表内容过长，最多允许3000个'), 3);
        }
        return false;
      }

      let attachments = this.state.attachmentData;
      let kcAttachmentData = this.state.kcAttachmentData;

      this.setState({ disabled: true });

      const {
        sourceId,
        sourceType,
        replyId,
        appId,
        instanceId,
        workId,
        remark,
        extendsId,
        entityType,
        forReacordDiscussion,
        onSubmit,
      } = this.props;

      if (sourceType === SOURCE_TYPE.POST) {
        const { accountId } = this.props;
        postAjax
          .addPostComment({
            uType: 'AddComment',
            postID: sourceId,
            message,
            isReshared: JSON.stringify(groups) !== undefined,
            scope: groups,
            replyID: replyId,
            replyAccountId: replyId ? accountId : undefined,
            attachments: JSON.stringify(attachments),
            knowledgeAttach: JSON.stringify(kcAttachmentData),
          })
          .then(result => {
            if (result.success === 'True') {
              onSubmit(result.comment);
              this.clearLocalStorage();
            } else {
              Promise.reject(result.error);
            }
          })
          .catch(function (text) {
            alert(text || _l('操作失败'), 2);
          });
      } else {
        discussionAjax
          .addDiscussion({
            sourceId,
            sourceType,
            message,
            replyId,
            attachments: JSON.stringify(attachments),
            knowledgeAtts: JSON.stringify(kcAttachmentData),
            appId,
            extendsId,
            instanceId,
            workId,
            entityType: forReacordDiscussion && entityType === 2 ? 2 : 0, //后端接口只区分0 2
          })
          .then(res => {
            if (res && res.code === 1) {
              onSubmit(res.data);
              this.clearLocalStorage();
            } else {
              if (res && res.code === 3) {
                alert(_l('该讨论不存在或已被删除'), 3);
              } else if (res && res.code === 7) {
                alert(_l('没有权限操作'), 3);
              } else {
                alert(_l('操作失败，请稍后重试'), 2);
              }

              this.clearLocalStorage(false);
            }
          })
          .catch(() => {
            this.clearLocalStorage(false);
          });

        // 分享到动态更新
        if (groups && this.props.sendPost) {
          message = message.replace(/\[all\]atAll\[\/all\]/gi, '@' + AT_ALL_TEXT[sourceType]);

          postAjax.addPost({
            appId: appId,
            scope: groups,
            remark: typeof remark === 'function' ? remark() : remark,
            postMsg: message,
            attachments: JSON.stringify(attachments),
            knowledgeAttach: JSON.stringify(kcAttachmentData),
          });
        }
      }
    });
  }

  clearLocalStorage = (status = true) => {
    const textarea = this.textarea;
    const $textarea = $(textarea);

    if (status) {
      window.localStorage.removeItem('commenter-' + this.props.storageId);
      // 隐藏上传附件
      this.setState({
        showAttachment: false,
        isReshare: false,
        isEditing: !this.props.shrinkAfterSubmit,
        disabled: false,
        attachmentData: [],
        kcAttachmentData: [],
      });
      // 处理mentionsInput初始化
      textarea.reset();
      $textarea.val('');
      if (!this.props.shrinkAfterSubmit) {
        $textarea.focus();
      }
      if (this.props.onFocusStateChange) {
        const isFocus = !this.props.shrinkAfterSubmit;
        this.props.onFocusStateChange.call(null, isFocus);
      }
      this.props.onSubmitCallback();
    } else {
      this.setState({
        disabled: false,
      });
      if (!this.props.shrinkAfterSubmit) {
        $textarea.focus();
      }
    }
  };

  handleChangeGroup = value => {
    this.setState({
      groups:
        !value.isMe &&
        !(value.shareGroupIds || []).length &&
        !(value.shareProjectIds || []).length &&
        !(value.radioProjectIds || []).length
          ? undefined
          : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']),
    });
  };

  render() {
    const {
      canAddLink,
      projectId,
      sourceId,
      sourceType,
      placeholder,
      activePlaceholder,
      fromAppId,
      selectGroupOptions = {},
    } = this.props;
    const { isEditing, attachmentData, kcAttachmentData } = this.state;
    const [worksheetId] = sourceId.split('|');
    const hasAttachment = attachmentData.length || kcAttachmentData.length;
    const style = !isEditing && !hasAttachment ? { display: 'none' } : {};
    const onFocus = e => {
      if (activePlaceholder) {
        e.target.placeholder = activePlaceholder;
      }
      if (this.state.isUploadComplete) {
        this.setState({ isEditing: true });
      }
      if (this.props.onFocusStateChange) {
        this.props.onFocusStateChange.call(null, true);
      }
    };
    function onBlur(e) {
      if (activePlaceholder) {
        e.target.placeholder = placeholder;
      }
    }
    return (
      <ClickAwayable
        className={cx('commentBox', {
          'ThemeBorderColor3 ThemeColor4 autoHeight': this.state.isEditing || !this.props.autoShrink,
        })}
        onClickAway={() => this.onClickAway()}
        // 知识文件选择层 点击时不收起
        onClickAwayExceptions={['.folderSelectDialog', '#addLinkFileDialog_container', '.mentionsAutocompleteList']}
      >
        <textarea
          ref={textarea => {
            this.textarea = textarea;
          }}
          id={this.textareaId + '-textarea'}
          className="txtComment"
          spellCheck="false"
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          defaultValue={window.localStorage.getItem('commenter-' + this.props.storageId) || ''}
        />
        <div className="commentActionsBox Gray" style={style}>
          <span className="tip-top commentIconBtn" data-tip={_l('上传附件')}>
            <Icon
              id={this.textareaId + '-attachment'}
              className={cx('Hand commentAttachBtn ThemeHoverColor3', { ThemeColor3: this.state.showAttachment })}
              icon="attachment"
              onClick={() => this.setState({ showAttachment: !this.state.showAttachment })}
            />
          </span>
          <span
            ref={faceBtn => {
              this.faceBtn = faceBtn;
            }}
            className="tip-top commentIconBtn ThemeHoverColor3"
            data-tip={_l('表情')}
          >
            <Icon className="Hand" icon="smile" />
          </span>
          {!this.props.disableShareToPost && !md.global.Account.isPortal ? (
            <span className="tip-top commentIconBtn" data-tip={_l('同时转发此条')}>
              <i
                className={cx('icon-forward2 Font19 ThemeColor3', { hoverRelayBtn: !this.state.isReshare })}
                onClick={() => this.setState({ isReshare: !this.state.isReshare })}
              />
            </span>
          ) : null}
          <div className="flex" />
          {this.state.isReshare && (
            <span className="commentSelectGroup">
              <SelectGroupTrigger {...selectGroupOptions} minHeight={260} onChange={this.handleChangeGroup} />
            </span>
          )}
          <Button
            id={this.textareaId + '-submit'}
            className="commentSubmit"
            onClick={() => this.handleSubmit()}
            disabled={this.state.disabled}
            children={this.props.submitButtonText || _l('发送')}
          />
        </div>
        <div className={cx('commentAttachmentsBox', { Hidden: !this.state.showAttachment || !isEditing })}>
          <UploadFiles
            callFrom="commenter"
            allowUploadFileFromMobile={_.includes([SOURCE_TYPE.WORKSHEET, SOURCE_TYPE.WORKSHEETROW], sourceType)}
            projectId={projectId}
            appId={fromAppId}
            worksheetId={worksheetId}
            rowDisplay={true}
            canAddLink={canAddLink}
            arrowLeft={9}
            maxWidth={220}
            dropPasteElement={this.textareaId + '-textarea'}
            onDropPasting={() => this.setState({ showAttachment: true, isEditing: true })}
            onUploadComplete={res => this.onUploadComplete(res)}
            temporaryData={this.state.attachmentData}
            kcAttachmentData={this.state.kcAttachmentData}
            onTemporaryDataUpdate={res => this.setState({ attachmentData: res })}
            onKcAttachmentDataUpdate={res => this.setState({ kcAttachmentData: res })}
          />
        </div>
      </ClickAwayable>
    );
  }
}

Commenter.TYPES = SOURCE_TYPE;

export default Commenter;
