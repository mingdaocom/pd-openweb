import React from 'react';
import _ from 'lodash';
import { Textarea } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import useFunctionWrapComponent, { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import createLinksForMessage from 'src/components/comment/utils/createLinksForMessage';
import { useMentionsInput } from 'src/components/MentionsInput';
import UploadFiles from 'src/components/UploadFiles';
import { htmlDecodeReg } from 'src/utils/core/string';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { edit } from '../../../redux/postActions';

class EditPostMentionsOwner extends React.PureComponent {
  componentDidMount() {
    this.props.onMount(this.props.openMentionsInput);
  }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

const EditPostMentionsOwnerWithOpeners = withOpeners(EditPostMentionsOwner, {
  openMentionsInput: useMentionsInput,
});

class EditPostDialog extends React.Component {
  state = {
    kcAttachmentData: [],
    temporaryData: [],
    isUploadComplete: true,
    submitting: false,
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

  initializeMentionsInput = openMentionsInput => {
    const { postItem } = this.props;
    const message = htmlDecodeReg(
      createLinksForMessage(_.assign({ noLink: true, doNotEscapeHTML: true }, postItem))
        .replace(/<br>/g, '\n')
        .replace(/<[^>]+>/g, ''),
    );
    const messageMentions = createLinksForMessage(
      _.assign({ noLink: true, doNotEscapeHTML: true }, postItem, {
        message: postItem.message
          .replace('/[aid]([0-9a-zA-Z-]*\\|?.*)[/aid]/', 'user:$1')
          .replace('/[gid]([0-9a-zA-Z-]*\\|?.*)[/gid]/', 'group:$1'),
      }),
    )
      .replace(/<br>/g, '\n')
      .replace(/<[^>]+>/g, '');
    const mentionsCollection = _.map(postItem.rUserList, account => ({
      id: account.aid,
      fullname: account.name,
      type: 'user',
    })).concat(
      _.map(postItem.rGroupList, group => ({
        id: group.groupID,
        value: group.groupName,
        type: 'group',
      })),
    );
    const textarea = this.textarea;

    openMentionsInput({
      input: textarea,
      showCategory: true,
      initCallback: () => {
        textarea.setValue(message, messageMentions, mentionsCollection);
      },
    });
  };

  submit() {
    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }

    const { scope } = this.state;
    const { postItem } = this.props;
    const { postID } = postItem;
    const $textarea = $(this.textarea);
    $textarea.get(0).val(data => {
      const postMsg = data;

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
          $textarea.get(0).reset();
          this.props.onClose();
        },
        () => {
          this.setState({ submitting: false });
        },
      );
    });
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
        <EditPostMentionsOwnerWithOpeners onMount={this.initializeMentionsInput}>
          <Textarea
            id="textarea_Updater_Edit"
            className="textarea_Updater_Edit"
            maxHeight={220}
            manualRef={textarea => {
              this.textarea = textarea;
            }}
          />
          {(postItem.postType == 2 || postItem.postType == 3 || postItem.postType == 9) && (
            <UploadFiles
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
        </EditPostMentionsOwnerWithOpeners>
      </Modal>
    );
  }
}

const getEditPostDialogProps = ({ postItem, dispatch }) => ({
  postItem,
  editPost: (...args) => dispatch(edit(...args)),
});

export function useEditPostDialog() {
  return useFunctionWrapComponent(EditPostDialog, getEditPostDialogProps);
}

export default EditPostDialog;
