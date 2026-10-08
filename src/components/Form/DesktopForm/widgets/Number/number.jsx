import React, { memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { InputNumber } from 'ming-ui/antd-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { accDiv, accMul } from 'src/utils/core/arithmetic';
import { dealMaskValue } from 'src/utils/domain/control/mask';
import { formatNumberThousand, formatStrZero, toFixed } from 'src/utils/domain/control/number';

const NumWrap = styled.span`
  ${props => (props.$isMaskReadonly ? 'display: inline-block;' : 'flex: 1;')}
  position: relative;
  .maskIcon {
    right: 0px !important;
  }
`;

const NumberInput = styled(InputNumber)`
  &.customFormControlBox {
    flex: 1;
    width: 100%;
    height: 36px;
    padding: 0 0 0 12px !important;
    border: 1px solid
      ${props => (props.$isFormDetail ? 'var(--color-background-secondary)' : 'var(--color-border-primary)')} !important;
    background: ${props =>
      props.$isFormDetail ? 'var(--color-background-secondary)' : 'var(--color-background-input)'};
    box-shadow: none;
  }

  .hap-input-number-input {
    padding: 0;
  }

  .maskIcon {
    position: static;
    transform: none;
  }

  &.customFormControlBox:focus-within,
  &.customFormControlBox:focus-within:hover {
    border-color: var(--color-primary) !important;
    background: ${props =>
      props.$isFormDetail ? 'var(--color-background-primary)' : 'var(--color-background-input)'} !important;
    box-shadow: none;
  }
`;

const INPUT_NUMBER_BASE_STYLES = {
  suffix: {
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
const DISABLED_ACTIONS_STYLE = { color: 'var(--color-text-disabled)', pointerEvents: 'none' };

const getInputValueStyle = (value, advancedSetting) => {
  if (!value && value !== 0) return { paddingInline: 0 };

  const { valuecolor = 'var(--color-text-primary)', valuestyle = '0000' } = advancedSetting;
  const [isBold, isItalic, isUnderline, isLineThrough] = valuestyle.split('');
  const textDecorations = [Number(isUnderline) && 'underline', Number(isLineThrough) && 'line-through'].filter(Boolean);

  return {
    paddingInline: 0,
    color: valuecolor,
    fontWeight: Number(isBold) ? 'bold' : undefined,
    fontStyle: Number(isItalic) ? 'italic' : undefined,
    textDecoration: textDecorations.length ? textDecorations.join(' ') : undefined,
  };
};

const sanitizeNumberValue = value =>
  `${value ?? ''}`
    .replace(/[^-\d.]/g, '')
    .replace(/^\.$/g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

const NumberComp = props => {
  const {
    type,
    disabled,
    hint,
    value,
    dot,
    unit,
    enumDefault,
    onChange,
    onBlur,
    advancedSetting = {},
    otherSheetControlType,
    triggerCustomEvent,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
    isFormDetail = false,
    formItemId,
    registerCell,
    flag,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [inputDraft, setInputDraft] = useState({ value: '', flag, sourceValue: value });
  const [originValue, setOriginValue] = useState('');

  const numberRef = useRef(null);
  const pendingStepValueRef = useRef(null);

  useEffect(() => {
    if (_.isFunction(registerCell)) {
      registerCell({
        handleFocus: () => {
          numberRef.current && numberRef.current.focus();
        },
        handleBlur: () => {
          numberRef.current && numberRef.current.blur();
        },
      });
    }
  }, [registerCell]);

  const onFocus = () => {
    setOriginValue(`${inputValue || ''}`.trim());
    setInputDraft({ value: pendingStepValueRef.current ?? `${inputValue ?? ''}`, flag, sourceValue: value });
    pendingStepValueRef.current = null;
    setIsFocused(true);
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleChange = inputValue => {
    let value = sanitizeNumberValue(inputValue);

    if (value === '.') {
      value = '';
    }

    const draftValue = value;

    if (advancedSetting.numshow === '1' && !isNaN(parseFloat(value))) {
      value = accDiv(parseFloat(value), 100);
    }

    setInputDraft({ value: draftValue, flag, sourceValue: value });
    onChange(value);
  };

  const handleBlur = () => {
    let currentValue = value;
    setIsFocused(false);

    if (currentValue === '-') {
      currentValue = '';
    } else if (currentValue) {
      currentValue = toFixed(currentValue, advancedSetting.numshow === '1' ? dot + 2 : dot);
    }

    onChange(currentValue);
    onBlur(originValue);

    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
  };

  const getAutoValue = val => {
    if (_.get(advancedSetting, 'dotformat') === '1') {
      return formatStrZero(val);
    }

    return val;
  };

  const { thousandth, numshow, showtype, showformat, currency } = advancedSetting;
  let { prefix, suffix = unit } = advancedSetting;

  if (type === 8 && _.includes(['1', '2'], showformat)) {
    const { currencycode, symbol } = safeParse(currency || '{}');
    suffix = '';
    prefix = showformat === '1' ? symbol : currencycode;
  }

  const isStepNumber = showtype === '3';
  const inputValue = numshow === '1' && value ? accMul(value, 100) : value;
  // 表单重置或外部更新后，旧草稿失效，显示当前表单值。
  const numberInputValue =
    isFocused && inputDraft.flag === flag && `${inputDraft.sourceValue ?? ''}` === `${value ?? ''}`
      ? inputDraft.value
      : inputValue;
  const hasValue = value !== '' && value !== null && value !== undefined;
  const showPercentNextToValue = numshow === '1' && hasValue && !isFocused;
  const inputSuffix = showPercentNextToValue ? '' : suffix;
  const maskContent = !isFocused && renderMaskContent();
  const inputValueStyle = isFocused ? { paddingInline: 0 } : getInputValueStyle(value, advancedSetting);
  const affixValueStyle = _.omit(inputValueStyle, 'paddingInline');
  const inputNumberStyles = {
    ...INPUT_NUMBER_BASE_STYLES,
    input: inputValueStyle,
    prefix: affixValueStyle,
    suffix: {
      ...INPUT_NUMBER_BASE_STYLES.suffix,
      ...affixValueStyle,
      ...(inputSuffix && !isStepNumber ? { paddingInlineEnd: 12 } : {}),
    },
    ...(isStepNumber
      ? {
          suffix: { ...INPUT_NUMBER_BASE_STYLES.suffix, ...affixValueStyle, marginInlineEnd: 40 },
          ...(!advancedSetting.numinterval ? { actions: DISABLED_ACTIONS_STYLE } : {}),
        }
      : {}),
  };

  const formatDisplayValue = currentValue => {
    let displayValue = currentValue || currentValue === 0 ? getAutoValue(toFixed(currentValue, dot)) : '';

    // 数值、金额字段掩码时，不显示千分位
    if (showMaskValue && displayValue) {
      displayValue = dealMaskValue({ ...props, value: displayValue });
    } else {
      // 数值兼容老的千分位配置enumDefault
      if (
        type === 6 && _.isUndefined(thousandth) && otherSheetControlType !== 30 ? enumDefault !== 1 : thousandth !== '1'
      ) {
        displayValue = formatNumberThousand(displayValue);
      }
    }

    return displayValue;
  };

  if (disabled) {
    const displayValue = formatDisplayValue(inputValue);

    return (
      <div className="flexCenter flexRow">
        <div
          className="customFormControlBox LineHeight36 flexRow flex classtabfocus controlDisabled"
          data-instance-id={formItemId}
        >
          {!displayValue && prefix && (
            <div className="ellipsis Font13 mRight15" style={{ maxWidth: 80 }}>
              {prefix}
            </div>
          )}

          <NumWrap
            $isMaskReadonly={isMaskReadonly}
            className={cx('ellipsis', {
              maskHoverTheme: isMaskReadonly,
              textDisabled: !displayValue,
            })}
            onClick={handleMaskClick}
          >
            {displayValue && prefix ? `${prefix} ` : ''}
            {displayValue || hint}
            {displayValue && suffix ? ` ${suffix}` : ''}
            {renderMaskContent()}
          </NumWrap>

          {!displayValue && (
            <div className="ellipsis Font13" style={{ maxWidth: 80 }}>
              {suffix}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <NumberInput
      $isFormDetail={isFormDetail}
      className={cx('customFormControlBox flexCenter flexRow classtabfocus', { controlDisabled: disabled })}
      data-instance-id={formItemId}
      onClick={() => !disabled && numberRef.current?.focus()}
      styles={inputNumberStyles}
      ref={numberRef}
      value={numberInputValue}
      placeholder={hint}
      disabled={disabled}
      stringMode
      inputMode="decimal"
      maxLength={16}
      prefix={!isFocused && prefix ? prefix : undefined}
      suffix={
        inputSuffix || maskContent ? (
          <span className="flexCenter">
            {inputSuffix}
            {maskContent}
          </span>
        ) : undefined
      }
      controls={isStepNumber}
      keyboard={isStepNumber && !!advancedSetting.numinterval}
      step={advancedSetting.numinterval || 0}
      parser={sanitizeNumberValue}
      formatter={(currentValue, { userTyping, input }) => {
        if (userTyping) return sanitizeNumberValue(input);
        if (isFocused) return `${currentValue ?? ''}`;

        const displayValue = formatDisplayValue(currentValue);
        return showPercentNextToValue && displayValue && suffix ? `${displayValue}${suffix}` : displayValue;
      }}
      onChangeCapture={event => {
        event.currentTarget.value = sanitizeNumberValue(event.currentTarget.value);
      }}
      changeOnBlur={false}
      onFocus={onFocus}
      onBlur={handleBlur}
      onInput={handleChange}
      onStep={nextValue => {
        const nextInputValue = `${nextValue}`;
        if (!isFocused) pendingStepValueRef.current = nextInputValue;
        handleChange(nextInputValue);
      }}
      onKeyDown={e => {
        // 阻止默认的tab行为
        if (e.key === 'Tab') {
          e.preventDefault();
        }
      }}
    />
  );
};

NumberComp.propTypes = {
  type: PropTypes.number,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  dot: PropTypes.number,
  unit: PropTypes.string,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  advancedSetting: PropTypes.object,
  otherSheetControlType: PropTypes.number,
  triggerCustomEvent: PropTypes.func,
  showMaskValue: PropTypes.bool,
  isMaskReadonly: PropTypes.bool,
  isFormDetail: PropTypes.bool,
  flag: PropTypes.any,
};

export default memo(NumberComp, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, [
      'flag',
      'value',
      'disabled',
      'showMaskValue',
      'isMaskReadonly',
      'isFormDetail',
      'advancedSetting',
      'type',
      'unit',
      'enumDefault',
      'otherSheetControlType',
    ]),
    _.pick(nextProps, [
      'flag',
      'value',
      'disabled',
      'showMaskValue',
      'isMaskReadonly',
      'isFormDetail',
      'advancedSetting',
      'type',
      'unit',
      'enumDefault',
      'otherSheetControlType',
    ]),
  );
});
