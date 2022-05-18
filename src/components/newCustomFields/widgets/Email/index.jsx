import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    hint: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  state = {
    originValue: '',
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.text && nextProps.value !== this.text.value) {
      this.text.value = nextProps.value || '';
    }
  }

  onChange = event => {
    const value = event.target.value;
    this.props.onChange(value);
  };

  render() {
    const { disabled, hint, value, onBlur, onChange } = this.props;
    const { originValue } = this.state;

    return (
      <input
        type="text"
        className={cx('customFormControlBox', { controlDisabled: disabled })}
        ref={text => {
          this.text = text;
        }}
        placeholder={hint}
        disabled={disabled}
        defaultValue={value}
        onChange={this.onChange}
        onFocus={e => this.setState({ originValue: e.target.value.trim() })}
        onBlur={event => {
          if (event.target.value.trim() !== value) {
            onChange(event.target.value.trim());
          }

          onBlur(originValue);
        }}
      />
    );
  }
}
