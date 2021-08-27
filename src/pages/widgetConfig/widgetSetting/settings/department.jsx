import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { WHOLE_SIZE } from '../../config/Drag';

const DEPARTMENT_TYPES = [
  {
    value: 0,
    text: _l('单选'),
  },
  {
    value: 1,
    text: _l('多选'),
  },
];

export default function Cred({ data, onChange }) {
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={data.enumDefault}
          data={DEPARTMENT_TYPES}
          onChange={type => {
            onChange({ enumDefault: type, size: type === 1 ? WHOLE_SIZE : data.size });
          }}
        />
      </SettingItem>
    </Fragment>
  );
}
