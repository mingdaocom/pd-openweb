import React, { useContext, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import SheetContext from 'worksheet/common/Sheet/SheetContext';

const ItemTitle = styled.ul`
  background-color: #f5f5f8;
  display: flex;
  margin-bottom: 4px;
  transform-origin: left;
  transform: ${props => (props.scale ? `scale(${props.scale / 100})` : 'scale(1)')};
  li {
    flex-basis: 280px;
    flex-shrink: 0;
    margin-left: ${props => (props.isStraightLine ? '100px' : '120px')};
    font-size: 14px;
    .ming.Input {
      border: none;
      padding-left: 0;
      height: 28px;
      border-bottom: 2px solid #1677ff;
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

export default function LayerTitle({
  layerLength = 1,
  layersName = [],
  updateLayersName,
  scale,
  isStraightLine = false,
}) {
  const [activeIndex, setIndex] = useState(-1);
  const [{ titles }, setNames] = useSetState({ titles: layersName });
  const context = useContext(SheetContext);
  return (
    <ItemTitle scale={scale} isStraightLine={isStraightLine}>
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
                  let names = [];
                  for (let i = 0; i < titles.length; i++) {
                    names = [...names, titles[i] || ''];
                  }
                  updateLayersName(names);
                }}
              />
            ) : (
              <span
                className={cx('overflow_ellipsis', value ? 'Gray_75 Bold' : 'Gray_bd Bold')}
                onClick={() => {
                  if (
                    _.get(context, 'config.fromEmbed') ||
                    _.get(window, 'shareState.isPublicView') ||
                    _.get(window, 'shareState.isPublicPage')
                  )
                    return;
                  setIndex(index);
                }}
              >
                {value || _l('%0级', index + 1)}
              </span>
            )}
          </li>
        );
      })}
    </ItemTitle>
  );
}
