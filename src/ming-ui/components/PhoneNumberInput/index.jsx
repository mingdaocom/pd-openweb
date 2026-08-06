import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import DialCodeSelectInstance from './DialCodeSelect';
import { formatPhoneDisplay, parseFullNumberInput, parsePhoneValue } from './DialCodeSelect/utils';

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  height: 100%;
  min-height: 36px;
  border: ${props =>
    props.disabled
      ? 'none'
      : props.isEditing
        ? '1px solid var(--color-primary) !important'
        : '1px solid var(--color-border-primary)'};
  background-color: ${props => (props.isEditing ? 'var(--color-background-primary)' : 'var(--color-background-input)')};
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  box-sizing: border-box;
  &:hover {
    border-color: var(--color-text-placeholder);
  }

  .ant-input {
    height: auto !important;
    min-height: calc(100% - 2px);
    padding: 0 12px !important;
    border: none !important;
    box-shadow: none !important;
    background-color: unset !important;
    &.ant-input-disabled {
      background-color: unset !important;
    }
  }
  .maskPhoneContent {
    flex: 1;
    padding: 0 32px 0 12px;
    display: flex;
    align-items: center;
    min-height: calc(100% - 2px);
    background-color: unset !important;
  }
  .dialCodeRoot {
    position: relative;
    min-height: calc(100% - 2px);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .countryTrigger {
    width: auto;
    min-width: fit-content;
    height: 100%;
    padding: 0 4px 0 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    pointer-events: ${props => (props.disabled ? 'none' : 'auto')};
    user-select: none;
  }
  .arrowIcon {
    font-size: 10px;
    line-height: 1;
  }
`;

const DEFAULT_CONTROL = {};

export default function PhoneNumberInput({
  control = DEFAULT_CONTROL,
  isFocused = false,
  onChange = _.noop,
  onBlur = _.noop,
  onFocus = _.noop,
  onKeyDown = _.noop,
  showMask = false,
  renderMask = _.noop,
  className,
  inputClassName,
  isCell = false,
}) {
  const [code, setCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [numberValue, setNumberValue] = useState('');
  const inputRef = useRef(null);
  const dialCodeRef = useRef(null);
  const countryTriggerRef = useRef(null);
  const handleCodeClickRef = useRef(() => {});
  const isSelectingCountryRef = useRef(false);
  const selectingTimerRef = useRef(null);

  const { value = '', hint, enumDefault, disabled, advancedSetting = {} } = control;

  const preferredCountries = safeParse(advancedSetting.commcountries || '[]', 'array');
  const onlyCountries = safeParse(advancedSetting.allowcountries || '[]', 'array');
  const locale = getCookie('i18n_langtag') || 'zh-CN';
  const hiddenCountry = useMemo(() => {
    return enumDefault === 1;
  }, [enumDefault]);

  const defaultCountry = useMemo(() => {
    const initialCountry = _.get(md, 'global.Config.DefaultRegion') || 'cn';
    const defaultArea = advancedSetting.defaultarea
      ? safeParse(advancedSetting.defaultarea || '{}').iso2
      : initialCountry;
    return defaultArea.toUpperCase();
  }, [advancedSetting.defaultarea]);

  const showValue = useMemo(() => {
    return isEditing ? numberValue : formatPhoneDisplay(value, numberValue);
  }, [numberValue, isEditing, value]);

  const emitIfChanged = nextValue => {
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const getNumberValue = ({ nextNumber = numberValue, nextCode = code } = {}) => {
    const normalizedNumber = String(nextNumber || '');

    if (normalizedNumber.startsWith('+')) {
      return normalizedNumber;
    }

    return normalizedNumber ? `${nextCode}${normalizedNumber}` : '';
  };

  const handleCodeClick = useCallback(
    nextCode => {
      isSelectingCountryRef.current = true;
      setCode(nextCode);
      setIsEditing(true);

      if (numberValue) {
        emitIfChanged(getNumberValue({ nextCode }));
      }

      setTimeout(() => {
        isSelectingCountryRef.current = false;
      }, 0);
    },
    [numberValue, emitIfChanged, getNumberValue],
  );

  handleCodeClickRef.current = handleCodeClick;

  useEffect(() => {
    return () => {
      if (selectingTimerRef.current) {
        clearTimeout(selectingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hiddenCountry || !countryTriggerRef.current) return;

    const instance = new DialCodeSelectInstance({
      dom: countryTriggerRef.current,
      value,
      defaultCountry,
      preferredCountries,
      onlyCountries,
      locale,
      onSelectCode: nextCode => handleCodeClickRef.current(nextCode),
    });

    dialCodeRef.current = instance;
    setCode(prevCode => prevCode || instance.getSelectedCountryData(value).code || '');

    return () => {
      instance._destroy && instance._destroy();
      if (dialCodeRef.current === instance) {
        dialCodeRef.current = null;
      }
    };
  }, [hiddenCountry, defaultCountry, preferredCountries, onlyCountries, locale]);

  useEffect(() => {
    if (!dialCodeRef.current) return;
    dialCodeRef.current.value = value;
    dialCodeRef.current.code = code;
  }, [value, code]);

  useEffect(() => {
    if (isSelectingCountryRef.current) return;

    const parsed = parsePhoneValue({ value, defaultCountry, code });

    setCode(prevCode => (parsed.code !== prevCode ? parsed.code : prevCode));
    setNumberValue(prevNumberValue => {
      const nextNumberValue = parsed.numberValue || '';
      return nextNumberValue !== prevNumberValue ? nextNumberValue : prevNumberValue;
    });
  }, [value, defaultCountry]);

  useEffect(() => {
    if (isFocused) {
      setIsEditing(true);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 0);
    }
  }, [isEditing]);

  return (
    <Wrap isEditing={isEditing} className={className} disabled={disabled}>
      {!hiddenCountry && (
        <div className="dialCodeRoot">
          <div
            className="countryTrigger"
            ref={countryTriggerRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onMouseDown={e => {
              isSelectingCountryRef.current = true;

              if (selectingTimerRef.current) {
                clearTimeout(selectingTimerRef.current);
              }

              selectingTimerRef.current = setTimeout(() => {
                isSelectingCountryRef.current = false;
              }, 300);

              if (isCell) {
                e.preventDefault();
              }
            }}
          >
            <span className="dialCode flex">{code}</span>
            <Icon icon="arrow-down" className="arrowIcon" />
          </div>
        </div>
      )}
      {showMask && !isEditing && numberValue ? (
        <div
          className="maskPhoneContent overflowHidden PhoneNumberInput"
          onClick={e => {
            e.stopPropagation();

            if (disabled) return;

            setIsEditing(true);
          }}
        >
          {renderMask(dealMaskValue({ ...control, value: numberValue }))}
        </div>
      ) : (
        <Input
          disabled={disabled}
          className={cx(inputClassName, { PhoneNumberInput: !isEditing })}
          value={showValue}
          placeholder={hint}
          ref={inputRef}
          onFocus={() => {
            setIsEditing(true);
            onFocus();
          }}
          onBlur={e => {
            const target = e.relatedTarget || document.activeElement;
            const isDialCodeInteraction =
              isCell &&
              (isSelectingCountryRef.current ||
                dialCodeRef.current?.isOpen ||
                !!target?.closest?.('.mdPhoneDialCodePanel'));

            if (isDialCodeInteraction) {
              return;
            }

            onBlur(getNumberValue());
            setIsEditing(false);
          }}
          onKeyDown={onKeyDown}
          onChange={e => {
            const inputValue = (e.target.value || '').trim();

            if (hiddenCountry) {
              setNumberValue(inputValue);
              emitIfChanged(getNumberValue({ nextNumber: inputValue }));
              return;
            }

            const parsed = parseFullNumberInput({ inputValue, defaultCountry, fallbackCode: code });

            if (parsed) {
              const nextCode = parsed.code;
              const nextNumber = parsed.numberValue || '';

              if (nextCode !== code) {
                setCode(nextCode);
              }

              setNumberValue(nextNumber);
              emitIfChanged(parsed.e164);

              return;
            }

            setNumberValue(inputValue);
            emitIfChanged(getNumberValue({ nextNumber: inputValue }));
          }}
        />
      )}
    </Wrap>
  );
}

PhoneNumberInput.propTypes = {
  control: PropTypes.object,
  isFocused: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  isCell: PropTypes.bool,
};
