import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { autobind } from 'core-decorators';

const BarCon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #ccc;
`;

const Bar = styled.div`
  cursor: pointer;
  width: 10px;
  height: 10px;
  background: rgba(0, 0, 0, 0.6);
  &:hover {
    background: #999 !important;
  }
`;

export default class extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    barConClassName: PropTypes.string,
    barClassName: PropTypes.string,
    barConHorStyle: PropTypes.shape({}),
    barConVerStyle: PropTypes.shape({}),
    barVerStyle: PropTypes.shape({}),
    barHorStyle: PropTypes.shape({}),
    barwidth: PropTypes.number,
    vertical: PropTypes.bool,
    horizontal: PropTypes.bool,
    children: PropTypes.element,
    conRef: PropTypes.func,
    onScroll: PropTypes.func,
  };

  static defaultProps = {
    barwidth: 15,
    barConClassName: '',
    barConStyle: {},
    barClassName: '',
    barStyle: {},
    conRef: () => {},
    onScroll: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      verVisible: false,
      horVisible: false,
      barWidth: 0,
      barHeight: 0,
    };
  }

  componentDidMount() {
    this.initScrollBar(this.bindEvent);
    this.props.conRef(this.scrollinner.current);
  }

  componentDidUpdate() {
    const scrollWidth = this.scrollinner.current.scrollWidth;
    const scrollHeight = this.scrollinner.current.scrollHeight;
    if (scrollWidth !== this.scrollWidth || scrollHeight !== this.scrollHeight) {
      this.initScrollBar();
    }
  }

  componentWillUnmount() {
    this.unbindEvent();
  }

  scrollcon = React.createRef();
  scrollinner = React.createRef();
  scrollhor = React.createRef();
  scrollver = React.createRef();

  initScrollBar(cb = () => {}) {
    this.width = this.scrollcon.current.clientWidth;
    this.scrollWidth = this.scrollinner.current.scrollWidth;
    this.height = this.scrollcon.current.clientHeight;
    this.scrollHeight = this.scrollinner.current.scrollHeight;
    const horVisible = this.scrollWidth > this.width;
    const verVisible = this.scrollHeight > this.height;
    this.setState(
      {
        barWidth: (this.width / this.scrollWidth) * this.width,
        barHeight: (this.height / this.scrollHeight) * this.height,
        horVisible,
        verVisible,
      },
      cb
    );
  }

  bindEvent() {
    document.addEventListener('mousedown', this.documentMousedown);
    document.addEventListener('mouseup', this.documentMouseup);
    document.addEventListener('mousemove', this.documentMousemove);
  }

  unbindEvent() {
    document.removeEventListener('mousedown', this.documentMousedown);
    document.removeEventListener('mouseup', this.documentMouseup);
    document.removeEventListener('mousemove', this.documentMousemove);
  }

  @autobind
  documentMousedown(e) {
    if (e.target === this.scrollver.current) {
      this.lastY = e.y;
      this.startScrollTop = this.scrollinner.current.scrollTop;
      this.verdown = true;
    }
    if (e.target === this.scrollhor.current) {
      this.lastX = e.x;
      this.startScrollLeft = this.scrollinner.current.scrollLeft;
      this.hordown = true;
    }
  }

  @autobind
  documentMousemove(e) {
    if (this.verdown) {
      this.scrollinner.current.scrollTop = this.startScrollTop + ((e.y - this.lastY) / (this.height / this.scrollHeight));
      e.preventDefault();
    }
    if (this.hordown) {
      this.scrollinner.current.scrollLeft = this.startScrollLeft + ((e.x - this.lastX) / (this.width / this.scrollWidth));
      e.preventDefault();
    }
  }

  @autobind
  documentMouseup(e) {
    this.lastY = 0;
    this.lastX = 0;
    this.verdown = false;
    this.hordown = false;
  }

  @autobind
  handleScroll(e) {
    if (!this.scrollcon || !this.scrollcon.current || !this.scrollinner || !this.scrollinner.current) {
      return;
    }
    if (this.scrollhor && this.scrollhor.current) {
      this.scrollhor.current.style.transform = `translate3d(${(this.scrollinner.current.scrollLeft / this.scrollWidth) * this.width}px,0px,0px)`;
    }
    if (this.scrollver && this.scrollver.current) {
      this.scrollver.current.style.transform = `translate3d(0px,${(this.scrollinner.current.scrollTop / this.scrollHeight) * this.height}px,0px)`;
    }
    this.props.onScroll(e);
  }

  render() {
    const { className, style, barConClassName, barClassName, barConVerStyle, barConHorStyle, barVerStyle, barHorStyle, barwidth, vertical, horizontal, children } = this.props;
    const { barWidth, barHeight, verVisible, horVisible } = this.state;
    const scrollStyle = Object.assign({}, {
      position: 'relative',
      overflow: 'hidden',
    }, style);
    return (
      <div className={`mdscroll ${className}`} style={scrollStyle} ref={this.scrollcon}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0 - barwidth,
            left: 0,
            right: 0 - barwidth,
            overflow: 'scroll',
          }}
          ref={this.scrollinner}
          onScroll={this.handleScroll}
          className="mdcrollinner"
        >
          {children}
        </div>
        {verVisible && !horizontal && (
          <BarCon className={barConClassName} style={Object.assign({}, barConVerStyle, { top: 0 })}>
            <Bar className={barClassName} ref={this.scrollver} style={Object.assign({}, barVerStyle, { height: barHeight })} />
          </BarCon>
        )}
        {horVisible && !vertical && (
          <BarCon className={barConClassName} style={Object.assign({}, barConHorStyle, { left: 0 })}>
            <Bar className={barClassName} ref={this.scrollhor} style={Object.assign({}, barHorStyle, { width: barWidth })} />
          </BarCon>
        )}
      </div>
    );
  }
}
