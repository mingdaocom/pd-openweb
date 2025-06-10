import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { accAdd, accDiv, accMul, accSub } from 'src/utils/common';
import { formatNumberThousand, formatStrZero, toFixed } from 'src/utils/control';
import { ADD_EVENT_ENUM } from '../../../core/enum';

const NumWrap = styled.span`
  ${props => (props.isMaskReadonly ? 'display: inline-block;' : 'flex: 1;')}
  position: relative;
  .maskIcon {
    right: 0px !important;
  }
`;

const MobileAction = styled.div`
  width: 36px;
  text-align: center;
  cursor: pointer;
  margin-right: ${props => (props.type === 'subtract' ? '6px' : 0)};
  margin-left: ${props => (props.type === 'add' ? '6px' : 0)};
  border: 1px solid var(--gray-e0);
  .icon {
    color: var(--color-primary);
  }
`;

const getAutoValue = (dotformat, val) => {
  if (dotformat === '1') {
    return formatStrZero(val);
  }
  return val;
};

const Numeric = props => {
  const {
    type,
    hint,
    disabled,
    formDisabled,
    maskPermissions,
    dot,
    enumDefault,
    advancedSetting: { datamask, dotformat, showtype, showformat, numinterval, numshow, thousandth },
    triggerCustomEvent,
    value,
  } = props;
  let { prefix, suffix = props.unit, currency } = props.advancedSetting || {};
  if (type === 8 && _.includes(['1', '2'], showformat)) {
    const { currencycode, symbol } = safeParse(currency || '{}');
    prefix = showformat === '1' ? symbol : currencycode;
    suffix = '';
  }
  const getEditValue = () => {
    let val = props.value;
    if (numshow === '1' && val) {
      val = accMul(val, 100);
    }
    val = getAutoValue(dotformat, val);
    return val;
  };
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [maskStatus, setMaskStatus] = useState(datamask === '1');
  const [currentValue, setCurrentValue] = useState(getEditValue());
  const isStepNumber = showtype === '3';
  const isMask = useMemo(() => {
    return maskPermissions && (value || value === 0) && maskStatus;
  }, [maskPermissions, value, maskStatus]);

  const isEffective = (val = currentValue) => {
    // 允许为 0
    return val !== null && val !== undefined && val !== '';
  }

  const getShowValue = () => {
    let value = getEditValue();

    value = value || value === 0 ? getAutoValue(dotformat, toFixed(value, dot)) : '';
    // 数值、金额字段掩码时，不显示千分位
    if (maskStatus && value) {
      value = dealMaskValue({ ...props, value });
    } else {
      // 数值兼容老的千分位配置enumDefault
      if (type !== 6 || _.isUndefined(thousandth) ? enumDefault !== 1 : thousandth !== '1') {
        value = formatNumberThousand(value);
      }
    }
    return `${(value || value === 0) ? [prefix, value, suffix].filter(v => isEffective(v)).join(' ') : hint}`;
  };

  const onFocus = e => {
    setOriginValue(e.target.value.trim());
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const debouncedOnChange = useRef(
    _.debounce((props, val) => {
      props.onChange(val);
    }, 300),
  ).current;

  const onChange = (event, tempValue) => {
    let resValue =
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

    if (resValue === '.') {
      resValue = '';
    }

    setCurrentValue(resValue);

    if (numshow === '1' && !isNaN(parseFloat(resValue))) {
      resValue = accDiv(parseFloat(resValue), 100);
    }

    debouncedOnChange(props, resValue);
  };

  const onBlur = () => {
    setIsEditing(false);

    let value = props.value;
    if (value === '-') {
      value = '';
    } else if (value) {
      value = toFixed(value, numshow === '1' ? dot + 2 : dot);
    }

    props.onChange(value);
    props.onBlur(originValue);

    if (window.isWeiXin) {
      // 处理微信webview键盘收起 网页未撑开
      window.scrollTo(0, 0);
    }
  };

  const handleControl = action => {
    if (!numinterval || disabled) return null;

    let value = props.value;
    if (numshow === '1' && !isNaN(parseFloat(value))) {
      value = accMul(value, 100);
    }

    if (action === 'add') {
      value = accAdd(parseFloat(value || 0), parseFloat(numinterval));
    } else {
      value = accSub(parseFloat(value || 0), parseFloat(numinterval));
    }
    onChange({}, `${value}`);
  };

  const renderMobileNumberControl = type => {
    if (showtype !== '3' || disabled) return null;

    return (
      <MobileAction
        className="controlValueHeight"
        type={type}
        onClick={() => handleControl(type === 'subtract' ? 'subtract' : 'add')}
      >
        <i className={`icon icon-${type === 'subtract' ? 'minus' : 'add1'}`} />
      </MobileAction>
    );
  };

  useEffect(() => {
    setCurrentValue(getEditValue());
  }, [value]);

  return (
    <div className="flexCenter flexRow">
      {renderMobileNumberControl('subtract')}
      <div className="Relative flex">
        <div
          className={cx('customFormControlBox customFormControlInputView', {
            controlEditReadonly: !formDisabled && isEffective() && disabled,
            controlDisabled: formDisabled,
          })}
          style={{ zIndex: isEditing ? -1 : 1 }}
          onClick={() => {
            if (disabled) return;
            setIsEditing(true);
            inputRef.current.focus();
          }}
        >
          {!isEffective() && prefix && (
            <div className="ellipsis mRight15" style={{ maxWidth: 80 }}>
              {prefix}
            </div>
          )}

          <NumWrap
            isMaskReadonly={disabled && isMask}
            className={cx('ellipsis', {
              maskHoverTheme: disabled && isMask,
              Gray_bd: !isEffective(),
            })}
            onClick={() => {
              if (disabled && isMask) setMaskStatus(false);
            }}
          >
            {getShowValue()}
            {isMask && <Icon icon="eye_off" className={cx('Gray_bd', disabled ? 'mLeft7' : 'maskIcon')} />}
          </NumWrap>

          {!isEffective() && (
            <div className="ellipsis" style={{ maxWidth: 80 }}>
              {suffix}
            </div>
          )}
        </div>
        {!disabled && (
          <input
            type="text"
            inputmode="decimal"
            className="customFormControlBox"
            style={{ paddingRight: suffix ? 32 : 12 }}
            ref={inputRef}
            disabled={disabled}
            value={currentValue}
            maxLength={16}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={e => {
              if (isStepNumber && _.includes([38, 40], e.keyCode)) {
                e.preventDefault();
                handleControl(e.keyCode === 38 ? 'add' : 'subtract');
              }
            }}
          />
        )}
      </div>
      {renderMobileNumberControl('add')}
    </div>
  );
};

Numeric.propTypes = {
  type: PropTypes.number,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  maskPermissions: PropTypes.bool,
  value: PropTypes.string,
  dot: PropTypes.number,
  unit: PropTypes.string,
  enumDefault: PropTypes.number,
  advancedSetting: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
};

export default memo(Numeric, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});
