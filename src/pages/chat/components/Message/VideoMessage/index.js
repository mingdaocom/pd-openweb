import React, { Component } from 'react';
import * as utils from '../../../utils/';
import { handleMessageFilePreview } from '../MessageToolbar';
import './index.less';

const formatTime = (seconds = 0) => {
  let minute = parseInt((seconds / 60) % 60);
  let second = parseInt(seconds % 60);

  minute = minute >= 10 ? minute : `0${minute}`;
  second = second >= 10 ? second : `0${second}`;

  return `${minute}:${second}`;
};

export default class VideoMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  componentDidMount() {
    const { loading } = this.state;
    const { session, message } = this.props;
    const { video_pic } = message.msg.files;
    if (video_pic && !loading) {
      this._isMounted = true;
      this.handleLoadImage(video_pic).then(() => {
        if (!this._isMounted) {
          return;
        }
        this.setState(
          {
            loading: true,
          },
          () => {
            utils.scrollEnd(session.id, message.waitingId ? true : false);
          },
        );
      });
    }
  }
  handleMessageFilePreview() {
    handleMessageFilePreview.call(this);
  }
  handleLoadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.src = url;
    });
  }
  render() {
    const { files } = this.props.message.msg;
    const { video_pic, video_duration, video_width, video_height } = files;
    const size = {
      width: (video_width || 2) > (video_height || 1) ? 240 : 180,
      height: (video_height || 1) > (video_width || 2) ? 240 : 180,
    };
    return (
      <div className="Message-card Message-cardVideo" style={size} onClick={this.handleMessageFilePreview.bind(this)}>
        <div className="Message-cardVideo-pic" style={{ backgroundImage: `url(${video_pic})` }} />
        <div className="Message-cardVideo-bottom">
          <i className="icon icon-video2" />
          <span>{video_duration ? formatTime(Number(video_duration)) : undefined}</span>
        </div>
      </div>
    );
  }
}
