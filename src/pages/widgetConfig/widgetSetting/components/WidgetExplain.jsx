import React from 'react';
import { string } from 'prop-types';
import { Input } from 'antd';
import { SettingItem } from '../../styled';

export default ({ data, onChange }) => {
  const { hint } = data;
  const text = _.includes([14, 49], data.type) ? _l('按钮名称') : _l('引导文字');
  return (
    <SettingItem>
      <div className="settingItemTitle">{text}</div>
      <Input placeholder={_l('请填写%0', text)} value={hint} onChange={e => onChange({ hint: e.target.value })} />
    </SettingItem>
  );
};
