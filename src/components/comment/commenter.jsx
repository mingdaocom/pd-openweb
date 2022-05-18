import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import $ from 'jquery';
import { AT_ALL_TEXT } from './config';

import Icon from 'ming-ui/components/Icon';
import Button from 'ming-ui/components/Button';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';

import UploadFiles from 'src/components/UploadFiles';

import discussionAjax from 'src/api/discussion';
import postAjax from 'src/api/post';

import { SOURCE_TYPE } from './config';

import 'autoTextarea';
import 'mentioninput';
import 'emotion';
import 'selectGroup';
import './css/commenter.less';
import { getRandomString } from 'src/util';

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

    submitButtonText: PropTypes.string, // 按钮文本
    onSubmit: PropTypes.func.isRequired, // 提交回调方法
    onSubmitCallback: PropTypes.func,

    onFocusStateChange: PropTypes.func, // textarea 获取失去焦点时的回调
  };

  static defaultProps = {
    placeholder: _l('发表评论（按Ctrl+Enter快速发布）'),
    canAddLink: true,
    textareaMaxHeight: 180,
    textareaMinHeight: 50,
    textareaExpandHeight: 50,
    autoShrink: true,
    shrinkAfterSubmit: false,
    sendPost: true,
    autoFocus: false,
    onSubmitCallback: () => {},
  };

  constructor(props) {
    super(props);
    this.textareaId = 'Commenter_' + getRandomString(16);
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
    const { textarea, faceBtn, selectGroup } = this;
    const { textareaMaxHeight, textareaMinHeight } = this.props;
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
          window.localStorage.setItem('commenter-' + comp.props.storageId, text);
        }
      });
    }

    // @
    if (!this.props.disableMentions) {
      const { sourceType } = this.props;
      localStorage.setItem('atData', JSON.stringify(this.props.atData || []));
      $textarea.mentionsInput(
        Object.assign(
          {
            submitBtn: this.textareaId + '-submit',
            reset: false,
            searchType: sourceType === SOURCE_TYPE.POST ? 0 : 1,
            showCategory: sourceType === SOURCE_TYPE.POST,
            isAtAll: true,
            sourceType,
            forReacordDiscussion: this.props.forReacordDiscussion,
          },
          this.props.mentionsOptions,
        ),
      );
    }

    // 表情
    $(faceBtn).emotion(
      Object.assign({
        input: this.textarea,
        placement: 'left bottom',
        relatedLeftSpace: -38 + (this.props.relatedLeftSpace || 0),
        relatedTopSpace: 5,
      }),
    );

    // 发布到动态
    if (!this.props.disableShareToPost) {
      $(selectGroup).SelectGroup(
        Object.assign(
          {
            whetherTruncation: true,
            truncationStr: 10,
            autoPosition: true,
            isShowSelectProject: false,
          },
          this.props.selectGroupOptions,
        ),
      );
    }

    // 获得焦点
    if (this.props.autoFocus) {
      // 处理withClickAway 第一次就触发引起的第一次焦点无法focus的bug
      setTimeout(() => {
        $textarea.focus();
      }, 50);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.storageId && nextProps.storageId !== this.props.storageId) {
      this.textarea.value = window.localStorage.getItem('commenter-' + nextProps.storageId) || '';
    }
    if (
      !nextProps.disableMentions &&
      !_.isEqual(this.props.atData, nextProps.atData) &&
      nextProps.forReacordDiscussion
    ) {
      localStorage.setItem('atData', JSON.stringify(nextProps.atData || []));
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
        $textarea
          .autoTextarea({
            maxHeight: textareaMaxHeight,
            minHeight: height,
          })
          .height(height);
      } else {
        setTimeout(function () {
          $textarea.height(height);
        }, 0);
      }
    }
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
    let groups;
    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return false;
    }
    if (this.state.isReshare) {
      groups = $(this.selectGroup).SelectGroup('getScope');
      if (!groups) {
        alert(_l('请选择分享范围'), 3);
        return false;
      }
    }

    const textarea = this.textarea;
    const $textarea = $(textarea);
    const getMessagePromise = this.props.disableMentions
      ? Promise.resolve($textarea.val())
      : new Promise((resolve, reject) => {
          $textarea.mentionsInput('val', data => resolve(data));
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

      const { sourceId, sourceType, replyId, appId, remark, extendsId, entityType, forReacordDiscussion } = this.props;

      let promise = null;

      if (sourceType === SOURCE_TYPE.POST) {
        const dfd = $.Deferred();
        const { accountId } = this.props;
        promise = postAjax
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
          .then(
            function (result) {
              if (result.success === 'True') {
                dfd.resolve(result);
              } else {
                dfd.reject(result.error);
              }
              return dfd.promise();
            },
            function (xhr) {
              var text;
              try {
                var resObject = JSON.parse(xhr.responseText);
                text = resObject.error;
              } catch (e) {
                text = xhr.errorMessage;
              }
              dfd.reject(text);
              return dfd.promise();
            },
          )
          .done(resData => {
            this.props.onSubmit(resData.comment);
          })
          .fail(function (text) {
            alert(text || _l('操作失败'), 2);
          });
      } else {
        promise = discussionAjax
          .addDiscussion({
            sourceId,
            sourceType,
            message,
            replyId,
            attachments: JSON.stringify(attachments),
            knowledgeAtts: JSON.stringify(kcAttachmentData),
            appId,
            extendsId,
            entityType: forReacordDiscussion && entityType === 2 ? 2 : 0,//后端接口只区分0 2
          })
          .then(
            res => {
              if (res && res.code === 1) {
                return res.data;
              } else {
                if (res && res.code === 3) {
                  alert(_l('该讨论不存在或已被删除'), 3);
                } else if (res && res.code === 7) {
                  alert(_l('没有权限操作'), 3);
                } else {
                  alert(_l('操作失败，请稍后重试'), 2);
                }
                return $.Deferred().reject().promise();
              }
            },
            () => {
              return $.Deferred().reject().promise();
            },
          )
          .done(resData => {
            this.props.onSubmit(resData);
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
      promise.then(
        () => {
          // 清除缓存的storage
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
          $textarea.mentionsInput('reset');
          $textarea.val('');
          if (!this.props.shrinkAfterSubmit) {
            $textarea.focus();
          }
          if (this.props.onFocusStateChange) {
            const isFocus = !this.props.shrinkAfterSubmit;
            this.props.onFocusStateChange.call(null, isFocus);
          }
          this.props.onSubmitCallback();
        },
        () => {
          this.setState({
            disabled: false,
          });
          if (!this.props.shrinkAfterSubmit) {
            $textarea.focus();
          }
        },
      );
    });
  }

  render() {
    const { canAddLink, projectId, placeholder, activePlaceholder } = this.props;
    const { isEditing, attachmentData, kcAttachmentData } = this.state;
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
        onClickAwayExceptions={['#folderSelectDialog_container', '#addLinkFileDialog_container']}
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
          <span className={cx('commentSelectGroup', { Hidden: !this.state.isReshare })}>
            <input
              type="hidden"
              ref={selectGroup => {
                this.selectGroup = selectGroup;
              }}
            />
          </span>
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
            projectId={projectId}
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
