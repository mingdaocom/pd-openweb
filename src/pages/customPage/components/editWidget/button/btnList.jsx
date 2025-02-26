import React from 'react';
import { string } from 'prop-types';
import { Button, Icon, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { TinyColor } from '@ctrl/tinycolor';
import { ButtonListWrap, GraphWrap } from './styled';
import _ from 'lodash';

const ButtonDisplayWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 200px;
  padding: 24px 20px;
  text-align: center;
  background-color: #fff;
  overflow: auto;
  border-radius: 3px;
  .explain {
    text-align: center;
    margin-bottom: 12px;
    color: var(--title-color);
  }
`;
const BtnWrap = styled.div`
  margin: 4px 0;
  padding: 0 10px;
  cursor: pointer;
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
  .btnBox {
    box-sizing: border-box;
    transition: border 0.25s;
    border: 1px solid transparent;
    padding: 4px;
    &.horizontal {
      display: flex;
      padding: 4px 20px;
    }
    &:hover {
      border: 1px dashed #ddd;
      border-radius: 3px;
    }
    &.active {
      border: 1px solid #2196f3;
      border-radius: 3px;
    }
    &.error {
      border: 1px solid red;
    }
  }

  button.ming {
    padding: 0 14px;
    background-color: ${props => props.color};
    &:hover {
      background-color: ${props => new TinyColor(props.color).darken(20).toString()};
    }
    .icon {
      font-size: 20px;
      margin-right: 6px;
    }
  }

  .adjustText {
    button {
      background-color: #f8f8f8;
      color: ${props => props.color};
      &:hover {
        background-color: #f8f8f8;
      }
    }
    .iconWrap {
      color: ${props => props.color};
      background-color: #f8f8f8;
    }
  }
`;
const SortableButtonListWrap = styled.div`
  margin-top: 16px;
  border-top: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  overflow: auto;
  .hint {
    margin: 24px 0;
    text-align: center;
    color: #aaa;
  }
`;

export default function BtnList({
  buttonList,
  errorBtns,
  count,
  style,
  config,
  width,
  explain,
  activeIndex,
  onClick,
  ...rest
}) {
  const { btnType, direction = 1 } = config || {};
  const isFullWidth = btnType === 2 ? true : width === 1;
  const getWidth = () => {
    if (isFullWidth) return { width: `${100 / count}%` };
    return {};
  };
  const newList = _.chunk(buttonList, count);
  return (
    <SortableButtonListWrap>
      <div className="hint">{_l('选择下方预览卡片中的按钮进行设置')}</div>
      <ButtonDisplayWrap>
        {explain && <div className="explain">{explain}</div>}
        <ButtonListWrap>
          {newList.map((list, i) => {
            return (
              <div key={i} className={cx('chunkListWrap', { center: !isFullWidth })}>
                {list.map((item, index) => {
                  const { color, name, config } = item;
                  const defaultIcon = btnType === 2 ? `custom_actions` : null;
                  const icon = _.get(config, 'icon') || defaultIcon;
                  const iconUrl = icon
                    ? `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`
                    : _.get(config, 'iconUrl');
                  const actualIndex = i * count + index;
                  return (
                    <BtnWrap
                      key={index}
                      style={{ ...getWidth() }}
                      color={color}
                      onClick={() => onClick({ index: actualIndex })}
                    >
                      <div
                        className={cx('btnBox', {
                          isFullWidth,
                          active: activeIndex === actualIndex,
                          error: errorBtns.includes(index),
                          adjustText: style === 3,
                          noMargin: btnType === 2,
                          horizontal: btnType === 2 && direction === 2,
                        })}
                      >
                        {btnType === 2 ? (
                          <GraphWrap
                            className={cx('valignWrapper', direction === 1 ? 'column' : 'row')}
                            color={color}
                            radius={style === 1 ? (direction === 1 ? '16px' : '12px') : '50%'}
                          >
                            {iconUrl && (
                              <div className="iconWrap flexRow valignWrapper">
                                <SvgIcon
                                  url={iconUrl}
                                  fill={style === 3 ? color : '#fff'}
                                  size={direction === 1 ? 36 : 28}
                                />
                              </div>
                            )}
                            <div className="nameWrap valignWrapper">
                              <div className="name">{name}</div>
                            </div>
                          </GraphWrap>
                        ) : (
                          <Button fullWidth={isFullWidth} radius={style === 2} icon={iconUrl ? null : item.icon}>
                            {iconUrl && <SvgIcon url={iconUrl} fill={style === 3 ? color : '#fff'} size={20} />}
                            <span className="overflow_ellipsis">{name}</span>
                          </Button>
                        )}
                      </div>
                    </BtnWrap>
                  );
                })}
              </div>
            );
          })}
        </ButtonListWrap>
      </ButtonDisplayWrap>
    </SortableButtonListWrap>
  );
}
