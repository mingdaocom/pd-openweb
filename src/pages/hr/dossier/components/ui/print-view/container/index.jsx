import PropTypes from 'prop-types';
import React, { Component } from 'react';

class PrintContainer extends Component {
  render() {
    return <div className="dossier-print-container">{this.props.children}</div>;
  }
}

PrintContainer.propTypes = {
  /**
   * 子元素
   */
  children: PropTypes.any,
};

PrintContainer.defaultProps = {
  children: null,
};

export default PrintContainer;
