import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import styled from 'styled-components';

const Mask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  z-index: 20;
`;

const DragH = styled.div`
  position: absolute;
  cursor: ew-resize;
  width: 2px;
  height: 100%;
  background-color: #2196f3;
`;

const DragV = styled.div`
  position: absolute;
  cursor: ns-resize;
  width: 100%;
  height: 2px;
  background-color: #2196f3;
`;

export default class DragMast extends React.Component {
  static propTypes = {
    direction: PropTypes.string,
    value: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    direction: 'horizontal',
  };

  constructor(props) {
    super(props);
    this.value = props.value;
    this.random = Math.random();
  }

  componentDidMount() {
    const { min = 280, max = 800, direction } = this.props;
    if (this.mask) {
      setTimeout(() => {
        this.mask.addEventListener('mousemove', e => {
          if (direction === 'horizontal') {
            if (e.target === this.mask && e.offsetX > min && e.offsetX < max) {
              this.value = e.offsetX;
              this.drag.style.left = e.offsetX + 'px';
            }
          } else {
            if (e.target === this.mask && e.offsetY > min && e.offsetY < max) {
              this.value = e.offsetY;
              this.drag.style.top = e.offsetY + 'px';
            }
          }
        });
        document.body.addEventListener('mouseup', this.handleChange);
      }, 1);
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener('mouseup', this.handleChange);
  }

  @autobind
  handleChange() {
    const { onChange } = this.props;
    onChange(this.value);
  }

  render() {
    const { direction } = this.props;
    return (
      <Mask style={{ cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize' }} ref={mask => (this.mask = mask)}>
        {direction === 'horizontal' && <DragH ref={drag => (this.drag = drag)} style={{ left: this.value }} />}
        {direction === 'vertical' && <DragV ref={drag => (this.drag = drag)} style={{ top: this.value }} />}
      </Mask>
    );
  }
}
