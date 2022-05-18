import PropTypes from 'prop-types';
import React, { Component } from 'react';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';

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
    from: PropTypes.number,
  };

  state = {
    hideCountry: false,
    originValue: '',
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
    if (nextProps.value !== this.props.value && (nextProps.value || this.props.value !== undefined) && this.input) {
      this.setValue(nextProps.value);
      if (!nextProps.value && this.iti) {
        this.iti.setCountry(this.initialCountry());
      }
    }
  }

  componentWillUnmount() {
    this.destroy = true;
    this.iti && this.iti.destroy();
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

  onFocus = e => {
    const countryData = this.iti.getSelectedCountryData();
    let value;
    if (!_.keys(countryData).length) {
      value = $(this.input).val().replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }
    this.setState({ originValue: value });
  };

  onChange = () => {
    const countryData = this.iti.getSelectedCountryData();
    let value;
    if (!_.keys(countryData).length) {
      value = $(this.input).val().replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }

    this.setState({ hideCountry: !_.keys(countryData).length });
    this.props.value !== value && this.props.onChange(value);
  };

  render() {
    const { disabled, hint, inputClassName, onBlur, onInputKeydown, enumDefault, from, value } = this.props;
    const { hideCountry, originValue } = this.state;

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
          onFocus={this.onFocus}
          onBlur={() => onBlur(originValue)}
          onKeyDown={onInputKeydown}
        />

        {(_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) || (browserIsMobile() && from === FROM.SHARE)) && !!value && (
          <a href={`tel:${value}`} className="Absolute customFormControlTelBtn" style={{ right: 0, top: 10 }}>
            <Icon icon="phone22" className="Font16 ThemeColor3" />
          </a>
        )}
      </div>
    );
  }
}
