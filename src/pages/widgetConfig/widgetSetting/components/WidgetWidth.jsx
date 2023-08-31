import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { SettingItem, AnimationWrap } from '../../styled';
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

export default function WidgetWidth({ data, widgets, handleClick }) {
  const { size } = data;
  const availableWidth = adjustWidthList(widgets, data);
  return (
    <SettingItem className="withSplitLine">
      <div className="settingItemTitle">{_l('宽度')}</div>
      <AnimationWrap>
        {WIDTH_SETTING_LIST.map(({ text, value }) => {
          const disabled = !availableWidth.includes(value);
          const isActive = size === value;
          return (
            <div
              className={cx('animaItem overflow_ellipsis', { active: isActive, disabled })}
              onClick={() => {
                if (isActive || disabled) return;
                handleClick(value);
              }}
            >
              {text}
            </div>
          );
        })}
      </AnimationWrap>
    </SettingItem>
  );
}
