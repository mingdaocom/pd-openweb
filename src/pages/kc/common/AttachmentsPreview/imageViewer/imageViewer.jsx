﻿import React from 'react';
import ReactDOM from 'react-dom';
import { Motion, spring } from 'react-motion';
import cx from 'classnames';
import { assign, min } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './imageViewer.css';

function getClientX(evt) {
  return evt.clientX || _.get(evt, 'touches[0].clientX');
}
function getClientY(evt) {
  return evt.clientY || _.get(evt, 'touches[0].clientY');
}

const initialState = {
  src: '',
  loading: true,
  dragStart: null,
  mouseDownPos: null,
  left: 0,
  top: 0,
  scale: 1,
  rotate: 0, // 旋转度数
  isThumbnail: false,
  originSize: null,
  ctrlIsdDown: false,
};

class ImageViewer extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    onError: PropTypes.func,
    con: PropTypes.object,
    getResizedSrc: PropTypes.func,
    size: PropTypes.number,
    className: PropTypes.string,
    quotiety: PropTypes.number,
    toggleFullscreen: PropTypes.func,
    onClose: PropTypes.func,
    fullscreen: PropTypes.bool,
    showThumbnail: PropTypes.bool,
  };

  static defaultProps = {
    size: 0, // 图片大小
    getResizedSrc: (src, width, height) => {
      if (!src) {
        return '';
      }
      const imageView2 = 'imageView2/0/w/' + width + '/h/' + height + '/q/90';
      return src.indexOf('?') > 0
        ? src.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, imageView2)
        : src + '?' + imageView2;
    },
    quotiety: 0.2, // 放大、缩小系数
  };

  state = { ...initialState };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    let src;
    if (this.props.size > 512 * 1024 && this.props.getResizedSrc) {
      const { width, height } = document.body.getBoundingClientRect();
      src = this.props.getResizedSrc(this.props.src, Math.round(width * 0.9), Math.round(height * 0.9));
    } else {
      src = this.props.src;
    }
    this.setState({ isThumbnail: src !== this.props.src }, this.loadImage(src));
    document.addEventListener('mouseup', this.stopDrag);
    document.addEventListener('touchend', this.stopDrag);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('touchmove', this.mouseMove);
    document.addEventListener('keydown', this.ctrlDown);
    document.addEventListener('keyup', this.ctrlUp);
    window.addEventListener('wheel', this.onWheel, { passive: false });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      let src;
      if (this.props.size > 1024 * 1024 && this.props.getResizedSrc) {
        const { width, height } = document.body.getBoundingClientRect();
        src = this.props.getResizedSrc(this.props.src, Math.round(width * 0.9), Math.round(height * 0.9));
      } else {
        src = this.props.src;
      }
      this.setState(assign(initialState, { isThumbnail: src !== this.props.src }), this.loadImage(src));
    }
    if (!this.outViewerArea() && prevProps.showThumbnail !== this.props.showThumbnail) {
      this.reSize(this.props.showThumbnail);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('touchend', this.stopDrag);
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('touchmove', this.mouseMove);
    document.removeEventListener('keydown', this.ctrlDown);
    document.removeEventListener('keyup', this.ctrlUp);
    window.removeEventListener('wheel', this.onWheel, { passive: false });
    this._isMounted = false;
  }

  onWheel = evt => {
    if (this.state.ctrlIsdDown) {
      this.updateScale(evt.deltaY < 0);
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    if (this.outViewerArea()) {
      this.move(0, evt.deltaY > 0 ? -50 : 50);
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
  };

  loadImage(src, cb) {
    const img = new Image();
    img.onload = () => {
      if (!this._isMounted) {
        return;
      }
      let scale = 1;
      const { width, height } = img;
      if (!this.state.originSize) {
        const container = this.props.con ? this.props.con : ReactDOM.findDOMNode(this).parentNode;
        const rect = container.getBoundingClientRect();
        if (rect.width && rect.height) {
          scale = min([1, (rect.width * 0.95) / width, (rect.height * 0.95) / height]);
        }
      } else {
        scale = (this.state.scale * this.state.originSize.width) / width;
      }
      this._isMounted &&
        this.setState(
          {
            loading: false,
            originSize: { width, height },
            src,
            scale,
          },
          cb,
        );
    };
    img.onerror = () => {
      this.props.onError();
    };
    this.setState({ loading: true }, () => {
      img.src = src;
    });
  }

  mouseMove = evt => {
    if (this.props.fullscreen) {
      evt.preventDefault();
      return;
    }
    const { dragStart } = this.state;
    if (dragStart) {
      const deltaX = (getClientX(evt) - dragStart.x) / this.state.scale;
      const deltaY = (getClientY(evt) - dragStart.y) / this.state.scale;
      this.setState({ dragStart: { x: getClientX(evt), y: getClientY(evt) } });
      this.move(deltaX, deltaY);
      evt.preventDefault();
    }
  };

  move(deltaX, deltaY) {
    let { left, top } = this.state;
    const rad = (this.state.rotate * Math.PI) / 180;
    const deltaLeft = deltaY * Math.sin(rad) + deltaX * Math.cos(rad);
    const deltaTop = deltaY * Math.cos(rad) - deltaX * Math.sin(rad);
    left = left + deltaLeft;
    top = top + deltaTop;
    this.setState({ left, top }, this.positionCenter);
  }

  positionCenter() {
    if (this.state.loading || (!this.state.left && !this.state.right)) {
      return;
    }
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { width, height } = this.imageEle.getBoundingClientRect();
    if (width < rect.width && height < rect.height) {
      this.setState({ left: 0, top: 0 });
    }
  }

  /**
   * [updateScale 放大缩小]
   * @param  {Boolean} isBoost [是否放大]
   */
  updateScale(isBoost) {
    const scale = this.state.scale + (isBoost ? this.props.quotiety : -this.props.quotiety);
    if (scale < 0.1 || scale > 10) {
      return true;
    }
    this.setState({ scale }, this.positionCenter);
    if (scale > 1.2 && this.state.isThumbnail) {
      this.loadImage(this.props.src, () => this._isMounted && this.setState({ isThumbnail: false }));
    }
  }

  reSize(showThumbnail) {
    if (!this.imageEle) {
      return;
    }
    let scale;
    const { width, height } = this.imageEle;
    const rect = document.querySelector('.attachmentsPreview').getBoundingClientRect();
    const conHeight = rect.height - 54 - (showThumbnail ? 143 : 52);
    if (rect.width && rect.height) {
      scale = min([1, (rect.width * 0.95) / width, (conHeight * 0.95) / height]);
    }
    this.setState(
      {
        scale,
      },
      () => {
        this.positionCenter();
      },
    );
  }

  initDrag = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (!this.outViewerArea()) {
      return;
    }
    this.setState({
      dragStart: {
        x: getClientX(evt),
        y: getClientY(evt),
      },
      mouseDownPos: {
        x: getClientX(evt),
        y: getClientY(evt),
      },
    });
  };

  stopDrag = evt => {
    if (
      this.state.mouseDownPos &&
      getClientX(evt) === this.state.mouseDownPos.x &&
      getClientY(evt) === this.state.mouseDownPos.y
    ) {
      this.props.toggleFullscreen();
    }
    this.setState({
      dragStart: null,
      mouseDownPos: null,
    });
  };

  /* 缩小*/
  smallit() {
    this.updateScale(false);
  }

  /* 放大*/
  bigit() {
    this.updateScale(true);
  }

  /* 在 100% 和适应屏幕之间切换 */
  fitit() {
    if (this.state.scale !== 1) {
      this.setState({ scale: 1 }, this.positionCenter);
    } else {
      if (!this.state.originSize) return;
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      const { width, height } = this.state.originSize;
      const scale = min([(rect.width * 0.95) / width, (rect.height * 0.95) / height]);
      this.setState({ scale }, this.positionCenter);
    }
  }

  /* 旋转*/
  rotate(deg) {
    const current = this.state.rotate;
    const endValue = current + (typeof deg === 'undefined' ? -90 : deg);
    this.setState({
      rotate: endValue,
    });
  }

  ctrlDown = evt => {
    if (evt.keyCode === 17) {
      this.setState({
        ctrlIsdDown: true,
      });
    }
  };

  ctrlUp = evt => {
    if (evt.keyCode === 17) {
      this.setState({
        ctrlIsdDown: false,
      });
    }
  };

  onConClose = () => {
    // 当预览层在修改name时点击预览区域图片外区域不关闭弹层  --这样写太恶心了
    if (this.props.onClose) {
      if (document.activeElement == $('.previewHeader .editableBlock input')[0]) {
        return;
      }
      this.props.onClose();
    }
  };

  onImgClose(evt) {
    evt.stopPropagation();
  }

  outViewerArea() {
    if (!this.state.originSize) return false;
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { width, height } = this.state.originSize;
    const scale = this.state.scale;
    return height * scale > rect.height || width * scale > rect.width;
  }

  render() {
    const { canDownload } = this.props;
    const width = this.state.originSize ? this.state.originSize.width : 0;
    const { scale, left, top, rotate, dragStart } = this.state;
    return (
      <Motion
        defaultStyle={{ left: 0, top: 0, rotate: 0 }}
        style={{ left: dragStart ? left : spring(left), top: dragStart ? top : spring(top), rotate: spring(rotate) }}
      >
        {motionState => (
          <div className={cx('dragAbleContainer', this.props.className)} onMouseDown={this.onConClose}>
            {this.state.loading && <LoadDiv size="big" className="dragAbleLoadDiv" />}
            {this.state.src && (
              <img
                src={this.state.src}
                style={{
                  width,
                  transform: `rotate(${motionState.rotate}deg) scale(${scale}) translate(${motionState.left}px, ${motionState.top}px)`,
                }}
                alt=""
                ref={ele => {
                  this.imageEle = ele;
                }}
                className={cx('dragAbleImg noSelect', this.state.dragStart ? 'grabbing' : 'grab')}
                onMouseDown={this.initDrag}
                onTouchStart={this.initDrag}
                onContextMenu={e => {
                  if (!canDownload) {
                    e.preventDefault();
                  }
                }}
              />
            )}
          </div>
        )}
      </Motion>
    );
  }
}

export default ImageViewer;
