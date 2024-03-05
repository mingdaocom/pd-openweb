import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import * as socket from '../../../utils/socket';
import player from '../../../lib/mp3player/mp3player';

export default class AudioMessage extends Component {
  constructor(props) {
    super(props);
    const { message } = this.props;
    const { files } = message.msg;
    this.state = {
      audioPlaying: false,
      isRead: files ? files.read : true,
    };
    this.audio = null;
  }
  handlePlayAudio() {
    const { message } = this.props;
    const { files } = message.msg;

    if (!files.read) {
      socket.Message.markAudioAsRead({
        messageId: message.id,
      });
      this.setState({
        isRead: true,
      });
    }

    // 第一次播放
    if (!this.audio) {
      this.setState({
        audioPlaying: true,
      });
      this.audio = new player({
        mp3_url: files.url,
        wav_url: files.url,
        onStop: () => {
          this.setState({
            audioPlaying: false,
          });
        },
      });
      window.chatAudioPlayer = this.audio;
      window.chatAudioPlayer.play();
    } else if (this.state.audioPlaying) {
      // 取消播放
      this.audio.stop();
      window.chatAudioPlayer.stop();
    } else {
      // 重播
      window.chatAudioPlayer = this.audio;
      window.chatAudioPlayer.play();
      this.setState({
        audioPlaying: true,
      });
    }
  }
  render() {
    const { message } = this.props;
    const { files } = message.msg;
    const { audioPlaying, isRead } = this.state;
    return (
      <div className="Message-audio" onClick={this.handlePlayAudio.bind(this)}>
        <i className={cx('Message-audioIcon', { audioPlaying })} />
        <span>{files ? parseInt(files.len) || 0 : 0} ”</span>
        {isRead ? undefined : <div className="Message-audioUnread" />}
      </div>
    );
  }
}
