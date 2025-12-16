import React, { memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { accAdd, accDiv, accMul, accSub } from 'src/utils/common';
import { formatNumberThousand, formatStrZero, toFixed } from 'src/utils/control';

const NumWrap = styled.span`
  ${props => (props.isMaskReadonly ? 'display: inline-block;' : 'flex: 1;')}
  position: relative;
  .maskIcon {
    right: 0px !important;
  }
`;

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
    formItemId,
    registerCell,
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');

  const numberRef = useRef(null);

  useEffect(() => {
    if (_.isFunction(registerCell)) {
      registerCell({
        handleFocus: () => {
          setIsEditing(true);
          numberRef.current && numberRef.current.focus();
        },
        handleBlur: () => {
          numberRef.current && numberRef.current.blur();
        },
      });
    }
  }, []);

  const onFocus = e => {
    setOriginValue(e.target.value.trim());
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleChange = (event, tempValue) => {
    let value =
      tempValue ||
      event.target.value
        .replace(/[^-\d.]/g, '')
        .replace(/^\.$/g, '')
        .replace(/^-/, '$#$')
        .replace(/-/g, '')
        .replace('$#$', '-')
        .replace(/^-\./, '-')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');

    if (value === '.') {
      value = '';
    }

    if (numberRef.current) {
      numberRef.current.value = value;
    }

    if (advancedSetting.numshow === '1' && !isNaN(parseFloat(value))) {
      value = accDiv(parseFloat(value), 100);
    }

    onChange(value);
  };

  const handleBlur = () => {
    let currentValue = value;
    setIsEditing(false);

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

  const handleControl = action => {
    const { numinterval = '1' } = advancedSetting;

    if (!numinterval || disabled) return null;

    let currentValue = value;
    if (advancedSetting.numshow === '1' && !isNaN(parseFloat(currentValue))) {
      currentValue = accMul(currentValue, 100);
    }

    if (action === 'add') {
      currentValue = accAdd(parseFloat(currentValue || 0), parseFloat(numinterval));
    } else {
      currentValue = accSub(parseFloat(currentValue || 0), parseFloat(numinterval));
    }
    handleChange({}, `${currentValue}`);
  };

  const renderNumberControl = () => {
    if (advancedSetting.showtype !== '3' || disabled) return null;

    return (
      <div className={cx('numberControlBox', { disabled: !advancedSetting.numinterval })}>
        {['add', 'subtract'].map(item => {
          return (
            <div key={item} className="iconWrap" onClick={() => handleControl(item)}>
              <i className={cx(item === 'add' ? 'icon-arrow-up' : 'icon-arrow-down')} />
            </div>
          );
        })}
      </div>
    );
  };

  let displayValue = value;
  const { thousandth, numshow, showtype, showformat, currency } = advancedSetting;
  let { prefix, suffix = unit } = advancedSetting;

  if (type === 8 && _.includes(['1', '2'], showformat)) {
    const { currencycode, symbol } = safeParse(currency || '{}');
    suffix = '';
    prefix = showformat === '1' ? symbol : currencycode;
  }

  const isStepNumber = showtype === '3';
  if (numshow === '1' && displayValue) {
    displayValue = accMul(displayValue, 100);
  }

  displayValue = getAutoValue(displayValue);

  if (!isEditing) {
    displayValue = displayValue || displayValue === 0 ? getAutoValue(toFixed(displayValue, dot)) : '';

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

    return (
      <div className="flexCenter flexRow">
        <div
          className={cx('customFormControlBox LineHeight36 flexRow flex classtabfocus', { controlDisabled: disabled })}
          data-instance-id={formItemId}
          onClick={() => {
            if (!disabled) {
              setIsEditing(true);
            }
          }}
        >
          {!displayValue && prefix && (
            <div className="ellipsis Font13 mRight15" style={{ maxWidth: 80 }}>
              {prefix}
            </div>
          )}

          <NumWrap
            isMaskReadonly={isMaskReadonly}
            className={cx('ellipsis', {
              maskHoverTheme: isMaskReadonly,
              Gray_bd: !displayValue,
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
        {renderNumberControl()}
      </div>
    );
  }

  const inputAttribute = { inputmode: 'decimal' };

  return (
    <div className="flexCenter flexRow">
      <input
        type="text"
        {...inputAttribute}
        className="customFormControlBox Gray flex"
        style={{ paddingRight: suffix ? 32 : 12, paddingTop: 2 }}
        ref={numberRef}
        autoFocus
        placeholder={hint}
        disabled={disabled}
        defaultValue={displayValue}
        maxLength={16}
        onFocus={onFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={e => {
          // 阻止默认的tab行为
          if (e.key === 'Tab') {
            e.preventDefault();
            return;
          }

          if (isStepNumber && _.includes([38, 40], e.keyCode)) {
            e.preventDefault();
            handleControl(e.keyCode === 38 ? 'add' : 'subtract');
          }
        }}
      />
      {suffix && (
        <div
          className="ellipsis Gray_9e Font13"
          style={{
            maxWidth: 80,
            position: 'absolute',
            top: 10,
            right: isStepNumber ? 36 + 13 : 13,
          }}
        >
          {suffix}
        </div>
      )}
      {renderNumberControl()}
    </div>
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
};

export default memo(NumberComp, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
