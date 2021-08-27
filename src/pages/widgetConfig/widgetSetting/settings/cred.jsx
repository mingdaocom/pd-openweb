import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { RadioGroup } from 'ming-ui';
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
    <Fragment>
      <SettingItem style={{ marginTop: '8px' }}>
        <RadioGroup
          size="middle"
          className="credTypesWrap"
          checkedValue={data.enumDefault}
          data={CRED_TYPES}
          onChange={type => {
            const { value, text } = CRED_TYPES.find(item => item.value === type);
            onChange({ enumDefault: value, controlName: text, hint: _l('填写%0', text) });
          }}
        />
      </SettingItem>
    </Fragment>
  );
}
