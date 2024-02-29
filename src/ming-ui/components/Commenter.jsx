import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import Icon from './Icon';
import Button from './Button';
import Splitter from './Splitter';
import Emotion from 'src/components/emotion/emotion';
import 'src/components/autoTextarea/autoTextarea';
import 'src/components/mentioninput/mentionsInput';
import 'src/components/uploadAttachment/uploadAttachment';
import 'src/components/selectGroup/selectAllGroup';
import './less/Commenter.less';
import { generateRandomPassword } from 'src/util';

export default class Commenter extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    autoShrink: PropTypes.bool,
    textareaMaxHeight: PropTypes.number,
    textareaMinHeight: PropTypes.number,
    disableMentions: PropTypes.bool,
    mentionsOptions: PropTypes.object,
    emotionOptions: PropTypes.object,
    disableShareToPost: PropTypes.bool,
    reshareButtonType: PropTypes.oneOf(['checkbox', 'icon']),
    submitButtonText: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    onChangeIsEditing: PropTypes.func,
  };
  static defaultProps = {
    placeholder: _l('发布评论'),
    reshareButtonType: 'icon',
    textareaMaxHeight: 180,
    textareaMinHeight: 50,
  };
  constructor(props) {
    super(props);
    this.textareaId = 'Commenter_' + generateRandomPassword(16);
    this.state = {
      isExpanded: false,
      isEditing: true,
      isReshare: false,
    };
  }
  componentDidMount() {
    this.init();
  }
  init() {
    const { textarea, uploadAttachmentInput, faceBtn } = this;
    const comp = this;

    // 文本框
    const $textarea = $(textarea);
    $textarea.autoTextarea({
      maxHeight: this.props.textareaMaxHeight,
      minHeight: this.props.textareaMinHeight,
    });
    if (!this.props.disableMentions) {
      $textarea.mentionsInput(
        Object.assign(
          {
            submitBtn: this.textareaId + '-submit',
            showCategory: false,
            isCommentAtAll: false,
          },
          this.props.mentionsOptions,
        ),
      );
    }

    // 附件
    comp.uploadAttachmentObj = $(ReactDom.findDOMNode(uploadAttachmentInput)).uploadAttachment({
      pluploadID: '#' + this.textareaId + '-attachment',
      dropPasteElement: this.textareaId + '-textarea',
      styleType: '2',
      callback(attachments) {
        comp.attachments = attachments;
        if (attachments.length > 0 && !$textarea.val()) {
          $textarea.val(attachments[0].originalFileName).focus();
        }
      },
      isUploadComplete(isUploadComplete) {
        // 所有文件上传进度
        if (comp.uploadAttachmentObj) {
          comp.uploadAttachmentObj.isUploadComplete = isUploadComplete;
        }
      },
    });
    comp.uploadAttachmentObj.isUploadComplete = true;

    // 表情
    new Emotion(
      ReactDom.findDOMNode(faceBtn),
      Object.assign(
        {
          input: this.textarea,
          placement: 'left bottom',
          relatedLeftSpace: -17,
          relatedTopSpace: 5,
          mdBear: false,
        },
        this.props.emotionOptions,
      ),
    );

    // 发布到动态
    // TODO
  }
  changeEditingStatus(isEditing) {
    if (!this.props.onChangeIsEditing || this.props.onChangeIsEditing(isEditing) !== false) {
      this.setState({ isEditing });
    }
  }
  handleSubmit() {
    if (this.uploadAttachmentObj && !this.uploadAttachmentObj.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return false;
    }
    const textarea = this.textarea;
    const $textarea = $(textarea);
    const getMessagePromise = this.props.disableMentions
      ? Promise.resolve($textarea.val())
      : new Promise((resolve, reject) => {
          $textarea.mentionsInput('val', data => resolve(data));
        });
    getMessagePromise.then(data => {
      const message = $.trim(data);
      if (!message || message.length > 3000) {
        if (message) {
          alert(_l('发表内容过长，最多允许3000个字符'), 3);
        } else {
          $textarea.val('');
        }
        return false;
      }
      this.props.onSubmit({ message, attachments: this.attachments || [] });
    });
  }
  render() {
    return (
      <div className={cx('ming Commenter', { 'Commenter--isEditing': this.state.isEditing })}>
        <textarea
          ref={textarea => {
            this.textarea = textarea;
          }}
          id={this.textareaId + '-textarea'}
          className={'Commenter-textarea ' + (this.state.isEditing ? '' : 'Gray_c')}
          placeholder={this.props.placeholder}
          onFocus={() => this.changeEditingStatus(true)}
        />
        <Splitter className="Commenter-splitter" />
        <div className="Commenter-actions">
          <Icon id={this.textareaId + '-attachment'} className="Hand Commenter-iconBtn" icon="attachment" />
          <span
            ref={faceBtn => {
              this.faceBtn = faceBtn;
            }}
          >
            <Icon className="Hand Commenter-iconBtn" icon="smile" hoverIcon="smilingFace" />
          </span>
          {!this.props.disableShareToPost &&
            (this.props.reshareButtonType === 'checkbox' ? (
              '' // TODO
            ) : (
              <Icon
                icon="feed"
                className={cx('Hand Commenter-iconBtn', { ThemeColor3: this.state.isReshare })}
                onClick={() => this.setState({ isReshare: !this.state.isReshare })}
              />
            ))}
          <div className="flex" />
          <div className={cx('Commenter-selectGroup', { Hidden: !this.state.isReshare })}>
            <input type="hidden" />
          </div>
          <Button
            id={this.textareaId + '-submit'}
            className="Commenter-submit"
            onClick={() => this.handleSubmit()}
            children={this.props.submitButtonText || _l('发布')}
          />
        </div>
        <input
          type="hidden"
          ref={uploadAttachmentInput => {
            this.uploadAttachmentInput = uploadAttachmentInput;
          }}
        />
      </div>
    );
  }
}
