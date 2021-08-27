import React from 'react';
import PropTypes from 'prop-types';

function createDecoratedComponent(decorator, ...args) {
  @decorator.bind(null, ...args)
  class DecoratedComponent extends React.Component {
    // eslint-disable-line react/prefer-stateless-function
    render() {
      const { component, ...props } = this.props;
      return React.createElement(component || 'div', props);
    }
  }
  DecoratedComponent.propTypes = {
    component: PropTypes.any,
  };

  return DecoratedComponent;
}

module.exports = createDecoratedComponent;
