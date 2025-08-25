import React, { Component } from 'react';
import * as utils from '../../../utils';
import './index.less';

export default class TextMessage extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { message } = this.props;
    return (
      <span
        className="Message-text"
        dangerouslySetInnerHTML={{ __html: utils.messageContentParser(message.msg.con) }}
      />
    );
  }
}
