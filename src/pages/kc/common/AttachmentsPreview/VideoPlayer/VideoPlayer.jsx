import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { changeStateOfAttachment } from '../actions/action';
import { PREVIEW_TYPE } from '../constant/enum';
import './VideoPlayer.less';

function supportsVideo() {
  return !!document.createElement('video').canPlayType;
}

class VideoPlayer extends Component {
  static propTypes = {
    src: PropTypes.string,
    attachment: PropTypes.object,
    changeStateOfAttachment: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      showMask: true,
    };
  }
  componentDidMount() {
    this.loadVideo(this.props.src);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.loadVideo(nextProps.src);
    }
  }
  loadVideo(src) {
    const browserSupport = supportsVideo();
    const videoContent = this.videoContent;
    videoContent.controls = false;
    if (browserSupport) {
      videoContent.src = src;
      this.setState({
        showMask: true,
      });
      videoContent.addEventListener('error', err => {
        console.log('play video error ->', err);
        this.loadInOther();
      });
    } else {
      this.loadInOther();
    }
  }
  loadInOther() {
    const newAttachment = this.props.attachment;
    newAttachment.previewType = PREVIEW_TYPE.OTHER;
    newAttachment.msg = _l('此文件格式不支持在线播放，您可以下载后使用其他应用打开');
    this.props.changeStateOfAttachment();
  }
  render() {
    const { canDownload } = this.props;
    return (
      <div className="videoPlayer">
        <video
          className="videoContent"
          ref={content => (this.videoContent = content)}
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={e => {
            if (!canDownload) {
              e.preventDefault();
            }
          }}
          style={{
            maxWidth: window.innerWidth * 0.8 + 'px',
            maxHeight: window.innerHeight * 0.8 + 'px',
          }}
        />
        {this.state.showMask && (
          <div className="mask">
            <div
              className="playControl"
              onClick={() => {
                this.videoContent.play();
                this.videoContent.controls = true;
                this.setState({
                  showMask: false,
                });
              }}
            >
              <span className="icon icon-arrow-right" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    changeStateOfAttachment: bindActionCreators(changeStateOfAttachment, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(VideoPlayer);
