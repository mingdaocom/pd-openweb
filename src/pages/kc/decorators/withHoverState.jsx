import React from 'react';
import PropTypes from 'prop-types';

class HoverState extends React.Component {
  static propTypes = {
    component: PropTypes.any,
    thisArg: PropTypes.object.isRequired, // 需要调用 setState 的 this 对象
    hoverStateName: PropTypes.string.isRequired, // 需要设置的 state key，onMouseEnter 时设为 true, onMouseLeave 时设为 false
  };

  handleMouseEnter() {
    const state = {};
    state[this.props.hoverStateName] = true;
    this.props.thisArg.setState(state);
  }

  handleMouseLeave() {
    const state = {};
    state[this.props.hoverStateName] = false;
    this.props.thisArg.setState(state);
  }

  render() {
    const rest = { ...this.props };
    const Component = rest.component || 'div';
    delete rest.component;
    delete rest.hoverStateName;
    delete rest.thisArg;

    return (
      <Component {...rest} onMouseEnter={() => this.handleMouseEnter()} onMouseLeave={() => this.handleMouseLeave()} />
    );
  }
}

export default HoverState;
