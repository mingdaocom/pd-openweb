import React, { useEffect, useState, useRef } from 'react';
import { arrayOf, number, shape, string, bool, func } from 'prop-types';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import { Tooltip } from 'ming-ui';

const isMobile = browserIsMobile();

const Con = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 7px;
  padding-left: 7px;
  padding-right: 7px;
  padding-bottom: 7px;
  box-sizing: border-box;
  position: relative;
  ${({ isMobile }) => (isMobile ? 'padding-left: 0px;' : '')}
`;

const Bar = styled.div`
  flex: 1;
  position: relative;
  height: 6px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
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
  z-index: 2;
  &::before,
  &::after {
    transition: none;
  }
`;

const ScalePoint = styled.span`
  background: #fff;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  border: 2px solid ${({ color }) => color};
`;

const ScaleBox = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: -10px;
  padding: 0 4px;
  .pointContent {
    width: ${({ total }) => `${total}%`};
    display: flex;
    align-items: center;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')}};
    .pointItem {
      flex: 1;
      line-height: 14px;
      text-align: center;
      transform: translateX(-50%);
    }
  }
  .scaleContent {
    width: ${({ total }) => `${total}%`};
    display: flex;
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
      }
    }
  }
`;

export default function Steps(props) {
  const {
    className,
    style,
    data: { options = [], enumDefault2 } = {},
    value,
    disabled,
    showTip = true,
    showScaleText = true,
    tipDirection,
    from,
    onChange = _.noop,
  } = props;
  const barRef = useRef();
  const filterOptions = options.filter(i => !i.isDeleted);
  const getCurrent = value => {
    return _.findIndex(filterOptions, i => i.key === value);
  };
  const [currentValue, setCurrentValue] = useState();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (value) {
      setCurrentValue(getCurrent(value));
    }
  }, [value]);

  useEffect(() => {
    if (currentValue >= 0) {
      setWidth((currentValue / (filterOptions.length - 1)) * 100);
    }
  }, [currentValue]);

  const currentColor = enumDefault2 === 1 ? _.get(filterOptions[currentValue], 'color') || '#f1f1f1' : '#2196f3';

  return (
    <Con
      className={className}
      style={style}
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
      <Bar ref={barRef}>
        <Content style={{ width: `${width}%`, backgroundColor: currentColor }} />
        {(!disabled || from === 'recordInfo') && (
          <Drag
            className={`${tipDirection ? 'tip-' + tipDirection : 'tip-top'}`}
            color={currentColor}
            style={{ left: `calc(${width}% - 7px)` }}
            {...(showTip && !_.isUndefined(currentValue) ? { 'data-tip': _.get(filterOptions[currentValue], 'value') } : {})}
          />
        )}
      </Bar>
      <ScaleBox
        total={(100 / (filterOptions.length - 1)) * filterOptions.length}
        disabled={disabled}
        onClick={e => {
          if (disabled) return;
          const { left, width } = barRef.current.getBoundingClientRect();
          const index = Math.ceil((e.clientX - left) / (width / (filterOptions.length - 1)));
          const tempVal = (filterOptions[index] || {}).key || '';
          if (tempVal) {
            setCurrentValue(index);
            onChange(tempVal);
          }
        }}
      >
        <div
          className="pointContent"
          onMouseEnter={() => {
            if (disabled) return;
            barRef.current && (barRef.current.style.background = 'rgba(0, 0, 0, 0.08)');
          }}
          onMouseLeave={() => {
            if (disabled) return;
            barRef.current && (barRef.current.style.background = 'rgba(0, 0, 0, 0.06)');
          }}
        >
          {filterOptions.map((option, index) => {
            return (
              <div className="pointItem">
                <Tooltip
                  text={<span>{option.value}</span>}
                  popupPlacement={tipDirection || 'top'}
                  disable={from === 'recordInfo' && disabled ? true : !showTip}
                >
                  <ScalePoint
                    key={option.key}
                    color={index <= currentValue ? currentColor : 'rgba(0, 0, 0, 0.06)'}
                    onClick={
                      disabled
                        ? _.noop
                        : e => {
                            e.stopPropagation();
                            setCurrentValue(getCurrent(option.key));
                            onChange(option.key);
                          }
                    }
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
        {showScaleText && (
          <div className="scaleContent">
            {filterOptions.map((option, index) => {
              return (
                <span className="contentItem">
                  <span style={{ color: index <= currentValue ? '#333' : '#9e9e9e' }} className="scaleText">
                    {option.value}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </ScaleBox>
    </Con>
  );
}

Steps.propTypes = {
  disabled: bool,
  className: string,
  from: string,
  tipDirection: string,
  data: shape({}),
  options: shape([]),
  value: number,
  onChange: func,
};
