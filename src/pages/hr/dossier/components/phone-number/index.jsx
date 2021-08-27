import PropTypes from 'prop-types';
import React, { Component } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import { checkControlUnique } from '../../util';

import './style.less';

import { FormError } from '../lib';

class PhoneNumber extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // current value
      // value: this.props.value || '',
      // value error
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };

    // input value
    // this.inputValue = '';
  }

  componentDidMount() {
    const $input = $(this.input);
    this.iti = intlTelInput(this.input, {
      customPlaceholder: () => {
        return this.props.hint;
      },
      autoPlaceholder: 'off',
      initialCountry: 'cn',
      loadUtils: '',
      preferredCountries: ['cn'],
      utilsScript: utils,
      separateDialCode: true,
    });
    // set input value
    this.setValue(this.props.value);

    // country change
    $input.on('countrychange keyup', (event) => {
      this.onChange(event);
    });

    // check init value
    this.checkValue(this.props.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // value changed[outer value]
    if (nextProps.value !== this.props.value && this.input) {
      this.setValue(nextProps.value);
      this.onChange(null, nextProps.value);
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  componentWillUnmount() {
    this.iti.destroy();
  }

  // setter
  setValue(value) {
    if (this.iti) {
      this.oldValue = this.getValue();
      this.iti.setNumber(value || '');
    }
  }

  // getter
  getValue() {
    if (this.iti) {
      return this.iti.getNumber();
    }
    return '';
  }

  // value changed[inside value]
  onChange = (event, _value) => {
    const countryData = this.iti.getSelectedCountryData();
    let value = _value === undefined ? this.getValue() : _value;
    if (!_.keys(countryData).length) {
      value = $(this.input).val();
    }
    this.checkValue(value, true);

    if (_value === undefined) {
      if (this.props.onChange) {
        // fire onChange callback
        this.props.onChange(event, value, {
          prevValue: this.oldValue,
        });
      }

      if (!this.state.error && _.trim(_value)) {
        this.props.onSave(null, this.getValue());
      }
      this.setState({
        changed: true,
      });
    }
  };

  onBlur(e) {
    const { recordId, worksheetId, control } = this.props;
    const newValue = this.getValue();
    if (!this.state.error) {
      if (this.props.control.unique && this.state.changed && newValue) {
        checkControlUnique(worksheetId, control.controlId, control.type, newValue).then((res) => {
          if (!res.isSuccess && res.data && res.data.rowId !== recordId) {
            if (this.props.onError) {
              this.props.onError({
                type: FormError.types.UNIQUE,
                dirty: true,
              });
            }
            this.setState({
              error: true,
              showError: true,
            });
          }
        });
      }
      this.props.onSave(e, newValue);
    }
  }

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };
    const inputValue = this.input ? $.trim($(this.input).val()) : '';
    // required
    if (this.props.required && (!value || !value.length || !inputValue || !inputValue.length)) {
      error.type = FormError.types.REQUIRED;
    } else if (this.props.validate && inputValue && inputValue.length && !this.iti.isValidNumber()) {
      // !valid
      error.type = FormError.types.MOBILEPHONE;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      // fire onValid callback
      this.props.onValid();
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  render() {
    const classList = ['mui-phonenumber', 'ThemeFocusBorderColor3'];
    // is error
    if (this.state.error && this.state.showError) {
      classList.push('mui-phonenumber-error');
    }

    const classNames = classList.join(' ');

    return (
      <input
        type="tel"
        ref={(input) => {
          this.input = input;
        }}
        placeholder={this.props.hint}
        className={classNames}
        disabled={this.props.disabled}
        onBlur={(event) => {
          this.onBlur(event);
        }}
      />
    );
  }
}

PhoneNumber.propTypes = {
  /**
   * 当前值
   */
  value: PropTypes.string,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 【回调】内容发生改变
   * @param {Event} event - 触发事件
   * @param {string} value - 当前值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  /**
   * 失去焦点保存
   */
  onSave: PropTypes.func,
  /*
  * 引导文字*/
  hint: PropTypes.string,
};

PhoneNumber.defaultProps = {
  value: '',
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, prevValue, currentValue) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
  onSave: (event, value) => { },
};

export default PhoneNumber;
