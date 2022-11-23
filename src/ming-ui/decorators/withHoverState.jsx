import PropTypes from 'prop-types';
import React from 'react';

function withHoverState(Component) {
  class HoverStateComponent extends React.Component {
    static propTypes = {
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
      const { thisArg, hoverStateName, ...rest } = this.props;
      return <Component {...rest} onMouseEnter={() => this.handleMouseEnter()} onMouseLeave={() => this.handleMouseLeave()} />;
    }
  }

  return HoverStateComponent;
}

export default withHoverState;
