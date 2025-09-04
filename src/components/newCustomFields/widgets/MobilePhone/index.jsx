import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import intlTelInput, { initIntlTelInput } from 'ming-ui/components/intlTelInput';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { browserIsMobile } from 'src/utils/common';
import { addBehaviorLog } from 'src/utils/project.js';

const ClickAwayable = createDecoratedComponent(withClickAway);

const PhoneWrap = styled.div`
  z-index: 1;
  visibility: ${props => (props.isEditing || props.showCountry ? 'visible' : 'hidden')};
  ${props => (props.isCell ? `margin-top: -6px;` : '')};
  .cellMobileInput {
    line-height: 30px;
  }
  ${props =>
    props.showCountry && !props.isEditing && props.itiWidth
      ? `width: ${props.isMobile && !props.disabled ? 'unset' : props.itiWidth};`
      : ''};
  input {
    padding-right: ${props => (props.showCountry && !props.isEditing && props.itiWidth ? '0px !important' : '12px')};
  }
  .iti__dropdown-content {
    max-width: 390px !important;
    width: ${props => `${props.mobileWidth || 100}px !important`};
  }
`;

const MobilePhoneBox = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
`;

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
    isEditing: this.props.isCell || false,
    maskStatus: _.get(this.props, 'advancedSetting.datamask') === '1',
  };

  componentDidMount() {
    const { hint, value, advancedSetting, onSetDialCode } = this.props;
    if (this.input) {
      this.iti && this.iti.destroy();
      this.iti = intlTelInput(this.input, {
        customPlaceholder: () => hint,
        initialCountry: this.initialCountry(),
        preferredCountries: this.getCountries(advancedSetting.commcountries),
        onlyCountries: this.getCountries(advancedSetting.allowcountries, this.initialCountry()),
        separateDialCode: true,
        showSelectedDialCode: true,
        countrySearch: true,
      });
    }

    this.setValue(value);

    window.isPublicWorksheet && value && onSetDialCode(this.iti.getSelectedCountryData().dialCode);

    $(this.input).on('close:countrydropdown keyup paste', () => {
      if (!this.destroy) {
        setTimeout(() => {
          this.onChange();
        }, 10);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value && (nextProps.value || this.props.value !== undefined) && this.input) {
      this.setValue(nextProps.value);
      if (!nextProps.value && this.iti) {
        this.iti.setCountry(this.initialCountry());
      }
    }
    if (nextProps.flag !== this.props.flag) {
      this.setState({
        maskStatus: _.get(nextProps, 'advancedSetting.datamask') === '1',
        itiWidth: $(this.input).css('padding-left'),
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled'])) ||
      !_.isEqual(
        _.pick(nextState, ['isEditing', 'maskStatus', 'hideCountry', 'itiWidth']),
        _.pick(this.state, ['isEditing', 'maskStatus', 'hideCountry', 'itiWidth']),
      )
    ) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    this.destroy = true;
    this.iti && this.iti.destroy();
  }

  initialCountry() {
    const { advancedSetting } = this.props;
    const initialCountry = _.get(md, 'global.Config.DefaultRegion') || 'cn';
    return advancedSetting.defaultarea ? JSON.parse(advancedSetting.defaultarea).iso2 : initialCountry;
  }

  getCountries(countries = '[]', defaultCountry) {
    const { enumDefault = 0 } = this.props;
    const preferredCountries = _.get(md, 'global.Config.DefaultConfig.preferredCountries') || ['cn'];
    if (enumDefault === 1) return [...preferredCountries, defaultCountry].filter(_.identity);
    const allCountries = _.isEmpty(JSON.parse(countries))
      ? []
      : [...JSON.parse(countries).map(o => o.iso2), defaultCountry].filter(_.identity);
    return _.uniq(allCountries);
  }

  setValue(value) {
    if (this.iti) {
      this.iti.setNumber(value || '');
      this.setState({
        hideCountry: !_.keys(this.iti.getSelectedCountryData()).length,
        itiWidth: $(this.input).css('padding-left'),
      });
    }
    // 有些国外号码在插件格式化时会被自动补些数字，导致跟客户录入的数据有出入
    // 手动取值更新，避开控件本身行为
    if (this.input) {
      const currentValue = this.getItiInputValue(value);
      const inputValue = this.input.value;
      if (currentValue !== inputValue) {
        this.input.value = currentValue;
      }
    }
  }

  onFocus = () => {
    const countryData = this.iti.getSelectedCountryData();
    let value;
    if (!_.keys(countryData).length) {
      value = $(this.input).val().replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }
    this.setState({ originValue: value, isEditing: true });

    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  onChange = _.debounce(() => {
    const countryData = this.iti.getSelectedCountryData();
    let value;
    if (!_.keys(countryData).length) {
      value = $(this.input).val().replace(/ /g, '');
    } else {
      value = this.iti.getNumber();
    }

    this.setState({ hideCountry: !_.keys(countryData).length, itiWidth: $(this.input).css('padding-left') });

    if (!this.props.value && !value) return;

    this.props.value !== value && this.props.onChange(value);
  }, 300);

  getItiInputValue = tempValue => {
    const value = tempValue || '';
    if (value && value.indexOf('+') > -1) {
      // 非编辑态iti被隐藏，本身的this.iti取不到区号
      const iti = initIntlTelInput();
      iti.setNumber(value);
      const dialCode = _.get(iti.getSelectedCountryData(), 'dialCode');
      if (dialCode) {
        const reg = new RegExp(`^\\+${dialCode}\\s?`);
        return value.replace(reg, '');
      } else {
        return value;
      }
    }
    return value;
  };

  getShowValue = () => {
    const value = this.getItiInputValue(this.props.value) || '';
    if (value) {
      return this.state.maskStatus ? dealMaskValue({ ...this.props, value }) : value;
    } else {
      return this.props.hint;
    }
  };

  render() {
    const {
      disabled,
      hint,
      inputClassName,
      onBlur = () => {},
      onInputKeydown,
      enumDefault,
      value,
      maskPermissions,
      isCell,
    } = this.props;
    const { hideCountry, originValue, maskStatus, isEditing, itiWidth } = this.state;
    const isMask = maskPermissions && value && maskStatus;
    const hiddenCountry = enumDefault === 1 || hideCountry;

    return (
      <div
        className={cx({ customFormControlTel: hiddenCountry, customFormControlMobileHover: !disabled })}
        ref={con => (this.box = con)}
      >
        <MobilePhoneBox
          showCountry={!hiddenCountry}
          isEditing={isEditing}
          className={cx(
            'customFormControlBox customFormTextareaBox',
            { Gray_bd: !value },
            { controlDisabled: disabled },
            { Hidden: isCell },
          )}
          style={{ paddingLeft: hiddenCountry ? '12px' : `${itiWidth}` || '12px', height: '36px' }}
          onClick={() => {
            if (!disabled && !isEditing) {
              this.setState({ isEditing: true }, () => this.input && this.input.focus());
            }
          }}
        >
          <span
            className={cx('LineHeight20', { maskHoverTheme: disabled && isMask })}
            onClick={() => {
              if (disabled && isMask) {
                addBehaviorLog('worksheetDecode', this.props.worksheetId, {
                  rowId: this.props.recordId,
                  controlId: this.props.controlId,
                });
                this.setState({ maskStatus: false });
              }
            }}
          >
            {this.getShowValue()}
            {isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
          </span>
        </MobilePhoneBox>

        <PhoneWrap
          isEditing={isEditing}
          showCountry={!hiddenCountry}
          itiWidth={itiWidth}
          isCell={isCell}
          isMobile={browserIsMobile()}
          disabled={disabled}
          mobileWidth={_.get(this.box, 'offsetWidth')}
        >
          <ClickAwayable onClickAway={() => this.setState({ isEditing: false })}>
            <input
              type="tel"
              className={cx(inputClassName || 'customFormControlBox', {
                controlDisabled: disabled,
                customFormPhoneBox: !isEditing && itiWidth && !browserIsMobile(),
              })}
              ref={input => {
                this.input = input;
              }}
              placeholder={hint}
              disabled={disabled}
              onFocus={this.onFocus}
              onBlur={() => {
                // change事件有延时，失焦同样延时执行，等待value更新
                setTimeout(() => {
                  onBlur(originValue);
                  this.setState({ isEditing: false });
                }, 10);
              }}
              onKeyDown={onInputKeydown}
            />
          </ClickAwayable>
        </PhoneWrap>

        {/* 有掩码并有解码权限 || 无掩码时可拨打电话 */}
        {(maskPermissions || (!isMask && !maskStatus)) && value && browserIsMobile() && (
          <a href={`tel:${value}`} className="Absolute customFormControlTelBtn" style={{ right: 0, top: 10 }}>
            <Icon icon="phone22" className="Font16 ThemeColor3" />
          </a>
        )}
      </div>
    );
  }
}
