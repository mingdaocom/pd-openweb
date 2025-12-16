import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import intlTelInput, { initIntlTelInput } from 'ming-ui/components/intlTelInput';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const ClickAwayable = createDecoratedComponent(withClickAway);

const PhoneWrap = styled.div`
  z-index: 1;
  visibility: ${props => (props.isEditing || props.showCountry ? 'visible' : 'hidden')};
  ${props => (props.isCell ? `margin-top: -6px;` : '')};
  .cellMobileInput {
    line-height: 30px;
  }
  ${props => (props.showCountry && !props.isEditing && props.itiWidth ? `width: ${props.itiWidth};` : '')};
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

const MobilePhone = props => {
  const {
    hint,
    inputClassName,
    disabled,
    value,
    onChange,
    onBlur = () => {},
    onInputKeydown,
    enumDefault,
    advancedSetting,
    isCell,
    triggerCustomEvent,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
    formItemId,
    createEventHandler = () => {},
    onSetDialCode = () => {},
    recordId,
    flag,
  } = props;

  const [hideCountry, setHideCountry] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [isEditing, setIsEditing] = useState(isCell || false);
  const [itiWidth, setItiWidth] = useState('');

  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const itiRef = useRef(null);
  const valueRef = useRef(value);

  const initialCountry = () => {
    const initialCountry = _.get(md, 'global.Config.DefaultRegion') || 'cn';
    return advancedSetting.defaultarea ? JSON.parse(advancedSetting.defaultarea).iso2 : initialCountry;
  };

  const getCountries = (countries = '[]', defaultCountry) => {
    const preferredCountries = _.get(md, 'global.Config.DefaultConfig.preferredCountries') || ['cn'];
    if (enumDefault === 1) return [...preferredCountries, defaultCountry].filter(_.identity);
    const allCountries = _.isEmpty(JSON.parse(countries))
      ? []
      : [...JSON.parse(countries).map(o => o.iso2), defaultCountry].filter(_.identity);
    return _.uniq(allCountries);
  };

  const setValue = () => {
    if (itiRef.current) {
      !isEditing && itiRef.current.setNumber(valueRef.current || '');
      setHideCountry(!_.keys(itiRef.current.getSelectedCountryData()).length);
      setItiWidth($(inputRef.current).css('padding-left'));
    }

    // 有些国外号码在插件格式化时会被自动补些数字，导致跟客户录入的数据有出入
    // 手动取值更新，避开控件本身行为
    if (inputRef.current && !isEditing) {
      const currentValue = getItiInputValue(valueRef.current);
      const inputValue = inputRef.current.value;
      if (currentValue !== inputValue) {
        inputRef.current.value = currentValue;
      }
    }
  };

  const getItiInputValue = (inputValue = value) => {
    const showValue = inputValue || '';
    if (showValue && showValue.indexOf('+') > -1) {
      // 非编辑态iti被隐藏，本身的iti取不到区号
      const iti = initIntlTelInput();
      iti.setNumber(showValue);
      const dialCode = _.get(iti.getSelectedCountryData(), 'dialCode');
      if (dialCode) {
        const reg = new RegExp(`^\\+${dialCode}\\s?`);
        return showValue.replace(reg, '');
      } else {
        return showValue;
      }
    }
    return showValue;
  };

  const getShowValue = useMemo(() => {
    const currentValue = getItiInputValue() || '';
    if (currentValue) {
      return showMaskValue ? dealMaskValue({ ...props, value: currentValue }) : currentValue;
    } else {
      return hint;
    }
  }, [value, showMaskValue, hint]);

  useEffect(() => {
    if (inputRef.current) {
      itiRef.current && itiRef.current.destroy();
      itiRef.current = intlTelInput(inputRef.current, {
        customPlaceholder: () => hint,
        initialCountry: initialCountry(),
        preferredCountries: getCountries(advancedSetting.commcountries),
        onlyCountries: getCountries(advancedSetting.allowcountries, initialCountry()),
        separateDialCode: true,
        showSelectedDialCode: true,
        countrySearch: true,
      });
    }

    window.isPublicWorksheet &&
      value &&
      itiRef.current &&
      onSetDialCode(itiRef.current.getSelectedCountryData().dialCode);

    $(inputRef.current).on('close:countrydropdown keyup paste', () => {
      setTimeout(() => {
        handleChange();
      }, 10);
    });

    return () => {
      itiRef.current && itiRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    valueRef.current = value;
    setValue();
  }, [value]);

  useEffect(() => {
    if (!value) {
      itiRef.current && itiRef.current.setCountry(initialCountry());
      inputRef.current && setItiWidth($(inputRef.current).css('padding-left'));
    }
  }, [recordId, flag]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current && inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isCell && props.isEditing !== isEditing) {
      setIsEditing(props.isEditing);
    }
  }, [isCell, props.isEditing]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          setIsEditing(true);
          break;
        case 'trigger_tab_leave':
          inputRef.current && inputRef.current.blur();
          break;
        default:
          break;
      }
    }, []),
  );

  const onFocus = () => {
    const countryData = itiRef.current.getSelectedCountryData();
    let currentValue;
    if (!_.keys(countryData).length) {
      currentValue = $(inputRef.current).val().replace(/ /g, '');
    } else {
      currentValue = itiRef.current.getNumber();
    }
    setOriginValue(currentValue);
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = () => {
    // change事件有延时，失焦同样延时执行，等待value更新
    setTimeout(() => {
      onBlur(originValue);
      setIsEditing(false);
      if (!value) {
        itiRef.current && itiRef.current.setCountry(initialCountry());
        inputRef.current && setItiWidth($(inputRef.current).css('padding-left'));
      }
    }, 10);
  };

  const handleChange = _.debounce(() => {
    const countryData = itiRef.current.getSelectedCountryData();
    let currentValue;
    if (!_.keys(countryData).length) {
      currentValue = $(inputRef.current).val().replace(/ /g, '');
    } else {
      currentValue = itiRef.current.getNumber();
    }

    if (!currentValue && !valueRef.current) return;

    currentValue !== valueRef.current && onChange(currentValue);
  }, 300);

  const hiddenCountry = enumDefault === 1 || hideCountry;

  return (
    <div className={cx({ customFormControlTel: hiddenCountry, customFormControlMobileHover: !disabled })} ref={boxRef}>
      <MobilePhoneBox
        showCountry={!hiddenCountry}
        isEditing={isEditing}
        className={cx(
          'customFormControlBox customFormTextareaBo',
          { Gray_bd: !value },
          { controlDisabled: disabled },
          { Hidden: isCell },
        )}
        style={{ paddingLeft: hiddenCountry ? '12px' : `${itiWidth}` || '12px', height: '36px' }}
        onClick={() => {
          if (!disabled && !isEditing) {
            setIsEditing(true);
          }
        }}
      >
        <span
          className={cx('LineHeight20 nowrap InlineBlock overflowHidden', { maskHoverTheme: isMaskReadonly })}
          style={{ maxWidth: '100%', verticalAlign: 'middle' }}
          onClick={handleMaskClick}
        >
          {getShowValue}
          {renderMaskContent()}
        </span>
      </MobilePhoneBox>

      <PhoneWrap
        isEditing={isEditing}
        showCountry={!hiddenCountry}
        itiWidth={itiWidth}
        isCell={isCell}
        disabled={disabled}
        mobileWidth={_.get(boxRef.current, 'offsetWidth')}
      >
        <ClickAwayable onClickAway={() => setIsEditing(false)}>
          <input
            type="tel"
            className={cx(inputClassName || 'customFormControlBox', {
              controlDisabled: disabled,
              customFormPhoneBox: !isEditing && itiWidth,
            })}
            ref={inputRef}
            placeholder={hint}
            disabled={disabled}
            onFocus={onFocus}
            onBlur={handleBlur}
            onKeyDown={event => {
              createEventHandler(event, onInputKeydown);
            }}
          />
        </ClickAwayable>
      </PhoneWrap>
    </div>
  );
};

MobilePhone.propTypes = {
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
  isCell: PropTypes.bool,
  triggerCustomEvent: PropTypes.func,
  flag: PropTypes.any,
};

export default memo(MobilePhone, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
