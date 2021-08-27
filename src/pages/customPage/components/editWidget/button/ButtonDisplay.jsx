import React from 'react';
import { string } from 'prop-types';
import { Button } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { computeWidth } from '../../../util';
import color from 'color';

const ButtonListWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-content: center;

  .chunkListWrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

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
  padding: 0 10px;
  cursor: pointer;
  transition: border 0.25s;
  border: 1px solid transparent;
  box-sizing: border-box;
  &.isFullWidth {
    flex-grow: 1;
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
  onClick,
}) {
  const isFullWidth = width === 1;
  const newList = _.chunk(buttonList, layoutType === 'web' ? count : mobileCount);
  const getWidth = list => {
    if (width === 1 || layoutType === 'mobile') return { width: `${100 / list.length}%` };
    return {};
  };
  return (
    <ButtonDisplayWrap>
      {explain && <div className="explain">{explain}</div>}
      <ButtonListWrap>
        {newList.map((list, index) => {
          return (
            <div className="chunkListWrap" key={index}>
              {list.map((item, i) => {
                const { icon, color, name } = item;
                return (
                  <BtnWrap
                    key={i}
                    style={{ ...getWidth(list) }}
                    color={color}
                    className={cx(displayMode, { isFullWidth, active: activeIndex === index, adjustText: style === 3 })}
                    onClick={() => {
                      if (typeof onClick === 'function') {
                        onClick({ ...item, index });
                      }
                    }}
                  >
                    <Button
                      fullWidth={isFullWidth || layoutType === 'mobile'}
                      className="overflow_ellipsis"
                      radius={style === 2}
                      icon={icon}
                    >
                      {name}
                    </Button>
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
