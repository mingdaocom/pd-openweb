import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import { min, assign } from 'lodash';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';
import tweenState from 'react-tween-state';
import './imageViewer.css';

const ImageViewer = createReactClass({
  displayName: 'ImageViewer',

  propTypes: {
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
  },

  mixins: [tweenState.Mixin],

  getDefaultProps() {
    return {
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
  },

  getInitialState() {
    return {
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
  },

  _isMounted: false,

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
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('keydown', this.ctrlDown);
    document.addEventListener('keyup', this.ctrlUp);
  },

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      let src;
      if (this.props.size > 1024 * 1024 && this.props.getResizedSrc) {
        const { width, height } = document.body.getBoundingClientRect();
        src = this.props.getResizedSrc(this.props.src, Math.round(width * 0.9), Math.round(height * 0.9));
      } else {
        src = this.props.src;
      }
      this.setState(assign(this.getInitialState(), { isThumbnail: src !== this.props.src }), this.loadImage(src));
    }
    if (!this.outViewerArea() && prevProps.showThumbnail !== this.props.showThumbnail) {
      this.reSize(this.props.showThumbnail);
    }
  },

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('keydown', this.ctrlDown);
    document.removeEventListener('keyup', this.ctrlUp);
    this._isMounted = false;
  },

  onWheel(evt) {
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
  },

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
  },

  mouseMove(evt) {
    if (this.props.fullscreen) {
      evt.preventDefault();
      return;
    }
    const { dragStart } = this.state;
    if (dragStart) {
      const deltaX = (evt.clientX - dragStart.x) / this.state.scale;
      const deltaY = (evt.clientY - dragStart.y) / this.state.scale;
      this.setState({ dragStart: { x: evt.clientX, y: evt.clientY } });
      this.move(deltaX, deltaY);
      evt.preventDefault();
    }
  },

  move(deltaX, deltaY) {
    let { left, top } = this.state;
    const rad = (this.state.rotate * Math.PI) / 180;
    const deltaLeft = deltaY * Math.sin(rad) + deltaX * Math.cos(rad);
    const deltaTop = deltaY * Math.cos(rad) - deltaX * Math.sin(rad);
    left = left + deltaLeft;
    top = top + deltaTop;
    this.setState({ left, top }, this.positionCenter);
  },

  positionCenter() {
    if (this.state.loading || (!this.state.left && !this.state.right)) {
      return;
    }
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { width, height } = this.imageEle.getBoundingClientRect();
    if (width < rect.width && height < rect.height) {
      this.tweenState('left', { endValue: 0 });
      this.tweenState('top', { endValue: 0 });
    }
  },

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
  },

  reSize(showThumbnail) {
    let scale;
    const { width, height } = this.imageEle;
    const container = this.props.con ? this.props.con : ReactDOM.findDOMNode(this).parentNode;
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
  },

  initDrag(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (!this.outViewerArea()) {
      return;
    }
    this.setState({
      dragStart: {
        x: evt.clientX,
        y: evt.clientY,
      },
      mouseDownPos: {
        x: evt.clientX,
        y: evt.clientY,
      },
    });
  },

  stopDrag(evt) {
    if (
      this.state.mouseDownPos &&
      evt.clientX === this.state.mouseDownPos.x &&
      evt.clientY === this.state.mouseDownPos.y
    ) {
      this.props.toggleFullscreen();
    }
    this.setState({
      dragStart: null,
      mouseDownPos: null,
    });
  },

  /* 缩小*/
  smallit() {
    this.updateScale(false);
  },

  /* 放大*/
  bigit() {
    this.updateScale(true);
  },

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
  },

  /* 旋转*/
  rotate(deg) {
    const current = this.state.rotate;
    const beginValue = current <= -360 ? (current % 360) + 360 : current;
    const endValue = beginValue + (typeof deg === 'undefined' ? -90 : deg);
    this.tweenState('rotate', { beginValue, endValue });
  },

  ctrlDown(evt) {
    if (evt.keyCode === 90) {
      this.setState({
        ctrlIsdDown: true,
      });
    }
  },

  ctrlUp(evt) {
    if (evt.keyCode === 90) {
      this.setState({
        ctrlIsdDown: false,
      });
    }
  },

  onConClose(evt) {
    // 当预览层在修改name时点击预览区域图片外区域不关闭弹层  --这样写太恶心了
    if (this.props.onClose) {
      if (document.activeElement == $('.previewHeader .editableBlock input')[0]) {
        return;
      }
      this.props.onClose();
    }
  },

  onImgClose(evt) {
    evt.stopPropagation();
  },

  outViewerArea() {
    if (!this.state.originSize) return false;
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { width, height } = this.state.originSize;
    const scale = this.state.scale;
    return height * scale > rect.height || width * scale > rect.width;
  },

  render() {
    const transform =
      'rotate(' +
      this.getTweeningValue('rotate') +
      'deg) scale(' +
      this.state.scale +
      ') translate(' +
      this.getTweeningValue('left') +
      'px,' +
      this.getTweeningValue('top') +
      'px)';
    const width = this.state.originSize ? this.state.originSize.width : 0;

    return (
      <div
        className={cx('dragAbleContainer', this.props.className)}
        onWheel={this.onWheel}
        onMouseDown={this.onConClose}
      >
        {this.state.loading && <LoadDiv size="big" className="dragAbleLoadDiv" />}
        {this.state.src && (
          <img
            src={this.state.src}
            style={{
              width,
              WebkitTransform: transform,
              MsTransform: transform,
              transform,
            }}
            alt=""
            ref={ele => {
              this.imageEle = ele;
            }}
            className={cx('dragAbleImg noSelect', this.state.dragStart ? 'grabbing' : 'grab')}
            onMouseDown={this.initDrag}
          />
        )}
      </div>
    );
  },
});

module.exports = ImageViewer;
