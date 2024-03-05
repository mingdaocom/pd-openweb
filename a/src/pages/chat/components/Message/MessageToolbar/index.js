import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import * as ajax from '../../../utils/ajax';
import config from '../../../utils/config';
import Constant from '../../../utils/constant';
import Trigger from 'rc-trigger';
import ClipboardButton from 'react-clipboard.js';
import * as cardSender from '../../../utils/cardSender';
import { getCurrentTime } from '../../../utils';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import Dialog from 'ming-ui/components/Dialog';
import { downloadFile } from 'src/util';
import moment from 'moment';

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
    const isPicture = File.isPicture(`.${File.GetExt(files.name)}`);
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
  const { id, to } = message;

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
            const promise = $.Deferred();
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
                promise.resolve(res);
              });
            return promise;
          },
          loadMoreAttachments() {
            const promise = $.Deferred();
            ajax
              .getImageContext({
                ...params,
                msgid: originalRes[originalRes.length - 1].id,
                type: 2,
              })
              .then(nextRes => {
                nextRes.forEach(item => originalRes.push(item));
                const { res } = formatMessage(id, nextRes);
                promise.resolve(res);
              });
            return promise;
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
    let toolbarConfig = {};
    const { message, session } = this.props;
    const { isMine, type } = message;
    const { isAdmin } = session;
    const isWithdraw = isMine || isAdmin;

    if (type === Constant.MSGTYPE_TEXT) {
      // 文字类型
      toolbarConfig = {
        reference: true,
        dynamic: true,
        more: {
          task: true,
          schedule: true,
          copy: true,
          withdraw: isWithdraw,
        },
      };
    } else if (type === Constant.MSGTYPE_PIC || type === Constant.MSGTYPE_FILE || type === Constant.MSGTYPE_APP_VIDEO) {
      const { files = {} } = message.msg;
      if (files.isEmotion) {
        isWithdraw &&
          (toolbarConfig.more = {
            withdraw: isWithdraw,
          });
      } else {
        // 图片&附件
        toolbarConfig = {
          reference: true,
          download: true,
          more: {
            preview: true,
            share: true,
            withdraw: isWithdraw,
          },
        };
      }
    } else if (type === Constant.MSGTYPE_CARD) {
      if (message.card.md === 'kcfile') {
        // 知识卡片
        toolbarConfig = {
          reference: true,
          download: true,
          more: {
            previewKnowledge: true,
            share: true,
            depositKnowledge: true,
            withdraw: isWithdraw,
          },
        };
      } else {
        // 任务&日程等卡片
        isWithdraw &&
          (toolbarConfig.more = {
            withdraw: isWithdraw,
          });
      }
    } else if (type === Constant.MSGTYPE_AUDIO) {
      isWithdraw &&
        (toolbarConfig.more = {
          withdraw: isWithdraw,
        });
    }

    return toolbarConfig;
  }
  handleMessageReference() {
    this.props.onAddReferMessage();
  }
  handleCreatePost() {
    const { message } = this.props;
    cardSender
      .newFeed(
        {},
        {
          postMsg: message.msg.con,
          showSuccessTip: false,
        },
      )
      .then(result => {
        alert(_l('创建成功'));
      });
    this.props.onSetMessageMoreVisible(false);
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
  handleCreateTask() {
    const { message } = this.props;
    cardSender
      .newTask(
        {},
        {
          description: message.msg.con,
          showSuccessTip: true,
        },
      )
      .then(result => {
        alert(_l('创建成功'));
      });
    this.props.onSetMessageMoreVisible(false);
  }
  handleCreateCalendar() {
    const { message } = this.props;
    cardSender
      .newSchedule(
        {},
        {
          description: message.msg.con,
          showSuccessTip: true,
        },
      )
      .then(result => {
        alert(_l('创建成功'));
      });
    this.props.onSetMessageMoreVisible(false);
  }
  handleMessageFilePreview() {
    handleMessageFilePreview.call(this);
    this.props.onSetMessageMoreVisible(false);
  }
  handleMessageKnowledgePreview() {
    const { kcFile } = this.props.message;
    if (kcFile) {
      previewAttachments(
        {
          attachments: [kcFile],
          callFrom: 'kc',
          hideFunctions: ['editFileName'],
        },
        {},
      );
    } else {
      alert('权限不足或文件不存在，请联系文件夹管理员或文件上传者', 3);
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
        name: File.GetName(files.name),
        ext: `.${File.GetExt(files.name)}`,
        size: files.size,
        path: files.url ? files.url : window.config.FilePath + files.key,
        id: files.id,
      };
    }

    import('src/components/shareAttachment/shareAttachment').then(share => {
      const params = {
        attachmentType,
      };
      const isPicture = File.isPicture(attachment.ext);
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
        performUpdateItem: visibleType => {},
      });
    });
  }
  handleSaveToKc() {
    const { message } = this.props;
    const { kcFile } = message;
    const nodeType = 2;

    this.props.onSetMessageMoreVisible(false);

    if (!kcFile) {
      alert('权限不足或文件不存在，请联系文件夹管理员或文件上传者', 3);
      return;
    }
    if (!kcFile.downloadUrl) {
      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
      return;
    }
    import('src/components/saveToKnowledge/saveToKnowledge').then(saveToKnowledge => {
      const sourceData = {};
      sourceData.nodeId = kcFile.id;
      import('src/components/kc/folderSelectDialog/folderSelectDialog').then(folderDg => {
        folderDg({
          dialogTitle: _l('选择路径'),
          isFolderNode: 1,
          selectedItems: null,
          zIndex: 9999,
        })
          .then(result => {
            saveToKnowledge(nodeType, sourceData)
              .save(result)
              .then(() => {
                alert(_l('保存成功'));
              })
              .fail(() => {
                alert(_l('保存失败'), 2);
              });
          })
          .fail(() => {
            // alert('保存失败，未能成功调出知识文件选择层');
          });
      });
    });
  }
  handleWithdraw() {
    const { message, session } = this.props;
    const isAdmin = session.isAdmin || false;
    const { isMine } = message;
    const differenceTime = moment(getCurrentTime()).valueOf() - moment(message.time).valueOf() <= 300 * 1000;
    const isWithdraw = isMine ? differenceTime : isAdmin || differenceTime;
    if (isWithdraw) {
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
  handleCopyTextSuccess() {
    alert(_l('复制成功'));
    this.props.onSetMessageMoreVisible(false);
  }
  handleChange() {
    const { moreVisible } = this.props;
    this.props.onSetMessageMoreVisible(!moreVisible);
  }
  handleMouseLeave() {
    this.props.onSetMessageMoreVisible(false);
  }
  handleMouseEnter() {
    this.props.onSetMessageMoreVisible(true);
  }
  renderBtn(toolbarConfig) {
    return (
      <div className="Message-toolbarItem" onClick={toolbarConfig.fn}>
        <span className="Message-toolbarItemBtn ThemeColor3" data-tip={toolbarConfig.name}>
          <i className={toolbarConfig.icon} />
        </span>
      </div>
    );
  }
  renderItem(item) {
    return (
      <div className="menuItem ThemeBGColor3" onClick={item.fn}>
        <i className={item.icon} />
        <div className="menuItem-text">{item.name}</div>
      </div>
    );
  }
  renderCopy() {
    const { message } = this.props;
    return (
      <ClipboardButton
        component="div"
        data-clipboard-text={message.msg.con}
        onSuccess={this.handleCopyTextSuccess.bind(this)}
      >
        <div className="menuItem ThemeBGColor3">
          <i className="icon-content_copy" />
          <div className="menuItem-text">{_l('复制')}</div>
        </div>
      </ClipboardButton>
    );
  }
  renderMoreToolbar(moreConfig) {
    return (
      <div
        className="ChatPanel-MessageToolbar-Trigger"
        onMouseEnter={this.handleMouseEnter.bind(this)}
        onMouseLeave={this.handleMouseLeave.bind(this)}
      >
        <div className="ChatPanel-addToolbar-menu">
          {moreConfig.task &&
            this.renderItem({
              name: _l('创建为任务'),
              icon: 'icon-task',
              fn: this.handleCreateTask.bind(this),
            })}
          {moreConfig.schedule &&
            this.renderItem({
              name: _l('创建为日程'),
              icon: 'icon-bellSchedule',
              fn: this.handleCreateCalendar.bind(this),
            })}
          {moreConfig.preview &&
            this.renderItem({
              name: _l('预览'),
              icon: 'icon-eye',
              fn: this.handleMessageFilePreview.bind(this), // 普通文件预览
            })}
          {moreConfig.previewKnowledge &&
            this.renderItem({
              name: _l('预览'),
              icon: 'icon-eye',
              fn: this.handleMessageKnowledgePreview.bind(this), // 知识文件预览
            })}
          {moreConfig.share &&
            this.renderItem({
              name: _l('分享'),
              icon: 'icon-share',
              fn: this.handleShareNode.bind(this),
            })}
          {moreConfig.depositKnowledge &&
            this.renderItem({
              name: _l('存入知识'),
              icon: 'icon-batch_import',
              fn: this.handleSaveToKc.bind(this),
            })}

          {moreConfig.copy && <hr />}
          {moreConfig.copy && this.renderCopy()}

          {moreConfig.withdraw &&
            this.renderWithdrawItem({
              name: _l('撤回'),
              icon: 'icon-redo',
              fn: this.handleWithdraw.bind(this),
            })}
        </div>
      </div>
    );
  }
  renderWithdrawItem(withdrawConfig) {
    const { message, session } = this.props;
    const { isMine } = message;
    const isAdmin = session.isAdmin || false;
    const differenceTime = moment(getCurrentTime()).valueOf() - moment(message.time).valueOf() <= 300 * 1000;
    const isWithdraw = isMine ? differenceTime : isAdmin || differenceTime;
    return (
      <div className={cx('menuItem ThemeBGColor3', { disable: !isWithdraw })} onClick={withdrawConfig.fn}>
        <i className={withdrawConfig.icon} />
        <div className="menuItem-text">{withdrawConfig.name}</div>
      </div>
    );
  }
  renderMore(moreConfig) {
    const { moreVisible } = this.props;
    return (
      <Trigger
        popupVisible={moreVisible}
        onPopupVisibleChange={this.handleChange.bind(this)}
        popupClassName="ChatPanel-Trigger"
        action={['click']}
        popupPlacement="top"
        builtinPlacements={config.builtinPlacements}
        popup={this.renderMoreToolbar(moreConfig)}
        popupAlign={{ offset: [64, 0], overflow: { adjustX: 1, adjustY: 2 } }}
      >
        <div className="Message-toolbarItem">
          <span className="Message-toolbarItemBtn ThemeColor3" data-tip={_l('更多')}>
            <i className={cx('icon-more_horiz', { ThemeColor3: moreVisible })} />
          </span>
        </div>
      </Trigger>
    );
  }
  render() {
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
          {toolbarConfig.dynamic &&
            this.renderBtn({
              name: _l('创建为动态'),
              icon: 'icon-dynamic-empty',
              fn: this.handleCreatePost.bind(this),
            })}
          {toolbarConfig.download &&
            this.renderBtn({
              name: _l('下载'),
              icon: 'icon-download',
              fn: this.handleMessageFileDownload.bind(this),
            })}
          {toolbarConfig.more && this.renderMore(toolbarConfig.more)}
        </div>
      </div>
    );
  }
}
