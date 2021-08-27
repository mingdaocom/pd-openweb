import PropTypes from 'prop-types';
import React, { Component } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import cx from 'classnames';

export default class Widgets extends Component {
  static propTypes = {
    hint: PropTypes.string,
    inputClassName: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onInputKeydown: PropTypes.func,
    enumDefault: PropTypes.number,
    advancedSetting: PropTypes.any,
  };

  state = {
    hideCountry: false,
  };

  componentDidMount() {
    const { hint, value, advancedSetting } = this.props;

    this.iti = intlTelInput(this.input, {
      customPlaceholder: () => hint,
      autoPlaceholder: 'off',
      initialCountry: this.initialCountry(),
      preferredCountries: this.getCountries(advancedSetting.commcountries),
      onlyCountries: this.getCountries(advancedSetting.allowcountries),
      loadUtils: '',
      utilsScript: utils,
      separateDialCode: true,
    });

    this.setValue(value);

    $(this.input).on('close:countrydropdown keyup paste', () => {
      if (!this.destroy) {
        setTimeout(() => {
          this.onChange();
        }, 10);
      }
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.value !== this.props.value && this.props.value !== undefined && this.input) {
      this.setValue(nextProps.value);
      if (!nextProps.value && this.iti) {
        this.iti.setCountry(this.initialCountry());
      }
    }
  }

  componentWillUnmount() {
    this.destroy = true;
    this.iti.destroy();
  }

  initialCountry() {
    const { enumDefault = 0, advancedSetting } = this.props;
    return enumDefault === 1 ? 'cn' : advancedSetting.defaultarea ? JSON.parse(advancedSetting.defaultarea).iso2 : 'cn';
  }

  getCountries(countries = '[]') {
    const { enumDefault = 0 } = this.props;
    return enumDefault === 1 ? ['cn'] : JSON.parse(countries).map(o => o.iso2);
  }

  setValue(value) {
    if (this.iti) {
      this.iti.setNumber(value || '');
      this.setState({ hideCountry: !_.keys(this.iti.getSelectedCountryData()).length });
    }
  }

  onChange = () => {
    const countryData = this.iti.getSelectedCountryData();
    let value;
    if (!_.keys(countryData).length) {
      value = $(this.input)
        .val()
        .replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }

    this.setState({ hideCountry: !_.keys(countryData).length });
    this.props.value !== value && this.props.onChange(value);
  };

  render() {
    const { disabled, hint, inputClassName, onBlur, onInputKeydown, enumDefault } = this.props;
    const { hideCountry } = this.state;

    return (
      <div className={cx({ customFormControlTel: enumDefault === 1 || hideCountry })}>
        <input
          type="tel"
          className={cx(inputClassName || 'customFormControlBox', { controlDisabled: disabled })}
          ref={input => {
            this.input = input;
          }}
          placeholder={hint}
          disabled={disabled}
          onBlur={onBlur}
          onKeyDown={onInputKeydown}
        />
      </div>
    );
  }
}
