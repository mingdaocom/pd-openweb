import React from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';

const CRED_TYPES = [
  {
    value: 1,
    text: _l('身份证'),
  },
  {
    value: 2,
    text: _l('护照'),
  },
  {
    value: 3,
    text: _l('港澳通行证'),
  },
  {
    value: 4,
    text: _l('台湾通行证'),
  },
];

export default function Cred({ data, onChange }) {
  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('证件类型')}</div>
      <Dropdown
        border
        isAppendToBody
        data={CRED_TYPES}
        value={data.enumDefault}
        onChange={type => {
          const { value, text } = CRED_TYPES.find(item => item.value === type);
          onChange({ enumDefault: value, controlName: text, hint: _l('填写%0', text) });
        }}
      />
    </SettingItem>
  );
}
