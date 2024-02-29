import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';

const AREA_DISPLAY_OPTION = [
  {
    value: 19,
    text: _l('省'),
  },
  { value: 23, text: _l('省-市') },
  { value: 24, text: _l('省-市-县') },
];
export default function Area({ data, onChange }) {
  const { type } = data;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <Dropdown border data={AREA_DISPLAY_OPTION} value={type} onChange={value => onChange({ type: value })} />
      </SettingItem>
    </Fragment>
  );
}
