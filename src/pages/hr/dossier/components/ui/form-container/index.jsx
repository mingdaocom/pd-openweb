import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class FormContainer extends Component {
  render() {
    return <div className="dossier-user-formcontainer">{this.props.children}</div>;
  }
}

FormContainer.propTypes = {
  /**
   * 子元素
   */
  children: PropTypes.any,
};

FormContainer.defaultProps = {
  children: null,
};

export default FormContainer;
