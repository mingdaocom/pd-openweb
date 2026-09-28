import React from 'react';
import { Select } from 'ming-ui/antd-components';
import { SettingItem } from '../../styled';

const CRED_TYPES = [
  {
    value: 1,
    label: _l('身份证'),
  },
  {
    value: 2,
    label: _l('护照'),
  },
  {
    value: 3,
    label: _l('港澳通行证'),
  },
  {
    value: 4,
    label: _l('台湾通行证'),
  },
];

export default function Cred({ data, onChange }) {
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('类型')}</div>
      <Select
        className="w100"
        options={CRED_TYPES}
        value={data.enumDefault}
        onChange={type => {
          const { value, label } = CRED_TYPES.find(item => item.value === type);
          onChange({ enumDefault: value, controlName: label, hint: _l('填写%0', label) });
        }}
      />
    </SettingItem>
  );
}
