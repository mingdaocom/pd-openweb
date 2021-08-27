import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Checkbox } from 'ming-ui';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  onChange = checked => {
    const value = checked ? '0' : '1';
    this.props.onChange(value);
  };

  render() {
    const { disabled, value } = this.props;

    return (
      <div className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}>
        <Checkbox className="customFormCheck" text="" disabled={disabled} checked={value === 1 || value === '1'} onClick={this.onChange} />
      </div>
    );
  }
}
