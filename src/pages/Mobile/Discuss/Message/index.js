import React, { Component } from 'react';
import createLinksForMessage from 'src/util/createLinksForMessage';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const newWhiteList = Object.assign({}, whiteList, { img: ['src', 'alt', 'title', 'width', 'height', 'class'] });

export default class extends Component {
  constructor(props) {
    super(props);
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
    return <div>{this.renderMessage()}</div>;
  }
}
