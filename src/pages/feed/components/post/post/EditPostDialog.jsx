import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { edit } from '../../../redux/postActions';
import { htmlDecodeReg, createLinksForMessage } from 'src/util';
import UploadFiles from 'src/components/UploadFiles';
import { Dialog, Textarea, Button } from 'ming-ui';
import _ from 'lodash';
import RegExpValidator from 'src/util/expression';
import { SelectGroupTrigger } from 'ming-ui/functions/quickSelectGroup';
import styled from 'styled-components';

const FooterWrap = styled.div`
  display: flex;
  align-items: center;
`;

export default class EditPostDialog extends React.Component {
  static show(postItem, dispatch) {
    const div = document.createElement('div');

    document.body.appendChild(div);

    const root = createRoot(div);
    const dispose = () => {
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(div);
      }, 100);
    };
    root.render(
      <EditPostDialog postItem={postItem} dispose={() => dispose()} editPost={(...args) => dispatch(edit(...args))} />,
    );
  }

  state = {
    visible: true,
    kcAttachmentData: [],
    temporaryData: [],
    isUploadComplete: true,
    submitting: false,
    scope: {
      project: _.map(this.props.postItem.scope.shareProjects, p => p.projectId),
      group: _.map(this.props.postItem.scope.shareGroups, g => g.groupId),
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
  componentDidMount() {
    this.setContent(this.props.postItem);
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
  setContent(postItem) {
    import('src/components/mentioninput/mentionsInput').then(() => {
      const message = htmlDecodeReg(
        createLinksForMessage(_.assign({ noLink: true }, postItem))
          .replace(/<br>/g, '\n')
          .replace(/<[^>]+>/g, ''),
      );
      const messageMentions = createLinksForMessage(
        _.assign({ noLink: true }, postItem, {
          message: postItem.message
            .replace('/[aid]([0-9a-zA-Z-]*\\|?.*)[/aid]/', 'user:$1')
            .replace('/[gid]([0-9a-zA-Z-]*\\|?.*)[/gid]/', 'group:$1'),
        }),
      )
        .replace(/<br>/g, '\n')
        .replace(/<[^>]+>/g, '');
      const mentionsCollection = _.map(postItem.rUserList, account => ({
        id: account.aid,
        value: account.name,
        type: 'user',
      })).concat(
        _.map(postItem.rGroupList, group => ({
          id: group.groupID,
          value: group.groupName,
          type: 'group',
        })),
      );

      $(ReactDOM.findDOMNode(this.textarea))
        .parent()
        .find('textarea')
        .mentionsInput({
          reset: false,
          showCategory: true,
        })
        .mentionsInput('setValue', message, messageMentions, mentionsCollection);
    });
  }

  submit() {
    if (!this.state.isUploadComplete) {
      alert(_l('文件上传中，请稍等'), 3);
      return;
    }
    const { scope } = this.state;
    const { postItem } = this.props;
    const { postID } = postItem;
    const $textarea = $(ReactDOM.findDOMNode(this.textarea)).parent().find('textarea');
    $textarea.mentionsInput('val', data => {
      const postMsg = data;
      if (!postMsg || !$.trim(postMsg)) {
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
          $textarea.mentionsInput('reset');
          this.setState({ visible: false }, () => {
            this.props.dispose();
          });
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
        !value.isMe && !(value.shareGroupIds || []).length && !(value.shareProjectIds || []).length && !(value.radioProjectIds || []).length
          ? undefined
          : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']),
    });
  };

  render() {
    const { postItem } = this.props;

    if (!postItem) return false;

    return (
      <Dialog
        className="editUpdaterDialog"
        type="scroll"
        overlayClosable={false}
        width={640}
        visible={this.state.visible}
        title={_l('编辑动态')}
        footer={
          <FooterWrap className="footer">
            <span className="flex"></span>
            <SelectGroupTrigger
              defaultValue={{
                shareProjectIds: _.map(postItem.scope.shareProjects, p => p.projectId),
                shareGroupIds: _.map(postItem.scope.shareGroups, g => g.groupId),
                isMe: !postItem.scope.shareProjects.length && !postItem.scope.shareGroups.length,
              }}
              onChange={this.handleChangeGroup}
            />
            <Button
              id={`textareaUpdaterEdit_${this.props.postItem.postID}`}
              loading={this.state.submitting}
              onClick={() => this.submit()}
            >
              {_l('确定')}
            </Button>
          </FooterWrap>
        }
        onCancel={() => this.props.dispose()}
      >
        <Textarea
          id="textarea_Updater_Edit"
          className="textarea_Updater_Edit"
          maxHeight={220}
          ref={textarea => {
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
      </Dialog>
    );
  }
}
