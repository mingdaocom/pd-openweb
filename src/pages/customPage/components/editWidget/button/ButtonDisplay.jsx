import React from 'react';
import { string } from 'prop-types';
import { Button, Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { computeWidth } from '../../../util';
import color from 'color';
import SvgIcon from 'src/components/SvgIcon';
import { ButtonListWrap, GraphWrap } from './styled';
import _ from 'lodash';

const ButtonDisplayWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 0;
  text-align: center;
  background-color: #fff;
  .explain {
    text-align: center;
    margin-bottom: 12px;
  }
`;

const BtnWrap = styled.div`
  margin: 4px 0;
  padding: 0 18px;
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
    padding: 0 24px;
    background-color: ${props => props.color};
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.26);
    &:hover {
      background-color: ${props =>
        color(props.color)
          .darken(0.2)
          .string()};
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
      border: 1px solid
        ${props =>
          color(props.color)
            .darken(0.2)
            .string()};
    }
  }
  &.adjustText {
    button {
      background-color: #f8f8f8;
      color: ${props => props.color};
      box-shadow: none;
      &:hover {
        background-color: ${color('#f8f8f8')
          .darken(0.03)
          .string()};
      }
    }
    .iconWrap {
      color: ${props => props.color};
      background-color: #f8f8f8;
    }
  }
`;

export default function ButtonDisplay({
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
  return (
    <ButtonDisplayWrap>
      {explain && <div className="explain">{explain}</div>}
      <ButtonListWrap>
        {newList.map((list, index) => {
          return (
            <div className={cx('chunkListWrap', { center: isMobile ? false : !isFullWidth })} key={index}>
              {list.map((item, i) => {
                const { icon, color, name, config } = item;
                const defaultConfig = btnType === 2 ? { iconUrl: `${md.global.FileStoreConfig.pubHost}/customIcon/custom_actions.svg` } : {};
                const { iconUrl } = config || defaultConfig;
                return (
                  <BtnWrap
                    key={i}
                    style={{ ...getWidth() }}
                    color={color}
                    className={cx(displayMode, {
                      active: activeIndex === index,
                      adjustText: style === 3,
                      noMargin: btnType === 2,
                      flexRow: direction === 2
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
                          small: isMobile && ((direction === 1 && [3, 4].includes(mobileCount)) || (direction === 2 && [2].includes(mobileCount)))
                        })}
                        color={color}
                        radius={style === 1 ? (direction === 1 ? '16px' : '12px') : '50%'}
                      >
                        {iconUrl && (
                          <div className="iconWrap flexRow valignWrapper">
                            <SvgIcon
                              url={iconUrl}
                              fill={style === 3 ? color : '#fff'}
                              size={(direction === 2 || (isMobile && direction === 1 && [3, 4].includes(mobileCount))) ? 28 : 36}
                            />
                          </div>
                        )}
                        <div className="nameWrap valignWrapper">
                          <div className="name">{name}</div>
                        </div>
                      </GraphWrap>
                    ) : (
                      <Button
                        fullWidth={isFullWidth || isMobile}
                        radius={style === 2}
                        icon={iconUrl ? null : icon}
                      >
                        {iconUrl && <SvgIcon url={iconUrl} fill={style === 3 ? color : '#fff'} size={20} />}
                        <span className="overflow_ellipsis">{name}</span>
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
