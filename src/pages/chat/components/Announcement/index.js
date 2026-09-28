import React, { Component } from 'react';
import * as utils from '../../utils';
import './index.less';

export default class Announcement extends Component {
  render() {
    const { about } = this.props.session;
    return (
      <div className="ChatPanel-Announcement ChatPanel-sessionInfo-item">
        <div className="ChatPanel-Announcement-hander ChatPanel-sessionInfo-hander">{_l('群公告')}</div>
        <div className="ChatPanel-Announcement-body">
          <div
            className="ChatPanel-Announcement-text"
            dangerouslySetInnerHTML={{ __html: utils.convertGroupAbout(about) }}
          />
        </div>
      </div>
    );
  }
}
