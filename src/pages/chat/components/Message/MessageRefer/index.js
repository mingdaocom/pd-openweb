import React, { Component } from 'react';
import kc from 'src/api/kc';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import Constant from '../../../utils/constant';
import './index.less';

export default class MessageRefer extends Component {
  constructor(props) {
    super(props);
  }
  handleGotoMessage(event) {
    event.stopPropagation();
    const { message } = this.props;
    const { iswd } = message;
    if (!iswd) {
      this.props.onGotoMessage(message.msgid);
    }
  }
  handlePreview(event) {
    const { message } = this.props;
    const { card, msgdetail = {} } = message;
    const { files } = msgdetail;

    if (files) {
      event.stopPropagation();
      const attachments = {
        fileid: files.id,
        name: files.name,
        path: files.url,
        size: files.size,
        previewAttachmentType: 'QINIU',
      };
      previewAttachments(
        {
          attachments: [attachments],
          callFrom: 'chat',
          hideFunctions: ['editFileName'],
        },
        {},
      );
    } else if (card) {
      event.stopPropagation();
      kc.getNodeDetail({ id: card.entityid }).then(result => {
        previewAttachments(
          {
            attachments: [result],
            callFrom: 'kc',
            hideFunctions: ['editFileName'],
          },
          {},
        );
      });
    } else {
      this.props.onGotoMessage(message.msgid);
    }
  }
  renderIcon(type) {
    if (type === Constant.MSGTYPE_FILE) {
      return <i className="icon-defaultFile" />;
    } else if (type === Constant.MSGTYPE_PIC) {
      return <i className="icon-picture" />;
    } else {
      return undefined;
    }
  }
  render() {
    const { message } = this.props;
    const { user, type, iswd } = message;
    return (
      <div className="Message-refer-container" onClick={this.handleGotoMessage.bind(this)}>
        <div className="content">
          {iswd ? (
            <div className="text">{_l('该消息已撤回')}</div>
          ) : (
            <div className="text">
              “ {this.renderIcon(type)} {user.full_name}：
              <span onClick={this.handlePreview.bind(this)} className="ThemeColor3">
                {message.msg}
              </span>{' '}
              ”
            </div>
          )}
        </div>
      </div>
    );
  }
}
