import React from 'react';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import PostMarkdownEditor from 'src/components/comment/PostMarkdownEditor';
import { fromStoredMessage, toSyntaxMessage } from 'src/components/comment/utils/markdownMessageSyntax';
import UploadFiles from 'src/components/UploadFiles';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { edit } from '../../../redux/postActions';

class EditPostDialog extends React.Component {
  state = {
    kcAttachmentData: [],
    temporaryData: [],
    isUploadComplete: true,
    submitting: false,
    // 正文即 Markdown 源码，直接回填；旧的「渲染成 HTML 再剥标签」会破坏 Markdown 结构
    markdownValue: fromStoredMessage(this.props.postItem.message, this.props.postItem),
    scope: {
      shareProjectIds: _.map(this.props.postItem.scope.shareProjects, p => p.projectId),
      shareGroupIds: _.map(this.props.postItem.scope.shareGroups, g => g.groupId),
    },
  };

  constructor(props) {
    super(props);
    const { postItem } = props;

    if (postItem.attachments && postItem.attachments.length) {
      _.forEach(postItem.attachments, attachment => {
        if (attachment.refId) {
          this.state.kcAttachmentData.push(attachment);
        } else {
          this.state.temporaryData.push(attachment);
        }
      });
    }
  }

  formatAttachment(attachment) {
    if (attachment.twice) {
      attachment = _.assign({}, attachment.twice, attachment);
      delete attachment.twice;
    }

    attachment = _.assign(
      {
        isEdit: !!attachment.docVersionID,
        fileExt: attachment.ext,
        fileSize: attachment.filesize,
      },
      attachment,
      {
        originalFileName: attachment.originalFileName || attachment.originalFilename,
        originalFilename: attachment.originalFileName || attachment.originalFilename,
      },
    );
    if (RegExpValidator.fileIsPicture(attachment.fileExt)) {
      if (!attachment.refType) {
        attachment.allowDown = true;
      }
    } else {
      attachment.allowDown = !!attachment.allowDown;
    }

    return attachment;
  }

  submit() {
    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }

    const { scope } = this.state;
    const { postItem } = this.props;
    const { postID } = postItem;

    const submitPost = postMsg => {
      if (!postMsg || !(postMsg || '').trim()) {
        alert(_l('发表内容不能为空'), 3);
        return false;
      } else if (postMsg.length > 6000) {
        alert(_l('发表内容过长，最多允许6000个字符'), 3);
        return false;
      }

      if (!scope) {
        alert(_l('请选择群组'), 3);
        return;
      }

      this.setState({ submitting: true });

      this.props.editPost(
        {
          postType: ['0', '2', '3', '9'].indexOf(String(postItem.postType)) > -1 ? '0' : postItem.postType, // 后台判断
          postMsg,
          scope,
          postId: postID,
          oldPostMsg: postItem.message,
          attachments:
            this.state.temporaryData && this.state.temporaryData.length
              ? JSON.stringify(this.state.temporaryData.map(this.formatAttachment))
              : undefined,
          knowledgeAttach:
            this.state.kcAttachmentData && this.state.kcAttachmentData.length
              ? JSON.stringify(this.state.kcAttachmentData.map(this.formatAttachment))
              : undefined,
        },
        () => {
          this.props.onClose();
        },
        () => {
          this.setState({ submitting: false });
        },
      );
    };

    submitPost(toSyntaxMessage(this.state.markdownValue));
  }

  /** 编辑器里粘贴或拖入的图片不进 Markdown，仍然走附件上传 */
  handleEditorUploadFiles = files => {
    if (!files || !files.length) return;

    this.uploadFilesRef?.addFiles(files);
  };

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
    const { postItem } = this.props;

    if (!postItem) return false;

    return (
      <Modal
        className="editUpdaterDialog"
        mask={{ closable: false }}
        keyboard
        width={640}
        open={this.props.visible}
        title={_l('编辑动态')}
        footerLeftElement={
          <SelectGroupPopover
            defaultValue={{
              shareProjectIds: _.map(postItem.scope.shareProjects, p => p.projectId),
              shareGroupIds: _.map(postItem.scope.shareGroups, g => g.groupId),
              isMe: !postItem.scope.shareProjects.length && !postItem.scope.shareGroups.length,
            }}
            onChange={this.handleChangeGroup}
          />
        }
        cancelButtonProps={{ style: { display: 'none' } }}
        okText={_l('确定')}
        okButtonProps={{ id: `textareaUpdaterEdit_${this.props.postItem.postID}`, loading: this.state.submitting }}
        onOk={() => this.submit()}
        onCancel={this.props.onClose}
      >
        <EditPostBody
          markdownValue={this.state.markdownValue}
          projectId={_.get(postItem, 'projectIds[0]')}
          onMarkdownChange={markdownValue => this.setState({ markdownValue })}
          onUploadFiles={this.handleEditorUploadFiles}
          onSubmit={() => this.submit()}
        >
          {(postItem.postType == 2 || postItem.postType == 3 || postItem.postType == 9) && (
            <UploadFiles
              manualRef={ref => {
                this.uploadFilesRef = ref;
              }}
              dropPasteElement="textarea_Updater_Edit"
              className="mTop10"
              isUpload
              isInitCall
              column={4}
              temporaryData={this.state.temporaryData}
              kcAttachmentData={this.state.kcAttachmentData}
              onTemporaryDataUpdate={result => {
                this.setState({ temporaryData: result });
              }}
              onKcAttachmentDataUpdate={result => {
                this.setState({ kcAttachmentData: result });
              }}
              onUploadComplete={bool => {
                this.setState({ isUploadComplete: bool });
              }}
            />
          )}
        </EditPostBody>
      </Modal>
    );
  }
}

/** 正文统一按 Markdown 渲染，编辑态也统一用 Markdown 编辑器 */
function EditPostBody({ markdownValue, projectId, onMarkdownChange, onUploadFiles, onSubmit, children }) {
  return (
    <React.Fragment>
      <PostMarkdownEditor
        value={markdownValue}
        minHeight={120}
        maxHeight={320}
        projectId={projectId}
        onChange={onMarkdownChange}
        onUploadFiles={onUploadFiles}
        onSubmit={onSubmit}
      />
      {children}
    </React.Fragment>
  );
}

const getEditPostDialogProps = ({ postItem, dispatch }) => ({
  postItem,
  editPost: (...args) => dispatch(edit(...args)),
});

export function useEditPostDialog() {
  return useFunctionWrapComponent(EditPostDialog, getEditPostDialogProps);
}

export default EditPostDialog;
