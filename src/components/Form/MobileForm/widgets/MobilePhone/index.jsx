import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import intlTelInput, { initIntlTelInput } from 'ming-ui/components/intlTelInput';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { ADD_EVENT_ENUM } from '../../../core/enum';

const CustomFormControlPhone = styled.div`
  position: relative;
  .iti__selected-country {
    ${props => (props.hiddenCountry ? 'display: none;' : '')};
  }
  .iti--allow-dropdown {
    width: 100%;
  }
  .iti__dropdown-content {
    max-width: 390px !important;
    width: ${props => `${props.mobileWidth || 100}px !important`};
  }
  .phoneDisabled {
    background: transparent !important;
    border-color: transparent !important;
  }
  .phoneEditReadonly {
    background: var(--gray-f9) !important;
  }
  input {
    ${props => (props.hiddenCountry ? 'padding-left: 12px !important;' : '')};
  }
  .customFormControlTelBtn {
    position: absolute;
    right: 0;
    top: 50%;
    z-index: 2;
    transform: translateY(-50%);
  }
`;

const MobilePhone = props => {
  const {
    className,
    hint,
    flag,
    maskPermissions,
    enumDefault = 0,
    value = '',
    advancedSetting = {},
    triggerCustomEvent,
    disabled,
    formDisabled,
    onBlur = () => {},
  } = props;
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const iti = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [maskStatus, setMaskStatus] = useState(advancedSetting.datamask === '1');
  const [hideCountry, setHideCountry] = useState(false);
  const [itiWidth, setItiWidth] = useState(0);

  const isMask = useMemo(() => {
    return maskPermissions && value && maskStatus;
  }, [maskPermissions, value, maskStatus]);

  const hiddenCountry = useMemo(() => {
    return enumDefault === 1 || hideCountry;
  }, [enumDefault, hideCountry]);

  const initialCountry = () => {
    const initialCountry = _.get(md, 'global.Config.DefaultConfig.initialCountry') || 'cn';
    return enumDefault === 1
      ? initialCountry
      : advancedSetting.defaultarea
        ? JSON.parse(advancedSetting.defaultarea).iso2
        : initialCountry;
  };

  const getCountries = (countries = '[]') => {
    const preferredCountries = _.get(md, 'global.Config.DefaultConfig.preferredCountries') || ['cn'];
    return enumDefault === 1 ? preferredCountries : JSON.parse(countries).map(o => o.iso2);
  };

  const getSearchResult = (commcountries = '[]') => {
    const countries = safeParse(commcountries, 'array');
    return _.isEmpty(countries);
  };

  const getItiInputValue = value => {
    if (value && value.indexOf('+') > -1) {
      // 非编辑态iti被隐藏，本身的iti取不到区号
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

  const getShowValue = () => {
    const val = getItiInputValue(value) || '';
    return val && maskStatus ? dealMaskValue({ ...props, value: val }) : val || hint;
  };

  const onFocus = event => {
    const countryData = iti.current.getSelectedCountryData();

    setOriginValue(!_.keys(countryData).length ? inputRef.current.value.replace(/ /g, '') : iti.current.getNumber());
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const onChange = useCallback(
    _.debounce(props => {
      const countryData = iti.current.getSelectedCountryData();
      let currentValue;
      if (!_.keys(countryData).length) {
        currentValue = inputRef.current.value.replace(/ /g, '');
      } else {
        currentValue = iti.current.getNumber();
      }

      setHideCountry(!_.keys(countryData).length);
      setItiWidth($(inputRef.current).css('padding-left'));
      props.value !== currentValue && props.onChange(currentValue);
    }, 300),
    [],
  );

  useEffect(() => {
    if (inputRef.current) {
      if (!iti.current) {
        iti.current = intlTelInput(inputRef.current, {
          initialCountry: initialCountry(),
          preferredCountries: getCountries(advancedSetting.commcountries),
          onlyCountries: getCountries(advancedSetting.allowcountries),
          separateDialCode: true,
          showSelectedDialCode: true,
          countrySearch: getSearchResult(advancedSetting.commcountries),
        });
      }

      if (iti.current) {
        iti.current.setNumber(value || '');
        setHideCountry(!_.keys(iti.current.getSelectedCountryData()).length);
        setItiWidth($(inputRef.current).css('padding-left'));
      }
      // 有些国外号码在插件格式化时会被自动补些数字，导致跟客户录入的数据有出入
      // 手动取值更新，避开控件本身行为
      const currentValue = getItiInputValue(value);
      const inputValue = inputRef.current.value;
      if (currentValue !== inputValue) {
        inputRef.current.value = currentValue;
      }
    }
  }, [value]);

  useEffect(() => {
    setMaskStatus(_.get(props, 'advancedSetting.datamask') === '1');
  }, [flag]);

  useEffect(() => {
    if (inputRef.current) {
      $(inputRef.current).on('close:countrydropdown keyup paste', () => {
        setTimeout(() => {
          onChange(props);
        }, 10);
      });
    }

    return () => {
      iti.current && iti.current.destroy();
    };
  }, []);

  return (
    <CustomFormControlPhone
      hiddenCountry={hiddenCountry}
      itiWidth={itiWidth}
      disabled={disabled}
      mobileWidth={_.get(boxRef.current, 'offsetWidth')}
      ref={boxRef}
    >
      <div
        className={cx('customFormControlBox customFormControlInputView', {
          phoneEditReadonly: !formDisabled && value && disabled,
          phoneDisabled: formDisabled,
        })}
        style={{
          paddingLeft: hiddenCountry ? (disabled ? '0px' : '12px') : `${itiWidth}`,
          zIndex: isEditing ? -1 : 1,
        }}
        onClick={() => {
          if (disabled) return;
          setIsEditing(true);
          inputRef.current.focus();
        }}
      >
        <span
          className={cx({ overflowEllipsis: !value })}
          onClick={() => {
            if (disabled && isMask) setMaskStatus(false);
          }}
        >
          {getShowValue()}
          {isMask && <Icon icon="eye_off" className={cx('commonFormIcon', disabled ? 'mLeft7' : 'maskIcon')} />}
        </span>
      </div>
      <input
        type="tel"
        className={cx('customFormControlBox', {
          Visibility: disabled,
        })}
        disabled={disabled}
        ref={inputRef}
        onFocus={onFocus}
        onBlur={() => {
          onBlur(originValue);
          setIsEditing(false);
        }}
      />
      {/* 有掩码并有解码权限 || 无掩码时可拨打电话 */}
      {(maskPermissions || (!isMask && !maskStatus)) && value && formDisabled && (
        <a href={`tel:${value}`} className="customFormControlTelBtn">
          <Icon icon="phone22" className="Font16 ThemeColor3" />
        </a>
      )}
    </CustomFormControlPhone>
  );
};

MobilePhone.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  flag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maskPermissions: PropTypes.bool,
  enumDefault: PropTypes.number,
  value: PropTypes.string,
  advancedSetting: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
};

export default memo(MobilePhone, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});
