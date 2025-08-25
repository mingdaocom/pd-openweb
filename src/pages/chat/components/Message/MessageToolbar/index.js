import React, { Component } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import Dialog from 'ming-ui/components/Dialog';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { downloadFile } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { getCurrentTime } from '../../../utils';
import * as ajax from '../../../utils/ajax';
import Constant from '../../../utils/constant';
import './index.less';

const confirm = Dialog.confirm;

const getImageContextIndex = (id, list) => {
  let index = -1;
  for (let i = 0, length = list.length; i < length; i++) {
    index++;
    if (list[i].id == id) {
      break;
    }
  }
  return index;
};

const formatMessage = (id, res) => {
  const index = getImageContextIndex(id, res);
  res = res.map(item => {
    const { files } = item.msg;
    const isPicture = RegExpValidator.fileIsPicture(`.${RegExpValidator.getExtOfFileName(files.name)}`);
    const bigImg = parseInt(files.size / 1024 / 1024) >= 20;
    return {
      fileid: files.id || '',
      name: files.name || '',
      path: isPicture
        ? bigImg
          ? files.url
          : `${files.url}${files.url.indexOf('?') >= 0 ? '&' : '?'}imageMogr2/auto-orient`
        : files.url,
      size: files.size,
      previewAttachmentType: 'QINIU',
    };
  });
  return {
    res,
    index,
  };
};

export const handleMessageFilePreview = function () {
  const { message, session } = this.props;
  const { id } = message;

  const params = {
    id: session.id,
    isGroup: session.isGroup,
  };

  ajax
    .getImageContext({
      ...params,
      msgid: id,
      type: 0,
    })
    .then(originalRes => {
      const { res, index } = formatMessage(id, originalRes);
      previewAttachments(
        {
          attachments: res,
          index,
          callFrom: 'chat',
          hideFunctions: ['editFileName'],
        },
        {
          preLoadMoreAttachments() {
            return new Promise(resolve => {
              ajax
                .getImageContext({
                  ...params,
                  msgid: originalRes[0].id,
                  type: 1,
                })
                .then(prevRes => {
                  prevRes.pop();
                  const { res } = formatMessage(id, prevRes);
                  prevRes.reverse();
                  prevRes.forEach(item => originalRes.unshift(item));
                  resolve(res);
                });
            });
          },
          loadMoreAttachments() {
            return new Promise(resolve => {
              ajax
                .getImageContext({
                  ...params,
                  msgid: originalRes[originalRes.length - 1].id,
                  type: 2,
                })
                .then(nextRes => {
                  nextRes.forEach(item => originalRes.push(item));
                  const { res } = formatMessage(id, nextRes);
                  resolve(res);
                });
            });
          },
        },
      );
    });
};

export default class MessageToolbar extends Component {
  constructor(props) {
    super(props);
  }
  getToolbarConfig() {
    const { message, session } = this.props;
    const { isMine, type } = message;
    const { isAdmin } = session;
    const isWithdraw = isMine || isAdmin;
    let toolbarConfig = {};

    if (type === Constant.MSGTYPE_TEXT) {
      // 文字类型
      toolbarConfig = {
        reference: true,
        copy: true,
        withdraw: isWithdraw,
      };
    } else if (type === Constant.MSGTYPE_PIC || type === Constant.MSGTYPE_FILE || type === Constant.MSGTYPE_APP_VIDEO) {
      const { files = {} } = message.msg;
      if (files.isEmotion) {
        isWithdraw &&
          (toolbarConfig = {
            withdraw: isWithdraw,
          });
      } else {
        // 图片&附件
        toolbarConfig = {
          reference: true,
          download: true,
          share: true,
          withdraw: isWithdraw,
        };
      }
    } else if (type === Constant.MSGTYPE_CARD) {
      if (message.card.md === 'kcfile') {
        // 知识卡片
        toolbarConfig = {
          reference: true,
          download: true,
          share: true,
          withdraw: isWithdraw,
        };
      } else {
        // 任务&日程等卡片
        isWithdraw &&
          (toolbarConfig = {
            withdraw: isWithdraw,
          });
      }
    } else if (type === Constant.MSGTYPE_AUDIO) {
      isWithdraw &&
        (toolbarConfig = {
          withdraw: isWithdraw,
        });
    }

    return toolbarConfig;
  }
  handleMessageReference() {
    this.props.onAddReferMessage();
  }
  handleMessageFileDownload() {
    const { message } = this.props;
    let downloadUrl = null;

    if (message.kcFile) {
      downloadUrl = message.kcFile.downloadUrl;
    } else {
      const { key, name } = message.msg.files;
      downloadUrl =
        `${md.global.Config.AjaxApiUrl}file/downChatFile?key=` + key + '&attname=' + encodeURIComponent(name);
    }

    if (downloadUrl) {
      window.open(downloadFile(downloadUrl));
    } else {
      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
    }
    this.props.onSetMessageMoreVisible(false);
  }
  handleShareNode() {
    const { message } = this.props;
    const { kcFile } = message;

    let attachmentType = 0;
    let attachment = null;

    this.props.onSetMessageMoreVisible(false);

    if (message.card) {
      attachmentType = 2;
      attachment = kcFile;
      if (!kcFile || !kcFile.downloadUrl) {
        alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
        return;
      }
    } else {
      const { files } = message.msg;
      attachmentType = 0;
      attachment = {
        name: RegExpValidator.getNameOfFileName(files.name),
        ext: `.${RegExpValidator.getExtOfFileName(files.name)}`,
        size: files.size,
        path: files.url ? files.url : window.config.FilePath + files.key,
        id: files.id,
      };
    }

    import('src/components/shareAttachment/shareAttachment').then(share => {
      const params = {
        attachmentType,
      };
      const isPicture = RegExpValidator.fileIsPicture(attachment.ext);
      if (attachmentType == 2) {
        params.id = attachment.id;
        params.name = attachment.name;
        params.ext = '.' + attachment.ext;
        params.size = attachment.size;
        params.imgSrc = isPicture ? `${attachment.previewUrl.split('imageView2')[0]}imageView2/2/w/490` : undefined;
        params.node = attachment;
      } else {
        params.id = attachment.id;
        params.name = attachment.name;
        params.ext = attachment.ext;
        params.size = attachment.size || 0;
        params.imgSrc = isPicture ? `${attachment.path.split('imageView2')[0]}imageView2/2/w/490` : undefined;
        params.qiniuPath = attachment.path;
        params.node = attachment;
      }
      share.default(params, {
        performUpdateItem: () => {},
      });
    });
  }
  handleWithdraw() {
    const { message, session } = this.props;
    const isAdmin = session.isAdmin || false;
    const { isMine } = message;
    const differenceTime = moment(getCurrentTime()).valueOf() - moment(message.time).valueOf() <= 300 * 1000;
    const isWithdraw = isMine ? differenceTime : isAdmin || differenceTime;
    const isFileTransfer = session.id === 'file-transfer';
    if (isFileTransfer) {
      confirm({
        title: <span className="Red">{_l('是否确认删除 ?')}</span>,
        buttonType: 'danger',
        onOk: () => {
          this.props.onWithdrawMessage();
        },
      });
    } else if (isWithdraw) {
      if (isAdmin && !isMine) {
        confirm({
          title: _l('管理员消息撤回'),
          description: _l('管理员有权撤回其他成员消息，不限时间，是否确认撤回'),
          onOk: () => {
            this.props.onWithdrawMessage();
          },
        });
      } else {
        this.props.onWithdrawMessage();
      }
    } else {
      alert(_l('仅支持消息在发送后5分钟内进行撤回操作'), 3);
    }
    this.props.onSetMessageMoreVisible(false);
  }
  handleAddAtUser = () => {
    const { message, session } = this.props;
    const { fromAccount } = message;
    const textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-Textarea .Textarea');
    const at = {
      id: fromAccount.id,
      logo: fromAccount.logo,
      name: fromAccount.name,
      fullname: fromAccount.name,
      chatAt: true,
    };
    setTimeout(() => {
      textarea.get(0).addMention(at);
    }, 0);
  };
  handleCopyText() {
    const { message } = this.props;
    copy(message.msg.con);
    alert(_l('复制成功'));
    this.props.onSetMessageMoreVisible(false);
  }
  renderBtn(toolbarConfig) {
    return (
      <div className="Message-toolbarItem" onClick={toolbarConfig.fn}>
        <span
          className={cx('Message-toolbarItemBtn ThemeColor3', toolbarConfig.className)}
          data-tip={toolbarConfig.name}
        >
          <i className={toolbarConfig.icon} />
        </span>
      </div>
    );
  }
  render() {
    const { message, session, isDuplicated } = this.props;
    const isAdmin = session.isAdmin || false;
    const differenceTime = moment(getCurrentTime()).valueOf() - moment(message.time).valueOf() <= 300 * 1000;
    const isFileTransfer = session.id === 'file-transfer';
    const isWithdraw = isFileTransfer ? true : message.isMine ? differenceTime : isAdmin || differenceTime;
    const toolbarConfig = this.getToolbarConfig();
    return (
      <div className="Message-toolbar-wrapper">
        <div className="Message-toolbar">
          {toolbarConfig.reference &&
            this.renderBtn({
              name: _l('回复此段'),
              icon: 'icon-quote-left',
              fn: this.handleMessageReference.bind(this),
            })}
          {session.isGroup &&
            !message.isMine &&
            !isDuplicated &&
            this.renderBtn({
              name: _l('@TA'),
              icon: 'icon-chat-at',
              fn: this.handleAddAtUser,
            })}
          {toolbarConfig.download &&
            this.renderBtn({
              name: _l('下载'),
              icon: 'icon-download',
              fn: this.handleMessageFileDownload.bind(this),
            })}
          {toolbarConfig.share &&
            this.renderBtn({
              name: _l('分享'),
              icon: 'icon-share',
              fn: this.handleShareNode.bind(this),
            })}
          {toolbarConfig.copy &&
            this.renderBtn({
              name: _l('复制'),
              icon: 'icon-copy',
              fn: this.handleCopyText.bind(this),
            })}
          {toolbarConfig.withdraw &&
            isWithdraw &&
            this.renderBtn({
              className: isFileTransfer ? 'deleteBtn' : '',
              name: isFileTransfer ? _l('删除') : _l('撤回'),
              icon: isFileTransfer ? 'icon-trash' : 'icon-back',
              fn: this.handleWithdraw.bind(this),
            })}
        </div>
      </div>
    );
  }
}
