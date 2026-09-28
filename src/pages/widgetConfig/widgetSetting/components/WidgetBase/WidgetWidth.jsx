import React from 'react';
import { Segmented } from 'ming-ui/antd-components';
import { adjustWidthList } from 'src/utils/domain/control/editorSetting';
import { SettingItem } from '../../../styled';

const WIDTH_SETTING_LIST = [
  {
    text: '1/4',
    value: 3,
  },
  {
    text: '1/3',
    value: 4,
  },
  {
    text: '1/2',
    value: 6,
  },
  {
    text: '2/3',
    value: 8,
  },
  {
    text: '3/4',
    value: 9,
  },
  {
    text: '1',
    value: 12,
  },
];

export default function WidgetWidth({ data, widgets, handleClick }) {
  const { size } = data;
  const availableWidth = adjustWidthList(widgets, data);
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('宽度（占比）')}</div>
      <Segmented
        block
        value={size}
        options={WIDTH_SETTING_LIST.map(({ text, value }) => ({
          label: text,
          value,
          disabled: !availableWidth.includes(value),
        }))}
        onChange={handleClick}
      />
    </SettingItem>
  );
}
