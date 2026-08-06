import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { createIntlTelInput } from 'ming-ui/components/PhoneNumberInput/util';

export default class Tel extends Component {
  componentDidMount() {
    const {
      data: { value },
    } = this.props;

    this.iti = createIntlTelInput(this.input, {
      customPlaceholder: '',
      separateDialCode: true,
      showSelectedDialCode: true,
      showDialCodeInput: true,
      initialCountry: this.props.allowDropdown ? _.get(md, 'global.Config.DefaultRegion') || 'cn' : 'cn',
      onlyCountries: this.props.allowDropdown ? [] : ['cn'], //只支持大陆号码
      allowDropdown: this.props.allowDropdown || false, //不下拉
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        (this.props.data || {}).value !== (prevProps.data || {}).value &&
        (this.props.value || (prevProps.data || {}).value !== undefined) &&
        this.input
      ) {
        this.setValue((this.props.data || {}).value);
      }
    }
  }

  componentWillUnmount() {
    this.destroy = true;
    this.iti && this.iti.destroy();
  }

  setValue(value) {
    if (this.iti) {
      this.iti.setNumber(value || '');
    }
  }

  onChange = () => {
    const countryData = this.iti.getSelectedCountryData();
    let value;

    if (!_.keys(countryData).length) {
      value = $(this.input).val().replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }

    if (this.iti.isValidNumber()) {
      $(this.input).removeClass('err');
    }

    (this.props.data || {}).value !== value && this.props.onChange({ value, isErr: !this.iti.isValidNumber() });
  };

  render() {
    const { inputClassName, onInputKeydown, clickCallback } = this.props;

    return (
      <div className={cx({})}>
        <input
          type="tel"
          className={cx(inputClassName)}
          ref={input => {
            this.input = input;
          }}
          placeholder={_l('填写手机号')}
          onBlur={() => {
            if (this.iti.getNumber() && !this.iti.isValidNumber()) {
              $(this.input).addClass('err');
              alert(_l('请输入正确的手机号'), 3);
              return;
            }
          }}
          onKeyDown={onInputKeydown}
          onClick={clickCallback}
        />
      </div>
    );
  }
}
