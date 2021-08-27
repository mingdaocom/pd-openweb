import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './transparentBtn.less';

class TransparentBtn extends Component {
  onClick = e => {
    this.props.onClick(e);
  };

  render() {
    return (
      <button className="transparentBtn" onClick={this.onClick}>
        {this.props.children}
      </button>
    );
  }
}

TransparentBtn.propTypes = {
  onClick: PropTypes.func,
};

TransparentBtn.defaultProps = {
  onClick: e => {},
};

export default TransparentBtn;
