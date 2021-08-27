import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { convertImageView } from 'src/util';
import { getFileIconNameByExt } from '../../../utils';
import { PREVIEW_TYPE } from '../constant/enum';

const typeColors = {
  '7z': '#FBC02d',
  ai: '#ff9100',
  cal: '#9c27b0',
  doc: '#acacac',
  excel: '#4caf50',
  img: '#ff5252',
  mmap: '#d32f2f',
  pdf: '#d32f2f',
  ppt: '#f57c00',
  psd: '#536dfe',
  rar: '#fbc02d',
  txt: '#1de9b6',
  vsd: '#c2185b',
  word: '#448aff',
  xmind: '#d32f2f',
  zip: '#fbc02d',
  link: '#00bcd4',
};

class ThumbnailItem extends React.Component {
  static propTypes = {
    attachment: PropTypes.object,
    current: PropTypes.bool,
    onClick: PropTypes.func,
  };

  state = {
    error: false,
  };

  render() {
    const MAX_IMG_VIEW_SIZE = 20971520;
    const attachment = this.props.attachment;
    const { previewType, size, name } = attachment;
    const ext = attachment.ext.toLowerCase();
    let content;
    if (previewType === PREVIEW_TYPE.PICTURE && size < MAX_IMG_VIEW_SIZE && !this.state.error && (!attachment.refId || attachment.shareUrl)) {
      const imagePath = convertImageView(attachment.viewUrl, 1, 70, 70);
      content = (
        <img
          onError={() => {
            this.setState({
              error: true,
            });
          }}
          src={imagePath}
          alt=""
        />
      );
    } else {
      const bgColor = typeColors[getFileIconNameByExt(ext)] || '#acacac';
      content = (
        <span className="typeBlock" style={{ backgroundColor: bgColor }}>
          <span className="fileName">{name.length > 10 ? name.slice(0, 10) + '...' : name}</span>
          <span className="extName ellipsis">{ext.toUpperCase()}</span>
        </span>
      );
    }
    return (
      <div
        onClick={this.props.onClick}
        className={cx('thumbnailItem', {
          current: this.props.current,
        })}
      >
        {content}
      </div>
    );
  }
}

module.exports = ThumbnailItem;
