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
   * ?????????
   */
  value: PropTypes.string,
  /**
   * ????????????
   */
  required: PropTypes.bool,
  /**
   * ????????????
   */
  disabled: PropTypes.bool,
  /**
   * ????????????????????? error.dirty???
   */
  showError: PropTypes.bool,
  /**
   * ??????????????????????????????
   * @param {Event} event - ????????????
   * @param {string} value - ?????????
   * @param {object} data - ????????????
   * data.prevValue - ????????????
   */
  onChange: PropTypes.func,
  /**
   * ????????????????????????
   * @param {Error} error - ??????
   * error.type - ????????????
   * error.dirty - ????????????????????????
   */
  onError: PropTypes.func,
  /**
   * ??????????????????????????? onError ?????????
   */
  onValid: PropTypes.func,
  /**
   * ??????????????????
   */
  onSave: PropTypes.func,
  /*
  * ????????????*/
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
