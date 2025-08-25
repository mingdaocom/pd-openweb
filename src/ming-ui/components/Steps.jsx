import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { bool, func, number, oneOfType, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';

const isMobile = browserIsMobile();

const Con = styled.div`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  position: relative;
`;

const VerticalCon = styled.div`
  flex: 1;
  padding-top: 7px;
  padding-left: 7px;
  padding-right: 7px;
  padding-bottom: 7px;
  display: flex;
  flex-direction: column;
  ${({ isMobile }) => (isMobile ? 'padding-left: 0px;' : '')}
`;
const PortraitCon = styled.div`
  flex: 1;
  padding-top: 7px;
  padding-left: 7px;
  padding-right: 7px;
  padding-bottom: 7px;
  display: flex;
  flex-direction: row;
  ${({ isMobile }) => (isMobile ? 'padding-left: 0px;' : '')}
`;
const PortraitDrag = styled.div`
  width: 6px;
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
  margin-left: -4px;
  &::before,
  &::after {
    transition: none;
  }
`;

const Bar = styled.div`
  flex: 1;
  position: relative;
  height: 6px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
`;
const PortraitBar = styled.div`
  position: relative;
  width: 6px;
  height: 100%;
  border-radius: 3px;
  margin-right: 20px;
  background: rgba(0, 0, 0, 0.06);
`;

const Content = styled.div`
  height: 6px;
  border-radius: 3px;
`;
const PortraitContent = styled.div`
  width: 6px;
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
const PortraitScalePoint = styled.span`
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
      line-height: ${({ isMobile }) => (isMobile ? '12px' : '13px')} !important;
      text-align: center;
      transform: translateX(-50%);
      .pointCon {
        display: inline-block;
        padding: 4px 2px;
        margin-top: -4px;
        cursor: pointer;
      }
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
        margin: 10px 0 0 1px;
        white-space: pre-wrap;
        word-wrap: break-word;
        word-break: break-all;
        overflow: visible;
      }
    }
  }
`;
const PortraitScaleBox = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  margin-left: -30px;
  padding: 0 4px;
  .portraitPointContent {
    width: 6px;
    height: ${({ total }) => `${total}%`};
    margin-left: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')}};
    .portraitPointItem {
      flex: 1;
      line-height: 14px;
      text-align: center;
      transform: translateY(-50%);
      display:flex;
      align-items:center;
      &:first-child {
        margin-top: 4px
      }
      &:last-child {
        margin-bottom: 4px
      }
    }
  }
  .portraitScaleContent {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 24px;
    .portraitContentItem {
      flex: 1;
      text-align: left;
      padding: 12px 0;
      .scaleText {
        display: inline-block;
        user-select: none;
        text-align: left;

      }
      &:first-child {
        padding: 0 0 12px;
        .scaleText {
        }
      }
      &:last-child {
        text-align: left;
        padding: 12px 0 0;
        .scaleText {
        }
      }

    }
  }
`;

const SelectedOption = styled.span`
  margin-left: 4px;
  ${({ disabled }) => (disabled ? 'color: rgba(0,0,0,.3);' : '')}
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
    showSelected = false,
    tipDirection,
    from,
    onChange = _.noop,
    direction = '',
  } = props;
  const barRef = useRef();
  const selectedOption = _.find(options, i => i.key === value);
  const filterOptions = options.filter(i => !i.isDeleted && (i.key === value || !i.hide));
  const getCurrent = value => {
    return _.findIndex(filterOptions, i => i.key === value);
  };
  const [currentValue, setCurrentValue] = useState();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setCurrentValue(getCurrent(value));
  }, [value]);

  useEffect(() => {
    setWidth(currentValue >= 0 ? (currentValue / (filterOptions.length - 1)) * 100 : 0);
  }, [currentValue]);

  const currentColor = enumDefault2 === 1 ? _.get(filterOptions[currentValue], 'color') || '#f1f1f1' : '#1677ff';

  if (isMobile && direction === '1') {
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
        <PortraitCon>
          <PortraitBar ref={barRef}>
            <PortraitContent style={{ height: `${width}%`, backgroundColor: currentColor }} />
            {(!disabled || from === 'recordInfo') && (
              <PortraitDrag
                className={`${tipDirection ? 'tip-' + tipDirection : 'tip-top'}`}
                color={currentColor}
                style={{ top: `calc(${width}% - 7px)` }}
                {...(showTip && !_.isUndefined(currentValue)
                  ? { 'data-tip': _.get(filterOptions[currentValue], 'value') }
                  : {})}
              />
            )}
          </PortraitBar>
          <PortraitScaleBox
            total={(100 / (filterOptions.length - 1)) * filterOptions.length}
            disabled={disabled}
            onClick={e => {
              if (disabled) return;
              const { top, height } = barRef.current.getBoundingClientRect();
              const index = Math.ceil((e.clientY - top) / (height / (filterOptions.length - 1)));
              const tempVal = (filterOptions[index] || {}).key || '';
              if (tempVal) {
                setCurrentValue(index);
                onChange(tempVal);
              }
            }}
          >
            <div
              className="portraitPointContent"
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
                  <div className="portraitPointItem">
                    <Tooltip
                      text={<span>{option.value}</span>}
                      popupPlacement={tipDirection || 'top'}
                      disable={from === 'recordInfo' && disabled ? true : !showTip}
                    >
                      <PortraitScalePoint
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
              <div className="portraitScaleContent">
                {filterOptions.map((option, index) => {
                  return (
                    <span className="portraitContentItem">
                      <span
                        style={{ color: index <= currentValue ? '#151515' : '#9e9e9e' }}
                        className="portraitScaleText"
                      >
                        {option.value}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </PortraitScaleBox>
        </PortraitCon>
        {showSelected && selectedOption && <SelectedOption>{selectedOption.value}</SelectedOption>}
      </Con>
    );
  }

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
      <VerticalCon>
        <Bar ref={barRef}>
          <Content style={{ width: `${width}%`, backgroundColor: currentColor }} />
          {(!disabled || from === 'recordInfo') && !_.isUndefined(currentValue) && (
            <Tooltip
              offset={[0, -2]}
              disable={!(showTip && !_.isUndefined(currentValue) && _.get(filterOptions[currentValue], 'value'))}
              text={
                showTip && !_.isUndefined(currentValue) ? (
                  <span>{_.get(filterOptions[currentValue], 'value')}</span>
                ) : undefined
              }
            >
              <Drag
                className={`${tipDirection ? 'tip-' + tipDirection : 'tip-top'}`}
                color={currentColor}
                onClick={() => {
                  // 选项第一个无法选中，点击元素被覆盖
                  if (!value && !disabled) {
                    const tempVal = (filterOptions[0] || {}).key || '';
                    if (tempVal) {
                      setCurrentValue(0);
                      onChange(tempVal);
                    }
                  }
                }}
                style={{ left: `calc(${width}% - 7px)` }}
              />
            </Tooltip>
          )}
        </Bar>
        <ScaleBox
          total={(100 / (filterOptions.length - 1)) * filterOptions.length}
          disabled={disabled}
          isMobile={isMobile}
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
                    offset={[0, -2]}
                    popupPlacement={tipDirection || 'top'}
                    disable={from === 'recordInfo' && disabled ? true : !showTip}
                  >
                    <div
                      className="pointCon"
                      onClick={
                        disabled
                          ? _.noop
                          : e => {
                              e.stopPropagation();
                              setCurrentValue(getCurrent(option.key));
                              onChange(option.key);
                            }
                      }
                    >
                      <ScalePoint
                        key={option.key}
                        color={index <= currentValue ? currentColor : 'rgba(0, 0, 0, 0.06)'}
                      />
                    </div>
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
                    <span style={{ color: index <= currentValue ? '#151515' : '#9e9e9e' }} className="scaleText">
                      {option.value}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </ScaleBox>
      </VerticalCon>
      {showSelected && selectedOption && <SelectedOption>{selectedOption.value}</SelectedOption>}
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
  value: oneOfType([string, number]),
  onChange: func,
};
