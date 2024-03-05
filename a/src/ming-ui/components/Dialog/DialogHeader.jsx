import PropTypes from 'prop-types';
import React, { Component } from 'react';

class DialogHeader extends Component {
  render() {
    if (!this.props.title) {
      return null;
    }
    return <div className="mui-dialog-default-title">{this.props.title}</div>;
  }
}

DialogHeader.propTypes = {
  title: PropTypes.node,
};

export default DialogHeader;
