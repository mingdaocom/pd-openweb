import React, { Fragment } from 'react';
import RadioGroup from 'ming-ui/components/RadioGroup';
import { SettingItem } from '../../styled';

const DISPLAY_OPTIONS = [
  {
    text: _l('单行'),
    value: 2,
  },
  {
    text: _l('多行'),
    value: 1,
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={data.enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
