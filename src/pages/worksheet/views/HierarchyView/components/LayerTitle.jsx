import React, { useState } from 'react';
import { string } from 'prop-types';
import nzh from 'nzh';
import { Input } from 'ming-ui';
import cx from 'classnames';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import update from 'immutability-helper';

const ItemTitle = styled.ul`
  background-color: #f5f5f8;
  display: flex;
  margin-bottom: 4px;
  transform-origin: left;
  transform: ${props => (props.scale ? `scale(${props.scale / 100})` : 'scale(1)')};
  li {
    flex-basis: 280px;
    flex-shrink: 0;
    margin-left: 120px;
    font-size: 14px;
    .ming.Input {
      border: none;
      padding-left: 0;
      height: 28px;
      border-bottom: 2px solid #2196f3;
      background-color: transparent;
      font-size: 14px;
      border-radius: 0;
      font-weight: bold;
    }
    span {
      display: inline-block;
      max-width: 260px;
      line-height: 30px;
    }
    &:first-child {
      margin: 0;
    }
  }
`;

export default function LayerTitle({ layerLength = 1, layersName = [], updateLayersName, scale }) {
  const [activeIndex, setIndex] = useState(-1);
  const [{ titles }, setNames] = useSetState({ titles: layersName });
  return (
    <ItemTitle scale={scale}>
      {Array.from({ length: layerLength }).map((item, index) => {
        const value = titles[index];
        return (
          <li key={index}>
            {activeIndex === index ? (
              <Input
                value={value}
                autoFocus
                onChange={value => {
                  // 将生成数组里面的empty填充为空字符串
                  const startIndex = _.findIndex(titles, item => !item);
                  const endIndex = _.findIndex(titles, item => item);
                  if (startIndex !== endIndex) {
                    const filledTitles = _.fill(titles, '', startIndex, endIndex);
                    setNames({ titles: update(filledTitles, { [index]: { $set: value } }) });
                    return;
                  }
                  setNames({ titles: update(titles, { [index]: { $set: value } }) });
                }}
                onBlur={() => {
                  setIndex(-1);
                  updateLayersName(titles);
                }}
              />
            ) : (
              <span className={cx('overflow_ellipsis', value ? 'Gray_75 Bold' : 'Gray_bd Bold')} onClick={() => setIndex(index)}>
                {value || _l('%0级', nzh.cn.encodeS(index + 1))}
              </span>
            )}
          </li>
        );
      })}
    </ItemTitle>
  );
}
