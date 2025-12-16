import React, { Fragment } from 'react';
import cx from 'classnames';
import styled, { keyframes } from 'styled-components';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';

const borderBeamAnimation = keyframes`
  100% {
    offset-distance: 100%;
  }
`;
const Con = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid #dddddd;
  padding: 16px 14px 14px;
  background-color: #fff;
  .add-widget-btn {
    height: 32px;
    line-height: 32px;
    width: 100%;
    text-align: center;
    background: var(--ai-primary-color);
    border-radius: 32px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    &.secondary {
      background: transparent;
      color: #151515;
      border: 1px solid #dddddd;
      &:hover {
        background: #f5f5f5;
      }
    }
    &.disabled {
      background: #f5f5f5;
      color: #bdbdbd;
      cursor: not-allowed;
      &.secondary {
        border-color: #f5f5f5;
      }
    }
  }
  &:not(.disabled) {
    .widget-item:hover {
      background: #f5f5f5;
      .widget-name {
        display: block;
      }
    }
  }
  .generate-status {
    font-size: 14px;
    color: #757575;
    margin: -3px 0px;
  }
  .generated-count {
    font-size: 14px;
    color: #151515;
    .selectedIcon {
      margin-right: 6px;
      width: 22px;
      height: 22px;
      border-radius: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #c4c4c4;
      &.isSelected {
        background: #6e09f9;
        border-color: #6e09f9;
      }
      .icon-ok {
        visibility: hidden;
        font-size: 18px;
        color: #fff;
      }
      &.disabled {
        background: var(--color-background-disabled);
        border-color: var(--color-border);
      }
      &.isSelected {
        .icon-ok {
          visibility: visible;
        }
      }
    }
    &:not(.disabled) {
      cursor: pointer;
    }
    &:hover {
      .selectedIcon:not(.disabled, .isSelected) {
        background: #6e09f990;
        border-color: transparent;
        .icon-ok {
          visibility: visible;
        }
      }
    }
  }
  .border-animation {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1.5px solid transparent;
    border-radius: inherit;
    -webkit-mask-clip: padding-box, border-box !important;
    mask-clip: padding-box, border-box !important;
    -webkit-mask-composite: source-in, xor !important;
    mask-composite: intersect !important;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    will-change: auto;
    &::after {
      content: '';
      position: absolute;
      aspect-ratio: 1/1;
      width: 80px;
      background: linear-gradient(to left, #6e09f920, #6e09f9, transparent);
      offset-anchor: 90 50%;
      offset-path: rect(0 auto auto 0 round 80px);
      animation: ${borderBeamAnimation} 2s infinite linear;
      animation-delay: 0s;
      will-change: auto;
    }
  }
`;
export default function MingoGeneratedWidgetsSelector({
  isLoading,
  isSelected,
  count = 0,
  onContinueGenerate,
  onToggle = () => {},
}) {
  const disabled = isLoading || count === 0;
  return (
    <Con className={cx({ isLoading })}>
      {isLoading && (
        <div className={cx('generate-status t-flex t-items-center', { loading: isLoading })}>
          <Fragment>
            <LoadingDots className="mRight5" dotNumber={3} />
            {count > 0 ? _l('继续生成中，可点击下方暂停按钮暂停') : _l('正在生成，可点击下方暂停按钮暂停')}
          </Fragment>
        </div>
      )}
      {count > 0 && !isLoading && (
        <div
          className={cx('generated-count t-flex t-items-center')}
          onClick={() => {
            if (disabled) return;
            onToggle();
          }}
        >
          <div className={cx('selectedIcon', { isSelected, disabled })}>{<i className="icon icon-ok"></i>}</div>
          {_l('已生成%0条数据', count)}
        </div>
      )}
      {!isLoading && count === 0 && <span>{_l('没有符合规则的数据')}</span>}
      {count > 0 && (
        <div className="add-button-con t-flex t-flex-col t-items-center t-justify-between mTop15">
          <div
            className={cx('add-widget-btn secondary t-flex-1', {
              disabled,
            })}
            onClick={() => {
              if (disabled) return;
              onContinueGenerate();
            }}
          >
            {_l('继续生成10条')}
          </div>
        </div>
      )}
      {isLoading && <div className="border-animation"></div>}
    </Con>
  );
}
