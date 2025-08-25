import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

class SelectItem extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.number,
    children: PropTypes.string,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  handleClick = event => {
    this.props.onClick(this.props.value, event.target.offsetTop);
  };

  render() {
    const { disabled, active } = this.props;
    const optionEvent = {
      onClick: !disabled ? this.handleClick : null,
    };
    const optCls = classNames('TimePicker-select-item', {
      actived: active,
      disabled,
    });
    return (
      <li ref={ref => (this._selectitem = ref)} className={optCls} {...optionEvent}>
        {this.props.children}
      </li>
    );
  }
}

export default SelectItem;
