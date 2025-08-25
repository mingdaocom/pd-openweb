import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import RoleConfig from '../components/WidgetHighSetting/ControlSetting/RoleConfig';
import WidgetUserPermission from '../components/WidgetUserPermission';

const DISPLAY_OPTIONS = [
  {
    text: _l('单选'),
    value: 0,
  },
  {
    text: _l('多选'),
    value: 1,
  },
];

export default function OrgRole(props) {
  const { from, data, onChange } = props;
  const { enumDefault } = data;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择方式')}</div>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ enumDefault: value, unique: false })}
        />
      </SettingItem>
      <RoleConfig {...props} />
      {from !== 'subList' && <WidgetUserPermission {...props} />}
    </Fragment>
  );
}
