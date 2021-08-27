import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import Dropdown from './Dropdown';

/**
 * <DropdownGroup>
 *   <Dropdown data={[]}>
 *   </Dropdown>
 * </DropdownGroup>
 * 第一级Dropdown恒定显示，如果第二级的Dropdown没有数据，则不显示
 */

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
        {this.props.children.slice(1).map((dropdown) => {
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
