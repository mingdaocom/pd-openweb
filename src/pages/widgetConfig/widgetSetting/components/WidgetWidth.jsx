import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { SettingItem } from '../../styled';
import { WHOLE_SIZE } from '../../config/Drag';
import { adjustWidthList } from '../../util/setting';

const WIDTH_SETTING_LIST = [
  {
    text: _l('1/4'),
    value: 3,
  },
  {
    text: _l('1/3'),
    value: 4,
  },
  {
    text: _l('1/2'),
    value: 6,
  },
  {
    text: _l('2/3'),
    value: 8,
  },
  {
    text: _l('3/4'),
    value: 9,
  },
  {
    text: _l('1'),
    value: 12,
  },
];

const WidthList = styled.ul`
  display: flex;
  justify-content: space-between;
  li {
    flex: 1;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #eaeaea;
    border-left: none;
    &:first-child {
      border-left: 1px solid #eaeaea;
      border-radius: 3px 0 0 3px;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
    }
    &.isActive {
      background-color: #2196f3;
      color: #fff;
      border-color: #2196f3;
    }
    &.disabled {
      color: #bdbdbd;
      cursor: not-allowed;
    }
  }
`;

export default function WidgetWidth({ data, widgets, handleClick }) {
  const { size } = data;
  const availableWidth = adjustWidthList(widgets, data);
  return (
    <SettingItem className="withSplitLine">
      <div className="settingItemTitle">{_l('宽度')}</div>
      <WidthList>
        {WIDTH_SETTING_LIST.map(({ text, value }) => {
          const disabled = !availableWidth.includes(value);
          const isActive = size === value;
          return (
            <li
              key={value}
              className={cx({ isActive, disabled })}
              onClick={() => {
                if (isActive || disabled) return;
                handleClick(value);
              }}>
              {text}
            </li>
          );
        })}
      </WidthList>
    </SettingItem>
  );
}
