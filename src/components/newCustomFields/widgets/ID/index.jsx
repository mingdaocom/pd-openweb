import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    enumDefault: PropTypes.number,
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = this.formatValue(nextProps.value || '');
    }
  }

  formatValue = val => {
    return (val || '').toUpperCase();
  };

  onChange = event => {
    const value = this.formatValue(event.target.value);
    this.props.onChange(value);
  };

  render() {
    const { disabled, hint, value, onBlur, onChange } = this.props;
    const defaultValue = this.formatValue(value);

    return (
      <input
        type="text"
        className={cx('customFormControlBox', { controlDisabled: disabled })}
        ref={text => {
          this.text = text;
        }}
        placeholder={hint}
        disabled={disabled}
        defaultValue={defaultValue}
        maxLength={18}
        onChange={this.onChange}
        onBlur={event => {
          const newVal = this.formatValue(event.target.value.trim());
          if (newVal !== defaultValue) {
            onChange(newVal);
          }

          onBlur();
        }}
      />
    );
  }
}
