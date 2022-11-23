import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { PREVIEW_TYPE } from '../constant/enum';
import * as Actions from '../actions/action';
import ThumbnailItem from '../thumbnailItem';

class ThumbnailGuide extends React.Component {
  static propTypes = {
    attachments: PropTypes.array,
    index: PropTypes.number,
    changeIndex: PropTypes.func,
    showThumbnail: PropTypes.bool,
    toggleThumbnail: PropTypes.func,
    className: PropTypes.string,
  };

  state = {
    itemWidth: 82,
    marginLeft: 0,
    fitited: false,
    tip: '',
    showThumbnail: false,
  };

  componentDidMount() {
    this.calPosition();
  }

  componentWillReceiveProps() {
    this.setState({ fitited: false });
  }

  componentDidUpdate() {
    this.calPosition();
  }

  calPosition = () => {
    let marginLeft = Math.abs(this.state.marginLeft);
    const guideWidth = Math.floor(this.thumbnailGuide.clientWidth * 0.8);
    const listBoxWidth = this.listBox.clientWidth;
    const itemWidth = this.state.itemWidth;
    const listWidth = this.props.attachments.length * itemWidth;
    const safeWidth = listBoxWidth - itemWidth * 2;
    const safeLeft = marginLeft + itemWidth;
    const safeRight = marginLeft + safeWidth + 5;
    const itemLeft = this.props.index * itemWidth;
    if (listBoxWidth < guideWidth || itemLeft < itemWidth || itemLeft >= listWidth - itemWidth) {
      return;
    }
    if (!_.inRange(itemLeft, safeLeft, safeRight)) {
      if (itemLeft < safeLeft) {
        marginLeft = -1 * (itemLeft - itemWidth);
      } else {
        marginLeft = -1 * (itemLeft - (listBoxWidth - itemWidth * 2));
      }
      this.setState({
        marginLeft,
      });
    }
  };

  showScaleTip = () => {
    this.setState({
      tip: _l('按住ctrl可通过滚轮缩放图片'),
    });
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => {
      this.setState({
        tip: '',
      });
    }, 5000);
  };

  foldThumbnail = () => {
    const { showThumbnail } = this.state;
    this.setState({ showThumbnail: !showThumbnail }, () => {
      this.props.toggleThumbnail(!showThumbnail);
    });
  };

  imageExec = key => {
    if (this.props[key]) {
      this.props[key]();
    }
  };

  render() {
    const { index, attachments } = this.props;
    const { showThumbnail } = this.state;
    const currentAttachment = attachments[index];
    const { viewUrl = '' } = currentAttachment;
    const fititClass = 'Hand ' + (this.state.fitited ? 'icon-Narrow' : 'icon-enlarge');
    return (
      <div className={cx('thumbnailGuide', this.props.className)} ref={guide => (this.thumbnailGuide = guide)}>
        <div className="statusBar fle" onClick={this.foldThumbnail}>
          <div className="fold">
            <div
              className="InlineBlock"
              onClick={evt => {
                evt.stopPropagation();
              }}
            >
              <span className="Hand" onClick={this.foldThumbnail}>
                <i
                  className={cx(showThumbnail ? 'icon-arrow-down-border' : 'icon-apps', 'Hand')}
                  title={showThumbnail ? _l('收起缩略图') : _l('展开缩略图')}
                />
                <span className="currentIndex">
                  {index + 1} / {this.props.attachments.length}
                </span>
              </span>
              {currentAttachment.previewType === PREVIEW_TYPE.PICTURE && (
                <div className="imageOperate Hand">
                  <i
                    title={!this.state.fitited ? _l('以100%尺寸查看图片') : _l('以预览尺寸查看图片')}
                    className={fititClass}
                    onClick={() => {
                      this.setState({
                        fitited: !this.state.fitited,
                      });
                      this.imageExec('fitit');
                    }}
                  />
                  <i
                    className="icon-zoom_in2 Hand"
                    title={_l('放大')}
                    onClick={() => {
                      this.showScaleTip();
                      this.imageExec('bigit');
                    }}
                  />
                  <i
                    className="icon-zoom_out Hand"
                    title={_l('缩小')}
                    onClick={() => {
                      this.showScaleTip();
                      this.imageExec('smallit');
                    }}
                  />
                  <i
                    className="icon-rotate Hand"
                    onClick={() => {
                      this.imageExec('rotate');
                    }}
                    title={_l('旋转')}
                  />
                  <a
                    className="originImage Hand noSelect"
                    href={
                      viewUrl.indexOf('imageView2') > -1
                        ? viewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/0')
                        : viewUrl
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                    title={_l('查看图片')}
                  >
                    {_l('原图')}
                  </a>
                </div>
              )}
            </div>

            <span className="tip noSelect">{this.state.tip}</span>
          </div>
        </div>
        <div
          className={cx('thumbnailList', {
            hide: !showThumbnail,
          })}
          ref={box => (this.listBox = box)}
          style={{
            overflowX: 'hidden',
          }}
        >
          <div
            className="listContainer"
            style={{
              width: this.props.attachments.length * this.state.itemWidth,
              marginLeft: this.state.marginLeft,
            }}
          >
            {this.props.attachments.map((attachment, i) => (
              <ThumbnailItem
                key={i}
                current={i === index}
                attachment={attachment}
                onClick={() => {
                  this.props.changeIndex(i);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    attachments: state.attachments,
    showThumbnail: state.showThumbnail,
    index: state.index,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeIndex: bindActionCreators(Actions.changeIndex, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ThumbnailGuide);
