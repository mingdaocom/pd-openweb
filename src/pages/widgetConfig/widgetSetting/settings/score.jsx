import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';

const SCORE_OPTIONS = [
  { value: 1, text: _l('1-5颗星') },
  { value: 2, text: _l('1-10级') },
];

export default function Score({ data, onChange }) {
  const changeType = value => {
    onChange({
      enumDefault: value,
    });
  };
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup size="middle" checkedValue={data.enumDefault} data={SCORE_OPTIONS} onChange={changeType} />
      </SettingItem>
    </Fragment>
  );
}
