import React, { Component } from 'react';
import { createLinksForMessage } from 'src/components/common/function';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const newWhiteList = Object.assign({}, whiteList, { img: ['src', 'alt', 'title', 'width', 'height', 'class'] });

export default class extends Component {
  constructor(props) {
    super(props);
  }
  replyAccountMsg() {
    const { showReplyMessage, replyAccount } = this.props;
    if (!showReplyMessage) {
      return null;
    }
    return (
      <span>{_l('回复')}<span style={{ color: '#2196f3' }}>{replyAccount.fullname}</span>: </span>
    );
  }
  renderMessage() {
    const { item } = this.props;
    const message = createLinksForMessage({
      sourceType: item.sourceType,
      message: item.message,
      rUserList: item.accountsInMessage,
    });
    return (
      <span
        className="singeText"
        dangerouslySetInnerHTML={{
          __html: filterXSS(message, {
            whiteList: newWhiteList,
          }),
        }}
      />
    );
  }
  render() {
    return (
      <div>
        {this.replyAccountMsg()}
        {this.renderMessage()}
      </div>
    );
  }
}
