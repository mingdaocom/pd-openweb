import React from 'react';
import { string } from 'prop-types';
import { Button } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
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
  overflow: auto;
  border-radius: 3px;
  .explain {
    text-align: center;
    margin-bottom: 12px;
  }
`;
const BtnWrap = styled.div`
  margin: 4px 0;
  padding: 0 10px;
  cursor: pointer;
  box-sizing: border-box;
  &.isFullWidth {
    flex-grow: 1;
  }

  .btnBox {
    box-sizing: border-box;
    transition: border 0.25s;
    border: 1px solid transparent;
    padding: 4px;
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

  button.ming {
    padding: 0 24px;
    background-color: ${props => props.color};
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

  .adjustText {
    button {
      background-color: #f8f8f8;
      color: ${props => props.color};
      &:hover {
        background-color: #f8f8f8;
      }
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
  onSortEnd,
  count,
  style,
  width,
  explain,
  activeIndex,
  onClick,
  ...rest
}) {
  const isFullWidth = width === 1;
  const getWidth = list => {
    if (width === 1) return { width: `${100 / list.length}%` };
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
              <div key={i} className="chunkListWrap">
                {list.map((item, index) => {
                  const { color, name, icon } = item;
                  const actualIndex = i * count + index;
                  return (
                    <BtnWrap
                      style={{ ...getWidth(list) }}
                      color={color}
                      onClick={() => onClick({ index: actualIndex })}>
                      <div
                        className={cx('btnBox', {
                          isFullWidth,
                          active: activeIndex === actualIndex,
                          adjustText: style === 3,
                        })}>
                        <Button fullWidth={isFullWidth} className="overflow_ellipsis" radius={style === 2} icon={icon}>
                          {name}
                        </Button>
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
