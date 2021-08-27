import React from 'react';
import { string } from 'prop-types';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

export default ({ data, onChange }) => {
  const { hint } = data;
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('引导文字')}</div>
      <Input placeholder={_l('请填写引导文字')} value={hint} onChange={e => onChange({ hint: e.target.value })} />
    </SettingItem>
  );
};
