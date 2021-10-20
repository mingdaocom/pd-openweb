import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import LazyloadImg from './lazyloadImg';
import NormalImg from './normalImg';

/**
 * 七牛图片
 */
class QiniuImg extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    size: PropTypes.number, // 如果图片为正方形，此参数为图片边长
    width: PropTypes.number,
    height: PropTypes.number,
    placeholder: PropTypes.string,
    qiniuSize: PropTypes.number, // 七牛缩略图大小
    qiniuWidth: PropTypes.number, // 七牛缩略图宽度，覆盖 qiniuSize
    qiniuHeight: PropTypes.number, // 七牛缩略图高度，覆盖 qiniuSize
    mode: PropTypes.number, // 七牛图片显示的 mode， 见 http://developer.qiniu.com/docs/v6/api/reference/fop/image/imageview2.html
    quality: PropTypes.number, // 七牛缩略图的质量，最大 100
    lazy: PropTypes.oneOfType([
      PropTypes.bool, // 是否懒加载
      PropTypes.object, // 懒加载，将此属性作为 lazyload 的 option
    ]),
  };

  getQiniuSrc = (src, mode, width, height) => {
    if (!mode && !_.isNumber(mode)) {
      mode = 1;
    }
    if (!src) {
      return '';
    }
    let imageView2 = 'imageView2/' + mode + '/w/' + width + '/h/' + height;
    if (this.props.quality) {
      imageView2 = imageView2 + '/q/' + this.props.quality;
    }
    return src.indexOf('?') > 0 ? src.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, imageView2) : src + '?' + imageView2;
  };

  render() {
    let { src, size, width, height, placeholder, qiniuSize, qiniuWidth, qiniuHeight, mode, quality, lazy, ...rest } = this.props;
    // src = src.substr(0, src.indexOf('?'));
    width = width || size;
    height = height || size;
    qiniuWidth = qiniuWidth || qiniuSize || width;
    qiniuHeight = qiniuHeight || qiniuSize || height;
    const attrs = _.assign({}, rest, {
      width,
      height,
      src: this.getQiniuSrc(src, this.mode, qiniuWidth, qiniuHeight),
      placeholder: this.getQiniuSrc(placeholder, this.mode, width, height),
    });
    return this.props.lazy ? <LazyloadImg {...attrs} options={_.isObject(this.props.lazy) ? this.props.lazy : undefined} /> : <NormalImg {...attrs} />;
  }
}

module.exports = QiniuImg;
