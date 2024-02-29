import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';

const DISPLAY_OPTIONS = [
  {
    text: _l('时:分'),
    value: '1',
  },
  {
    text: _l('时:分:秒'),
    value: '6',
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={data.unit}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ unit: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
