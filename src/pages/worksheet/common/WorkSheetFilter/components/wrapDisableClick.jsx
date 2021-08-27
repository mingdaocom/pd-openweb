import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default function wrapDisableClick(Comp) {
  return class extends Component {
    static propTypes = {
      disabled: PropTypes.bool,
      onClick: PropTypes.func,
    };
    render() {
      const { disabled, onClick } = this.props;
      return <Comp { ...Object.assign({}, this.props, { onClick: disabled ? () => {} : onClick }) } />;
    }
  };
}
