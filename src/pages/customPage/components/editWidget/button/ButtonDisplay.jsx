import React from 'react';
import { string } from 'prop-types';
import { Button, SvgIcon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { computeWidth } from '../../../util';
import { TinyColor } from '@ctrl/tinycolor';
import { ButtonListWrap, GraphWrap } from './styled';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';

const ButtonDisplayWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 0;
  text-align: center;
  background-color: #fff;
  .explain {
    text-align: center;
    margin-bottom: 12px;
  }
`;

const BtnWrap = styled.div`
  margin: 4px 0;
  padding: 0 8px;
  cursor: pointer;
  transition: border 0.25s;
  border: 1px solid transparent;
  box-sizing: border-box;
  &.noMargin {
    margin: 0;
  }
  &.isFullWidth {
    flex-grow: 1;
  }
  .Button {
    display: flex;
    align-items: center;
    justify-content: center;
    div {
      display: flex;
    }
    .injected-svg {
      margin-right: 5px;
    }
  }
  button.ming {
    padding: 0 14px;
    background-color: ${props => props.color};
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.26);
    &:hover {
      background-color: ${props => new TinyColor(props.color).darken(20).toString()};
    }
    .icon {
      font-size: 20px;
      margin-right: 6px;
    }
  }
  &.edit {
    &:hover {
      border: 1px dashed #ddd;
    }
    &.active {
      border: 1px solid ${props => new TinyColor(props.color).darken(20).toString()};
    }
  }
  &.adjustText {
    button {
      background-color: #f8f8f8;
      color: ${props => props.color};
      box-shadow: none;
      &:hover {
        background-color: ${new TinyColor('#f8f8f8').darken(3).toString()};
      }
    }
    .iconWrap {
      color: ${props => props.color};
      background-color: #f8f8f8;
    }
  }
`;

export default function ButtonDisplay({
  widget = {},
  appId,
  buttonList = [],
  layoutType = 'web',
  displayMode = 'edit',
  explain,
  activeIndex,
  count,
  mobileCount = 1,
  width,
  style,
  config,
  onClick,
}) {
  const { btnType, direction = 1 } = config || {};
  const isFullWidth = btnType === 2 ? true : width === 1;
  const isMobile = layoutType === 'mobile';
  const newList = _.chunk(buttonList, layoutType === 'web' ? count : mobileCount);
  const getWidth = () => {
    if (isFullWidth || isMobile) return { width: `${100 / (isMobile ? mobileCount : count)}%` };
    return {};
  };
  const translateInfo = getTranslateInfo(appId, null, widget.id);
  return (
    <ButtonDisplayWrap>
      {explain && <div className="explain">{translateInfo.description || explain}</div>}
      <ButtonListWrap>
        {newList.map((list, index) => {
          return (
            <div className={cx('chunkListWrap', { center: isMobile ? false : !isFullWidth })} key={index}>
              {list.map((item, i) => {
                const { color, name, config } = item;
                const defaultIcon = btnType === 2 ? `custom_actions` : null;
                const icon = _.get(config, 'icon') || defaultIcon;
                const iconUrl = icon
                  ? `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`
                  : _.get(config, 'iconUrl');
                return (
                  <BtnWrap
                    key={i}
                    style={{ ...getWidth() }}
                    color={color}
                    className={cx(displayMode, {
                      active: activeIndex === index,
                      adjustText: style === 3,
                      noMargin: btnType === 2,
                      flexRow: direction === 2,
                    })}
                    onClick={() => {
                      if (typeof onClick === 'function') {
                        onClick({ ...item, index });
                      }
                    }}
                  >
                    {btnType === 2 ? (
                      <GraphWrap
                        className={cx('valignWrapper', direction === 1 ? 'column' : 'row', {
                          small:
                            isMobile &&
                            ((direction === 1 && [3, 4].includes(mobileCount)) ||
                              (direction === 2 && [2].includes(mobileCount))),
                        })}
                        color={color}
                        radius={style === 1 ? (direction === 1 ? '16px' : '12px') : '50%'}
                      >
                        {iconUrl && (
                          <div className="iconWrap flexRow valignWrapper">
                            <SvgIcon
                              url={iconUrl}
                              fill={style === 3 ? color : '#fff'}
                              size={
                                direction === 2 || (isMobile && direction === 1 && [3, 4].includes(mobileCount))
                                  ? 28
                                  : 36
                              }
                            />
                          </div>
                        )}
                        <div className="nameWrap valignWrapper">
                          <div className="name">{translateInfo[item.id] || name}</div>
                        </div>
                      </GraphWrap>
                    ) : (
                      <Button
                        fullWidth={isFullWidth || isMobile}
                        radius={style === 2}
                        icon={iconUrl ? null : item.icon}
                      >
                        {iconUrl && <SvgIcon url={iconUrl} fill={style === 3 ? color : '#fff'} size={20} />}
                        <span className="overflow_ellipsis">{translateInfo[item.id] || name}</span>
                      </Button>
                    )}
                  </BtnWrap>
                );
              })}
            </div>
          );
        })}
      </ButtonListWrap>
    </ButtonDisplayWrap>
  );
}
