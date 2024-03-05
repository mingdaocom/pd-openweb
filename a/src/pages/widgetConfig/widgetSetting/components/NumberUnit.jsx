import React from 'react';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

export default function NumberUnit({ data, onChange }) {
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('单位')}</div>
      <Input value={data.unit} onChange={e => onChange({ unit: e.target.value })} />
    </SettingItem>
  );
}
