import React, { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Popover } from 'ming-ui/antd-components';
import { dealMaskValue } from 'src/utils/domain/control/mask';
import DialCodePanel from './DialCodeSelect/DialCodePanel';
import { buildCountryOptions, formatPhoneDisplay, parseFullNumberInput, parsePhoneValue } from './DialCodeSelect/utils';

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  height: 100%;
  min-height: 36px;
  border: ${props =>
    props.$disabled
      ? 'none'
      : props.$isEditing
        ? '1px solid var(--color-primary) !important'
        : '1px solid var(--color-border-primary)'};
  background-color: ${props =>
    props.$isEditing ? 'var(--color-background-primary)' : 'var(--color-background-input)'};
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  box-sizing: border-box;
  &:hover {
    border-color: var(--color-text-placeholder);
  }

  .hap-input {
    height: auto !important;
    min-height: calc(100% - 2px);
    padding: 0 12px !important;
    border: none !important;
    box-shadow: none !important;
    background-color: unset !important;
    &.hap-input-disabled {
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
    cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
    pointer-events: ${props => (props.$disabled ? 'none' : 'auto')};
    user-select: none;
  }
  .arrowIcon {
    font-size: 10px;
    line-height: 1;
  }
`;

const DEFAULT_CONTROL = {};
const DIAL_CODE_POPOVER_STYLES = {
  container: {
    overflow: 'hidden',
  },
};

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
  getPopupContainer,
}) {
  const [code, setCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [numberValue, setNumberValue] = useState('');
  const [dialCodeOpen, setDialCodeOpen] = useState(false);
  const inputRef = useRef(null);
  const codeRef = useRef('');
  const isSelectingCountryRef = useRef(false);
  const selectingTimerRef = useRef(null);

  const { value = '', hint, enumDefault, disabled, advancedSetting = {} } = control;

  const preferredCountriesSetting = advancedSetting.commcountries || '[]';
  const onlyCountriesSetting = advancedSetting.allowcountries || '[]';
  const preferredCountries = useMemo(() => safeParse(preferredCountriesSetting, 'array'), [preferredCountriesSetting]);
  const onlyCountries = useMemo(() => safeParse(onlyCountriesSetting, 'array'), [onlyCountriesSetting]);
  const locale = getCookie('i18n_langtag') || 'zh-CN';
  const hiddenCountry = enumDefault === 1;
  const editing = isEditing || isFocused;

  const defaultCountry = useMemo(() => {
    const initialCountry = _.get(md, 'global.Config.DefaultRegion') || 'cn';
    const defaultArea = advancedSetting.defaultarea
      ? safeParse(advancedSetting.defaultarea || '{}').iso2
      : initialCountry;
    return defaultArea.toUpperCase();
  }, [advancedSetting.defaultarea]);

  const countryOptions = useMemo(
    () => buildCountryOptions({ preferredCountries, onlyCountries, locale }),
    [preferredCountries, onlyCountries, locale],
  );

  const showValue = useMemo(() => {
    return editing ? numberValue : formatPhoneDisplay(value, numberValue);
  }, [numberValue, editing, value]);

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

  const resetSelectingCountry = delay => {
    if (selectingTimerRef.current) {
      clearTimeout(selectingTimerRef.current);
    }

    selectingTimerRef.current = setTimeout(() => {
      isSelectingCountryRef.current = false;
    }, delay);
  };

  const handleCodeClick = nextCode => {
    isSelectingCountryRef.current = true;
    setDialCodeOpen(false);
    codeRef.current = nextCode;
    setCode(nextCode);
    setIsEditing(true);

    if (numberValue) {
      emitIfChanged(getNumberValue({ nextCode }));
    }

    resetSelectingCountry(0);
  };

  useEffect(() => {
    return () => {
      if (selectingTimerRef.current) {
        clearTimeout(selectingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSelectingCountryRef.current) return;

    const parsed = parsePhoneValue({ value, defaultCountry, code: codeRef.current });

    codeRef.current = parsed.code;
    setCode(prevCode => (parsed.code !== prevCode ? parsed.code : prevCode));
    setNumberValue(prevNumberValue => {
      const nextNumberValue = parsed.numberValue || '';
      return nextNumberValue !== prevNumberValue ? nextNumberValue : prevNumberValue;
    });
  }, [value, defaultCountry]);

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 0);
    }
  }, [editing]);

  return (
    <Wrap $isEditing={editing} className={className} $disabled={disabled}>
      {!hiddenCountry && (
        <div className="dialCodeRoot">
          <Popover
            content={
              <DialCodePanel
                inPopover
                countryOptions={countryOptions}
                code={code}
                preferredCountries={preferredCountries}
                locale={locale}
                onSelectCode={handleCodeClick}
                onClose={() => setDialCodeOpen(false)}
              />
            }
            open={!disabled && dialCodeOpen}
            getPopupContainer={getPopupContainer}
            placement="bottomLeft"
            noPadding
            styles={DIAL_CODE_POPOVER_STYLES}
            trigger="click"
            onOpenChange={open => {
              if (!disabled) {
                setDialCodeOpen(open);
              }
            }}
          >
            <div
              className="countryTrigger"
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-expanded={!disabled && dialCodeOpen}
              aria-haspopup="dialog"
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setDialCodeOpen(false);
                  return;
                }

                if (!['Enter', ' '].includes(e.key) || disabled) return;

                e.preventDefault();
                setDialCodeOpen(open => !open);
              }}
              onMouseDown={e => {
                isSelectingCountryRef.current = true;
                resetSelectingCountry(300);

                if (isCell) {
                  e.preventDefault();
                }
              }}
            >
              <span className="dialCode flex">{code}</span>
              <Icon icon="arrow-down" className="arrowIcon" />
            </div>
          </Popover>
        </div>
      )}
      {showMask && !editing && numberValue ? (
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
          className={cx(inputClassName, { PhoneNumberInput: !editing })}
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
              isCell && (isSelectingCountryRef.current || dialCodeOpen || !!target?.closest?.('.mdPhoneDialCodePanel'));

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
                codeRef.current = nextCode;
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
  getPopupContainer: PropTypes.func,
};
