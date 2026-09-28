import React from 'react';
import { Segmented } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { SettingItem } from '../../styled';

const getHeightSettingOptions = () => [
  {
    label: _l('紧凑'),
    value: '0',
  },
  {
    label: _l('中'),
    value: '1',
  },
  {
    label: _l('高'),
    value: '2',
  },
  {
    label: _l('超高'),
    value: '3',
  },
];

export default function WidgetRowHeight({ data, onChange }) {
  const { rowheight = '0' } = getAdvanceSetting(data);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('行高')}</div>
      <Segmented
        block
        value={rowheight}
        options={getHeightSettingOptions()}
        onChange={value => onChange(handleAdvancedSettingChange(data, { rowheight: value }))}
      />
    </SettingItem>
  );
}
