import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DropdownGroup extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
  };

  static defaultProps = {
    children: [],
  };

  render() {
    return (
      <div className={`ming DropdownGroup ${this.props.className}`}>
        {this.props.children[0]}
        {this.props.children.slice(1).map(dropdown => {
          if (dropdown.props && dropdown.props.data && dropdown.props.data.length) {
            return dropdown;
          }
          return null;
        })}
      </div>
    );
  }
}

export default DropdownGroup;
