import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { formatNumberFromInput } from 'src/utils/control';

const isMobile = browserIsMobile();

const getClientX = e => {
  return !isMobile ? e.clientX : e.touches[0].clientX;
};

const mouseMoveEventName = !isMobile ? 'mousemove' : 'touchmove';
const mouseUpEventName = !isMobile ? 'mouseup' : 'touchend';

const Con = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 7px;
  padding-right: 7px;
  user-select: none;
  ${({ hasScale }) => (hasScale ? 'padding-bottom: 20px;' : '')}
  ${({ isMobile }) => (isMobile ? 'padding-left: 0px;' : '')}
`;
const Bar = styled.div`
  flex: 1;
  min-width: 20px;
  position: relative;
  height: 6px;
  margin: 7px 0;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  &:hover {
    ${({ disabled }) => (disabled ? '' : 'background: rgba(0, 0, 0, 0.1);')}
  }
`;

const Content = styled.div`
  height: 6px;
  border-radius: 3px;
`;

const Drag = styled.span`
  cursor: pointer;
  position: absolute;
  background: #fff;
  top: -4px;
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 10px;
  border: 2px solid ${({ color }) => color};
  &::before,
  &::after {
    transition: none;
  }
`;

const ScalePointClick = styled.span`
  cursor: pointer;
  position: absolute;
  top: -3px;
  width: 12px;
  height: 12px;
  padding: 2px;
  font-size: 0px;
`;

const ScalePoint = styled.span`
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  border: 2px solid ${({ color }) => color};
  > span {
    font-size: 12px;
    user-select: none;
    white-space: nowrap;
    transform: translateX(calc(-50% + 2px));
    ${({ percent }) => `
      ${percent < 10 ? 'transform: translateX(-3px);' : ''}
      ${percent > 90 ? 'transform: translateX(calc(-100% + 3px));' : ''}
    `}
    margin-top: 10px;
    display: inline-block;
  }
`;

const ScaleTextWrap = styled.div`
  display: flex;
  overflow: hidden;
  width: ${({ total }) => `${total}%`};
  .contentItem {
    flex: 1;
    text-align: center;
    transform: translateX(-50%);
    &:first-child {
      text-align: right;
      .scaleText {
        text-align: left;
        width: 50%;
      }
    }
    &:last-child {
      text-align: left;
      .scaleText {
        text-align: right;
        width: 50%;
      }
    }
    .scaleText {
      display: inline-block;
      user-select: none;
      margin: 10px 0 0 1px;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      overflow: visible;
    }
  }
`;

const InputCon = styled.div`
  position: relative;
  margin-left: 14px;
  .percent {
    position: absolute;
    color: #9e9e9e;
    right: 10px;
    line-height: 36px;
    pointer-events: none;
  }
`;

const Input = styled.input`
  border: 1px solid transparent;
  width: 68px;
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  background: #f7f7f7;
  ${({ showAsPercent }) => (showAsPercent ? 'padding-right: 28px;' : '')}
  &:active {
    border-color: #2196f3;
  }
  ${({ active }) =>
    active
      ? `
  border-color: #2196f3;
  background: #fff;
  `
      : `
      &:hover {
        background: #f2f2f2;
      }`}
`;
const NumberValue = styled.span`
  margin-left: 12px;
  ${({ disabled }) => (disabled ? 'color: rgba(0,0,0,.3);' : '')}
`;

function getColor(config, value, showAsPercent) {
  if (config.type === 1) {
    return config.color;
  } else if (config.type === 2) {
    let result = '#2196f3';
    const colors = config.colors
      .map(c => ({ value: Number(c.key * (showAsPercent ? 100 : 1)), color: c.value }))
      .filter(c => _.isNumber(c.value) && !_.isNaN(value))
      .sort((a, b) => b.value - a.value);
    colors.forEach(c => {
      if (value <= c.value) {
        result = c.color;
      }
    });
    return result;
  } else {
    return '#2196f3';
  }
}

function getDefaultValue(value) {
  if (_.isUndefined(value) || _.isNull(value) || String(value).trim() === '' || _.isNaN(Number(value))) {
    return;
  } else {
    return Number(value);
  }
}

function formatByStep(num, step, min = 0) {
  if (_.isUndefined(num)) {
    return;
  }
  num = num - min;
  if (num % step > step / 2) {
    num = Math.ceil(num / step) * step;
  }
  return (Math.floor(num / step) * step + min).toFixed(((String(step).match(/\.(\d+)/) || '')[1] || '').length);
}
function fixedByStep(num, step) {
  return num.toFixed(((String(step).match(/\.(\d+)/) || '')[1] || '').length);
}

function formatByMinMax(value, min, max, step) {
  if (value < min) {
    value = min;
  }
  if (value > max) {
    value = max;
  }
  return value;
}

function getNumberMaxWidth(max, step = 1, isPercent) {
  let count = String(max).length;
  if (/\./.test(String(step))) {
    count += ((String(step).match(/\.(.*)/) || '')[1] || '').length;
  }
  if (isPercent) {
    count += 1;
  }
  return 9 * count + 5;
}
export default function Slider(props) {
  const {
    from,
    className,
    style,
    readonly,
    itemcolor = { type: 1, color: '#2196f3' },
    itemnames = [],
    valueTextStyle = {},
    numStyle = {},
    barStyle = {},
    showScale = true,
    showScaleText = true,
    showTip = true,
    showInput = true,
    showNumber = true,
    showDrag = true,
    showAsPercent,
    tipDirection,
    triggerWhenMove = false,
    onChange = _.noop,
    liveUpdate = true,
    inputClassName,
  } = props;
  let min = props.min || 0;
  let max = props.max || 100;
  let step = props.step || 5;

  if (showAsPercent) {
    min = min * 100;
    max = max * 100;
    step = step * 100;
  }
  const numberWidth = getNumberMaxWidth(max, step, showAsPercent);
  const disabled = props.disabled || readonly;
  const cache = useRef({});
  const barRef = useRef();
  const dragRef = useRef();
  const contentRef = useRef();
  const inputRef = useRef();
  const [tempValue, setTempValue] = useState();
  const [numberIsFocusing, setNumberIsFocusing] = useState();
  const [isDragging, setIsDragging] = useState();
  const [value, setValue] = useState(
    getDefaultValue(showAsPercent ? fixedByStep(props.value * 100, step) : props.value),
  );
  const [valueForInput, setValueForInput] = useState(value);
  const isMobile = browserIsMobile();
  const inputAttribute = isMobile ? (window.isIphone ? { type: 'text' } : { inputmode: 'decimal' }) : {};
  const color = getColor(itemcolor, value, showAsPercent);
  const scalePoints = useMemo(
    () =>
      (itemnames || [])
        .map(c => ({
          percent: Math.ceil((Number(c.key * (showAsPercent ? 100 : 1) - min) / (max - min)) * 100),
          value: Number(c.key),
          text: c.value,
        }))
        .filter(c => _.isNumber(c.value) && !_.isNaN(c.value) && !_.isUndefined(c.text)),
    [itemnames],
  );
  let data = scalePoints.filter(scale => scale.value >= min && scale.value <= max);
  const hasMin = _.findIndex(data, v => v.value === min) !== -1;
  const scalePointsLength = hasMin ? data.length : data.length + 1;
  data = hasMin ? data : [{ text: '' }].concat(data);

  let valuePercent = Math.ceil(((_.isUndefined(value) ? 0 : value - min) / (max - min)) * 100);
  if (valuePercent > 100) {
    valuePercent = 100;
  }
  if (valuePercent < 0) {
    valuePercent = 0;
  }
  function updateValue(v, update, updateInput) {
    v = formatByMinMax(v, min, max);

    setValue(v);
    if (update) {
      onChange(showAsPercent ? v / 100 : v);
    }
    setTempValue(showAsPercent ? v / 100 : v);
    if (updateInput) {
      setValueForInput(v);
    }
  }
  const handleMouseMove = useCallback(e => {
    if (!cache.current.active) {
      return;
    }
    let newPercent =
      cache.current.valuePercent + ((getClientX(e) - cache.current.clientX) / cache.current.conWidth) * 100;
    if (newPercent > 100) {
      newPercent = 100;
    }
    if (newPercent < 0) {
      newPercent = 0;
    }
    cache.current.lastClientX = getClientX(e);
    cache.current.newPercent = newPercent;
    let newValue = min + ((max - min) * newPercent) / 100;
    updateValue(formatByStep(newValue, step, min), false, true);
  }, []);
  const handleMouseUp = useCallback(e => {
    if (!cache.current.active) {
      return;
    }
    cache.current.active = false;
    let newValue = min + ((max - min) * cache.current.newPercent) / 100;
    if (_.isNumber(newValue) && !_.isNaN(newValue)) {
      updateValue(formatByStep(newValue, step, min), true, true);
    }
    setTimeout(() => {
      setIsDragging(false);
    }, 300);
    document.body.style.userSelect = 'inherit';
    document.body.style.overflow = 'auto';
    window.removeEventListener(mouseMoveEventName, handleMouseMove);
    window.removeEventListener(mouseUpEventName, handleMouseUp);
  }, []);
  const inputChange = (e, update) => {
    const changedValue = formatNumberFromInput(e.target.value, false);
    setValueForInput(changedValue);
    if (changedValue.trim() === '') {
      setValue(undefined);
      update && onChange('');
    } else {
      const newValue = Number(changedValue);
      if (_.isNumber(newValue) && !_.isNaN(newValue)) {
        updateValue(newValue, update);
      }
    }
  };
  useEffect(() => {
    cache.current.conWidth = barRef.current.clientWidth;
  }, [disabled]);
  useEffect(() => {
    const v = getDefaultValue(showAsPercent ? fixedByStep(props.value * 100, step) : props.value);
    setValue(v);
    if (document.activeElement !== inputRef.current) {
      setValueForInput(_.isUndefined(v) ? '' : v);
    }
  }, [props.value]);
  useEffect(() => {
    if (!_.isUndefined(tempValue) && triggerWhenMove) {
      onChange(tempValue);
    }
  }, [tempValue]);
  return (
    <Con
      className={className}
      style={style}
      hasScale={itemnames && itemnames.length && showScaleText}
      isMobile={isMobile}
      onClick={
        disabled
          ? _.noop
          : e => {
              e.stopPropagation();
              e.preventDefault();
            }
      }
    >
      <Bar
        disabled={disabled}
        ref={barRef}
        style={barStyle}
        onClick={
          disabled
            ? _.noop
            : e => {
                e.stopPropagation();
                e.preventDefault();
                if (isDragging) return;
                const newPercent =
                  ((e.clientX - barRef.current.getBoundingClientRect().left) / cache.current.conWidth) * 100;
                let newValue = min + ((max - min) * newPercent) / 100;
                updateValue(formatByStep(newValue, step, min), true, true);
              }
        }
      >
        <Content ref={contentRef} style={{ width: `${valuePercent}%`, backgroundColor: color }} />
        {showScale &&
          scalePoints
            .filter(scale => scale.value >= min && scale.value <= max)
            .map((scale, i) => (
              <ScalePointClick
                style={{
                  left: `calc(${scale.percent}% - 4px)`,
                  cursor: disabled ? 'default' : 'pointer',
                }}
                onClick={
                  disabled
                    ? _.noop
                    : e => {
                        updateValue(scale.value * (showAsPercent ? 100 : 1), true);
                        e.stopPropagation();
                      }
                }
              >
                <Tooltip offset={[0, -2]} disable={!showTip} text={showTip ? <span>{scale.value}</span> : undefined}>
                  <ScalePoint
                    key={i}
                    className={`scale ${tipDirection ? 'tip-' + tipDirection : 'tip-top'}`}
                    value={scale.value}
                    color={scale.percent < valuePercent ? color : 'rgba(0, 0, 0, 0.06)'}
                    percent={scale.percent}
                  ></ScalePoint>
                </Tooltip>
              </ScalePointClick>
            ))}
        {showScale && showScaleText && (
          <ScaleTextWrap total={(100 / (scalePointsLength - 1)) * scalePointsLength}>
            {data.map((scale, i) => (
              <div className="contentItem">
                <span className="scaleText" style={{ color: valuePercent < scale.percent ? '#9e9e9e' : '#151515' }}>
                  {scale.text}
                </span>
              </div>
            ))}
          </ScaleTextWrap>
        )}

        {showDrag && (
          <Tooltip
            offset={[0, -2]}
            disable={!(showTip && !_.isUndefined(value))}
            text={showTip && !_.isUndefined(value) ? <span>{value + (showAsPercent ? '%' : '')}</span> : undefined}
          >
            <Drag
              className={`${tipDirection ? 'tip-' + tipDirection : 'tip-top'} ${isDragging ? 'hover' : ''}`}
              ref={dragRef}
              color={!_.isUndefined(value) ? (disabled ? '#bdbdbd' : color) : '#f1f1f1'}
              style={{ left: `calc(${valuePercent}% - 7px)`, cursor: disabled ? 'default' : 'pointer' }}
              {...(disabled
                ? {}
                : {
                    [!isMobile ? 'onMouseDown' : 'onTouchStart']: e => {
                      document.body.style.userSelect = 'none';
                      document.body.style.overflow = 'hidden';
                      cache.current.active = true;
                      cache.current.clientX = getClientX(e);
                      cache.current.valuePercent = valuePercent;
                      setIsDragging(true);
                      window.addEventListener(mouseMoveEventName, handleMouseMove);
                      window.addEventListener(mouseUpEventName, handleMouseUp);
                    },
                  })}
            />
          </Tooltip>
        )}
      </Bar>
      {showInput && !disabled && (
        <InputCon>
          <Input
            className={inputClassName}
            showAsPercent={showAsPercent && numberIsFocusing && !_.isUndefined(valueForInput)}
            active={numberIsFocusing}
            ref={inputRef}
            type="text"
            {...inputAttribute}
            value={
              showAsPercent && !numberIsFocusing && !_.isUndefined(valueForInput) && valueForInput !== ''
                ? valueForInput + '%'
                : valueForInput
            }
            onFocus={e => {
              setNumberIsFocusing(true);
            }}
            onBlur={e => {
              setNumberIsFocusing(false);
              setValueForInput(value);
              // 失去焦点更新
              if (!liveUpdate) {
                inputChange(e, true);
              }
            }}
            onChange={e => inputChange(e, liveUpdate)}
          />
          {!!showAsPercent && numberIsFocusing && !_.isUndefined(valueForInput) && <span className="percent">%</span>}
        </InputCon>
      )}
      {showNumber && (!showInput || disabled) && (
        <NumberValue style={{ ...numStyle, width: numberWidth }} disabled={props.disabled} isMobile={isMobile}>
          {!_.isUndefined(value) && (
            <Fragment>
              {value}
              {!!showAsPercent && !_.isUndefined(value) && '%'}
            </Fragment>
          )}
        </NumberValue>
      )}
    </Con>
  );
}

Slider.propTypes = {
  disabled: bool,
  triggerWhenMove: bool,
  from: string,
  tipDirection: string,
  showScaleText: bool,
  showScale: bool,
  showTip: bool,
  showNumber: bool,
  showAsPercent: bool,
  className: string,
  showInput: bool,
  style: shape({}),
  value: number,
  min: number,
  max: number,
  step: number,
  valueTextStyle: shape({}),
  barStyle: shape({}),
  numStyle: shape({}),
  itemcolor: shape({}),
  itemnames: arrayOf(
    shape({
      key: string,
      value: string,
    }),
  ),
  onChange: func,
  liveUpdate: bool,
  inputClassName: string,
};
