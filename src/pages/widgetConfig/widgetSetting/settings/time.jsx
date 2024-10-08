import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { TIME_DISPLAY_TYPE } from '../../config/setting';

export default function Text(props) {
  const { data = {}, onChange } = props;
  const { unit } = data;
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={unit}
          data={TIME_DISPLAY_TYPE}
          onChange={value => onChange({ unit: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
