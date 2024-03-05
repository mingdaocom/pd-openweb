import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { formatNumberFromInput } from 'src/util';
import './less/Input.less';

const SIZE_LIST = ['small', 'default'];

class Input extends Component {
  static propTypes = {
    type: PropTypes.string,
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onChangeText: PropTypes.func,
    size: PropTypes.oneOf(SIZE_LIST),
    name: PropTypes.string, // 表单item名字
    manualRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  };
  static defaultProps = {
    type: 'text',
  };
  constructor(props) {
    super(props);
    let value = '';
    if ('defaultValue' in props) {
      value = props.defaultValue;
    }
    if ('value' in props) {
      value = props.value;
    }
    this.state = {
      value,
    };
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
      });
    }
  }
  onChange(event) {
    let value = event.target.value;
    if (this.props.valueFilter) {
      value = this.props.valueFilter(value);
    }
    if (this.props.value === undefined) {
      this.setState({
        value,
      });
    }
    if (this.props.onChange) {
      this.props.onChange(value);
    }
    if (this.props.onChangeText) {
      this.props.onChangeText(value);
    }
  }

  render() {
    const { size, type, defaultValue, value, manualRef, ...others } = this.props;
    return (
      <input
        {...others}
        type={type}
        ref={manualRef}
        value={this.state.value}
        className={cx(SIZE_LIST.indexOf(size) >= 0 ? 'Input--' + size : '', 'ming Input', this.props.className)}
        onChange={event => this.onChange(event)}
      />
    );
  }
}

Input.NumberInput = function(props) {
  const { value, onChange, onBlur, ...rest } = props;
  return (
    <Input
      {...rest}
      value={value}
      onBlur={e => {
        onBlur(e.target.value === '-' ? '' : parseFloat(e.target.value));
      }}
      onChange={e => {
        onChange(formatNumberFromInput(e.target.value));
      }}
    />
  );
};

export default Input;
