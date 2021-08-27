import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckBox from '../check-box';
import { FormError } from '../lib';

export default class Switch extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.any,
    onChange: PropTypes.func,
  };

  componentDidMount() {
    this.checkValue(this.props.value === 1 || this.props.value === '1', false);
  }

  checkValue(checked, dirty) {
    const error = {
      type: '',
      message: '',
      dirty,
    };

    // required
    if (this.props.required && !checked) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      this.props.onValid();
    }
  }

  onChange = (event, checked) => {
    if (!this.props.disabled && this.props.onChange) {
      this.checkValue(checked, true);
      this.props.onChange(event, checked ? '1' : '0', { prevValue: this.props.value });
    }
  };

  render() {
    const { value, disabled } = this.props;
    return <CheckBox disabled={disabled} checked={value === 1 || value === '1'} onChange={this.onChange} />;
  }
}
