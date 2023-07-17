import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/util';
import { AnimationWrap } from '../../styled';

const HEIGHT_SETTING_LIST = [
  {
    text: _l('紧凑'),
    value: '0',
  },
  {
    text: _l('中等'),
    value: '1',
  },
  {
    text: _l('高'),
    value: '2',
  },
  {
    text: _l('超高'),
    value: '3',
  },
];

export default function WidgetRowHeight({ data, onChange }) {
  const { rowheight = '0' } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <div className="settingItemTitle Normal">{_l('行高')}</div>
      <AnimationWrap>
        {HEIGHT_SETTING_LIST.map(({ text, value }) => {
          return (
            <div
              className={cx('animaItem overflow_ellipsis', { active: rowheight === value })}
              onClick={() => onChange(handleAdvancedSettingChange(data, { rowheight: value }))}
            >
              {text}
            </div>
          );
        })}
      </AnimationWrap>
    </SettingItem>
  );
}
