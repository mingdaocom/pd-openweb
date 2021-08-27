import React, { useState, useEffect, Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { string } from 'prop-types';
import { SettingItem } from '../../styled';

const DISPLAY_OPTIONS = [
  {
    text: _l('日期'),
    value: 15,
  },
  {
    text: _l('日期时间'),
    value: 16,
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={data.type}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ type: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
